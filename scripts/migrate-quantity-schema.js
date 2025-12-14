import { Client, Databases, Query } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COLLECTION_ID = 'products';
const ATTRIBUTE_KEY = 'quantity';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function migrateQuantity() {
    console.log('--- Starting Quantity Migration ---');

    // 1. Backup Data
    console.log('1. Backing up current stock levels...');
    let allProducts = [];
    let cursor = null;

    while (true) {
        const queries = [Query.limit(100)];
        if (cursor) queries.push(Query.cursorAfter(cursor));

        const response = await databases.listDocuments(DATABASE_ID, COLLECTION_ID, queries);
        if (response.documents.length === 0) break;

        allProducts.push(...response.documents);
        cursor = response.documents[response.documents.length - 1].$id;
    }
    console.log(`   Backed up ${allProducts.length} products.`);

    // 2. Delete Attribute
    console.log('2. Deleting restrictive "quantity" attribute...');
    try {
        await databases.deleteAttribute(DATABASE_ID, COLLECTION_ID, ATTRIBUTE_KEY);
        console.log('   Delete command sent. Waiting for deletion (may take 10-20s)...');
    } catch (e) {
        console.log(`   Delete failed (maybe already gone?): ${e.message}`);
    }

    // Poll until gone
    let deleted = false;
    for (let i = 0; i < 30; i++) {
        await sleep(1000);
        try {
            await databases.getAttribute(DATABASE_ID, COLLECTION_ID, ATTRIBUTE_KEY);
            process.stdout.write('.');
        } catch (e) {
            console.log('\n   Attribute is gone.');
            deleted = true;
            break;
        }
    }

    if (!deleted) {
        console.log('❌ Error: Attribute failed to delete in time. Aborting.');
        return;
    }

    // 3. Recreate Attribute
    console.log('3. Recreating "quantity" with Min: 0...');
    try {
        await databases.createIntegerAttribute(DATABASE_ID, COLLECTION_ID, ATTRIBUTE_KEY, true, 0, 1000000, 0);
        console.log('   Create command sent. Waiting for availability...');
    } catch (e) {
        console.log(`❌ Recreate failed: ${e.message}`);
        return;
    }

    // Poll until ready
    let ready = false;
    for (let i = 0; i < 30; i++) {
        await sleep(1000);
        try {
            const attr = await databases.getAttribute(DATABASE_ID, COLLECTION_ID, ATTRIBUTE_KEY);
            if (attr.status === 'available') {
                console.log('\n   Attribute is ready!');
                ready = true;
                break;
            } else {
                process.stdout.write(`(${attr.status})`);
            }
        } catch (e) {
            process.stdout.write('?');
        }
    }

    if (!ready) {
        console.log('❌ Error: Attribute not ready in time.');
        // Proceeding might fail but let's try restoring anyway
    }

    // 4. Restore Data
    console.log('4. Restoring stock levels...');
    let restoredCount = 0;
    for (const p of allProducts) {
        try {
            // Use updateDocument. Since attribute is new, it's null for everyone.
            // But documents exist.
            await databases.updateDocument(DATABASE_ID, COLLECTION_ID, p.$id, {
                quantity: p.quantity // Restore original value
            });
            restoredCount++;
            if (restoredCount % 10 === 0) process.stdout.write('.');
        } catch (e) {
            console.error(`\n   Failed to restore ${p.$id}: ${e.message}`);
        }
    }

    console.log(`\n\n✅ Migration Complete. Restored ${restoredCount}/${allProducts.length} items.`);
    console.log('Please try checkout now.');
}

migrateQuantity();
