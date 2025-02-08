import { Link } from "wouter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Monitor, Edit, Trash2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { BrowserProfile } from "@shared/schema";

interface ProfileListProps {
  profiles: BrowserProfile[];
}

export default function ProfileList({ profiles }: ProfileListProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/profiles/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/profiles"] });
      toast({
        title: "Profile deleted",
        description: "Browser profile has been deleted successfully",
      });
    },
  });

  const launchMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/profiles/${id}/launch`);
    },
    onSuccess: () => {
      toast({
        title: "Browser launched",
        description: "Browser instance has been launched successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to launch browser",
        variant: "destructive",
      });
    },
  });

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <Monitor className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-semibold text-gray-900">No profiles</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by creating a new browser profile.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {profiles.map((profile) => (
        <Card key={profile.id} className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{profile.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{profile.userAgent}</p>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => launchMutation.mutate(profile.id)}
              disabled={launchMutation.isPending}
            >
              <Play className="h-4 w-4" />
            </Button>
          </div>

          <div className="mt-4 space-y-2 text-sm text-gray-600">
            <p>Resolution: {profile.screenResolution}</p>
            <p>Platform: {profile.platform}</p>
            <p>Language: {profile.language}</p>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Link href={`/profiles/edit/${profile.id}`}>
              <Button variant="outline" size="icon">
                <Edit className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="outline"
              size="icon"
              onClick={() => deleteMutation.mutate(profile.id)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
