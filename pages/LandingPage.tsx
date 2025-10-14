import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import { ArrowRightIcon } from '../components/Icons';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 relative overflow-hidden">
      <header className="absolute top-0 left-0 w-full p-6 sm:p-8 z-20">
        <div className="container mx-auto flex justify-start">
            <Link to="/" className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                TMR
            </Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto z-10 animate-fade-in-up">
        <h1 className="text-5xl md:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-white via-cyan-300 to-blue-500 leading-tight">
          Your Career, <br/>Under Your Control.
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
          ThatsMyRecruiter is a focused, private platform designed to put you in command of your job search, without the noise.
        </p>
        <div className="mt-10">
          <Button to="/auth" variant="primary" className="px-8 py-4 text-lg">
            Create Your Profile
            <ArrowRightIcon className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </main>
      <footer className="absolute bottom-8 text-gray-400 z-10">
        <p>Are you a recruiter? <Link to="/recruiters" className="font-medium text-cyan-400 hover:underline">Learn more</Link>.</p>
      </footer>
    </div>
  );
};

export default LandingPage;