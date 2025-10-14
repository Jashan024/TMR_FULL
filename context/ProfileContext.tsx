import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import type { UserProfile } from '../types';

interface ProfileContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  isProfileCreated: boolean;
  loading: boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// This mock data would be replaced by a real API response.
const mockProfile: UserProfile = {
    photoUrl: '',
    name: "Alex Doe",
    title: "Senior Frontend Engineer",
    industry: 'IT',
    experience: '8',
    roles: ["Frontend Developer", "Full-Stack Developer", "UI/UX Designer"],
    location: "Remote, USA",
    skills: ["React", "TypeScript", "Node.js", "Figma", "Tailwind CSS", "UI/UX Design", "Next.js"],
    bio: "Passionate Senior Frontend Engineer with over 8 years of experience building beautiful, responsive, and user-centric web applications. My goal is to create interfaces that are not only functional but also a delight to use.",
    certifications: [],
    portfolioUrl: '',
};

export const ProfileProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true); // Start in a loading state
  
  const isProfileCreated = profile !== null;

  // Simulate fetching data from a backend API on component mount
  useEffect(() => {
    setLoading(true);
    // In a real app, this would be an API call, e.g., fetch('/api/user/profile')
    const fetchProfile = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500)); 
        // On successful fetch, set the profile. For now, we use mock data.
        // If there was no user logged in, this would remain null.
        // For the demo, we assume the user is "logged in" and has a profile.
        setProfile(mockProfile); 
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Handle error state, maybe show a toast notification
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const contextValue = {
    profile,
    setProfile,
    isProfileCreated,
    loading,
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
