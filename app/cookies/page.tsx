'use client';

import React from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/PageLayout';
import Link from 'next/link';
import { FiArrowRight } from 'react-icons/fi';

export default function CookiePolicyPage() {
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
              <span className="bg-gradient-to-r from-emerald-400 to-teal-500 bg-clip-text text-transparent">Cookie Policy</span>
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
                This Cookie Policy explains how GANGIO ("we", "our", or "us") uses cookies and similar technologies to recognize you when you visit our website and use our services. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
              </p>
              <p>
                This Cookie Policy should be read together with our Privacy Policy and Terms of Service.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>What Are Cookies?</h2>
              <p>
                Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners to make their websites work, or to work more efficiently, as well as to provide reporting information.
              </p>
              <p>
                Cookies set by the website owner (in this case, GANGIO) are called "first-party cookies". Cookies set by parties other than the website owner are called "third-party cookies". Third-party cookies enable third-party features or functionality to be provided on or through the website (e.g., advertising, interactive content, and analytics). The parties that set these third-party cookies can recognize your computer both when it visits the website in question and also when it visits certain other websites.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Why Do We Use Cookies?</h2>
              <p>
                We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website and services to operate, and we refer to these as "essential" or "strictly necessary" cookies. Other cookies also enable us to track and target the interests of our users to enhance the experience on our website and services. Third parties serve cookies through our website for advertising, analytics, and other purposes.
              </p>
              <p>
                The specific types of first and third-party cookies served through our website and services and the purposes they perform are described below.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Types of Cookies We Use</h2>
              <h3>Essential Cookies</h3>
              <p>
                These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas. Because these cookies are strictly necessary to deliver the website, you cannot refuse them without impacting how our website functions.
              </p>
              <h3>Performance and Functionality Cookies</h3>
              <p>
                These cookies are used to enhance the performance and functionality of our website but are non-essential to their use. However, without these cookies, certain functionality may become unavailable.
              </p>
              <h3>Analytics and Customization Cookies</h3>
              <p>
                These cookies collect information that is used either in aggregate form to help us understand how our website is being used or how effective our marketing campaigns are, or to help us customize our website for you.
              </p>
              <h3>Advertising Cookies</h3>
              <p>
                These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.
              </p>
              <h3>Social Media Cookies</h3>
              <p>
                These cookies are used to enable you to share pages and content that you find interesting on our website through third-party social networking and other websites. These cookies may also be used for advertising purposes.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>How Can You Control Cookies?</h2>
              <p>
                You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by clicking on the appropriate opt-out links provided in the cookie banner on our website.
              </p>
              <p>
                You can also set or amend your web browser controls to accept or refuse cookies. If you choose to reject cookies, you may still use our website though your access to some functionality and areas of our website may be restricted. As the means by which you can refuse cookies through your web browser controls vary from browser to browser, you should visit your browser's help menu for more information.
              </p>
              <p>
                In addition, most advertising networks offer you a way to opt out of targeted advertising. If you would like to find out more information, please visit <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer">http://www.aboutads.info/choices/</a> or <a href="http://www.youronlinechoices.com" target="_blank" rel="noopener noreferrer">http://www.youronlinechoices.com</a>.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Cookies We Use</h2>
              <p>
                The specific cookies we use may change from time to time, but here are the main categories of cookies we use and what we use them for:
              </p>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-700 p-2 text-left">Cookie Name</th>
                    <th className="border border-gray-700 p-2 text-left">Purpose</th>
                    <th className="border border-gray-700 p-2 text-left">Duration</th>
                    <th className="border border-gray-700 p-2 text-left">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 p-2">_ga</td>
                    <td className="border border-gray-700 p-2">Used to distinguish users for Google Analytics</td>
                    <td className="border border-gray-700 p-2">2 years</td>
                    <td className="border border-gray-700 p-2">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">_gid</td>
                    <td className="border border-gray-700 p-2">Used to distinguish users for Google Analytics</td>
                    <td className="border border-gray-700 p-2">24 hours</td>
                    <td className="border border-gray-700 p-2">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">_gat</td>
                    <td className="border border-gray-700 p-2">Used to throttle request rate for Google Analytics</td>
                    <td className="border border-gray-700 p-2">1 minute</td>
                    <td className="border border-gray-700 p-2">Analytics</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">auth_token</td>
                    <td className="border border-gray-700 p-2">Used to keep you logged in to GANGIO</td>
                    <td className="border border-gray-700 p-2">30 days</td>
                    <td className="border border-gray-700 p-2">Essential</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">preferences</td>
                    <td className="border border-gray-700 p-2">Stores your preferences and settings</td>
                    <td className="border border-gray-700 p-2">1 year</td>
                    <td className="border border-gray-700 p-2">Functionality</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 p-2">_fbp</td>
                    <td className="border border-gray-700 p-2">Used by Facebook to deliver advertisements</td>
                    <td className="border border-gray-700 p-2">3 months</td>
                    <td className="border border-gray-700 p-2">Advertising</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Other Tracking Technologies</h2>
              <p>
                In addition to cookies, we may use other similar technologies like web beacons (sometimes called "tracking pixels" or "clear gifs"). These are tiny graphics files that contain a unique identifier that enable us to recognize when someone has visited our website or opened an email that we have sent them. This allows us, for example, to monitor the traffic patterns of users from one page within our website to another, to deliver or communicate with cookies, to understand whether you have come to our website from an online advertisement displayed on a third-party website, to improve site performance, and to measure the success of email marketing campaigns. In many instances, these technologies are reliant on cookies to function properly, and so declining cookies will impair their functioning.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Do Not Track</h2>
              <p>
                Some Internet browsers - like Internet Explorer, Firefox, and Safari - include the ability to transmit "Do Not Track" or "DNT" signals. Since uniform standards for "DNT" signals have not been adopted, our website does not currently process or respond to "DNT" signals.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Changes to Our Cookie Policy</h2>
              <p>
                We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
              </p>
              <p>
                The date at the top of this Cookie Policy indicates when it was last updated.
              </p>
            </div>

            <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-xl p-8 backdrop-blur-sm border border-gray-700/50 shadow-xl mb-8">
              <h2>Contact Us</h2>
              <p>
                If you have any questions about our use of cookies or other technologies, please contact us at:
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
                href="/privacy" 
                className="p-4 bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 transition-colors flex items-center justify-between"
              >
                <span className="font-medium">Privacy Policy</span>
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
