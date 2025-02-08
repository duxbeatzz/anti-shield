import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProfileList from "@/components/profile-list";
import type { BrowserProfile } from "@shared/schema";

export default function Dashboard() {
  const { data: profiles, isLoading } = useQuery<BrowserProfile[]>({ 
    queryKey: ["/api/profiles"]
  });

  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Browser Profiles</h1>
        <Link href="/profiles/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Profile
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      ) : (
        <ProfileList profiles={profiles || []} />
      )}
    </div>
  );
}
