"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { PasswordConfirmationModal } from "@/components/password-confirmation-modal"

interface UserProfile {
  id: number
  full_name: string
  email: string
  phone: string
  role: string
  bio?: string
  avatar?: string
}

export default function EditProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<UserProfile>>({})
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [changedFields, setChangedFields] = useState<Record<string, { old: string | number; new: string | number }>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = localStorage.getItem("access_token")
        const response = await fetch(`http://127.0.0.1:8000/api/auth/me/`, {
          headers: {
            "Authorization": `Bearer ${accessToken}`,
          },
        })
        const data = await response.json()
        setProfile(data.user)
        setFormData(data.user)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Calculate changed fields
    const changes: Record<string, { old: string | number; new: string | number }> = {}
    
    if (profile?.full_name !== formData.full_name) {
      changes.full_name = {
        old: profile?.full_name || "",
        new: formData.full_name || ""
      }
    }
    
    if (profile?.phone !== formData.phone) {
      changes.phone = {
        old: profile?.phone || "(not provided)",
        new: formData.phone || "(not provided)"
      }
    }
    
    if (profile?.bio !== formData.bio) {
      changes.bio = {
        old: profile?.bio || "(empty)",
        new: formData.bio || "(empty)"
      }
    }
    
    if (Object.keys(changes).length === 0) {
      alert("No changes to save")
      return
    }
    
    setChangedFields(changes)
    setShowConfirmModal(true)
  }

  const handlePasswordConfirm = async (password: string) => {
    setSaving(true)

    try {
      const accessToken = localStorage.getItem("access_token")
      const response = await fetch(`http://127.0.0.1:8000/api/auth/me/update/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          ...formData,
          password: password, // Send password for verification
        }),
      })

      if (response.ok) {
        const updatedProfile = await response.json()
        setProfile(updatedProfile.user)
        // Update localStorage
        localStorage.setItem("user", JSON.stringify(updatedProfile.user))
        setShowConfirmModal(false)
        
        // Show success message
        alert("Profile updated successfully!")
        router.push(`/profile/${profile?.id}`)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile")
      }
    } catch (error: any) {
      throw new Error(error.message || "An error occurred. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center mt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background mt-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-card border border-border rounded-lg p-8">
          <h1 className="text-3xl font-bold mb-8">Edit Profile</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">Full Name</label>
              <Input
                type="text"
                name="full_name"
                value={formData.full_name || ""}
                onChange={handleChange}
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <Input
                type="email"
                name="email"
                value={formData.email || ""}
                onChange={handleChange}
                placeholder="Your email"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Phone</label>
              <Input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                placeholder="Your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Bio</label>
              <textarea
                name="bio"
                value={formData.bio || ""}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                rows={4}
              />
            </div>

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Password Confirmation Modal */}
      <PasswordConfirmationModal
        isOpen={showConfirmModal}
        changes={changedFields}
        onConfirm={handlePasswordConfirm}
        onCancel={() => setShowConfirmModal(false)}
        isLoading={saving}
      />
    </div>
  )
}
