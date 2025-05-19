import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface DonateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DonationTier {
  id: string;
  name: string;
  amount: number;
  description: string;
  benefits: string[];
  badgeType?: string; // Badge type to assign
}

const DONATION_TIERS: DonationTier[] = [
  {
    id: 'basic',
    name: 'Supporter',
    amount: 5,
    description: 'Support Gangio development',
    benefits: [
      'Supporter badge on your profile',
      'Access to exclusive emotes'
    ],
    badgeType: 'supporter'
  },
  {
    id: 'premium',
    name: 'Premium',
    amount: 10,
    description: 'Get premium features',
    benefits: [
      'Premium badge on your profile',
      'Access to exclusive emotes',
      'Custom profile themes',
      'Animated profile pictures'
    ],
    badgeType: 'premium'
  },
  {
    id: 'pro',
    name: 'Pro',
    amount: 25,
    description: 'Pro features for power users',
    benefits: [
      'Pro badge on your profile',
      'Access to exclusive emotes',
      'Custom profile themes',
      'Animated profile pictures',
      'Higher quality voice and video',
      'Early access to new features'
    ],
    badgeType: 'pro'
  }
];

export const DonateModal: React.FC<DonateModalProps> = ({
  isOpen,
  onClose
}) => {
  const [selectedTier, setSelectedTier] = useState<DonationTier | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal' | 'crypto'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // Get current user on component mount
  useEffect(() => {
    const userJson = localStorage.getItem('currentUser');
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        setCurrentUser(user);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);
  
  if (!isOpen) return null;

  const assignBadgeToUser = async (badgeType: string, userId: string) => {
    try {
      // First check if the badge exists in the database
      const badgesResponse = await fetch(`/api/badges?icon=${badgeType}`);
      let badge;
      
      if (badgesResponse.ok) {
        const badges = await badgesResponse.json();
        badge = badges.find((b: any) => b.icon.toLowerCase() === badgeType.toLowerCase());
      }
      
      // If badge doesn't exist, create it
      if (!badge) {
        const createResponse = await fetch('/api/badges', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: badgeType.charAt(0).toUpperCase() + badgeType.slice(1),
            icon: badgeType.toLowerCase(),
            description: `${badgeType.charAt(0).toUpperCase() + badgeType.slice(1)} badge for donation supporters`
          }),
        });
        
        if (createResponse.ok) {
          badge = await createResponse.json();
        } else {
          console.error('Failed to create badge');
          return;
        }
      }
      
      // Assign the badge to the user
      if (badge) {
        const assignResponse = await fetch('/api/badges/assign', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            badgeId: badge.id
          }),
        });
        
        if (assignResponse.ok) {
          console.log(`${badgeType} badge assigned to user`);
          
          // Update local user data with the new badge
          const updatedUserData = localStorage.getItem('currentUser');
          if (updatedUserData) {
            const user = JSON.parse(updatedUserData);
            if (!user.badges) user.badges = [];
            
            // Check if user already has this badge type
            const hasBadge = user.badges.some((b: any) => 
              b.icon.toLowerCase() === badgeType.toLowerCase()
            );
            
            if (!hasBadge) {
              user.badges.push(badge);
              localStorage.setItem('currentUser', JSON.stringify(user));
            }
          }
        }
      }
    } catch (error) {
      console.error('Error assigning badge:', error);
    }
  };

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to donate');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate processing
    setTimeout(async () => {
      setIsProcessing(false);
      
      // If user selected a tier with a badge, assign it
      if (selectedTier?.badgeType) {
        await assignBadgeToUser(selectedTier.badgeType, currentUser.id);
      }
      
      alert('Thank you for your donation! Your badge has been added to your profile.');
      onClose();
      
      // Refresh the page to show the badge
      window.location.reload();
    }, 1500);
  };
  
  const finalAmount = selectedTier 
    ? selectedTier.amount 
    : (customAmount ? parseFloat(customAmount) : 0);
  
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div 
        className="bg-gray-800 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Support Gangio</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-gray-300 mb-6">
          Your donation helps us improve Gangio and keep it free for everyone. Choose a donation tier or enter a custom amount.
        </p>
        
        {/* Donation Tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {DONATION_TIERS.map((tier) => (
            <div 
              key={tier.id}
              className={`border rounded-lg p-4 cursor-pointer transition-all hover:border-emerald-500 ${
                selectedTier?.id === tier.id 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-gray-700 bg-gray-700/30'
              }`}
              onClick={() => {
                setSelectedTier(tier);
                setCustomAmount('');
              }}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-semibold text-lg">{tier.name}</h3>
                <span className="font-bold text-emerald-400">${tier.amount}</span>
              </div>
              <p className="text-gray-400 text-sm mb-3">{tier.description}</p>
              <ul className="text-xs text-gray-300">
                {tier.benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start mb-1">
                    <svg className="h-3.5 w-3.5 text-emerald-400 mr-1.5 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Custom Amount */}
        <div className={`border rounded-lg p-4 mb-6 ${
          !selectedTier && customAmount 
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-gray-700 bg-gray-700/30'
        }`}>
          <h3 className="font-semibold text-lg mb-2">Custom Amount</h3>
          <div className="flex items-center">
            <span className="text-xl mr-2">$</span>
            <input
              type="number"
              min="1"
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedTier(null);
              }}
              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 w-full focus:outline-none focus:border-emerald-500"
              placeholder="Enter amount"
            />
          </div>
        </div>
        
        {/* Payment Method */}
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-3">Payment Method</h3>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'card', name: 'Credit Card', icon: 'credit-card' },
              { id: 'paypal', name: 'PayPal', icon: 'paypal' },
              { id: 'crypto', name: 'Cryptocurrency', icon: 'currency-bitcoin' }
            ].map((method) => (
              <button
                key={method.id}
                className={`border rounded-lg p-3 flex flex-col items-center justify-center transition-all ${
                  paymentMethod === method.id
                    ? 'border-emerald-500 bg-emerald-500/10'
                    : 'border-gray-700 bg-gray-700/30 hover:border-gray-600'
                }`}
                onClick={() => setPaymentMethod(method.id as any)}
              >
                <span className="text-2xl mb-1">
                  {method.icon === 'credit-card' && '💳'}
                  {method.icon === 'paypal' && 'Ⓟ'}
                  {method.icon === 'currency-bitcoin' && '₿'}
                </span>
                <span className="text-sm">{method.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Donation Summary */}
        <div className="bg-gray-700/50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-lg mb-2">Donation Summary</h3>
          <div className="flex justify-between mb-2">
            <span className="text-gray-300">Amount:</span>
            <span className="font-semibold">
              {finalAmount > 0 ? `$${finalAmount.toFixed(2)}` : '—'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-300">Payment method:</span>
            <span className="font-semibold">
              {paymentMethod === 'card' && 'Credit Card'}
              {paymentMethod === 'paypal' && 'PayPal'}
              {paymentMethod === 'crypto' && 'Cryptocurrency'}
            </span>
          </div>
          
          {selectedTier?.badgeType && (
            <div className="flex justify-between mt-2">
              <span className="text-gray-300">Badge:</span>
              <span className="font-semibold text-emerald-400">
                {selectedTier.badgeType.charAt(0).toUpperCase() + selectedTier.badgeType.slice(1)} Badge
              </span>
            </div>
          )}
        </div>
        
        {/* Donate Button */}
        <button
          onClick={handleDonate}
          disabled={isProcessing || !(selectedTier || (customAmount && parseFloat(customAmount) > 0))}
          className={`w-full py-3 rounded-lg font-medium text-white transition-colors ${
            isProcessing || !(selectedTier || (customAmount && parseFloat(customAmount) > 0))
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-emerald-600 hover:bg-emerald-500'
          }`}
        >
          {isProcessing 
            ? 'Processing...' 
            : `Donate ${finalAmount > 0 ? `$${finalAmount.toFixed(2)}` : ''}`}
        </button>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          By donating, you agree to our Terms of Service and Privacy Policy.
          Donations are non-refundable.
        </p>
      </motion.div>
    </div>
  );
}; 