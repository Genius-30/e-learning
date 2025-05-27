"use client";

import React, { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { Button, Link, useDisclosure } from "@heroui/react";
import { useModal } from "@/context/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import ResetPasswordModal from "./auth/ResetPassword";
import LoginModal from "./auth/Login";
import ThemeToggleButton from "./other/ThemeToggleButton";
import MobileMenuModal from "./MobileMenuModal";
import LogoutConfirmationModal from "./auth/LogoutConfirmationModal";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isLoggedIn } = useAuth();

  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(theme === "dark"); // Optimize theme toggle

  const signupModal = useModal();
  const mobileMenuModal = useDisclosure();
  const loginModal = useDisclosure();
  const resetPasswordModal = useDisclosure();
  const logoutModal = useDisclosure();

  useEffect(() => {
    // Menu items
    const menuItems = [
      {
        name: isLoggedIn ? "Dashboard" : "Home",
        href: isLoggedIn ? "/dashboard" : "/",
      },
      { name: "Courses", href: "/courses" },
      ...(isLoggedIn ? [{ name: "My Learnings", href: "/my-learnings" }] : []),
    ];

    setMenuItems(menuItems);
  }, [isLoggedIn]);

  // Scroll event for navbar background
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    const handleRouteChange = () => setMenuOpen(false);
    router.events?.on("routeChangeStart", handleRouteChange);
    return () => router.events?.off("routeChangeStart", handleRouteChange);
  }, [router]);

  // Theme Toggle Handler
  const handleThemeToggle = useCallback(() => {
    const newTheme = isDarkMode ? "light" : "dark";
    setIsDarkMode(!isDarkMode);
    setTheme(newTheme);
  }, [isDarkMode, setTheme]);

  return (
    <>
      <motion.nav
        className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-6 py-3 rounded-full transition-all duration-300 text-text w-[95%] md:w-[80%] ${
          scrolled
            ? "backdrop-blur-lg bg-[var(--color-background)]/90"
            : "backdrop-blur-xl bg-opacity-80"
        } bg-transparent`}
      >
        {/* Logo */}
        <div className="flex items-center space-x-3">
          <Image
            src="/logo.jpg"
            alt="E-Learning Logo"
            width={40}
            height={40}
            priority
            fetchPriority="high"
            className="rounded-full"
          />
          <div className="hidden lg:flex flex-col">
            <span className="text-lg font-semibold">E-Learning</span>
            <span className="text-xs text-gray-500">Powered by CodeBit</span>
          </div>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex space-x-8">
          {menuItems.map(({ name, href }) => (
            <NavItem key={name} href={href} label={name} />
          ))}
        </div>

        {/* Right-side Controls */}
        <div className="hidden lg:flex items-center space-x-5">
          <ThemeToggleButton
            isDarkMode={isDarkMode}
            onToggle={handleThemeToggle}
          />
          <AuthButtons
            isLoggedIn={isLoggedIn}
            onLogin={loginModal.onOpen}
            onSignup={signupModal.onOpen}
            onLogout={logoutModal.onOpen}
          />
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden"
          onClick={mobileMenuModal.onOpen}
          aria-label="Toggle mobile menu"
        >
          {menuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </motion.nav>

      {/* Authentication Modals */}
      <LoginModal
        isOpen={loginModal.isOpen}
        onOpenChange={loginModal.onOpenChange}
        onResetPasswordClick={resetPasswordModal.onOpen}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={resetPasswordModal.isOpen}
        onOpenChange={resetPasswordModal.onOpenChange}
      />

      {/* Mobile Menu Component */}
      <MobileMenuModal
        isOpen={mobileMenuModal.isOpen}
        onOpenChange={mobileMenuModal.onOpenChange}
        menuItems={menuItems}
        theme={theme}
        onThemeToggle={handleThemeToggle}
        isLoggedIn={isLoggedIn}
        onLogout={logoutModal.onOpen}
        onLogin={loginModal.onOpen}
        onSignup={signupModal.onOpen}
      />

      {/* Logout Confirmation Modal */}
      <LogoutConfirmationModal
        isOpen={logoutModal.isOpen}
        onOpenChange={logoutModal.onOpenChange}
        onOpenLogin={loginModal.onOpen}
      />
    </>
  );
}

// ✅ REUSABLE COMPONENTS ✅

// Navbar Link Item (Memoized)es5fr
const NavItem = React.memo(({ href, label }) => {
  const pathname = usePathname();
  const isActive = pathname.startsWith(href);

  return (
    <Link
      href={href}
      className={`transition text-text ${
        isActive ? "text-secondary" : "hover:text-secondary"
      }`}
    >
      {label}
    </Link>
  );
});

// Authentication Buttons (Memoized)
const AuthButtons = React.memo(
  ({ isLoggedIn, onLogin, onSignup, onLogout }) => (
    <>
      {isLoggedIn ? (
        <Button
          className="px-4 py-2 bg-secondary text-white rounded-full text-center"
          onPress={onLogout}
        >
          Logout
        </Button>
      ) : (
        <>
          <Button
            className="px-4 py-2 bg-transparent border border-[var(--border-color-primary)] rounded-full text-center"
            onPress={onLogin}
          >
            Login
          </Button>
          <Button
            className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-full text-center"
            onPress={onSignup}
          >
            Sign Up
          </Button>
        </>
      )}
    </>
  )
);
