import mongoose, { Mongoose } from "mongoose";

const MONGODB_URL = process.env.MONGODB_URL;

interface MongooseConnection {
    conn: Mongoose | null;
    promise: Promise<Mongoose> | null;
};

// We connect to the db on every request or server action bc 
// next.js runs in a serverless environment. Serverless functions are stateless,
// meaning that they start up to handle the request and shut down right after,
// without maintaining a continuous connection to the db.
// This ensures that each request is handled independently, allowing for better
// scability and reliability as there's no need to manage persistent connections across
// many instances.
// But we need to optimize by caching our connections bc there are too many mongodb connections 
// open for each and every action we peform on the server side.
let cached: MongooseConnection = (global as any).mongoose;

if (!cached) {
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    }
}

export const connectToDatabase = async () => {
    if (cached.conn) return cached.conn;

    if (!MONGODB_URL) throw new Error("Missing MONGODB_URL");

    cached.promise = cached.promise || mongoose.connect(MONGODB_URL, { 
        dbName: "imaginify", bufferCommands: false 
    });

    cached.conn = await cached.promise;

    return cached.conn;
}