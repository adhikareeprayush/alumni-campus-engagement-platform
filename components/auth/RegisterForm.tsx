"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { registerUser } from "@/lib/actions/auth";
import { GraduationCap, Loader2 } from "lucide-react";

const PROGRAMS = [
  { value: "BCT", label: "BCT — Computer Engineering" },
  { value: "BEX", label: "BEX — Electronics Engineering" },
  { value: "BIT", label: "BIT — Information Technology" },
  { value: "BCE", label: "BCE — Civil Engineering" },
  { value: "BME", label: "BME — Mechanical Engineering" },
  { value: "BEE", label: "BEE — Electrical Engineering" },
  { value: "BAG", label: "BAG — Agriculture Engineering" },
  { value: "BAM", label: "BAM — Architecture" },
  { value: "OTHER", label: "Other" },
];

const currentYear = new Date().getFullYear();
const BATCH_YEARS = Array.from({ length: currentYear - 1989 }, (_, i) => currentYear - i);

export function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [role, setRole] = useState<"ALUMNI" | "STUDENT">("ALUMNI");
  const [program, setProgram] = useState("");
  const [batchYear, setBatchYear] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await registerUser({
        name: formData.get("name") as string,
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        role,
        batchYear: parseInt(batchYear, 10),
        program: program as "BCT" | "BEX" | "BIT" | "BCE" | "BME" | "BEE" | "BAG" | "BAM" | "OTHER",
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/login?registered=true");
      }
    });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4 py-10">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
          <CardDescription>Join the Alumni Portal</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}

            {/* Role toggle */}
            <div className="grid grid-cols-2 gap-2 rounded-lg border p-1">
              <button
                type="button"
                onClick={() => setRole("ALUMNI")}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${
                  role === "ALUMNI"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Alumni
              </button>
              <button
                type="button"
                onClick={() => setRole("STUDENT")}
                className={`rounded-md py-2 text-sm font-medium transition-colors ${
                  role === "STUDENT"
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Current Student
              </button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Ram Bahadur Sharma"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@ioe.edu.np"
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="At least 8 characters"
                required
                minLength={8}
                disabled={isPending}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Program</Label>
                <Select value={program} onValueChange={setProgram} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {PROGRAMS.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Batch Year</Label>
                <Select value={batchYear} onValueChange={setBatchYear} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Year..." />
                  </SelectTrigger>
                  <SelectContent>
                    {BATCH_YEARS.map((y) => (
                      <SelectItem key={y} value={String(y)}>
                        {y}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-3">
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              disabled={isPending || !program || !batchYear}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
