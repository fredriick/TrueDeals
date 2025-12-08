import { Client, Account, Databases, Storage } from 'appwrite';

export const client = new Client();

const endpoint = (import.meta.env.VITE_APPWRITE_ENDPOINT || '').trim();
const projectId = (import.meta.env.VITE_APPWRITE_PROJECT_ID || '').trim();

client
    .setEndpoint(endpoint)
    .setProject(projectId);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
