import { getAuth, signInAnonymously, linkWithCredential, EmailAuthProvider } from 'firebase/auth';
import { app } from './firebase';

const auth = getAuth(app);

export async function ensureAnonymousAuth() {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    try {
      const result = await signInAnonymously(auth);
      return result.user;
    } catch (error) {
      console.error('Anonymous auth failed:', error);
      throw error;
    }
  }
  
  return currentUser;
}

export async function linkAnonymousToEmail(email: string, password: string) {
  const currentUser = auth.currentUser;
  
  if (currentUser && currentUser.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    try {
      const result = await linkWithCredential(currentUser, credential);
      return result.user;
    } catch (error) {
      console.error('Failed to link anonymous account:', error);
      throw error;
    }
  }
  
  return currentUser;
}

export function getChatCount(): number {
  if (typeof window === 'undefined') return 0;
  const count = localStorage.getItem('lexai_chat_count');
  return count ? parseInt(count, 10) : 0;
}

export function incrementChatCount(): number {
  if (typeof window === 'undefined') return 0;
  const currentCount = getChatCount();
  const newCount = currentCount + 1;
  localStorage.setItem('lexai_chat_count', newCount.toString());
  return newCount;
}

export function resetChatCount(): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('lexai_chat_count', '0');
}
