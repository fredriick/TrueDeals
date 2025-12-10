import { Client, Databases } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const PRODUCTS_COLLECTION_ID = 'products';

async function updateProductsSchema() {
    try {
        console.log('Updating products schema...');

        // onSale - boolean
        try {
            await databases.createBooleanAttribute(DATABASE_ID, PRODUCTS_COLLECTION_ID, 'onSale', false, false);
            console.log('Created onSale attribute');
        } catch (error) {
            console.log('onSale attribute might already exist:', error.message);
        }
        await new Promise(resolve => setTimeout(resolve, 500));

        // salePrice - float
        try {
            await databases.createFloatAttribute(DATABASE_ID, PRODUCTS_COLLECTION_ID, 'salePrice', false, 0);
            console.log('Created salePrice attribute');
        } catch (error) {
            console.log('salePrice attribute might already exist:', error.message);
        }

        console.log('\n✅ Products schema updated successfully!');

    } catch (error) {
        console.error('Error updating products schema:', error);
    }
}

updateProductsSchema();
