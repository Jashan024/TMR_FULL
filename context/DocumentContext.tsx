import React, { createContext, useState, useContext, ReactNode } from 'react';
import type { DocumentFile } from '../types';

interface DocumentContextType {
  documents: DocumentFile[];
  setDocuments: React.Dispatch<React.SetStateAction<DocumentFile[]>>;
}

const DocumentContext = createContext<DocumentContextType | undefined>(undefined);

const mockDocuments: DocumentFile[] = [
    { id: '1', name: 'Resume_Frontend_Engineer.pdf', type: 'Resume', size: '248 KB', uploadedAt: '2023-10-26', visibility: 'public' },
    { id: '2', name: 'Cover_Letter_Startup.pdf', type: 'Cover Letter', size: '112 KB', uploadedAt: '2023-10-22', visibility: 'private' },
    { id: '3', name: 'Design_Portfolio_2023.pdf', type: 'Portfolio', size: '5.8 MB', uploadedAt: '2023-09-15', visibility: 'public' },
];

export const DocumentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [documents, setDocuments] = useState<DocumentFile[]>(mockDocuments);
  
  return (
    <DocumentContext.Provider value={{ documents, setDocuments }}>
      {children}
    </DocumentContext.Provider>
  );
};

export const useDocuments = (): DocumentContextType => {
  const context = useContext(DocumentContext);
  if (!context) {
    throw new Error('useDocuments must be used within a DocumentProvider');
  }
  return context;
};