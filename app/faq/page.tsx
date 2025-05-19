'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { FiArrowRight, FiPlus, FiMinus, FiSearch } from 'react-icons/fi';

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('general');
  const [expandedQuestions, setExpandedQuestions] = useState<number[]>([]);

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

  // FAQ categories
  const categories = [
    { id: 'general', name: 'General' },
    { id: 'account', name: 'Account' },
    { id: 'features', name: 'Features' },
    { id: 'pricing', name: 'Pricing' },
    { id: 'technical', name: 'Technical' },
    { id: 'security', name: 'Security' }
  ];

  // FAQ data
  const faqData = {
    general: [
      {
        id: 1,
        question: "What is GANGIO?",
        answer: "GANGIO is a communication platform designed specifically for gamers. It provides features like voice chat, screen sharing, and game integration to enhance your gaming experience and help you connect with fellow gamers."
      },
      {
        id: 2,
        question: "How is GANGIO different from other communication platforms?",
        answer: "GANGIO is built from the ground up with gamers in mind. We offer features specifically tailored for gaming communities, including low-latency voice chat, game integration, squad finder, and more. Our platform is optimized for performance during gaming sessions and provides a seamless experience across desktop, mobile, and web."
      },
      {
        id: 3,
        question: "Is GANGIO free to use?",
        answer: "Yes, GANGIO offers a free tier with all the essential features you need. We also offer GANGIO Pro, a premium subscription with enhanced features for serious gamers and larger communities."
      },
      {
        id: 4,
        question: "Which platforms does GANGIO support?",
        answer: "GANGIO is available on Windows, macOS, Linux, iOS, Android, and web browsers. You can use GANGIO on virtually any device with an internet connection."
      }
    ],
    account: [
      {
        id: 5,
        question: "How do I create a GANGIO account?",
        answer: "To create a GANGIO account, download the app or visit our website and click on the 'Sign Up' button. You'll need to provide an email address, create a username and password, and verify your email to complete the registration process."
      },
      {
        id: 6,
        question: "Can I change my username?",
        answer: "Yes, you can change your username in your account settings. However, username changes are limited to once every 30 days to maintain community stability."
      },
      {
        id: 7,
        question: "How do I reset my password?",
        answer: "If you've forgotten your password, click on the 'Forgot Password' link on the login page. We'll send you an email with instructions to reset your password. Make sure to check your spam folder if you don't see the email in your inbox."
      },
      {
        id: 8,
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account from your account settings. Please note that account deletion is permanent and will remove all your data from our servers after a 30-day grace period."
      }
    ],
    features: [
      {
        id: 9,
        question: "How does voice chat work in GANGIO?",
        answer: "GANGIO's voice chat uses advanced audio processing technology to provide crystal-clear communication with low latency. You can join voice channels in servers or create private calls with friends. Features include noise suppression, echo cancellation, and adjustable input sensitivity."
      },
      {
        id: 10,
        question: "Can I share my screen during gaming sessions?",
        answer: "Yes, GANGIO allows you to share your screen with friends or server members. You can choose to share your entire screen or a specific application, and adjust the resolution and frame rate to balance quality and performance."
      },
      {
        id: 11,
        question: "What games are supported for integration?",
        answer: "GANGIO supports integration with over 100 popular games, including titles like League of Legends, Fortnite, Valorant, Minecraft, and more. Game integration allows for rich presence (showing what you're playing), one-click game invites, and game-specific chat channels."
      },
      {
        id: 12,
        question: "How does the Squad Finder feature work?",
        answer: "Squad Finder helps you find gaming partners based on your preferences, skill level, and play style. You can filter by game, region, and skill level, and schedule gaming sessions with matched players. The feature also includes a player reputation system to ensure quality matches."
      }
    ],
    pricing: [
      {
        id: 13,
        question: "What's included in the free version of GANGIO?",
        answer: "The free version of GANGIO includes all essential features: voice chat, text messaging, screen sharing, basic server management, and game integration. There are some limitations on server size, voice quality, and advanced features."
      },
      {
        id: 14,
        question: "What additional features do I get with GANGIO Pro?",
        answer: "GANGIO Pro includes enhanced features such as higher voice quality (128kbps), larger upload size (100MB), HD video streaming, custom server themes, advanced analytics, priority support, and early access to new features."
      },
      {
        id: 15,
        question: "How much does GANGIO Pro cost?",
        answer: "GANGIO Pro is available for $9.99 per month or $99.99 per year (saving you about 17%). We also offer team and organization plans with custom pricing for larger communities."
      },
      {
        id: 16,
        question: "Can I cancel my GANGIO Pro subscription?",
        answer: "Yes, you can cancel your GANGIO Pro subscription at any time from your account settings. You'll continue to have access to Pro features until the end of your current billing period."
      }
    ],
    technical: [
      {
        id: 17,
        question: "What are the system requirements for GANGIO?",
        answer: "For desktop: Windows 8+ / macOS 10.13+ / Linux, 4GB RAM, and a modern processor. For mobile: iOS 13+ or Android 8+. For web: A modern browser like Chrome, Firefox, Safari, or Edge."
      },
      {
        id: 18,
        question: "How much bandwidth does GANGIO use?",
        answer: "GANGIO is designed to be bandwidth-efficient. Voice chat uses about 30-50KB/s, while video and screen sharing can use 100KB/s to 1MB/s depending on the quality settings you choose."
      },
      {
        id: 19,
        question: "Why is my voice chat not working?",
        answer: "If your voice chat isn't working, check your microphone settings in GANGIO and your system settings. Make sure you have the correct input device selected and that your microphone isn't muted. Also check your internet connection and firewall settings, as they might be blocking the voice traffic."
      },
      {
        id: 20,
        question: "How do I report bugs or technical issues?",
        answer: "You can report bugs and technical issues through the Help & Support section in the app or by emailing support@gangio.com. Please include as much detail as possible, including steps to reproduce the issue, your device information, and screenshots if applicable."
      }
    ],
    security: [
      {
        id: 21,
        question: "Is my data secure on GANGIO?",
        answer: "Yes, we take security seriously. All communication on GANGIO is encrypted in transit, and we implement industry-standard security measures to protect your data. We also offer features like two-factor authentication to help you secure your account."
      },
      {
        id: 22,
        question: "How does GANGIO handle my personal information?",
        answer: "GANGIO collects only the information necessary to provide our services. We don't sell your personal data to third parties. You can review our Privacy Policy for detailed information on how we collect, use, and protect your data."
      },
      {
        id: 23,
        question: "What should I do if I think my account has been compromised?",
        answer: "If you suspect your account has been compromised, change your password immediately and enable two-factor authentication if you haven't already. Contact our support team at security@gangio.com for additional assistance."
      },
      {
        id: 24,
        question: "How does GANGIO moderate content and enforce community guidelines?",
        answer: "GANGIO uses a combination of automated systems and human moderators to enforce our Community Guidelines. Server owners also have moderation tools to manage their communities. Users can report violations, and our team reviews these reports promptly to take appropriate action."
      }
    ]
  };

  // Toggle question expansion
  const toggleQuestion = (id: number) => {
    if (expandedQuestions.includes(id)) {
      setExpandedQuestions(expandedQuestions.filter(qId => qId !== id));
    } else {
      setExpandedQuestions([...expandedQuestions, id]);
    }
  };

  // Filter questions based on search
  const filteredQuestions = searchQuery
    ? Object.values(faqData).flat().filter(q => 
        q.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        q.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqData[activeCategory as keyof typeof faqData];

  return (
    <PageLayout>
      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Frequently Asked Questions</span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Find answers to common questions about GANGIO. Can't find what you're looking for? Contact our support team.
            </p>
            
            {/* Search */}
            <div className="max-w-xl mx-auto mb-12">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white pl-10"
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              </div>
            </div>
          </motion.div>

          {!searchQuery && (
            <motion.div className="flex flex-wrap justify-center gap-2 mb-12" variants={fadeInUp}>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-2 rounded-full transition-all duration-300 text-sm ${
                    category.id === activeCategory
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </motion.div>
          )}

          {/* FAQ Questions */}
          <motion.div 
            className="space-y-4"
            variants={staggerContainer}
          >
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((item) => (
                <motion.div
                  key={item.id}
                  className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl backdrop-blur-sm border border-gray-700/50 shadow-xl overflow-hidden"
                  variants={fadeInUp}
                >
                  <button
                    onClick={() => toggleQuestion(item.id)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <h3 className="text-lg font-medium text-white pr-8">{item.question}</h3>
                    <div className="flex-shrink-0">
                      {expandedQuestions.includes(item.id) ? (
                        <FiMinus className="text-emerald-400" />
                      ) : (
                        <FiPlus className="text-emerald-400" />
                      )}
                    </div>
                  </button>
                  <AnimatePresence>
                    {expandedQuestions.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 pt-0 text-gray-300 border-t border-gray-700/50">
                          <p>{item.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-400">No questions found matching your search criteria.</p>
                <button 
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md transition-colors"
                >
                  Clear search
                </button>
              </div>
            )}
          </motion.div>

          {/* Contact Support */}
          <motion.div 
            variants={fadeInUp}
            className="mt-16 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl text-center"
          >
            <h2 className="text-2xl font-bold mb-4">Still Have Questions?</h2>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              If you couldn't find the answer you were looking for, our support team is here to help.
            </p>
            <Link 
              href="/support" 
              className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-md font-medium transition-all duration-300 inline-flex items-center justify-center"
            >
              Contact Support
              <FiArrowRight className="ml-2" />
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
