import { useState, useEffect } from "react";
import { 
  Building2, 
  MapPin, 
  Calendar as CalendarIcon, 
  Loader2, 
  AlertTriangle 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

// 1. Define the Interface to match your DB
interface Museum {
  museum_id: number;
  name: string;
  city: string;
  state: string;
  type: string;
  established_year: number;
  // 'description' was in your mock data, but not your DB schema.
  // We make it optional (?) so it doesn't break if the DB doesn't send it.
  description?: string; 
}

const Museums = () => {
  // 2. Set up state for data, loading, and errors
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. Fetch data when the component loads
  useEffect(() => {
    // We fetch from the new route you just created
    fetch('http://localhost:3001/api/museums')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data: Museum[]) => {
        setMuseums(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch museums:", err);
        setError("Failed to load museums. Please check the backend.");
        setIsLoading(false);
      });
  }, []); // Empty array means this runs once on mount

  // 4. Helper function to render content based on state
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground mt-4">Loading Museums...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12 bg-destructive/10 border border-destructive/50 rounded-lg">
          <AlertTriangle className="h-12 w-12 text-destructive" />
          <p className="text-destructive mt-4 font-medium">An Error Occurred</p>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {museums.map((museum) => (
          // 5. Update keys and field names to match the interface
          <Card key={museum.museum_id} className="hover:shadow-elegant transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-serif text-xl flex-1">{museum.name}</CardTitle>
                <Badge variant="secondary">{museum.type}</Badge>
              </div>
              {/* Only show description if it exists (it's not in your DB) */}
              {museum.description && 
                <CardDescription>{museum.description}</CardDescription>
              }
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{museum.city}, {museum.state}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <CalendarIcon className="h-4 w-4 text-accent" />
                {/* Use 'established_year' from the DB */}
                <span className="text-muted-foreground">Established {museum.established_year}</span>
              </div>
            </CardContent>
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
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Museum Directory</h1>
          <p className="text-muted-foreground">Explore our network of partnered museums across India</p>
        </div>

        {/* 6. Call the render function */}
        {renderContent()}

      </div>
    </div>
  );
};

export default Museums;