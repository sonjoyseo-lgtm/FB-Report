import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  increment
} from "firebase/firestore";

// Config parsed and loaded from environment variables (.env / production env) with robust fallback defaults
const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0570000409",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:780744504480:web:013eef83defd0b7f6fc5c5",
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBwkHMLVprMXheNWa2IuJmFg-a7hdtTn8k",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "gen-lang-client-0570000409.firebaseapp.com",
  firestoreDatabaseId: import.meta.env.VITE_FIREBASE_DATABASE_ID || "ai-studio-acce36f7-c9c1-4ce7-9023-6df2bdcf61c2",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "gen-lang-client-0570000409.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "780744504480"
};

const app = initializeApp(firebaseConfig);

// Initialize the primary Firestore database securely
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || "(default)");

export interface FacebookReport {
  id?: string;
  facebookLink: string;
  category: string;
  description: string;
  timestamp: any; // Date, firebase timestamp, or epoch
  clickCount: number;
}

// 1. Submit a new report
export async function submitReport(facebookLink: string, category: string, description: string) {
  try {
    const docRef = await addDoc(collection(db, "reports"), {
      facebookLink,
      category: category.trim(),
      description: description.trim(),
      timestamp: Date.now(), // Epoch millisecond is robust and queries perfectly
      clickCount: 0
    });
    return docRef.id;
  } catch (error) {
    console.error("Error submitting report to Firestore:", error);
    throw error;
  }
}

// 2. Fetch all reports sorted by timestamp desc
export async function fetchReports(): Promise<FacebookReport[]> {
  try {
    const q = query(collection(db, "reports"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    const reportsList: FacebookReport[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      reportsList.push({
        id: doc.id,
        facebookLink: data.facebookLink || "",
        category: data.category || "",
        description: data.description || "",
        timestamp: data.timestamp || Date.now(),
        clickCount: data.clickCount || 0,
      });
    });
    return reportsList;
  } catch (error) {
    console.error("Error fetching reports from Firestore: ", error);
    return [];
  }
}

// 3. Track click count on a reported post
export async function incrementClickCount(reportId: string) {
  try {
    const reportDoc = doc(db, "reports", reportId);
    await updateDoc(reportDoc, {
      clickCount: increment(1)
    });
  } catch (error) {
    console.error("Error incrementing click count in Firestore: ", error);
  }
}

// 4. Delete a harmful post report (Admin only)
export async function deleteReport(reportId: string) {
  try {
    const reportDoc = doc(db, "reports", reportId);
    await deleteDoc(reportDoc);
  } catch (error) {
    console.error("Error deleting report in Firestore: ", error);
    throw error;
  }
}

// 4.5 Update report properties (Admin only)
export async function updateReport(reportId: string, updatedData: Partial<FacebookReport>) {
  try {
    const reportDoc = doc(db, "reports", reportId);
    await updateDoc(reportDoc, updatedData);
  } catch (error) {
    console.error("Error updating report in Firestore: ", error);
    throw error;
  }
}

// 4.6 Global category merger / rename (Admin only)
export async function updateCategoryGlobally(oldCategory: string, newCategory: string) {
  try {
    const snapshot = await getDocs(collection(db, "reports"));
    for (const document of snapshot.docs) {
      const data = document.data();
      if ((data.category || "").trim().toLowerCase() === oldCategory.trim().toLowerCase()) {
        const reportDoc = doc(db, "reports", document.id);
        await updateDoc(reportDoc, {
          category: newCategory.trim()
        });
      }
    }
  } catch (error) {
    console.error("Error updating category globally in Firestore: ", error);
    throw error;
  }
}

// 5. Fetch all permitted admin emails
export async function fetchAdminEmails(): Promise<string[]> {
  try {
    const adminCol = collection(db, "admins");
    const snapshot = await getDocs(adminCol);
    const emails: string[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.email) {
        emails.push(data.email.trim().toLowerCase());
      }
    });
    return emails;
  } catch (error) {
    console.error("Error fetching admin emails from Firestore: ", error);
    return [];
  }
}

// 6. Add new admin email to the db
export async function addAdminEmail(email: string) {
  try {
    await addDoc(collection(db, "admins"), {
      email: email.trim().toLowerCase(),
      addedAt: Date.now()
    });
  } catch (error) {
    console.error("Error adding admin email to Firestore: ", error);
    throw error;
  }
}

// 7. Delete admin email from the db (Admin revoke)
export async function deleteAdminEmail(email: string) {
  try {
    const adminCol = collection(db, "admins");
    const snapshot = await getDocs(adminCol);
    for (const document of snapshot.docs) {
      if (document.data().email?.trim().toLowerCase() === email.trim().toLowerCase()) {
        await deleteDoc(doc(db, "admins", document.id));
      }
    }
  } catch (error) {
    console.error("Error deleting admin email from Firestore: ", error);
    throw error;
  }
}


