import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

async function verifyProduct() {
    console.log('--- Verifying Product Creation ---');

    // Create a dummy product
    const dummyId = ID.unique();
    const dummyProduct = {
        name: 'Test Product ' + dummyId,
        price: 100,
        description: 'Test Description',
        category: 'Test',
        quantity: 0, // CRITICAL: Testing 0 quantity
        images: [], // Assuming image is optional or empty array allowed (based on schema)
        salePrice: 0,
        onSale: false,
        size: 'M'
    };

    try {
        console.log(`Creating product ${dummyId} with quantity 0...`);
        const result = await databases.createDocument(
            'thrift_store',
            'products',
            dummyId,
            dummyProduct
        );
        console.log(`✅ Success! Product created with ID: ${result.$id}`);

        // Clean up
        await databases.deleteDocument('thrift_store', 'products', result.$id);
        console.log('✅ Cleaned up (deleted test product).');

    } catch (error) {
        console.error(`❌ Verification Failed: ${error.message}`);
        // If it fails, log attributes to see why
        try {
            const list = await databases.listAttributes('thrift_store', 'products');
            console.log('Current Attributes:', list.attributes.map(a => a.key).join(', '));
        } catch (e) {
            console.log('Could not list attributes.');
        }
    }
}

verifyProduct();
