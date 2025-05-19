'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { FiSave } from 'react-icons/fi';
import { BiGame } from 'react-icons/bi';
import { useTranslations } from '@/hooks/useTranslations';

// CS2 Ranks based on the stored memory
const cs2Ranks = [
  { value: '0-7499', label: 'Silver (Below 7500 ELO)', range: '0-7499' },
  { value: '7500-11799', label: 'Gold Nova (7500 - 11799 ELO)', range: '7500-11799' },
  { value: '11800-14999', label: 'Master Guardian (11800 - 14999 ELO)', range: '11800-14999' },
  { value: '15000-18399', label: 'Legendary Eagle / DMG (15000 - 18399 ELO)', range: '15000-18399' },
  { value: '18400-19999', label: 'Supreme Master First Class (18400 - 19999 ELO)', range: '18400-19999' },
  { value: '20000-30000', label: 'Global Elite (20000+ ELO)', range: '20000-30000' },
];

const regions = [
  { value: 'na_east', label: 'North America (East)' },
  { value: 'na_west', label: 'North America (West)' },
  { value: 'eu_west', label: 'Europe (West)' },
  { value: 'eu_east', label: 'Europe (East)' },
  { value: 'asia', label: 'Asia' },
  { value: 'sa', label: 'South America' },
  { value: 'oce', label: 'Oceania' },
];

const SquadFinderPanel = () => {
  const { data: session } = useSession();
  const { t, squadFinder } = useTranslations();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    steamProfileUrl: '',
    cs2Rating: '',
    gamingRegion: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear any previous messages
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/profile/update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          cs2Rating: parseInt(formData.cs2Rating) || null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      setSuccess('Squad Finder settings saved successfully!');
    } catch (err) {
      setError('Failed to save settings. Please try again.');
      console.error('Error saving squad finder settings:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <BiGame className="text-2xl text-emerald-400" />
        <h2 className="text-xl font-semibold text-white">{squadFinder.settings.title()}</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-gray-300 mb-1">
            {squadFinder.settings.displayName()}
          </label>
          <input
            type="text"
            id="displayName"
            name="displayName"
            value={formData.displayName}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Your in-game display name"
          />
          <p className="mt-1 text-sm text-gray-400">{squadFinder.settings.displayNameDesc()}</p>
        </div>

        {/* Steam Profile URL */}
        <div>
          <label htmlFor="steamProfileUrl" className="block text-sm font-medium text-gray-300 mb-1">
            {squadFinder.settings.steamProfile()}
          </label>
          <input
            type="url"
            id="steamProfileUrl"
            name="steamProfileUrl"
            value={formData.steamProfileUrl}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="https://steamcommunity.com/id/yourusername"
          />
          <p className="mt-1 text-sm text-gray-400">{squadFinder.settings.steamProfileDesc()}</p>
        </div>

        {/* CS2 Rating */}
        <div>
          <label htmlFor="cs2Rating" className="block text-sm font-medium text-gray-300 mb-1">
            {squadFinder.settings.cs2Rating()}
          </label>
          <select
            id="cs2Rating"
            name="cs2Rating"
            value={formData.cs2Rating}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select your CS2 rank</option>
            {cs2Ranks.map(rank => (
              <option key={rank.value} value={rank.range}>{rank.label}</option>
            ))}
          </select>
        </div>

        {/* Gaming Region */}
        <div>
          <label htmlFor="gamingRegion" className="block text-sm font-medium text-gray-300 mb-1">
            {squadFinder.settings.gamingRegion()}
          </label>
          <select
            id="gamingRegion"
            name="gamingRegion"
            value={formData.gamingRegion}
            onChange={handleInputChange}
            className="w-full bg-gray-700/50 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">Select your region</option>
            {regions.map(region => (
              <option key={region.value} value={region.value}>{region.label}</option>
            ))}
          </select>
          <p className="mt-1 text-sm text-gray-400">{squadFinder.settings.gamingRegionDesc()}</p>
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="text-red-400 text-sm mt-2">{error}</div>
        )}
        {success && (
          <div className="text-emerald-400 text-sm mt-2">{success}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center justify-center w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 text-white rounded-md font-medium transition-colors"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Saving...
            </>
          ) : (
            <>
              <FiSave className="mr-2" />
              {t('actions.save')}
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default SquadFinderPanel;
