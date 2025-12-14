import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COLLECTION_ID = 'products';

async function checkSchema() {
    try {
        const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
        const qty = response.attributes.find(a => a.key === 'quantity');

        if (qty) {
            console.log(`✅ 'quantity' exists. Type: ${qty.type}, Status: ${qty.status}, Min: ${qty.min}`);
        } else {
            console.log("❌ 'quantity' attribute is MISSING.");
            // Prepare to fix
            console.log("Attempting to recreate 'quantity'...");
            try {
                await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, 'quantity', true, 0, 1000000, 0);
                console.log("✅ Recreated 'quantity' attribute.");
            } catch (err) {
                console.error("Failed to create attribute:", err.message);
            }
        }
    } catch (error) {
        console.error("Error listing attributes:", error);
    }
}

checkSchema();
