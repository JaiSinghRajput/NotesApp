import rateLimit from 'express-rate-limit';

// Create a limiter for general API requests
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        statusCode: 429,
        message: 'Too many requests from this IP, please try again after 15 minutes',
        success: false
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Create a stricter limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        statusCode: 429,
        message: 'Too many login attempts, please try again after 15 minutes',
        success: false
    },
    standardHeaders: true,
    legacyHeaders: false,
}); 
export { apiLimiter, authLimiter };