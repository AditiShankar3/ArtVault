import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

// 1. Interface for the exhibition data (matches our new SQL query)
interface Exhibition {
  exhibition_id: number;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  museum_id: number;
  museum_name: string; // This comes from the JOIN
  description?: string; // Not in DB, but let's keep it optional
}

// 2. Visitor form state
interface VisitorData {
  name: string;
  age: string;
  gender: string;
  city: string;
}

const Exhibitions = () => {
  // --- STATE HOOKS ---
  // For the main page
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // For the dialog form
  const [visitorData, setVisitorData] = useState<VisitorData>({
    name: "",
    age: "",
    gender: "",
    city: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // State to control which dialog is open
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);


  // --- DATA FETCHING ---
  // 3. Fetch exhibitions when component loads
  useEffect(() => {
    fetch('http://localhost:3001/api/exhibitions')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch from backend');
        return res.json();
      })
      .then((data: Exhibition[]) => {
        setExhibitions(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to load exhibitions. Please check backend.");
        setIsLoading(false);
      });
  }, []); // Runs once on mount


  // --- EVENT HANDLERS ---
  // 4. Handle visitor registration
  const handleRegister = async (exhibition_id: number, exhibitionName: string) => {
    setIsSubmitting(true);
    
    const dataToPost = {
      ...visitorData,
      age: parseInt(visitorData.age, 10), // Convert age to a number
      exhibition_id: exhibition_id,
    };

    // Basic form validation
    if (!visitorData.name || !visitorData.age || !visitorData.gender || !visitorData.city) {
      toast({ title: "Error", description: "Please fill out all fields.", variant: "destructive" });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataToPost)
      });

      if (!response.ok) {
        throw new Error('Server failed to register visitor');
      }

      toast({
        title: "Registration Successful!",
        description: `You've been registered for ${exhibitionName}`,
      });
      
      setVisitorData({ name: "", age: "", gender: "", city: "" }); // Clear form
      setOpenDialogId(null); // Close the dialog

    } catch (err) {
      console.error("Registration error:", err);
      toast({
        title: "Registration Failed",
        description: "Could not register visitor. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update visitor form state
  const handleVisitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitorData({
      ...visitorData,
      [e.target.id]: e.target.value
    });
  };


  // --- RENDER LOGIC ---
  // 5. Main content renderer (handles loading/error)
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12 text-destructive">
          <AlertTriangle className="mx-auto h-12 w-12" />
          <p className="mt-4">{error}</p>
        </div>
      );
    }

    if (exhibitions.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No current exhibitions found.</p>
        </div>
      );
    }

    // 6. Map over real data
    return (
      <div className="grid gap-6 md:grid-cols-2">
        {exhibitions.map((exhibition) => (
          <Card key={exhibition.exhibition_id} className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <CardTitle className="font-serif text-2xl">{exhibition.name}</CardTitle>
              <CardDescription className="text-base">{exhibition.theme}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                {exhibition.description || "Join us for this unique exhibition."}
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-accent" />
                  <span>
                    {new Date(exhibition.start_date).toLocaleDateString()} - {new Date(exhibition.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-accent" />
                  {/* Use the new museum_name from our query */}
                  <span>{exhibition.museum_name}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              {/* 7. Updated Dialog controls */}
              <Dialog 
                open={openDialogId === exhibition.exhibition_id} 
                onOpenChange={(isOpen) => {
                  if (isOpen) {
                    setOpenDialogId(exhibition.exhibition_id);
                  } else {
                    setOpenDialogId(null); // Close dialog
                    setVisitorData({ name: "", age: "", gender: "", city: "" }); // Clear form on close
                    setIsSubmitting(false); // Reset submit state
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="w-full">
                    <Users className="mr-2 h-4 w-4" />
                    Register as Visitor
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Register for {exhibition.name}</DialogTitle>
                    <DialogDescription>
                      Fill in your details to register for this exhibition
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={visitorData.name}
                        onChange={handleVisitorChange}
                        placeholder="Your full name"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        type="number"
                        value={visitorData.age}
                        onChange={handleVisitorChange}
                        placeholder="Your age"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="gender">Gender</Label>
                      <Input
                        id="gender"
                        value={visitorData.gender}
                        onChange={handleVisitorChange}
                        placeholder="M/F/Other"
                        disabled={isSubmitting}
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={visitorData.city}
                        onChange={handleVisitorChange}
                        placeholder="Your city"
                        disabled={isSubmitting}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
                      onClick={() => handleRegister(exhibition.exhibition_id, exhibition.name)}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Current Exhibitions</h1>
          <p className="text-muted-foreground">Discover our ongoing and upcoming exhibitions</p>
        </div>

        {renderContent()}

      </div>
    </div>
  );
};

export default Exhibitions;