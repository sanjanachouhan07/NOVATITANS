'use client';

import { useMemo, useEffect, useState, useCallback } from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, setDoc, serverTimestamp, arrayUnion, increment } from 'firebase/firestore';

export interface UserProgress {
  coins: number;
  exp: number;
  score: number;
  currentLevel: number;
  completedLevels: number[];
  unlockedLevels: number[];
  badges: string[];
}

const STORAGE_KEY = 'crypto_things_user_data';

const initialProgress: UserProgress = {
  coins: 0,
  exp: 0,
  score: 0,
  currentLevel: 0,
  completedLevels: [],
  unlockedLevels: [0],
  badges: [],
};

export function useUserProgress() {
  const { user, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  
  const userProfileRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'users', user.uid);
  }, [firestore, user]);

  const { data: firestoreData, isLoading: isDocLoading } = useDoc<any>(userProfileRef as any);

  const [localProgress, setLocalProgress] = useState<UserProgress>(initialProgress);
  const [isLocalLoading, setIsLocalLoading] = useState(true);
  
  // OPTIMISTIC STATE: Bridge the gap between Firestore writes and snapshot updates
  const [optimisticCompleted, setOptimisticCompleted] = useState<number[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setLocalProgress({ ...initialProgress, ...parsed });
      } catch (e) {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsLocalLoading(false);
  }, []);

  const progress = useMemo(() => {
    let baseProgress: UserProgress;

    if (user && firestoreData) {
      baseProgress = {
        coins: firestoreData.coins ?? 0,
        exp: firestoreData.exp ?? 0,
        score: firestoreData.score ?? 0,
        currentLevel: firestoreData.currentLevel ?? 0,
        completedLevels: firestoreData.completedLevels ?? [],
        unlockedLevels: firestoreData.unlockedLevels ?? [0],
        badges: firestoreData.badges ?? [],
      };
    } else {
      baseProgress = localProgress;
    }

    // Merge base progress with optimistic updates
    const mergedCompleted = Array.from(new Set([...baseProgress.completedLevels, ...optimisticCompleted]));
    const mergedUnlocked = Array.from(new Set([...baseProgress.unlockedLevels, ...mergedCompleted.map(id => id + 1)]));

    return {
      ...baseProgress,
      completedLevels: mergedCompleted,
      unlockedLevels: mergedUnlocked.length > 0 ? mergedUnlocked : [0]
    };
  }, [user, firestoreData, localProgress, optimisticCompleted]);

  const loading = isAuthLoading || (!!user && isDocLoading) || (isLocalLoading && !user);

  const completeLevel = useCallback((levelId: number, reward: number, badge?: string, expReward: number = 100, scoreReward: number = 500) => {
    if (progress.completedLevels.includes(levelId)) return;
    
    setOptimisticCompleted(prev => [...prev, levelId]);

    const updates: any = {
      coins: increment(reward),
      exp: increment(expReward),
      score: increment(scoreReward),
      completedLevels: arrayUnion(levelId),
      unlockedLevels: arrayUnion(levelId + 1),
      currentLevel: levelId + 1,
      updatedAt: serverTimestamp(),
    };

    if (badge) {
      updates.badges = arrayUnion(badge);
    }
    
    if (userProfileRef) {
      if (!firestoreData) {
        setDoc(userProfileRef, {
          id: user?.uid,
          coins: reward,
          exp: expReward,
          score: scoreReward,
          completedLevels: [levelId],
          unlockedLevels: [0, levelId + 1],
          currentLevel: levelId + 1,
          badges: badge ? [badge] : [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        }, { merge: true });
      } else {
        setDoc(userProfileRef, updates, { merge: true });
      }
    } else {
      const newProgress = {
        ...localProgress,
        coins: localProgress.coins + reward,
        exp: localProgress.exp + expReward,
        score: localProgress.score + scoreReward,
        completedLevels: Array.from(new Set([...localProgress.completedLevels, levelId])),
        unlockedLevels: Array.from(new Set([...localProgress.unlockedLevels, levelId + 1])),
        badges: badge ? Array.from(new Set([...localProgress.badges, badge])) : localProgress.badges,
        currentLevel: levelId + 1
      };
      setLocalProgress(newProgress);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
    }
  }, [progress.completedLevels, userProfileRef, firestoreData, user, localProgress]);

  return { 
    progress, 
    loading, 
    completeLevel, 
    isLoggedIn: !!user,
    isTrained: progress.completedLevels.includes(0)
  };
}
