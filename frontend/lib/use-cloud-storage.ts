import { useCallback, useEffect, useState } from 'react';
import { cloudStorageService } from './cloud-storage';

/**
 * Hook for using cloud storage in React components
 * Automatically handles AWS/localStorage switching
 */
export function useCloudStorage(key: string) {
  const [value, setValue] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Load value on mount
  useEffect(() => {
    const loadValue = async () => {
      try {
        setLoading(true);
        const val = await cloudStorageService.getItem(key);
        setValue(val);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadValue();
  }, [key]);

  // Set value
  const setStorageValue = useCallback(
    async (newValue: string | ((val: string | null) => string)) => {
      try {
        const valueToStore =
          newValue instanceof Function ? newValue(value) : newValue;

        setValue(valueToStore);
        await cloudStorageService.setItem(key, valueToStore);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [key, value]
  );

  // Remove value
  const removeValue = useCallback(async () => {
    try {
      setValue(null);
      await cloudStorageService.removeItem(key);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [key]);

  return [value, setStorageValue, removeValue, loading, error] as const;
}

/**
 * Hook for managing user data in cloud storage
 */
export function useUser() {
  const [userStr, setUserStr, clearUser, loading] = useCloudStorage('user');
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error('Error parsing user:', e);
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [userStr]);

  const saveUser = async (userData: any) => {
    await setUserStr(JSON.stringify(userData));
  };

  return {
    user,
    saveUser,
    clearUser,
    loading,
    isLoggedIn: !!user,
  };
}

/**
 * Hook for managing authentication tokens
 */
export function useAuthTokens() {
  const [accessToken, setAccessToken, clearAccessToken] =
    useCloudStorage('access_token');
  const [refreshToken, setRefreshToken, clearRefreshToken] =
    useCloudStorage('refresh_token');

  const saveTokens = async (access: string, refresh: string) => {
    await Promise.all([
      setAccessToken(access),
      setRefreshToken(refresh),
    ]);
  };

  const clearTokens = async () => {
    await Promise.all([clearAccessToken(), clearRefreshToken()]);
  };

  return {
    accessToken,
    refreshToken,
    saveTokens,
    clearTokens,
    isAuthenticated: !!accessToken,
  };
}

/**
 * Hook for file uploads to S3
 */
export function useFileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [progress, setProgress] = useState(0);

  const uploadFile = useCallback(
    async (file: File, path: string, userId?: string) => {
      try {
        setUploading(true);
        setError(null);
        setProgress(0);

        // Simulate progress for better UX
        const interval = setInterval(() => {
          setProgress((prev) => Math.min(prev + 10, 90));
        }, 100);

        const url = await cloudStorageService.uploadFile(file, path, userId);

        clearInterval(interval);
        setProgress(100);

        return url;
      } catch (err) {
        setError(err as Error);
        throw err;
      } finally {
        setUploading(false);
      }
    },
    []
  );

  const getSignedUrl = useCallback(async (key: string, expiresIn?: number) => {
    try {
      return await cloudStorageService.getSignedUrl(key, expiresIn);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const deleteFile = useCallback(async (key: string) => {
    try {
      await cloudStorageService.deleteFile(key);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  return {
    uploadFile,
    getSignedUrl,
    deleteFile,
    uploading,
    progress,
    error,
  };
}

/**
 * Hook for settings management
 */
export function useSettings() {
  const [settings, setSettings] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        // Load individual settings from storage
        const theme = await cloudStorageService.getItem('theme');
        const notifications = await cloudStorageService.getItem(
          'notifications'
        );
        const preferences = await cloudStorageService.getItem('preferences');

        setSettings({
          theme: theme ? JSON.parse(theme) : 'light',
          notifications: notifications ? JSON.parse(notifications) : {},
          preferences: preferences ? JSON.parse(preferences) : {},
        });
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSetting = useCallback(async (key: string, value: any) => {
    try {
      await cloudStorageService.setItem(key, JSON.stringify(value));
      setSettings((prev) => ({
        ...prev,
        [key]: value,
      }));
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, []);

  const updateSettings = useCallback(
    async (newSettings: Record<string, any>) => {
      try {
        await cloudStorageService.saveSettings(newSettings);
        setSettings((prev) => ({
          ...prev,
          ...newSettings,
        }));
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    []
  );

  return {
    settings,
    updateSetting,
    updateSettings,
    loading,
    error,
  };
}

export default useCloudStorage;
