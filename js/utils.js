/**
 * Copenhagen Court Vision - Utility Functions
 * Common helper functions used throughout the application
 */

// Device and browser detection utilities
const DeviceUtils = {
    isMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    },
    
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    },
    
    isAndroid() {
        return /Android/i.test(navigator.userAgent);
    },
    
    isSafari() {
        return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
    },
    
    isChrome() {
        return /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
    },
    
    supportsWebGL() {
        try {
            const canvas = document.createElement('canvas');
            return !!(window.WebGLRenderingContext && 
                     (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
        } catch (e) {
            return false;
        }
    },
    
    supportsCamera() {
        return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },
    
    supportsAR() {
        return this.supportsWebGL() && this.supportsCamera();
    },
    
    getDevicePixelRatio() {
        return window.devicePixelRatio || 1;
    },
    
    getScreenInfo() {
        return {
            width: screen.width,
            height: screen.height,
            availWidth: screen.availWidth,
            availHeight: screen.availHeight,
            pixelRatio: this.getDevicePixelRatio()
        };
    }
};

// Math and geometry utilities
const MathUtils = {
    clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    lerp(start, end, t) {
        return start + (end - start) * t;
    },
    
    map(value, fromMin, fromMax, toMin, toMax) {
        return toMin + (value - fromMin) * (toMax - toMin) / (fromMax - fromMin);
    },
    
    degToRad(degrees) {
        return degrees * (Math.PI / 180);
    },
    
    radToDeg(radians) {
        return radians * (180 / Math.PI);
    },
    
    distance2D(x1, y1, x2, y2) {
        const dx = x2 - x1;
        const dy = y2 - y1;
        return Math.sqrt(dx * dx + dy * dy);
    },
    
    distance3D(point1, point2) {
        const dx = point2.x - point1.x;
        const dy = point2.y - point1.y;
        const dz = point2.z - point1.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    },
    
    normalize2D(x, y) {
        const length = Math.sqrt(x * x + y * y);
        if (length === 0) return { x: 0, y: 0 };
        return { x: x / length, y: y / length };
    },
    
    normalize3D(vector) {
        const length = Math.sqrt(vector.x ** 2 + vector.y ** 2 + vector.z ** 2);
        if (length === 0) return { x: 0, y: 0, z: 0 };
        return {
            x: vector.x / length,
            y: vector.y / length,
            z: vector.z / length
        };
    },
    
    crossProduct(a, b) {
        return {
            x: a.y * b.z - a.z * b.y,
            y: a.z * b.x - a.x * b.z,
            z: a.x * b.y - a.y * b.x
        };
    },
    
    dotProduct(a, b) {
        return a.x * b.x + a.y * b.y + a.z * b.z;
    }
};

// DOM manipulation utilities
const DOMUtils = {
    createElement(tag, className = '', innerHTML = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },
    
    removeElement(selector) {
        const element = typeof selector === 'string' ? 
            document.querySelector(selector) : selector;
        if (element && element.parentNode) {
            element.parentNode.removeChild(element);
        }
    },
    
    show(element, display = 'block') {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) el.style.display = display;
    },
    
    hide(element) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) el.style.display = 'none';
    },
    
    toggle(element, display = 'block') {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) {
            el.style.display = el.style.display === 'none' ? display : 'none';
        }
    },
    
    addClass(element, className) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) el.classList.add(className);
    },
    
    removeClass(element, className) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) el.classList.remove(className);
    },
    
    toggleClass(element, className) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) el.classList.toggle(className);
    },
    
    hasClass(element, className) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        return el ? el.classList.contains(className) : false;
    },
    
    setAttributes(element, attributes) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        if (el) {
            Object.keys(attributes).forEach(key => {
                el.setAttribute(key, attributes[key]);
            });
        }
    },
    
    waitForElement(selector, timeout = 5000) {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            
            function checkElement() {
                const element = document.querySelector(selector);
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > timeout) {
                    reject(new Error(`Element ${selector} not found within ${timeout}ms`));
                } else {
                    requestAnimationFrame(checkElement);
                }
            }
            
            checkElement();
        });
    }
};

// Storage utilities
const StorageUtils = {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Failed to store data:', error);
            return false;
        }
    },
    
    get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.warn('Failed to retrieve data:', error);
            return defaultValue;
        }
    },
    
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Failed to remove data:', error);
            return false;
        }
    },
    
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Failed to clear storage:', error);
            return false;
        }
    },
    
    getSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length + key.length;
            }
        }
        return total;
    },
    
    isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, 'test');
            localStorage.removeItem(test);
            return true;
        } catch (error) {
            return false;
        }
    }
};

