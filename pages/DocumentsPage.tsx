
import React from 'react';
import Card from '../components/Card';
import { DocumentIcon } from '../components/Icons';

const DocumentsPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center px-4 animate-fade-in-up">
        <main className="max-w-md mx-auto z-10">
            <Card className="p-8 sm:p-10">
                <div className="flex justify-center mb-6">
                    <DocumentIcon className="w-20 h-20 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">
                  Document Management is Coming Soon!
                </h1>
                <p className="mt-4 text-lg text-gray-300">
                  Securely store and manage your resumes, cover letters, and other career documents, all in one place.
                </p>
            </Card>
        </main>
    </div>
  );
};

export default DocumentsPage;