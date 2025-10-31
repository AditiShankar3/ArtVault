import { useState } from "react";
import { Building2, Phone, Mail, Loader2 } from "lucide-react"; // Added Loader2
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
  // Add a loading state
  const [isLoading, setIsLoading] = useState(false);

  // --- ⬇️ MODIFIED SUBMIT HANDLER ⬇️ ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Start loading

    try {
      const response = await fetch('http://localhost:3001/api/sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sponsorData), // Send the form data
      });

      const result = await response.json();

      if (!response.ok) {
        // Handle server-side errors
        throw new Error(result.error || 'Failed to submit request');
      }

      // Success!
      toast({
        title: "Sponsorship Request Submitted!",
        description: "We'll contact you shortly with details.",
      });
      // Clear the form
      setSponsorData({ name: "", type: "", contact: "", email: "" });

    } catch (error) {
      // Handle fetch errors (e.g., server is down)
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  // --- ⬆️ END OF MODIFICATIONS ⬆️ ---

  // Helper function to update state
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    // Use input 'id' to update the correct state key
    setSponsorData(prevData => ({
      ...prevData,
      [id]: value, 
    }));
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
          {/* Sponsorship Benefits Card (No changes) */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Sponsorship Benefits</CardTitle>
              <CardDescription>Join us in preserving history</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
               {/* ... all your benefit items ... */}
                <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Brand Visibility</h3>
                    <p className="text-sm text-muted-foreground">Featured placement in our exhibitions and promotional materials</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
            .     <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Cultural Impact</h3>
                    <p className="text-sm text-muted-foreground">Contribute to education and preservation of cultural heritage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Exclusive Access</h3>
          _       <p className="text-sm text-muted-foreground">VIP invitations to exhibition openings and special events</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Form Card (Updated) */}
          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Register Your Company</CardTitle>
              <CardDescription>Fill in your details to start the sponsorship process</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input
                    id="name" // ID should match the state key
                    value={sponsorData.name}
                    onChange={handleChange}
                    placeholder="Your organization name"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type</Label>
                  <Input
                    id="type" // ID should match the state key
                    value={sponsorData.type}
                    onChange={handleChange}
                    placeholder="e.g., Corporate, Foundation, Private"
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="contact" // ID should match the state key
                      value={sponsorData.contact}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email" // ID should match the state key
                      type="email"
                      value={sponsorData.email}
                      onChange={handleChange}
                      placeholder="contact@company.com"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Updated Button with loading state */}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Sponsorship Request"
                  )}
                </Button>

              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Sponsors;
