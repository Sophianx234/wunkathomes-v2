import mongoose from "mongoose";

export const connectToDatabase = async () => {
  try {
    const dbUrl =  process.env.DATABASE_URL?.replace('<db_password>', process.env.DATABASE_PASSWORD || '').replace('<db_username>', process.env.DATABASE_USERNAME || '');
    await mongoose.connect(dbUrl as string);
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
};