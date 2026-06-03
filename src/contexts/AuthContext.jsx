import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId) => {
    try {
      // 1. Get primary user profile with role
      const { data: userProfile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('Error fetching primary user profile, trying to create fallback or check role:', profileError);
        // If profile doesn't exist, we might need to recreate it if auth user exists
        return null;
      }

      // 2. Get specific role details (seller or creator)
      let roleDetails = null;
      if (userProfile.role === 'seller') {
        const { data, error } = await supabase
          .from('sellers')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error) roleDetails = data;
      } else if (userProfile.role === 'creator') {
        const { data, error } = await supabase
          .from('creators')
          .select('*')
          .eq('id', userId)
          .single();
        if (!error) roleDetails = data;
      }

      // 3. Get wallet balance
      let wallet = null;
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (!walletError) {
        wallet = walletData;
      }

      return {
        ...userProfile,
        details: roleDetails,
        wallet: wallet
      };
    } catch (err) {
      console.error('Error fetching complete user profile:', err);
      return null;
    }
  };

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id).then((prof) => {
          setProfile(prof);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setLoading(true);
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email, password, role, additionalData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('Signup failed: user not returned');

      const userId = data.user.id;

      // Create primary user profile entry
      const { error: profileError } = await supabase
        .from('users')
        .insert([{ id: userId, email, role }]);

      if (profileError) {
        console.error('Failed to create users record:', profileError);
        throw profileError;
      }

      // Create specific role details entry
      if (role === 'seller') {
        const { error: sellerError } = await supabase
          .from('sellers')
          .insert([{
            id: userId,
            company_name: additionalData.companyName || '',
            website: additionalData.website || ''
          }]);
        if (sellerError) {
          console.error('Failed to create sellers record:', sellerError);
          throw sellerError;
        }
      } else {
        const { error: creatorError } = await supabase
          .from('creators')
          .insert([{
            id: userId,
            full_name: additionalData.fullName || '',
            handle: additionalData.handle || '',
            bio: additionalData.bio || ''
          }]);
        if (creatorError) {
          console.error('Failed to create creators record:', creatorError);
          throw creatorError;
        }
      }

      // Create wallet entry
      const { error: walletError } = await supabase
        .from('wallets')
        .insert([{
          user_id: userId,
          balance: 0,
          pending_balance: 0
        }]);
      if (walletError) {
        console.warn('Could not initialize wallet:', walletError);
      }

      // Trigger profile refresh
      const prof = await fetchProfile(userId);
      setProfile(prof);
      setUser(data.user);
      return { user: data.user, profile: prof };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signIn = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      const prof = await fetchProfile(data.user.id);
      setProfile(prof);
      setUser(data.user);
      return { user: data.user, profile: prof };
    } catch (err) {
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setLoading(false);
  };

  const refreshProfile = async () => {
    if (user) {
      const prof = await fetchProfile(user.id);
      setProfile(prof);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
