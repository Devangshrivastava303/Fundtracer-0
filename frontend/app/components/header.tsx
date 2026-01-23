"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Menu, X, Heart, LogOut, User } from "lucide-react"
import { ProfileDropdown } from "./profile-dropdown"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("user")
    const accessToken = localStorage.getItem("access_token")

    if (userData && accessToken) {
      setIsLoggedIn(true)
      setUser(JSON.parse(userData))
    }
    setIsLoading(false)
  }, [])

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")
      
      // Call backend logout endpoint
      await fetch("http://127.0.0.1:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      // Clear localStorage
      localStorage.removeItem("user")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      setIsLoggedIn(false)
      setUser(null)

      // Redirect to landing page
      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
      // Clear localStorage anyway
      localStorage.removeItem("user")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      router.push("/")
    }
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">Fundtracer</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/campaigns"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Campaigns
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              How It Works
            </Link>
            <Link
              href="/ngos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              NGOs
            </Link>
            <Link
              href="/faqs"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              FAQs
            </Link>
            <Link
              href="/help-center"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Help Center
            </Link>
            <Link href="/about" className="hover:text-blue-600 transition-colors">
              About Us
            </Link>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {!isLoading && isLoggedIn && user ? (
              <>
                {/* Start Fundraiser Button */}
                <Button 
                  onClick={() => router.push("/campaigns/create")}
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Start a Fundraiser
                </Button>

                {/* Profile Dropdown */}
                <ProfileDropdown 
                  user={user}
                  onLogout={handleLogout}
                />
              </>
            ) : (
              <>
                <Button 
                  onClick={() => router.push("/auth")}
                  variant="ghost" 
                  size="sm"
                >
                  Login/Signup
                </Button>
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                  Donate Now
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Toggle menu">
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link
                href="/campaigns"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Campaigns
              </Link>
              <Link
                href="#how-it-works"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                How It Works
              </Link>
              <Link
                href="#ngos"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                NGOs
              </Link>
              <Link
                href="/faqs"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                FAQs
              </Link>
              <Link
                href="/help-center"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Help Center
              </Link>
              <Link
                href="#about"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                About Us
              </Link>
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {!isLoading && isLoggedIn && user ? (
                  <>
                    {/* Mobile User Info */}
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <User className="w-4 h-4 text-primary" />
                      <div>
                        <p className="text-xs font-semibold">{user.full_name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                      </div>
                    </div>

                    {/* Mobile Start Fundraiser Button */}
                    <Button 
                      onClick={() => router.push("/campaigns/create")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white justify-start"
                    >
                      Start a Fundraiser
                    </Button>

                    {/* Mobile Menu Items */}
                    <Button 
                      onClick={() => router.push(`/profile/${user.id}`)}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      View My Profile
                    </Button>
                    <Button 
                      onClick={() => router.push(`/profile/${user.id}/edit`)}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      onClick={() => router.push("/donations")}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      My Donations
                    </Button>
                    <Button 
                      onClick={() => router.push("/my-campaigns")}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      My Campaigns
                    </Button>
                    <Button 
                      onClick={() => router.push("/settings")}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      Settings
                    </Button>
                    <Button 
                      onClick={() => router.push("/change-password")}
                      variant="ghost"
                      size="sm"
                      className="justify-start"
                    >
                      Change Password
                    </Button>

                    {/* Mobile Logout Button */}
                    <Button 
                      onClick={handleLogout}
                      variant="destructive"
                      size="sm"
                      className="justify-start flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      onClick={() => router.push("/auth")}
                      variant="ghost" 
                      size="sm" 
                      className="justify-start"
                    >
                      Login/Signup
                    </Button>
                    <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                      Donate Now
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
