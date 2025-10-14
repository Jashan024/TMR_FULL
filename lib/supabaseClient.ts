
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// -----------------------------------------------------------------------------
// Supabase Project Configuration
// -----------------------------------------------------------------------------
const supabaseUrl = 'https://aawgjmddbfdtdewfgjgn.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhd2dqbWRkYmZkdGRld2ZnamduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MzQ4NjksImV4cCI6MjA3NjAxMDg2OX0.cUZrLpsNvIfu36H9L9LBum1P1G-dSHdgvYH71mer75o';


// Create a single Supabase client for interacting with the backend
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export { supabase };
