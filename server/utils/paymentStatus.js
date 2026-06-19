const toId = (value) => value?.toString?.() || value || '';

const matchesTransactionTarget = (record, transactionId, payType, itemIndex = null) => {
  if (toId(record.transaction) !== toId(transactionId)) return false;
  if (payType === 'transaction') return record.payType === 'transaction';
  if (payType === 'item') {
    return record.payType === 'item' && Number(record.itemIndex) === Number(itemIndex);
  }
  return false;
};

export const resolveTargetPaymentStatus = (submissions = [], payments = [], transactionId, payType, itemIndex = null) => {
  const matchingSubs = submissions.filter((s) =>
    matchesTransactionTarget(s, transactionId, payType, itemIndex)
  );
  const matchingPays = payments.filter((p) =>
    matchesTransactionTarget(p, transactionId, payType, itemIndex)
  );

  if (
    matchingSubs.some((s) => s.status === 'accepted') ||
    matchingPays.length > 0
  ) {
    return 'completed';
  }

  if (matchingSubs.some((s) => s.status === 'pending')) {
    return 'pending';
  }

  return 'unpaid';
};

export const buildTransactionPaymentView = (submissions = [], payments = [], transaction) => {
  const transactionId = transaction._id.toString();
  const transactionStatus = resolveTargetPaymentStatus(
    submissions,
    payments,
    transactionId,
    'transaction'
  );

  const items = transaction.items.map((item, index) => {
    let paymentStatus = resolveTargetPaymentStatus(
      submissions,
      payments,
      transactionId,
      'item',
      index
    );

    if (transactionStatus === 'completed') {
      paymentStatus = 'completed';
    } else if (transactionStatus === 'pending' && paymentStatus === 'unpaid') {
      paymentStatus = 'pending';
    }

    return {
      index,
      name: item.name,
      qty: item.qty,
      price: item.price,
      lineTotal: item.qty * item.price,
      paymentStatus,
    };
  });

  const hasItemActivity = items.some((item) => item.paymentStatus !== 'unpaid');
  let paymentStatus = transactionStatus;
  if (paymentStatus === 'unpaid' && hasItemActivity) {
    if (items.every((item) => item.paymentStatus === 'completed')) {
      paymentStatus = 'completed';
    } else if (items.some((item) => item.paymentStatus === 'pending')) {
      paymentStatus = 'partial_pending';
    } else {
      paymentStatus = 'partial';
    }
  }

  const canPayTransaction =
    transactionStatus === 'unpaid' && !items.some((item) => item.paymentStatus !== 'unpaid');

  return {
    paymentStatus,
    canPayTransaction,
    items,
  };
};

export const findBlockingSubmission = async (PaymentSubmission, { customerId, payType, transactionId, itemIndex }) => {
  if (payType === 'custom') {
    return PaymentSubmission.findOne({
      customer: customerId,
      payType: 'custom',
      status: 'pending',
    });
  }

  if (payType === 'transaction') {
    return PaymentSubmission.findOne({
      customer: customerId,
      payType: 'transaction',
      transaction: transactionId,
      status: 'pending',
    });
  }

  if (payType === 'item') {
    return PaymentSubmission.findOne({
      customer: customerId,
      payType: 'item',
      transaction: transactionId,
      itemIndex,
      status: 'pending',
    });
  }

  return null;
};

export const findCompletedPayment = async (Payment, { customerId, payType, transactionId, itemIndex }) => {
  if (payType === 'custom') {
    return null;
  }

  const filter = {
    customer: customerId,
    payType,
    transaction: transactionId,
  };

  if (payType === 'item') {
    filter.itemIndex = itemIndex;
  }

  return Payment.findOne(filter);
};
