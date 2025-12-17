import { Client, Databases, Permission, Role } from 'node-appwrite';
import dotenv from 'dotenv';

dotenv.config();

const client = new Client()
    .setEndpoint(process.env.VITE_APPWRITE_ENDPOINT)
    .setProject(process.env.VITE_APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

const databases = new Databases(client);

const DATABASE_ID = 'thrift_store';
const ORDER_STATUS_HISTORY_COLLECTION_ID = 'order_status_history';
const ORDERS_COLLECTION_ID = 'orders';

async function setupOrderTracking() {
    try {
        console.log('🚀 Setting up Order Tracking System...\n');

        // ========================================
        // PART 1: Create order_status_history collection
        // ========================================
        console.log('📦 Step 1: Creating order_status_history collection...');

        try {
            await databases.getCollection(DATABASE_ID, ORDER_STATUS_HISTORY_COLLECTION_ID);
            console.log('⚠️  order_status_history collection already exists. Skipping creation.\n');
        } catch (error) {
            // Collection doesn't exist, create it
            await databases.createCollection(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'Order Status History',
                [
                    Permission.read(Role.any()),
                    Permission.create(Role.users()),
                    Permission.update(Role.users()),
                    Permission.delete(Role.users())
                ]
            );
            console.log('✅ order_status_history collection created.');

            // Wait for collection to be ready
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Create attributes
            console.log('📝 Creating attributes for order_status_history...\n');

            // orderId - string, required
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'orderId',
                255,
                true
            );
            console.log('  ✓ Created orderId attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // status - string, required
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'status',
                50,
                true
            );
            console.log('  ✓ Created status attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // timestamp - datetime, required
            await databases.createDatetimeAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'timestamp',
                true
            );
            console.log('  ✓ Created timestamp attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // updatedBy - string, required
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'updatedBy',
                255,
                true
            );
            console.log('  ✓ Created updatedBy attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // notes - string, optional
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'notes',
                1000,
                false
            );
            console.log('  ✓ Created notes attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // location - string, optional
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'location',
                255,
                false
            );
            console.log('  ✓ Created location attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // notificationSent - boolean, default false
            await databases.createBooleanAttribute(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'notificationSent',
                false,
                false
            );
            console.log('  ✓ Created notificationSent attribute');
            await new Promise(resolve => setTimeout(resolve, 500));

            // Create indexes for better query performance
            console.log('\n📊 Creating indexes...');

            await databases.createIndex(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'orderId_index',
                'key',
                ['orderId'],
                ['ASC']
            );
            console.log('  ✓ Created index on orderId');
            await new Promise(resolve => setTimeout(resolve, 500));

            await databases.createIndex(
                DATABASE_ID,
                ORDER_STATUS_HISTORY_COLLECTION_ID,
                'timestamp_index',
                'key',
                ['timestamp'],
                ['ASC']
            );
            console.log('  ✓ Created index on timestamp\n');
        }

        // ========================================
        // PART 2: Update orders collection with tracking fields
        // ========================================
        console.log('📦 Step 2: Updating orders collection with tracking fields...\n');

        // Check if attributes already exist by trying to create them
        // If they exist, it will throw an error which we'll catch

        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                'trackingNumber',
                255,
                false
            );
            console.log('  ✓ Created trackingNumber attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  trackingNumber attribute already exists');
            } else {
                throw error;
            }
        }

        try {
            await databases.createStringAttribute(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                'carrier',
                50,
                false
            );
            console.log('  ✓ Created carrier attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  carrier attribute already exists');
            } else {
                throw error;
            }
        }

        try {
            await databases.createDatetimeAttribute(
                DATABASE_ID,
                ORDERS_COLLECTION_ID,
                'estimatedDelivery',
                false
            );
            console.log('  ✓ Created estimatedDelivery attribute');
            await new Promise(resolve => setTimeout(resolve, 500));
        } catch (error) {
            if (error.message?.includes('already exists') || error.code === 409) {
                console.log('  ⚠️  estimatedDelivery attribute already exists');
            } else {
                throw error;
            }
        }

        // ========================================
        // Summary
        // ========================================
        console.log('\n✅ Order Tracking System Setup Complete!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 SUMMARY');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

        console.log('🗂️  NEW COLLECTION: order_status_history');
        console.log('   Attributes:');
        console.log('   • orderId (string, required)');
        console.log('   • status (string, required)');
        console.log('   • timestamp (datetime, required)');
        console.log('   • updatedBy (string, required)');
        console.log('   • notes (string, optional)');
        console.log('   • location (string, optional)');
        console.log('   • notificationSent (boolean, default: false)');
        console.log('   Indexes:');
        console.log('   • orderId_index (orderId ASC)');
        console.log('   • timestamp_index (timestamp ASC)\n');

        console.log('📝 UPDATED COLLECTION: orders');
        console.log('   New Attributes:');
        console.log('   • trackingNumber (string, optional)');
        console.log('   • carrier (string, optional)');
        console.log('   • estimatedDelivery (datetime, optional)\n');

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎉 You can now use the Order Tracking features!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('\n❌ Error setting up order tracking:', error);
        console.error('\nError details:', error.message);
        process.exit(1);
    }
}

setupOrderTracking();
