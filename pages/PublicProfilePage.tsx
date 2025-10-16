import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useDocuments } from '../context/DocumentContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { LinkIcon, PencilIcon, EyeIcon, DocumentIcon, ShareIcon, CheckCircleIcon } from '../components/Icons';
import { supabase } from '../lib/supabaseClient';
import type { UserProfile, DocumentFile } from '../types';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
    </div>
);

export const PublicProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  // Logged-in user's data from context
  const { session, profile, isProfileCreated, loading: authUserLoading, error: authUserError } = useProfile();
  const { documents: authUserDocuments } = useDocuments();
  
  // State for publicly fetched profile
  const [publicProfile, setPublicProfile] = useState<UserProfile | null>(null);
  const [publicDocuments, setPublicDocuments] = useState<DocumentFile[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  // State for share button
  const [copied, setCopied] = useState(false);
  
  const isMyProfile = userId === 'me' || (session && profile && userId === profile.id);

  useEffect(() => {
    const fetchPublicProfile = async (id: string) => {
        setPageLoading(true);
        setPageError(null);
        try {
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single();

            if (profileError || !profileData) {
                if(profileError?.code === 'PGRST116') throw new Error('Profile not found.'); // row not found
                throw profileError || new Error('Profile not found.');
            }
            setPublicProfile(profileData);

            const { data: docRecords, error: docError } = await supabase
                .from('documents')
                .select('*')
                .eq('user_id', id)
                .eq('visibility', 'public');
            
            if (docError) throw docError;

            const enhancedDocs = await Promise.all(
              (docRecords || []).map(async (doc) => {
                const { data: urlData } = supabase.storage.from('documents').getPublicUrl(doc.file_path);
                return { ...doc, public_url: urlData.publicUrl };
              })
            );
            setPublicDocuments(enhancedDocs);

        } catch (error: any) {
            setPageError(error.message || 'Failed to load profile.');
        } finally {
            setPageLoading(false);
        }
    };
    
    if (isMyProfile) {
        // Viewing our own profile. We can use context data.
        if (!authUserLoading) {
            setPageLoading(false);
            if (session && !isProfileCreated) {
                navigate('/onboarding');
            } else if (authUserError) {
                setPageError(authUserError);
            }
        }
    } else if (userId) {
        // Viewing someone else's profile. Fetch the data.
        fetchPublicProfile(userId);
    } else {
        setPageError("Invalid profile URL.");
        setPageLoading(false);
    }

  }, [userId, isMyProfile, authUserLoading, session, isProfileCreated, authUserError, navigate]);
  
  const handleShare = () => {
    if (!profile) return;
    const shareUrl = `https://thatsmyrecruiter.com/#/profile/${profile.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const profileToDisplay = isMyProfile ? profile : publicProfile;
  const documentsToDisplay = isMyProfile 
    ? authUserDocuments.filter(doc => doc.visibility === 'public') 
    : publicDocuments;

  const isLoading = pageLoading || (isMyProfile && authUserLoading);

  if (isLoading) {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <LoadingSpinner />
        </div>
    );
  }

  if (pageError) {
      return <div className="text-center p-10 text-red-400">{pageError}</div>;
  }
  
  if (!profileToDisplay) {
    return <div className="text-center p-10">Profile not found.</div>;
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto px-6 max-w-4xl animate-fade-in-up">
        <main>
          {/* Header Section */}
          <section className="relative mb-12">
            {isMyProfile && (
              <div className="sm:absolute sm:top-0 sm:right-0 mb-6 sm:mb-0 flex flex-col sm:flex-row gap-3">
                  <Button onClick={handleShare} variant="secondary" className="px-4 py-2 w-full sm:w-auto">
                    {copied ? <CheckCircleIcon className="w-4 h-4 mr-2 text-green-400" /> : <ShareIcon className="w-4 h-4 mr-2" />}
                    {copied ? 'Link Copied!' : 'Share Profile'}
                  </Button>
                  <Button to="/onboarding" variant="outline" className="px-4 py-2 w-full sm:w-auto">
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                  </Button>
              </div>
            )}
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
           
          {/* Public Documents Section */}
          {documentsToDisplay.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-3 text-cyan-400" />
                  Public Documents
              </h2>
              <div className="space-y-3">
                  {documentsToDisplay.map(doc => (
                      <a href={doc.public_url || '#'} key={doc.id} target="_blank" rel="noopener noreferrer" className="flex items-center p-3 rounded-lg hover:bg-gray-700/50 transition-colors group">
                          <DocumentIcon className="w-6 h-6 text-gray-400 group-hover:text-cyan-400" />
                          <span className="ml-4 font-medium text-gray-200">{doc.name}</span>
                          <span className="ml-auto text-sm text-gray-500">{doc.size}</span>
                      </a>
                  ))}
              </div>
            </Card>
          )}

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
      </div>
    </div>
  );
};