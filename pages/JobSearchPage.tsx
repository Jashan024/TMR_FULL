
import React, { useState } from 'react';
import Card from '../components/Card';
import { BriefcaseIcon, MapPinIcon, SearchIcon, InformationCircleIcon } from '../components/Icons';
import { Input } from '../components/Input';
import Button from '../components/Button';
import MagicLoader from '../components/MagicLoader';
import JobCard from '../components/JobCard';
import type { SerpApiJob } from '../types';

// =============================================================================
// DEVELOPER: Please replace this placeholder with your actual SerpApi key.
// You can get a free key from your SerpApi dashboard: https://serpapi.com/dashboard
// =============================================================================
// FIX: Added a string type annotation to SERPAPI_KEY to prevent TypeScript
// from inferring a narrow literal type. This allows the check against the
// placeholder 'YOUR_SERPAPI_API_KEY' to work as intended without a type error.
const SERPAPI_KEY: string = "8e63efd5616fbe3d082fde046c9f143a45a40d29cbe74a335c37e3f0a225c6b6";

const JobSearchPage: React.FC = () => {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [jobs, setJobs] = useState<SerpApiJob[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // This check determines if the placeholder key above has been replaced.
    const isApiKeyConfigured = SERPAPI_KEY && SERPAPI_KEY !== 'YOUR_SERPAPI_API_KEY';

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setHasSearched(true);
        setJobs([]);

        if (!isApiKeyConfigured) {
            setError('The SerpApi key is not configured. Please add your key to the JobSearchPage.tsx file.');
            setIsLoading(false);
            return;
        }

        const cacheKey = `serpapi_jobs_${title.trim().toLowerCase()}_${location.trim().toLowerCase()}`;

        try {
            const cachedData = sessionStorage.getItem(cacheKey);
            if (cachedData) {
                const parsedData = JSON.parse(cachedData);
                setJobs(parsedData.jobs);
                setIsLoading(false);
                return;
            }

            const url = new URL('https://proxy.serpapi.com/search.json');
            url.searchParams.append('engine', 'google_jobs');
            url.searchParams.append('q', title);
            url.searchParams.append('location', location);
            url.searchParams.append('api_key', SERPAPI_KEY);

            // Using SerpApi's official proxy for client-side requests to avoid CORS issues.
            const response = await fetch(url.toString());
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            if (data.error) throw new Error(data.error);

            const jobResults = data.jobs_results || [];
            setJobs(jobResults);
            
            sessionStorage.setItem(cacheKey, JSON.stringify({ jobs: jobResults }));

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div className="container mx-auto px-6 py-12 max-w-4xl animate-fade-in-up">
            <header className="text-center mb-10">
                <h1 className="text-4xl font-bold text-white">Find Your Next Job</h1>
                <p className="text-xl text-gray-300 mt-2">Discover opportunities from all over the web.</p>
            </header>
            <Card className="p-6 mb-10">
                <form onSubmit={handleSearch}>
                    {!isApiKeyConfigured && (
                        <div className="mb-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-lg text-yellow-300 flex items-start">
                            <InformationCircleIcon className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong>Configuration Needed:</strong> The SerpApi key has not been set. Please edit the <code>JobSearchPage.tsx</code> file to add your API key.
                            </div>
                        </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input label="Job Title / Keyword" name="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Frontend Engineer" icon={<BriefcaseIcon />} required />
                        <Input label="Location" name="location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Remote, USA" icon={<MapPinIcon />} required />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-6 pt-6 border-t border-gray-700">
                        <p className="text-xs text-gray-500 mr-auto sm:mr-4 text-center sm:text-left">To conserve our free search quota, please search thoughtfully.</p>
                        <Button type="submit" variant="primary" className="w-full sm:w-auto" loading={isLoading} disabled={isLoading || !isApiKeyConfigured}>
                            {!isLoading && <SearchIcon className="w-5 h-5 mr-2" />}
                            {isLoading ? 'Searching...' : 'Search Jobs'}
                        </Button>
                    </div>
                </form>
            </Card>
            
            {isLoading && <MagicLoader text="Searching for jobs across the web..." />}
            {error && <div className="text-center p-10 text-red-400 bg-red-900/20 rounded-lg">{error}</div>}
            
            {!isLoading && !error && hasSearched && (
                jobs.length > 0 ? (
                    <div className="space-y-6">
                        {jobs.map(job => (
                            <JobCard key={job.job_id} job={job} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-gray-800/50 rounded-lg">
                        <BriefcaseIcon className="w-16 h-16 mx-auto text-gray-600" />
                        <h3 className="mt-4 text-xl font-semibold text-white">No Jobs Found</h3>
                        <p className="mt-2 text-gray-400">Try adjusting your search keywords or location.</p>
                    </div>
                )
            )}
        </div>
    );
};

export default JobSearchPage;