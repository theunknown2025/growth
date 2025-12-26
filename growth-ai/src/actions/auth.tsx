'use client';

import axios, { endpoints } from '@/utils/axios';

import { setSession } from '@/utils/auth/sessions';
import { STORAGE_KEY } from '@/constant/auth';

// ----------------------------------------------------------------------

export type SignInParams = {
  email: string;
  password: string;
};

export type SignUpParams = {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  confirmpassword: string;
};

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }: SignInParams): Promise<void> => {
  try {
    const params = { email, password };

    const res = await axios.post(endpoints.auth.signIn, params);

    const { token } = res.data;

    if (!token) {
      throw new Error('Access token not found in response');
    }

    setSession(token);
  } catch (error) {
    console.log('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({
  firstName,
  lastName,
  username,
  email,
  password,
  confirmpassword
}: SignUpParams): Promise<void> => {
  const params = {
    firstName,
    lastName,
    username,
    email,
    password,
    confirmpassword
  };

  try {
    console.log('Sign up params:', params); // Log the parameters being sent
    const res = await axios.post(endpoints.auth.signUp, params);

    const { token } = res.data;
    return token;
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async (): Promise<void> => {
  try {
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    throw error;
  }
};

