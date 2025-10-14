
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '../context/ProfileContext';
import type { UserProfile } from '../types';
import Button from '../components/Button';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Input, Select, Textarea } from '../components/Input';
import { UserIcon, BriefcaseIcon, BuildingOfficeIcon, CalendarDaysIcon, MapPinIcon, LinkIcon, TagIcon, AcademicCapIcon, CloseIcon, CameraIcon, UploadIcon } from '../components/Icons';

const ProgressBar: React.FC<{ step: number }> = ({ step }) => {
    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;
    return (
        <div className="w-full bg-gray-700 rounded-full h-2.5 my-8">
            <div 
                className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
    );
};

interface TagInputProps {
    label: string;
    tags: string[];
    setTags: (tags: string[]) => void;
    placeholder: string;
    icon: React.ReactNode;
    helperText?: string;
}

const TagInput: React.FC<TagInputProps> = ({ label, tags, setTags, placeholder, icon, helperText }) => {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = inputValue.trim();
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
            }
            setInputValue('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    return (
        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
            <div className="relative flex flex-wrap items-center gap-2 p-2.5 bg-gray-700/50 border border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-cyan-500 focus-within:border-cyan-500 transform transition-all duration-300 focus-within:scale-[1.02]">
                {/* FIX: Cast icon element to specify it accepts a className prop */}
                {icon && <div className="pl-1 flex items-center pointer-events-none">{React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: 'w-5 h-5 text-gray-400' })}</div>}
                {tags.map(tag => (
                    <span key={tag} className="flex items-center bg-cyan-500/20 text-cyan-300 text-sm font-medium px-2.5 py-1 rounded">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="ml-1.5 text-cyan-200 hover:text-white">
                            <CloseIcon className="w-3.5 h-3.5" />
                        </button>
                    </span>
                ))}
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="flex-grow bg-transparent text-gray-200 placeholder-gray-500 focus:outline-none min-w-[150px] h-full p-1"
                />
            </div>
             {helperText && <p className="mt-2 text-sm text-gray-400">{helperText}</p>}
        </div>
    );
};


const PhotoUploadForm: React.FC<{onUpload: (file: File) => void, onClose: () => void}> = ({onUpload, onClose}) => {
    const [file, setFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreview(URL.createObjectURL(selectedFile));
        }
    }
    
    const handleDragEvents = (e: React.DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    }

    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type.startsWith('image/')) {
                setFile(droppedFile);
                setPreview(URL.createObjectURL(droppedFile));
            } else {
                alert("Please drop an image file.");
            }
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!file) {
            alert("Please select a file.");
            return;
        }
        onUpload(file);
    }
    
    const dragDropClasses = isDragging ? 'border-cyan-500 bg-gray-800' : 'border-gray-600';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {preview ? (
                 <div className="flex justify-center">
                    <img src={preview} alt="Preview" className="w-40 h-40 rounded-full object-cover border-4 border-gray-600" />
                 </div>
            ) : (
                <div 
                    className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${dragDropClasses}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                >
                     <UploadIcon className="w-12 h-12 mx-auto text-gray-500" />
                    <label htmlFor="photo-upload" className="mt-2 block text-sm font-medium text-gray-400 cursor-pointer">
                        Drag & drop your photo here, or <span className="text-cyan-400 font-semibold">browse</span>
                    </label>
                    <input id="photo-upload" name="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </div>
            )}
            <div className="flex justify-end space-x-3 pt-2">
                 <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                 <Button type="submit" variant="primary" disabled={!file}>Save Photo</Button>
            </div>
        </form>
    )
}

