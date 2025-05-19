'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function PrivacyPolicyPage() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <PageLayout>
      <div className="relative max-w-4xl mx-auto px-6 py-16 md:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.2 } } }}
        >
          <motion.div className="mb-12" variants={fadeInUp}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center">
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Privacy Policy</span>
            </h1>
            
            <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto text-center">
              Last updated: May 10, 2025
            </p>
          </motion.div>

          <motion.div 
            className="prose prose-lg prose-invert max-w-none"
            variants={fadeInUp}
          >
            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Introduction</h2>
              <p>
                GANGIO ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our communication platform and services.
              </p>
              <p>
                Please read this Privacy Policy carefully. By accessing or using our services, you acknowledge that you have read, understood, and agree to be bound by all the terms of this Privacy Policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Information We Collect</h2>
              <p>
                We collect several types of information from and about users of our services, including:
              </p>
              <h3>Personal Information</h3>
              <p>
                Personal information is data that can be used to identify you individually, such as:
              </p>
              <ul>
                <li>Email address</li>
                <li>Username and password</li>
                <li>Profile information (such as profile picture, display name, and bio)</li>
                <li>IP address and device information</li>
                <li>Payment information (if you subscribe to GANGIO Pro)</li>
              </ul>

              <h3>Non-Personal Information</h3>
              <p>
                We also collect non-personal information that does not directly identify you, such as:
              </p>
              <ul>
                <li>Usage data (features used, time spent, etc.)</li>
                <li>Device and browser information</li>
                <li>Cookies and similar technologies</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>How We Collect Information</h2>
              <p>
                We collect information in several ways:
              </p>
              <ul>
                <li><strong>Direct Collection:</strong> Information you provide when you register, create a profile, or use our services.</li>
                <li><strong>Automated Collection:</strong> Information collected automatically through cookies, web beacons, and other tracking technologies.</li>
                <li><strong>Third-Party Sources:</strong> Information we may receive from third-party services if you choose to link them to your GANGIO account.</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>How We Use Your Information</h2>
              <p>
                We use the information we collect for various purposes, including:
              </p>
              <ul>
                <li>Providing, maintaining, and improving our services</li>
                <li>Processing transactions and managing your account</li>
                <li>Personalizing your experience</li>
                <li>Communicating with you about updates, features, and support</li>
                <li>Analyzing usage patterns to enhance our services</li>
                <li>Protecting our services and users from abuse and violations</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Disclosure of Your Information</h2>
              <p>
                We may disclose your information in the following circumstances:
              </p>
              <ul>
                <li><strong>With Your Consent:</strong> We may share information with third parties when you consent to such sharing.</li>
                <li><strong>Service Providers:</strong> We may share information with third-party vendors and service providers who need access to your information to help us provide our services.</li>
                <li><strong>Legal Requirements:</strong> We may disclose information if required to do so by law or in response to valid requests by public authorities.</li>
                <li><strong>Business Transfers:</strong> If we are involved in a merger, acquisition, or sale of all or a portion of our assets, your information may be transferred as part of that transaction.</li>
                <li><strong>Protection of Rights:</strong> We may disclose information to protect the rights, property, or safety of GANGIO, our users, or others.</li>
              </ul>
              <p>
                We do not sell your personal information to third parties.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Data Security</h2>
              <p>
                We implement appropriate technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, and destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </p>
              <p>
                We encourage you to help us protect your information by:
              </p>
              <ul>
                <li>Using strong, unique passwords</li>
                <li>Enabling two-factor authentication</li>
                <li>Being cautious about the information you share</li>
                <li>Logging out of your account when using shared devices</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Your Privacy Rights</h2>
              <p>
                Depending on your location, you may have certain rights regarding your personal information, including:
              </p>
              <ul>
                <li>The right to access and receive a copy of your personal information</li>
                <li>The right to rectify or update your personal information</li>
                <li>The right to delete your personal information</li>
                <li>The right to restrict or object to processing of your personal information</li>
                <li>The right to data portability</li>
                <li>The right to withdraw consent</li>
              </ul>
              <p>
                To exercise these rights, please contact us using the information provided in the "Contact Us" section below.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Children's Privacy</h2>
              <p>
                Our services are not intended for children under the age of 13, and we do not knowingly collect personal information from children under 13. If you are a parent or guardian and believe that your child has provided us with personal information, please contact us, and we will delete such information from our systems.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>International Data Transfers</h2>
              <p>
                Your information may be transferred to and processed in countries other than the country in which you reside. These countries may have data protection laws that are different from the laws of your country. We take appropriate measures to ensure that your personal information receives an adequate level of protection in the countries in which we process it.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Changes to Our Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. If we make material changes, we will notify you by email or by posting a notice on our website prior to the changes becoming effective. We encourage you to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us at:
              </p>
              <p>
                Email: privacy@gangio.com<br />
                Address: 123 Gaming Street, San Francisco, CA 94105, USA
              </p>
            </div>
          </motion.div>

          {/* Related Links */}
          <motion.div 
            variants={fadeInUp}
            className="mt-12 bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-md rounded-2xl p-8 border border-gray-700/50 shadow-2xl"
          >
            <h2 className="text-2xl font-bold mb-6">Related Policies</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link 
                href="/terms" 
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Terms of Service</span>
                <FiArrowRight />
              </Link>
              <Link 
                href="/cookies" 
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Cookie Policy</span>
                <FiArrowRight />
              </Link>
              <Link 
                href="/community-guidelines" 
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Community Guidelines</span>
                <FiArrowRight />
              </Link>
              <Link 
                href="/legal" 
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Legal Information</span>
                <FiArrowRight />
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </PageLayout>
  );
}
