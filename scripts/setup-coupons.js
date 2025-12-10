import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COUPONS_COLLECTION_ID = 'coupons';

async function setupCoupons() {
    try {
        console.log('Setting up coupons collection...\n');

        // Create coupons collection
        console.log('Checking if coupons collection exists...');
        try {
            await databases.getCollection(DATABASE_ID, COUPONS_COLLECTION_ID);
            console.log('Coupons collection already exists.');
            return;
        } catch (error) {
            console.log('Creating coupons collection...');
        }

        await databases.createCollection(
            DATABASE_ID,
            COUPONS_COLLECTION_ID,
            'Coupons',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log('Coupons collection created.');
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create attributes
        console.log('Creating attributes...');

        // code - unique coupon code
        await databases.createStringAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'code', 50, true);
        console.log('Created code attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // type - percentage or fixed
        await databases.createStringAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'type', 20, true);
        console.log('Created type attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // value - discount amount
        await databases.createFloatAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'value', true);
        console.log('Created value attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // minPurchase - minimum order value
        await databases.createFloatAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'minPurchase', false, 0);
        console.log('Created minPurchase attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // maxDiscount - max discount for percentage coupons
        await databases.createFloatAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'maxDiscount', false);
        console.log('Created maxDiscount attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // usageLimit - total usage limit
        await databases.createIntegerAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'usageLimit', false);
        console.log('Created usageLimit attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // usageCount - current usage count
        await databases.createIntegerAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'usageCount', false, 0);
        console.log('Created usageCount attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // expiresAt - expiration date
        await databases.createDatetimeAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'expiresAt', false);
        console.log('Created expiresAt attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // isActive - active status
        await databases.createBooleanAttribute(DATABASE_ID, COUPONS_COLLECTION_ID, 'isActive', false, true);
        console.log('Created isActive attribute');

        console.log('\n✅ Coupons collection setup complete!');
        console.log('\nCollection Details:');
        console.log('- Database ID: thrift_store');
        console.log('- Collection ID: coupons');
        console.log('\nAttributes:');
        console.log('- code (string, required, unique)');
        console.log('- type (string, required) - "percentage" or "fixed"');
        console.log('- value (float, required) - discount amount');
        console.log('- minPurchase (float, optional)');
        console.log('- maxDiscount (float, optional)');
        console.log('- usageLimit (integer, optional)');
        console.log('- usageCount (integer, default: 0)');
        console.log('- expiresAt (datetime, optional)');
        console.log('- isActive (boolean, default: true)');

    } catch (error) {
        console.error('Error setting up coupons collection:', error);
        process.exit(1);
    }
}

setupCoupons();
