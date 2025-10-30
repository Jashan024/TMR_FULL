<<<<<<< HEAD
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { LinkIcon, PencilIcon, ShareIcon, CheckCircleIcon, EnvelopeIcon } from '../components/Icons';
=======
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { LinkIcon, PencilIcon, ShareIcon, CheckCircleIcon, BriefcaseIcon } from '../components/Icons';
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
import { supabase } from '../lib/supabaseClient';
import type { UserProfile } from '../types';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
    </div>
);

<<<<<<< HEAD
=======
const RecruiterAuthGate: React.FC<{ isOpen: boolean; profileName?: string | null; profileTitle?: string | null; }> = ({ isOpen, profileName, profileTitle }) => {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4 backdrop-blur-sm">
        <div 
          className="bg-gray-800/80 rounded-2xl shadow-xl w-full max-w-lg relative border border-gray-700 animate-fade-in-up p-8 text-center"
        >
          <div className="flex justify-center mb-6">
              <BriefcaseIcon className="w-16 h-16 text-cyan-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">
            View Candidate Profile
          </h2>
          {profileName && (
              <div className="mb-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <p className="font-semibold text-lg text-gray-100">{profileName}</p>
                  <p className="text-gray-400">{profileTitle}</p>
              </div>
          )}
          <p className="text-gray-300 mb-8">
            To protect our candidates' privacy, please sign in or create an account to view the full profile.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button to="/auth?role=recruiter&view=signin" variant="secondary" className="w-full sm:w-auto">
                  Sign In
              </Button>
              <Button to="/auth?role=recruiter&view=signup" variant="primary" className="w-full sm:w-auto">
                  Create Recruiter Account
              </Button>
          </div>
          <div className="mt-8">
              <Link to="/" className="text-sm text-gray-400 hover:text-white hover:underline">Not a recruiter? Go back home.</Link>
          </div>
        </div>
      </div>
    );
};


>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

<<<<<<< HEAD
  // Clean the userId to remove any trailing backslashes or invalid characters
  const cleanUserId = userId?.replace(/\\+$/, '').trim();

=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
  // Logged-in user's data from context
  const { session, profile, isProfileCreated, loading: authUserLoading, error: authUserError } = useProfile();
  
  // State for publicly fetched profile
  const [publicProfile, setPublicProfile] = useState<UserProfile | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);
<<<<<<< HEAD
=======
  const [showRecruiterGate, setShowRecruiterGate] = useState(false);
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55

  // State for share button
  const [copied, setCopied] = useState(false);
  
