export interface UserProfile {
  id: string; // User UUID from Supabase Auth
  updated_at?: string;
  photo_url: string;
  name: string;
  title: string;
  industry: 'IT' | 'Healthcare' | 'Other' | '';
  experience: string;
  location: string;
  bio: string;
  skills: string[];
  roles: string[];
  certifications: string[];
  portfolio_url: string;
  role: 'candidate' | 'recruiter';
}

export interface DocumentFile {
  id: number;
  user_id: string;
  name: string;
  type: 'Resume' | 'Cover Letter' | 'Portfolio';
  size: string;
  created_at: string;
  visibility: 'public' | 'private';
  file_path: string;
  public_url?: string;
}

export interface JobPosting {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
}