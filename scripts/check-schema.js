import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('Error: APPWRITE_API_KEY is missing in .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);

async function checkSchema() {
    console.log('Checking schema for products collection...');
    try {
        const attributes = await databases.listAttributes('thrift_store', 'products');
        console.log('Attributes found:');
        attributes.attributes.forEach(attr => {
            console.log(`- ${attr.key} (${attr.type})`);
        });
    } catch (error) {
        console.error('Failed to list attributes:', error);
    }
}

checkSchema();
