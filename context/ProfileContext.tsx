import React, { createContext, useState, useContext, ReactNode, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserProfile } from '../types';
import { supabase } from '../lib/supabaseClient';
import type { Session } from '@supabase/supabase-js';

interface ProfileContextType {
  session: Session | null;
  profile: UserProfile | null;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => Promise<void>;
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
  const navigate = useNavigate();
  
  const isProfileCreated = !!profile?.name; // Check for a key field like name

  useEffect(() => {
    // If Supabase is not configured, use fallback data and exit.
    if (!supabase) {
        setProfile(fallbackProfile);
        setLoading(false);
        return;
    }

    // Set loading to true initially to cover the first session check.
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);

        if (newSession) {
            setError(null);
            try {
                const { data, error: fetchError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', newSession.user.id)
                    .single();

                if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116: row not found
                    throw fetchError;
                }
                
                if (data) {
                    setProfile(data);
                } else {
                    // Profile not found, check if it's a new recruiter
                    if (newSession.user?.user_metadata?.role === 'recruiter') {
                        const { data: newProfile, error: insertError } = await supabase
                            .from('profiles')
                            .insert({
                                id: newSession.user.id,
                                name: newSession.user.user_metadata.full_name || 'Recruiter',
                                role: 'recruiter',
                            })
                            .select()
                            .single();
                        
                        if (insertError) throw insertError;
                        setProfile(newProfile);
                    } else {
                        setProfile(null); // It's likely a new candidate, direct to onboarding
                    }
                }
            } catch (error) {
                console.error("Error processing auth state:", error);
                setError('Failed to fetch or create profile.');
                setProfile(null);
            }
        } else {
            setProfile(null);
        }
        // Always set loading to false after processing the session change.
        setLoading(false);
    });

    return () => {
        authListener?.subscription.unsubscribe();
    };
  }, []);
  
  const updateProfile = useCallback(async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!supabase) {
        console.warn("Supabase not configured. Simulating profile update.");
        return new Promise(resolve => {
          setProfile(prevProfile => {
            const updated = { ...(prevProfile || fallbackProfile), ...profileData } as UserProfile;
            resolve(updated);
            return updated;
          });
        });
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    const updatePayload = {
        id: user.id,
        ...profileData,
    };

    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(updatePayload);

    if (upsertError) {
        console.error("Error upserting profile:", upsertError);
        throw upsertError;
    }

    // Optimistically update the local state. This makes the UI feel faster
    // and avoids potential issues with RLS policies that might block a
    // subsequent SELECT query. The `onAuthStateChange` listener will eventually
    // sync the profile if the user reloads or logs back in.
    const updatedProfile = {
      ...(profile || {}),
      ...updatePayload,
     } as UserProfile;

    setProfile(updatedProfile);
    return updatedProfile;
}, [profile]);

  const logout = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase not configured. Cannot log out.");
    } else {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Error logging out:', error.message);
      }
    }
    // The onAuthStateChange listener will clear the profile state.
    // We manually navigate to ensure the user is redirected immediately.
    navigate('/auth');
  }, [navigate]);

  const contextValue = {
    session,
    profile,
    updateProfile,
    logout,
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