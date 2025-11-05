import { useState, useEffect } from "react";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Loader2, 
  AlertTriangle,
  Info,
  Clock,
  TrendingUp,
  XCircle // <-- NEW: Added an icon for the closed button
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

// Interface (no change)
interface Exhibition {
  exhibition_id: number;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  museum_id: number;
  museum_name: string; 
  description?: string;
  visitor_count: number;
  duration_days: number;
}

// Visitor form state (no change)
interface VisitorData {
  name: string;
  age: string;
  gender: string;
  city: string;
}

const Exhibitions = () => {
  // State hooks (no change)
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [visitorData, setVisitorData] = useState<VisitorData>({
    name: "",
    age: "",
    gender: "",
    city: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDialogId, setOpenDialogId] = useState<number | null>(null);

  const [selectedExhibition, setSelectedExhibition] = useState<Exhibition | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Helper function (no change)
  const getStatus = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0); // Compare dates only
    return end >= today ? "Ongoing" : "Closed";
  };


  // --- DATA FETCHING (MODIFIED) ---
  useEffect(() => {
    fetch('http://localhost:3001/api/exhibitions')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch from backend');
        return res.json();
      })
      .then((data: Exhibition[]) => {
        
        // --- 1. NEW SORTING LOGIC ---
        const sortedData = data.sort((a, b) => {
          const statusA = getStatus(a.end_date);
          const statusB = getStatus(b.end_date);

          // If statuses are different, Ongoing comes first
          if (statusA === 'Ongoing' && statusB === 'Closed') {
            return -1; // a comes before b
          }
          if (statusA === 'Closed' && statusB === 'Ongoing') {
            return 1; // b comes before a
          }

          // If both are 'Closed', sort by end_date descending (last closed first)
          if (statusA === 'Closed' && statusB === 'Closed') {
            return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
          }

          // If both are 'Ongoing', sort by end_date ascending (ending soonest first)
          return new Date(a.end_date).getTime() - new Date(b.end_date).getTime();
        });
        
        setExhibitions(sortedData); // Set the sorted data
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Fetch error:", err);
        setError("Failed to load exhibitions. Please check backend.");
        setIsLoading(false);
      });
  }, []); // Runs once on mount


  // --- EVENT HANDLERS (no change) ---
  const handleRegister = async (exhibition_id: number, exhibitionName: string) => {
    // ... (rest of your handleRegister logic is unchanged)
    setIsSubmitting(true);
    const dataToPost = { ...visitorData, age: parseInt(visitorData.age, 10), exhibition_id: exhibition_id };
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
      if (!response.ok) throw new Error('Server failed to register visitor');
      toast({
        title: "Registration Successful!",
        description: `You've been registered for ${exhibitionName}`,
      });
      setVisitorData({ name: "", age: "", gender: "", city: "" });
      setOpenDialogId(null);
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

  const handleVisitorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVisitorData({ ...visitorData, [e.target.id]: e.target.value });
  };


  // --- RENDER LOGIC (MODIFIED) ---
  const renderContent = () => {
    if (isLoading) {
      return ( <div className="flex justify-center py-12"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div> );
    }
    if (error) {
      return ( <div className="text-center py-12 text-destructive"><AlertTriangle className="mx-auto h-12 w-12" /><p className="mt-4">{error}</p></div> );
    }
    if (exhibitions.length === 0) {
      return ( <div className="text-center py-12"><p className="text-muted-foreground">No current exhibitions found.</p></div> );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2">
        {exhibitions.map((exhibition) => {
          
          // --- 2. CHECK STATUS FOR BUTTON ---
          const status = getStatus(exhibition.end_date);
          const isClosed = status === 'Closed';

          return (
            <Card key={exhibition.exhibition_id} className={`hover:shadow-elegant transition-shadow ${isClosed ? 'opacity-70' : ''}`}>
              
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="font-serif text-2xl">{exhibition.name}</CardTitle>
                    <CardDescription className="text-base">{exhibition.theme}</CardDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => {
                      setSelectedExhibition(exhibition);
                      setShowDetails(true);
                    }}
                  >
                    <Info className="h-5 w-5 text-accent" />
                  </Button>
                </div>
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
                    <span>{exhibition.museum_name}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {/* Registration Dialog */}
                <Dialog 
                  open={openDialogId === exhibition.exhibition_id} 
                  onOpenChange={(isOpen) => {
                    if (isClosed) return; // Don't open dialog if closed
                    if (isOpen) {
                      setOpenDialogId(exhibition.exhibition_id);
                    } else {
                      setOpenDialogId(null);
                      setVisitorData({ name: "", age: "", gender: "", city: "" });
                      setIsSubmitting(false);
                    }
                  }}
                >
                  <DialogTrigger asChild>
                    {/* --- 2. MODIFIED BUTTON --- */}
                    <Button 
                      className="w-full"
                      disabled={isClosed} // Disable button if closed
                      variant={isClosed ? 'secondary' : 'default'} // Change style when disabled
                    >
                      {isClosed ? (
                        <XCircle className="mr-2 h-4 w-4" />
                      ) : (
                        <Users className="mr-2 h-4 w-4" />
                      )}
                      {isClosed ? 'Exhibition Closed' : 'Register as Visitor'}
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
                      {/* Form inputs (unchanged) */}
                      <div className="grid gap-2"> <Label htmlFor="name">Name</Label> <Input id="name" value={visitorData.name} onChange={handleVisitorChange} placeholder="Your full name" disabled={isSubmitting} /> </div>
                      <div className="grid gap-2"> <Label htmlFor="age">Age</Label> <Input id="age" type="number" value={visitorData.age} onChange={handleVisitorChange} placeholder="Your age" disabled={isSubmitting} /> </div>
                      <div className="grid gap-2"> <Label htmlFor="gender">Gender</Label> <Input id="gender" value={visitorData.gender} onChange={handleVisitorChange} placeholder="M/F/Other" disabled={isSubmitting} /> </div>
                      <div className="grid gap-2"> <Label htmlFor="city">City</Label> <Input id="city" value={visitorData.city} onChange={handleVisitorChange} placeholder="Your city" disabled={isSubmitting} /> </div>
                    </div>
                    <DialogFooter>
                      <Button 
                        onClick={() => handleRegister(exhibition.exhibition_id, exhibition.name)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? ( <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> ) : ( "Complete Registration" )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    );
  };


  // --- Main return (unchanged, but includes the details dialog) ---
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Current Exhibitions</h1>
          <p className="text-muted-foreground">Discover our ongoing and upcoming exhibitions</p>
        </div>

        {renderContent()}

        {/* Exhibition Details Dialog (unchanged) */}
        <Dialog open={showDetails} onOpenChange={setShowDetails}>
          <DialogContent className="max-w-2xl">
            {selectedExhibition && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl font-serif">{selectedExhibition.name}</DialogTitle>
                  <DialogDescription>{selectedExhibition.theme}</DialogDescription>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="bg-secondary/30">
                      <CardContent className="pt-6 text-center">
                        <Users className="h-8 w-8 text-accent mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary"> {selectedExhibition.visitor_count} </div>
                        <div className="text-sm text-muted-foreground">Total Visitors</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary/30">
                      <CardContent className="pt-6 text-center">
                        <Clock className="h-8 w-8 text-accent mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary"> {selectedExhibition.duration_days} days </div>
                        <div className="text-sm text-muted-foreground">Duration</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary/30">
                      <CardContent className="pt-6 text-center">
                        <TrendingUp className="h-8 w-8 text-accent mx-auto mb-2" />
                        <div className={`text-2xl font-bold ${getStatus(selectedExhibition.end_date) === 'Ongoing' ? 'text-green-600' : 'text-red-600'}`}>
                          {getStatus(selectedExhibition.end_date)}
                        </div>
                        <div className="text-sm text-muted-foreground">Status</div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-muted-foreground">
                        {selectedExhibition.description || "A detailed description of this exhibition is not available."}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Exhibition Period</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(selectedExhibition.start_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} - {new Date(selectedExhibition.end_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Location</h4>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{selectedExhibition.museum_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Exhibitions;