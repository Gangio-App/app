// Steam API Service
// This service handles interactions with the Steam Web API

const STEAM_API_KEY = process.env.STEAM_API_KEY;
const API_BASE_URL = 'https://api.steampowered.com';

export interface SteamGame {
  appid: number;
  name: string;
  playtime_forever: number; // in minutes
  img_icon_url: string;
  img_logo_url: string;
  playtime_2weeks?: number; // in minutes, may not be present if not played in last 2 weeks
}

export interface SteamProfile {
  steamid: string;
  personaname: string;
  profileurl: string;
  avatar: string;
  avatarmedium: string;
  avatarfull: string;
  personastate: number; // 0: Offline, 1: Online, 2: Busy, 3: Away, 4: Snooze, 5: Looking to trade, 6: Looking to play
  lastlogoff?: number;
  gameextrainfo?: string; // Name of the game user is currently playing
  gameid?: string; // ID of the game user is currently playing
}

export interface SteamPlayerSummary {
  profile: SteamProfile;
  recentGames: SteamGame[];
  totalGames: number;
  totalPlaytime: number; // in minutes
  favoriteGame?: SteamGame;
}

/**
 * Get a player's Steam profile and game data
 */
export async function getSteamPlayerSummary(steamId: string): Promise<SteamPlayerSummary | null> {
  try {
    // Get player profile
    const profileData = await getPlayerSummary(steamId);
    if (!profileData) return null;
    
    // Get owned games
    const gamesData = await getOwnedGames(steamId);
    if (!gamesData) return null;
    
    // Sort games by playtime (descending)
    const sortedGames = [...gamesData].sort((a, b) => b.playtime_forever - a.playtime_forever);
    
    // Get recent games (played in the last 2 weeks)
    const recentGames = sortedGames.filter(game => game.playtime_2weeks && game.playtime_2weeks > 0);
    
    // Calculate total playtime across all games
    const totalPlaytime = sortedGames.reduce((total, game) => total + game.playtime_forever, 0);
    
    return {
      profile: profileData,
      recentGames: recentGames.length > 0 ? recentGames : sortedGames.slice(0, 3),
      totalGames: sortedGames.length,
      totalPlaytime,
      favoriteGame: sortedGames.length > 0 ? sortedGames[0] : undefined
    };
  } catch (error) {
    console.error('Error fetching Steam player summary:', error);
    return null;
  }
}

/**
 * Get player profile information
 */
async function getPlayerSummary(steamId: string): Promise<SteamProfile | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response && data.response.players && data.response.players.length > 0) {
      return data.response.players[0];
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Steam player summary:', error);
    return null;
  }
}

/**
 * Get a list of games owned by the player
 */
async function getOwnedGames(steamId: string): Promise<SteamGame[] | null> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/IPlayerService/GetOwnedGames/v0001/?key=${STEAM_API_KEY}&steamid=${steamId}&format=json&include_appinfo=true&include_played_free_games=true`
    );
    
    if (!response.ok) {
      throw new Error(`Steam API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.response && data.response.games) {
      return data.response.games;
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching Steam owned games:', error);
    return null;
  }
}

/**
 * Format playtime in a human-readable format
 */
export function formatPlaytime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 
      ? `${hours}h ${remainingMinutes}m` 
      : `${hours} hours`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 
    ? `${days}d ${remainingHours}h` 
    : `${days} days`;
}

/**
 * Get Steam game image URL
 */
export function getSteamGameImageUrl(appId: number, hash: string, type: 'icon' | 'logo' = 'logo'): string {
  if (!hash) return '/assets/game-placeholder.png';
  return `https://media.steampowered.com/steamcommunity/public/images/apps/${appId}/${hash}.jpg`;
}
