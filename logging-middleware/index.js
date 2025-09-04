/**
 * Reusable logging middleware for Express applications
 * Logs HTTP method, URL, and timestamp for each request
 */

const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.originalUrl || req.url;
  
  console.log(`[${timestamp}] ${method} ${url}`);
  
  next();
};

module.exports = logger;
