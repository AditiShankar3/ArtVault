import { useState } from "react";
import { Search, MapPin, Clock, Building2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

// Mock data - will be replaced with MySQL backend
const mockArtifacts = [
  {
    id: 1,
    name: "Ancient Greek Amphora",
    origin: "Athens, Greece",
    era: "Classical Period (450 BCE)",
    museum: "National Archaeological Museum",
    type: "Sculpture",
    artist: "Unknown",
    description: "A beautifully preserved red-figure amphora depicting mythological scenes"
  },
  {
    id: 2,
    name: "Terracotta Warrior Fragment",
    origin: "Xi'an, China",
    era: "Qin Dynasty (210 BCE)",
    museum: "Eastern History Museum",
    type: "Sculpture",
    artist: "Imperial Craftsmen",
    description: "Fragment from the famous Terracotta Army"
  },
];

const Artifacts = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArtifacts = mockArtifacts.filter(artifact =>
    artifact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artifact.era.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredArtifacts.map((artifact) => (
            <Card key={artifact.id} className="hover:shadow-elegant transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="font-serif text-xl">{artifact.name}</CardTitle>
                  <Badge variant="secondary">{artifact.type}</Badge>
                </div>
                <CardDescription>{artifact.description}</CardDescription>
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
                  <span className="text-muted-foreground">{artifact.museum}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-sm">
                    <span className="font-medium">Artist:</span> {artifact.artist}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArtifacts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No artifacts found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Artifacts;
