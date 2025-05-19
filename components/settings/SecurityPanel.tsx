'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useTranslations } from '@/hooks/useTranslations';
import { motion } from 'framer-motion';

const SecurityPanel: React.FC = () => {
  const { t } = useTranslations();
  const { data: session } = useSession();
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Check if 2FA is already enabled
  useEffect(() => {
    const checkStatus = async () => {
      if (session?.user) {
        try {
          const response = await fetch('/api/2fa/status');
          const data = await response.json();
          setIs2FAEnabled(data.enabled);
        } catch (error) {
          console.error('Error checking 2FA status:', error);
        }
      }
    };

    checkStatus();
  }, [session]);

  // Generate QR code for 2FA setup
  const handleSetup2FA = async () => {
    try {
      const response = await fetch('/api/2fa/setup');
      const data = await response.json();
      
      if (response.ok) {
        setQrCodeUrl(data.qrCodeUrl);
        setSecret(data.secret);
        setIsSetupMode(true);
      } else {
        toast.error(data.message || 'Failed to set up 2FA');
      }
    } catch (error) {
      console.error('Error setting up 2FA:', error);
      toast.error('Could not set up 2FA. Please try again later.');
    }
  };

  // Verify the 6-digit code from Google Authenticator
  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setErrorMessage('Please enter a valid 6-digit code');
      return;
    }

    setIsVerifying(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/2fa/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: verificationCode,
          secret: secret,
        }),
      });

      const data = await response.json();

      if (response.ok && data.verified) {
        toast.success('Two-factor authentication enabled successfully!');
        setIs2FAEnabled(true);
        setIsSetupMode(false);
      } else {
        setErrorMessage(data.message || 'Verification failed. Please try again.');
      }
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setErrorMessage('An error occurred during verification.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Disable 2FA
  const handleDisable2FA = async () => {
    try {
      const response = await fetch('/api/2fa/disable', {
        method: 'POST',
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Two-factor authentication has been disabled.');
        setIs2FAEnabled(false);
        setIsSetupMode(false);
      } else {
        toast.error(data.message || 'Failed to disable 2FA');
      }
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      toast.error('Could not disable 2FA. Please try again later.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">{t('settings.security.title') || 'Security Settings'}</h2>
      
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-xl font-semibold mb-4 text-white">{t('settings.security.twoFactor') || 'Two-Factor Authentication'}</h3>
        
        {!isSetupMode ? (
          <div className="space-y-4">
            <p className="text-gray-300 text-sm">
              {is2FAEnabled 
                ? t('settings.security.2faEnabled') || 'Two-factor authentication is currently enabled for your account.'
                : t('settings.security.2faDisabled') || 'Add an extra layer of security to your account by enabling two-factor authentication.'}
            </p>
            
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${is2FAEnabled ? 'bg-emerald-400' : 'bg-gray-500'}`}></div>
              <span className="text-sm">
                {is2FAEnabled 
                  ? t('settings.security.enabled') || 'Enabled' 
                  : t('settings.security.disabled') || 'Disabled'}
              </span>
            </div>

            <button
              onClick={is2FAEnabled ? handleDisable2FA : handleSetup2FA}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                is2FAEnabled
                  ? 'bg-red-500/20 text-red-300 hover:bg-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
              }`}
            >
              {is2FAEnabled 
                ? t('settings.security.disable2FA') || 'Disable 2FA' 
                : t('settings.security.enable2FA') || 'Enable 2FA'}
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h4 className="font-medium text-white">{t('settings.security.scanQRCode') || 'Scan QR Code'}</h4>
              <p className="text-gray-300 text-sm">
                {t('settings.security.scanInstructions') || 'Scan this QR code with your Google Authenticator app to set up two-factor authentication.'}
              </p>
            </div>

            {qrCodeUrl && (
              <div className="flex justify-center my-6">
                <div className="bg-white p-4 rounded-lg">
                  <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="font-medium text-white">{t('settings.security.enterCode') || 'Enter Verification Code'}</h4>
              <p className="text-gray-300 text-sm">
                {t('settings.security.enterCodeInstructions') || 'Enter the 6-digit code from Google Authenticator to verify setup.'}
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  maxLength={6}
                  placeholder="000000"
                  className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-center text-lg tracking-wider w-full sm:w-48"
                />
                
                <button
                  onClick={handleVerify2FA}
                  disabled={isVerifying || verificationCode.length !== 6}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-900 disabled:text-emerald-700 text-white rounded-md font-medium transition-colors"
                >
                  {isVerifying ? t('settings.security.verifying') || 'Verifying...' : t('settings.security.verify') || 'Verify'}
                </button>
              </div>
              
              {errorMessage && (
                <p className="text-red-400 text-sm mt-2">{errorMessage}</p>
              )}
            </div>

            <div className="pt-4 border-t border-gray-700">
              <button
                onClick={() => setIsSetupMode(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                {t('settings.security.cancel') || 'Cancel'}
              </button>
            </div>
          </motion.div>
        )}
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-xl font-semibold mb-4 text-white">{t('settings.security.backupCodes') || 'Backup Codes'}</h3>
        
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            {t('settings.security.backupCodesInfo') || 'Backup codes can be used to access your account if you lose your device or cannot access your authenticator app.'}
          </p>
          
          <button
            disabled={!is2FAEnabled}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-500 text-white rounded-md text-sm font-medium transition-colors"
          >
            {t('settings.security.generateCodes') || 'Generate Backup Codes'}
          </button>
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700/50">
        <h3 className="text-xl font-semibold mb-4 text-white">{t('settings.security.loginHistory') || 'Login History'}</h3>
        
        <div className="space-y-4">
          <p className="text-gray-300 text-sm">
            {t('settings.security.loginHistoryInfo') || 'Review your recent login activity to ensure your account remains secure.'}
          </p>
          
          <button
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm font-medium transition-colors"
          >
            {t('settings.security.viewHistory') || 'View Login History'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SecurityPanel;
