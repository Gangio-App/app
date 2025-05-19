'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import { FiArrowLeft, FiCode, FiCopy, FiCheck, FiExternalLink } from 'react-icons/fi';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslations } from '@/hooks/useTranslations';

// API Endpoints
const API_ENDPOINTS = [
  {
    id: 'authentication',
    name: 'Authentication',
    description: 'Authenticate users and manage sessions',
    endpoints: [
      {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Authenticate a user and create a session',
        parameters: [
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' }
        ],
        response: `{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}`
      },
      {
        method: 'POST',
        path: '/api/auth/signup',
        description: 'Register a new user account',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'User full name' },
          { name: 'email', type: 'string', required: true, description: 'User email address' },
          { name: 'password', type: 'string', required: true, description: 'User password' }
        ],
        response: `{
  "user": {
    "id": "user_123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "jwt_token_here"
}`
      }
    ]
  },
  {
    id: 'servers',
    name: 'Servers',
    description: 'Create and manage servers',
    endpoints: [
      {
        method: 'GET',
        path: '/api/servers',
        description: 'Get a list of servers for the authenticated user',
        parameters: [
          { name: 'userId', type: 'string', required: true, description: 'User ID' }
        ],
        response: `[
  {
    "id": "server_123",
    "name": "Gaming Squad",
    "description": "Our gaming community",
    "ownerId": "user_123",
    "icon": "https://example.com/icon.png"
  }
]`
      },
      {
        method: 'POST',
        path: '/api/servers',
        description: 'Create a new server',
        parameters: [
          { name: 'name', type: 'string', required: true, description: 'Server name' },
          { name: 'description', type: 'string', required: false, description: 'Server description' },
          { name: 'icon', type: 'string', required: false, description: 'Server icon (base64 encoded)' }
        ],
        response: `{
  "id": "server_123",
  "name": "Gaming Squad",
  "description": "Our gaming community",
  "ownerId": "user_123",
  "icon": "https://example.com/icon.png"
}`
      }
    ]
  },
  {
    id: 'friends',
    name: 'Friends',
    description: 'Manage friend relationships',
    endpoints: [
      {
        method: 'GET',
        path: '/api/friends',
        description: 'Get a list of friends for the authenticated user',
        parameters: [],
        response: `[
  {
    "id": "user_456",
    "name": "Jane Smith",
    "status": "online",
    "avatar": "https://example.com/avatar.png"
  }
]`
      },
      {
        method: 'POST',
        path: '/api/friends/request',
        description: 'Send a friend request',
        parameters: [
          { name: 'userId', type: 'string', required: true, description: 'User ID to send the request to' }
        ],
        response: `{
  "id": "request_123",
  "status": "pending",
  "userId": "user_456"
}`
      }
    ]
  }
];

