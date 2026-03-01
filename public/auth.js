//============================
// AUTHENTICATION UTILITIES
//============================

// Get token from localStorage
function getAuthToken() {
    return localStorage.getItem('authToken');
}

// Set token in localStorage
function setAuthToken(token) {
    localStorage.setItem('authToken', token);
}

// Remove token from localStorage
function removeAuthToken() {
    localStorage.removeItem('authToken');
}

// Check if user is authenticated
function isAuthenticated() {
    const token = getAuthToken();
    return token !== null && token !== undefined && token !== '';
}

// Get authentication headers for API requests
function getAuthHeaders() {
    const token = getAuthToken();
    return token ? {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    } : {
        'Content-Type': 'application/json'
    };
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!isAuthenticated()) {
        alert('Session expired. Please login again.');
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Make authenticated API request
async function makeAuthenticatedRequest(url, options = {}) {
    if (!requireAuth()) {
        return null;
    }

    const defaultOptions = {
        headers: getAuthHeaders()
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, mergedOptions);
        
        // Handle token expiration
        if (response.status === 401 || response.status === 403) {
            removeAuthToken();
            alert('Session expired. Please login again.');
            window.location.href = 'login.html';
            return null;
        }
        
        return response;
    } catch (error) {
        console.error('API request failed:', error);
        throw error;
    }
}

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if current page requires authentication
    const currentPage = window.location.pathname;
    const publicPages = ['login.html', '/login.html', '/', '/index.html'];
    
    if (!publicPages.some(page => currentPage.endsWith(page) || currentPage === page)) {
        requireAuth();
    }
});
