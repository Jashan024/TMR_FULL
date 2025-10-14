import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Input } from '../components/Input';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '../components/Icons';

const AuthPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'signin' | 'signup'>('signup');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you'd handle authentication here.
        // For this demo, we'll just navigate to the onboarding page.
        navigate('/onboarding');
    };

    const tabButtonClasses = (tabName: 'signin' | 'signup') => 
        `w-1/2 py-3 text-center font-semibold transition-colors duration-300 rounded-t-lg ${
            activeTab === tabName 
                ? 'text-white bg-gray-800/80' 
                : 'text-gray-400 bg-gray-900/50 hover:bg-gray-800/60'
        }`;

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
            <header className="absolute top-0 left-0 w-full p-6 sm:p-8 z-20">
                <div className="container mx-auto flex justify-start">
                    <Link to="/" className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                        TMR
                    </Link>
                </div>
            </header>
            <main className="w-full max-w-md mx-auto z-10 animate-fade-in-up">
                <Card className="p-0 overflow-hidden">
                    <div className="flex">
                        <button onClick={() => setActiveTab('signup')} className={tabButtonClasses('signup')}>
                            Sign Up
                        </button>
                        <button onClick={() => setActiveTab('signin')} className={tabButtonClasses('signin')}>
                            Sign In
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 'signup' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white">Create Your Account</h2>
                                <Input label="Full Name" name="name" type="text" placeholder="Alex Doe" required icon={<UserIcon />} />
                                <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required icon={<EnvelopeIcon />} />
                                <Input label="Password" name="password" type="password" placeholder="••••••••" required icon={<LockClosedIcon />} />
                                <Button type="submit" variant="primary" className="w-full">
                                    Create Account
                                </Button>
                            </form>
                        )}
                        
                        {activeTab === 'signin' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white">Welcome Back</h2>
                                <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required icon={<EnvelopeIcon />} />
                                <Input label="Password" name="password" type="password" placeholder="••••••••" required icon={<LockClosedIcon />} />
                                <div className="text-right">
                                    <a href="#" className="text-sm text-cyan-400 hover:underline">Forgot password?</a>
                                </div>
                                <Button type="submit" variant="primary" className="w-full">
                                    Sign In
                                </Button>
                            </form>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default AuthPage;