// Performance optimization utilities

// Memoization cache
const memoCache = new Map();

/**
 * Memoize expensive calculations
 * @param {string} key - Cache key
 * @param {Function} fn - Function to memoize
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 * @returns {any} - Cached result or new result
 */
export const memoize = (key, fn, ttl = 5 * 60 * 1000) => {
  const cached = memoCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < ttl) {
    return cached.value;
  }
  
  const result = fn();
  memoCache.set(key, {
    value: result,
    timestamp: now
  });
  
  return result;
};

/**
 * Clear memoization cache
 * @param {string} key - Optional specific key to clear
 */
export const clearMemoCache = (key = null) => {
  if (key) {
    memoCache.delete(key);
  } else {
    memoCache.clear();
  }
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} - Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} - Throttled function
 */
export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

/**
 * Batch multiple state updates
 * @param {Function} setState - React setState function
 * @param {Array} updates - Array of update functions
 */
export const batchUpdates = (setState, updates) => {
  setState(prevState => {
    let newState = prevState;
    updates.forEach(update => {
      newState = update(newState);
    });
    return newState;
  });
};

/**
 * Optimize array operations
 * @param {Array} array - Array to optimize
 * @param {Function} keyFn - Function to generate cache key
 * @returns {Object} - Optimized array with lookup methods
 */
export const optimizeArray = (array, keyFn = (item, index) => index) => {
  const lookup = new Map();
  array.forEach((item, index) => {
    lookup.set(keyFn(item, index), item);
  });
  
  return {
    array,
    lookup,
    find: (key) => lookup.get(key),
    has: (key) => lookup.has(key),
    get: (index) => array[index]
  };
};

/**
 * Measure performance of a function
 * @param {Function} fn - Function to measure
 * @param {string} name - Name for logging
 * @returns {any} - Function result
 */
export const measurePerformance = (fn, name = 'Function') => {
  const start = performance.now();
  const result = fn();
  const end = performance.now();
  console.log(`${name} took ${(end - start).toFixed(2)}ms`);
  return result;
}; 