declare module 'firebase/app' {
  export interface FirebaseOptions {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  }

  export interface FirebaseApp {
    name: string;
    options: FirebaseOptions;
  }

  export function initializeApp(options: FirebaseOptions): FirebaseApp;
  export function getApps(): FirebaseApp[];
}

declare module 'firebase/auth' {
  export interface User {
    email: string | null;
    uid: string;
    isPremium?: boolean;
  }

  export interface Auth {
    app: any;
    name: string;
    config: any;
  }

  export class GoogleAuthProvider {
    constructor();
  }

  export function getAuth(app?: any): Auth;
  export function signInWithPopup(auth: Auth, provider: GoogleAuthProvider): Promise<any>;
  export function signOut(auth: Auth): Promise<void>;
  export function onAuthStateChanged(auth: Auth, callback: (user: User | null) => void): () => void;
} 