<<<<<<< HEAD
  // Ref to track if we've fetched this profile to prevent infinite loops
  const fetchedProfileId = useRef<string | null>(null);
  
  const isMyProfile = cleanUserId === 'me' || (session && profile && cleanUserId === profile.id);
  const profileAlreadyLoaded = !pageLoading && (isMyProfile ? !!profile : (!!publicProfile && publicProfile.id === cleanUserId));

  useEffect(() => {
    // Reset states when userId changes
    if (cleanUserId !== fetchedProfileId.current) {
      setPublicProfile(null);
      setPageError(null);
      fetchedProfileId.current = null;
    }

    const fetchPublicProfile = async (id: string) => {
        console.log('Starting to fetch public profile for ID:', id);
        setPageLoading(true);
        setPageError(null);
        fetchedProfileId.current = id;
=======
  const isMyProfile = userId === 'me' || (session && profile && userId === profile.id);
  const profileAlreadyLoaded = !pageLoading && (isMyProfile ? !!profile : (!!publicProfile && publicProfile.id === userId));

  useEffect(() => {
    const fetchPublicProfile = async (id: string) => {
        setPageLoading(true);
        setPageError(null);
        setShowRecruiterGate(false);
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55

        if (!supabase) {
            setPageError("Application is not connected to a backend service.");
            setPageLoading(false);
            return;
        }

        try {
<<<<<<< HEAD
            console.log('Starting to fetch public profile for ID:', id);
=======
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

<<<<<<< HEAD
            console.log('Supabase response:', { profileData, profileError });
            
            if (profileError || !profileData) {
                console.log('Profile error details:', profileError);
                if(profileError?.code === 'PGRST116') throw new Error('Profile not found.');
                throw profileError || new Error('Profile not found.');
            }
            console.log('Public profile fetched successfully:', profileData);
            setPublicProfile(profileData);
            setPageLoading(false);

        } catch (error: any) {
            console.error('Error fetching public profile:', error);
            setPageError(error.message || 'Failed to load profile.');
=======
            if (profileError || !profileData) {
                if(profileError?.code === 'PGRST116') throw new Error('Profile not found.'); // row not found
                throw profileError || new Error('Profile not found.');
            }
            setPublicProfile(profileData);

            // If visitor is not logged in, show the gate and stop.
            if (!session) {
                sessionStorage.setItem('redirectUrl', window.location.href);
                setShowRecruiterGate(true);
                return;
            }

        } catch (error: any) {
            setPageError(error.message || 'Failed to load profile.');
        } finally {
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
            setPageLoading(false);
        }
    };
    
<<<<<<< HEAD
    // Handle different scenarios
    if (cleanUserId === 'me') {
        // Viewing own profile - use context data
        if (!authUserLoading) {
            setPageLoading(false);
            if (!session) {
                navigate('/auth');
            } else if (session && !isProfileCreated) {
=======
    if (profileAlreadyLoaded) {
      return;
    }

    if (userId === 'me' && !authUserLoading && !session) {
        navigate('/auth');
        return;
    }

    if (isMyProfile) {
        // Viewing our own profile. We can use context data.
        if (!authUserLoading) {
            setPageLoading(false);
            if (session && !isProfileCreated) {
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
                navigate('/onboarding');
            } else if (authUserError) {
                setPageError(authUserError);
            }
        }
<<<<<<< HEAD
    } else if (cleanUserId && cleanUserId !== 'me') {
        // Viewing someone else's profile - fetch from database
        // Only fetch if we haven't already fetched this profile
        if (fetchedProfileId.current !== cleanUserId) {
            console.log('Need to fetch profile for userId:', cleanUserId);
            fetchPublicProfile(cleanUserId);
        } else {
            console.log('Profile already fetched for userId:', cleanUserId);
            setPageLoading(false);
        }
=======
    } else if (userId) {
        // Viewing someone else's profile. Fetch the data.
        fetchPublicProfile(userId);
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
    } else {
        setPageError("Invalid profile URL.");
        setPageLoading(false);
    }

<<<<<<< HEAD
  }, [cleanUserId]); // Only depend on cleanUserId
  
  const handleContactCandidate = () => {
    // Since messaging is coming soon, show an alert or redirect
    alert('Messaging feature is coming soon! You will be able to contact candidates directly through our platform.');
  };
  
  const handleShare = () => {
    const profileToShare = isMyProfile ? profile : publicProfile;
    if (!profileToShare) return;
    
    const shareUrl = `${window.location.origin}/#/profile/${profileToShare.id}`;
=======
  }, [userId, isMyProfile, authUserLoading, session, isProfileCreated, authUserError, navigate, profileAlreadyLoaded]);
  
  const handleShare = () => {
    if (!profile) return;
    const shareUrl = `${window.location.origin}/#/profile/${profile.id}`;
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const profileToDisplay = isMyProfile ? profile : publicProfile;

  const isLoading = pageLoading || (isMyProfile && authUserLoading);
<<<<<<< HEAD
  
  // Debug logging
  console.log('PublicProfilePage Debug:', {
    userId,
    cleanUserId,
    isMyProfile,
    pageLoading,
    authUserLoading,
    isLoading,
    profileToDisplay: !!profileToDisplay,
    publicProfile: !!publicProfile,
    profile: !!profile
  });

  if (pageError) {
      return <div className="text-center p-10 text-red-400">{pageError}</div>;
  }
  
  // Always show loading spinner if no profile is available yet
  if (!profileToDisplay) {
=======

  if (isLoading) {
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <LoadingSpinner />
        </div>
    );
  }
<<<<<<< HEAD
  

  return (
    <>
      <div className="py-12 sm:py-16 transition-all duration-300">
=======

  if (pageError && !showRecruiterGate) {
      return <div className="text-center p-10 text-red-400">{pageError}</div>;
  }
  
  if (!profileToDisplay && !showRecruiterGate) {
    return <div className="text-center p-10">Profile not found.</div>;
  }

  // To prevent flash of content before gate appears, if gate is to be shown, don't render profile yet.
  if (showRecruiterGate && !profileToDisplay) {
    return (
        <>
            <RecruiterAuthGate isOpen={true} />
            <div className="container mx-auto px-6 max-w-4xl blur-md pointer-events-none"><LoadingSpinner /></div>
        </>
    );
  }

  return (
    <>
      <RecruiterAuthGate 
        isOpen={showRecruiterGate} 
        profileName={profileToDisplay?.name}
        profileTitle={profileToDisplay?.title}
      />
      <div className={`py-12 sm:py-16 transition-all duration-300 ${showRecruiterGate ? 'blur-md pointer-events-none' : ''}`}>
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
        <div className="container mx-auto px-6 max-w-4xl animate-fade-in-up">
            {profileToDisplay && (
                <main>
                {/* Header Section */}
                <section className="relative mb-12">
<<<<<<< HEAD
                  <div className="sm:absolute sm:top-0 sm:right-0 mb-6 sm:mb-0 flex flex-col sm:flex-row gap-3">
                    {/* Show different buttons based on who's viewing */}
                    {isMyProfile ? (
                      // User viewing their own profile - show Share and Edit
                      <>
=======
                  {isMyProfile && (
                    <div className="sm:absolute sm:top-0 sm:right-0 mb-6 sm:mb-0 flex flex-col sm:flex-row gap-3">
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
                        <Button onClick={handleShare} variant="secondary" className="px-4 py-2 w-full sm:w-auto">
                          {copied ? <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" /> : <ShareIcon className="w-4 h-4 mr-2" />}
                          {copied ? 'Link Copied!' : 'Share Profile'}
                        </Button>
                        <Button to="/onboarding" variant="outline" className="px-4 py-2 w-full sm:w-auto">
<<<<<<< HEAD
                          <PencilIcon className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </>
                    ) : (
                      // Recruiter viewing candidate profile - show Contact button
                      <div className="relative">
                        <Button onClick={handleContactCandidate} variant="primary" className="px-4 py-2 w-full sm:w-auto">
                          <EnvelopeIcon className="w-4 h-4 mr-2" />
                          Contact Candidate
                        </Button>
                        <span className="absolute -top-1.5 -right-6 bg-cyan-900/80 text-cyan-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-cyan-700">
                          SOON
                        </span>
                      </div>
                    )}
                  </div>
=======
                            <PencilIcon className="w-4 h-4 mr-2" />
                            Edit Profile
                        </Button>
                    </div>
                  )}
>>>>>>> ddcb63df18a76fed3b049892bb3661ef66dbbc55
                  <div className="text-center">
                      {profileToDisplay.photo_url ? (
                          <img src={profileToDisplay.photo_url} alt={profileToDisplay.name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-600" />
                      ) : (
                          <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-5xl font-bold text-cyan-400 mx-auto border-4 border-gray-600">
                              {profileToDisplay.name?.charAt(0)}
                          </div>
                      )}
                      <h1 className="text-4xl font-bold text-white mt-4">{profileToDisplay.name}</h1>
                      <p className="text-xl text-gray-300">{profileToDisplay.title}</p>
                      {profileToDisplay.portfolio_url && (
                           <a href={profileToDisplay.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
                               <LinkIcon className="w-5 h-5 mr-2" />
                               <span>Portfolio / Website</span>
                           </a>
                      )}
                  </div>
                </section>
      
                {/* Bio Section */}
                 <Card className="mb-8">
                      <h2 className="text-2xl font-semibold text-white mb-3">About Me</h2>
                      <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{profileToDisplay.bio}</p>
                 </Card>
      
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* LEFT COLUMN */}
                  <div className="md:col-span-1 space-y-8">
                      <Card>
                        <h2 className="text-xl font-semibold text-white mb-4">Preferences</h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-400">Location</h3>
                            <p className="text-gray-200">{profileToDisplay.location}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400">Open to Roles</h3>
                            <ul className="list-disc list-inside text-gray-200 space-y-1 mt-1">
                              {(profileToDisplay.roles || []).map(role => <li key={role}>{role}</li>)}
                            </ul>
                          </div>
                        </div>
                      </Card>
                      <Card>
                        <h2 className="text-xl font-semibold text-white mb-4">Experience</h2>
                        <div className="space-y-4">
                          <div>
                            <h3 className="text-sm font-medium text-gray-400">Industry</h3>
                            <p className="text-gray-200">{profileToDisplay.industry}</p>
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-400">Years of Experience</h3>
                            <p className="text-gray-200">{profileToDisplay.experience} years</p>
                          </div>
                        </div>
                      </Card>
                  </div>
      
                  {/* RIGHT COLUMN */}
                  <div className="md:col-span-2 space-y-8">
                       <Card>
                        <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
                        <div className="flex flex-wrap gap-2">
                          {(profileToDisplay.skills || []).map(skill => (
                            <span key={skill} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-md">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </Card>
                       <Card>
                        <h2 className="text-xl font-semibold text-white mb-4">Certifications & Licenses</h2>
                        <div className="flex flex-wrap gap-2">
                          {(profileToDisplay.certifications || []).length > 0 ? (profileToDisplay.certifications || []).map(cert => (
                            <span key={cert} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-transform hover:scale-105">
                              {cert}
                            </span>
                          )) : <p className="text-gray-400 text-sm">No certifications listed.</p>}
                        </div>
                      </Card>
                  </div>
                </div>
              </main>
            )}
        </div>
      </div>
    </>
  );
};