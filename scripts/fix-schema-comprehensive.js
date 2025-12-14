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

async function fixAllSchemaAttributes() {
    console.log('--- Starting Comprehensive Schema Fix ---');

    const attributesToCreate = [
        { key: 'subtotal', type: 'double', required: false }, // Use double for currency
        { key: 'discount', type: 'double', required: false },
        { key: 'couponCode', type: 'string', size: 50, required: false },
        { key: 'paymentReference', type: 'string', size: 255, required: false }, // Re-check
        { key: 'userEmail', type: 'string', size: 255, required: true }, // Re-check
        { key: 'address', type: 'string', size: 1000, required: true } // Ensure exists
    ];

    for (const attr of attributesToCreate) {
        try {
            console.log(`Attempting to create/verify: ${attr.key}`);
            if (attr.type === 'double') {
                await databases.createFloatAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.required);
            } else if (attr.type === 'string') {
                await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, attr.key, attr.size, attr.required);
            }
            console.log(`✅ Created: ${attr.key}`);
        } catch (error) {
            // Error 409 means attribute already exists, which is fine.
            if (error.code === 409) {
                console.log(`ℹ️  Exists: ${attr.key}`);
            } else {
                console.log(`❌ Failed ${attr.key}: ${error.message}`);
            }
        }
    }

    console.log('--- Schema Fix Complete ---');
}

fixAllSchemaAttributes();
