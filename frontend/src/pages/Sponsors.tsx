import { useState, useEffect } from "react";
import { 
  Building2, 
  Phone, 
  Mail, 
  Loader2, 
  Banknote,
  Calendar
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

interface Exhibition {
  exhibition_id: number;
  name: string;
}

const Sponsors = () => {
  const [sponsorData, setSponsorData] = useState({
    name: "",
    type: "",
    contact: "",
    email: "",
    exhibition_id: "",
    budget: ""
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);

  useEffect(() => {
    const fetchOngoingExhibitions = async () => {
      try {
        // This route exists in your server.js
        const response = await fetch('http://localhost:3001/api/exhibitions/ongoing');
        if (!response.ok) throw new Error("Failed to fetch exhibitions");
        const data = await response.json();
        setExhibitions(data);
      } catch (error) {
        console.error("Error fetching exhibitions:", error);
        toast({
          title: "Error",
          description: "Could not load exhibitions for the dropdown.",
          variant: "destructive"
        });
      }
    };
    fetchOngoingExhibitions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sponsorData.exhibition_id || !sponsorData.budget) {
      toast({
        title: "Missing Information",
        description: "Please select an exhibition and provide a budget.",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);

    const postData = {
      name: sponsorData.name,
      type: sponsorData.type,
      contact_no: sponsorData.contact,
      email: sponsorData.email,
      exhibition_id: parseInt(sponsorData.exhibition_id, 10),
      budget: parseFloat(sponsorData.budget)
    };

    try {
      // This route exists in your server.js
      const response = await fetch('http://localhost:3001/api/sponsorship-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Failed to submit request');
      }

      toast({
        title: "Sponsorship Request Submitted!",
        description: "An admin will review your request. We'll contact you shortly!",
      });
      
      setSponsorData({
        name: "",
        type: "",
        contact: "",
        email: "",
        exhibition_id: "",
        budget: ""
      });

    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: (error as Error).message || "Could not submit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setSponsorData(prevData => ({
      ...prevData,
      [id]: value, 
    }));
  };

  const handleSelectChange = (value: string) => {
    setSponsorData(prevData => ({
      ...prevData,
      exhibition_id: value
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
        _     <div className="flex items-start gap-3">
            .     <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Cultural Impact</h3>
s                  <p className="text-sm text-muted-foreground">Contribute to education and preservation of cultural heritage</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
          _     <Building2 className="h-5 w-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Exclusive Access</h3>
ReadMe                <p className="text-sm text-muted-foreground">VIP invitations to exhibition openings and special events</p>
                  </div>
            _   </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">Register Your Interest</CardTitle>
              <CardDescription>Fill in your details to submit a sponsorship request</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Company Name</Label>
                  <Input id="name" value={sponsorData.name} onChange={handleChange} placeholder="Your organization name" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Organization Type</Label>
                  <Input id="type" value={sponsorData.type} onChange={handleChange} placeholder="e.g., Corporate, Foundation, Private" required disabled={isLoading} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contact">Contact Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="contact" value={sponsorData.contact} onChange={handleChange} placeholder="+91 XXXXX XXXXX" className="pl-10" required disabled={isLoading} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" value={sponsorData.email} onChange={handleChange} placeholder="contact@company.com" className="pl-10" required disabled={isLoading} />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exhibition_id">Exhibition to Sponsor</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translatey-1/2 h-4 w-4 text-muted-foreground" />
                    <Select
                      value={sponsorData.exhibition_id}
                      onValueChange={handleSelectChange}
                      required
                      disabled={isLoading || exhibitions.length === 0}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder={exhibitions.length > 0 ? "Select an exhibition..." : "Loading exhibitions..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {exhibitions.map((ex) => (
                          <SelectItem key={ex.exhibition_id} value={String(ex.exhibition_id)}>
                            {ex.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="budget">Proposed Budget (INR)</Label>
                  <div className="relative">
                    <Banknote className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="budget"
                      type="number"
                      value={sponsorData.budget}
                      onChange={handleChange}
                      placeholder="e.g., 500000"
                      className="pl-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</>
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