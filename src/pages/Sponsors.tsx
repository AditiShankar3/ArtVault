import { useState } from "react";
import { Building2, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

const Sponsors = () => {
  const [sponsorData, setSponsorData] = useState({
    name: "",
    type: "",
    contact: "",
    email: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Sponsorship Request Submitted!",
      description: "We'll contact you shortly with details.",
    });
    setSponsorData({ name: "", type: "", contact: "", email: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Become a Sponsor</h1>
          <p className="text-muted-foreground">Support our exhibitions and preserve cultural heritage</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Sponsorship Benefits</CardTitle>
              <CardDescription>Join us in preserving history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Brand Visibility</h3>
                    <p className="text-sm text-muted-foreground">Featured placement in our exhibitions and promotional materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Cultural Impact</h3>
                    <p className="text-sm text-muted-foreground">Contribute to education and preservation of cultural heritage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Exclusive Access</h3>
                    <p className="text-sm text-muted-foreground">VIP invitations to exhibition openings and special events</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Register Your Company</CardTitle>
              <CardDescription>Fill in your details to start the sponsorship process</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="company-name">Company Name</Label>
                  <Input
                    id="company-name"
                    value={sponsorData.name}
                    onChange={(e) => setSponsorData({...sponsorData, name: e.target.value})}
                    placeholder="Your organization name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company-type">Organization Type</Label>
                  <Input
                    id="company-type"
                    value={sponsorData.type}
                    onChange={(e) => setSponsorData({...sponsorData, type: e.target.value})}
                    placeholder="e.g., Corporate, Foundation, Private"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact"
                      value={sponsorData.contact}
                      onChange={(e) => setSponsorData({...sponsorData, contact: e.target.value})}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={sponsorData.email}
                      onChange={(e) => setSponsorData({...sponsorData, email: e.target.value})}
                      placeholder="contact@company.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full">Submit Sponsorship Request</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sponsors;
