import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const LOG_FILE = 'product_schema_log.txt';

async function diagnoseProducts() {
    try {
        const list = await databases.listAttributes('thrift_store', 'products');
        const qty = list.attributes.find(a => a.key === 'quantity');

        const msg = JSON.stringify(qty, null, 2);
        fs.writeFileSync(LOG_FILE, msg);
        console.log(msg);
    } catch (e) {
        console.error(e);
    }
}

diagnoseProducts();
