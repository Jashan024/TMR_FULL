import React, { useState } from 'react';
import { useDocuments } from '../context/DocumentContext';
import type { DocumentFile } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import { Input, Select } from '../components/Input';
import ToggleSwitch from '../components/ToggleSwitch';
import { UploadIcon, DocumentIcon, PencilIcon, TrashIcon, LoaderIcon, EyeIcon, LockClosedIcon } from '../components/Icons';

// --- Upload Modal Form ---
const UploadForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { addDocument } = useDocuments();
    const [file, setFile] = useState<File | null>(null);
    const [docName, setDocName] = useState('');
    const [docType, setDocType] = useState<DocumentFile['type']>('Resume');
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setDocName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Pre-fill name without extension
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !docName || !docType) {
            setError('Please provide a file, name, and type.');
            return;
        }
        setError('');
        setIsUploading(true);
        try {
            await addDocument(file, { name: docName, type: docType });
            onClose();
        } catch (err: any) {
            console.error('Upload failed:', err);
            setError(err.message || 'Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="file-upload" className="block text-sm font-medium text-gray-300 mb-2">
                    Document File
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-600 border-dashed rounded-md">
                    <div className="space-y-1 text-center">
                        <UploadIcon className="mx-auto h-12 w-12 text-gray-500" />
                        <div className="flex text-sm text-gray-400">
                            <label htmlFor="file-upload" className="relative cursor-pointer bg-gray-800 rounded-md font-medium text-cyan-400 hover:text-cyan-300 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-cyan-500">
                                <span>Upload a file</span>
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                            </label>
                            <p className="pl-1">or drag and drop</p>
                        </div>
                        {file ? (
                            <p className="text-xs text-gray-300">{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
                        ) : (
                            <p className="text-xs text-gray-500">PDF, DOCX, etc. up to 10MB</p>
                        )}
                    </div>
                </div>
            </div>
            <Input label="Document Name" name="docName" value={docName} onChange={(e) => setDocName(e.target.value)} placeholder="e.g. My Resume (October 2023)" required />
            <Select label="Document Type" name="docType" value={docType} onChange={(e) => setDocType(e.target.value as DocumentFile['type'])} required>
                <option value="Resume">Resume</option>
                <option value="Cover Letter">Cover Letter</option>
                <option value="Portfolio">Portfolio</option>
            </Select>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="secondary" onClick={onClose} disabled={isUploading}>Cancel</Button>
                <Button type="submit" variant="primary" loading={isUploading} disabled={!file || isUploading}>
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
                                            {doc.type} &middot; {doc.size} &middot; Added on {new Date(doc.created_at).toLocaleDateString()}
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
                            <p className="text-sm text-gray-400">{selectedDoc.type} &middot; {selectedDoc.size}</p>
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