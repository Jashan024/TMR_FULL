import React, { useState } from 'react';
import type { DocumentFile } from '../types';
import { useDocuments } from '../context/DocumentContext';
import Button from '../components/Button';
import Modal from '../components/Modal';
import Card from '../components/Card';
import ToggleSwitch from '../components/ToggleSwitch';
import { DocumentIcon, UploadIcon } from '../components/Icons';

const DocumentItem: React.FC<{ doc: DocumentFile }> = ({ doc }) => {
    const { updateDocument, deleteDocument } = useDocuments();

    const handleVisibilityToggle = (isChecked: boolean) => {
        const newVisibility = isChecked ? 'public' : 'private';
        updateDocument(doc.id, { visibility: newVisibility });
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete ${doc.name}?`)) {
            deleteDocument(doc.id);
        }
    }
    
    return (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 border-b border-gray-700 last:border-b-0 hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center space-x-4">
                <DocumentIcon className="w-8 h-8 text-cyan-400 flex-shrink-0" />
                <div>
                    <p className="font-medium text-gray-200">{doc.name}</p>
                    <p className="text-sm text-gray-400">{doc.type} &middot; {doc.size}</p>
                </div>
            </div>
            <div className="flex items-center space-x-4">
                 <div className="flex items-center space-x-2">
                    <span className={`text-sm font-medium ${doc.visibility === 'public' ? 'text-cyan-400' : 'text-gray-400'}`}>
                        {doc.visibility === 'public' ? 'Public' : 'Private'}
                    </span>
                    <ToggleSwitch
                        id={`toggle-${doc.id}`}
                        checked={doc.visibility === 'public'}
                        onChange={handleVisibilityToggle}
                    />
                 </div>
                 <button onClick={handleDelete} className="text-sm font-medium text-red-500 hover:text-red-400 transition-colors">Delete</button>
            </div>
        </div>
    )
}

const UploadDocumentForm: React.FC<{onClose: () => void}> = ({onClose}) => {
    const { addDocument } = useDocuments();
    const [file, setFile] = useState<File | null>(null);
    const [docType, setDocType] = useState<DocumentFile['type']>('Resume');
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if(e.target.files) {
            setFile(e.target.files[0]);
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
            setFile(e.dataTransfer.files[0]);
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!file) {
            alert("Please select a file.");
            return;
        }
        setIsUploading(true);
        try {
            await addDocument(file, docType);
            onClose();
        } catch (error) {
            alert("Failed to upload document.");
        } finally {
            setIsUploading(false);
        }
    }
    
    const dragDropClasses = isDragging ? 'border-cyan-500 bg-gray-800' : 'border-gray-600';

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
             <div>
                 <label htmlFor="doc-type" className="block text-sm font-medium text-gray-300 mb-2">
                    Document Type
                 </label>
                 <select 
                    id="doc-type" 
                    value={docType}
                    onChange={(e) => setDocType(e.target.value as DocumentFile['type'])}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-200 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
                >
                    <option value="Resume">Resume</option>
                    <option value="Cover Letter">Cover Letter</option>
                    <option value="Portfolio">Portfolio</option>
                 </select>
            </div>
            <div 
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-300 ${dragDropClasses}`}
                onDragEnter={(e) => handleDragEvents(e, true)}
                onDragLeave={(e) => handleDragEvents(e, false)}
                onDragOver={(e) => handleDragEvents(e, true)}
                onDrop={handleDrop}
            >
                 <UploadIcon className="w-12 h-12 mx-auto text-gray-500" />
                <label htmlFor="file-upload" className="mt-2 block text-sm font-medium text-gray-400 cursor-pointer">
                    Drag & drop your file here, or <span className="text-cyan-400 font-semibold">browse</span>
                </label>
                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                {file && <p className="mt-4 text-sm text-gray-500">Selected: {file.name}</p>}
            </div>
            <div className="flex justify-end space-x-3 pt-2">
                 <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
                 <Button type="submit" variant="primary" disabled={!file || isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload'}
                 </Button>
            </div>
        </form>
    )
}


const DocumentsPage: React.FC = () => {
  const { documents, loading } = useDocuments();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className="container mx-auto px-6 py-12 animate-fade-in-up">
        <header className="flex flex-col sm:flex-row justify-between sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white">Your Documents</h1>
            <p className="text-xl text-gray-300 mt-2">Manage your resumes, cover letters, and other files.</p>
          </div>
          <Button variant="primary" onClick={() => setIsModalOpen(true)}>
             <UploadIcon className="w-5 h-5 mr-2" /> Upload New Document
          </Button>
        </header>
        
        <Card className="overflow-hidden p-0">
            {loading ? (
                 <div className="text-center p-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto"></div>
                 </div>
            ) : documents.length > 0 ? (
                documents.map(doc => <DocumentItem key={doc.id} doc={doc} />)
            ) : (
                <div className="text-center p-10">
                    <p className="text-gray-500">You haven't uploaded any documents yet.</p>
                </div>
            )}
        </Card>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Upload a New Document">
        <UploadDocumentForm onClose={() => setIsModalOpen(false)} />
      </Modal>
    </>
  );
};

export default DocumentsPage;
