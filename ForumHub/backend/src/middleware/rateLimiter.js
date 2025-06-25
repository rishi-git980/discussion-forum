import rateLimit from 'express-rate-limit';

// Create a limiter for general API requests
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Increased limit to prevent rate limiting during profile loads
  message: 'Too many requests from this IP, please try again after 15 minutes',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a stricter limiter for auth endpoints
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Slightly increased from 5 to allow for some retries
  message: 'Too many login attempts from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
});

// Create a limiter for post creation
export const createPostLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 posts per hour
  message: 'Too many posts created from this IP, please try again after an hour',
  standardHeaders: true,
  legacyHeaders: false,
}); 