'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Bell,
  Shield,
  User,
  Palette,
  Smartphone,
  Globe,
  ChevronRight,
  Download,
  Trash2,
} from 'lucide-react';
import { useDarkMode } from '@/contexts/DarkModeContext';
import { useSession, signOut } from 'next-auth/react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    reminders: true,
    updates: false,
  });

  const [privacy, setPrivacy] = useState({
    shareData: false,
    analytics: true,
    location: false,
  });

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(
      `${key.charAt(0).toUpperCase() + key.slice(1)} notifications ${
        !notifications[key] ? 'enabled' : 'disabled'
      }`
    );
  };

  const handlePrivacyChange = (key: keyof typeof privacy) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
    toast.success(
      `${key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')} ${
        !privacy[key] ? 'enabled' : 'disabled'
      }`
    );
  };

  const exportData = () => {
    toast.success('Data export started. You will receive an email when ready.');
  };

  const deleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      toast.success('Account deletion request submitted');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account preferences and privacy
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-600" />
              <span>Notifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-notifications" className="text-sm font-medium">
                  Email notifications
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Receive updates via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={notifications.email}
                onCheckedChange={() => handleNotificationChange('email')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="push-notifications" className="text-sm font-medium">
                  Push notifications
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Get alerts on your device
                </p>
              </div>
              <Switch
                id="push-notifications"
                checked={notifications.push}
                onCheckedChange={() => handleNotificationChange('push')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reminders" className="text-sm font-medium">
                  Pain log reminders
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily reminders to log pain
                </p>
              </div>
              <Switch
                id="reminders"
                checked={notifications.reminders}
                onCheckedChange={() => handleNotificationChange('reminders')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="updates" className="text-sm font-medium">
                  App updates
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  New features and improvements
                </p>
              </div>
              <Switch
                id="updates"
                checked={notifications.updates}
                onCheckedChange={() => handleNotificationChange('updates')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-600" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="share-data" className="text-sm font-medium">
                  Share data with doctors
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Allow doctors to view your pain logs
                </p>
              </div>
              <Switch
                id="share-data"
                checked={privacy.shareData}
                onCheckedChange={() => handlePrivacyChange('shareData')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="text-sm font-medium">
                  Usage analytics
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Help improve the app</p>
              </div>
              <Switch
                id="analytics"
                checked={privacy.analytics}
                onCheckedChange={() => handlePrivacyChange('analytics')}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="location" className="text-sm font-medium">
                  Location services
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">For emergency contacts</p>
              </div>
              <Switch
                id="location"
                checked={privacy.location}
                onCheckedChange={() => handlePrivacyChange('location')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="w-5 h-5 text-purple-600" />
              <span>Appearance</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode" className="text-sm font-medium">
                  Dark mode
                </Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Use dark theme</p>
              </div>
              <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5 text-orange-600" />
              <span>Account</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session?.user?.email}</p>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Password</Label>
                <p className="text-xs text-gray-500 dark:text-gray-400">Change your password</p>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <Separator />

            <Button variant="outline" className="w-full justify-start" onClick={exportData}>
              <Download className="w-4 h-4 mr-2" />
              Export my data
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={deleteAccount}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete account
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Support & Legal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <span>Support & Legal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="ghost" className="w-full justify-start">
              Help & FAQ
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Contact Support
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Privacy Policy
            </Button>
            <Button variant="ghost" className="w-full justify-start">
              Terms of Service
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Smartphone className="w-5 h-5 text-green-600" />
              <span>App Info</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Version</span>
              <span className="text-sm font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Build</span>
              <span className="text-sm font-medium">2024.1.1</span>
            </div>
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
