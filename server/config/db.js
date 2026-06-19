import mongoose from 'mongoose';

const DB_NAME = 'BakiBook';

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('MONGODB_URI not set — running without database connection');
    return;
  }

  try {
    await mongoose.connect(uri, { dbName: DB_NAME });
    console.log(`MongoDB connected — Database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
  }
};

export default connectDB;
