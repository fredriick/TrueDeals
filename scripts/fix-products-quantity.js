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
const ATTRIBUTE_KEY = 'quantity';

async function fixQuantityRange() {
    console.log(`--- Fixing ${ATTRIBUTE_KEY} range in ${COLLECTION_ID} ---`);

    try {
        // We need to update the attribute to allow 0.
        // updateIntegerAttribute(databaseId, collectionId, key, required, min, max, default)

        console.log('Updating "quantity" attribute to allow min: 0...');

        await databases.updateIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            ATTRIBUTE_KEY,
            true, // required? likely yes.
            0,    // MIN: 0 (Fixing the issue)
            1000000, // MAX
            0     // Default
        );

        console.log('✅ Successfully updated quantity range (0 - 1,000,000)');

    } catch (error) {
        console.error(`❌ Failed to update attribute: ${error.message}`);
        // If update fails (e.g. not supported or wrong params), we might need to recreate?
        // Usually update works for constraints.
    }
}

fixQuantityRange();
