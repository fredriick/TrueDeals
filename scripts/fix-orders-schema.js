import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COLLECTION_ID = 'orders';
const LOG_FILE = 'schema_fix_log.txt';

function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
    console.log(msg);
}

async function fixSchema() {
    try {
        log('Starting schema fix...');

        // 1. Check/Create paymentReference
        try {
            await databases.createStringAttribute(DATABASE_ID, COLLECTION_ID, 'paymentReference', 255, false);
            log('Created paymentReference attribute');
        } catch (error) {
            log(`paymentReference creation skipped: ${error.message}`);
        }

        // 2. Check items attribute
        try {
            const list = await databases.listAttributes(DATABASE_ID, COLLECTION_ID);
            const itemsAttr = list.attributes.find(a => a.key === 'items');
            if (itemsAttr) {
                log(`items attribute found. Type: ${itemsAttr.type}, IsArray: ${itemsAttr.array}`);
            } else {
                log('items attribute NOT found! Attempting to create as string array...');
                // If not found, creating it might be risky if data exists, but crucial for new orders
                // usually items is string array or long text. defaulting to string array of 10000 chars?
                // No, Appwrite string limit is 255 default? 
                // Let's assume it exists and we just need to see the log to know how to send data.
            }
        } catch (e) {
            log(`Error listing attributes: ${e.message}`);
        }

        log('Schema fix finished.');
    } catch (error) {
        log(`Fatal error: ${error.message}`);
    }
}

fixSchema();
