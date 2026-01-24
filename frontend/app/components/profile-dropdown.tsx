"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  User, 
  LogOut, 
  Heart, 
  FileText, 
  Settings, 
  Lock,
  ChevronDown 
} from "lucide-react"

interface User {
  id: number
  full_name: string
  email: string
  role: string
}

interface ProfileDropdownProps {
  user: User
  onLogout: () => void
}

export function ProfileDropdown({ user, onLogout }: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleNavigation = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <User className="w-4 h-4 text-primary" />
        <div className="text-left">
          <p className="text-xs font-semibold">{user.full_name}</p>
          <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-border">
            <p className="text-sm font-semibold">{user.full_name}</p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            {/* View My Profile */}
            <button
              onClick={() => handleNavigation(`/profile/${user.id}`)}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4 text-muted-foreground" />
              <span>View My Profile</span>
            </button>

            {/* Edit Profile */}
            <button
              onClick={() => handleNavigation(`/profile/${user.id}/edit`)}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>Edit Profile</span>
            </button>

            {/* My Donations */}
            <button
              onClick={() => handleNavigation("/donations")}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Heart className="w-4 h-4 text-muted-foreground" />
              <span>My Donations</span>
            </button>

            {/* Wishlist */}
            <button
              onClick={() => handleNavigation("/wishlist")}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Heart className="w-4 h-4 text-red-500" fill="currentColor" />
              <span>My Wishlist</span>
            </button>

            {/* My Campaigns */}
            <button
              onClick={() => handleNavigation("/my-campaigns")}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span>My Campaigns</span>
            </button>

            {/* Settings */}
            <button
              onClick={() => handleNavigation("/settings")}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span>Settings</span>
            </button>

            {/* Change Password */}
            <button
              onClick={() => handleNavigation("/change-password")}
              className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-900 flex items-center gap-3 transition-colors border-b border-border"
            >
              <Lock className="w-4 h-4 text-muted-foreground" />
              <span>Change Password</span>
            </button>

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full px-4 py-2 text-sm text-left hover:bg-red-50 dark:hover:bg-red-950 text-red-600 flex items-center gap-3 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
