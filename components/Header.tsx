
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { CloseIcon, MenuIcon } from './Icons';
import { supabase } from '../lib/supabaseClient';

const Avatar: React.FC<{ photo_url: string; name: string; size?: string }> = ({ photo_url, name, size = 'h-9 w-9' }) => {
    return photo_url ? (
      <img src={photo_url} alt={name} className={`${size} rounded-full object-cover`} />
    ) : (
      <div className={`${size} bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-cyan-400`}>
        {name ? name.charAt(0) : '?'}
      </div>
    );
};

const NavItem: React.FC<{ to: string, children: React.ReactNode, isComingSoon?: boolean, baseStyle: string, activeStyle: string, mobileStyle?: string, onClick?: () => void }> = ({ to, children, isComingSoon, baseStyle, activeStyle, mobileStyle, onClick }) => {
    return (
        <NavLink to={to} onClick={onClick} className={({ isActive }) => `${mobileStyle || ''} ${baseStyle} ${isActive ? activeStyle : ''}`}>
            <span className="relative">
                {children}
                {isComingSoon && (
                    <span className="absolute -top-1.5 -right-6 bg-cyan-900/80 text-cyan-300 text-[10px] font-semibold px-1.5 py-0.5 rounded-full border border-cyan-700">
                        SOON
                    </span>
                )}
            </span>
        </NavLink>
    )
}


const Header: React.FC = () => {
    const { profile, logout } = useProfile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const handleLogout = async () => {
        await logout();
    };
    
    const baseLinkStyle = "relative text-gray-300 hover:text-white transition-colors duration-200 py-2";
    const activeLinkStyle = "text-white font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-400 after:shadow-[0_0_8px_theme(colors.cyan.400)]";
    const mobileLinkStyle = "block py-2 text-base";

    return (
        <header className="bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <NavLink to={profile ? "/profile/me" : "/"} className="text-xl font-bold text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    TMR
                </NavLink>
                
                <nav className="hidden md:flex items-center space-x-8">
                    <NavItem to="/jobs" isComingSoon baseStyle={baseLinkStyle} activeStyle={activeLinkStyle}>Find Jobs</NavItem>
                    <NavItem to="/documents" isComingSoon baseStyle={baseLinkStyle} activeStyle={activeLinkStyle}>Documents</NavItem>
                    <NavItem to="/profile/me" baseStyle={baseLinkStyle} activeStyle={activeLinkStyle}>Public Profile</NavItem>
                    {profile && (
                        <button onClick={handleLogout} className={baseLinkStyle}>Logout</button>
                    )}
                </nav>

                <div className="flex items-center space-x-4">
                    {profile && (
                        <div className="hidden md:flex items-center space-x-3">
                            <Avatar photo_url={profile.photo_url} name={profile.name} />
                            <span className="font-medium text-gray-200">{profile.name}</span>
                        </div>
                    )}
                     <div className="md:hidden">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)} 
                            aria-label="Toggle menu" 
                            className="text-gray-300 hover:text-white focus:outline-none"
                            aria-expanded={isMenuOpen}
                        >
                            {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-96 border-t border-gray-800' : 'max-h-0'}`}>
                <nav className="px-6 pb-4 pt-2 flex flex-col space-y-1">
                    <NavItem to="/jobs" isComingSoon baseStyle={baseLinkStyle} activeStyle={activeLinkStyle} mobileStyle={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>Find Jobs</NavItem>
                    <NavItem to="/documents" isComingSoon baseStyle={baseLinkStyle} activeStyle={activeLinkStyle} mobileStyle={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>Documents</NavItem>
                    <NavItem to="/profile/me" baseStyle={baseLinkStyle} activeStyle={activeLinkStyle} mobileStyle={mobileLinkStyle} onClick={() => setIsMenuOpen(false)}>Public Profile</NavItem>
                    {profile && (
                        <button
                            onClick={() => {
                                handleLogout();
                                setIsMenuOpen(false);
                            }}
                            className="block py-2 text-left text-base text-gray-300 hover:text-white transition-colors duration-200"
                        >
                            Logout
                        </button>
                    )}
                </nav>
            </div>
        </header>
    );
};

export default Header;