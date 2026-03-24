"use client";

import { useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Props {
  currentImage: string | null;
  name: string;
  userId: string;
}

export function AvatarUpload({ currentImage, name, userId: _userId }: Props) {
  const [preview, setPreview] = useState<string | null>(currentImage);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { update: updateSession } = useSession();

  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    startTransition(async () => {
      const form = new FormData();
      form.append("avatar", file);

      const res = await fetch("/api/upload/avatar", { method: "POST", body: form });
      const data = (await res.json()) as { imageUrl?: string; error?: string };

      if (!res.ok || data.error) {
        toast.error(data.error ?? "Upload failed.");
        setPreview(currentImage);
        return;
      }

      toast.success("Profile photo updated!");
      // Refresh the JWT token so session.user.image updates everywhere (Header, etc.)
      await updateSession();
      router.refresh();
    });
  };

  return (
    <div className="relative shrink-0 group">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
        className="h-16 w-16 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 cursor-pointer"
        title="Change profile photo"
      >
        {preview ? (
          <img
            src={preview}
            alt={name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700">
            {initials}
          </div>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
          {isPending ? (
            <Loader2 className="h-5 w-5 text-white animate-spin" />
          ) : (
            <Camera className="h-5 w-5 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
        disabled={isPending}
      />
    </div>
  );
}
