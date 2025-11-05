// src/components/admin/ManageExhibitions.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";

// --- Types ---
interface Sponsor {
  sponsor_id: number;
  name: string;
}
interface Exhibition {
  exhibition_id: number;
  name: string;
  theme: string;
  start_date: string;
  end_date: string;
  museum_id: number;
  museum_name: string;
}
interface Museum {
  museum_id: number;
  name: string;
}
// --- End Types ---

// --- Sub-component: Assign Sponsor Form ---
const AssignSponsorForm: React.FC<{ exhibition: Exhibition; refreshExhibitions: () => void }> = ({ exhibition, refreshExhibitions }) => {
  const { toast } = useToast();
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [selectedSponsor, setSelectedSponsor] = useState<string>('');
  const [budget, setBudget] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch sponsors when the dialog is opened
  useEffect(() => {
    if (isOpen) {
      // FIX: Use the /api/sponsors/all route to get all sponsors for the dropdown
      fetch('http://localhost:3001/api/sponsors/all')
        .then(res => res.json())
        .then(data => setSponsors(data))
        .catch(err => console.error("Error fetching sponsors:", err));
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/exhibition_sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sponsor_id: parseInt(selectedSponsor),
          exhibition_id: exhibition.exhibition_id,
          budget: parseFloat(budget),
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to assign sponsor');

      toast({ title: "Success!", description: "Sponsor has been assigned." });
      setSelectedSponsor('');
      setBudget('');
      setIsOpen(false); // Close the dialog on success
      refreshExhibitions(); // Refresh the main list
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">Assign Sponsor</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign Sponsor to: {exhibition.name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sponsor-select">Sponsor</Label>
            <Select onValueChange={setSelectedSponsor} value={selectedSponsor}>
              <SelectTrigger><SelectValue placeholder="Select a sponsor" /></SelectTrigger>
              <SelectContent>
                {sponsors.map(sponsor => (
                  <SelectItem key={sponsor.sponsor_id} value={String(sponsor.sponsor_id)}>
                    {sponsor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="budget-input">Sponsorship Budget</Label>
            <Input id="budget-input" type="number" min="0" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Enter budget" required />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Assign Sponsor"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
// --- End Sub-component ---


// --- Main ManageExhibitions Component ---
export const ManageExhibitions: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchExhibitions = () => {
    setLoading(true);
    // FIX: Use the /api/exhibitions/all route to get all exhibitions (past, present, future)
    fetch('http://localhost:3001/api/exhibitions/all')
      .then(res => res.json())
      .then(data => setExhibitions(data))
      .catch(err => toast({ title: "Error", description: "Could not load exhibitions.", variant: "destructive" }))
      .finally(() => setLoading(false));
  };
  
  useEffect(() => {
    fetchExhibitions();
    // Fetch museums for the 'Add/Edit' forms
    fetch('http://localhost:3001/api/museums')
      .then(res => res.json())
      .then(data => setMuseums(data))
      .catch(err => console.error("Error fetching museums:", err));
  }, [toast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this exhibition? This will also remove associated sponsors, artifacts, and visitor records.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/exhibitions/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      toast({ title: "Success", description: "Exhibition deleted." });
      fetchExhibitions(); // Refresh list
    } catch (error) {
      toast({ 
        title: "Error Deleting Exhibition", 
        // This will show your custom trigger message!
        description: (error as Error).message, 
        variant: "destructive" 
      });
    }
  };

  // This is a placeholder. You would build a full modal form for this.
  const handleCreate = () => {
    toast({ title: "Not Implemented", description: "Create form not built yet." });
  };
  
  // This is a placeholder. You would build a full modal form for this.
  const handleUpdate = (id: number) => {
     toast({ title: "Not Implemented", description: "Update form not built yet." });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Exhibitions</CardTitle>
          <CardDescription>Add, edit, delete, and assign sponsors to exhibitions.</CardDescription>
        </div>
        <Button onClick={handleCreate}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add Exhibition
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Museum</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
            {exhibitions.map((ex) => (
              <TableRow key={ex.exhibition_id}>
                <TableCell className="font-medium">{ex.name}</TableCell>
                <TableCell>{ex.museum_name}</TableCell>
                <TableCell>{new Date(ex.start_date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(ex.end_date).toLocaleDateString()}</TableCell>
                <TableCell className="text-right space-x-2">
                  <AssignSponsorForm exhibition={ex} refreshExhibitions={fetchExhibitions} />
                  <Button variant="outline" size="icon" onClick={() => handleUpdate(ex.exhibition_id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(ex.exhibition_id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};