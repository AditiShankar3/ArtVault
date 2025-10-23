import { Building2, MapPin, Calendar as CalendarIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";

// Mock data from SQL
const mockMuseums = [
  {
    id: 1,
    name: "National Museum, Delhi",
    city: "New Delhi",
    state: "Delhi",
    type: "National",
    established: 1949,
    description: "Premier museum showcasing India's cultural heritage spanning 5000 years"
  },
  {
    id: 2,
    name: "National Gallery of Modern Art",
    city: "New Delhi",
    state: "Delhi",
    type: "Art",
    established: 1954,
    description: "Dedicated to modern and contemporary Indian art"
  },
  {
    id: 3,
    name: "Visvesvaraya Industrial and Technological Museum",
    city: "Bengaluru",
    state: "Karnataka",
    type: "Science & Technology",
    established: 1962,
    description: "Interactive science and technology museum inspiring innovation"
  },
  {
    id: 4,
    name: "Salar Jung Museum",
    city: "Hyderabad",
    state: "Telangana",
    type: "Museum & Art Gallery",
    established: 1951,
    description: "One of the largest museums housing art collections from across the world"
  },
  {
    id: 5,
    name: "Chhatrapati Shivaji Maharaj Vastu Sangrahalaya",
    city: "Mumbai",
    state: "Maharashtra",
    type: "Art & History",
    established: 1922,
    description: "Premier art and history museum showcasing India's rich heritage"
  },
];

const Museums = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Museum Directory</h1>
          <p className="text-muted-foreground">Explore our network of partnered museums across India</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mockMuseums.map((museum) => (
            <Card key={museum.id} className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="font-serif text-xl flex-1">{museum.name}</CardTitle>
                  <Badge variant="secondary">{museum.type}</Badge>
                </div>
                <CardDescription>{museum.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">{museum.city}, {museum.state}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CalendarIcon className="h-4 w-4 text-accent" />
                  <span className="text-muted-foreground">Established {museum.established}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Museums;
