/**
 * Quick script to manually activate billing features for an organization
 * Usage: node scripts/fix-billing.js [orgId] [--ai] [--video] [--both]
 * 
 * Examples:
 *   node scripts/fix-billing.js abc123 --both        # Enable AI + Video
 *   node scripts/fix-billing.js abc123 --ai          # Enable only AI
 *   node scripts/fix-billing.js abc123 --video       # Enable only Video
 */

const admin = require('firebase-admin');
const { randomBytes } = require('crypto');

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

function generateId() {
  return randomBytes(16).toString('hex');
}

async function activateFeatures(orgId, aiEnabled, videoEnabled) {
  console.log(`\n🔧 Activating features for organization: ${orgId}`);
  console.log(`   AI: ${aiEnabled ? '✅' : '❌'}`);
  console.log(`   Video: ${videoEnabled ? '✅' : '❌'}`);

  try {
    // Check if organization exists
    const orgRef = db.collection('organizations').doc(orgId);
    const orgDoc = await orgRef.get();
    
    if (!orgDoc.exists) {
      console.error(`❌ Organization ${orgId} not found`);
      return false;
    }

    console.log(`\n📋 Current organization data:`);
    const orgData = orgDoc.data();
    console.log(`   Name: ${orgData.name}`);
    console.log(`   AI Enabled: ${orgData.aiFeatureEnabled || false}`);
    console.log(`   Video Enabled: ${orgData.videoFeatureEnabled || false}`);
    console.log(`   Status: ${orgData.subscriptionStatus || 'none'}`);

    // Check for existing subscription
    const subsQuery = await db.collection('subscriptions')
      .where('organizationId', '==', orgId)
      .limit(1)
      .get();

    let subscriptionId;
    const now = new Date().toISOString();
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    if (subsQuery.empty) {
      // Create new subscription
      subscriptionId = generateId();
      console.log(`\n📝 Creating new subscription: ${subscriptionId}`);
      
      await db.collection('subscriptions').doc(subscriptionId).set({
        id: subscriptionId,
        organizationId: orgId,
        polarSubscriptionId: `dev_${generateId()}`,
        polarCustomerId: `dev_cust_${generateId()}`,
        status: 'active',
        currentPeriodStart: now,
        currentPeriodEnd: nextMonth.toISOString(),
        cancelAtPeriodEnd: false,
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      // Update existing subscription
      const subDoc = subsQuery.docs[0];
      subscriptionId = subDoc.id;
      console.log(`\n📝 Updating existing subscription: ${subscriptionId}`);
      
      await db.collection('subscriptions').doc(subscriptionId).update({
        status: 'active',
        videoFeatureEnabled: videoEnabled,
        aiFeatureEnabled: aiEnabled,
        updatedAt: now,
      });
    }

    // Update organization
    console.log(`\n📝 Updating organization record...`);
    await orgRef.update({
      subscriptionId,
      subscriptionStatus: 'active',
      videoFeatureEnabled: videoEnabled,
      aiFeatureEnabled: aiEnabled,
      updatedAt: now,
    });

    console.log(`\n✅ Successfully activated features!`);
    console.log(`\n🎉 You can now use the AI assistant and video features.`);
    console.log(`   Organization: ${orgData.name}`);
    console.log(`   AI: ${aiEnabled ? 'ENABLED' : 'DISABLED'}`);
    console.log(`   Video: ${videoEnabled ? 'ENABLED' : 'DISABLED'}`);
    
    return true;
  } catch (error) {
    console.error(`\n❌ Error activating features:`, error.message);
    return false;
  }
}

async function listOrganizations() {
  console.log(`\n📋 Listing all organizations...\n`);
  
  try {
    const orgsSnapshot = await db.collection('organizations').get();
    
    if (orgsSnapshot.empty) {
      console.log('No organizations found.');
      return;
    }

    console.log(`Found ${orgsSnapshot.size} organization(s):\n`);
    
    orgsSnapshot.forEach((doc) => {
      const org = doc.data();
      console.log(`  ID: ${doc.id}`);
      console.log(`  Name: ${org.name}`);
      console.log(`  Slug: ${org.slug}`);
      console.log(`  AI Enabled: ${org.aiFeatureEnabled || false}`);
      console.log(`  Video Enabled: ${org.videoFeatureEnabled || false}`);
      console.log(`  Status: ${org.subscriptionStatus || 'none'}`);
      console.log(`  ---`);
    });
  } catch (error) {
    console.error(`❌ Error listing organizations:`, error.message);
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🔧 Billing Features Activation Tool

Usage:
  node scripts/fix-billing.js [orgId] [options]
  node scripts/fix-billing.js --list

Options:
  --both          Enable both AI and Video features (default)
  --ai            Enable only AI features
  --video         Enable only Video features
  --list          List all organizations

Examples:
  node scripts/fix-billing.js abc123 --both
  node scripts/fix-billing.js abc123 --ai
  node scripts/fix-billing.js abc123 --video
  node scripts/fix-billing.js --list
`);
    process.exit(0);
  }

  if (args.includes('--list')) {
    await listOrganizations();
    process.exit(0);
  }

  const orgId = args[0];
  const mode = args[1] || '--both';

  let aiEnabled = false;
  let videoEnabled = false;

  switch (mode) {
    case '--both':
      aiEnabled = true;
      videoEnabled = true;
      break;
    case '--ai':
      aiEnabled = true;
      videoEnabled = false;
      break;
    case '--video':
      aiEnabled = false;
      videoEnabled = true;
      break;
    default:
      console.error(`❌ Invalid option: ${mode}`);
      console.log(`Use --both, --ai, or --video`);
      process.exit(1);
  }

  const success = await activateFeatures(orgId, aiEnabled, videoEnabled);
  process.exit(success ? 0 : 1);
}

main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});
