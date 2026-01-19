import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { settingsApi } from '@/api/settingsApi';

interface Settings {
  aboutContent: string;
  featuredRepos: string[];
  themeOptions: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily: string;
  };
  siteSections: {
    showAbout: boolean;
    showProjects: boolean;
    showArticles: boolean;
    showContact: boolean;
  };
  socialLinks: {
    github?: string;
    linkedin?: string;
    telegram?: string;
    email?: string;
  };
}

const DEFAULT_SETTINGS: Settings = {
  aboutContent: 'Welcome to my portfolio website. I am a passionate developer with expertise in creating modern web applications.',
  featuredRepos: [],
  themeOptions: {
    primaryColor: '#6366f1',
    secondaryColor: '#8b5cf6',
    fontFamily: 'Inter, sans-serif',
  },
  siteSections: {
    showAbout: true,
    showProjects: true,
    showArticles: true,
    showContact: true,
  },
  socialLinks: {
    github: 'https://github.com/pamod-madubashana',
    linkedin: 'https://www.linkedin.com/in/pamod-madubashana-886b621a2',
    telegram: 'https://t.me/pamod_madubashana',
    email: 'pamod.main@gmail.com',
  },
};

interface SettingsContextType {
  settings: Settings | null;
  loading: boolean;
  error: string | null;
  refreshSettings: (forceRefresh?: boolean) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export { DEFAULT_SETTINGS };

interface SettingsProviderProps {
  children: ReactNode;
}

export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);
      
      // Set up timeout promise
      const timeoutPromise = new Promise<Settings>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Settings loading timed out after 5 seconds'));
        }, 5000); // 5 seconds timeout
      });
      
      // Race between API call and timeout
      const data = await Promise.race([
        settingsApi.getSettings(forceRefresh),
        timeoutPromise
      ]);
      
      setSettings(data);
    } catch (err: any) {
      if (err.message.includes('timed out')) {
        // Use default settings on timeout
        setSettings(DEFAULT_SETTINGS);
        setError('Settings loading timed out, using default settings');
        console.warn('Settings loading timed out, using default settings:', err);
      } else {
        setError(err.message || 'Error fetching settings');
        console.error('Error fetching settings:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings(false); // Initial load, can use cache
  }, []);

  const value = {
    settings,
    loading,
    error,
    refreshSettings: (forceRefresh = true) => fetchSettings(forceRefresh)
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
};