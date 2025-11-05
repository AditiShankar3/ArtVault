import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";

// Helper to get the correct unique ID from an item
const getItemId = (item: any) => {
  if (!item) return null;
  return item.artifact_id || item.exhibition_id || item.museum_id;
};

// --- 1. NEW HELPER FUNCTION ---
// Calculates the next available ID
const getNextId = (items: any[], idKey: string): number => {
  if (items.length === 0) {
    // Return base IDs from your schema if list is empty
    if (idKey === 'artifact_id') return 10001;
    if (idKey === 'exhibition_id') return 501;
    if (idKey === 'museum_id') return 1;
    return 1;
  }
  // Find the highest ID in the current list
  const maxId = Math.max(...items.map(item => Number(item[idKey])));
  return maxId + 1;
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("artifacts");

  useEffect(() => {
    if (sessionStorage.getItem("isAdmin") !== "true") {
      navigate("/admin/login");
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [artifactsRes, exhibitionsRes, museumsRes] = await Promise.all([
        fetch("http://localhost:3001/api/artifacts"),
        fetch("http://localhost:3001/api/exhibitions"),
        fetch("http://localhost:3001/api/museums")
      ]);
      setArtifacts(await artifactsRes.json());
      setExhibitions(await exhibitionsRes.json());
      setMuseums(await museumsRes.json());
    } catch (error) {
      toast({ title: "Error", description: "Failed to fetch data", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("adminToken");
    navigate("/"); // Navigate to homepage
  };

  const handleDelete = async (type: string, id: number) => {
    // ... (no changes to this function)
    if (!window.confirm("Are you sure you want to delete this item? This may fail if other records depend on it.")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/api/${type}/${id}`, {
        method: "DELETE"
      });
      if (response.ok) {
        toast({ title: "Success", description: `${type} deleted successfully` });
        fetchData(); 
      } else {
        const err = await response.json();
        throw new Error(err.error || "Failed to delete");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleSubmit = async (formData: any) => {
    // ... (no changes to this function)
    const isEditing = editingItem != null;
    const id = getItemId(editingItem); 
    const endpoint = isEditing
      ? `http://localhost:3001/api/${currentTab}/${id}`
      : `http://localhost:3001/api/${currentTab}`;
    const method = isEditing ? "PUT" : "POST";
    try {
      const response = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        toast({ title: "Success", description: `${currentTab} saved successfully` });
        setIsDialogOpen(false);
        setEditingItem(null);
        fetchData(); 
      } else {
         const err = await response.json();
         throw new Error(err.error || "Failed to save");
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };
  
  // --- 2. CALCULATE NEXT IDS ---
  const nextArtifactId = getNextId(artifacts, 'artifact_id');
  const nextExhibitionId = getNextId(exhibitions, 'exhibition_id');
  const nextMuseumId = getNextId(museums, 'museum_id');

  // --- 3. PASS nextId PROP ---
  const renderForm = () => {
    const props = {
      item: editingItem,
      onSubmit: handleSubmit,
      onCancel: () => {
        setIsDialogOpen(false);
        setEditingItem(null);
      }
    };
    // Pass the correct nextId to the correct form
    if (currentTab === 'artifacts') return <ArtifactForm {...props} nextId={nextArtifactId} />;
    if (currentTab === 'exhibitions') return <ExhibitionForm {...props} nextId={nextExhibitionId} />;
    if (currentTab === 'museums') return <MuseumForm {...props} nextId={nextMuseumId} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-serif font-bold text-primary">Admin Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={currentTab} onValueChange={(tab) => {
          setCurrentTab(tab);
          setEditingItem(null); 
          setIsDialogOpen(false);
        }}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
            <TabsTrigger value="museums">Museums</TabsTrigger>
          </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              {renderForm()}
            </DialogContent>
          </Dialog>

          <TabsContent value="artifacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Artifacts</CardTitle>
                <Button onClick={() => {
                  setEditingItem(null); 
                  setIsDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Artifact
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  {/* ... (Table content unchanged) ... */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Museum ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artifacts.map((artifact: any) => (
                      <TableRow key={artifact.artifact_id}>
                        <TableCell>{artifact.artifact_id}</TableCell>
                        <TableCell>{artifact.name}</TableCell>
                        <TableCell>{artifact.origin}</TableCell>
                        <TableCell>{artifact.museum_id}</TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingItem(artifact);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete("artifacts", artifact.artifact_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="exhibitions">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Exhibitions</CardTitle>
                <Button onClick={() => {
                  setEditingItem(null);
                  setIsDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exhibition
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  {/* ... (Table content unchanged) ... */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Theme</TableHead>
                      <TableHead>Museum ID</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exhibitions.map((exhibition: any) => (
                      <TableRow key={exhibition.exhibition_id}>
                        <TableCell>{exhibition.exhibition_id}</TableCell>
                        <TableCell>{exhibition.name}</TableCell>
                        <TableCell>{exhibition.theme}</TableCell>
                        <TableCell>{exhibition.museum_id}</TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingItem(exhibition);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete("exhibitions", exhibition.exhibition_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="museums">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Museums</CardTitle>
                <Button onClick={() => {
                  setEditingItem(null);
                  setIsDialogOpen(true);
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Museum
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  {/* ... (Table content unchanged) ... */}
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {museums.map((museum: any) => (
                      <TableRow key={museum.museum_id}>
                        <TableCell>{museum.museum_id}</TableCell>
                        <TableCell>{museum.name}</TableCell>
                        <TableCell>{museum.city}</TableCell>
                        <TableCell>{museum.type}</TableCell>
                        <TableCell className="space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setEditingItem(museum);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => handleDelete("museums", museum.museum_id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// ===================================================================
// === ⬇️ 4. MODIFIED FORM COMPONENTS ⬇️ ===
// ===================================================================

const ArtifactForm = ({ item, onSubmit, onCancel, nextId }: any) => {
  // Use `nextId` if `item` is null (i.e., we are "Adding")
  const [formData, setFormData] = useState(item || {
    artifact_id: nextId || "",
    name: "", 
    origin: "", 
    era: "", 
    museum_id: ""
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Artifact</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Artifact ID</Label>
          <Input 
            value={formData.artifact_id} 
            onChange={(e) => setFormData({...formData, artifact_id: e.target.value})}
            disabled={true} // Always disable ID field
            placeholder="Auto-generated"
          />
        </div>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Origin</Label>
          <Input value={formData.origin} onChange={(e) => setFormData({...formData, origin: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Era</Label>
          <Input value={formData.era} onChange={(e) => setFormData({...formData, era: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Museum ID</Label>
          <Input 
            type="number" 
            value={formData.museum_id} 
            onChange={(e) => setFormData({...formData, museum_id: e.target.value})} 
            placeholder="e.g. 1"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </>
  );
};

const ExhibitionForm = ({ item, onSubmit, onCancel, nextId }: any) => {
  const formatDate = (date: string) => {
    if (!date) return "";
    return new Date(date).toISOString().split('T')[0];
  };
  
  // Use `nextId` if `item` is null
  const [formData, setFormData] = useState(item ? {
    ...item,
    start_date: formatDate(item.start_date),
    end_date: formatDate(item.end_date),
  } : {
    exhibition_id: nextId || "",
    name: "", 
    theme: "", 
    start_date: "", 
    end_date: "", 
    museum_id: ""
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Exhibition</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Exhibition ID</Label>
          <Input 
            value={formData.exhibition_id} 
            onChange={(e) => setFormData({...formData, exhibition_id: e.target.value})}
            disabled={true} // Always disable ID field
            placeholder="Auto-generated"
          />
        </div>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Theme</Label>
          <Input value={formData.theme} onChange={(e) => setFormData({...formData, theme: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Start Date</Label>
          <Input type="date" value={formData.start_date} onChange={(e) => setFormData({...formData, start_date: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>End Date</Label>
          <Input type="date" value={formData.end_date} onChange={(e) => setFormData({...formData, end_date: e.target.value})} />
        </div>
        .
        <div className="grid gap-2">
          <Label>Museum ID</Label>
          <Input 
            type="number" 
            value={formData.museum_id} 
            onChange={(e) => setFormData({...formData, museum_id: e.target.value})}
            placeholder="e.g. 1"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </>
  );
};

const MuseumForm = ({ item, onSubmit, onCancel, nextId }: any) => {
  // Use `nextId` if `item` is null
  const [formData, setFormData] = useState(item || {
    museum_id: nextId || "",
    name: "", 
    city: "", 
    state: "", 
    type: "", 
    established_year: ""
  });

  return (
    <>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Museum</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label>Museum ID</Label>
          <Input 
            value={formData.museum_id} 
            onChange={(e) => setFormData({...formData, museum_id: e.target.value})}
            disabled={true} // Always disable ID field
            placeholder="Auto-generated"
          />
        </div>
        <div className="grid gap-2">
          <Label>Name</Label>
          <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>City</Label>
          <Input value={formData.city} onChange={(e) => setFormData({...formData, city: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>State</Label>
          <Input value={formData.state} onChange={(e) => setFormData({...formData, state: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Type</Label>
          <Input value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} />
        </div>
        <div className="grid gap-2">
          <Label>Established Year</Label>
          <Input 
            type="number" 
            value={formData.established_year} 
            onChange={(e) => setFormData({...formData, established_year: e.target.value})}
            placeholder="e.g. 1999"
          />
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </>
  );
};

export default AdminDashboard;