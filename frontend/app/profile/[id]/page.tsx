"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface UserProfile {
  id: number
  full_name: string
  email: string
  phone: string
  role: string
  bio?: string
  avatar?: string
}

export default function ProfilePage() {
  const params = useParams()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

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
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

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
          <h1 className="text-3xl font-bold mb-8">My Profile</h1>

          {profile && (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-lg font-semibold">{profile.full_name}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Email</label>
                <p className="text-lg">{profile.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Phone</label>
                <p className="text-lg">{profile.phone || "Not provided"}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Role</label>
                <p className="text-lg capitalize">{profile.role}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">Bio</label>
                <p className="text-lg">{profile.bio || "No bio added"}</p>
              </div>

              <Button
                onClick={() => router.push(`/profile/${profile.id}/edit`)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Edit Profile
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
