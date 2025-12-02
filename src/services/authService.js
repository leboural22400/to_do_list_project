// Middleware for authentication service (for client-side/not a real backend)
import { reactive, computed } from "vue";

// Reactive authentication state
const authState = reactive({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  token: null,
  refreshToken: null,
  tokenExpiry: null,
});

const getters = {
  isAuthenticated: computed(() => authState.isAuthenticated),
  user: computed(() => authState.user),
  isLoading: computed(() => authState.isLoading),
  isTokenExpired: computed(() => {
    if (!authState.tokenExpiry) return true;
    return Date.now() >= authState.tokenExpiry;
  }),
};

// This part has to be replaced with real API calls I wrote it to simulate network requests for now
const mockApiCall = (data = {}, delay = 1000) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() > 0.1) {
        resolve({
          success: true,
          data,
          token: "mock-jwt-token-" + Date.now(),
          refreshToken: "mock-refresh-token-" + Date.now(),
          expiresIn: 3600,
        });
      } else {
        reject(new Error("Network error"));
      }
    }, delay);
  });
};

export const AuthService = {
  init() {
    const storedUser = localStorage.getItem("todoapp_user");
    const storedTokenExpiry = localStorage.getItem("todoapp_tokenExpiry");

    if (storedUser && storedTokenExpiry) {
      const expiry = parseInt(storedTokenExpiry);

      if (Date.now() < expiry) {
        authState.user = JSON.parse(storedUser);
        authState.tokenExpiry = expiry;
        authState.isAuthenticated = true;
      } else {
        this.clearStorage();
      }
    } else {
      console.log("No valid auth data found in localStorage");
    }
  },

  async login(credentials) {
    console.log("LOGIN METHOD CALLED with credentials:", credentials);
    authState.isLoading = true;

    try {
      // Authentication state
      const expiryTime = Date.now() + 10000 * 1000;

      authState.user = credentials.idUser;
      authState.tokenExpiry = expiryTime;
      authState.isAuthenticated = true;

      // Store in localStorage
      this.saveToStorage();

      console.log("Login: Data saved to localStorage");

      return { success: true, user: credentials.idUser };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(error.message || "Login failed");
    } finally {
      authState.isLoading = false;
    }
  },

  // Register new user
  async register(userData) {
    authState.isLoading = true;

    try {
      // Set authentication state
      const expiryTime = Date.now() + 10000 * 1000;

      authState.user = userData.idUser;
      authState.tokenExpiry = expiryTime;
      authState.isAuthenticated = true;

      // Store in localStorage
      this.saveToStorage();

      return { success: true, user: userData.idUser };
    } catch (error) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    } finally {
      authState.isLoading = false;
    }
  },

  // Logout user
  async logout() {
    authState.isLoading = true;
    // Clear authentication state
    authState.user = null;
    authState.token = null;
    authState.refreshToken = null;
    authState.tokenExpiry = null;
    authState.isAuthenticated = false;
    authState.isLoading = false;

    // Clear storage
    this.clearStorage();
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
      localStorage.setItem("user", JSON.stringify(authState.user));

      return { success: true, user: response.data };
    } catch (error) {
      console.error("Profile update error:", error);
      throw new Error(error.message || "Profile update failed");
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
      console.error("Sign out all devices error:", error);
      throw new Error(error.message || "Failed to sign out all devices");
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
      console.error("Delete account error:", error);
      throw new Error(error.message || "Failed to delete account");
    } finally {
      authState.isLoading = false;
    }
  },

  async refreshAuthToken() {
    if (!authState.refreshToken) {
      throw new Error("No refresh token available");
    }

    try {
      const expiryTime = Date.now() + response.expiresIn * 1000;
      authState.tokenExpiry = expiryTime;

      this.saveToStorage();

      return { success: true };
    } catch (error) {
      console.error("Token refresh error:", error);
      await this.logout();
      throw new Error("Session expired. Please login again.");
    }
  },

  saveToStorage() {
    localStorage.setItem("todoapp_user", JSON.stringify(authState.user));
    localStorage.setItem(
      "todoapp_tokenExpiry",
      authState.tokenExpiry.toString()
    );
  },

  clearStorage() {
    localStorage.removeItem("todoapp_user");
    localStorage.removeItem("todoapp_tokenExpiry");
  },

  ...getters,

  // Debbugging
  getState() {
    return { ...authState };
  },
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
        console.log("Token refreshed automatically");
      } catch (error) {
        console.warn("Auto token refresh failed:", error);
      }
    }
  }
}, 60000);

export default AuthService;
