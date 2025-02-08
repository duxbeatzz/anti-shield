import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ProfileForm from "@/components/profile-form";
import type { BrowserProfile, InsertBrowserProfile } from "@shared/schema";

export default function EditProfile({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { data: profile, isLoading } = useQuery<BrowserProfile>({
    queryKey: [`/api/profiles/${params.id}`],
  });

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertBrowserProfile) => {
      await apiRequest("PATCH", `/api/profiles/${params.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Browser profile has been updated successfully",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Edit Profile</h1>
      <ProfileForm 
        onSubmit={mutate} 
        isSubmitting={isPending} 
        defaultValues={profile}
      />
    </div>
  );
}
