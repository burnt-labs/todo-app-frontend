"use client";
import { useState, useEffect } from "react";
import { useAbstraxionAccount, useAbstraxionSigningClient, useAbstraxionClient } from "@burnt-labs/abstraxion";
import { Button } from "@burnt-labs/ui";
import Toast from "@/components/Toast";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

interface Profile {
  displayName: string;
  bio: string;
  avatar: string;
  socialLinks: {
    twitter?: string;
    github?: string;
    website?: string;
  };
}

export default function ProfilePage() {
  const { data: account } = useAbstraxionAccount();
  const { client } = useAbstraxionSigningClient();
  const { client: queryClient } = useAbstraxionClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Profile>({
    displayName: "",
    bio: "",
    avatar: "",
    socialLinks: {}
  });
  const [toast, setToast] = useState({ message: "", isVisible: false });

  useEffect(() => {
    if (account?.bech32Address && queryClient) {
      fetchProfile();
    }
  }, [account?.bech32Address, queryClient]);

  const showToast = (message: string) => {
    setToast({ message, isVisible: true });
  };

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await queryClient?.queryContractSmart(contractAddress, {
        Get: {
          collection: "profiles",
          document: account?.bech32Address
        }
      });
      
      if (response?.document) {
        const profileData = JSON.parse(response.document.data);
        setProfile(profileData);
        setEditedProfile(profileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!client || !account) return;

    setLoading(true);
    try {
      await client.execute(account.bech32Address, contractAddress, {
        Set: {
          collection: "profiles",
          document: account.bech32Address,
          data: JSON.stringify(editedProfile)
        }
      }, "auto");

      setProfile(editedProfile);
      setIsEditing(false);
      showToast("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!account?.bech32Address) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white">Please connect your wallet to view profile</p>
      </div>
    );
  }

  if (loading && !profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-white">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold text-white mb-8">My Profile</h1>

      {isEditing ? (
        <div className="space-y-6">
          <div>
            <label className="block text-white mb-2">Display Name</label>
            <input
              type="text"
              value={editedProfile.displayName}
              onChange={(e) => setEditedProfile({ ...editedProfile, displayName: e.target.value })}
              className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Bio</label>
            <textarea
              value={editedProfile.bio}
              onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
              className="w-full p-2 rounded bg-white/10 text-white border border-white/20 h-32"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Avatar URL</label>
            <input
              type="text"
              value={editedProfile.avatar}
              onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
              className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
            />
          </div>

          <div>
            <label className="block text-white mb-2">Social Links</label>
            <div className="space-y-2">
              <input
                type="text"
                value={editedProfile.socialLinks.twitter || ""}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, twitter: e.target.value }
                })}
                placeholder="Twitter URL"
                className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              />
              <input
                type="text"
                value={editedProfile.socialLinks.github || ""}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, github: e.target.value }
                })}
                placeholder="GitHub URL"
                className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              />
              <input
                type="text"
                value={editedProfile.socialLinks.website || ""}
                onChange={(e) => setEditedProfile({
                  ...editedProfile,
                  socialLinks: { ...editedProfile.socialLinks, website: e.target.value }
                })}
                placeholder="Website URL"
                className="w-full p-2 rounded bg-white/10 text-white border border-white/20"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <Button
              onClick={updateProfile}
              disabled={loading}
              structure="base"
            >
              Save Changes
            </Button>
            <Button
              onClick={() => {
                setIsEditing(false);
                setEditedProfile(profile || editedProfile);
              }}
              structure="base"
              variant="secondary"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            {profile?.avatar && (
              <img
                src={profile.avatar}
                alt="Profile"
                className="w-24 h-24 rounded-full"
              />
            )}
            <div>
              <h2 className="text-xl font-bold text-white">{profile?.displayName || "Anonymous"}</h2>
              <p className="text-white/60">{account.bech32Address}</p>
            </div>
          </div>

          {profile?.bio && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Bio</h3>
              <p className="text-white/80">{profile.bio}</p>
            </div>
          )}

          {(profile?.socialLinks?.twitter || profile?.socialLinks?.github || profile?.socialLinks?.website) && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Social Links</h3>
              <div className="space-y-2">
                {profile.socialLinks.twitter && (
                  <a
                    href={profile.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-white"
                  >
                    Twitter
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-white"
                  >
                    GitHub
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-white/80 hover:text-white"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          )}

          <Button
            onClick={() => setIsEditing(true)}
            structure="base"
          >
            Edit Profile
          </Button>
        </div>
      )}

      <Toast
        message={toast.message}
        isVisible={toast.isVisible}
        onClose={() => setToast({ ...toast, isVisible: false })}
      />
    </div>
  );
} 