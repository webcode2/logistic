import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, CheckCircle, Globe, Shield, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const Home = () => {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-foreground text-background py-24 lg:py-36">
        <div className="container mx-auto px-4 relative z-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 text-primary mb-6 animate-fade-in">
              <Truck className="h-4 w-4" />
              <span className="text-sm font-medium">Trusted by 10,000+ businesses</span>
            </div>
            <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-7xl animate-fade-in">
              Global Logistics{' '}
              <span className="text-primary">Solutions</span>
            </h1>
            <p className="mb-8 text-lg text-background/70 sm:text-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
              Fast, reliable, and secure shipping solutions for businesses worldwide. 
              Track your packages in real-time and enjoy peace of mind.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <Link to="/tracking">
                <Button size="lg" className="w-full sm:w-auto gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                  Track Your Shipment
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-background/30 text-background hover:bg-background hover:text-foreground">
                  Our Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </section>

      {/* How It Works Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Simple Process
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Ship with confidence using our simple three-step process
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Step 1 */}
            <div className="relative text-center group">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-foreground text-background shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Package className="h-10 w-10" />
              </div>
              <div className="absolute top-10 left-[65%] hidden h-0.5 w-[70%] bg-gradient-to-r from-foreground to-transparent md:block" />
              <h3 className="mb-3 text-xl font-bold text-foreground">1. Book</h3>
              <p className="text-muted-foreground">
                Schedule a pickup or drop off your package at any of our locations
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative text-center group">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                <Truck className="h-10 w-10" />
              </div>
              <div className="absolute top-10 left-[65%] hidden h-0.5 w-[70%] bg-gradient-to-r from-primary to-transparent md:block" />
              <h3 className="mb-3 text-xl font-bold text-foreground">2. Track</h3>
              <p className="text-muted-foreground">
                Monitor your shipment in real-time with our advanced tracking system
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center group">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-foreground text-background shadow-xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle className="h-10 w-10" />
              </div>
              <h3 className="mb-3 text-xl font-bold text-foreground">3. Receive</h3>
              <p className="text-muted-foreground">
                Get your package delivered safely to your doorstep
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Why Choose Us
            </span>
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">Why Choose LogiTrack?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're committed to excellence in every shipment
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-0 shadow-xl card-hover bg-card">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                  <Globe className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">Global Reach</h3>
                <p className="text-muted-foreground">
                  Delivering to over 200 countries with a network of trusted partners worldwide.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl card-hover bg-card">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                  <Shield className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">Secure Shipping</h3>
                <p className="text-muted-foreground">
                  Your packages are insured and handled with the utmost care at every step.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl card-hover bg-card">
              <CardContent className="p-8">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-foreground text-background">
                  <Clock className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-bold text-foreground">On-Time Delivery</h3>
                <p className="text-muted-foreground">
                  98.5% on-time delivery rate with real-time updates throughout the journey.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-foreground text-background relative overflow-hidden">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Ship?</h2>
          <p className="mb-10 text-background/70 max-w-xl mx-auto text-lg">
            Join thousands of businesses that trust LogiTrack for their logistics needs.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button size="lg" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/30">
                Get a Quote
              </Button>
            </Link>
            <Link to="/tracking">
              <Button size="lg" variant="outline" className="w-full sm:w-auto border-background/30 text-background hover:bg-background hover:text-foreground">
                Track Shipment
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
      </section>
    </div>
  );
};

export default Home;
