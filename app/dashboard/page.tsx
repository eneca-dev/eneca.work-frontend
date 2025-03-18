"use client"

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>You are logged in as {user?.email}</CardDescription>
          </CardHeader>
          <CardContent>
            <p>This is your protected dashboard page.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" onClick={logout}>Sign Out</Button>
          </CardFooter>
        </Card>
        
        {/* Additional dashboard cards would go here */}
      </div>
    </div>
  );
}

