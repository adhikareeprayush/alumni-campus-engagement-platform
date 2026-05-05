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
import { BRAND } from "@/lib/brand";
import { Loader2, Save } from "lucide-react";
import { appButtonOutline, appInput, appSelect, appTextarea } from "@/lib/app-ui";
import { cn } from "@/lib/utils";

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
  "United States",
  "Canada",
  "United Kingdom",
  "Germany",
  "France",
  "Nepal",
  "India",
  "Australia",
  "Japan",
  "Singapore",
  "South Korea",
  "UAE",
  "Qatar",
  "Malaysia",
  "New Zealand",
  "Netherlands",
  "Sweden",
  "Denmark",
  "Finland",
  "Norway",
  "Switzerland",
  "China",
  "Bangladesh",
  "Sri Lanka",
  "Pakistan",
  "Other",
];

export function BasicInfoForm({ profile }: BasicInfoFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isEmployed, setIsEmployed] = useState(profile.isEmployed);
  const [country, setCountry] = useState(profile.country || BRAND.homeCountry);
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
        <Label className="text-sm font-medium text-zinc-400">Employment Status</Label>
        <div className="mt-2 grid max-w-xs grid-cols-2 gap-2 rounded-lg border border-zinc-600/50 bg-zinc-900/40 p-1">
          <button
            type="button"
            onClick={() => setIsEmployed(true)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              isEmployed
                ? "bg-teal-600 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
            }`}
          >
            Employed
          </button>
          <button
            type="button"
            onClick={() => setIsEmployed(false)}
            className={`rounded-md py-2 text-sm font-medium transition-colors ${
              !isEmployed
                ? "bg-zinc-700 text-white shadow-sm"
                : "text-zinc-400 hover:bg-zinc-800/80 hover:text-zinc-200"
            }`}
          >
            Not Employed
          </button>
        </div>
      </div>

      {/* Current position */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currentJobTitle" className="text-zinc-400">
            Current Job Title
          </Label>
          <Input
            id="currentJobTitle"
            name="currentJobTitle"
            defaultValue={profile.currentJobTitle ?? ""}
            placeholder="e.g. Software Engineer"
            disabled={isPending}
            className={appInput}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currentCompany" className="text-zinc-400">
            Current Company
          </Label>
          <Input
            id="currentCompany"
            name="currentCompany"
            defaultValue={profile.currentCompany ?? ""}
            placeholder="e.g. Arcvolt Labs"
            disabled={isPending}
            className={appInput}
          />
        </div>
      </div>

      {/* Location */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* District / City */}
        <div className="space-y-2">
          <Label htmlFor="district" className="text-zinc-400">
            {isNepal ? "District" : "City"}
          </Label>
          <Input
            id="district"
            name="district"
            defaultValue={profile.district ?? ""}
            placeholder={isNepal ? "e.g. Dharan" : "e.g. London"}
            disabled={isPending}
            className={appInput}
          />
        </div>

        {/* Province (Nepal) OR State/Region (other countries) */}
        <div className="space-y-2">
          <Label className="text-zinc-400">{isNepal ? "Province" : "State / Region"}</Label>
          {isNepal ? (
            <Select value={province} onValueChange={setProvince} disabled={isPending}>
              <SelectTrigger className={appSelect}>
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
              className={appInput}
            />
          )}
        </div>

        {/* Country */}
        <div className="space-y-2">
          <Label className="text-zinc-400">Country</Label>
          <Select value={country} onValueChange={handleCountryChange} disabled={isPending}>
            <SelectTrigger className={appSelect}>
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
        <Label htmlFor="currentLocation" className="text-zinc-400">
          Location (short, for display)
        </Label>
        <Input
          id="currentLocation"
          name="currentLocation"
          defaultValue={profile.currentLocation ?? ""}
          placeholder="e.g. Austin, TX · United States"
          disabled={isPending}
          className={appInput}
        />
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <Label htmlFor="bio" className="text-zinc-400">
          Bio
        </Label>
        <Textarea
          id="bio"
          name="bio"
          defaultValue={profile.bio ?? ""}
          placeholder="A short paragraph about yourself..."
          rows={4}
          disabled={isPending}
          className={cn(appTextarea, "min-h-[100px]")}
        />
        <p className="text-xs text-zinc-500">Max 1000 characters.</p>
      </div>

      {/* Social links */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-zinc-400">Social Links</Label>
        <div className="space-y-2">
          <Input
            name="linkedinUrl"
            defaultValue={profile.linkedinUrl ?? ""}
            placeholder="https://linkedin.com/in/yourprofile"
            disabled={isPending}
            className={appInput}
          />
          <Input
            name="githubUrl"
            defaultValue={profile.githubUrl ?? ""}
            placeholder="https://github.com/yourusername"
            disabled={isPending}
            className={appInput}
          />
          <Input
            name="portfolioUrl"
            defaultValue={profile.portfolioUrl ?? ""}
            placeholder="https://yourportfolio.com"
            disabled={isPending}
            className={appInput}
          />
        </div>
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="bg-teal-600 hover:bg-teal-500" disabled={isPending}>
          {isPending ? (
            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="mr-2 h-4 w-4" /> Save Changes</>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className={appButtonOutline}
          onClick={() => router.push("/profile")}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
