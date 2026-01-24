import awsStorageService from './aws-storage';

/**
 * Cloud Storage Service
 * Provides localStorage-compatible API with AWS backend
 * Can be switched between localStorage (fallback) and AWS
 */
export const cloudStorageService = {
  // Use AWS storage in production, fall back to localStorage
  useAWS: process.env.NEXT_PUBLIC_USE_AWS_STORAGE === 'true',

  /**
   * Set an item (user, access_token, refresh_token, or any setting)
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (this.useAWS) {
        const data = JSON.parse(value);
        
        if (key === 'user') {
          await awsStorageService.saveUser(data);
        } else if (key === 'access_token' || key === 'refresh_token') {
          // Tokens are saved with sessions
          const user = await this.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            await awsStorageService.saveSession(
              userObj.id,
              key === 'access_token' ? value : await this.getItem('access_token') || '',
              key === 'refresh_token' ? value : await this.getItem('refresh_token') || ''
            );
          }
        } else {
          // Other settings
          const user = await this.getItem('user');
          if (user) {
            const userObj = JSON.parse(user);
            await awsStorageService.updateSetting(userObj.id, key, data);
          }
        }
      } else {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem(key, value);
        }
      }
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.setItem(key, value);
      }
    }
  },

  /**
   * Get an item
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (this.useAWS) {
        const user = await awsStorageService.getUser(this.getCurrentUserId());
        
        if (key === 'user' && user) {
          return JSON.stringify(user);
        } else if (key === 'access_token' || key === 'refresh_token') {
          const session = await awsStorageService.getSession(this.getCurrentUserId());
          if (session) {
            return key === 'access_token' ? session.accessToken : session.refreshToken;
          }
        } else {
          const settings = await awsStorageService.getSettings(this.getCurrentUserId());
          if (settings && settings[key]) {
            return JSON.stringify(settings[key]);
          }
        }
        return null;
      } else {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          return localStorage.getItem(key);
        }
        return null;
      }
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        return localStorage.getItem(key);
      }
      return null;
    }
  },

  /**
   * Remove an item
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (this.useAWS) {
        if (key === 'user') {
          const userId = this.getCurrentUserId();
          if (userId) {
            await awsStorageService.deleteUser(userId);
          }
        }
        // Other keys are removed as part of clearing user data
      } else {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    }
  },

  /**
   * Clear all items (for logout)
   */
  async clear(): Promise<void> {
    try {
      if (this.useAWS) {
        const userId = this.getCurrentUserId();
        if (userId) {
          await awsStorageService.clearUserData(userId);
        }
      } else {
        // Fallback to localStorage
        if (typeof window !== 'undefined') {
          localStorage.clear();
        }
      }
    } catch (error) {
      console.error('Error clearing storage:', error);
      // Fallback to localStorage on error
      if (typeof window !== 'undefined') {
        localStorage.clear();
      }
    }
  },

  /**
   * Upload file to cloud storage
   */
  async uploadFile(
    file: File,
    path: string,
    userId?: string
  ): Promise<string> {
    if (this.useAWS) {
      return awsStorageService.uploadFile(file, path, userId);
    } else {
      throw new Error('File upload only supported with AWS storage');
    }
  },

  /**
   * Get signed URL for file
   */
  async getSignedUrl(key: string, expiresIn?: number): Promise<string> {
    if (this.useAWS) {
      return awsStorageService.getSignedUrl(key, expiresIn);
    } else {
      throw new Error('Signed URLs only supported with AWS storage');
    }
  },

  /**
   * Delete file from cloud storage
   */
  async deleteFile(key: string): Promise<void> {
    if (this.useAWS) {
      return awsStorageService.deleteFile(key);
    }
  },

  /**
   * Save settings to cloud
   */
  async saveSettings(settings: Record<string, any>): Promise<void> {
    try {
      const userId = this.getCurrentUserId();
      if (userId && this.useAWS) {
        await awsStorageService.saveSettings(userId, {
          userId,
          ...settings,
        });
      } else if (!this.useAWS && typeof window !== 'undefined') {
        Object.keys(settings).forEach(key => {
          localStorage.setItem(key, JSON.stringify(settings[key]));
        });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  },

  /**
   * Get current user ID (for AWS operations)
   */
  getCurrentUserId(): string {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          return user.id;
        } catch (e) {
          // ignore
        }
      }
    }
    return '';
  },

  /**
   * Check if using AWS storage
   */
  isUsingAWS(): boolean {
    return this.useAWS;
  },

  /**
   * Switch storage backend (for testing/configuration)
   */
  setUseAWS(useAWS: boolean): void {
    this.useAWS = useAWS;
  },
};

export default cloudStorageService;
