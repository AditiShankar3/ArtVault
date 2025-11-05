import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";

// --- Types for our data ---
interface ArtifactReportItem {
  artifact_id: number;
  artifact_name: string;
  origin: string;
  era: string;
  museum_name: string;
}

interface BudgetReportItem {
  name: string;
  number_of_sponsors: number;
  total_budget: number | null;
}

interface Exhibition {
  exhibition_id: number;
  name: string;
}

interface VisitorReportItem {
  name: string;
  city: string;
}

// --- Report Components ---

const ArtifactMuseumReport: React.FC = () => {
  const [data, setData] = useState<ArtifactReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('http://localhost:3001/api/reports/artifacts-with-museums')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => {
        console.error("Error fetching artifact report:", err);
        toast({ title: "Error", description: "Could not load artifact report.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <p>Loading report...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Artifact Name</TableHead>
          <TableHead>Origin</TableHead>
          <TableHead>Era</TableHead>
          <TableHead>Museum</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map(item => (
          <TableRow key={item.artifact_id}>
            <TableCell>{item.artifact_name}</TableCell>
            <TableCell>{item.origin}</TableCell>
            <TableCell>{item.era}</TableCell>
            <TableCell>{item.museum_name}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ExhibitionBudgetReport: React.FC = () => {
  const [data, setData] = useState<BudgetReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetch('http://localhost:3001/api/reports/exhibition-budgets')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => {
        console.error("Error fetching budget report:", err);
        toast({ title: "Error", description: "Could not load budget report.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [toast]);

  if (loading) return <p>Loading report...</p>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Exhibition Name</TableHead>
          <TableHead># of Sponsors</TableHead>
          <TableHead>Total Budget</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item, index) => (
          <TableRow key={index}>
            <TableCell>{item.name}</TableCell>
            <TableCell>{item.number_of_sponsors}</TableCell>
            <TableCell>${item.total_budget ? item.total_budget.toLocaleString() : '0.00'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const ExhibitionVisitorReport: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  const [reportData, setReportData] = useState<VisitorReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetch('http://localhost:3001/api/exhibitions')
      .then(res => res.json())
      .then(data => {
        setExhibitions(data);
        if (data.length > 0) setSelectedExhibition(data[0].name); 
      })
      .catch(err => console.error("Error fetching exhibitions:", err));
  }, []);

  useEffect(() => {
    if (!selectedExhibition) return;
    setLoading(true);
    fetch(`http://localhost:3001/api/reports/visitors-for-exhibition?name=${encodeURIComponent(selectedExhibition)}`)
      .then(res => res.json())
      .then(data => setReportData(data))
      .catch(err => {
        console.error("Error fetching visitor report:", err);
        toast({ title: "Error", description: "Could not load visitor report.", variant: "destructive" });
      })
      .finally(() => setLoading(false));
  }, [selectedExhibition, toast]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="exhibition-select">Select Exhibition:</Label>
        <select 
          id="exhibition-select"
          className="w-full p-2 border rounded-md"
          value={selectedExhibition} 
          onChange={(e) => setSelectedExhibition(e.target.value)}
        >
          {exhibitions.map(ex => (
            <option key={ex.exhibition_id} value={ex.name}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Visitor Name</TableHead>
              <TableHead>City</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reportData.length > 0 ? (
              reportData.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell>{item.city}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="text-center">No visitors found.</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};


// --- Main Component Export ---

export const AdminReports: React.FC = () => {
  return (
    <Card className="shadow-elegant">
      <CardHeader>
        <CardTitle className="font-serif text-2xl">Database Reports</CardTitle>
        <CardDescription>View reports based on specific SQL queries.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="join">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="join">Join Query</TabsTrigger>
            <TabsTrigger value="aggregate">Aggregate Query</TabsTrigger>
            <TabsTrigger value="nested">Nested Query</TabsTrigger>
          </TabsList>
          
          <TabsContent value="join" className="mt-4">
            <h4 className="font-semibold mb-2">Artifacts &amp; Their Museums</h4>
            <ArtifactMuseumReport />
          </TabsContent>
          
          <TabsContent value="aggregate" className="mt-4">
            <h4 className="font-semibold mb-2">Sponsorship by Exhibition</h4>
            <ExhibitionBudgetReport />
          </TabsContent>

          <TabsContent value="nested" className="mt-4">
             <h4 className="font-semibold mb-2">Visitors by Exhibition</h4>
            <ExhibitionVisitorReport />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};