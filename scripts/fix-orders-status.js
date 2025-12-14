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

async function fixStatusAttribute() {
    console.log('--- Fixing Status Attribute ---');

    try {
        // Status should be an enum or string. Let's make it a string for flexibility.
        // Common statuses: 'pending', 'paid', 'shipped', 'completed', 'cancelled'
        // 'paid' is what Cart.tsx uses.

        console.log('Attempting to create "status" attribute...');
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'status', 50, true);
        console.log('✅ Created "status" attribute');

    } catch (error) {
        if (error.code === 409) {
            console.log('ℹ️  "status" attribute already exists.');
        } else {
            console.log(`❌ Failed to create "status": ${error.message}`);
        }
    }

    // Safety check for userId too
    try {
        console.log('Checking "userId"...');
        await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'userId', 255, false);
        console.log('✅ Created "userId" attribute');
    } catch (e) { /* ignore 409 */ }

    console.log('--- Fix Complete ---');
}

fixStatusAttribute();
