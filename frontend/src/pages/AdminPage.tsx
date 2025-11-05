// src/pages/AdminPage.tsx
import React from 'react';
import Navigation from '@/components/Navigation'; // Make sure you have this component
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"; // Corrected import
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QueryReports } from '@/components/admin/QueryReports';
import { ManageExhibitions } from '@/components/admin/ManageExhibitions';
import { ManageArtifacts } from '@/components/admin/ManageArtifacts';
import { ManageSponsors } from '@/components/admin/ManageSponsors';
import { Toaster } from "@/components/ui/toaster"; // Import Toaster
import { Sonner } from "@/components/ui/sonner"; // Import Sonner

const AdminPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto p-4 md:p-8">
        <h1 className="text-4xl font-serif font-bold text-primary mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="reports" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="reports">Reports</TabsTrigger>
            <TabsTrigger value="exhibitions">Manage Exhibitions</TabsTrigger>
            <TabsTrigger value="artifacts">Manage Artifacts</TabsTrigger>
            <TabsTrigger value="sponsors">Manage Sponsors</TabsTrigger>
          </TabsList>
          
          <TabsContent value="reports" className="mt-4">
            <QueryReports />
          </TabsContent>
          
          <TabsContent value="exhibitions" className="mt-4">
            <ManageExhibitions />
          </TabsContent>

          <TabsContent value="artifacts" className="mt-4">
            <ManageArtifacts />
          </TabsContent>

          <TabsContent value="sponsors" className="mt-4">
            <ManageSponsors />
          </TabsContent>
        </Tabs>
      </div>
      {/* Make sure Toaster components are rendered */}
      <Toaster />
      <Sonner />
    </div>
  );
};

export default AdminPage;