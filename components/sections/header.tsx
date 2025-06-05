"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { DynamicWidget } from "@/lib/dynamic";

// Logo placeholder - you can replace this with your actual logo
const LogoIcon = () => (
  <div className="w-8 h-8 mr-2 bg-green-400 rounded-lg flex items-center justify-center text-black font-bold text-sm">
    $
  </div>
);

const LogoSection = ({ logoText }: { logoText: string }) => (
  <div className="flex items-center group">
    <Link
      href="/"
      className="flex items-center"
      title="Paperhead Trading Agent homepage"
    >
      <LogoIcon />
      <span className="font-bold tracking-wide text-green-300 text-2xl group-hover:text-green-200 transition-colors duration-300 cursor-pointer">
        {logoText}
      </span>
    </Link>
  </div>
);

const DesktopNavigation = ({ isWalletLoading }: { isWalletLoading: boolean }) => (
  <div className="hidden lg:flex items-center justify-end">
    {isWalletLoading ? (
      <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
    ) : (
      <div className="w-[120px]">
        <DynamicWidget
          innerButtonComponent={
            <span className="font-bold text-green-300 text-lg">Connect</span>
          }
        />
      </div>
    )}
  </div>
);

const MobileMenuButton = ({ 
  isMenuOpen, 
  setIsMenuOpen 
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
}) => (
  <button
    onClick={() => setIsMenuOpen(!isMenuOpen)}
    className="p-2 text-green-300 hover:text-green-200 relative lg:hidden"
    aria-label="Menu"
  >
    {isMenuOpen ? (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 18L18 6M6 6l12 12" />
      </svg>
    ) : (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    )}
  </button>
);

const MobileMenu = ({ 
  isMenuOpen, 
  setIsMenuOpen, 
  isWalletLoading 
}: {
  isMenuOpen: boolean;
  setIsMenuOpen: (isOpen: boolean) => void;
  isWalletLoading: boolean;
}) => (
  <div className={`lg:hidden transition-all duration-300 ease-in-out ${
    isMenuOpen ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
  }`}>
    <div className="px-4 pt-4 pb-4 space-y-4 bg-gray-900/90 backdrop-blur-sm rounded-lg mt-2">
      <div className="flex justify-center">
        {isWalletLoading ? (
          <div className="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <div className="w-full max-w-[200px]">
            <DynamicWidget
              innerButtonComponent={
                <span className="font-bold text-green-300 text-lg">Connect Wallet</span>
              }
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

export function Header() {
  const [lastScrollY, setLastScrollY] = useState(0);
  const [blur, setBlur] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWalletLoading, setIsWalletLoading] = useState(true);

  const logoText = "$paperhead trading agent";

  // Effects
  useEffect(() => {
    setIsWalletLoading(false);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setLastScrollY(offset);
      setBlur(offset > 5);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const header = document.getElementById('header-root');
      if (isMenuOpen && header && !header.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  return (
    <>
      <header 
        className={`fixed top-0 right-0 left-0 z-50 transition-all duration-300 ${
          blur ? "backdrop-blur-sm bg-black/20" : "bg-transparent"
        } min-h-20`} 
        id="header-root"
      >
        <nav className="container px-4 mx-auto">
          <div className="flex items-center justify-between h-16">
            <LogoSection logoText={logoText} />
            
            <DesktopNavigation isWalletLoading={isWalletLoading} />
            
            <div className="flex items-center gap-4 lg:hidden">
              <MobileMenuButton
                isMenuOpen={isMenuOpen}
                setIsMenuOpen={setIsMenuOpen}
              />
            </div>
          </div>
          
          <MobileMenu
            isMenuOpen={isMenuOpen}
            setIsMenuOpen={setIsMenuOpen}
            isWalletLoading={isWalletLoading}
          />
        </nav>
      </header>
      
      {/* Subtitle section - positioned below the fixed header */}
      <div className="pt-20 pb-6 text-center">
        <p className="text-green-500 text-lg font-medium">AUTONOMOUS TRADING AGENT v0.1</p>
      </div>
    </>
  );
} 