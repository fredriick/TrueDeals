import { Client, Databases, ID } from 'node-appwrite';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const LOG_FILE = 'order_test_log.txt';
function log(msg) {
    fs.appendFileSync(LOG_FILE, msg + '\n');
    console.log(msg);
}

// Dummy data
const userId = 'test-user';
const userEmail = 'test@example.com';
const itemsArray = [{ $id: '1', name: 'Test Item', price: 10, quantity: 1 }];
const itemsString = JSON.stringify(itemsArray);
const paymentRef = 'test-ref-123';

async function testOrderCreation() {
    log('--- Starting Order Creation Test ---');

    // Attempt 1: Items as JSON String
    try {
        log('Attempt 1: Items as JSON String');
        await databases.createDocument(
            'thrift_store',
            'orders',
            ID.unique(),
            {
                userId,
                userEmail,
                items: itemsString, // Stringified
                total: 10,
                subtotal: 10,
                discount: 0,
                status: 'pending',
                paymentReference: paymentRef,
                address: 'Test Address'
            }
        );
        log('SUCCESS: Items as JSON String worked!');
    } catch (e) {
        log(`FAILED: Items as JSON String. Error: ${e.message}`);
    }

    // Attempt 2: Items as Array of Strings (IDs)
    try {
        log('Attempt 2: Items as Array of Strings (String Array)');
        await databases.createDocument(
            'thrift_store',
            'orders',
            ID.unique(),
            {
                userId,
                userEmail,
                items: itemsArray.map(i => iString = JSON.stringify(i)), // Array of JSON strings
                total: 10,
                subtotal: 10,
                discount: 0,
                status: 'pending',
                paymentReference: paymentRef,
                address: 'Test Address'
            }
        );
        log('SUCCESS: Items as Array of JSON Strings worked!');
    } catch (e) {
        log(`FAILED: Items as Array of JSON Strings. Error: ${e.message}`);
    }

    // Attempt 3: Items as Raw Objects (Unlikely)
    /*
    try {
        log('Attempt 3: Items as Raw Objects');
        await databases.createDocument(
            'thrift_store',
            'orders',
             ID.unique(),
            {
                // ... same data with items: itemsArray
            }
        );
    } catch (e) { log(`FAILED: Raw Objects. ${e.message}`) }
    */
}

testOrderCreation();
