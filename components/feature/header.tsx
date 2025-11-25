"use client"

import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Bell, User } from "lucide-react"
import { useEffect, useState } from "react"

export function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Determine scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 800) {
        // Scrolling down - hide header
        setVisible(false)
      } else {
        // Scrolling up - show header
        setVisible(true)
      }

      setScrolled(currentScrollY > 20)
      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        visible ? "top-4 left-4 right-4" : "-top-24 left-4 right-4"
      }`}
    >
      <div
        className={`bg-[#2a3034] backdrop-blur-md shadow-xl rounded-3xl transition-all duration-300 ${
          scrolled ? "shadow-2xl" : "shadow-xl"
        }`}
      >
        <div className="container flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/20">
                <MessageSquare className="h-5 w-5 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold leading-none tracking-tight text-foreground">
                Forcepoint Intelligence
                </span>
                <span className="text-[10px] font-medium uppercase leading-none tracking-wider text-muted-foreground">
                  Intelligence
                </span>
              </div>
            </div>

            <nav className="hidden items-center gap-6 md:flex">
              <a href="#" className="text-sm font-medium text-primary transition-colors hover:text-primary/80">
                Assistant
              </a>
              <a href="#" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                Knowledge Base
              </a>
              <a href="#" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                Analytics
              </a>
              <a href="#" className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground">
                Resources
              </a>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/70 hover:text-foreground">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/70 hover:text-foreground">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 text-foreground/70 hover:text-foreground">
              <User className="h-4 w-4" />
              <span className="sr-only">User menu</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
