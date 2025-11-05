import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Trash2, Edit } from "lucide-react";

interface Artifact {
  artifact_id: number;
  name: string;
  origin: string;
  era: string;
}

export const AdminCRUD: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchArtifacts = () => {
    setLoading(true);
    fetch('http://localhost:3001/api/artifacts')
      .then(res => res.json())
      .then(data => setArtifacts(data))
      .catch(err => {
        console.error("Error fetching artifacts:", err);
        toast({ title: "Error", description: "Could not load artifacts.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchArtifacts();
  }, [toast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this artifact? This is permanent.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${id}`, {
        method: 'DELETE',
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete artifact');
      }

      toast({
        title: "Success",
        description: "Artifact deleted successfully.",
      });
      fetchArtifacts(); // Refresh the list
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: (error as Error).message,
        variant: "destructive",
      });
    }
  };
  
  // You would build a separate form/modal for handling updates
  const handleUpdate = (id: number) => {
    toast({
        title: "Not Implemented",
        description: "Update functionality is not yet built.",
      });
  }

  if (loading) return <p>Loading artifacts...</p>;

  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Manage Artifacts (CRUD)</CardTitle>
        <CardDescription>Here you can view, update, and delete artifacts from the database.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Era</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {artifacts.map(item => (
              <TableRow key={item.artifact_id}>
                <TableCell>{item.artifact_id}</TableCell>
                <TableCell>{item.name}</TableCell>
                <TableCell>{item.era}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleUpdate(item.artifact_id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(item.artifact_id)}>
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