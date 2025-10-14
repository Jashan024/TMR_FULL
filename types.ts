export interface UserProfile {
  photoUrl: string;
  name: string;
  title: string;
  industry: 'IT' | 'Healthcare' | 'Other' | '';
  experience: string;
  location: string;
  bio: string;
  skills: string[];
  roles: string[];
  certifications: string[];
  portfolioUrl: string;
}

export interface DocumentFile {
  id: string;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio';
  size: string;
  uploadedAt: string;
  visibility: 'public' | 'private';
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
}