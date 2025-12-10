import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const REVIEWS_COLLECTION_ID = 'reviews';

async function setupReviews() {
    try {
        console.log('Checking if reviews collection exists...');

        try {
            await databases.getCollection(DATABASE_ID, REVIEWS_COLLECTION_ID);
            console.log('Reviews collection already exists.');
            return;
        } catch (error) {
            console.log('Creating reviews collection...');
        }

        // Create collection
        await databases.createCollection(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'Reviews',
            [
                Permission.read(Role.any()),
                Permission.create(Role.users()),
                Permission.update(Role.users()),
                Permission.delete(Role.users())
            ]
        );
        console.log('Reviews collection created.');

        // Wait a bit for collection to be ready
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create attributes
        console.log('Creating attributes...');

        // productId - string, required
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'productId',
            255,
            true
        );
        console.log('Created productId attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // userId - string, required
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'userId',
            255,
            true
        );
        console.log('Created userId attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // userEmail - string, required
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'userEmail',
            255,
            true
        );
        console.log('Created userEmail attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // userName - string, required
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'userName',
            255,
            true
        );
        console.log('Created userName attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // rating - integer, required (1-5)
        await databases.createIntegerAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'rating',
            true,
            1,
            5
        );
        console.log('Created rating attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // title - string, optional
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'title',
            100,
            false
        );
        console.log('Created title attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // comment - string, required
        await databases.createStringAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'comment',
            1000,
            true
        );
        console.log('Created comment attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // verifiedPurchase - boolean, default false
        await databases.createBooleanAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'verifiedPurchase',
            false,
            false
        );
        console.log('Created verifiedPurchase attribute');
        await new Promise(resolve => setTimeout(resolve, 500));

        // helpful - integer, default 0
        await databases.createIntegerAttribute(
            DATABASE_ID,
            REVIEWS_COLLECTION_ID,
            'helpful',
            false,
            0
        );
        console.log('Created helpful attribute');

        console.log('\n✅ Reviews collection setup complete!');
        console.log('\nCollection Details:');
        console.log('- Database ID: thrift_store');
        console.log('- Collection ID: reviews');
        console.log('- Permissions: Read (any), Create/Update/Delete (users)');
        console.log('\nAttributes:');
        console.log('- productId (string, required)');
        console.log('- userId (string, required)');
        console.log('- userEmail (string, required)');
        console.log('- userName (string, required)');
        console.log('- rating (integer, required, 1-5)');
        console.log('- title (string, optional, max 100)');
        console.log('- comment (string, required, max 1000)');
        console.log('- verifiedPurchase (boolean, default false)');
        console.log('- helpful (integer, default 0)');

    } catch (error) {
        console.error('Error setting up reviews collection:', error);
        process.exit(1);
    }
}

setupReviews();
