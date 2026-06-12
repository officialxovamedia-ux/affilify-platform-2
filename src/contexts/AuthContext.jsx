import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (authUid) => {
    try {
      const { data: userProfile, error: userError } = await supabase
        .from('users')
        .select('id, auth_id, email, full_name, role, status, rejection_reason, reapply_after, created_at')
        .eq('auth_id', authUid)
        .single();

      if (userError || !userProfile) {
        console.warn('fetchProfile: users row not found:', userError);
        return null;
      }

      const usersId = userProfile.id;

      let roleDetails = null;

      if (userProfile.role === 'seller') {
        const { data, error } = await supabase
          .from('sellers')
          .select('id, user_id, brand_name, website, category, verified, status, created_at')
          .eq('user_id', usersId)
          .single();
        if (!error && data) roleDetails = data;
      } else if (userProfile.role === 'creator') {
        const { data, error } = await supabase
          .from('creators')
          .select('id, user_id, handle, niche, platform, follower_count, commission_rate, verified, status, created_at')
          .eq('user_id', usersId)
          .single();
        if (!error && data) roleDetails = data;
      }

      let wallet = null;
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('id, user_id, balance, pending_balance, total_earned, total_withdrawn, currency')
        .eq('user_id', usersId)
        .single();
      if (!walletError && walletData) wallet = walletData;

      return {
        ...userProfile,
        details: roleDetails,
        wallet,
      };
    } catch (err) {
      console.error('fetchProfile: unexpected error:', err);
      return null;
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        const prof = await fetchProfile(session.user.id);
        setProfile(prof);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
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
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password, role, additionalData = {}) => {
    setLoading(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role: role,
            full_name: additionalData.fullName || '',
          },
        },
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('signUp: auth user not returned');

      const authUid = data.user.id;

      let usersRow = null;
      for (let attempt = 0; attempt < 5; attempt++) {
        await new Promise((r) => setTimeout(r, 500));
        const { data: row } = await supabase
          .from('users')
          .select('id, status')
          .eq('auth_id', authUid)
          .single();
        if (row) { usersRow = row; break; }
      }

      if (!usersRow) {
        throw new Error('signUp: users row not created by trigger');
      }

      const usersId = usersRow.id;

      if (role === 'seller') {
        const { error: sellerError } = await supabase
          .from('sellers')
          .insert([{
            user_id:    usersId,
            brand_name: additionalData.brandName || '',
            website:    additionalData.website   || '',
            category:   additionalData.category  || '',
          }]);
        if (sellerError) throw sellerError;

      } else if (role === 'creator') {
        const { error: creatorError } = await supabase
          .from('creators')
          .insert([{
            user_id:        usersId,
            handle:         additionalData.handle        || '',
            niche:          additionalData.niche         || '',
            platform:       additionalData.platform      || '',
            follower_count: additionalData.followerCount || 0,
          }]);
        if (creatorError) throw creatorError;
      }

      const { error: walletError } = await supabase
        .from('wallets')
        .insert([{
          user_id:         usersId,
          balance:         0,
          pending_balance: 0,
          total_earned:    0,
          total_withdrawn: 0,
          currency:        'BDT',
        }]);
      if (walletError) {
        console.warn('signUp: wallet creation failed:', walletError);
      }

      const prof = await fetchProfile(authUid);
      setProfile(prof);
      setUser(data.user);
      setLoading(false);
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
      setLoading(false);
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
    if (!user) return;
    const prof = await fetchProfile(user.id);
    setProfile(prof);
    return prof;
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signUp, signIn, signOut, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};