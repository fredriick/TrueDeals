import { Client, Databases, Storage, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
// Configuration
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

console.log('--- Setup Debug ---');
console.log('Endpoint:', ENDPOINT);
console.log('Project ID:', PROJECT_ID);
console.log('API Key Length:', API_KEY ? API_KEY.length : 'Missing');
console.log('API Key Start:', API_KEY ? API_KEY.substring(0, 5) + '...' : 'Missing');
console.log('-------------------');

if (!API_KEY) {
    console.error('Error: APPWRITE_API_KEY is missing.');
    console.error('1. Go to Appwrite Console -> Overview -> Keys.');
    console.error('2. Create a new API Key with "Select All" scopes.');
    console.error('3. Add it to your .env file: APPWRITE_API_KEY=your_key_here');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const databases = new Databases(client);
const storage = new Storage(client);

const DB_NAME = 'thrift_store';
const BUCKET_ID = 'products';
let dbId = '';

async function setup() {
    try {
        // 0. Create Storage Bucket
        console.log('Creating storage bucket...');
        try {
            await storage.createBucket(BUCKET_ID, 'Products', [
                Permission.read(Role.any()),
                Permission.write(Role.users())
            ], false, true, undefined, ['jpg', 'png', 'gif', 'jpeg', 'webp']);
            console.log(`Bucket created: ${BUCKET_ID}`);
        } catch (error) {
            console.log('Bucket might already exist.');
        }
        // 1. Create Database
        console.log('Creating database...');
        try {
            const db = await databases.create('thrift_store', DB_NAME);
            dbId = db.$id;
            console.log(`Database created: ${dbId}`);
        } catch (error) {
            console.log('Database might already exist, checking...');
            const dbs = await databases.list();
            const existingDb = dbs.databases.find(d => d.name === DB_NAME);
            if (existingDb) {
                dbId = existingDb.$id;
                console.log(`Using existing database: ${dbId}`);
            } else {
                throw error;
            }
        }

        // 2. Create Collections
        await createCollection('products', 'Products', [
            Permission.read(Role.any()),
            Permission.write(Role.users()) // Only logged in users can create/update for now (should be admin)
        ], [
            { key: 'name', type: 'string', size: 255, required: true },
            { key: 'description', type: 'string', size: 5000, required: true },
            { key: 'price', type: 'double', required: true },
            { key: 'imageId', type: 'string', size: 255, required: false },
            { key: 'category', type: 'string', size: 100, required: true },
            { key: 'size', type: 'string', size: 50, required: false },
            { key: 'status', type: 'string', size: 50, required: true, default: 'available' }, // available, sold
        ]);

        await createCollection('orders', 'Orders', [
            Permission.read(Role.users()),
            Permission.create(Role.users()),
            Permission.update(Role.users())
        ], [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'items', type: 'string', size: 10000, required: true, array: true }, // JSON string of items or array of strings
            { key: 'total', type: 'double', required: true },
            { key: 'status', type: 'string', size: 50, required: true, default: 'pending' },
            { key: 'address', type: 'string', size: 1000, required: true },
        ]);

        await createCollection('profiles', 'Profiles', [
            Permission.read(Role.users()),
            Permission.update(Role.users()),
            Permission.create(Role.users())
        ], [
            { key: 'userId', type: 'string', size: 255, required: true },
            { key: 'address', type: 'string', size: 1000, required: false },
            { key: 'phone', type: 'string', size: 50, required: false },
        ]);

        console.log('Setup complete!');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

async function createCollection(id, name, permissions, attributes) {
    console.log(`Creating collection: ${name}...`);
    let collectionId = id;
    try {
        await databases.createCollection(dbId, id, name, permissions);
        console.log(`Collection ${name} created.`);
    } catch (error) {
        console.log(`Collection ${name} might already exist.`);
    }

    // Create Attributes
    for (const attr of attributes) {
        try {
            if (attr.type === 'string') {
                await databases.createStringAttribute(dbId, collectionId, attr.key, attr.size, attr.required, attr.default, attr.array);
            } else if (attr.type === 'double') {
                await databases.createFloatAttribute(dbId, collectionId, attr.key, attr.required, null, attr.default, attr.array);
            }
            // Add other types as needed
            console.log(`Attribute ${attr.key} created.`);
        } catch (error) {
            // Attribute might exist
        }
        // Wait a bit to ensure attribute is created before creating next (Appwrite rate limits/async)
        await new Promise(r => setTimeout(r, 500));
    }
}

setup();
