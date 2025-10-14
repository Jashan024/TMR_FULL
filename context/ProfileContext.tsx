

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';

interface ProfileContextType {
  profile: UserProfile | null;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  isProfileCreated: boolean;
  loading: boolean;
  error: string | null;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// This mock data is a fallback for when Supabase isn't configured.
const fallbackProfile: UserProfile = {
    id: 'fallback-user',
    photo_url: '',
    name: "Alex Doe",
    title: "Senior Frontend Engineer",
    industry: 'IT',
    experience: '8',
    roles: ["Frontend Developer", "Full-Stack Developer", "UI/UX Designer"],
    location: "Remote, USA",
    skills: ["React", "TypeScript", "Node.js", "Figma", "Tailwind CSS", "UI/UX Design", "Next.js"],
    bio: "Passionate Senior Frontend Engineer with over 8 years of experience building beautiful, responsive, and user-centric web applications. My goal is to create interfaces that are not only functional but also a delight to use.",
    certifications: ["AWS Certified Developer"],
    portfolio_url: 'https://example.com',
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isProfileCreated = !!profile?.name; // Check for a key field like name

  useEffect(() => {
    // If Supabase is not configured, use fallback data and exit.
    if (!supabase) {
        setProfile(fallbackProfile);
        setLoading(false);
        return;
    }

    // In Supabase v2, `onAuthStateChange` returns an object containing the subscription.
    const authListener = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
            setLoading(true);
            setError(null);
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116: row not found
                console.error("Error fetching profile:", error);
                setError('Failed to fetch profile.');
            } else {
                setProfile(data);
            }
        } else {
            setProfile(null);
        }
        setLoading(false);
    });

    return () => {
        // FIX: The unsubscribe method is on the subscription object, nested inside the returned listener object in Supabase v2.
        authListener.data.subscription?.unsubscribe();
    };
  }, []);
  
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      if (!supabase) {
          console.warn("Supabase not configured. Simulating profile update.");
          const updatedProfile = { ...(profile || fallbackProfile), ...profileData };
          setProfile(updatedProfile);
          return updatedProfile;
      }

      // FIX: The `user()` method is from Supabase v1; v2 uses `getUser()` which returns a promise.
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const updatePayload = {
          id: user.id,
          ...profileData,
      };

      const { data, error } = await supabase
          .from('profiles')
          .upsert(updatePayload)
          .select()
          .single();

      if (error) {
          console.error("Error updating profile:", error);
          throw error;
      }

      setProfile(data);
      return data;
  };

  const contextValue = {
    profile,
    updateProfile,
    isProfileCreated,
    loading,
    error,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = (): ProfileContextType => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};