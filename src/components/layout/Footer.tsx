import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { RhineRouteLogo } from '@/components/brand/logo';

export default function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center">
              <RhineRouteLogo height={40} dark />
            </Link>
            <p className="text-sm text-background/60">
              Rhine Route: Efficient Logistics, Seamless Delivery. Fast, reliable, and secure shipping worldwide.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/" className="text-background/60 hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/tracking" className="text-background/60 hover:text-primary transition-colors">
                  Track Shipment
                </Link>
              </li>
              <li>
                <Link href="/services" className="text-background/60 hover:text-primary transition-colors">
                  Our Services
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-background/60 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-background/60 hover:text-primary transition-colors flex items-center gap-2">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-3 text-background/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span>+49 800 RHINE-LOG</span>
              </li>
              <li className="flex items-center gap-3 text-background/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span>info@rhineroute.com</span>
              </li>
              <li className="flex items-start gap-3 text-background/60">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 shrink-0">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span>Rhine Tower, 12 Rheinstrasse, 60311 Frankfurt am Main, Germany</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-background/80">Follow Us</h3>
            <div className="flex gap-3">
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 text-background/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 text-background/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 text-background/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 text-background/60 hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-background/10 pt-8 text-center text-sm text-background/50">
          <p>&copy; {new Date().getFullYear()} Rhine Route. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
