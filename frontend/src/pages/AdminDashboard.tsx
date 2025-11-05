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

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [artifacts, setArtifacts] = useState([]);
  const [exhibitions, setExhibitions] = useState([]);
  const [museums, setMuseums] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState("artifacts");

  useEffect(() => {
    // Check admin authentication
    if (sessionStorage.getItem("isAdmin") !== "true") {
      navigate("/admin/login");
      return;
    }
    
    // Fetch data from MySQL backend
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
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("isAdmin");
    sessionStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleDelete = async (type: string, id: number) => {
    try {
      const response = await fetch(`http://localhost:3001/api/${type}/${id}`, {
        method: "DELETE"
      });

      if (response.ok) {
        toast({ title: "Success", description: `${type} deleted successfully` });
        fetchData();
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  const handleSubmit = async (formData: any) => {
    const endpoint = editingItem 
      ? `http://localhost:3001/api/${currentTab}/${editingItem.id}`
      : `http://localhost:3001/api/${currentTab}`;
    
    const method = editingItem ? "PUT" : "POST";

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
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to save", variant: "destructive" });
    }
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
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="artifacts">Artifacts</TabsTrigger>
            <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
            <TabsTrigger value="museums">Museums</TabsTrigger>
          </TabsList>

          <TabsContent value="artifacts">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Manage Artifacts</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingItem(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Artifact
                    </Button>
                  </DialogTrigger>
                  <ArtifactForm 
                    item={editingItem} 
                    onSubmit={handleSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead>Era</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {artifacts.map((artifact: any) => (
                      <TableRow key={artifact.artifact_id}>
                        <TableCell>{artifact.name}</TableCell>
                        <TableCell>{artifact.origin}</TableCell>
                        <TableCell>{artifact.era}</TableCell>
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingItem(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Exhibition
                    </Button>
                  </DialogTrigger>
                  <ExhibitionForm 
                    item={editingItem} 
                    onSubmit={handleSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Theme</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>End Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {exhibitions.map((exhibition: any) => (
                      <TableRow key={exhibition.exhibition_id}>
                        <TableCell>{exhibition.name}</TableCell>
                        <TableCell>{exhibition.theme}</TableCell>
                        <TableCell>{exhibition.start_date}</TableCell>
                        <TableCell>{exhibition.end_date}</TableCell>
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
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button onClick={() => setEditingItem(null)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Museum
                    </Button>
                  </DialogTrigger>
                  <MuseumForm 
                    item={editingItem} 
                    onSubmit={handleSubmit}
                    onCancel={() => setIsDialogOpen(false)}
                  />
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>State</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {museums.map((museum: any) => (
                      <TableRow key={museum.museum_id}>
                        <TableCell>{museum.name}</TableCell>
                        <TableCell>{museum.city}</TableCell>
                        <TableCell>{museum.state}</TableCell>
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

// Form components
const ArtifactForm = ({ item, onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState(item || {
    name: "", origin: "", era: "", museum_id: ""
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Artifact</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ExhibitionForm = ({ item, onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState(item || {
    name: "", theme: "", start_date: "", end_date: "", museum_id: ""
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Exhibition</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
};

const MuseumForm = ({ item, onSubmit, onCancel }: any) => {
  const [formData, setFormData] = useState(item || {
    name: "", city: "", state: "", type: "", established_year: ""
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{item ? "Edit" : "Add"} Museum</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 py-4">
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
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSubmit(formData)}>Save</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default AdminDashboard;
