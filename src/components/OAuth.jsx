import React from 'react';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'react-toastify';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../Firebase';
import { useNavigate } from 'react-router';

const OAuth = () => {
  const navigate = useNavigate();
  const onGoogleClick = async () => {
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      //Check user
      const docRef = doc(db, 'users', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          name: user.displayName,
          email: user.email,
          timestamp: serverTimestamp(),
        });
      }
      navigate('/');
    } catch (error) {
      toast.error('Could not authorize with Google');
    }
  };

  return (
    <div>
      <button
        onClick={onGoogleClick}
        className="flex items-center justify-center w-full bg-red-600 text-white px-7 py-3 rounded-md text-sm font-medium uppercase shadow-md hover:bg-red-700 transition duration-150 ease-in-out hover:shadow-lg active:bg-red-800"
        type="button"
      >
        <FcGoogle className="text-2xl bg-white rounded-full mr-2" />
        Continue With Google
      </button>
    </div>
  );
};

export default OAuth;
