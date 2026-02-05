import { Plane, Ship, Truck, ArrowRight, Clock, Shield, Globe, Landmark, Anchor, Package, CheckCircle, Thermometer, AlertTriangle, Heart, Box, Activity, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

const services = [
  {
    icon: Plane,
    title: 'Air Freight',
    image: '/images/air_freight.png',
    description: 'Fast and reliable air cargo solutions for time-sensitive shipments across continents.',
    features: ['Express delivery within 24-72 hours', 'Temperature-controlled options', 'Door-to-door service', 'Real-time satellite tracking'],
  },
  {
    icon: Ship,
    title: 'Ocean Cargo',
    image: '/images/ocean_cargo.png',
    description: 'Cost-effective sea freight for large-volume shipments through major global ports.',
    features: ['Full Container Load (FCL)', 'Less than Container Load (LCL)', 'Port-to-port service', 'Customs clearance support'],
  },
  {
    icon: Truck,
    title: 'Road Logistics',
    image: '/images/hero_truck.png',
    description: 'Comprehensive trucking network across Europe for reliable land transportation.',
    features: ['Full Truck Load (FTL)', 'Groupage Services (LTL)', 'Scheduled departures', 'Automated routing'],
  },
];

const additionalFeatures = [
  { icon: Clock, title: 'Express Services', description: 'Time-critical delivery solutions for urgent shipments.' },
  { icon: Shield, title: 'Cargo Insurance', description: 'Comprehensive coverage options for your valuable goods.' },
  { icon: Globe, title: 'Customs Brokerage', description: 'Expert handling of all customs documentation and clearance.' },
];

export default function ServicesPage() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="bg-foreground text-background py-24 relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-4xl font-bold mb-6 sm:text-6xl lg:text-7xl">Our Logistics Expertise</h1>
            <p className="text-background/70 max-w-2xl mx-auto text-xl leading-relaxed">
              Rhine Route provides end-to-end supply chain solutions, leveraging a multi-modal network to move your cargo around the globe.
            </p>
          </div>
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-primary rounded-full blur-[120px]" />
          </div>
        </section>

        {/* Main Services */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-3">
              {services.map((service, index) => (
                <Card key={service.title} className="border border-border/60 shadow-2xl card-hover overflow-hidden flex flex-col">
                  <div className="relative h-64 w-full">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                        <service.icon className="h-6 w-6" />
                      </div>
                      <h3 className="text-2xl font-bold text-background">{service.title}</h3>
                    </div>
                  </div>
                  <CardContent className="pt-8 flex-1 flex flex-col">
                    <p className="text-muted-foreground mb-6 text-lg">{service.description}</p>
                    <ul className="space-y-4 mb-8 flex-1">
                      {service.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm font-medium text-foreground">
                          <div className="h-2 w-2 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <Button className="w-full h-12 text-base bg-foreground text-background hover:bg-foreground/90">
                        Request Quote <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Specialized Solutions - Refined Sleek Card Grid */}
        <section className="py-32 bg-muted/30 relative overflow-hidden border-y border-border/50">
          <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Specialized Logistics</span>
              <h2 className="text-4xl lg:text-6xl font-bold text-foreground tracking-tighter leading-tight uppercase">
                Bespoke <br /> <span className="text-primary">Supply Solutions</span>
              </h2>
              <p className="text-lg text-muted-foreground font-sans max-w-2xl mx-auto">
                Complex challenges require technical expertise. Our specialized divisions handle the most demanding cargo requirements with surgical accuracy.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Landmark,
                  title: "Project Cargo",
                  desc: "Integrated heavy-lift transportation for global industrial infrastructure projects.",
                  val: "Unlimited Scale",
                  tag: "Industrial"
                },
                {
                  icon: Thermometer,
                  title: "Cold Chain",
                  desc: "Precise temperature-controlled logistics for pharma and high-value perishables.",
                  val: "-20°C to +25°C",
                  tag: "Pharma"
                },
                {
                  icon: AlertTriangle,
                  title: "Dangerous Goods",
                  desc: "Certified handling and storage for all hazardous materials and chemicals.",
                  val: "IATA Certified",
                  tag: "Chemical"
                },
                {
                  icon: Heart,
                  title: "White Glove",
                  desc: "Concierge-level delivery, installation, and care for high-end luxury assets.",
                  val: "Last-Mile Care",
                  tag: "Premium"
                }
              ].map((special, i) => (
                <div key={i} className="group relative p-8 rounded-[2.5rem] bg-background border border-border/60 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-foreground/[0.03] flex flex-col items-start text-left">
                  <div className="mb-6 relative">
                    {/* Subtle neutral background for icon */}
                    <div className="relative p-5 rounded-2xl bg-muted/50 text-foreground group-hover:bg-foreground group-hover:text-background transition-all duration-500">
                      <special.icon className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground bg-muted px-2 py-1 rounded">
                        {special.tag}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold tracking-tight uppercase text-foreground">{special.title}</h3>
                    <p className="text-muted-foreground text-sm font-sans leading-relaxed">
                      {special.desc}
                    </p>
                  </div>

                  <div className="w-full pt-6 mt-6 border-t border-border/50 flex flex-col gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-foreground">Operational Spec</span>
                    <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{special.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Background Decorative Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </section>

        {/* Additional Features */}
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground">Value Added Services</h2>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              {additionalFeatures.map((feature) => (
                <Card key={feature.title} className="text-center border border-border/60 shadow-lg card-hover bg-background">
                  <CardContent className="pt-10 pb-10">
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <feature.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