export default function ApiDocsPage() {
  const { locale } = useLanguage();
  const { t } = useTranslations();
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const copyToClipboard = (text: string, endpointId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpointId);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <PageLayout showBackground={true}>
      <div className="relative max-w-6xl mx-auto px-6 py-16">
        {/* Breadcrumb */}
        <div className="mb-8">
          <Link 
            href="/docs" 
            className="inline-flex items-center text-gray-400 hover:text-emerald-400 transition-colors"
          >
            <FiArrowLeft className="mr-2" /> Back to Documentation
          </Link>
        </div>

        {/* Title */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: { opacity: 1 }
          }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-6"
            variants={fadeInUp}
          >
            <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">
              API Reference
            </span>
          </motion.h1>
          
          <motion.div 
            className="h-1 w-24 bg-gradient-to-r from-emerald-400 to-teal-500 rounded mb-8"
            variants={fadeInUp}
          ></motion.div>
          
          <motion.p 
            className="text-xl text-gray-300 mb-8 max-w-3xl"
            variants={fadeInUp}
          >
            Integrate your applications with gvng.io using our comprehensive API. This reference provides details on endpoints, parameters, and responses.
          </motion.p>
        </motion.div>

        {/* API Overview */}
        <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-4 text-emerald-400">API Overview</h2>
          <p className="mb-4">
            The gvng.io API is organized around REST. Our API has predictable resource-oriented URLs, accepts JSON-encoded request bodies, returns JSON-encoded responses, and uses standard HTTP response codes, authentication, and verbs.
          </p>
          
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold mb-2">Base URL</h3>
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
              <code className="text-emerald-400">https://api.gvng.io/v1</code>
              <button 
                onClick={() => copyToClipboard('https://api.gvng.io/v1', 'base-url')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copiedEndpoint === 'base-url' ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
              </button>
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h3 className="text-lg font-bold mb-2">Authentication</h3>
            <p className="mb-4">
              The gvng.io API uses JWT tokens for authentication. Include the token in the Authorization header of your requests.
            </p>
            <div className="flex items-center justify-between bg-gray-800 p-3 rounded">
              <code className="text-emerald-400">Authorization: Bearer YOUR_JWT_TOKEN</code>
              <button 
                onClick={() => copyToClipboard('Authorization: Bearer YOUR_JWT_TOKEN', 'auth-header')}
                className="text-gray-400 hover:text-white transition-colors"
              >
                {copiedEndpoint === 'auth-header' ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border border-gray-700/50 shadow-xl sticky top-24">
              <h3 className="text-xl font-bold mb-4 text-emerald-400">Endpoints</h3>
              <ul className="space-y-2">
                {API_ENDPOINTS.map(category => (
                  <li key={category.id} className="mb-4">
                    <div className="font-bold text-white mb-2">{category.name}</div>
                    <ul className="space-y-1 pl-4">
                      {category.endpoints.map(endpoint => (
                        <li key={`${category.id}-${endpoint.path}`}>
                          <button
                            onClick={() => setActiveEndpoint(`${category.id}-${endpoint.path}`)}
                            className={`text-left w-full px-2 py-1 rounded text-sm ${activeEndpoint === `${category.id}-${endpoint.path}` ? 'bg-emerald-500/20 text-emerald-400' : 'text-gray-400 hover:text-white'}`}
                          >
                            <span className={`inline-block w-16 ${endpoint.method === 'GET' ? 'text-blue-400' : endpoint.method === 'POST' ? 'text-green-400' : endpoint.method === 'PUT' ? 'text-yellow-400' : 'text-red-400'}`}>
                              {endpoint.method}
                            </span>
                            {endpoint.path.split('/').pop()}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {API_ENDPOINTS.map(category => (
              <div key={category.id} id={category.id} className="mb-12">
                <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-2">{category.name}</h2>
                <p className="mb-6 text-gray-300">{category.description}</p>
                
                {category.endpoints.map(endpoint => (
                  <div 
                    key={`${category.id}-${endpoint.path}`} 
                    id={`${category.id}-${endpoint.path}`}
                    className={`mb-8 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-6 backdrop-blur-sm border ${activeEndpoint === `${category.id}-${endpoint.path}` ? 'border-emerald-500/50' : 'border-gray-700/50'} shadow-xl transition-all duration-300`}
                  >
                    <div className="flex flex-wrap items-center justify-between mb-4">
                      <div className="flex items-center mb-2 md:mb-0">
                        <span className={`inline-block px-2 py-1 rounded text-xs font-bold mr-3 ${endpoint.method === 'GET' ? 'bg-blue-500/20 text-blue-400' : endpoint.method === 'POST' ? 'bg-green-500/20 text-green-400' : endpoint.method === 'PUT' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                          {endpoint.method}
                        </span>
                        <code className="text-white font-mono">{endpoint.path}</code>
                      </div>
                      <button 
                        onClick={() => copyToClipboard(endpoint.path, `${category.id}-${endpoint.path}`)}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {copiedEndpoint === `${category.id}-${endpoint.path}` ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
                      </button>
                    </div>
                    
                    <p className="mb-4 text-gray-300">{endpoint.description}</p>
                    
                    {endpoint.parameters.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-lg font-bold mb-2 text-emerald-400">Parameters</h4>
                        <div className="bg-gray-900/50 rounded-lg overflow-hidden">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-gray-800/80">
                                <th className="px-4 py-2 text-gray-300">Name</th>
                                <th className="px-4 py-2 text-gray-300">Type</th>
                                <th className="px-4 py-2 text-gray-300">Required</th>
                                <th className="px-4 py-2 text-gray-300">Description</th>
                              </tr>
                            </thead>
                            <tbody>
                              {endpoint.parameters.map((param, index) => (
                                <tr key={index} className="border-t border-gray-800">
                                  <td className="px-4 py-2 font-mono text-emerald-400">{param.name}</td>
                                  <td className="px-4 py-2 text-blue-400">{param.type}</td>
                                  <td className="px-4 py-2">{param.required ? 'Yes' : 'No'}</td>
                                  <td className="px-4 py-2 text-gray-300">{param.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <h4 className="text-lg font-bold mb-2 text-emerald-400">Response</h4>
                      <div className="relative bg-gray-900/50 rounded-lg p-4 border border-gray-800">
                        <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
                          {endpoint.response}
                        </pre>
                        <button 
                          onClick={() => copyToClipboard(endpoint.response, `${category.id}-${endpoint.path}-response`)}
                          className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
                        >
                          {copiedEndpoint === `${category.id}-${endpoint.path}-response` ? <FiCheck className="h-5 w-5" /> : <FiCopy className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Additional Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiCode className="mr-2 text-emerald-400" /> SDKs & Libraries
              </h3>
              <p className="text-gray-300 mb-4">
                We provide official client libraries for several languages to make integrating with our API even easier.
              </p>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/docs/api/sdk/javascript"
                    className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    JavaScript SDK <FiExternalLink className="ml-2" />
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/docs/api/sdk/python"
                    className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
                  >
                    Python SDK <FiExternalLink className="ml-2" />
                  </Link>
                </li>
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 rounded-xl p-6 border border-gray-700/50 shadow-lg">
              <h3 className="text-xl font-bold mb-3 flex items-center">
                <FiCode className="mr-2 text-emerald-400" /> API Changelog
              </h3>
              <p className="text-gray-300 mb-4">
                Stay up to date with the latest changes and improvements to our API.
              </p>
              <Link 
                href="/docs/api/changelog"
                className="inline-flex items-center text-emerald-400 hover:text-emerald-300 transition-colors"
              >
                View API Changelog <FiExternalLink className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
