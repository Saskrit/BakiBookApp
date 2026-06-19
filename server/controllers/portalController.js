import Customer from '../models/Customer.js';
import Transaction from '../models/Transaction.js';
import Payment from '../models/Payment.js';
import PaymentSubmission from '../models/PaymentSubmission.js';
import Notification from '../models/Notification.js';
import {
  formatDate,
  formatRelativeDate,
  formatPayment,
  formatNotification,
} from '../utils/formatters.js';
import { buildTransactionPaymentView } from '../utils/paymentStatus.js';
import { buildGroupedLedger } from '../utils/groupedLedger.js';

const findLinkedCustomers = async (user) => {
  return Customer.find({
    linkedUser: user._id,
    linkStatus: 'linked',
  }).populate('shopkeeper', 'shopName fullName');
};

export const getPortalDashboard = async (req, res) => {
  try {
    const linked = await findLinkedCustomers(req.user);

    if (!linked.length) {
      return res.json({
        success: true,
        summary: { currentDue: 0, totalPurchases: 0, totalPaid: 0, lastPayment: null },
        shops: [],
      });
    }

    const customerIds = linked.map((c) => c._id);

    const [creditAgg, paymentAgg, lastPaymentDoc] = await Promise.all([
      Transaction.aggregate([
        { $match: { customer: { $in: customerIds } } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Payment.aggregate([
        { $match: { customer: { $in: customerIds } } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Payment.findOne({ customer: { $in: customerIds } }).sort({ createdAt: -1 }),
    ]);

    const currentDue = linked.reduce((sum, c) => sum + c.balance, 0);

    res.json({
      success: true,
      summary: {
        currentDue,
        totalPurchases: creditAgg[0]?.total || 0,
        totalPaid: paymentAgg[0]?.total || 0,
        lastPayment: lastPaymentDoc ? formatDate(lastPaymentDoc.createdAt) : null,
      },
      shops: linked.map((c) => ({
        shopName: c.shopkeeper?.shopName || 'Shop',
        shopkeeper: c.shopkeeper?.fullName,
        balance: c.balance,
      })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortalLedger = async (req, res) => {
  try {
    const linked = await findLinkedCustomers(req.user);
    const customerIds = linked.map((c) => c._id);
    const shopMap = Object.fromEntries(
      linked.map((c) => [c._id.toString(), c.shopkeeper?.shopName || 'Shop'])
    );

    const filter = req.query.filter === 'archived' ? 'archived' : 'active';

    const [transactions, payments] = await Promise.all([
      Transaction.find({ customer: { $in: customerIds } }).sort({ createdAt: -1 }),
      Payment.find({ customer: { $in: customerIds } })
        .populate('submission', 'itemName payLabel payType itemIndex transaction')
        .sort({ createdAt: -1 }),
    ]);

    const ledgerByCustomer = customerIds.map((customerId) => {
      const key = customerId.toString();
      const customerTx = transactions.filter((tx) => tx.customer.toString() === key);
      const customerPayments = payments.filter((p) => p.customer.toString() === key);
      return buildGroupedLedger({
        transactions: customerTx,
        payments: customerPayments,
        role: 'customer',
        filter,
        shopName: shopMap[key] || 'Shop',
      });
    });

    const ledger = ledgerByCustomer
      .flat()
      .sort((a, b) => new Date(b.sortAt || b.date) - new Date(a.sortAt || a.date))
      .map(({ sortAt, ...row }) => row);

    res.json({
      success: true,
      ledger,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortalTransactions = async (req, res) => {
  try {
    const linked = await findLinkedCustomers(req.user);
    const customerIds = linked.map((c) => c._id);
    const shopMap = Object.fromEntries(
      linked.map((c) => [c._id.toString(), c.shopkeeper?.shopName || 'Shop'])
    );

    const [transactions, submissions, payments] = await Promise.all([
      Transaction.find({ customer: { $in: customerIds } }).sort({ createdAt: -1 }),
      PaymentSubmission.find({ customer: { $in: customerIds } }),
      Payment.find({ customer: { $in: customerIds } }).select(
        'payType transaction itemIndex customer createdAt'
      ),
    ]);

    const submissionsByCustomer = Object.fromEntries(
      customerIds.map((id) => [
        id.toString(),
        submissions.filter((s) => s.customer.toString() === id.toString()),
      ])
    );
    const paymentsByCustomer = Object.fromEntries(
      customerIds.map((id) => [
        id.toString(),
        payments.filter((p) => p.customer.toString() === id.toString()),
      ])
    );

    res.json({
      success: true,
      transactions: transactions.map((tx) => {
        const customerKey = tx.customer.toString();
        const paymentView = buildTransactionPaymentView(
          submissionsByCustomer[customerKey] || [],
          paymentsByCustomer[customerKey] || [],
          tx
        );

        return {
          id: tx._id.toString(),
          customerId: customerKey,
          shopName: shopMap[customerKey] || 'Shop',
          date: formatRelativeDate(tx.createdAt),
          rawDate: formatDate(tx.createdAt),
          items: paymentView.items,
          itemsSummary: tx.items.map((i) => i.name).join(', '),
          total: tx.total,
          totalFormatted: `Rs. ${tx.total.toLocaleString('en-NP')}`,
          paymentStatus: paymentView.paymentStatus,
          canPayTransaction: paymentView.canPayTransaction,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortalPayments = async (req, res) => {
  try {
    const linked = await findLinkedCustomers(req.user);
    const customerIds = linked.map((c) => c._id);
    const shopMap = Object.fromEntries(
      linked.map((c) => [c._id.toString(), c.shopkeeper?.shopName || 'Shop'])
    );

    const payments = await Payment.find({ customer: { $in: customerIds } })
      .populate('submission', 'itemName payLabel payType itemIndex transaction')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: payments.map((p) => {
        const formatted = formatPayment(p, '', { submission: p.submission });
        return {
          id: formatted.id,
          date: formatRelativeDate(p.createdAt),
          amount: `Rs. ${p.amount.toLocaleString('en-NP')}`,
          method: p.method,
          shopName: shopMap[p.customer.toString()] || 'Shop',
          paidFor: formatted.paidFor,
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortalDues = async (req, res) => {
  try {
    const linked = await findLinkedCustomers(req.user);
    const currentDue = linked.reduce((sum, c) => sum + c.balance, 0);
    const customerIds = linked.map((c) => c._id);

    const pendingCustom = await PaymentSubmission.find({
      customer: { $in: customerIds },
      payType: 'custom',
      status: 'pending',
    }).select('customer');

    const pendingCustomSet = new Set(pendingCustom.map((s) => s.customer.toString()));

    res.json({
      success: true,
      currentDue,
      breakdown: linked
        .filter((c) => c.balance > 0)
        .map((c) => ({
          customerId: c._id.toString(),
          shopName: c.shopkeeper?.shopName || 'Shop',
          balance: c.balance,
          customPaymentStatus: pendingCustomSet.has(c._id.toString()) ? 'pending' : 'unpaid',
        })),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPortalNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    res.json({
      success: true,
      notifications: notifications.map(formatNotification),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
