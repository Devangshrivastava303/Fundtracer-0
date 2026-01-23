"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  BarChart3,
  Users,
  Heart,
  FileText,
  LogOut,
  Menu,
  X,
  Home,
  DollarSign,
} from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export function AdminLayout({ children, currentPage }: AdminLayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in and is admin
    const userData = localStorage.getItem("user")
    const accessToken = localStorage.getItem("access_token")

    if (!userData || !accessToken) {
      // No authentication, redirect to login
      router.push("/auth")
      return
    }

    try {
      const userObj = JSON.parse(userData)
      setUser(userObj)
      setIsLoggedIn(true)
      
      // Check if admin (check is_staff or is_superuser)
      const isAdminUser = userObj.is_staff === true || userObj.is_superuser === true
      
      console.log("User data:", {
        full_name: userObj.full_name,
        is_staff: userObj.is_staff,
        is_superuser: userObj.is_superuser,
        isAdminUser: isAdminUser,
      })
      
      if (!isAdminUser) {
        console.warn("User is not an admin, redirecting to home")
        router.push("/")
        return
      }
      
      setIsAdmin(true)
    } catch (error) {
      console.error("Error parsing user data:", error)
      router.push("/auth")
    }
  }, [])

  const handleLogout = async () => {
    try {
      const accessToken = localStorage.getItem("access_token")

      await fetch("http://127.0.0.1:8000/api/auth/logout/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      })

      localStorage.removeItem("user")
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")

      router.push("/")
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const menuItems = [
    { name: "Dashboard", icon: Home, href: "/admin" },
    { name: "Donations", icon: Heart, href: "/admin/donations" },
    { name: "Campaigns", icon: FileText, href: "/admin/campaigns" },
    { name: "Users", icon: Users, href: "/admin/users" },
    { name: "Analytics", icon: BarChart3, href: "/admin/analytics" },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-gray-900 text-white shadow-lg transform transition-transform duration-300 z-40 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6" />
            FundTracer Admin
          </h1>
        </div>

        <nav className="p-6 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentPage === item.name
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold">{user?.full_name?.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold">{user?.full_name}</p>
              <p className="text-xs text-gray-400">Admin</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="w-full flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="md:ml-64">
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between p-6">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <h2 className="text-2xl font-bold text-gray-900 flex-1 text-center md:text-left">
              Admin Dashboard
            </h2>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">{children}</div>
      </main>

      {/* Overlay for mobile menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-30"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </div>
  )
}
