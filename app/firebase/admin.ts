import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = getFirestore();

export async function updateUserPremiumStatus(userId: string, isPremium: boolean) {
  console.log('🔄 Starting premium status update for user:', userId);
  
  const userRef = db.collection('users').doc(userId);
  
  try {
    // First, check if the document exists
    const doc = await userRef.get();
    if (!doc.exists) {
      console.log('📝 Creating new user document');
      // Create the document if it doesn't exist
      await userRef.set({
        isPremium,
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        lastUpdated: new Date().toISOString(),
      });
    } else {
      console.log('📝 Updating existing user document');
      // Update existing document
      await userRef.update({
        isPremium,
        updatedAt: FieldValue.serverTimestamp(),
        lastUpdated: new Date().toISOString(),
      });
    }

    // Verify the update
    const updatedDoc = await userRef.get();
    const data = updatedDoc.data();
    
    if (data?.isPremium !== isPremium) {
      throw new Error('Premium status not updated correctly');
    }

    console.log('✅ User premium status verified:', {
      userId,
      isPremium: data.isPremium,
      updatedAt: data.updatedAt
    });
    
    return true;
  } catch (error) {
    console.error('💥 Error in updateUserPremiumStatus:', error);
    throw error;
  }
} 