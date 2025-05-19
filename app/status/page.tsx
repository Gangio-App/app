'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import NavigationBar from '@/components/NavigationBar';
import ThreeBackground from '@/components/ui/ThreeBackground';
import Link from 'next/link';
import Image from 'next/image';
import { FiArrowRight, FiServer, FiCpu, FiDatabase, FiGlobe, FiAlertCircle, FiCheckCircle, FiClock, FiActivity, FiCalendar } from 'react-icons/fi';
import { HiOutlineStatusOnline, HiOutlineChartBar, HiOutlineClock, HiOutlineGlobe } from 'react-icons/hi';
import { IoRocketOutline } from 'react-icons/io5';

export default function StatusPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');

  // Handle authentication
  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error retrieving user from localStorage:', error);
      }
    }
  }, []);

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
      }
    }
  };

  // System status data
  const systemStatus = {
    overall: 'operational',
    lastUpdated: 'May 10, 2025 18:30 UTC',
    uptime: '99.98%',
    components: [
      { 
        name: 'API Services', 
        status: 'operational', 
        uptime: '99.99%', 
        description: 'Core API endpoints and services',
        lastIncident: null
      },
      { 
        name: 'Voice Servers', 
        status: 'operational', 
        uptime: '99.95%', 
        description: 'Voice chat and audio streaming services',
        lastIncident: 'May 2, 2025 - 15 min outage'
      },
      { 
        name: 'Media CDN', 
        status: 'operational', 
        uptime: '100%', 
        description: 'Content delivery network for images and media',
        lastIncident: null
      },
      { 
        name: 'Authentication', 
        status: 'operational', 
        uptime: '99.99%', 
        description: 'User authentication and authorization services',
        lastIncident: null
      },
      { 
        name: 'Database Clusters', 
        status: 'operational', 
        uptime: '99.98%', 
        description: 'Primary and replica database clusters',
        lastIncident: 'April 28, 2025 - 5 min degraded performance'
      }
    ],
    regions: [
      { name: 'North America', status: 'operational', latency: '28ms' },
      { name: 'Europe', status: 'operational', latency: '42ms' },
      { name: 'Asia Pacific', status: 'operational', latency: '85ms' },
      { name: 'South America', status: 'operational', latency: '110ms' },
      { name: 'Australia', status: 'operational', latency: '120ms' }
    ],
    incidents: [
      {
        date: 'May 2, 2025',
        title: 'Voice Server Outage',
        duration: '15 minutes',
        status: 'resolved',
        description: 'Voice servers in the EU region experienced an outage due to a network issue with our cloud provider. All services were restored within 15 minutes.',
        components: ['Voice Servers'],
        regions: ['Europe']
      },
      {
        date: 'April 28, 2025',
        title: 'Database Performance Degradation',
        duration: '5 minutes',
        status: 'resolved',
        description: 'Our primary database cluster experienced performance degradation due to an unexpected spike in traffic. The issue was resolved by scaling up database resources.',
        components: ['Database Clusters'],
        regions: ['Global']
      },
      {
        date: 'April 15, 2025',
        title: 'API Rate Limiting Issues',
        duration: '25 minutes',
        status: 'resolved',
        description: 'Some users experienced rate limiting errors when making API requests. The issue was resolved by adjusting our rate limiting configuration.',
        components: ['API Services'],
        regions: ['North America', 'Europe']
      }
    ]
  };

  // Performance metrics data
  const performanceMetrics = {
    '24h': {
      apiLatency: [28, 30, 27, 29, 31, 30, 28, 27, 26, 28, 29, 30, 31, 32, 30, 29, 28, 27, 29, 30, 31, 29, 28, 27],
      errorRate: [0.02, 0.01, 0.02, 0.03, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01, 0.02, 0.03, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01, 0.02, 0.01, 0.01],
      requestVolume: [8500, 7200, 5800, 4500, 3900, 3500, 4200, 6800, 9500, 12000, 14500, 15800, 16200, 16500, 16300, 15800, 14500, 13200, 12500, 11800, 10500, 9800, 8900, 8200],
      cpuUsage: [45, 42, 38, 35, 32, 30, 35, 42, 55, 65, 72, 78, 80, 82, 80, 78, 72, 68, 65, 62, 58, 55, 50, 47]
    },
    '7d': {
      apiLatency: [29, 28, 30, 31, 29, 28, 27],
      errorRate: [0.015, 0.018, 0.022, 0.019, 0.017, 0.016, 0.014],
      requestVolume: [9800, 9500, 9900, 10200, 10500, 9800, 9600],
      cpuUsage: [58, 55, 60, 62, 59, 56, 54]
    },
    '30d': {
      apiLatency: [30, 29, 28, 30, 31, 32, 30, 29, 28, 29, 30, 31, 30, 29, 28, 27, 28, 29, 30, 31, 30, 29, 28, 29, 30, 31, 30, 29, 28, 27],
      errorRate: [0.02, 0.018, 0.019, 0.022, 0.02, 0.018, 0.017, 0.016, 0.018, 0.02, 0.022, 0.02, 0.018, 0.016, 0.015, 0.016, 0.018, 0.02, 0.022, 0.02, 0.018, 0.016, 0.015, 0.016, 0.018, 0.02, 0.018, 0.016, 0.015, 0.014],
      requestVolume: [9500, 9600, 9700, 9800, 9900, 10000, 9900, 9800, 9700, 9800, 9900, 10000, 10100, 10000, 9900, 9800, 9700, 9800, 9900, 10000, 10100, 10000, 9900, 9800, 9700, 9800, 9900, 9800, 9700, 9600],
      cpuUsage: [55, 56, 57, 58, 60, 62, 60, 58, 56, 57, 58, 60, 62, 60, 58, 56, 55, 56, 58, 60, 62, 60, 58, 56, 55, 56, 57, 56, 55, 54]
    }
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'text-green-400';
      case 'degraded': return 'text-yellow-400';
      case 'partial_outage': return 'text-orange-400';
      case 'major_outage': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <FiCheckCircle className="text-green-400" />;
      case 'degraded': return <FiActivity className="text-yellow-400" />;
      case 'partial_outage': return <FiAlertCircle className="text-orange-400" />;
      case 'major_outage': return <FiAlertCircle className="text-red-400" />;
      default: return <FiActivity className="text-gray-400" />;
    }
  };

  // Get component icon
  const getComponentIcon = (name: string) => {
    if (name.includes('API')) return <FiServer className="text-blue-400" />;
    if (name.includes('Voice')) return <FiCpu className="text-purple-400" />;
    if (name.includes('Media')) return <FiGlobe className="text-green-400" />;
    if (name.includes('Auth')) return <FiCheckCircle className="text-yellow-400" />;
    if (name.includes('Database')) return <FiDatabase className="text-red-400" />;
    return <FiServer className="text-gray-400" />;
  };

  // Simple chart component
  const SimpleChart = ({ data, color, height = 40, showDots = false }: { data: number[], color: string, height?: number, showDots?: boolean }) => {
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;
    
    return (
      <div className="w-full" style={{ height: `${height}px` }}>
        <svg width="100%" height="100%" viewBox={`0 0 ${data.length} ${height}`} preserveAspectRatio="none">
          <polyline
            points={data.map((value, index) => {
              const y = height - ((value - min) / range) * height;
              return `${index},${y}`;
            }).join(' ')}
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {showDots && data.map((value, index) => {
            const y = height - ((value - min) / range) * height;
            return (
              <circle
                key={index}
                cx={index}
                cy={y}
                r="1.5"
                fill={color}
              />
            );
          })}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <NavigationBar currentUser={currentUser} />
      <div className="pt-20"> {/* Padding for fixed navbar */}
        <ThreeBackground preset="landing" />
        
        {/* Noise overlay for texture */}
        <div className="absolute inset-0 bg-[url('/assets/noise.svg')] opacity-[0.02] pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
          >
            <motion.div className="text-center mb-16" variants={fadeInUp}>
              <div className="inline-block p-2 px-4 bg-emerald-500/10 rounded-full mb-4 border border-emerald-500/20">
                <div className="flex items-center space-x-2">
                  <HiOutlineStatusOnline className="text-emerald-400" />
                  <span className="text-emerald-300 font-medium">System Status</span>
                </div>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">System Status</span>
              </h1>
              
              <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                Check the current status of GANGIO services and view performance metrics.
              </p>
              
              {/* Current Status */}
              <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl mb-16 max-w-3xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <div className={`w-4 h-4 rounded-full ${systemStatus.overall === 'operational' ? 'bg-green-500' : 'bg-red-500'} mr-3 animate-pulse`}></div>
                  <h2 className="text-2xl font-bold">All Systems {systemStatus.overall === 'operational' ? 'Operational' : 'Experiencing Issues'}</h2>
                </div>
                <p className="text-gray-300 mb-2">
                  Uptime: <span className="font-semibold text-white">{systemStatus.uptime}</span> in the last 30 days
                </p>
                <p className="text-gray-400 text-sm">
                  Last updated: {systemStatus.lastUpdated}
                </p>
              </div>
            </motion.div>

            {/* Component Status */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Component Status</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemStatus.components.map((component, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300"
                    variants={fadeInUp}
                    whileHover={{ y: -5 }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        {getComponentIcon(component.name)}
                        <h3 className="text-xl font-bold ml-3">{component.name}</h3>
                      </div>
                      <div className="flex items-center">
                        {getStatusIcon(component.status)}
                        <span className={`ml-2 ${getStatusColor(component.status)}`}>
                          {component.status === 'operational' ? 'Operational' : 'Issues Detected'}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-400 mb-3">{component.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Uptime: <span className="text-white">{component.uptime}</span></span>
                      {component.lastIncident && (
                        <span className="text-gray-500">Last incident: <span className="text-white">{component.lastIncident}</span></span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Regional Status */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Regional Status</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                {systemStatus.regions.map((region, index) => (
                  <motion.div 
                    key={index}
                    className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-xl border border-gray-700/50 text-center"
                    variants={fadeInUp}
                  >
                    <HiOutlineGlobe className="text-2xl mx-auto mb-2 text-blue-400" />
                    <h3 className="text-lg font-bold mb-1">{region.name}</h3>
                    <div className={`inline-flex items-center ${getStatusColor(region.status)}`}>
                      <div className={`w-2 h-2 rounded-full ${region.status === 'operational' ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                      <span className="text-sm">
                        {region.status === 'operational' ? 'Operational' : 'Issues'}
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mt-2">Latency: {region.latency}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Performance Metrics */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-2xl font-bold mb-4 text-center">Performance Metrics</h2>
              <p className="text-gray-400 text-center mb-8 max-w-2xl mx-auto">
                View key performance metrics for our services over time.
              </p>
              
              {/* Timeframe selector */}
              <div className="flex justify-center mb-8">
                <div className="inline-flex bg-gray-800/70 rounded-lg p-1">
                  <button 
                    onClick={() => setTimeframe('24h')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeframe === '24h' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    24 Hours
                  </button>
                  <button 
                    onClick={() => setTimeframe('7d')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeframe === '7d' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    7 Days
                  </button>
                  <button 
                    onClick={() => setTimeframe('30d')}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${timeframe === '30d' ? 'bg-emerald-500 text-white' : 'text-gray-400 hover:text-white'}`}
                  >
                    30 Days
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* API Latency */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">API Latency</h3>
                    <span className="text-emerald-400 font-semibold">
                      {performanceMetrics[timeframe].apiLatency[performanceMetrics[timeframe].apiLatency.length - 1]}ms
                    </span>
                  </div>
                  <SimpleChart 
                    data={performanceMetrics[timeframe].apiLatency} 
                    color="#10b981" 
                    height={80}
                    showDots={timeframe === '7d'} 
                  />
                </div>
                
                {/* Error Rate */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Error Rate</h3>
                    <span className="text-emerald-400 font-semibold">
                      {(performanceMetrics[timeframe].errorRate[performanceMetrics[timeframe].errorRate.length - 1] * 100).toFixed(2)}%
                    </span>
                  </div>
                  <SimpleChart 
                    data={performanceMetrics[timeframe].errorRate} 
                    color="#f87171" 
                    height={80}
                    showDots={timeframe === '7d'} 
                  />
                </div>
                
                {/* Request Volume */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">Request Volume</h3>
                    <span className="text-emerald-400 font-semibold">
                      {performanceMetrics[timeframe].requestVolume[performanceMetrics[timeframe].requestVolume.length - 1].toLocaleString()} req/min
                    </span>
                  </div>
                  <SimpleChart 
                    data={performanceMetrics[timeframe].requestVolume} 
                    color="#60a5fa" 
                    height={80}
                    showDots={timeframe === '7d'} 
                  />
                </div>
                
                {/* CPU Usage */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold">CPU Usage</h3>
                    <span className="text-emerald-400 font-semibold">
                      {performanceMetrics[timeframe].cpuUsage[performanceMetrics[timeframe].cpuUsage.length - 1]}%
                    </span>
                  </div>
                  <SimpleChart 
                    data={performanceMetrics[timeframe].cpuUsage} 
                    color="#a78bfa" 
                    height={80}
                    showDots={timeframe === '7d'} 
                  />
                </div>
              </div>
            </motion.div>

            {/* Recent Incidents */}
            <motion.div variants={fadeInUp} className="mb-16">
              <h2 className="text-2xl font-bold mb-8 text-center">Recent Incidents</h2>
              
              {systemStatus.incidents.length > 0 ? (
                <div className="space-y-6">
                  {systemStatus.incidents.map((incident, index) => (
                    <div 
                      key={index}
                      className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{incident.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <FiCalendar className="mr-1" />
                            <span>{incident.date}</span>
                            <span className="mx-2">•</span>
                            <FiClock className="mr-1" />
                            <span>Duration: {incident.duration}</span>
                          </div>
                        </div>
                        <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm font-medium rounded-full border border-green-500/30">
                          Resolved
                        </span>
                      </div>
                      <p className="text-gray-300 mb-4">{incident.description}</p>
                      <div className="flex flex-wrap gap-2">
                        {incident.components.map((component, i) => (
                          <span key={i} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-md">
                            {component}
                          </span>
                        ))}
                        {incident.regions.map((region, i) => (
                          <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded-md">
                            {region}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <p>No incidents in the last 30 days.</p>
                </div>
              )}
            </motion.div>

            {/* Subscribe to Updates */}
            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center"
            >
              <h2 className="text-2xl font-bold mb-4">Stay Informed</h2>
              <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
                Subscribe to receive notifications about system status and incidents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
                />
                <button className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg font-medium transition-all duration-300 flex items-center justify-center">
                  Subscribe
                  <FiArrowRight className="ml-2" />
                </button>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
