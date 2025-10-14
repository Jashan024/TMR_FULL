import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { useDocuments } from '../context/DocumentContext';
import Card from '../components/Card';
import Button from '../components/Button';
import { LinkIcon, PencilIcon, EyeIcon, DocumentIcon } from '../components/Icons';

const LoadingSpinner: React.FC = () => (
    <div className="flex justify-center items-center h-full py-20">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
    </div>
);

export const PublicProfilePage: React.FC = () => {
  const { profile, isProfileCreated, loading, error } = useProfile();
  const { documents } = useDocuments();
  const navigate = useNavigate();

  const publicDocuments = documents.filter(doc => doc.visibility === 'public');

  useEffect(() => {
      // Don't redirect while loading, wait until loading is finished and we confirm no profile exists.
      if (!loading && !isProfileCreated) {
          navigate('/onboarding');
      }
  }, [isProfileCreated, loading, navigate]);

  if (loading) {
    return (
        <div className="container mx-auto px-6 max-w-4xl">
            <LoadingSpinner />
        </div>
    );
  }

  if (error) {
      return <div className="text-center p-10 text-red-400">{error}</div>;
  }

  if (!profile) {
      // This state can be reached if loading is false but profile is still null, before redirect happens.
      // Or if there's no profile created yet for a logged-in user.
      return <div className="text-center p-10">Redirecting to create your profile...</div>;
  }

  return (
    <div className="py-12 sm:py-16">
      <div className="container mx-auto px-6 max-w-4xl animate-fade-in-up">
        <main>
          {/* Header Section */}
          <section className="relative mb-12">
            <div className="sm:absolute sm:top-0 sm:right-0 mb-6 sm:mb-0">
                <Button to="/onboarding" variant="outline" className="px-4 py-2 w-full sm:w-auto">
                    <PencilIcon className="w-4 h-4 mr-2" />
                    Edit Profile
                </Button>
            </div>
            <div className="text-center">
                {profile.photo_url ? (
                    <img src={profile.photo_url} alt={profile.name} className="w-24 h-24 rounded-full object-cover mx-auto border-4 border-gray-600" />
                ) : (
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center text-5xl font-bold text-cyan-400 mx-auto border-4 border-gray-600">
                        {profile.name?.charAt(0)}
                    </div>
                )}
                <h1 className="text-4xl font-bold text-white mt-4">{profile.name}</h1>
                <p className="text-xl text-gray-300">{profile.title}</p>
                {profile.portfolio_url && (
                     <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center text-cyan-400 hover:text-cyan-300 transition-colors">
                         <LinkIcon className="w-5 h-5 mr-2" />
                         <span>Portfolio / Website</span>
                     </a>
                )}
            </div>
          </section>

          {/* Bio Section */}
           <Card className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-3">About Me</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
           </Card>
           
          {/* Public Documents Section */}
          {publicDocuments.length > 0 && (
            <Card className="mb-8">
              <h2 className="text-2xl font-semibold text-white mb-4 flex items-center">
                  <EyeIcon className="w-6 h-6 mr-3 text-cyan-400" />
                  Public Documents
              </h2>
              <div className="space-y-3">
                  {publicDocuments.map(doc => (
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
                      <p className="text-gray-200">{profile.location}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Open to Roles</h3>
                      <ul className="list-disc list-inside text-gray-200 space-y-1 mt-1">
                        {profile.roles.map(role => <li key={role}>{role}</li>)}
                      </ul>
                    </div>
                  </div>
                </Card>
                <Card>
                  <h2 className="text-xl font-semibold text-white mb-4">Experience</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Industry</h3>
                      <p className="text-gray-200">{profile.industry}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-400">Years of Experience</h3>
                      <p className="text-gray-200">{profile.experience} years</p>
                    </div>
                  </div>
                </Card>
            </div>

            {/* RIGHT COLUMN */}
            <div className="md:col-span-2 space-y-8">
                 <Card>
                  <h2 className="text-xl font-semibold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map(skill => (
                      <span key={skill} className="bg-gray-700 text-gray-300 text-sm font-medium px-3 py-1.5 rounded-md">
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
                 <Card>
                  <h2 className="text-xl font-semibold text-white mb-4">Certifications & Licenses</h2>
                  <div className="flex flex-wrap gap-2">
                    {profile.certifications.length > 0 ? profile.certifications.map(cert => (
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
