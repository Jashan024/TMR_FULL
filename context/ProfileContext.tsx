

import React, { createContext, useState, useContext, ReactNode, useEffect, useRef } from 'react';
import type { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface ProfileContextType {
  session: Session | null;
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
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use a ref to track the current user ID to avoid stale closures and unnecessary loading state changes.
  const currentUserIdRef = useRef<string | null>(null);
  
  const isProfileCreated = !!profile?.name; // Check for a key field like name

  useEffect(() => {
    // If Supabase is not configured, use fallback data and exit.
    if (!supabase) {
        setProfile(fallbackProfile);
        setLoading(false);
        return;
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        const newUserId = newSession?.user?.id ?? null;

        // Only trigger a full loading state if the user's identity has actually changed (login/logout).
        // This prevents loading spinners on non-critical events like token refreshes.
        if (newUserId !== currentUserIdRef.current) {
            setLoading(true);
        }

        setSession(newSession);
        currentUserIdRef.current = newUserId;

        if (newSession) {
            setError(null);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', newSession.user.id)
                    .single();

                if (error && error.code !== 'PGRST116') { // PGRST116: row not found
                    throw error;
                }
                setProfile(data);
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError('Failed to fetch profile.');
                setProfile(null);
            }
        } else {
            setProfile(null);
        }
        setLoading(false);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const updateProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
      if (!supabase) {
          console.warn("Supabase not configured. Simulating profile update.");
          const updatedProfile = { ...(profile || fallbackProfile), ...profileData };
          setProfile(updatedProfile);
          return updatedProfile;
      }

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
    session,
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