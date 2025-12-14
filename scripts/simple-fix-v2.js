import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Sync log with clearing
function log(msg) {
    fs.appendFileSync('fix_result_2.txt', msg + '\n');
}

async function run() {
    try {
        log('Attempting to create quantity attribute (Corrected)...');
        // Removing the default value argument
        await databases.createIntegerAttribute('thrift_store', 'products', 'quantity', true, 0, 1000000);
        log('SUCCESS: Created.');
    } catch (e) {
        if (e.code === 409) {
            log('INFO: Attribute already exists?');
        }
        log(`ERROR: ${e.message}`);
    }
}

run();
