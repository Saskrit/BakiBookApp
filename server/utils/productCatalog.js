import Product from '../models/Product.js';
import Transaction from '../models/Transaction.js';

export const formatProduct = (product) => ({
  id: product._id.toString(),
  name: product.name,
  lastPrice: product.lastPrice,
  usageCount: product.usageCount,
  lastUsedAt: product.lastUsedAt,
});

export const upsertProductsFromItems = async (shopkeeperId, items = []) => {
  const now = new Date();

  for (const item of items) {
    const name = String(item.name || '').trim();
    if (!name) continue;

    const normalizedName = name.toLowerCase();
    const price = Number(item.price) || 0;

    await Product.findOneAndUpdate(
      { shopkeeper: shopkeeperId, normalizedName },
      {
        $set: {
          name,
          normalizedName,
          lastPrice: price,
          lastUsedAt: now,
        },
        $inc: { usageCount: 1 },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
};

export const backfillProductsFromTransactions = async (shopkeeperId) => {
  const transactions = await Transaction.find({ shopkeeper: shopkeeperId })
    .select('items createdAt')
    .lean();

  const aggregated = new Map();

  for (const tx of transactions) {
    for (const item of tx.items || []) {
      const name = String(item.name || '').trim();
      if (!name) continue;

      const key = name.toLowerCase();
      const price = Number(item.price) || 0;
      const existing = aggregated.get(key);

      if (existing) {
        existing.usageCount += 1;
        existing.lastPrice = price;
        if (new Date(tx.createdAt) > existing.lastUsedAt) {
          existing.lastUsedAt = new Date(tx.createdAt);
          existing.name = name;
        }
      } else {
        aggregated.set(key, {
          name,
          normalizedName: key,
          lastPrice: price,
          usageCount: 1,
          lastUsedAt: new Date(tx.createdAt),
        });
      }
    }
  }

  if (!aggregated.size) return;

  await Promise.all(
    [...aggregated.values()].map((row) =>
      Product.findOneAndUpdate(
        { shopkeeper: shopkeeperId, normalizedName: row.normalizedName },
        { $set: row },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );
};
