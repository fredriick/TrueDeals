import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const CATEGORIES_COLLECTION_ID = 'categories';

async function fixPermissions() {
    try {
        console.log('Updating category collection permissions...');
        await databases.updateCollection(
            DATABASE_ID,
            CATEGORIES_COLLECTION_ID,
            'Categories',
            [
                Permission.read(Role.any()), // Allow anyone to view categories
                Permission.create(Role.users()), // Allow logged in users (admins) to create? Actually maybe just admins.
                Permission.update(Role.users()),
                Permission.delete(Role.users()),
            ]
        );
        console.log('Permissions updated.');

        console.log('Verifying documents...');
        const docs = await databases.listDocuments(DATABASE_ID, CATEGORIES_COLLECTION_ID);
        console.log(`Found ${docs.total} categories.`);
        docs.documents.forEach(d => console.log(`- ${d.name}`));

    } catch (error) {
        console.error('Error fixing permissions:', error);
    }
}

fixPermissions();
