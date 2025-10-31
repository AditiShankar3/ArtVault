import { useState, useEffect } from "react";
import { Search, MapPin, Clock, Building2, Loader2, AlertTriangle } from "lucide-react";
// Assuming these imports are correct based on your project structure
import { Input } from "@/components/ui/input"; 
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

// Define an interface for the Artifact data structure
// This should match the columns in your MySQL 'artifacts' table
interface Artifact {
  artifact_id: number; // Changed from 'id'
  name: string;
  origin: string;
  era: string;
  museum_id: number; // Changed from 'museum' (string)

  // --- Fields below are used in your JSX but NOT in the 'artifact' table schema ---
  // I've made them optional (?) to prevent type errors.
  // You will need to update your backend SQL query (e.g., with a JOIN)
  // to fetch and provide these fields if you want to display them.

  type?: string;
  description?: string;
  artist?: string;
  museum?: string; // This would be the *name* of the museum from a JOIN
}

const Artifacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [artifacts, setArtifacts] = useState<Artifact[]>([]); // To store data from the API
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  // This useEffect hook will run when the component mounts
  // and whenever the 'searchTerm' state changes.
  useEffect(() => {
    // We use a timeout to "debounce" the search.
    // This means we wait 500ms after the user stops typing
    // before we actually make the API request.
    // This prevents sending a request on every single keystroke.
    const fetchTimeout = setTimeout(() => {
      setIsLoading(true);
      setError(null);
      
      // Construct the API URL with the search query
      const apiUrl = `http://localhost:3001/api/artifacts?search=${encodeURIComponent(searchTerm)}`;

      fetch(apiUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then((data: Artifact[]) => {
          setArtifacts(data);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch artifacts:", err);
          setError("Failed to load artifacts. Please make sure the backend server is running.");
          setIsLoading(false);
        });
    }, 500); // 500ms delay

    // This is a cleanup function.
    // React will run this function if the component unmounts
    // or before running the effect again (if 'searchTerm' changes).
    // This cancels the pending timeout, so we don't make an old API request.
    return () => clearTimeout(fetchTimeout);

  }, [searchTerm]); // The effect's dependency array

  // Helper function to render the main content
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center py-12">
          <Loader2 className="h-12 w-12 text-primary animate-spin" />
          <p className="text-muted-foreground mt-4">Loading Artifacts...</p>
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

    if (artifacts.length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No artifacts found matching your search.</p>
        </div>
      );
    }

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {artifacts.map((artifact) => (
          <Card key={artifact.artifact_id} className="hover:shadow-elegant transition-shadow cursor-pointer"> {/* Updated key */}
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="font-serif text-xl">{artifact.name}</CardTitle>
                {/* This will only render if 'type' is provided by the backend */}
                {artifact.type && <Badge variant="secondary">{artifact.type}</Badge>}
              </div>
              {/* This will only render if 'description' is provided by the backend */}
              {artifact.description && <CardDescription>{artifact.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{artifact.origin}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-muted-foreground">{artifact.era}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 className="h-4 w-4 text-accent" />
                {/* Updated to show museum *name* if provided by backend, 
                  otherwise falls back to showing the ID.
                */}
                <span className="text-muted-foreground">
                  {artifact.museum || `Museum ID: ${artifact.museum_id}`}
                </span>
              </div>
              {/* This will only render if 'artist' is provided by the backend */}
              {artifact.artist && (
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Artist:</span> {artifact.artist}
                  </p>
                </div>
              )}
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
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Artifact Collection</h1>
          <p className="text-muted-foreground">Explore our extensive catalog of historical artifacts</p>
        </div>

        <div className="mb-8">
          <div className="relative max-w-xl">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search artifacts by name, origin, or era..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Render the content based on loading/error/data state */}
        {renderContent()}

      </div>
    </div>
  );
};

export default Artifacts;

