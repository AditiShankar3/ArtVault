// src/components/admin/QueryReports.tsx
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

// --- Types ---
interface ArtifactReportItem {
  artifact_name: string;
  origin: string;
  era: string;
  museum_name: string;
}
interface BudgetReportItem {
  exhibition_name: string;
  num_sponsors: number;
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
// --- End Types ---

// --- Join Query Component ---
const ArtifactMuseumReport: React.FC = () => {
  const [data, setData] = useState<ArtifactReportItem[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    fetch('http://localhost:3001/api/reports/artifacts-with-museums')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        console.error("Error fetching artifact report:", err);
        toast({ title: "Error", description: "Could not load artifact report.", variant: "destructive" });
      });
  }, [toast]);

  return (
    <Table>
      <TableHeader><TableRow><TableHead>Artifact</TableHead><TableHead>Origin</TableHead><TableHead>Museum</TableHead></TableRow></TableHeader>
      <TableBody>
        {data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No data available.</TableCell></TableRow>}
        {data.map((item, i) => (
          <TableRow key={i}><TableCell>{item.artifact_name}</TableCell><TableCell>{item.origin}</TableCell><TableCell>{item.museum_name}</TableCell></TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// --- Aggregate Query Component ---
const ExhibitionBudgetReport: React.FC = () => {
  const [data, setData] = useState<BudgetReportItem[]>([]);
  const { toast } = useToast();
  useEffect(() => {
    fetch('http://localhost:3001/api/reports/exhibition-budgets')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        console.error("Error fetching budget report:", err);
        toast({ title: "Error", description: "Could not load budget report.", variant: "destructive" });
      });
  }, [toast]);

  return (
    <Table>
      <TableHeader><TableRow><TableHead>Exhibition</TableHead><TableHead># Sponsors</TableHead><TableHead>Total Budget</TableHead></TableRow></TableHeader>
      <TableBody>
        {data.length === 0 && <TableRow><TableCell colSpan={3} className="text-center">No data available.</TableCell></TableRow>}
        {data.map((item, i) => (
          <TableRow key={i}>
            <TableCell>{item.exhibition_name}</TableCell>
            <TableCell>{item.num_sponsors}</TableCell>
            <TableCell>${item.total_budget ? item.total_budget.toLocaleString() : '0.00'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

// --- Nested Query Component ---
const ExhibitionVisitorReport: React.FC = () => {
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
  const [selectedExhibition, setSelectedExhibition] = useState<string>('');
  const [reportData, setReportData] = useState<VisitorReportItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // FIX: Use the /api/exhibitions/all route
    fetch('http://localhost:3001/api/exhibitions/all')
      .then(res => res.json())
      .then(data => setExhibitions(data))
      .catch(err => console.error("Error fetching exhibitions:", err));
  }, []);

  const handleSelect = (exhibitionName: string) => {
    if (!exhibitionName) return;
    setSelectedExhibition(exhibitionName);
    setLoading(true);
    fetch(`http://localhost:3001/api/reports/visitors-for-exhibition?name=${encodeURIComponent(exhibitionName)}`)
      .then(res => res.json())
      .then(data => setReportData(data))
      .catch(err => toast({ title: "Error", description: "Could not load visitor report.", variant: "destructive" }))
      .finally(() => setLoading(false));
  };

  return (
    <div className="space-y-4">
      <Select onValueChange={handleSelect} value={selectedExhibition}>
        <SelectTrigger><SelectValue placeholder="Select an exhibition" /></SelectTrigger>
        <SelectContent>
          {exhibitions.map(ex => (
            <SelectItem key={ex.exhibition_id} value={ex.name}>
              {ex.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {loading ? <p>Loading...</p> : (
        <Table>
          <TableHeader><TableRow><TableHead>Visitor Name</TableHead><TableHead>City</TableHead></TableRow></TableHeader>
          <TableBody>
            {reportData.length > 0 ? reportData.map((item, index) => (
              <TableRow key={index}><TableCell>{item.name}</TableCell><TableCell>{item.city}</TableCell></TableRow>
            )) : (
              <TableRow><TableCell colSpan={2} className="text-center">No visitors found for this selection.</TableCell></TableRow>
            )}
          </TableBody>
        </Table>
      )}
    </div>
  );
};


// --- Main Export ---
export const QueryReports: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Sponsorship by Exhibition (Aggregate)</CardTitle>
          <CardDescription>Total budget and sponsor count per exhibition. (Uses View)</CardDescription>
        </CardHeader>
        <CardContent>
          <ExhibitionBudgetReport />
        </CardContent>
      </Card>
      
      <Card className="col-span-1">
        <CardHeader>
          <CardTitle>Visitors by Exhibition (Nested Query)</CardTitle>
          <CardDescription>Select an exhibition to see registered visitors.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExhibitionVisitorReport />
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Artifacts and Their Museums (Join)</CardTitle>
          {/* ⬇️ THIS WAS THE LINE WITH THE ERROR ⬇️ */}
          <CardDescription>A list of all artifacts, their type, and their home museum. (Uses View)</CardDescription>
        </CardHeader>
        <CardContent>
          <ArtifactMuseumReport />
        </CardContent>
      </Card>
    </div>
  );
};