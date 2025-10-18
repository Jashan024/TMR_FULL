import React from 'react';
import Card from '../components/Card';
import { SearchIcon } from '../components/Icons';

const CandidatesPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
        <main className="max-w-md mx-auto z-10">
            <Card className="p-8 sm:p-10">
                <div className="flex justify-center mb-6">
                    <SearchIcon className="w-20 h-20 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Candidate Search is Coming Soon!
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                  We're building a powerful search to connect you with the right candidates. For now, you can view any profiles shared with you directly.
                </p>
            </Card>
        </main>
    </div>
  );
};

export default CandidatesPage;
