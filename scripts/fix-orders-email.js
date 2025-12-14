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

async function fixUserEmailAttribute() {
    try {
        console.log('Checking for userEmail attribute...');

        try {
            // Attempt to create it directly. If it exists, it will throw, which is fine.
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userEmail', 255, true);
            console.log('✅ Created userEmail attribute (required: true)');
        } catch (error) {
            console.log(`info: Attribute creation response: ${error.message}`);
            // If it failed because it exists, maybe it's misnamed in the code or the schema?
            // The error said "Unknown attribute: userEmail", so it definitely doesn't exist by that name.
        }

    } catch (error) {
        console.error('Fatal Script Error:', error);
    }
}

fixUserEmailAttribute();
