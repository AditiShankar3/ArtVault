import { useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import Navigation from "@/components/Navigation";

// Mock data
const mockExhibitions = [
  {
    id: 1,
    name: "Ancient Civilizations",
    theme: "Greek and Roman Antiquities",
    startDate: "2024-01-15",
    endDate: "2024-06-30",
    museum: "National Archaeological Museum",
    description: "Explore the wonders of ancient Greece and Rome through our curated collection"
  },
  {
    id: 2,
    name: "Eastern Treasures",
    theme: "Asian Art and Culture",
    startDate: "2024-03-01",
    endDate: "2024-08-15",
    museum: "Eastern History Museum",
    description: "Journey through centuries of Asian artistic achievement"
  },
];

const Exhibitions = () => {
  const [visitorData, setVisitorData] = useState({
    name: "",
    age: "",
    gender: "",
    city: ""
  });

  const handleRegister = (exhibitionName: string) => {
    toast({
      title: "Registration Successful!",
      description: `You've been registered for ${exhibitionName}`,
    });
    setVisitorData({ name: "", age: "", gender: "", city: "" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-serif font-bold text-primary mb-2">Current Exhibitions</h1>
          <p className="text-muted-foreground">Discover our ongoing and upcoming exhibitions</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {mockExhibitions.map((exhibition) => (
            <Card key={exhibition.id} className="hover:shadow-elegant transition-shadow">
              <CardHeader>
                <CardTitle className="font-serif text-2xl">{exhibition.name}</CardTitle>
                <CardDescription className="text-base">{exhibition.theme}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{exhibition.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-accent" />
                    <span>{new Date(exhibition.startDate).toLocaleDateString()} - {new Date(exhibition.endDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-accent" />
                    <span>{exhibition.museum}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
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
                          onChange={(e) => setVisitorData({...visitorData, name: e.target.value})}
                          placeholder="Your full name"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={visitorData.age}
                          onChange={(e) => setVisitorData({...visitorData, age: e.target.value})}
                          placeholder="Your age"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="gender">Gender</Label>
                        <Input
                          id="gender"
                          value={visitorData.gender}
                          onChange={(e) => setVisitorData({...visitorData, gender: e.target.value})}
                          placeholder="M/F/Other"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={visitorData.city}
                          onChange={(e) => setVisitorData({...visitorData, city: e.target.value})}
                          placeholder="Your city"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={() => handleRegister(exhibition.name)}>Complete Registration</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Exhibitions;
