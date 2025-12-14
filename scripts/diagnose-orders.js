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

async function diagnoseSchema() {
    try {
        console.log('Fetching Orders collection attributes...');
        const response = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);

        console.log('--- Attributes ---');
        response.attributes.forEach(attr => {
            console.log(`- ${attr.key}: ${attr.type} (Required: ${attr.required}, Array: ${attr.array})`);
        });

        // specific check
        const hasPayRef = response.attributes.find(a => a.key === 'paymentReference');
        console.log('--- Checks ---');
        console.log(`Has paymentReference: ${!!hasPayRef}`);

        const itemsAttr = response.attributes.find(a => a.key === 'items');
        if (itemsAttr) {
            console.log(`items type: ${itemsAttr.type}`);
        } else {
            console.log('items attribute NOT found!');
        }

    } catch (error) {
        console.error('Diagnosis failed:', error);
    }
}

diagnoseSchema();
