import mongoose from "mongoose";

//Connect to MongoDB
export async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI missing in .env");
  await mongoose.connect(uri, { autoIndex: true });
  console.log("MongoDB connected");
}