const OnboardingPage: React.FC = () => {
    const { profile, setProfile, isProfileCreated } = useProfile();
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

    const [formData, setFormData] = useState<UserProfile>({
        photoUrl: '', name: '', title: '', industry: '', experience: '', location: '',
        bio: '', skills: [], roles: [], certifications: [], portfolioUrl: ''
    });

    useEffect(() => {
        if (profile) setFormData(profile);
    }, [profile]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleTagsChange = (name: keyof UserProfile) => (tags: string[]) => {
        setFormData(prev => ({ ...prev, [name]: tags }));
    };

    const handlePhotoUpload = (file: File) => {
        if (file) {
            // In a real app, you'd upload this file to a server and get a URL.
            // For this demo, we'll use a local object URL for preview.
            if (formData.photoUrl) {
                URL.revokeObjectURL(formData.photoUrl); // Clean up previous object URL
            }
            const newPhotoUrl = URL.createObjectURL(file);
            setFormData(prev => ({ ...prev, photoUrl: newPhotoUrl }));
        }
        setIsPhotoModalOpen(false);
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 3));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setProfile(formData);
        navigate('/profile/me');
    };

    return (
        <>
            <div className="container mx-auto px-6 py-12 max-w-3xl animate-fade-in-up">
                <header className="text-center mb-10">
                    <h1 className="text-4xl font-bold text-white">
                        {isProfileCreated ? 'Edit Your Profile' : 'Create Your Profile'}
                    </h1>
                    <p className="text-xl text-gray-300 mt-2">
                    Step {step} of 3: {step === 1 ? "The Basics" : step === 2 ? "Your Story" : "Your Expertise"}
                    </p>
                    <ProgressBar step={step} />
                </header>

                <Card>
                    <form onSubmit={handleSubmit}>
                        <div className="space-y-6">
                            {step === 1 && (
                                <>
                                    <div className="flex flex-col items-center sm:items-start sm:flex-row gap-6">
                                        <div className="flex-shrink-0">
                                            <label className="block text-sm font-medium text-gray-300 mb-2 text-center sm:text-left">Profile Photo</label>
                                            <div className="relative group">
                                                {formData.photoUrl ? (
                                                     <img src={formData.photoUrl} alt="Profile" className="w-24 h-24 rounded-full object-cover border-4 border-gray-600"/>
                                                ): (
                                                    <div className="w-24 h-24 rounded-full bg-gray-700 flex items-center justify-center border-4 border-gray-600">
                                                        <UserIcon className="w-12 h-12 text-gray-500" />
                                                    </div>
                                                )}
                                                <button
                                                    type="button"
                                                    onClick={() => setIsPhotoModalOpen(true)}
                                                    className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                                >
                                                    <CameraIcon className="w-8 h-8 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="w-full space-y-6 flex-grow">
                                            <Input label="Full Name" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. Alex Doe" required icon={<UserIcon />} />
                                            <Input label="Job Title / Headline" name="title" value={formData.title} onChange={handleChange} placeholder="e.g. Senior Frontend Engineer" required icon={<BriefcaseIcon />} />
                                        </div>
                                    </div>
                                    <Select label="Your Industry" name="industry" value={formData.industry} onChange={handleChange} required icon={<BuildingOfficeIcon />}>
                                        <option value="" disabled>Select an industry</option>
                                        <option value="IT">Information Technology</option>
                                        <option value="Healthcare">Healthcare</option>
                                        <option value="Other">Other</option>
                                    </Select>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <Input label="Years of Experience" name="experience" type="number" value={formData.experience} onChange={handleChange} placeholder="e.g. 8" required icon={<CalendarDaysIcon />} />
                                    <Input label="Location" name="location" value={formData.location} onChange={handleChange} placeholder="e.g. Remote, USA" required icon={<MapPinIcon />} />
                                    <Textarea label="Bio" name="bio" value={formData.bio} onChange={handleChange} placeholder="Tell recruiters a little about yourself, your goals, and what you're passionate about." required />
                                </>
                            )}
                            {step === 3 && (
                                <>
                                    <TagInput label="Top Skills" tags={formData.skills} setTags={handleTagsChange('skills')} placeholder="Add a skill and press Enter" icon={<TagIcon />} helperText="e.g., React, TypeScript, Surgical Procedures" />
                                    <TagInput label="Target Roles" tags={formData.roles} setTags={handleTagsChange('roles')} placeholder="Add a role and press Enter" icon={<BriefcaseIcon />} helperText="e.g., Frontend Developer, Registered Nurse" />
                                    <TagInput label="Certifications & Licenses" tags={formData.certifications} setTags={handleTagsChange('certifications')} placeholder="Add a certification and press Enter" icon={<AcademicCapIcon />} helperText="e.g., AWS Certified Developer, RN License" />
                                    <Input label="Portfolio or Website URL" name="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://github.com/your-profile" icon={<LinkIcon />} />
                                </>
                            )}
                        </div>
                        <div className="flex justify-between items-center pt-8 mt-6 border-t border-gray-700">
                            <Button type="button" variant="secondary" onClick={prevStep} disabled={step === 1} className={step === 1 ? 'opacity-0 invisible' : ''}>
                                Back
                            </Button>
                            {step < 3 && (
                                <Button type="button" variant="primary" onClick={nextStep}>
                                    Next
                                </Button>
                            )}
                            {step === 3 && (
                                <Button type="submit" variant="primary">
                                    {isProfileCreated ? 'Save Changes' : 'Create Profile'}
                                </Button>
                            )}
                        </div>
                    </form>
                </Card>
            </div>
            <Modal isOpen={isPhotoModalOpen} onClose={() => setIsPhotoModalOpen(false)} title="Upload Profile Photo">
                <PhotoUploadForm onUpload={handlePhotoUpload} onClose={() => setIsPhotoModalOpen(false)} />
            </Modal>
        </>
    );
};

export default OnboardingPage;