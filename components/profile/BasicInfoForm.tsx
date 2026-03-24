"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateBasicInfo } from "@/lib/actions/profile";
import { Loader2, Save } from "lucide-react";

interface BasicInfoFormProps {
  profile: {
    currentJobTitle: string | null;
    currentCompany: string | null;
    currentLocation: string | null;
    district: string | null;
    province: string | null;
    country: string;
    bio: string | null;
    linkedinUrl: string | null;
    githubUrl: string | null;
    portfolioUrl: string | null;
    isEmployed: boolean;
  };
}

const NEPAL_PROVINCES = [
  "Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini",
  "Karnali", "Sudurpashchim",
];

const COUNTRIES = [
  "Nepal", "India", "USA", "UK", "Australia", "Canada",
  "Germany", "Japan", "UAE", "Singapore", "South Korea",
  "Qatar", "Malaysia", "New Zealand", "France", "Netherlands",
  "Sweden", "Denmark", "Finland", "Norway", "Switzerland",
  "China", "Bangladesh", "Sri Lanka", "Pakistan", "Other",
];

export function BasicInfoForm({ profile }: BasicInfoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEmployed, setIsEmployed] = useState(profile.isEmployed);
  const [country, setCountry] = useState(profile.country || "Nepal");
  const [province, setProvince] = useState(profile.province || "");

  const isNepal = country === "Nepal";

  const handleCountryChange = (val: string) => {
    setCountry(val);
    // Clear province/state when switching countries so stale Nepal data isn't saved
    setProvince("");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateBasicInfo({
        currentJobTitle: fd.get("currentJobTitle") as string,
        currentCompany: fd.get("currentCompany") as string,
        currentLocation: fd.get("currentLocation") as string,
        district: fd.get("district") as string,
        province,
        country,
        bio: fd.get("bio") as string,
        linkedinUrl: fd.get("linkedinUrl") as string,
        githubUrl: fd.get("githubUrl") as string,
        portfolioUrl: fd.get("portfolioUrl") as string,
        isEmployed,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Profile updated successfully.");
        router.push("/profile");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Employment status */}
      <div>
        <Label className="text-sm font-medium">Employment Status</Label>
        <div className="mt-2 grid grid-cols-2 gap-2 rounded-lg border p-1 max-w-xs">
          <button
            type="button"
            onClick={() => setIsEmployed(true)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              isEmployed ? "bg-emerald-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Employed
          </button>
          <button
            type="button"
            onClick={() => setIsEmployed(false)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              !isEmployed ? "bg-gray-600 text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Not Employed
          </button>
        </div>
      </div>

      {/* Current position */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currentJobTitle">Current Job Title</Label>
          <Input
            id="currentJobTitle"
            name="currentJobTitle"
            defaultValue={profile.currentJobTitle ?? ""}
            placeholder="e.g. Software Engineer"
            disabled={isPending}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentCompany">Current Company</Label>
          <Input
            id="currentCompany"
            name="currentCompany"
            defaultValue={profile.currentCompany ?? ""}
            placeholder="e.g. Leapfrog Technology"
            disabled={isPending}
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* District / City */}
        <div className="space-y-2">
          <Label htmlFor="district">{isNepal ? "District" : "City"}</Label>
          <Input
            id="district"
            name="district"
            defaultValue={profile.district ?? ""}
            placeholder={isNepal ? "e.g. Dharan" : "e.g. London"}
            disabled={isPending}
          />
        </div>

        {/* Province (Nepal) OR State/Region (other countries) */}
        <div className="space-y-2">
          <Label>{isNepal ? "Province" : "State / Region"}</Label>
          {isNepal ? (
            <Select value={province} onValueChange={setProvince} disabled={isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select province…" />
              </SelectTrigger>
              <SelectContent>
                {NEPAL_PROVINCES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              name="province-text"
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. California"
              disabled={isPending}
            />
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label>Country</Label>
          <Select value={country} onValueChange={handleCountryChange} disabled={isPending}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Current location (freeform) */}
      <div className="space-y-2">
        <Label htmlFor="currentLocation">Location (short, for display)</Label>
        <Input
          id="currentLocation"
          name="currentLocation"
          defaultValue={profile.currentLocation ?? ""}
          placeholder="e.g. Kathmandu, Nepal"
          disabled={isPending}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="A short paragraph about yourself..."
          rows={4}
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">Max 1000 characters.</p>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Social Links</Label>
        <div className="space-y-2">
          <Input
            name="linkedinUrl"
            defaultValue={profile.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={isPending}
          />
          <Input
            name="githubUrl"
            defaultValue={profile.githubUrl ?? ""}
            placeholder="https://github.com/yourusername"
            disabled={isPending}
          />
          <Input
            name="portfolioUrl"
            defaultValue={profile.portfolioUrl ?? ""}
            placeholder="https://yourportfolio.com"
            disabled={isPending}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Changes</>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/profile")} disabled={isPending}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
