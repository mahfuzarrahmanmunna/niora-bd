import { MongoClient, ServerApiVersion } from 'mongodb';

let cachedClient = null;
let cachedDb = null;

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

if (!uri || !dbName) {
    throw new Error("Please define MONGO_URI and DB_NAME in your .env file");
}

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

export async function dbConnect(collectionName) {
    if (!cachedClient || !cachedDb) {
        await client.connect();
        cachedClient = client;
        cachedDb = client.db(dbName);
    }

    return cachedDb.collection(collectionName);
}