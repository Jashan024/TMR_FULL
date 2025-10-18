import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { Input } from '../components/Input';
import { EnvelopeIcon, LockClosedIcon, UserIcon } from '../components/Icons';
import { supabase } from '../lib/supabaseClient';
import { useProfile } from '../context/ProfileContext';

type AuthView = 'signin' | 'signup' | 'forgot_password';

const AuthPage: React.FC = () => {
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const role = searchParams.get('role');
    const initialView = searchParams.get('view') as AuthView | null;
    
    const [view, setView] = useState<AuthView>(initialView || 'signup');
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { session, isProfileCreated, loading: profileLoading, profile } = useProfile();
    const userId = session?.user?.id;

    const isLoading = formLoading || (!!userId && profileLoading);
    
    useEffect(() => {
        if(initialView) setView(initialView);
    }, [initialView]);

    useEffect(() => {
        if (userId && !profileLoading) {
            const redirectPath = sessionStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                sessionStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
                return;
            }

            if (profile?.role === 'recruiter') {
                navigate('/candidates');
            } else {
                navigate(isProfileCreated ? '/profile/me' : '/onboarding');
            }
        }
    }, [userId, isProfileCreated, profileLoading, navigate, profile?.role]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!supabase) {
            setError("Authentication is unavailable: App is not connected to a backend service.");
            return;
        }

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const name = formData.get('name') as string;
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        
        setError('');
        setMessage('');

        if (view === 'signup' && (!name.trim() || !email.trim() || !password)) {
            setError('Please fill in all fields to sign up.');
            return;
        }
        if (view === 'signin' && (!email.trim() || !password)) {
            setError('Please enter your email and password to sign in.');
            return;
        }
        if (view === 'forgot_password' && !email.trim()) {
            setError('Please enter your email address to reset your password.');
            return;
        }
        
        setFormLoading(true);
        
        try {
            if (view === 'signup') {
                const { data, error } = await supabase.auth.signUp({ 
                    email, 
                    password, 
                    options: { 
                        data: { 
                            full_name: name,
                            role: role === 'recruiter' ? 'recruiter' : 'candidate'
                        } 
                    } 
                });

                if (error) throw error;
                
                if (data.user && !data.session) {
                    setMessage('Check your email for a confirmation link to complete your registration.');
                }
            } else if (view === 'signin') {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            } else if (view === 'forgot_password') {
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/#/auth`,
                });
                if (error) throw error;
                setMessage('Check your email for a password reset link.');
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setFormLoading(false);
        }
    };

    const tabButtonClasses = (tabName: 'signin' | 'signup') => 
        `w-1/2 py-3 text-center font-semibold transition-colors duration-300 rounded-t-lg ${
            view === tabName 
                ? 'text-white bg-gray-800/80' 
                : 'text-gray-400 bg-gray-900/50 hover:bg-gray-800/60'
        }`;
    
    const isRecruiterFlow = role === 'recruiter';

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
                    {view !== 'forgot_password' && (
                        <div className="flex">
                            <button onClick={() => { setView('signup'); setError(''); setMessage(''); }} className={tabButtonClasses('signup')}>
                                {isRecruiterFlow ? 'Create Account' : 'Sign Up'}
                            </button>
                            <button onClick={() => { setView('signin'); setError(''); setMessage(''); }} className={tabButtonClasses('signin')}>
                                Sign In
                            </button>
                        </div>
                    )}

                    <div className="p-8">
                        {error && <p className="mb-4 text-center text-red-400">{error}</p>}
                        {message && <p className="mb-4 text-center text-green-400">{message}</p>}

                        {view === 'signup' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white">
                                    {isRecruiterFlow ? 'Create a Recruiter Account' : 'Create Your Account'}
                                </h2>
                                <Input label="Full Name" name="name" type="text" placeholder="Alex Doe" required icon={<UserIcon />} disabled={isLoading} />
                                <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required icon={<EnvelopeIcon />} disabled={isLoading} />
                                <Input label="Password" name="password" type="password" placeholder="••••••••" required icon={<LockClosedIcon />} disabled={isLoading} />
                                <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                                    {isLoading ? 'Verifying...' : 'Create Account'}
                                </Button>
                            </form>
                        )}
                        
                        {view === 'signin' && (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white">
                                    {isRecruiterFlow ? 'Recruiter Sign In' : 'Welcome Back'}
                                </h2>
                                <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required icon={<EnvelopeIcon />} disabled={isLoading} />
                                <Input label="Password" name="password" type="password" placeholder="••••••••" required icon={<LockClosedIcon />} disabled={isLoading} />
                                <div className="text-right">
                                    <button type="button" onClick={() => setView('forgot_password')} className="text-sm text-cyan-400 hover:underline">Forgot password?</button>
                                </div>
                                <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                                    {isLoading ? 'Signing In...' : 'Sign In'}
                                </Button>
                            </form>
                        )}

                        {view === 'forgot_password' && (
                             <form onSubmit={handleSubmit} className="space-y-6">
                                <h2 className="text-2xl font-bold text-center text-white">Reset Password</h2>
                                <p className="text-center text-sm text-gray-400">Enter your email and we'll send you a link to reset your password.</p>
                                <Input label="Email Address" name="email" type="email" placeholder="you@example.com" required icon={<EnvelopeIcon />} disabled={isLoading} />
                                <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
                                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                                </Button>
                                <div className="text-center">
                                    <button type="button" onClick={() => setView('signin')} className="text-sm text-cyan-400 hover:underline">Back to Sign In</button>
                                </div>
                            </form>
                        )}
                    </div>
                </Card>
            </main>
        </div>
    );
};

export default AuthPage;