import mongoose from "mongoose";

const mongodbConnect = async () => {
    if (mongoose.connection.readyState === 1) return; // Already connected
    try {
        mongoose.set("strictQuery", false);
        await mongoose.connect(process.env.MONGODB_URI as string, {
            dbName: "Fundraiser",
        });
        console.log("Database Connected!");
    } catch (error: any) {
        console.error("Database Connection Error:", error.message);
        throw new Error(error.message);
    }
};

export default mongodbConnect;
