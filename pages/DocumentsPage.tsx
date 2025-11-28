import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import type { DocumentFile } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input } from '../components/Input';
import ToggleSwitch from '../components/ToggleSwitch';
import { UploadIcon, DocumentIcon, PencilIcon, TrashIcon, LoaderIcon, EyeIcon, LockClosedIcon } from '../components/Icons';

// --- Upload Modal Form ---
const UploadForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addDocument } = useDocuments();
    const [file, setFile] = useState<File | null>(null);
    const [docName, setDocName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState('');
    const [isDragging, setIsDragging] = useState(false);

    // File validation constants
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_FILE_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/jpg'
    ];

    const validateFile = (selectedFile: File): string | null => {
        // Check file size
        if (selectedFile.size > MAX_FILE_SIZE) {
            return `File size exceeds 10MB limit. Your file is ${(selectedFile.size / (1024 * 1024)).toFixed(2)}MB.`;
        }

        // Check file type (more lenient - check extension if MIME type not recognized)
        const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
        const isValidMimeType = ALLOWED_FILE_TYPES.includes(selectedFile.type);
        const isValidExtension = fileExtension && ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'txt', 'jpg', 'jpeg', 'png'].includes(fileExtension);
        
        if (!isValidMimeType && !isValidExtension) {
            return 'File type not supported. Please upload PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG, or JPEG files.';
        }

        return null;
    };

    const handleFileSelect = (selectedFile: File) => {
        const validationError = validateFile(selectedFile);
        if (validationError) {
            setError(validationError);
            setFile(null);
            return;
        }

        setError('');
        setFile(selectedFile);
        // Pre-fill name without extension, but allow editing
        const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
        setDocName(nameWithoutExt);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileSelect(e.target.files[0]);
        }
    };

    const handleDragEvents = (e: React.DragEvent, dragging: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(dragging);
    };

    const handleDrop = (e: React.DragEvent) => {
        handleDragEvents(e, false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !docName.trim()) {
            setError('Please provide a file and a name.');
            return;
        }

        // Re-validate before upload
        const validationError = validateFile(file);
        if (validationError) {
            setError(validationError);
            return;
        }

        setError('');
        setIsUploading(true);
        setUploadProgress(0);

        // Progress simulation with timeout protection
        let progressInterval: NodeJS.Timeout | null = null;
        let uploadTimeout: NodeJS.Timeout | null = null;

        try {
            // Simulate progress for better UX - goes to 70% then waits for actual upload
            progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    if (prev >= 70) {
                        if (progressInterval) clearInterval(progressInterval);
                        return 70;
                    }
                    return prev + 15;
                });
            }, 300);

            // Set timeout for mobile devices (30 seconds max)
            uploadTimeout = setTimeout(() => {
                if (progressInterval) clearInterval(progressInterval);
                setError('Upload is taking longer than expected. Please check your connection and try again.');
                setIsUploading(false);
                setUploadProgress(0);
            }, 30000);

            // Perform actual upload
            await addDocument(file, { name: docName.trim() });
            
            // Clear intervals and timeouts
            if (progressInterval) clearInterval(progressInterval);
            if (uploadTimeout) clearTimeout(uploadTimeout);
            
            // Complete progress animation to 100%
            setUploadProgress(100);
            
            // Small delay to show completion before closing
            await new Promise(resolve => setTimeout(resolve, 500));
            onClose();
        } catch (err: any) {
            // Clean up intervals and timeouts on error
            if (progressInterval) clearInterval(progressInterval);
            if (uploadTimeout) clearTimeout(uploadTimeout);
            console.error('Upload failed:', err);
            let errorMessage = 'An unexpected error occurred during upload. Please try again.';

            // Supabase errors often have a `message` property.
            if (err && typeof err.message === 'string') {
                errorMessage = err.message;
            }
            // Sometimes the error is nested inside an 'error' object.
            else if (err && err.error && typeof err.error.message === 'string') {
                errorMessage = err.error.message;
            }

            // Check for specific common issues to give better feedback.
            if (errorMessage.includes('security policy') || errorMessage.includes('permission denied')) {
                errorMessage = "Upload failed due to security policies. Please ensure permissions are correctly set up in Supabase.";
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('timeout')) {
                errorMessage = "Network error. Please check your internet connection and try again. Mobile uploads may take longer on slower connections.";
            } else if (errorMessage.includes('413') || errorMessage.includes('too large')) {
                errorMessage = "File is too large. Maximum file size is 10MB.";
            } else if (errorMessage.includes('abort') || errorMessage.includes('cancelled')) {
                errorMessage = "Upload was cancelled. Please try again.";
            }

            setError(errorMessage);
            setUploadProgress(0);
        } finally {
            setIsUploading(false);
        }
    };

    const dragDropClasses = isDragging 
        ? 'border-cyan-500 bg-gray-800/80 scale-[1.02]' 
        : 'border-gray-600 hover:border-gray-500';

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                    Document File
                </label>
                <div 
                    className={`mt-1 flex justify-center px-4 sm:px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-all duration-300 ${dragDropClasses}`}
                    onDragEnter={(e) => handleDragEvents(e, true)}
                    onDragLeave={(e) => handleDragEvents(e, false)}
                    onDragOver={(e) => handleDragEvents(e, true)}
                    onDrop={handleDrop}
                >
                    <div className="space-y-2 text-center w-full">
                        <UploadIcon className={`mx-auto h-10 w-10 sm:h-12 sm:w-12 ${isDragging ? 'text-cyan-400' : 'text-gray-500'} transition-colors`} />
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 text-sm text-gray-400">
                            <label 
                                htmlFor="file-upload" 
                                className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500 px-3 py-1.5 touch-manipulation"
                            >
                                <span>Choose a file</span>
                                <input 
                                    id="file-upload" 
                                    name="file-upload" 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleFileChange}
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/plain,image/jpeg,image/png"
                                    disabled={isUploading}
                                />
                            </label>
                            <span className="hidden sm:inline">or</span>
                            <p className="text-xs sm:text-sm">drag and drop here</p>
                        </div>
                        {file ? (
                            <div className="mt-3 p-3 bg-gray-900/60 rounded-lg border border-gray-700">
                                <p className="text-sm font-medium text-white break-words">{file.name}</p>
                                <p className="text-xs text-gray-400 mt-1">{formatFileSize(file.size)}</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-500 mt-2 px-2">
                                Supported: PDF, DOC, DOCX, XLS, XLSX, TXT, JPG, PNG (Max 10MB)
                            </p>
                        )}
                    </div>
                </div>
            </div>
            <Input 
                label="Document Name" 
                name="docName" 
                value={docName} 
                onChange={(e) => setDocName(e.target.value)} 
                placeholder="e.g. My Resume (October 2023)" 
                required 
                disabled={isUploading}
            />
            {isUploading && uploadProgress > 0 && (
                <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-400">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                        ></div>
                    </div>
                </div>
            )}
            {error && (
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                </div>
            )}
            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
                <Button 
                    type="button" 
                    variant="secondary" 
                    onClick={onClose} 
                    disabled={isUploading}
                    className="w-full sm:w-auto"
                >
                    Cancel
                </Button>
                <Button 
                    type="submit" 
                    variant="primary" 
                    loading={isUploading} 
                    disabled={!file || !docName.trim() || isUploading}
                    className="w-full sm:w-auto"
                >
                    {isUploading ? 'Uploading...' : 'Upload'}
                </Button>
            </div>
        </form>
    );
};

