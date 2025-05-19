'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiInstagram, FiYoutube, FiTwitch, FiLinkedin, FiArrowRight } from 'react-icons/fi';
import { SiDiscord, SiTiktok } from 'react-icons/si';
import { FaXTwitter } from "react-icons/fa6";
import { VscGithubInverted } from "react-icons/vsc";
import { useTranslations } from '@/hooks/useTranslations';

export default function Footer() {
  const { t } = useTranslations();
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800/50 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Logo and description */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-4">
              <img
                src="/assets/logo-text.png"
                alt="GANGIO"
                className="h-8 w-auto"
              />
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a href="https://x.com/gangioapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <FaXTwitter className="h-5 w-5" />
                <span className="sr-only">X.com</span>
              </a>
              <a href="https://instagram.com/gangioapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <FiInstagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </a>
              <a href="https://youtube.com/gangio" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <FiYoutube className="h-5 w-5" />
                <span className="sr-only">YouTube</span>
              </a>
              <a href="https://tiktok.com/@gangioapp" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-emerald-400 transition-colors">
                <VscGithubInverted className="h-5 w-5" />
                <span className="sr-only">Github</span>
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.product')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/download" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.download')}
                </Link>
              </li>
              <li>
                <Link href="/features" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.features')}
                </Link>
              </li>
              <li>
                <Link href="/premium" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.premium')}
                </Link>
              </li>
              <li>
                <Link href="/status" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.status')}
                </Link>
              </li>
              <li>
                <Link href="/changelog" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.changelog')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.company')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link href="/meet-the-gang" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.meetTheGang')}
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.careers')}
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.blog')}
                </Link>
              </li>
              <li>
                <Link href="/branding" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.branding')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">{t('footer.resources')}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/support" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.support')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.faq')}
                </Link>
              </li>
              <li>
                <Link href="/community-guidelines" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.communityGuidelines')}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.termsOfService')}
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-gray-400 hover:text-emerald-400 transition-colors">
                  {t('footer.cookiePolicy')}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="border-t border-gray-800 pt-8 pb-8">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-white font-semibold text-xl mb-2">{t('footer.newsletter.title')}</h3>
            <p className="text-gray-400 mb-4">
              {t('footer.newsletter.description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder={t('footer.newsletter.placeholder')} 
                className="flex-grow px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-white"
              />
              <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium transition-colors duration-300 flex items-center justify-center">
                {t('footer.newsletter.subscribe')}
                <FiArrowRight className="ml-2" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {currentYear} GANGIO. {t('footer.copyright')}
          </p>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              {t('footer.bottomLinks.terms')}
            </Link>
            <Link href="/privacy" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              {t('footer.bottomLinks.privacy')}
            </Link>
            <Link href="/cookies" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              {t('footer.bottomLinks.cookies')}
            </Link>
            <Link href="/legal" className="text-gray-500 hover:text-emerald-400 transition-colors text-sm">
              {t('footer.bottomLinks.legal')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
