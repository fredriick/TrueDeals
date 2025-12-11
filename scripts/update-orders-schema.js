import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COLLECTION_ID = 'orders';

async function updateOrdersSchema() {
    try {
        console.log('Updating Orders schema...');

        // Add paymentReference attribute
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'paymentReference', 255, false);
            console.log('Created paymentReference attribute');
        } catch (error) {
            console.log('paymentReference attribute likely exists or error:', error.message);
        }

        console.log('✅ Orders schema updated');
    } catch (error) {
        console.error('Schema update failed:', error);
    }
}

updateOrdersSchema();
