import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import { CloseIcon, MenuIcon } from './Icons';

const Avatar: React.FC<{ photoUrl: string; name: string; size?: string }> = ({ photoUrl, name, size = 'h-9 w-9' }) => {
    return photoUrl ? (
      <img src={photoUrl} alt={name} className={`${size} rounded-full object-cover`} />
    ) : (
      <div className={`${size} bg-gray-700 rounded-full flex items-center justify-center text-sm font-bold text-cyan-400`}>
        {name.charAt(0)}
      </div>
    );
};

const Header: React.FC = () => {
    const { profile } = useProfile();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    const baseLinkStyle = "relative text-gray-300 hover:text-white transition-colors duration-200 py-2";
    const activeLinkStyle = "text-white font-semibold after:content-[''] after:absolute after:left-0 after:bottom-0 after:w-full after:h-[2px] after:bg-cyan-400 after:shadow-[0_0_8px_theme(colors.cyan.400)]";
    const mobileLinkStyle = "block py-2 text-base";

    return (
        <header className="bg-gray-900/70 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-800">
            <div className="container mx-auto px-6 py-3 flex justify-between items-center">
                <NavLink to="/profile/me" className="text-xl font-bold text-white tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
                    TMR
                </NavLink>
                
                <nav className="hidden md:flex items-center space-x-8">
                    <NavLink to="/jobs" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Find Jobs</NavLink>
                    <NavLink to="/documents" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Documents</NavLink>
                    <NavLink to="/profile/me" className={({ isActive }) => `${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Public Profile</NavLink>
                </nav>

                <div className="flex items-center space-x-4">
                    {profile && (
                        <div className="flex items-center space-x-3">
                            <Avatar photoUrl={profile.photoUrl} name={profile.name} />
                            <span className="hidden sm:inline font-medium text-gray-200">{profile.name}</span>
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
                    <NavLink to="/jobs" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Find Jobs</NavLink>
                    <NavLink to="/documents" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Documents</NavLink>
                    <NavLink to="/profile/me" onClick={() => setIsMenuOpen(false)} className={({ isActive }) => `${mobileLinkStyle} ${baseLinkStyle} ${isActive ? activeLinkStyle : ''}`}>Public Profile</NavLink>
                </nav>
            </div>
        </header>
    );
};

export default Header;
