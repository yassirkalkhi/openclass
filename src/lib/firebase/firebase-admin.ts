import admin from "firebase-admin"

const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

if (!admin.apps.length) {
    if (serviceAccount.projectId && serviceAccount.clientEmail && serviceAccount.privateKey) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        })
    } else {
        console.warn("⚠️ Firebase environment variables are missing. Firebase Admin will not be initialized. This is expected during some build steps, but will fail at runtime if not fixed.")
    }
}

export const db = admin.apps.length ? admin.firestore() : (null as unknown as FirebaseFirestore.Firestore)
export const auth = admin.apps.length ? admin.auth() : (null as unknown as admin.auth.Auth)

export function assertFirestoreReady(): void {
  if (!admin.apps.length) {
    throw new Error(
      "Firebase is not configured. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, and FIREBASE_PRIVATE_KEY in .env.local"
    )
  }
}