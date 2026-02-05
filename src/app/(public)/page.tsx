import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Package, Truck, CheckCircle, Globe, Shield, Clock, Zap, Map, Cpu, Bot, Database, Layers, Navigation, Route, Anchor, Activity, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import MainLayout from '@/components/layout/MainLayout';

export default function Home() {
  return (
    <MainLayout>
      <div className="flex flex-col">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-foreground text-background h-[90vh] flex items-center justify-center py-0">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 z-0">
            <Image
              src="/images/hero_truck.png"
              alt="Rhine Route Truck"
              fill
              className="object-cover object-center opacity-50"
              priority
            />
            {/* Deep Left and Bottom Shade Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground/40 to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-transparent to-transparent z-10" />
          </div>

          <div className="container mx-auto px-6 sm:px-10 lg:px-20 relative z-20 flex flex-col items-start justify-center text-left py-20 lg:py-32">
            <div className="flex flex-col gap-12 max-w-4xl">
              <div className="space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-primary/10 text-primary border border-primary/20 w-fit animate-fade-in mb-4">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase font-heading">Global Network Active</span>
                </div>

                <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tighter leading-[1.1] animate-fade-in font-heading uppercase italic">
                  Smart <br />
                  <span className="text-primary not-italic">Logistics</span>
                </h1>

                <p className="text-xl sm:text-2xl lg:text-3xl font-light tracking-[0.25em] uppercase opacity-80 animate-fade-in font-sans">
                  Global Delivery Solutions
                </p>


              </div>

              {/* Spread out features */}
              <div className="flex flex-wrap gap-x-12 gap-y-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
                <div className="flex items-center gap-4 group">
                  <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl">
                    <Globe className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Network</span>
                    <span className="text-base font-bold tracking-tight">Worldwide</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl">
                    <Shield className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Security</span>
                    <span className="text-base font-bold tracking-tight">Guaranteed</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 group">
                  <div className="p-3.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-xl">
                    <Zap className="h-6 w-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black tracking-[0.3em] uppercase opacity-40">Delivery</span>
                    <span className="text-base font-bold tracking-tight">Express</span>
                  </div>
                </div>
              </div>

              <div className="animate-fade-in pt-4" style={{ animationDelay: '0.2s' }}>
                <Link href="/tracking">
                  <Button size="lg" className="h-16 px-12 text-xl gap-4 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_20px_50px_rgba(220,38,38,0.3)] rounded-full transition-all hover:scale-105 active:scale-95">
                    Track Shipment
                    <ArrowRight className="h-6 w-6" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Global Network Highlight Section */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/air_freight.png"
                    alt="Air Freight Takeoff"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 bg-foreground p-6 rounded-2xl shadow-xl hidden md:block border border-background/10">
                  <p className="text-3xl font-bold text-primary">200+</p>
                  <p className="text-sm text-background/60">Global Destinations</p>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">Our Reach</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Seamlessly Connecting <br /> <span className="text-primary">Global Markets</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Our strategic hubs in Frankfurt, Amsterdam, and Zurich serve as the gateway for your business. We combine air, sea, and road freight to ensure your goods move across borders without friction.
                </p>
                <ul className="space-y-4">
                  {[
                    { icon: Map, text: "Strategic European Hub Network" },
                    { icon: Zap, text: "Express Air & Road Freight Options" },
                    { icon: Globe, text: "Full Customs Clearance Support" }
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-4 text-foreground font-medium">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <item.icon className="h-5 w-5" />
                      </div>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Ocean Cargo Section */}
        <section className="py-24 bg-muted/30 relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1 space-y-6">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">Ocean Freight</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Global Scale <br /> <span className="text-primary">Maritime Excellence</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  For large-scale industrial shipping, our ocean freight division offers unparalleled capacity. We manage complex port-to-door cycles with precision, ensuring your heavy cargo moves across continents safely and cost-effectively.
                </p>
                <div className="grid grid-cols-2 gap-6 pt-4">
                  {[
                    { icon: Anchor, title: "Major Port Access", desc: "Global coverage" },
                    { icon: Shield, title: "Cargo Protection", desc: "Full insurance" }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="p-3 rounded-xl bg-primary/10 text-primary">
                        <item.icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="order-1 lg:order-2 relative group">
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/20 transition-all duration-500" />
                <div className="relative h-[400px] lg:h-[500px] rounded-3xl overflow-hidden shadow-2xl">
                  <Image
                    src="/images/ocean_cargo.png"
                    alt="Ocean Cargo Ship Leaving Port"
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global Supply Chain Optimization Section - SVG Visualization */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative group">
                <div className="absolute -inset-4 bg-primary/5 rounded-3xl blur-3xl opacity-50" />
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-muted/30 border border-border/50 flex items-center justify-center p-12">
                  {/* Digital Supply Chain SVG Illustration */}
                  <svg className="w-full h-full" viewBox="0 0 400 300" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Background Nodes */}
                    <circle cx="50" cy="50" r="15" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
                    <circle cx="350" cy="50" r="15" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
                    <circle cx="50" cy="250" r="15" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
                    <circle cx="350" cy="250" r="15" className="fill-primary/10 stroke-primary/20" strokeWidth="1" />
                    <circle cx="200" cy="150" r="25" className="fill-primary/20 stroke-primary/40 animate-pulse" strokeWidth="2" />

                    {/* Connecting Lines */}
                    <path d="M65 50 H335" className="stroke-primary/20" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M65 250 H335" className="stroke-primary/20" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M50 65 V235" className="stroke-primary/20" strokeWidth="2" strokeDasharray="4 4" />
                    <path d="M350 65 V235" className="stroke-primary/20" strokeWidth="2" strokeDasharray="4 4" />

                    {/* Flow Paths to Center */}
                    <path d="M65 65 L175 125" className="stroke-primary" strokeWidth="2" strokeDasharray="8 8">
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M335 65 L225 125" className="stroke-primary" strokeWidth="2" strokeDasharray="8 8">
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M65 235 L175 175" className="stroke-primary" strokeWidth="2" strokeDasharray="8 8">
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
                    </path>
                    <path d="M335 235 L225 175" className="stroke-primary" strokeWidth="2" strokeDasharray="8 8">
                      <animate attributeName="stroke-dashoffset" from="16" to="0" dur="2s" repeatCount="indefinite" />
                    </path>

                    {/* Icons inside nodes */}
                    <g className="text-primary">
                      <path d="M45 45h10v10H45zM345 45h10v10H345zM45 245h10v10H45zM345 245h10v10H345z" fill="currentColor" opacity="0.5" />
                      <circle cx="200" cy="150" r="8" fill="currentColor" />
                    </g>
                  </svg>

                  {/* Floating Metric Card */}
                  <div className="absolute top-8 right-8 bg-background/80 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-border/50 animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase opacity-40">Efficiency</p>
                        <p className="text-sm font-bold">+24%</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <span className="text-primary font-bold tracking-wider uppercase text-sm">Optimization</span>
                <h2 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                  Supply Chain <br /> <span className="text-primary">Intelligence</span>
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  We don't just move boxes; we orchestrate flow. Our optimization engines analyze thousands of variables to find the most efficient route, reducing waste and accelerating your time-to-market.
                </p>
                <div className="pt-4 space-y-4">
                  {[
                    { title: "Dynamic Routing", val: "Real-time adjustments to global disruptions." },
                    { title: "Inventory Placement", val: "AI-driven stock positioning across our hubs." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-center">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <p className="text-foreground font-medium"><span className="text-primary font-bold">{item.title}:</span> {item.val}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technology Driven - Cards & Icons Design */}
        <section className="py-32 bg-muted/50 relative overflow-hidden">
          {/* Subtle Background Pattern */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-20 space-y-4">
              <span className="text-primary font-bold tracking-widest uppercase text-sm">Technology Driven</span>
              <h2 className="text-4xl lg:text-6xl font-black text-foreground tracking-tighter leading-tight uppercase italic">
                Next-Gen <br /> <span className="text-primary not-italic">Logistics Tech</span>
              </h2>
              <p className="text-lg text-muted-foreground font-sans">
                We bridge the gap between physical cargo and digital precision using our proprietary suite of automation tools.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: Bot,
                  title: "AI Sorting",
                  desc: "Neural networks optimizing sort routes with 99.9% precision.",
                  color: "from-blue-500/10 to-blue-500/5",
                  border: "border-blue-500/20"
                },
                {
                  icon: Database,
                  title: "Blockchain",
                  desc: "Immutable ledger tracking for every milestone and hand-off.",
                  color: "from-purple-500/10 to-purple-500/5",
                  border: "border-purple-500/20"
                },
                {
                  icon: Cpu,
                  title: "Robotic Hubs",
                  desc: "Fully automated warehousing operating 24/7 without delays.",
                  color: "from-red-500/10 to-red-500/5",
                  border: "border-red-500/20"
                },
                {
                  icon: Layers,
                  title: "Big Data",
                  desc: "Predictive analytics forecasting global trade disruptions.",
                  color: "from-emerald-500/10 to-emerald-500/5",
                  border: "border-emerald-500/20"
                }
              ].map((tech, i) => (
                <div key={i} className={`group relative p-8 rounded-3xl bg-background border ${tech.border} hover:border-primary/40 transition-all duration-500 hover:-translate-y-2 shadow-xl shadow-foreground/[0.02]`}>
                  <div className={`p-4 rounded-2xl bg-gradient-to-br ${tech.color} w-fit mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <tech.icon className="h-8 w-8 text-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-xl font-bold mb-3 tracking-tight font-heading uppercase">{tech.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed font-sans">
                    {tech.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                Simple Process
              </span>
              <h2 className="text-4xl font-bold text-foreground mb-4">How It Works</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Ship with confidence using our reliable three-step process
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              <div className="relative text-center group">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <Package className="h-10 w-10" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">1. Book</h3>
                <p className="text-muted-foreground text-lg">
                  Schedule a pickup through our portal or drop off at any Rhine Route terminal center.
                </p>
              </div>

              <div className="relative text-center group">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/30 group-hover:scale-110 transition-transform duration-300">
                  <Truck className="h-10 w-10" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">2. Track</h3>
                <p className="text-muted-foreground text-lg">
                  Follow your shipment's journey in real-time with our pixel-perfect tracking system.
                </p>
              </div>

              <div className="text-center group">
                <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-foreground text-background shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h3 className="mb-3 text-2xl font-bold text-foreground">3. Receive</h3>
                <p className="text-muted-foreground text-lg">
                  Enjoy reliable, on-time delivery with electronic proof of delivery (ePOD) at your doorstep.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Last Mile Delivery Section - Rounded Component Design */}
        <section className="py-24 bg-background relative overflow-hidden">
          <div className="container mx-auto px-6 lg:px-20 relative z-10">
            <div className="bg-muted/50 rounded-[4rem] p-12 lg:p-20 border border-border/50 relative overflow-hidden group hover:border-primary/20 transition-all duration-700">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

              <div className="grid lg:grid-cols-2 gap-20 items-center relative z-10">
                <div className="relative order-2 lg:order-1">
                  <div className="relative w-full aspect-square max-w-sm mx-auto">
                    {/* Custom SVG Route Visualization - Inverted for Light Mode */}
                    <div className="w-full h-full relative border-2 border-primary/10 rounded-[3rem] p-10 overflow-hidden bg-background shadow-2xl shadow-foreground/[0.03]">
                      <div className="absolute top-0 left-0 w-full h-full opacity-30">
                        <svg width="100%" height="100%" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M20,180 L60,140 L140,160 L180,20" stroke="currentColor" strokeWidth="2" strokeDasharray="6 6" className="text-primary/40" />
                          <circle cx="20" cy="180" r="3" fill="currentColor" className="text-primary" />
                          <circle cx="60" cy="140" r="3" fill="currentColor" className="text-primary" />
                          <circle cx="140" cy="160" r="3" fill="currentColor" className="text-primary" />
                          <circle cx="180" cy="20" r="3" fill="currentColor" className="text-primary" />
                        </svg>
                      </div>

                      <div className="relative h-full flex flex-col justify-between">
                        <div className="flex justify-between items-start">
                          <div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20">
                            <Package className="h-7 w-7" />
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-black tracking-widest uppercase opacity-40">Status</span>
                            <p className="text-sm font-bold text-foreground">In Transit</p>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                            <div className="h-full w-[80%] bg-primary animate-pulse" />
                          </div>
                          <div className="flex justify-between text-[10px] font-black tracking-widest uppercase opacity-30">
                            <span>Berlin Hub</span>
                            <span>Destination</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="flex-1 p-4 rounded-2xl bg-muted/50 border border-border/50 flex items-center gap-4">
                            <Navigation className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-tight opacity-40">Direct ETA</p>
                              <p className="text-lg font-black italic font-heading text-foreground">12:45 <span className="text-[9px] not-italic opacity-40">PM</span></p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-8 order-1 lg:order-2">
                  <div className="space-y-4">
                    <span className="text-primary font-bold tracking-[0.3em] uppercase text-xs">The Final Mile</span>
                    <h2 className="text-4xl lg:text-6xl font-black leading-[0.9] tracking-tighter uppercase italic text-foreground">
                      Sustainable <br /> <span className="text-primary not-italic">City Delivery</span>
                    </h2>
                  </div>

                  <p className="text-lg text-muted-foreground leading-relaxed font-sans max-w-md">
                    Our electric fleet delivers directly to your doorstep. We combine green energy with strategic urban hubs to ensure the last mile is the cleanest mile.
                  </p>

                  <div className="grid grid-cols-2 gap-10 pt-4">
                    <div className="space-y-1">
                      <p className="text-3xl lg:text-5xl font-black text-primary font-heading italic">ZERO</p>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 text-foreground">Urban Emissions</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-3xl lg:text-5xl font-black text-primary font-heading italic">100%</p>
                      <p className="text-[10px] font-bold tracking-[0.2em] uppercase opacity-40 text-foreground">Electric Fleet</p>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Link href="/services">
                      <Button variant="outline" className="h-12 px-8 border-primary/20 text-foreground hover:bg-primary/5 rounded-full transition-all font-bold">
                        Explore Green Solutions
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-32 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h2 className="text-4xl lg:text-6xl font-bold mb-8">Ready to Optimize Your Logistics?</h2>
            <p className="mb-12 text-primary-foreground/80 max-w-2xl mx-auto text-xl">
              Partner with Rhine Route today and experience the future of global shipping and supply chain management.
            </p>
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-center">
              <Link href="/contact">
                <Button size="lg" className="h-16 px-12 text-xl bg-foreground text-background hover:bg-foreground/90 shadow-2xl">
                  Get a Private Quote
                </Button>
              </Link>
              <Link href="/tracking">
                <Button size="lg" variant="outline" className="h-16 px-12 text-xl border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground hover:text-primary">
                  Track Your Package
                </Button>
              </Link>
            </div>
          </div>

          {/* Decorative Background Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-background rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-background rounded-full blur-[120px]" />
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
