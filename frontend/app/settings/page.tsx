"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Bell, Mail, Lock, Eye, EyeOff } from "lucide-react"

interface Settings {
  email_notifications: boolean
  campaign_updates: boolean
  donation_receipts: boolean
  marketing_emails: boolean
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    email_notifications: true,
    campaign_updates: true,
    donation_receipts: true,
    marketing_emails: false,
  })
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const handleToggle = (key: keyof Settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const accessToken = localStorage.getItem("access_token")
      await fetch("http://127.0.0.1:8000/api/accounts/settings/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(settings),
      })
    } catch (error) {
      console.error("Error saving settings:", error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        {/* Email Notifications */}
        <Card className="p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Email Notifications</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive notifications about campaigns and donations</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("email_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.email_notifications ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.email_notifications ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </Card>

        {/* Campaign Updates */}
        <Card className="p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Campaign Updates</h3>
                <p className="text-sm text-muted-foreground mt-1">Get updates on campaigns you've donated to</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("campaign_updates")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.campaign_updates ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.campaign_updates ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </Card>

        {/* Donation Receipts */}
        <Card className="p-6 mb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Donation Receipts</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive receipts for your donations</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("donation_receipts")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.donation_receipts ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.donation_receipts ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </Card>

        {/* Marketing Emails */}
        <Card className="p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-primary mt-1" />
              <div>
                <h3 className="font-semibold">Marketing Emails</h3>
                <p className="text-sm text-muted-foreground mt-1">Receive promotional emails and news</p>
              </div>
            </div>
            <button
              onClick={() => handleToggle("marketing_emails")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.marketing_emails ? "bg-primary" : "bg-gray-300"
              }`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                settings.marketing_emails ? "translate-x-6" : "translate-x-1"
              }`} />
            </button>
          </div>
        </Card>

        {/* Security Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Security</h2>
          
          <Card className="p-6 mb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-primary mt-1" />
                <div>
                  <h3 className="font-semibold">Change Password</h3>
                  <p className="text-sm text-muted-foreground mt-1">Update your password regularly to keep your account secure</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/change-password")}
              >
                Change
              </Button>
            </div>
          </Card>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          {saving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  )
}
