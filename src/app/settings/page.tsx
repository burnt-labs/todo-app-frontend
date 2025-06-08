"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Toast from "@/components/Toast";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface Settings {
  darkMode: boolean;
  notifications: boolean;
  language: string;
  timezone: string;
}

export default function SettingsPage() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [settings, setSettings] = useState<Settings>({
    darkMode: true,
    notifications: true,
    language: "en",
    timezone: "UTC"
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState({ message: "", isVisible: false });

  useEffect(() => {
    if (account?.bech32Address && queryClient) {
      fetchSettings();
    }
  }, [account?.bech32Address, queryClient]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await queryClient?.queryContractSmart(contractAddress, {
        Get: {
          collection: "settings",
          document: account?.bech32Address
        }
      });
      
      if (response?.document) {
        setSettings(JSON.parse(response.document.data));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Settings) => {
    if (!client || !account) return;

    setLoading(true);
    try {
      await client.execute(account.bech32Address, contractAddress, {
        Set: {
          collection: "settings",
          document: account.bech32Address,
          data: JSON.stringify(newSettings)
        }
      }, "auto");

      setSettings(newSettings);
      showToast("Settings updated successfully!");
    } catch (error) {
      console.error("Error updating settings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white">Please connect your wallet to view settings</p>
      </div>
    );
  }

  if (loading && !settings) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded">
          <div>
            <h3 className="text-lg font-semibold text-white">Dark Mode</h3>
            <p className="text-white/60">Enable dark mode for better visibility in low-light conditions</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.darkMode}
              onChange={(e) => updateSettings({ ...settings, darkMode: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded">
          <div>
            <h3 className="text-lg font-semibold text-white">Notifications</h3>
            <p className="text-white/60">Receive notifications for important updates</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => updateSettings({ ...settings, notifications: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
          </label>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded">
          <h3 className="text-lg font-semibold text-white mb-4">Language</h3>
          <select
            value={settings.language}
            onChange={(e) => updateSettings({ ...settings, language: e.target.value })}
            className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
          >
            <option value="en">English</option>
            <option value="es">Español</option>
            <option value="fr">Français</option>
            <option value="de">Deutsch</option>
            <option value="ja">日本語</option>
          </select>
        </div>

        <div className="p-4 bg-white/5 border border-white/10 rounded">
          <h3 className="text-lg font-semibold text-white mb-4">Timezone</h3>
          <select
            value={settings.timezone}
            onChange={(e) => updateSettings({ ...settings, timezone: e.target.value })}
            className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
          >
            <option value="UTC">UTC</option>
            <option value="EST">Eastern Time (EST)</option>
            <option value="CST">Central Time (CST)</option>
            <option value="PST">Pacific Time (PST)</option>
            <option value="GMT">Greenwich Mean Time (GMT)</option>
          </select>
        </div>
      </div>

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
} 