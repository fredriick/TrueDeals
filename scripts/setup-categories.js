import { Client, Databases, ID, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const PRODUCTS_COLLECTION_ID = 'products';
const CATEGORIES_COLLECTION_ID = 'categories';

async function setupCategories() {
    try {
        console.log('Checking if categories collection exists...');
        try {
            await databases.getCollection(DATABASE_ID, CATEGORIES_COLLECTION_ID);
            console.log('Categories collection already exists.');
        } catch (error) {
            console.log('Creating categories collection...');
            await databases.createCollection(DATABASE_ID, CATEGORIES_COLLECTION_ID, 'Categories');

            console.log('Creating name attribute...');
            await databases.createStringAttribute(DATABASE_ID, CATEGORIES_COLLECTION_ID, 'name', 255, true);

            // Wait for attribute to be created
            console.log('Waiting for attribute creation...');
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('Migrating existing categories...');

        // 1. Fetch all products
        const products = await databases.listDocuments(DATABASE_ID, PRODUCTS_COLLECTION_ID, [
            Query.limit(100)
        ]);

        // 2. Extract unique categories
        const uniqueCategories = [...new Set(products.documents.map(p => p.category))];
        console.log(`Found ${uniqueCategories.length} unique categories:`, uniqueCategories);

        // 3. Insert into categories collection
        for (const categoryName of uniqueCategories) {
            // Check if already exists to avoid duplicates if re-running
            const existing = await databases.listDocuments(DATABASE_ID, CATEGORIES_COLLECTION_ID, [
                Query.equal('name', categoryName)
            ]);

            if (existing.total === 0) {
                await databases.createDocument(DATABASE_ID, CATEGORIES_COLLECTION_ID, ID.unique(), {
                    name: categoryName
                });
                console.log(`Created category: ${categoryName}`);
            } else {
                console.log(`Category already exists: ${categoryName}`);
            }
        }

        console.log('Categories setup and migration complete!');

    } catch (error) {
        console.error('Error setting up categories:', error);
    }
}

setupCategories();
