import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import ProfileForm from "@/components/profile-form";
import type { InsertBrowserProfile } from "@shared/schema";

export default function CreateProfile() {
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const { mutate, isPending } = useMutation({
    mutationFn: async (data: InsertBrowserProfile) => {
      await apiRequest("POST", "/api/profiles", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile created",
        description: "Browser profile has been created successfully",
      });
      navigate("/");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="container py-8">
      <h1 className="text-4xl font-bold mb-8">Create Profile</h1>
      <ProfileForm onSubmit={mutate} isSubmitting={isPending} />
    </div>
  );
}
