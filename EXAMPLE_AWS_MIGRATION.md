/**
 * EXAMPLE: How to update auth/page.tsx to use AWS Cloud Storage
 * 
 * This file shows the changes needed to migrate from localStorage to AWS.
 * It's marked as an example file - copy the patterns to your actual auth/page.tsx
 */

// Add this import at the top of auth/page.tsx
import { cloudStorageService } from "@/lib/cloud-storage";
import { useUser, useAuthTokens } from "@/lib/use-cloud-storage";

// ============================================
// EXAMPLE 1: Login Handler (OLD vs NEW)
// ============================================

// OLD CODE (localStorage):
async function handleLoginOld() {
  const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    // OLD: Direct localStorage usage
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);

    router.push("/");
  }
}

// NEW CODE (AWS Cloud Storage):
async function handleLoginNew() {
  const res = await fetch("http://127.0.0.1:8000/api/auth/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await res.json();
  if (res.ok) {
    // NEW: Use cloud storage service (handles AWS/localStorage automatically)
    await cloudStorageService.setItem("user", JSON.stringify(data.user));
    await cloudStorageService.setItem("access_token", data.access_token);
    await cloudStorageService.setItem("refresh_token", data.refresh_token);

    router.push("/");
  }
}

// ============================================
// EXAMPLE 2: Signup Handler
// ============================================

// OLD CODE:
async function handleSignupOld() {
  const res = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
    method: "POST",
    body: JSON.stringify(/* ... */),
  });
  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("access_token", data.access_token);
    localStorage.setItem("refresh_token", data.refresh_token);
    router.push("/");
  }
}

// NEW CODE:
async function handleSignupNew() {
  const res = await fetch("http://127.0.0.1:8000/api/auth/signup/", {
    method: "POST",
    body: JSON.stringify(/* ... */),
  });
  const data = await res.json();
  if (res.ok) {
    await cloudStorageService.setItem("user", JSON.stringify(data.user));
    await cloudStorageService.setItem("access_token", data.access_token);
    await cloudStorageService.setItem("refresh_token", data.refresh_token);
    router.push("/");
  }
}

// ============================================
// EXAMPLE 3: Using Hooks in Components
// ============================================

// Use the useUser hook for automatic state management:
function ExampleComponent() {
  const { user, saveUser, clearUser, isLoggedIn, loading } = useUser();
  const { accessToken, refreshToken, saveTokens, clearTokens } = useAuthTokens();

  const handleLogin = async () => {
    // Get tokens from API
    const data = await loginAPI();
    // Save everything at once
    await saveUser(data.user);
    await saveTokens(data.access_token, data.refresh_token);
  };

  const handleLogout = async () => {
    // Clear everything
    await clearUser();
    await clearTokens();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome, {user?.full_name}</p>
      ) : (
        <p>Please login</p>
      )}
    </div>
  );
}

// ============================================
// EXAMPLE 4: File Uploads with AWS S3
// ============================================

import { useFileUpload } from "@/lib/use-cloud-storage";

function MilestoneUploadComponent({ campaignId, milestoneId, userId }) {
  const { uploadFile, uploading, progress, error } = useFileUpload();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const path = `campaigns/${campaignId}/milestones/${milestoneId}/${file.name}`;
      const url = await uploadFile(file, path, userId);
      console.log("File uploaded to:", url);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div>
      <input
        type="file"
        onChange={handleFileUpload}
        disabled={uploading}
        accept="image/*,.pdf"
      />
      {uploading && <p>Uploading... {progress}%</p>}
      {error && <p>Error: {error.message}</p>}
    </div>
  );
}

// ============================================
// EXAMPLE 5: Settings Management
// ============================================

import { useSettings } from "@/lib/use-cloud-storage";

function SettingsComponent() {
  const { settings, updateSetting, updateSettings, loading } = useSettings();

  const handleThemeChange = async (theme: string) => {
    await updateSetting("theme", theme);
  };

  const handleSaveAll = async () => {
    await updateSettings({
      theme: "dark",
      notifications: { email: true },
      preferences: { language: "en" },
    });
  };

  if (loading) return <div>Loading settings...</div>;

  return (
    <div>
      <p>Current theme: {settings?.theme}</p>
      <button onClick={() => handleThemeChange("dark")}>Dark Mode</button>
      <button onClick={handleSaveAll}>Save All</button>
    </div>
  );
}

// ============================================
// EXAMPLE 6: Header Component Updates
// ============================================

// OLD CODE (header.tsx):
function HeaderOld() {
  const handleLogout = async () => {
    // Clear localStorage directly
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    router.push("/");
  };

  useEffect(() => {
    const userData = localStorage.getItem("user");
    setUser(userData ? JSON.parse(userData) : null);
  }, []);
}

// NEW CODE (header.tsx):
function HeaderNew() {
  const { user, clearUser } = useUser();

  const handleLogout = async () => {
    // Use cloud storage service to clear everything
    await clearUser();
    // Also clear tokens
    await cloudStorageService.removeItem("access_token");
    await cloudStorageService.removeItem("refresh_token");
    router.push("/");
  };

  // useUser hook automatically handles loading, no manual useEffect needed!
}

// ============================================
// MIGRATION SUMMARY
// ============================================

/*
QUICK MIGRATION CHECKLIST:

1. Replace all localStorage.setItem() with:
   await cloudStorageService.setItem()

2. Replace all localStorage.getItem() with:
   await cloudStorageService.getItem()

3. Replace all localStorage.removeItem() with:
   await cloudStorageService.removeItem()

4. Replace all localStorage.clear() with:
   await cloudStorageService.clear()

5. For React components, use hooks:
   - useUser() for user data
   - useAuthTokens() for auth tokens
   - useFileUpload() for file uploads
   - useSettings() for settings

6. Update .env.local with AWS credentials

7. Test thoroughly before deploying

KEY BENEFITS:
✅ Secure cloud storage instead of browser storage
✅ Cross-device synchronization
✅ Server-side session management
✅ File upload to S3
✅ Automatic fallback to localStorage
✅ Type-safe with TypeScript
*/

export default {};
