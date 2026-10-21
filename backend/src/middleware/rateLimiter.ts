import rateLimit from 'express-rate-limit';

// General API Rate Limiter: max 1000 requests per 15 mins per IP
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP, please try again after a few minutes.'
  }
});

// Strict Auth Limiter: protects /api/admin/login against brute-force password guessing
// Only counts failed login attempts (skipSuccessfulRequests: true)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many failed login attempts from this network. Please wait 15 minutes before trying again.'
  }
});

// AI Assistant Limiter: prevents abuse or rapid quota draining of Gemini API
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 25,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: {
    error: 'Too many AI requests. Please slow down and try again in a minute.'
  }
});
