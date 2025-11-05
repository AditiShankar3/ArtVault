// src/components/admin/ManageSponsors.tsx

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";

interface Sponsor {
  sponsor_id: number;
  name: string;
  type: string;
  contact_no: string;
  email: string;
}

// --- Sub-component: Add Sponsor Form ---
const AddSponsorForm: React.FC<{ onSponsorAdded: () => void }> = ({ onSponsorAdded }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "", contact: "", email: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // This POST request matches the /api/sponsors route you already had
      const response = await fetch('http://localhost:3001/api/sponsors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to add sponsor');

      toast({ title: "Success!", description: "Sponsor added." });
      onSponsorAdded(); // This will close the dialog and refresh the list
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Sponsor</DialogTitle>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name</Label>
          <Input id="name" value={formData.name} onChange={handleChange} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Organization Type</Label>
          <Input id="type" value={formData.type} onChange={handleChange} placeholder="e.g., Corporate, Foundation" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact">Contact Number</Label>
          <Input id="contact" value={formData.contact} onChange={handleChange} placeholder="+91 XXXXX XXXXX" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={formData.email} onChange={handleChange} placeholder="contact@company.com" required />
        </div>
        <DialogFooter>
          <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add Sponsor"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
// --- End Sub-component ---


// --- Main ManageSponsors Component ---
export const ManageSponsors: React.FC = () => {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchSponsors = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/sponsors/all') // Using the new '/all' route
      .then(res => res.json())
      .then(data => setSponsors(data))
      .catch(err => toast({ title: "Error", description: "Could not load sponsors.", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSponsors();
  }, [toast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this sponsor? This will also remove their links to any exhibitions.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/sponsors/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      toast({ title: "Success", description: "Sponsor deleted." });
      fetchSponsors(); // Refresh list
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    }
  };
  
  const handleUpdate = (id: number) => {
     toast({ title: "Not Implemented", description: "Update form not built yet." });
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Manage Sponsors</CardTitle>
          <CardDescription>View, edit, or delete sponsor records.</CardDescription>
        </div>
        {/* THIS BLOCK WAS INCORRECT BEFORE */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Sponsor</Button>
          </DialogTrigger>
          <AddSponsorForm 
            onSponsorAdded={() => {
              setIsModalOpen(false);
              fetchSponsors();
            }}
          />
        </Dialog>
        {/* END OF CORRECTED BLOCK */}
      </CardHeader>
      <CardContent>
        {loading ? <p>Loading sponsors...</p> : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sponsors.map((item) => (
                <TableRow key={item.sponsor_id}>
                  <TableCell>{item.sponsor_id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.type}</TableCell>
                  <TableCell>{item.contact_no}</TableCell>
                  <TableCell>{item.email}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="icon" onClick={() => handleUpdate(item.sponsor_id)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => handleDelete(item.sponsor_id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};