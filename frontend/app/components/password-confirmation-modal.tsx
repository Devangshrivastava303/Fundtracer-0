"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Eye, EyeOff, X } from "lucide-react"

interface PasswordConfirmationModalProps {
  isOpen: boolean
  changes: Record<string, { old: string | number; new: string | number }>
  onConfirm: (password: string) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

export function PasswordConfirmationModal({
  isOpen,
  changes,
  onConfirm,
  onCancel,
  isLoading = false,
}: PasswordConfirmationModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")

  const handleConfirm = async () => {
    if (!password) {
      setError("Password is required")
      return
    }

    try {
      setError("")
      await onConfirm(password)
      setPassword("")
    } catch (err: any) {
      setError(err.message || "Failed to confirm changes")
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-bold">Confirm Changes</h2>
          <button
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Changes Summary */}
        <div className="p-6 border-b border-border bg-gray-50 dark:bg-gray-900/50">
          <p className="text-sm font-medium text-muted-foreground mb-3">
            You are about to change:
          </p>
          <div className="space-y-2">
            {Object.entries(changes).map(([field, values]) => (
              <div key={field} className="text-sm">
                <p className="font-medium capitalize">{field.replace(/_/g, " ")}</p>
                <p className="text-muted-foreground">
                  {String(values.old) || "(empty)"} → {String(values.new) || "(empty)"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Password Input */}
        <div className="p-6">
          <label className="block text-sm font-medium mb-2">
            Enter your password to confirm
          </label>
          <div className="relative mb-4">
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              placeholder="Enter your password"
              disabled={isLoading}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !isLoading) {
                  handleConfirm()
                }
              }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-md p-3 mb-4">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isLoading || !password}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isLoading ? "Confirming..." : "Confirm"}
            </Button>
            <Button
              onClick={onCancel}
              disabled={isLoading}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
