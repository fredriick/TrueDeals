import { Client, Databases, Permission, Role, ID } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const ANALYTICS_COLLECTION_ID = 'product_analytics';
const PRODUCTS_COLLECTION_ID = 'products';
const SETTINGS_COLLECTION_ID = 'settings';

async function setupProductAnalytics() {
    try {
        console.log('🚀 Setting up Product Analytics System...\n');

        // ========================================
        // PART 1: Create product_analytics collection
        // ========================================
        console.log('📦 Step 1: Creating product_analytics collection...');

        try {
            await databases.getCollection(DATABASE_ID, ANALYTICS_COLLECTION_ID);
            console.log('⚠️  product_analytics collection already exists. Skipping creation.\n');
        } catch (error) {
            await databases.createCollection(
                DATABASE_ID,
                ANALYTICS_COLLECTION_ID,
                'Product Analytics',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.any()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('✅ product_analytics collection created.');

            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log('📝 Creating attributes for product_analytics...\n');

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'productId', 255, true);
            console.log('  ✓ Created productId attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'eventType', 50, true);
            console.log('  ✓ Created eventType attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'userId', 255, false);
            console.log('  ✓ Created userId attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'sessionId', 255, false);
            console.log('  ✓ Created sessionId attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createDatetimeAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'timestamp', true);
            console.log('  ✓ Created timestamp attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'referrer', 500, false);
            console.log('  ✓ Created referrer attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createStringAttribute(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'userAgent', 500, false);
            console.log('  ✓ Created userAgent attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            console.log('\n📊 Creating indexes...');

            await databases.createIndex(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'productId_index', 'key', ['productId'], ['ASC']);
            console.log('  ✓ Created index on productId');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createIndex(DATABASE_ID, ANALYTICS_COLLECTION_ID, 'timestamp_index', 'key', ['timestamp'], ['DESC']);
            console.log('  ✓ Created index on timestamp\n');
        }

        // ========================================
        // PART 2: Update products collection
        // ========================================
        console.log('📦 Step 2: Updating products collection with analytics fields...\n');

        try {
            await databases.createIntegerAttribute(DATABASE_ID, PRODUCTS_COLLECTION_ID, 'viewCount', false, 0);
            console.log('  ✓ Created viewCount attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  viewCount attribute already exists');
            } else {
                throw error;
            }
        }

        try {
            await databases.createIntegerAttribute(DATABASE_ID, PRODUCTS_COLLECTION_ID, 'clickCount', false, 0);
            console.log('  ✓ Created clickCount attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  clickCount attribute already exists');
            } else {
                throw error;
            }
        }

        try {
            await databases.createDatetimeAttribute(DATABASE_ID, PRODUCTS_COLLECTION_ID, 'lastViewedAt', false);
            console.log('  ✓ Created lastViewedAt attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  lastViewedAt attribute already exists');
            } else {
                throw error;
            }
        }

        // ========================================
        // PART 3: Create settings collection (if doesn't exist)
        // ========================================
        console.log('\n📦 Step 3: Setting up settings collection...');

        try {
            await databases.getCollection(DATABASE_ID, SETTINGS_COLLECTION_ID);
            console.log('⚠️  settings collection already exists.\n');
        } catch (error) {
            await databases.createCollection(
                DATABASE_ID,
                SETTINGS_COLLECTION_ID,
                'Settings',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('✅ settings collection created.');
            await new Promise(resolve => setTimeout(resolve, 1000));

            await databases.createBooleanAttribute(DATABASE_ID, SETTINGS_COLLECTION_ID, 'showViewCounts', false, true);
            console.log('  ✓ Created showViewCounts attribute\n');
        }

        // Create default analytics settings
        try {
            await databases.createDocument(
                DATABASE_ID,
                SETTINGS_COLLECTION_ID,
                'analytics_settings',
                { showViewCounts: true }
            );
            console.log('✅ Created default analytics settings (view counts enabled)\n');
        } catch (error) {
            if (error.code === 409) {
                console.log('⚠️  Analytics settings already exist\n');
            }
        }

        // ========================================
        // Summary
        // ========================================
        console.log('✅ Product Analytics System Setup Complete!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🗂️  NEW COLLECTION: product_analytics');
        console.log('   Attributes:');
        console.log('   • productId (string, required)');
        console.log('   • eventType (string, required - "view" or "click")');
        console.log('   • userId (string, optional)');
        console.log('   • sessionId (string, optional)');
        console.log('   • timestamp (datetime, required)');
        console.log('   • referrer (string, optional)');
        console.log('   • userAgent (string, optional)');
        console.log('   Indexes:');
        console.log('   • productId_index (productId ASC)');
        console.log('   • timestamp_index (timestamp DESC)\n');

        console.log('📝 UPDATED COLLECTION: products');
        console.log('   New Attributes:');
        console.log('   • viewCount (integer, default: 0)');
        console.log('   • clickCount (integer, default: 0)');
        console.log('   • lastViewedAt (datetime, optional)\n');

        console.log('⚙️  SETTINGS COLLECTION: settings');
        console.log('   Default Document: analytics_settings');
        console.log('   • showViewCounts (boolean, default: true)\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 Analytics tracking is ready!');
        console.log('📊 View counts are enabled by default (toggle in admin)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('\n❌ Error setting up product analytics:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
}

setupProductAnalytics();
