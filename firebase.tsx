import { initializeApp } from "firebase/app";
// @ts-ignore
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from "firebase/firestore";
// Analytics ආරක්ෂිතව පාවිච්චි කරන්න isSupported එකත් ගන්නවා
import { getAnalytics, isSupported } from "firebase/analytics";
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { API_KEY, AUTH_DOMAIN, PROJECT_ID, STORAGE_BUCKET, MESSAGING_SENDER_ID, APP_ID, MEASUREMENT_ID } from '@env';

const firebaseConfig = {
  apiKey: API_KEY,
  authDomain: AUTH_DOMAIN,
  projectId: PROJECT_ID,
  storageBucket: STORAGE_BUCKET,
  messagingSenderId: MESSAGING_SENDER_ID,
  appId: APP_ID,
  measurementId: MEASUREMENT_ID
};

// 1. Initialize Firebase App
const app = initializeApp(firebaseConfig);

// 2. Auth with Persistence (Login මතක තියාගන්න)
const auth = initializeAuth(app, {
  // @ts-ignore - VS Code එකේ බොරු Error එක නවත්තන්න මේක දැම්මා
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// 3. Database
const db = getFirestore(app);

// 4. Analytics (Expo Go එකේදි Crash නොවී වැඩ කරන්න)
let analytics;
isSupported().then((supported) => {
  if (supported) {
    analytics = getAnalytics(app);
  }
});

export { auth, db, analytics };