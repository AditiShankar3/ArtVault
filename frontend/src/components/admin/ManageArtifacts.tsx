// src/components/admin/ManageArtifacts.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Trash2, Edit, PlusCircle } from "lucide-react";

// --- Types ---
interface Artifact {
  artifact_id: number;
  name: string;
  origin: string;
  era: string;
  museum_id: number;
}
interface Museum {
  museum_id: number;
  name: string;
}
interface Artist {
  artist_id: number;
  name: string;
}
interface Archeologist {
  archeologist_id: number;
  name: string;
}
// --- End Types ---

// --- Sub-component: Add Artifact Form ---
const AddArtifactForm: React.FC<{ museums: Museum[], artists: Artist[], archeologists: Archeologist[], onArtifactAdded: () => void }> = 
  ({ museums, artists, archeologists, onArtifactAdded }) => {
  
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [artifact_id, setArtifactId] = useState('');
  const [name, setName] = useState('');
  const [origin, setOrigin] = useState('');
  const [era, setEra] = useState('');
  const [museum_id, setMuseumId] = useState('');
  const [artifact_type, setArtifactType] = useState('');
  
  // Sub-type state
  const [medium, setMedium] = useState('');
  const [style, setStyle] = useState('');
  const [artist_id, setArtistId] = useState('');
  const [material, setMaterial] = useState('');
  const [ht, setHt] = useState('');
  const [wt, setWt] = useState('');
  const [language, setLanguage] = useState('');
  const [script_type, setScriptType] = useState('');
  const [archeologist_id, setArcheologistId] = useState('');
  const [weapon_type, setWeaponType] = useState('');
  
  // This renders the correct fields based on artifact type
  const renderTypeFields = () => {
    switch(artifact_type) {
      case 'Painting':
        return (
          <>
            <div className="space-y-2">
              <Label htmlFor="medium">Medium</Label>
              <Input id="medium" value={medium} onChange={(e) => setMedium(e.target.value)} placeholder="e.g., Oil on Canvas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="style">Style</Label>
              <Input id="style" value={style} onChange={(e) => setStyle(e.target.value)} placeholder="e.g., Realism" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="artist_id">Artist</Label>
              <Select onValueChange={setArtistId} value={artist_id}>
                <SelectTrigger><SelectValue placeholder="Select Artist" /></SelectTrigger>
                <SelectContent>
                  {artists.map(a => <SelectItem key={a.artist_id} value={String(a.artist_id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'Sculpture':
        return (
           <>
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Bronze" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ht">Height (cm)</Label>
              <Input id="ht" type="number" value={ht} onChange={(e) => setHt(e.target.value)} placeholder="e.g., 10.5" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="wt">Weight (kg)</Label>
              <Input id="wt" type="number" value={wt} onChange={(e) => setWt(e.target.value)} placeholder="e.g., 0.5" />
            </div>
             <div className="space-y-2">
              <Label htmlFor="artist_id">Artist</Label>
              <Select onValueChange={setArtistId} value={artist_id}>
                <SelectTrigger><SelectValue placeholder="Select Artist (if known)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="null">Unknown</SelectItem>
                  {artists.map(a => <SelectItem key={a.artist_id} value={String(a.artist_id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'Scripture':
         return (
          <>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Input id="language" value={language} onChange={(e) => setLanguage(e.target.value)} placeholder="e.g., Sanskrit" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="script_type">Script Type</Label>
              <Input id="script_type" value={script_type} onChange={(e) => setScriptType(e.target.value)} placeholder="e.g., Grantha Script" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archeologist_id">Archeologist</Label>
              <Select onValueChange={setArcheologistId} value={archeologist_id}>
                <SelectTrigger><SelectValue placeholder="Select Archeologist" /></SelectTrigger>
                <SelectContent>
                  {archeologists.map(a => <SelectItem key={a.archeologist_id} value={String(a.archeologist_id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      case 'WeaponTool':
         return (
          <>
            <div className="space-y-2">
              <Label htmlFor="material">Material</Label>
              <Input id="material" value={material} onChange={(e) => setMaterial(e.target.value)} placeholder="e.g., Steel" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" value={weapon_type} onChange={(e) => setWeaponType(e.target.value)} placeholder="e.g., Sword/Weapon" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="archeologist_id">Archeologist</Label>
              <Select onValueChange={setArcheologistId} value={archeologist_id}>
                <SelectTrigger><SelectValue placeholder="Select Archeologist" /></SelectTrigger>
                <SelectContent>
                  {archeologists.map(a => <SelectItem key={a.archeologist_id} value={String(a.archeologist_id)}>{a.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </>
        );
      default:
        return null;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    let type_data = {};
    switch(artifact_type) {
      case 'Painting':
        type_data = { medium, style, artist_id: artist_id ? parseInt(artist_id) : null };
        break;
      case 'Sculpture':
        type_data = { material, ht: ht ? parseFloat(ht) : null, wt: wt ? parseFloat(wt) : null, artist_id: artist_id ? parseInt(artist_id) : null };
        break;
      case 'Scripture':
        type_data = { language, script_type, archeologist_id: archeologist_id ? parseInt(archeologist_id) : null };
        break;
      case 'WeaponTool':
        type_data = { material, type: weapon_type, archeologist_id: archeologist_id ? parseInt(archeologist_id) : null };
        break;
    }

    const payload = {
      artifact_id: parseInt(artifact_id),
      name,
      origin,
      era,
      museum_id: parseInt(museum_id),
      artifact_type,
      type_data: type_data
    };

    try {
      const response = await fetch('http://localhost:3001/api/artifacts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create artifact');

      toast({ title: "Success!", description: "Artifact created successfully." });
      onArtifactAdded(); // This will close the dialog and refresh the list
    } catch (error) {
      toast({ title: "Error", description: (error as Error).message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>Add New Artifact</DialogTitle>
        <DialogDescription>
          Fill in the details for the new artifact. This will use the `sp_add_artifact_with_type` procedure.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="artifact_id">Artifact ID</Label>
            <Input id="artifact_id" type="number" value={artifact_id} onChange={(e) => setArtifactId(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="origin">Origin</Label>
            <Input id="origin" value={origin} onChange={(e) => setOrigin(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="era">Era</Label>
            <Input id="era" value={era} onChange={(e) => setEra(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="museum_id">Museum</Label>
            <Select onValueChange={setMuseumId} value={museum_id} required>
              <SelectTrigger><SelectValue placeholder="Select Museum" /></SelectTrigger>
              <SelectContent>
                {museums.map(m => <SelectItem key={m.museum_id} value={String(m.museum_id)}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="artifact_type">Artifact Type</Label>
            <Select onValueChange={setArtifactType} value={artifact_type} required>
              <SelectTrigger><SelectValue placeholder="Select Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Painting">Painting</SelectItem>
                <SelectItem value="Sculpture">Sculpture</SelectItem>
                <SelectItem value="Scripture">Scripture</SelectItem>
                <SelectItem value="WeaponTool">Weapon/Tool</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Dynamic fields based on type */}
        {artifact_type && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium text-lg">{artifact_type} Details</h4>
            <div className="grid grid-cols-2 gap-4">
              {renderTypeFields()}
            </div>
          </div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Artifact"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};
// --- End Sub-component ---


// --- Main ManageArtifacts Component ---
export const ManageArtifacts: React.FC = () => {
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [museums, setMuseums] = useState<Museum[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [archeologists, setArcheologists] = useState<Archeologist[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchData = () => {
    setLoading(true);
    const p1 = fetch('http://localhost:3001/api/artifacts').then(res => res.json());
    const p2 = fetch('http://localhost:3001/api/museums').then(res => res.json());
    const p3 = fetch('http://localhost:3001/api/artists').then(res => res.json());
    const p4 = fetch('http://localhost:3001/api/archeologists').then(res => res.json());

    Promise.all([p1, p2, p3, p4])
      .then(([artifactData, museumData, artistData, archeologistData]) => {
        setArtifacts(artifactData);
        setMuseums(museumData);
        setArtists(artistData);
        setArcheologists(archeologistData);
      })
      .catch(err => toast({ title: "Error", description: "Could not load data.", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [toast]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this artifact? This is permanent.')) return;

    try {
      const response = await fetch(`http://localhost:3001/api/artifacts/${id}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      
      toast({ title: "Success", description: "Artifact deleted." });
      fetchData(); // Refresh list
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
          <CardTitle>Manage Artifacts</CardTitle>
          <CardDescription>Add, edit, or delete artifacts from the database.</CardDescription>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button><PlusCircle className="mr-2 h-4 w-4" /> Add Artifact</Button>
          </DialogTrigger>
          <AddArtifactForm 
            museums={museums} 
            artists={artists} 
            archeologists={archeologists} 
            onArtifactAdded={() => {
              setIsModalOpen(false);
              fetchData();
            }} 
          />
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Origin</TableHead>
              <TableHead>Era</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && <TableRow><TableCell colSpan={5} className="text-center">Loading...</TableCell></TableRow>}
            {artifacts.map((item) => (
              <TableRow key={item.artifact_id}>
                <TableCell>{item.artifact_id}</TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell>{item.origin}</TableCell>
                <TableCell>{item.era}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleUpdate(item.artifact_id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(item.artifact_id)}>
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