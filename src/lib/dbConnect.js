import mongoose from "mongoose";

let isConnected;

export default async function dbConnect() {
  if (isConnected) {
    return;
  }

  if (mongoose.connections.length > 0) {
    isConnected = mongoose.connections[0].readyState;
    if (isConnected === 1) return;
    await mongoose.disconnect();
  }

  try {
    const db = await mongoose.connect(
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/e-learning-test"
    );
    isConnected = db.connections[0].readyState;

    console.log("New connection successful", db.connection.host);
  } catch (error) {
    console.error("Error connecting to database:", error.message);
    process.exit(1);
  }
}
