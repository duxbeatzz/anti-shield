import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { insertBrowserProfileSchema, type InsertBrowserProfile } from "@shared/schema";

interface ProfileFormProps {
  onSubmit: (data: InsertBrowserProfile) => void;
  isSubmitting: boolean;
  defaultValues?: Partial<InsertBrowserProfile>;
}

export default function ProfileForm({ onSubmit, isSubmitting, defaultValues }: ProfileFormProps) {
  const form = useForm<InsertBrowserProfile>({
    resolver: zodResolver(insertBrowserProfileSchema),
    defaultValues: defaultValues || {
      name: "",
      userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      screenResolution: "1920x1080",
      platform: "Win32",
      language: "en-US",
      timezone: "America/New_York",
      webglVendor: "Google Inc. (Intel)",
      webglRenderer: "ANGLE (Intel, Intel(R) UHD Graphics Direct3D11 vs_5_0)",
      hardwareConcurrency: 8,
      deviceMemory: 8,
      proxyEnabled: false
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <Input {...form.register("name")} />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">User Agent</label>
              <Input {...form.register("userAgent")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Screen Resolution</label>
              <Input {...form.register("screenResolution")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Platform</label>
              <Input {...form.register("platform")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <Input {...form.register("language")} />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Timezone</label>
              <Input {...form.register("timezone")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WebGL Vendor</label>
              <Input {...form.register("webglVendor")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">WebGL Renderer</label>
              <Input {...form.register("webglRenderer")} />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Hardware Concurrency</label>
              <Input 
                type="number" 
                {...form.register("hardwareConcurrency", { valueAsNumber: true })} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Device Memory (GB)</label>
              <Input 
                type="number" 
                {...form.register("deviceMemory", { valueAsNumber: true })} 
              />
            </div>
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="flex items-center space-x-2">
            <Switch 
              checked={form.watch("proxyEnabled")} 
              onCheckedChange={(checked) => form.setValue("proxyEnabled", checked)} 
            />
            <span>Enable Proxy</span>
          </label>

          {form.watch("proxyEnabled") && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-medium mb-1">Proxy Host</label>
                <Input {...form.register("proxyHost")} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proxy Port</label>
                <Input 
                  type="number" 
                  {...form.register("proxyPort", { valueAsNumber: true })} 
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proxy Username</label>
                <Input {...form.register("proxyUsername")} />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Proxy Password</label>
                <Input 
                  type="password" 
                  {...form.register("proxyPassword")} 
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