// URL and parameter utilities
const URLUtils = {
    getParams() {
        return new URLSearchParams(window.location.search);
    },
    
    getParam(name, defaultValue = null) {
        const params = this.getParams();
        return params.get(name) || defaultValue;
    },
    
    setParam(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.replaceState({}, '', url);
    },
    
    removeParam(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.replaceState({}, '', url);
    },
    
    getBaseURL() {
        return `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
    },
    
    generateQRURL(marker) {
        const baseURL = this.getBaseURL().replace('index.html', 'ar-experience.html');
        return `${baseURL}?marker=${marker}`;
    },
    
    isLocalhost() {
        return window.location.hostname === 'localhost' || 
               window.location.hostname === '127.0.0.1';
    }
};

// Performance monitoring utilities
const PerformanceUtils = {
    measureTime(name, fn) {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    async measureAsyncTime(name, fn) {
        const start = performance.now();
        const result = await fn();
        const end = performance.now();
        console.log(`⏱️ ${name}: ${(end - start).toFixed(2)}ms`);
        return result;
    },
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    },
    
    getFPS() {
        let lastTime = performance.now();
        let fps = 0;
        let frameCount = 0;
        
        function tick() {
            const now = performance.now();
            frameCount++;
            
            if (now - lastTime >= 1000) {
                fps = Math.round((frameCount * 1000) / (now - lastTime));
                frameCount = 0;
                lastTime = now;
            }
            
            requestAnimationFrame(tick);
        }
        
        tick();
        return () => fps;
    }
};

// Error handling utilities
const ErrorUtils = {
    handleAsync(fn) {
        return function(...args) {
            const result = fn.apply(this, args);
            if (result && typeof result.catch === 'function') {
                return result.catch(error => {
                    console.error('Async error:', error);
                    if (window.analytics) {
                        window.analytics.trackError('async_error', error.message);
                    }
                    throw error;
                });
            }
            return result;
        };
    },
    
    safeExecute(fn, fallback = null) {
        try {
            return fn();
        } catch (error) {
            console.error('Safe execution failed:', error);
            if (window.analytics) {
                window.analytics.trackError('safe_execution_failed', error.message);
            }
            return fallback;
        }
    },
    
    createErrorBoundary(component, fallback) {
        return function(...args) {
            try {
                return component(...args);
            } catch (error) {
                console.error('Component error:', error);
                if (window.analytics) {
                    window.analytics.trackError('component_error', error.message);
                }
                return fallback;
            }
        };
    }
};

// Format utilities
const FormatUtils = {
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },
    
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    },
    
    formatTimestamp(timestamp, includeTime = true) {
        const date = new Date(timestamp);
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
        }
        
        return date.toLocaleDateString('en-US', options);
    },
    
    formatPercentage(value, decimals = 1) {
        return `${value.toFixed(decimals)}%`;
    },
    
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    },
    
    truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - suffix.length) + suffix;
    }
};

// Animation utilities
const AnimationUtils = {
    fadeIn(element, duration = 300) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        
        if (!el) return;
        
        el.style.opacity = '0';
        el.style.display = 'block';
        
        let start = null;
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            el.style.opacity = Math.min(progress, 1);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    fadeOut(element, duration = 300) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        
        if (!el) return;
        
        let start = null;
        const initialOpacity = parseFloat(getComputedStyle(el).opacity);
        
        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = (timestamp - start) / duration;
            
            el.style.opacity = initialOpacity * (1 - Math.min(progress, 1));
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                el.style.display = 'none';
            }
        }
        
        requestAnimationFrame(animate);
    },
    
    slideIn(element, direction = 'left', duration = 300) {
        const el = typeof element === 'string' ? 
            document.querySelector(element) : element;
        
        if (!el) return;
        
        const transforms = {
            left: 'translateX(-100%)',
            right: 'translateX(100%)',
            up: 'translateY(-100%)',
            down: 'translateY(100%)'
        };
        
        el.style.transform = transforms[direction];
        el.style.transition = `transform ${duration}ms ease`;
        el.style.display = 'block';
        
        requestAnimationFrame(() => {
            el.style.transform = 'translate(0, 0)';
        });
    }
};

// Validation utilities
const ValidationUtils = {
    isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    isValidURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    },
    
    isEmpty(value) {
        return value === null || value === undefined || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    },
    
    isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    },
    
    isInRange(value, min, max) {
        const num = parseFloat(value);
        return !isNaN(num) && num >= min && num <= max;
    }
};

// Export utilities for global use
window.DeviceUtils = DeviceUtils;
window.MathUtils = MathUtils;
window.DOMUtils = DOMUtils;
window.StorageUtils = StorageUtils;
window.URLUtils = URLUtils;
window.PerformanceUtils = PerformanceUtils;
window.ErrorUtils = ErrorUtils;
window.FormatUtils = FormatUtils;
window.AnimationUtils = AnimationUtils;
window.ValidationUtils = ValidationUtils;

// Global helper functions
window.$ = (selector) => document.querySelector(selector);
window.$$ = (selector) => document.querySelectorAll(selector);

// Ready function
window.ready = (fn) => {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(fn, 1);
    } else {
        document.addEventListener('DOMContentLoaded', fn);
    }
};

// Global error handler
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    if (window.analytics) {
        window.analytics.trackError('global_error', e.error?.message || 'Unknown error');
    }
});

// Global unhandled promise rejection handler
window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    if (window.analytics) {
        window.analytics.trackError('unhandled_rejection', e.reason?.message || 'Unknown rejection');
    }
});

console.log('🔧 Utilities loaded successfully');
