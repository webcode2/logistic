import { Plane, Ship, Truck, ArrowRight, Clock, Shield, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const services = [
  {
    icon: Plane,
    title: 'Air Freight',
    description: 'Fast and reliable air cargo solutions for time-sensitive shipments.',
    features: ['Express delivery within 24-72 hours', 'Temperature-controlled options', 'Door-to-door service', 'Real-time tracking'],
  },
  {
    icon: Ship,
    title: 'Ocean Cargo',
    description: 'Cost-effective sea freight for large-volume shipments worldwide.',
    features: ['Full Container Load (FCL)', 'Less than Container Load (LCL)', 'Port-to-port service', 'Customs clearance support'],
  },
  {
    icon: Truck,
    title: 'Last Mile Delivery',
    description: 'Reliable local delivery to ensure your packages reach their destination.',
    features: ['Same-day delivery available', 'Flexible delivery windows', 'Proof of delivery', 'Returns handling'],
  },
];

const additionalFeatures = [
  { icon: Clock, title: 'Express Services', description: 'Time-critical delivery solutions for urgent shipments.' },
  { icon: Shield, title: 'Cargo Insurance', description: 'Comprehensive coverage options for your valuable goods.' },
  { icon: Globe, title: 'Customs Brokerage', description: 'Expert handling of all customs documentation and clearance.' },
];

const Services = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-foreground text-background py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold mb-4 sm:text-4xl">Our Logistics Services</h1>
          <p className="text-background/70 max-w-2xl mx-auto text-lg">
            Comprehensive shipping solutions tailored to your business needs.
          </p>
        </div>
      </section>

      {/* Main Services */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 lg:grid-cols-3">
            {services.map((service, index) => (
              <Card key={service.title} className="border-0 shadow-xl card-hover overflow-hidden">
                <CardHeader className="pb-4">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl shadow-lg ${index === 1 ? 'bg-primary text-primary-foreground shadow-primary/30' : 'bg-foreground text-background'}`}>
                    <service.icon className="h-7 w-7" />
                  </div>
                  <CardTitle className="text-xl">{service.title}</CardTitle>
                  <CardDescription className="text-base">{service.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {service.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link to="/contact">
                    <Button variant="outline" className="w-full mt-6 border-foreground/20 hover:bg-foreground hover:text-background">
                      Get a Quote <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Additional Services</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
            {additionalFeatures.map((feature) => (
              <Card key={feature.title} className="text-center border-0 shadow-lg card-hover">
                <CardContent className="pt-8 pb-8">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-foreground text-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a Custom Solution?</h2>
          <p className="text-background/70 mb-8 max-w-xl mx-auto">
            Our logistics experts are ready to design a tailored shipping solution for your unique requirements.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button size="lg" className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;
