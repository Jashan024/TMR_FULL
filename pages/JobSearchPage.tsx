import React, { useState } from 'react';
import type { JobPosting } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import { SearchIcon } from '../components/Icons';

const mockJobs: JobPosting[] = [
    { id: '1', title: 'Senior Frontend Developer', company: 'Innovate Inc.', location: 'Remote', url: '#' },
    { id: '2', title: 'Product Designer (UI/UX)', company: 'Creative Solutions', location: 'New York, NY', url: '#' },
    { id: '3', title: 'Full-Stack Engineer', company: 'Tech Forward', location: 'San Francisco, CA', url: '#' },
    { id: '4', title: 'Data Scientist', company: 'DataDriven Co.', location: 'Remote', url: '#' },
    { id: '5', title: 'DevOps Engineer', company: 'CloudWorks', location: 'Austin, TX', url: '#' },
    { id: '6', title: 'Lead React Native Developer', company: 'MobileFirst', location: 'Remote', url: '#' },
];

const JobCard: React.FC<{ job: JobPosting }> = ({ job }) => {
    return (
        <a href={job.url} target="_blank" rel="noopener noreferrer" className="block group">
            <Card className="h-full flex flex-col justify-between transition-all duration-300 group-hover:border-cyan-500 group-hover:scale-[1.03] group-hover:-translate-y-1">
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-cyan-400">{job.title}</h3>
                    <p className="text-gray-300">{job.company}</p>
                </div>
                <p className="text-sm text-gray-400 mt-2">{job.location}</p>
            </Card>
        </a>
    )
}

const JobSearchPage: React.FC = () => {
    const [titleSearch, setTitleSearch] = useState('');
    const [locationSearch, setLocationSearch] = useState('');
    const [filteredJobs, setFilteredJobs] = useState<JobPosting[]>(mockJobs);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const results = mockJobs.filter(job => {
            const titleMatch = titleSearch 
                ? job.title.toLowerCase().includes(titleSearch.toLowerCase()) || job.company.toLowerCase().includes(titleSearch.toLowerCase())
                : true;
            
            const locationMatch = locationSearch
                ? job.location.toLowerCase().includes(locationSearch.toLowerCase())
                : true;

            return titleMatch && locationMatch;
        });
        setFilteredJobs(results);
    }

  return (
    <div className="container mx-auto px-6 py-12 animate-fade-in-up">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-white">Find Your Next Opportunity</h1>
        <p className="text-xl text-gray-300 mt-2">A focused discovery tool, not an overwhelming list.</p>
      </header>
      
      <Card className="max-w-3xl mx-auto mb-10 p-4 sm:p-6">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-2">
                <label htmlFor="title-search" className="block text-sm font-medium text-gray-300 mb-2">
                    Job Title / Keywords
                </label>
                <input
                    id="title-search"
                    type="text"
                    placeholder="e.g. Frontend Developer"
                    value={titleSearch}
                    onChange={e => setTitleSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
            </div>
            <div className="md:col-span-2">
                <label htmlFor="location-search" className="block text-sm font-medium text-gray-300 mb-2">
                    Location
                </label>
                <input
                    id="location-search"
                    type="text"
                    placeholder="e.g. Remote, New York"
                    value={locationSearch}
                    onChange={e => setLocationSearch(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 placeholder-gray-500 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                />
            </div>
            <Button type="submit" variant="primary" className="w-full md:col-span-1">
                <SearchIcon className="w-5 h-5 mr-2" />
                <span>Search</span>
            </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredJobs.length > 0 ? (
            filteredJobs.map(job => <JobCard key={job.id} job={job} />)
        ) : (
            <div className="col-span-full text-center py-10">
                <Card className="max-w-md mx-auto">
                    <h3 className="text-xl font-semibold text-white">No Jobs Found</h3>
                    <p className="text-gray-400 mt-2">Try adjusting your search criteria or check back later for new opportunities.</p>
                </Card>
            </div>
        )}
      </div>
    </div>
  );
};

export default JobSearchPage;
