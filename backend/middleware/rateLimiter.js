// Simple rate limiter middleware
const rateLimiter = (options = {}) => {
  const requests = new Map();
  const { windowMs = 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = options;

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    // Clean up old requests
    for (const [key, timestamp] of requests.entries()) {
      if (now - timestamp > windowMs) {
        requests.delete(key);
      }
    }
    
    // Check if IP has exceeded limit
    const requestCount = requests.get(ip) || 0;
    
    if (requestCount >= max) {
      return res.status(429).json({
        success: false,
        error: message
      });
    }
    
    // Increment request count
    requests.set(ip, requestCount + 1);
    
    next();
  };
};

export default rateLimiter;