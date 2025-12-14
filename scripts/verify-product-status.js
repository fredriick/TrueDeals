import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);
const STATUS_FILE = 'verify_status.txt';

async function verifyProduct() {
    try {
        const dummyId = ID.unique();
        const dummyProduct = {
            name: 'Test Product ' + dummyId,
            price: 100,
            description: 'Test Description',
            category: 'Test',
            quantity: 0,
            images: [],
            salePrice: 0,
            onSale: false,
            size: 'M'
        };

        const result = await databases.createDocument('thrift_store', 'products', dummyId, dummyProduct);

        fs.writeFileSync(STATUS_FILE, `SUCCESS: Created ${result.$id}`);

        await databases.deleteDocument('thrift_store', 'products', result.$id);

    } catch (error) {
        fs.writeFileSync(STATUS_FILE, `FAILURE: ${error.message}`);
    }
}

verifyProduct();
