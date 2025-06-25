import express from 'express';
import fetch from 'node-fetch';

const router = express.Router();

// Proxy route for Multiavatar
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    console.log('Fetching avatar for identifier:', identifier);
    
    if (!identifier) {
      throw new Error('Identifier parameter is required');
    }

    // Use the identifier as the seed for Multiavatar
    const url = `https://api.multiavatar.com/${encodeURIComponent(identifier)}.svg`;
    console.log('Fetching from URL:', url);

    const response = await fetch(url, {
      headers: {
        'Accept': 'image/svg+xml',
        'Content-Type': 'image/svg+xml'
      }
    });
    
    if (!response.ok) {
      console.error('Multiavatar API error:', {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error(`Failed to fetch avatar: ${response.statusText}`);
    }

    const svg = await response.text();
    
    // Validate SVG content
    if (!svg.includes('<svg')) {
      console.error('Invalid SVG content received:', svg.substring(0, 100));
      throw new Error('Invalid SVG content received');
    }

    // Set appropriate headers
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Send the SVG
    res.send(svg);
  } catch (error) {
    console.error('Avatar proxy error:', error);
    
    // Generate a default avatar SVG with the first letter of the identifier
    const firstLetter = (req.params.identifier || '?').charAt(0).toUpperCase();
    const defaultAvatar = `<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="100" fill="#E2E8F0"/>
      <text x="50%" y="50%" font-size="40" text-anchor="middle" dy=".3em" fill="#718096">
        ${firstLetter}
      </text>
    </svg>`;
    
    // Set headers for the fallback avatar
    res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    res.send(defaultAvatar);
  }
});

export default router; 