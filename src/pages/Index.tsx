import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Landmark, Calendar, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

const Index = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/artifacts?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const features = [
    {
      icon: Landmark,
      title: "Extensive Artifact Collection",
      description: "Browse thousands of historical artifacts from various civilizations and eras",
      link: "/artifacts"
    },
    {
      icon: Calendar,
      title: "Current Exhibitions",
      description: "Discover ongoing exhibitions and register as a visitor",
      link: "/exhibitions"
    },
    {
      icon: Building2,
      title: "Museum Network",
      description: "Explore our partner museums across India",
      link: "/museums"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4" style={{ background: "var(--gradient-hero)" }}>
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-serif font-bold text-primary mb-6">
            Museum Archive System
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Discover and explore historical artifacts, exhibitions, and museums from across India. 
            Your gateway to cultural heritage.
          </p>
          
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for artifacts, exhibitions, artists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 py-6 text-lg shadow-elegant"
              />
              <Button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2"
                size="sm"
              >
                Search
              </Button>
            </div>
          </form>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-primary mb-3">Explore Our Collections</h2>
            <p className="text-muted-foreground">Access comprehensive information about artifacts, exhibitions, and cultural heritage</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="hover:shadow-elegant transition-all cursor-pointer group" onClick={() => navigate(feature.link)}>
                  <CardHeader>
                    <div className="mb-4 inline-block p-3 rounded-lg bg-accent/10">
                      <Icon className="h-8 w-8 text-accent" />
                    </div>
                    <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" className="gap-2 group-hover:gap-3 transition-all">
                      Explore <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-secondary/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">5+</div>
              <div className="text-muted-foreground">Partner Museums</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">1000+</div>
              <div className="text-muted-foreground">Artifacts</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">50+</div>
              <div className="text-muted-foreground">Exhibitions</div>
            </div>
            <div>
              <div className="text-4xl font-serif font-bold text-accent mb-2">5000</div>
              <div className="text-muted-foreground">Years of History</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
