'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Truck, Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { RhineRouteLogo } from '@/components/brand/logo';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-foreground text-background border-b border-background/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <RhineRouteLogo height={50} dark />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-1',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-background/70 hover:text-background'
                )}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-6 lg:flex">
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Phone className="h-4 w-4" />
              <span>+49 800 RHINE-LOG</span>
            </div>
            <Link href="/contact">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">
                Get a Quote
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-background hover:bg-background/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t border-background/10 py-4 md:hidden animate-fade-in">
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors px-2 py-2 rounded-lg',
                    pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-background/70 hover:text-background hover:bg-background/5'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-background/10 pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-background/70 px-2">
                  <Phone className="h-4 w-4" />
                  <span>+49 800 RHINE-LOG</span>
                </div>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
