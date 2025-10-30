
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
    // FIX: Added missing 'role' property to satisfy the UserProfile type.
    role: 'candidate',
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
<<<<<<< HEAD
  // Local storage keys for persistence across refreshes
  const PROFILE_STORAGE_KEY = 'tmr_profile_cache_v1';
  const SESSION_PRIME_DONE = useRef(false);
  
  const isProfileCreated = !!profile?.name; // Check for a key field like name

  useEffect(() => {
    // 1) Attempt fast rehydration from localStorage to avoid UI flashes on refresh
    try {
        const cached = localStorage.getItem(PROFILE_STORAGE_KEY);
        if (cached) {
            const parsed = JSON.parse(cached) as UserProfile;
            setProfile(parsed);
        }
    } catch (_) { /* ignore cache errors */ }

    // If Supabase is not configured, use fallback data and exit.
    if (!supabase) {
        if (!profile) setProfile(fallbackProfile);
=======
  const isProfileCreated = !!profile?.name; // Check for a key field like name

  useEffect(() => {
    // If Supabase is not configured, use fallback data and exit.
    if (!supabase) {
        setProfile(fallbackProfile);
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
        setLoading(false);
        return;
    }

<<<<<<< HEAD
    // 2) Prime the session immediately on mount (prevents "forgotten user" on hard refresh)
    (async () => {
        try {
            const { data: { session: initialSession } } = await supabase.auth.getSession();
            setSession(initialSession);
            if (initialSession && !SESSION_PRIME_DONE.current) {
                // Fetch profile once during initial prime
                try {
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', initialSession.user.id)
                        .single();
                    if (!error) {
                        setProfile(data as UserProfile);
                        try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
                    }
                } catch (_) { /* swallow; auth listener below will handle */ }
                SESSION_PRIME_DONE.current = true;
            }
        } catch (_) { /* ignore */ }
        finally {
            // Keep loading until auth listener resolves; prevents flicker
            // We won't set loading false here; the listener will do it deterministically
        }
    })();

=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
    // Set loading to true initially to cover the first session check.
    setLoading(true);

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);

        if (newSession) {
            // Handle auto-profile creation for new recruiters
            const isNewUser = _event === 'SIGNED_IN' && newSession.user.created_at && (new Date().getTime() - new Date(newSession.user.created_at).getTime()) < 60000;
            const isRecruiter = newSession.user.user_metadata.role === 'recruiter';
            
            if (isNewUser && isRecruiter) {
                try {
                    // Check if a profile already exists to avoid race conditions
                    const { data: existingProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('id', newSession.user.id)
                        .single();

                    if (!existingProfile) {
                        const { error: upsertError } = await supabase
                            .from('profiles')
                            .upsert({
                                id: newSession.user.id,
                                name: newSession.user.user_metadata.full_name || 'Recruiter',
                                role: 'recruiter',
                                title: 'Recruiter',
                                industry: '', experience: '0', location: '', bio: '',
                                skills: [], roles: [], certifications: [], portfolio_url: '', photo_url: ''
                            });
                        if (upsertError) throw upsertError;
                    }
                } catch (error) {
                    console.error("Failed to auto-create recruiter profile:", error);
                    setError("Failed to initialize your recruiter account.");
                }
            }
            
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
<<<<<<< HEAD
                try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data)); } catch (_) {}
=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
            } catch (error) {
                console.error("Error fetching profile:", error);
                setError('Failed to fetch profile.');
                setProfile(null);
<<<<<<< HEAD
                try { localStorage.removeItem(PROFILE_STORAGE_KEY); } catch (_) {}
            }
        } else {
            setProfile(null);
            try { localStorage.removeItem(PROFILE_STORAGE_KEY); } catch (_) {}
=======
            }
        } else {
            setProfile(null);
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
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
    
    // If the profile doesn't exist yet in our state, this is likely an INSERT.
    // We create a base profile to ensure `NOT NULL` constraints are met.
    // This is crucial for the first-time update, e.g., when only a photo is uploaded.
    const baseProfile = profile ? {} : {
        name: '', title: '', industry: '', experience: '0', location: '',
        bio: '', skills: [], roles: [], certifications: [], portfolio_url: '',
        photo_url: '', role: 'candidate'
    };

    const updatePayload = {
        ...baseProfile,
        ...profile,
        ...profileData,
        id: user.id,
    };


    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(updatePayload);

    if (upsertError) {
        console.error("Error upserting profile:", upsertError);
        throw upsertError;
    }

    // Optimistically update the local state. This makes the UI feel faster.
    const updatedProfile = {
      ...(profile || {}),
      ...updatePayload, // Use updatePayload as it contains the merged data
     } as UserProfile;

    setProfile(updatedProfile);
<<<<<<< HEAD
    try { localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile)); } catch (_) {}
=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
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
<<<<<<< HEAD
    try { localStorage.removeItem(PROFILE_STORAGE_KEY); } catch (_) {}
=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
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
