"use client";

import React from 'react';
import ChatTest from '@/components/ChatTest';

export default function ChatTestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8 text-white">Firebase Chat Test</h1>
      <ChatTest />
    </div>
  );
}
