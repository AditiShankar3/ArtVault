// Create this new file: e.g., src/components/SearchResults.tsx

import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import { 
  Loader2, 
  AlertTriangle, 
  MapPin, 
  Clock, 
  Building2, 
  Landmark, 
  Calendar 
} from "lucide-react";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// --- Define data interfaces ---
interface Artifact {
  artifact_id: number;
  name: string;
  origin: string;
  era: string;
}

interface Museum {
  museum_id: number;
  name: string;
  city: string;
  state: string;
  type: string;
}

interface Exhibition {
  exhibition_id: number;
  name: string;
  theme: string;
  museum_name: string;
}

interface SearchResults {
  artifacts: Artifact[];
  museums: Museum[];
  exhibitions: Exhibition[];
}

const SearchResultsPage = () => {
  const location = useLocation();
  const [results, setResults] = useState<SearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the 'q' query parameter from the URL
  const searchQuery = new URLSearchParams(location.search).get("q");

  useEffect(() => {
    if (!searchQuery) {
      setResults({ artifacts: [], museums: [], exhibitions: [] });
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    
    fetch(`http://localhost:3001/api/search?q=${encodeURIComponent(searchQuery)}`)
      .then(res => {
        if (!res.ok) throw new Error('Search request failed');
        return res.json();
      })
      .then((data: SearchResults) => {
        setResults(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Search error:", err);
        setError("Failed to load search results.");
        setIsLoading(false);
      });

  }, [searchQuery]); // Re-run search whenever the 'q' param changes

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

    if (!results || (results.artifacts.length === 0 && results.museums.length === 0 && results.exhibitions.length === 0)) {
      return (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">
            No results found for "{searchQuery}".
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-12">
        {/* --- Artifacts Section --- */}
        {results.artifacts.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4">
              Artifacts ({results.artifacts.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.artifacts.map(item => (
                <Card key={`art-${item.artifact_id}`} className="hover:shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><MapPin className="h-4 w-4 text-accent" /> {item.origin}</div>
                    <div className="flex items-center gap-2 text-sm"><Clock className="h-4 w-4 text-accent" /> {item.era}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* --- Museums Section --- */}
        {results.museums.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4">
              Museums ({results.museums.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.museums.map(item => (
                <Card key={`mus-${item.museum_id}`} className="hover:shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><Building2 className="h-4 w-4 text-accent" /> {item.city}, {item.state}</div>
                    <Badge variant="secondary">{item.type}</Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* --- Exhibitions Section --- */}
        {results.exhibitions.length > 0 && (
          <section>
            <h2 className="text-2xl font-serif font-bold mb-4">
              Exhibitions ({results.exhibitions.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {results.exhibitions.map(item => (
                <Card key={`exh-${item.exhibition_id}`} className="hover:shadow-elegant">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">{item.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2 text-sm"><Calendar className="h-4 w-4 text-accent" /> {item.theme}</div>
                    <div className="flex items-center gap-2 text-sm"><Landmark className="h-4 w-4 text-accent" /> At: {item.museum_name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-serif font-bold text-primary mb-6">
          Search Results for "{searchQuery}"
        </h1>
        {renderContent()}
      </div>
    </div>
  );
};

export default SearchResultsPage;