// lib/firebase.config.ts
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey,
      }),
    });
    
    console.log('✅ Firebase Admin initialized successfully');
  } catch (error) {
    console.error('❌ Firebase Admin initialization error:', error);
  }
}

export const db = admin.firestore();
export const auth = admin.auth();

// Collection references
export const collections = {
  users: 'users',
  profiles: 'user_profiles',
};

// Helper functions for Firestore operations
export const firestoreHelpers = {
  // Get user by email
  async getUserByEmail(email: string) {
    try {
      const snapshot = await db.collection(collections.users)
        .where('email', '==', email)
        .limit(1)
        .get();
      
      if (snapshot.empty) return null;
      
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('Error getting user:', error);
      throw error;
    }
  },

  // Create or update user
  async saveUser(userData: any) {
    try {
      const existingUser = await this.getUserByEmail(userData.email);
      
      if (existingUser) {
        // Update existing user
        await db.collection(collections.users).doc(existingUser.id).update({
          ...userData,
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
        });
        return { id: existingUser.id, ...userData };
      } else {
        // Create new user
        const docRef = await db.collection(collections.users).add({
          ...userData,
          joinedAt: admin.firestore.FieldValue.serverTimestamp(),
          lastLogin: admin.firestore.FieldValue.serverTimestamp(),
          hasCompletedOnboarding: false,
        });
        return { id: docRef.id, ...userData };
      }
    } catch (error) {
      console.error('Error saving user:', error);
      throw error;
    }
  },

  // Get all users (for admin)
  async getAllUsers() {
    try {
      const snapshot = await db.collection(collections.users).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  },

  // Save user profile
  async saveUserProfile(email: string, profileData: any) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) throw new Error('User not found');

      // Save profile data
      await db.collection(collections.profiles).doc(user.id).set({
        email,
        ...profileData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      }, { merge: true });

      // Mark onboarding as completed
      await db.collection(collections.users).doc(user.id).update({
        hasCompletedOnboarding: true,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      return { success: true };
    } catch (error) {
      console.error('Error saving profile:', error);
      throw error;
    }
  },

  // Get user profile
  async getUserProfile(email: string) {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) return null;

      const profileDoc = await db.collection(collections.profiles).doc(user.id).get();
      
      if (!profileDoc.exists) return null;
      
      return { ...profileDoc.data(), userId: user.id };
    } catch (error) {
      console.error('Error getting profile:', error);
      throw error;
    }
  },
};

export default admin;
