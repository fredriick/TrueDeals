import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Configuration
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

function log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp}: ${message}\n`;
    console.log(message);
    try {
        fs.appendFileSync('schema-log.txt', logMessage);
    } catch (e) {
        // ignore
    }
}

log('Starting schema update...');

if (!API_KEY) {
    log('Error: APPWRITE_API_KEY is missing in .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const DB_NAME = 'thrift_store';
const COLLECTION_NAME = 'products';

async function updateSchema() {
    log('Updating schema for products collection...');
    try {
        // 1. Add 'quantity' attribute
        try {
            // Cannot set default for required attribute. Making it optional (required=false) with default 1.
            await databases.createIntegerAttribute(DB_NAME, COLLECTION_NAME, 'quantity', false, 1, 1000000, 1);
            log('✅ Added "quantity" attribute');
        } catch (e) {
            log(`ℹ️ "quantity" attribute might already exist or failed: ${e.message}`);
        }

        // 2. Add 'images' attribute (Array of Strings)
        try {
            await databases.createStringAttribute(DB_NAME, COLLECTION_NAME, 'images', 5000, false, undefined, true);
            log('✅ Added "images" attribute');
        } catch (e) {
            log(`ℹ️ "images" attribute might already exist or failed: ${e.message}`);
        }

        log('Schema update complete.');
    } catch (error) {
        log(`❌ Failed to update schema: ${error.message}`);
    }
}

updateSchema();
