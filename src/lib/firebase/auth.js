//import all of the important stuff
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged as _onAuthStateChanged,
  onIdTokenChanged as _onIdTokenChanged,
} from "firebase/auth";

import { auth } from "@/src/lib/firebase/clientApp";

//tracks auth state
export function onAuthStateChanged(cb) {
  return _onAuthStateChanged(auth, cb);
}

//tracks auth token?
export function onIdTokenChanged(cb) {
  return _onIdTokenChanged(auth, cb);
}

//enables signing in with google
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();

  try {
    await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Error signing in with Google", error);
  }
}

//handles signing out
export async function signOut() {
  try {
    return auth.signOut();
  } catch (error) {
    console.error("Error signing out with Google", error);
  }
}