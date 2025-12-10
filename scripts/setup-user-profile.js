import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const ADDRESSES_COLLECTION_ID = 'user_addresses';
const WISHLIST_COLLECTION_ID = 'wishlist';

async function setupUserCollections() {
    try {
        console.log('Setting up user profile collections...\n');

        // Create user_addresses collection
        console.log('Creating user_addresses collection...');
        try {
            await databases.getCollection(DATABASE_ID, ADDRESSES_COLLECTION_ID);
            console.log('user_addresses collection already exists.');
        } catch (error) {
            await databases.createCollection(
                DATABASE_ID,
                ADDRESSES_COLLECTION_ID,
                'User Addresses',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('user_addresses collection created.');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create attributes
            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'userId', 255, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'name', 255, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'addressLine1', 255, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'addressLine2', 255, false);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'city', 100, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'state', 100, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'zipCode', 20, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'country', 100, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createBooleanAttribute(DATABASE_ID, ADDRESSES_COLLECTION_ID, 'isDefault', false, false);

            console.log('user_addresses attributes created.');
        }

        // Create wishlist collection
        console.log('\nCreating wishlist collection...');
        try {
            await databases.getCollection(DATABASE_ID, WISHLIST_COLLECTION_ID);
            console.log('wishlist collection already exists.');
        } catch (error) {
            await databases.createCollection(
                DATABASE_ID,
                WISHLIST_COLLECTION_ID,
                'Wishlist',
                [
                    Permission.read(Role.users()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('wishlist collection created.');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create attributes
            await databases.createStringAttribute(DATABASE_ID, WISHLIST_COLLECTION_ID, 'userId', 255, true);
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, WISHLIST_COLLECTION_ID, 'productId', 255, true);

            console.log('wishlist attributes created.');
        }

        console.log('\n✅ User profile collections setup complete!');
        console.log('\nCollections Created:');
        console.log('1. user_addresses - Store user shipping addresses');
        console.log('2. wishlist - Store user favorite products');

    } catch (error) {
        console.error('Error setting up collections:', error);
        process.exit(1);
    }
}

setupUserCollections();
