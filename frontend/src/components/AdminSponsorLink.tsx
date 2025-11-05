import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

// Define types for the data we'll be fetching
interface Sponsor {
  sponsor_id: number;
  name: string;
}

interface Exhibition {
  exhibition_id: number;
  name: string;
  museum_name: string;
}

export const AdminSponsorLink: React.FC = () => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch data for dropdowns
  useEffect(() => {
    // Fetch all sponsors
    fetch('http://localhost:3001/api/sponsors')
      .then(res => res.json())
      .then(data => setSponsors(data))
      .catch(err => {
        console.error("Error fetching sponsors:", err);
        toast({ title: "Error", description: "Could not load sponsors.", variant: "destructive" });
      });

    // Fetch all exhibitions
    fetch('http://localhost:3001/api/exhibitions')
      .then(res => res.json())
      .then(data => setExhibitions(data))
      .catch(err => {
         console.error("Error fetching exhibitions:", err);
         toast({ title: "Error", description: "Could not load exhibitions.", variant: "destructive" });
      });
  }, [toast]); // Add toast to dependency array

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!selectedSponsor || !selectedExhibition || !budget) {
      toast({
        title: "Missing Information",
        description: "Please select a sponsor, exhibition, and enter a budget.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/exhibition_sponsors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sponsor_id: parseInt(selectedSponsor),
          exhibition_id: parseInt(selectedExhibition),
          budget: parseFloat(budget),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to assign sponsor');
      }

      toast({
        title: "Success!",
        description: "Sponsor has been assigned to the exhibition.",
      });
      
      // Reset the form
      setSelectedSponsor('');
      setSelectedExhibition('');
      setBudget('');

    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); // Stop loading
    }
  };

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Approve Sponsorship</CardTitle>
        <CardDescription>Link a registered sponsor to an exhibition and set their funding amount.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsor-select">Sponsor</Label>
            <select 
              id="sponsor-select" 
              className="w-full p-2 border rounded-md"
              value={selectedSponsor} 
              onChange={(e) => setSelectedSponsor(e.target.value)}
              required
            >
              <option value="" disabled>-- Select a sponsor --</option>
              {sponsors.map(sponsor => (
                <option key={sponsor.sponsor_id} value={sponsor.sponsor_id}>
                  {sponsor.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exhibition-select">Exhibition</Label>
            <select 
              id="exhibition-select" 
              className="w-full p-2 border rounded-md"
              value={selectedExhibition} 
              onChange={(e) => setSelectedExhibition(e.target.value)}
              required
            >
              <option value="" disabled>-- Select an exhibition --</option>
              {exhibitions.map(ex => (
                <option key={ex.exhibition_id} value={ex.exhibition_id}>
                  {ex.name} (at {ex.museum_name})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget-input">Sponsorship Budget</Label>
            <Input
              id="budget-input"
              type="number"
              min="0"
              step="0.01"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Enter budget amount"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Assigning...
              </>
            ) : (
              "Assign Sponsor"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};