// --- Main Documents Page ---
const DocumentsPage: React.FC = () => {
    const { documents, updateDocument, deleteDocument, loading } = useDocuments();
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedDoc, setSelectedDoc] = useState<DocumentFile | null>(null);

    const handleVisibilityChange = async (doc: DocumentFile, isPublic: boolean) => {
        try {
            await updateDocument(doc.id, { visibility: isPublic ? 'public' : 'private' });
        } catch (error) {
            console.error('Failed to update visibility:', error);
            alert('Could not update document visibility. Please try again.');
        }
    };

    const handleDelete = async () => {
        if (!selectedDoc) return;
        try {
            await deleteDocument(selectedDoc.id);
            setIsDeleteModalOpen(false);
            setSelectedDoc(null);
        } catch (error) {
            console.error('Failed to delete document:', error);
            alert('Could not delete document. Please try again.');
        }
    };
    
    return (
        <>
            <div className="container mx-auto px-6 py-12 max-w-4xl animate-fade-in-up">
                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white">Your Documents</h1>
                        <p className="text-xl text-gray-300 mt-2">Manage your career-related files here.</p>
                    </div>
                    <Button onClick={() => setIsUploadModalOpen(true)} className="mt-4 sm:mt-0">
                        <UploadIcon className="w-5 h-5 mr-2"/>
                        Upload Document
                    </Button>
                </header>

                <Card className="p-4 sm:p-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <LoaderIcon className="w-10 h-10" />
                        </div>
                    ) : documents.length > 0 ? (
                        <div className="space-y-4">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex flex-col sm:flex-row items-start sm:items-center p-4 rounded-lg bg-gray-900/50 border border-gray-700/80 hover:border-gray-600 transition-colors">
                                    <DocumentIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                                    <div className="ml-0 sm:ml-4 mt-3 sm:mt-0 flex-grow">
                                        <p className="font-semibold text-white">{doc.name}</p>
                                        <p className="text-sm text-gray-400">
                                            {doc.size} &middot; Added on {new Date(doc.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-4 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                                        <div className="flex items-center space-x-2" title={doc.visibility === 'public' ? 'Visible on your public profile' : 'Private to you'}>
                                            {doc.visibility === 'public' ? <EyeIcon className="w-5 h-5 text-green-400" /> : <LockClosedIcon className="w-5 h-5 text-gray-400" />}
                                            <ToggleSwitch
                                                id={`vis-${doc.id}`}
                                                checked={doc.visibility === 'public'}
                                                onChange={(isChecked) => handleVisibilityChange(doc, isChecked)}
                                            />
                                        </div>
                                        <button onClick={() => { alert('Editing name is coming soon!') }} className="text-gray-400 hover:text-white transition" title="Edit Name (soon)">
                                            <PencilIcon className="w-5 h-5"/>
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setIsDeleteModalOpen(true);
                                            }}
                                            className="text-gray-400 hover:text-red-400 transition" title="Delete Document">
                                            <TrashIcon className="w-5 h-5"/>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <DocumentIcon className="w-16 h-16 mx-auto text-gray-600" />
                            <h3 className="mt-4 text-xl font-semibold text-white">No Documents Yet</h3>
                            <p className="mt-2 text-gray-400">Click "Upload Document" to add your first file.</p>
                        </div>
                    )}
                </Card>
            </div>

            {/* Modals */}
            <Modal isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} title="Upload New Document">
                <UploadForm onClose={() => setIsUploadModalOpen(false)} />
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
                {selectedDoc && (
                    <div className="text-gray-300">
                        <p className="mb-6">Are you sure you want to permanently delete this document? This action cannot be undone.</p>
                        <div className="p-3 bg-gray-900/60 border border-gray-700 rounded-lg">
                            <p className="font-semibold text-white">{selectedDoc.name}</p>
                            <p className="text-sm text-gray-400">{selectedDoc.size}</p>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                            <Button variant="primary" onClick={handleDelete} className="bg-red-600 hover:bg-red-500 focus:ring-red-500">Delete</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </>
    );
};

export default DocumentsPage;