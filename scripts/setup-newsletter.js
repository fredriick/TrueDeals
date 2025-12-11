import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const COLLECTION_ID = 'newsletter';

async function setupNewsletter() {
    try {
        console.log('Setting up Newsletter collection...');

        // 1. Create Collection
        try {
            await databases.createCollection(DATABASE_ID, COLLECTION_ID, 'Newsletter');
            console.log('Created newsletter collection');
        } catch (error) {
            console.log('Newsletter collection might already exist:', error.message);
        }

        // 2. Create Attributes
        try {
            await databases.createEmailAttribute(DATABASE_ID, COLLECTION_ID, 'email', true);
            console.log('Created email attribute');
        } catch (error) {
            console.log('Email attribute exists');
        }
        await new Promise(resolve => setTimeout(resolve, 500));

        // 3. Update Permissions (Public create for signup)
        try {
            // Note: In a real app, you might want to restrict read access, but for now we'll allow standard CRUD
            // Public can Create (sign up). Only Admin can Read (export list).
            await databases.updateCollection(
                DATABASE_ID,
                COLLECTION_ID,
                'Newsletter',
                [
                    Permission.create(Role.any()), // Anyone can sign up
                    Permission.read(Role.label('admin')), // Only admins see the list
                    Permission.update(Role.label('admin')),
                    Permission.delete(Role.label('admin'))
                ]
            );
            console.log('Updated collection permissions');
        } catch (error) {
            console.error('Error updating permissions:', error);
        }

        console.log('✅ Newsletter setup complete!');

    } catch (error) {
        console.error('Setup failed:', error);
    }
}

setupNewsletter();
