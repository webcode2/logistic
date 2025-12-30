import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Truck, Menu, X, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/tracking', label: 'Tracking' },
  { href: '/services', label: 'Services' },
  { href: '/contact', label: 'Contact' },
];

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full bg-foreground text-background border-b border-background/10">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary shadow-lg shadow-primary/30">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-background">LogiTrack</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={cn(
                  'text-sm font-medium transition-colors relative py-1',
                  location.pathname === link.href
                    ? 'text-primary'
                    : 'text-background/70 hover:text-background'
                )}
              >
                {link.label}
                {location.pathname === link.href && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Contact Info - Desktop */}
          <div className="hidden items-center gap-4 lg:flex">
            <div className="flex items-center gap-2 text-sm text-background/70">
              <Phone className="h-4 w-4" />
              <span>+234 800 LOGISTICS</span>
            </div>
            <Link to="/login">
              <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                Admin Login
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
                  to={link.href}
                  className={cn(
                    'text-sm font-medium transition-colors px-2 py-2 rounded-lg',
                    location.pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-background/70 hover:text-background hover:bg-background/5'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-background/10 pt-4 mt-2">
                <div className="flex items-center gap-2 text-sm text-background/70 mb-3 px-2">
                  <Phone className="h-4 w-4" />
                  <span>+234 800 LOGISTICS</span>
                </div>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="default" size="sm" className="w-full bg-primary hover:bg-primary/90">
                    Admin Login
                  </Button>
                </Link>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
