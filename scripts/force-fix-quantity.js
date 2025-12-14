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

async function forceFixQuantity() {
    console.log('--- Force Fixing Quantity (Deleting & Recreating) ---');
    // Note: Recreating deletes data in that column. 
    // BUT we can't easily change the validation range of an existing attribute in Appwrite 1.x sometimes?
    // Wait, updateIntegerAttribute SHOULD work.
    // If it didn't work, maybe we should try again with different bounds?
    // Let's try recreating. It's risky but if the user has dummy data it's fine.

    // Better approach: Read all products, delete attribute, recreate attribute, restore data? Too slow.
    // Let's try UPDATE again but ensuring we wait.

    try {
        console.log('Attempting UPDATE again...');
        await databases.updateIntegerAttribute(
            DATABASE_ID,
            COLLECTION_ID,
            ATTRIBUTE_KEY,
            true,
            0,    // NEW MIN
            1000000,
            0
        );
        console.log('Update command sent.');
    } catch (e) {
        console.log('Update failed:', e.message);
    }
}

forceFixQuantity();
