import { useState, useEffect } from 'react';
import { API_BASE_URL } from '@/lib/apiConfig';
import { settingsApi } from '@/api/settingsApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { Settings as SettingsIcon, Save, CheckCircle, XCircle } from 'lucide-react';

interface Settings {
  _id?: string;
  siteSections: {
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

const SettingsPage = () => {
  const [settings, setSettings] = useState<Settings>({
    siteSections: {
      showProjects: true,
      showArticles: true,
      showContact: true
    },
    socialLinks: {
      github: '',
      linkedin: '',
      telegram: '',
      email: ''
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Use the settings API with force refresh
        const data = await settingsApi.getSettings(true); // Force refresh to get latest from backend
        // Merge API data with default structure to ensure all fields exist
        setSettings(prev => ({
          ...prev,
          ...data,
          socialLinks: {
            github: '',
            linkedin: '',
            telegram: '',
            email: '',
            ...(prev.socialLinks || {}),
            ...(data.socialLinks || {})
          }
        }));
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [token]);

  const handleChange = (field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };


  const handleSectionChange = (field: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      siteSections: {
        ...prev.siteSections,
        [field]: value
      }
    }));
  };

  const handleSocialChange = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [field]: value
      }
    }));
  };

  const { refreshSettings } = useSettings();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      console.log('Sending settings to backend:', settings);
      const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(settings)
      });
      
      const responseText = await response.text();
      console.log('Response from backend:', response.status, responseText);

      if (response.ok) {
        setSavedSuccessfully(true);
        // Refresh settings to apply changes immediately
        await refreshSettings(true);
        setTimeout(() => setSavedSuccessfully(false), 3000);
      } else {
        console.error('Error saving settings:', response.status, responseText);
      }
    } catch (error) {
      console.error('Network error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <SettingsIcon className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-white">Site Settings</h1>
          </div>
          <p className="text-muted-foreground">Manage your portfolio site configuration</p>
        </header>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Social Links */}
            <div className="space-y-6">
              <Card className="glass border border-primary/30 h-full">
                <CardHeader>
                  <CardTitle>Social Links</CardTitle>
                  <CardDescription>Connect with visitors on social platforms</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="github">GitHub Profile</Label>
                      <Input
                        id="github"
                        type="url"
                        value={settings.socialLinks.github || ''}
                        onChange={(e) => handleSocialChange('github', e.target.value)}
                        placeholder="https://github.com/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="linkedin">LinkedIn Profile</Label>
                      <Input
                        id="linkedin"
                        type="url"
                        value={settings.socialLinks.linkedin || ''}
                        onChange={(e) => handleSocialChange('linkedin', e.target.value)}
                        placeholder="https://linkedin.com/in/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telegram">Telegram Profile</Label>
                      <Input
                        id="telegram"
                        type="url"
                        value={settings.socialLinks.telegram || ''}
                        onChange={(e) => handleSocialChange('telegram', e.target.value)}
                        placeholder="https://t.me/username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={settings.socialLinks.email || ''}
                        onChange={(e) => handleSocialChange('email', e.target.value)}
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Right Column - Site Sections */}
            <div className="space-y-6">
              <Card className="glass border border-primary/30 h-full">
                <CardHeader>
                  <CardTitle>Site Sections</CardTitle>
                  <CardDescription>Control which sections are visible</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showProjects">Show Projects Section</Label>
                      <Switch
                        id="showProjects"
                        checked={settings.siteSections.showProjects}
                        onCheckedChange={(checked) => handleSectionChange('showProjects', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showArticles">Show Articles Section</Label>
                      <Switch
                        id="showArticles"
                        checked={settings.siteSections.showArticles}
                        onCheckedChange={(checked) => handleSectionChange('showArticles', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="showContact">Show Contact Section</Label>
                      <Switch
                        id="showContact"
                        checked={settings.siteSections.showContact}
                        onCheckedChange={(checked) => handleSectionChange('showContact', checked)}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <Button type="submit" disabled={saving} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Settings
                </>
              )}
            </Button>
            {savedSuccessfully && (
              <div className="flex items-center gap-2 text-green-500">
                <CheckCircle className="w-4 h-4" />
                Settings saved successfully!
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;