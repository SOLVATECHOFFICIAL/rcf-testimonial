import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import {
  doc,
  getDocFromServer,
  getFirestore,
  type Firestore,
} from 'firebase/firestore';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';
import appletConfig from '../../firebase-applet-config.json';

function readEnv(key: string): string {
  try {
    const val = (import.meta as unknown as { env?: Record<string, string | undefined> }).env?.[key];
    return typeof val === 'string' ? val.trim() : '';
  } catch {
    return '';
  }
}

function isPlaceholderEnv(val: string): boolean {
  if (!val) return true;
  const lower = val.toLowerCase();
  return (
    lower.startsWith('your_') ||
    lower.startsWith('your-') ||
    lower.includes('your-project-id') ||
    lower.includes('placeholder')
  );
}

const envApiKey = readEnv('VITE_FIREBASE_API_KEY');
const envProjectId = readEnv('VITE_FIREBASE_PROJECT_ID');

const useEnvConfig = !isPlaceholderEnv(envApiKey) && !isPlaceholderEnv(envProjectId);

const firebaseConfig = useEnvConfig
  ? {
      apiKey: envApiKey,
      authDomain: readEnv('VITE_FIREBASE_AUTH_DOMAIN'),
      projectId: envProjectId,
      storageBucket: readEnv('VITE_FIREBASE_STORAGE_BUCKET'),
      messagingSenderId: readEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
      appId: readEnv('VITE_FIREBASE_APP_ID'),
    }
  : {
      apiKey: appletConfig.apiKey,
      authDomain: appletConfig.authDomain,
      projectId: appletConfig.projectId,
      storageBucket: appletConfig.storageBucket,
      messagingSenderId: appletConfig.messagingSenderId,
      appId: appletConfig.appId,
    };

const firestoreDatabaseId = useEnvConfig
  ? readEnv('VITE_FIREBASE_FIRESTORE_DATABASE_ID')
  : appletConfig.firestoreDatabaseId;

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId,
);

const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);

export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const db: Firestore = firestoreDatabaseId
  ? getFirestore(app, firestoreDatabaseId)
  : getFirestore(app);

// Optional Firebase App Check when reCAPTCHA v3 site key is configured
const appCheckSiteKey = readEnv('VITE_FIREBASE_APPCHECK_SITE_KEY') || appletConfig.recaptchaSiteKey;
if (typeof window !== 'undefined' && appCheckSiteKey) {
  try {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(appCheckSiteKey),
      isTokenAutoRefreshEnabled: true,
    });
  } catch (err) {
    console.warn('Firebase App Check initialization skipped:', err);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

function sanitizeUserMessage(raw: string): string {
  const cleaned = raw
    .replace(/Firebase:\s*/gi, '')
    .replace(/Firestore/gi, 'fellowship database')
    .replace(/Firebase/gi, 'authentication service')
    .trim();
  return cleaned || 'An unexpected error occurred. Please try again.';
}

export function parseFirestoreErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return 'An unexpected error occurred. Please try again.';
  try {
    const parsed = JSON.parse(err.message) as Partial<FirestoreErrorInfo>;
    if (parsed && typeof parsed.error === 'string') {
      const lower = parsed.error.toLowerCase();
      if (lower.includes('permission')) {
        return 'Permission denied. Please verify your authorization or try again.';
      }
      if (lower.includes('quota')) {
        return 'Service quota limit reached for today. Please try again later.';
      }
      if (lower.includes('offline') || lower.includes('network')) {
        return 'Unable to reach the fellowship database. Please check your internet connection.';
      }
      return sanitizeUserMessage(parsed.error);
    }
  } catch {
    // Plain error message
  }
  return sanitizeUserMessage(err.message);
}

async function testConnection() {
  if (typeof window === 'undefined' || !isFirebaseConfigured) return;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

void testConnection();
