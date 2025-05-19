'use client';

import React from 'react';
import { useSession, signIn } from 'next-auth/react';
import Head from 'next/head';

const AdminBadgePage = () => {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen bg-gray-900 text-white"><p>Loading session...</p></div>;
  }

  // Hardcoded admin email for now - replace with a proper role system
  const isAdmin = session?.user?.email === 'ertacspotify@gmail.com'; 

  if (!session || !isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-6 text-center">
        {/* It's better to use Next.js Head component from 'next/head' in pages dir or Metadata API in app dir */}
        {/* For app dir, you'd typically export a metadata object or use generateMetadata */}
        <Head>
          <title>Access Denied</title>
        </Head>
        <h1 className="text-3xl font-bold mb-4 text-red-500">Access Denied</h1>
        <p className="mb-6 text-lg">You do not have permission to view this page.</p>
        {!session && (
          <button 
            onClick={() => signIn()} 
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition duration-150 ease-in-out"
          >
            Sign In
          </button>
        )}
      </div>
    );
  }

  // Admin content goes here
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* For app dir, manage title via metadata */}
      <Head>
        <title>Badge Management</title>
      </Head>
      <header className="mb-10">
        <h1 className="text-4xl font-bold text-center text-emerald-400">Badge Management</h1>
      </header>

      <div className="max-w-4xl mx-auto bg-gray-800 p-6 rounded-lg shadow-xl">
        <p className="text-center text-lg">Welcome, Admin! User and badge selection will go here.</p>
        {/* Placeholder for future UI components */}
      </div>
    </div>
  );
};

export default AdminBadgePage;
