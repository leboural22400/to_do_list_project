// Middleware for authentication service (for client-side/not a real backend)
import { reactive, computed } from 'vue';

// Configuration for API endpoints
const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    endpoints: {
        login: '/auth/login',
        register: '/auth/register',
        logout: '/auth/logout',
        profile: '/auth/profile',
        updateProfile: '/auth/profile',
        changePassword: '/auth/change-password',
        refreshToken: '/auth/refresh-token',
        forgotPassword: '/auth/forgot-password',
        resetPassword: '/auth/reset-password'
    }
};

// Reactive authentication state
const authState = reactive({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    token: null,
    refreshToken: null,
    tokenExpiry: null
});

const getters = {
    isAuthenticated: computed(() => authState.isAuthenticated),
    user: computed(() => authState.user),
    isLoading: computed(() => authState.isLoading),
    isTokenExpired: computed(() => {
        if (!authState.tokenExpiry) return true;
        return Date.now() >= authState.tokenExpiry;
    })
};

const apiCall = async (endpoint, options = {}) => {
    const url = `${API_CONFIG.baseURL}${endpoint}`;
    
    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        },
        ...options
    };

    if (authState.token && !getters.isTokenExpired.value) {
        config.headers.Authorization = `Bearer ${authState.token}`;
    }

    try {
        const response = await fetch(url, config);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
};

// This part has to be replaced with real API calls I wrote it to simulate network requests for now
const mockApiCall = (data = {}, delay = 1000) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {

            if (Math.random() > 0.1) {
                resolve({
                    success: true,
                    data,
                    token: 'mock-jwt-token-' + Date.now(),
                    refreshToken: 'mock-refresh-token-' + Date.now(),
                    expiresIn: 3600 
                });
            } else {
                reject(new Error('Network error'));
            }
        }, delay);
    });
};

