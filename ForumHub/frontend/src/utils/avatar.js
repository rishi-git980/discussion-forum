/**
 * Utility functions for avatar handling
 */

// Array of available avatar styles
const avatarStyles = [
  'lorelei',
  'bottts',
  'pixelArt',
  'identicon'
];

/**
 * Get the avatar URL for a user
 * @param {Object|string} user - User object or username
 * @param {Object} options - Options for avatar generation
 * @param {number} options.size - Size of the avatar in pixels
 * @returns {string} Avatar URL
 */
export const getAvatarUrl = (user, options = {}) => {
  const { size = 40 } = options;
  
  // Handle null/undefined user
  if (!user) {
    return generateFallbackAvatar('?', size);
  }

  // Get the username to use as seed
  let seed;
  if (typeof user === 'string') {
    seed = user;
  } else if (user.avatar && user.avatar.startsWith('http')) {
    // If user has a custom avatar URL, use it directly
    return user.avatar;
  } else {
    seed = user.username || 'unknown';
  }

  // Use the seed to consistently select a style
  const styleIndex = Math.abs(hashCode(seed)) % avatarStyles.length;
  const style = avatarStyles[styleIndex];

  // Generate avatar URL using DiceBear's HTTP API
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}&backgroundColor=b6e3f4,c0aede,ffd5dc,ffdfbf&size=${size}`;
};

/**
 * Generate a fallback avatar
 * @param {string} text - Text to use for initial-based avatar
 * @param {number} size - Size of the avatar in pixels
 * @returns {string} Fallback avatar URL
 */
const generateFallbackAvatar = (text, size) => {
  const initial = (text || '?').charAt(0).toUpperCase();
  const backgroundColor = stringToColor(text || '?');
  
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="${backgroundColor}"/>
      <text 
        x="50%" 
        y="50%" 
        font-family="Arial, sans-serif"
        font-size="${size * 0.4}px" 
        text-anchor="middle" 
        dy=".3em" 
        fill="white"
      >
        ${initial}
      </text>
    </svg>`
  )}`;
};

/**
 * Convert string to color
 * @param {string} str - String to convert
 * @returns {string} HSL color
 */
const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {number} Hash code
 */
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash;
};

/**
 * Common styles for avatar images
 * @param {Object} options - Style options
 * @param {number} options.size - Size of the avatar in pixels
 * @param {boolean} options.border - Whether to add a border
 * @returns {Object} Style object
 */
export const getAvatarStyles = (options = {}) => {
  const { size = 40, border = true } = options;
  
  return {
    width: `${size}px`,
    height: `${size}px`,
    objectFit: 'cover',
    backgroundColor: 'transparent',
    borderRadius: '50%',
    ...(border && {
      border: '1px solid var(--border-color)',
      padding: '1px'
    })
  };
}; 