"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

interface SidebarContextType {
  isOpen: boolean
  isCollapsed: boolean
  toggleSidebar: () => void
  toggleCollapse: () => void
  closeSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false) // For mobile drawer toggle
  const [isCollapsed, setIsCollapsed] = useState(false) // For desktop sidebar collapse

  // Close mobile sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const toggleSidebar = () => {
    // If desktop, toggle collapsed state; if mobile, toggle drawer
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      setIsCollapsed((prev) => !prev)
    } else {
      setIsOpen((prev) => !prev)
    }
  }

  const toggleCollapse = () => setIsCollapsed((prev) => !prev)
  const closeSidebar = () => setIsOpen(false)

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        isCollapsed,
        toggleSidebar,
        toggleCollapse,
        closeSidebar
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}
