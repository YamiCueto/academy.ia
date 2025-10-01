// Cookie Management Utility for GDPR compliance and Best Practices
class CookieManager {
    constructor() {
        this.cookieConsent = this.getCookie('cookieConsent');
        this.initializeCookieNotice();
    }

    /**
     * Set a cookie with secure defaults
     * @param {string} name - Cookie name
     * @param {string} value - Cookie value
     * @param {number} days - Days until expiration
     * @param {Object} options - Additional options
     */
    setCookie(name, value, days = 30, options = {}) {
        // Only set cookies if consent is given or if it's essential
        if (!this.cookieConsent && !options.essential) {
            return false;
        }

        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        let cookieString = `${name}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`;
        
        // Add secure flags
        if (location.protocol === 'https:') {
            cookieString += '; Secure';
        }
        
        // Add SameSite attribute
        cookieString += '; SameSite=Strict';
        
        // Add domain if specified
        if (options.domain) {
            cookieString += `; Domain=${options.domain}`;
        }
        
        document.cookie = cookieString;
        return true;
    }

    /**
     * Get a cookie value
     * @param {string} name - Cookie name
     * @returns {string|null} Cookie value or null
     */
    getCookie(name) {
        const nameEQ = name + "=";
        const cookies = document.cookie.split(';');
        
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        return null;
    }

    /**
     * Delete a cookie
     * @param {string} name - Cookie name
     * @param {string} path - Cookie path
     * @param {string} domain - Cookie domain
     */
    deleteCookie(name, path = '/', domain = '') {
        let cookieString = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}`;
        
        if (domain) {
            cookieString += `; Domain=${domain}`;
        }
        
        document.cookie = cookieString;
    }

    /**
     * Initialize cookie consent notice
     */
    initializeCookieNotice() {
        if (this.cookieConsent === null) {
            this.showCookieNotice();
        }
    }

    /**
     * Show cookie consent notice
     */
    showCookieNotice() {
        const notice = document.createElement('div');
        notice.id = 'cookie-notice';
        notice.className = 'cookie-notice';
        notice.innerHTML = `
            <div class="cookie-notice-content">
                <p>
                    <i class="fas fa-cookie-bite"></i>
                    Este sitio utiliza cookies esenciales para su funcionamiento. 
                    No utilizamos cookies de seguimiento ni análisis de terceros.
                </p>
                <div class="cookie-notice-buttons">
                    <button id="accept-cookies" class="btn btn-primary">
                        <i class="fas fa-check"></i> Aceptar
                    </button>
                    <button id="reject-cookies" class="btn btn-secondary">
                        <i class="fas fa-times"></i> Solo esenciales
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(notice);

        // Event listeners
        document.getElementById('accept-cookies').addEventListener('click', () => {
            this.acceptCookies();
            notice.remove();
        });

        document.getElementById('reject-cookies').addEventListener('click', () => {
            this.rejectCookies();
            notice.remove();
        });
    }

    /**
     * Accept cookies
     */
    acceptCookies() {
        this.cookieConsent = 'accepted';
        this.setCookie('cookieConsent', 'accepted', 365, { essential: true });
        
        // Initialize any analytics or non-essential features here
        // Currently, we don't use any third-party tracking
    }

    /**
     * Reject non-essential cookies
     */
    rejectCookies() {
        this.cookieConsent = 'rejected';
        this.setCookie('cookieConsent', 'rejected', 365, { essential: true });
        
        // Clean up any existing third-party cookies
        this.cleanThirdPartyCookies();
    }

    /**
     * Clean up third-party cookies
     */
    cleanThirdPartyCookies() {
        // List of common third-party cookie names to remove
        const thirdPartyCookies = [
            '_ga', '_gid', '_gat', '_gtag',  // Google Analytics
            'fbp', '_fbp',                   // Facebook
            '_hjid', '_hjTLDTest',           // Hotjar
            'amplitude_id',                  // Amplitude
            '_vwo_uuid',                     // VWO
        ];

        thirdPartyCookies.forEach(cookieName => {
            this.deleteCookie(cookieName);
            this.deleteCookie(cookieName, '/', '.' + window.location.hostname);
        });
    }

    /**
     * Get all cookies for debugging
     */
    getAllCookies() {
        const cookies = {};
        document.cookie.split(';').forEach(cookie => {
            const [name, value] = cookie.trim().split('=');
            if (name && value) {
                cookies[name] = decodeURIComponent(value);
            }
        });
        return cookies;
    }

    /**
     * Clear all non-essential cookies
     */
    clearAllCookies() {
        const allCookies = this.getAllCookies();
        const essentialCookies = ['cookieConsent'];
        
        Object.keys(allCookies).forEach(cookieName => {
            if (!essentialCookies.includes(cookieName)) {
                this.deleteCookie(cookieName);
            }
        });
    }
}

// Initialize cookie manager
window.cookieManager = new CookieManager();

export { CookieManager };
export default window.cookieManager;