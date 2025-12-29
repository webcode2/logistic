import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, CheckCircle, Globe, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-primary/10 py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in">
              Global Logistics{' '}
              <span className="text-gradient">Solutions</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground sm:text-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Fast, reliable, and secure shipping solutions for businesses worldwide. 
              Track your packages in real-time and enjoy peace of mind.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/tracking">
                <Button size="lg" className="w-full sm:w-auto gap-2">
                  Track Your Shipment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ship with confidence using our simple three-step process
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-4xl mx-auto">
            {/* Step 1 */}
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Package className="h-8 w-8" />
              </div>
              <div className="absolute top-8 left-[60%] hidden h-0.5 w-full bg-border md:block" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">1. Book</h3>
              <p className="text-sm text-muted-foreground">
                Schedule a pickup or drop off your package at any of our locations
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Truck className="h-8 w-8" />
              </div>
              <div className="absolute top-8 left-[60%] hidden h-0.5 w-full bg-border md:block" />
              <h3 className="mb-2 text-xl font-semibold text-foreground">2. Track</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your shipment in real-time with our advanced tracking system
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="mb-2 text-xl font-semibold text-foreground">3. Receive</h3>
              <p className="text-sm text-muted-foreground">
                Get your package delivered safely to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose LogiTrack?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to excellence in every shipment
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Global Reach</h3>
                <p className="text-sm text-muted-foreground">
                  Delivering to over 200 countries with a network of trusted partners worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">Secure Shipping</h3>
                <p className="text-sm text-muted-foreground">
                  Your packages are insured and handled with the utmost care at every step.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">On-Time Delivery</h3>
                <p className="text-sm text-muted-foreground">
                  98.5% on-time delivery rate with real-time updates throughout the journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Ship?</h2>
          <p className="mb-8 text-primary-foreground/80 max-w-xl mx-auto">
            Join thousands of businesses that trust LogiTrack for their logistics needs.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Get a Quote
              </Button>
            </Link>
            <Link to="/tracking">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                Track Shipment
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
