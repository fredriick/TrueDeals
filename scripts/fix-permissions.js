import { Client, Storage, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

// Configuration
const ENDPOINT = process.env.VITE_APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.VITE_APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;

if (!API_KEY) {
    console.error('Error: APPWRITE_API_KEY is missing in .env');
    process.exit(1);
}

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const storage = new Storage(client);
const BUCKET_ID = 'products';

async function fixPermissions() {
    console.log(`Checking permissions for bucket: ${BUCKET_ID}...`);
    try {
        // Update bucket permissions to allow ANYONE to read (public)
        await storage.updateBucket(
            BUCKET_ID,
            'Products',
            [
                Permission.read(Role.any()),
                Permission.write(Role.users())
            ],
            false, // fileSecurity (false = bucket permissions apply to all files)
            true, // enabled
            undefined, // maxFileSize
            ['jpg', 'png', 'gif', 'jpeg', 'webp'] // allowedExtensions
        );
        console.log('✅ Bucket permissions updated! Images should now be visible.');
    } catch (error) {
        console.error('❌ Failed to update bucket:', error);
    }
}

fixPermissions();
