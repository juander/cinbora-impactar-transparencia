import { MongoClient, ServerApiVersion } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const uri = process.env.DATABASE_URL;
if (!uri) {
  throw new Error("DATABASE_URL is not defined");
}
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function connectToDatabase() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
    return client.db();
  } catch (error) {
    console.error("Failed to connect to MongoDB", error);
    throw error;
  }
}

export { connectToDatabase, client };