export const AuthService = {
    init() {
        console.log('AuthService initializing...');
        
        const storedUser = localStorage.getItem('todoapp_user');
        const storedToken = localStorage.getItem('todoapp_token');
        const storedRefreshToken = localStorage.getItem('todoapp_refreshToken');
        const storedTokenExpiry = localStorage.getItem('todoapp_tokenExpiry');

        console.log('Stored data:', { 
            hasUser: !!storedUser, 
            hasToken: !!storedToken, 
            expiry: storedTokenExpiry,
            storedUser: storedUser,
            storedToken: storedToken
        });

        if (storedUser && storedToken && storedTokenExpiry) {
            const expiry = parseInt(storedTokenExpiry);
            
            console.log('Token expiry check:', { 
                expiry, 
                now: Date.now(), 
                isValid: Date.now() < expiry 
            });
            
            if (Date.now() < expiry) {
                authState.user = JSON.parse(storedUser);
                authState.token = storedToken;
                authState.refreshToken = storedRefreshToken;
                authState.tokenExpiry = expiry;
                authState.isAuthenticated = true;
                
                console.log('Auth restored from localStorage:', {
                    user: authState.user,
                    isAuthenticated: authState.isAuthenticated
                });
            } else {
                console.log('Token expired, clearing storage');
                this.clearStorage();
            }
        } else {
            console.log('No valid auth data found in localStorage');
        }
    },

    async login(credentials) {
        console.log('LOGIN METHOD CALLED with credentials:', credentials);
        authState.isLoading = true;
        
        try {
            // For the back-end: Replace with real API call
            // const response = await apiCall(API_CONFIG.endpoints.login, {
            //     method: 'POST',
            //     body: JSON.stringify(credentials)
            // });

            const response = await mockApiCall({
                id: 1,
                firstName: 'John',
                lastName: 'Doe',
                email: credentials.email,
                avatar: null,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            // Authentication state
            const expiryTime = Date.now() + (response.expiresIn * 1000);
            
            authState.user = response.data;
            authState.token = response.token;
            authState.refreshToken = response.refreshToken;
            authState.tokenExpiry = expiryTime;
            authState.isAuthenticated = true;

            console.log('Login: Auth state set:', {
                user: authState.user,
                hasToken: !!authState.token,
                isAuthenticated: authState.isAuthenticated,
                expiry: new Date(expiryTime).toISOString()
            });

            // Store in localStorage
            this.saveToStorage();
            
            console.log('Login: Data saved to localStorage');

            return { success: true, user: response.data };

        } catch (error) {
            console.error('Login error:', error);
            throw new Error(error.message || 'Login failed');
        } finally {
            authState.isLoading = false;
        }
    },

    // Register new user
    async register(userData) {
        authState.isLoading = true;

        try {
            // For the back-end: Replace with real API call
            // const response = await apiCall(API_CONFIG.endpoints.register, {
            //     method: 'POST',
            //     body: JSON.stringify(userData)
            // });

            // Mock implementation
            const response = await mockApiCall({
                id: Date.now(),
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                avatar: null,
                role: 'user',
                createdAt: new Date().toISOString()
            });

            // Set authentication state
            const expiryTime = Date.now() + (response.expiresIn * 1000);
            
            authState.user = response.data;
            authState.token = response.token;
            authState.refreshToken = response.refreshToken;
            authState.tokenExpiry = expiryTime;
            authState.isAuthenticated = true;

            // Store in localStorage
            this.saveToStorage();

            return { success: true, user: response.data };

        } catch (error) {
            console.error('Registration error:', error);
            throw new Error(error.message || 'Registration failed');
        } finally {
            authState.isLoading = false;
        }
    },

    // Logout user
    async logout() {
        authState.isLoading = true;

        try {
            // TODO: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.logout, {
            //     method: 'POST'
            // });

            // Mock implementation
            await mockApiCall({}, 500);

        } catch (error) {
            console.warn('Logout API call failed:', error);
            // Continue with local logout even if API fails
        } finally {
            // Clear authentication state
            authState.user = null;
            authState.token = null;
            authState.refreshToken = null;
            authState.tokenExpiry = null;
            authState.isAuthenticated = false;
            authState.isLoading = false;

            // Clear storage
            this.clearStorage();
        }
    },

    // Update user profile
    async updateProfile(updates) {
        authState.isLoading = true;

        try {
            // TODO: Replace with real API call
            // const response = await apiCall(API_CONFIG.endpoints.updateProfile, {
            //     method: 'PUT',
            //     body: JSON.stringify(updates)
            // });

            // Mock implementation
            const updatedUser = { ...authState.user, ...updates };
            const response = await mockApiCall(updatedUser);

            // Update state
            authState.user = response.data;
            localStorage.setItem('user', JSON.stringify(authState.user));

            return { success: true, user: response.data };

        } catch (error) {
            console.error('Profile update error:', error);
            throw new Error(error.message || 'Profile update failed');
        } finally {
            authState.isLoading = false;
        }
    },

    // Change password
    async changePassword(currentPassword, newPassword) {
        authState.isLoading = true;

        try {
            // For the back-end: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.changePassword, {
            //     method: 'POST',
            //     body: JSON.stringify({ currentPassword, newPassword })
            // });

            // Mock implementation
            await mockApiCall({});

            return { success: true };

        } catch (error) {
            console.error('Password change error:', error);
            throw new Error(error.message || 'Password change failed');
        } finally {
            authState.isLoading = false;
        }
    },

    // Sign out all devices
    async signOutAllDevices() {
        authState.isLoading = true;

        try {
            // For the back-end: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.signOutAll, {
            //     method: 'POST'
            // });

            // Mock implementation
            await mockApiCall({});

            // Clear all local data
            this.logout();

            return { success: true };

        } catch (error) {
            console.error('Sign out all devices error:', error);
            throw new Error(error.message || 'Failed to sign out all devices');
        } finally {
            authState.isLoading = false;
        }
    },

    // Delete account
    async deleteAccount() {
        authState.isLoading = true;

        try {
            // For the back-end: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.deleteAccount, {
            //     method: 'DELETE'
            // });

            // Mock implementation
            await mockApiCall({}, 2000); 

            this.logout();

            return { success: true };

        } catch (error) {
            console.error('Delete account error:', error);
            throw new Error(error.message || 'Failed to delete account');
        } finally {
            authState.isLoading = false;
        }
    },

    async refreshAuthToken() {
        if (!authState.refreshToken) {
            throw new Error('No refresh token available');
        }

        try {
            // For the back-end: Replace with real API call
            // const response = await apiCall(API_CONFIG.endpoints.refreshToken, {
            //     method: 'POST',
            //     body: JSON.stringify({ refreshToken: authState.refreshToken })
            // });

            // Mock implementation
            const response = await mockApiCall({}, 500);

            const expiryTime = Date.now() + (response.expiresIn * 1000);
            authState.token = response.token;
            authState.refreshToken = response.refreshToken;
            authState.tokenExpiry = expiryTime;

            this.saveToStorage();

            return { success: true };

        } catch (error) {
            console.error('Token refresh error:', error);
            await this.logout();
            throw new Error('Session expired. Please login again.');
        }
    },

    // Forgot password
    async forgotPassword(email) {
        try {
            // For the backend: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.forgotPassword, {
            //     method: 'POST',
            //     body: JSON.stringify({ email })
            // });

            await mockApiCall({});

            return { success: true };

        } catch (error) {
            console.error('Forgot password error:', error);
            throw new Error(error.message || 'Failed to send reset email');
        }
    },

    async resetPassword(token, newPassword) {
        try {
            // For the back-end: Replace with real API call
            // await apiCall(API_CONFIG.endpoints.resetPassword, {
            //     method: 'POST',
            //     body: JSON.stringify({ token, password: newPassword })
            // });

            await mockApiCall({});

            return { success: true };

        } catch (error) {
            console.error('Password reset error:', error);
            throw new Error(error.message || 'Password reset failed');
        }
    },

    saveToStorage() {
        console.log('saveToStorage: Saving data to localStorage...', {
            user: authState.user,
            hasToken: !!authState.token,
            expiry: authState.tokenExpiry
        });
        
        localStorage.setItem('todoapp_user', JSON.stringify(authState.user));
        localStorage.setItem('todoapp_token', authState.token);
        localStorage.setItem('todoapp_refreshToken', authState.refreshToken);
        localStorage.setItem('todoapp_tokenExpiry', authState.tokenExpiry.toString());
        
        console.log('saveToStorage: Data saved successfully');
    },

    clearStorage() {
        localStorage.removeItem('todoapp_user');
        localStorage.removeItem('todoapp_token');
        localStorage.removeItem('todoapp_refreshToken');
        localStorage.removeItem('todoapp_tokenExpiry');
    },

    ...getters,

    // Debbugging
    getState() {
        return { ...authState };
    }
};


AuthService.init();

// Auto-refresh token before expiry
setInterval(async () => {
    if (authState.isAuthenticated && authState.tokenExpiry) {
        const timeUntilExpiry = authState.tokenExpiry - Date.now();
        const fiveMinutes = 5 * 60 * 1000;

        if (timeUntilExpiry < fiveMinutes && timeUntilExpiry > 0) {
            try {
                await AuthService.refreshAuthToken();
                console.log('Token refreshed automatically');
            } catch (error) {
                console.warn('Auto token refresh failed:', error);
            }
        }
    }
}, 60000); 

export default AuthService;