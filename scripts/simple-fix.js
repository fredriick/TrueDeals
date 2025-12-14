import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

// Sync log
function log(msg) {
    fs.appendFileSync('fix_result.txt', msg + '\n');
}

async function run() {
    try {
        log('Attempting to create quantity attribute...');
        await databases.createIntegerAttribute('thrift_store', 'products', 'quantity', true, 0, 1000000, 0);
        log('SUCCESS: Created.');
    } catch (e) {
        log(`ERROR: ${e.message}`);
    }
}

run();
