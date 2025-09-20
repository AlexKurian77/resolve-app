

import { Redirect, router } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../firebaseConfig';
import '../global.css';

export default function Index() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/HomeScreen");
        
      } else {
        router.replace("/LoginScreen");
      }
    });

    return unsubscribe;
  }, []);
}
