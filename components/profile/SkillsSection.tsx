"use client";

import { useState, useTransition, useRef } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { addSkill, removeSkill } from "@/lib/actions/profile";
import { Plus, X, Loader2 } from "lucide-react";

interface Props {
  profileId: string;
  skills: { id: string; name: string }[];
}

export function SkillsSection({ profileId: _profileId, skills: initialSkills }: Props) {
  const [skills, setSkills] = useState(initialSkills);
  const [input, setInput] = useState("");
  const [showInput, setShowInput] = useState(false);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleAdd = () => {
    const name = input.trim();
    if (!name) return;
    if (skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      toast.error("Skill already added.");
      return;
    }
    startTransition(async () => {
      const res = await addSkill(name);
      if (res?.error) { toast.error(res.error); return; }
      setSkills((prev) => [...prev, { id: `temp-${Date.now()}`, name }]);
      setInput("");
      toast.success(`"${name}" added.`);
    });
  };

  const handleRemove = (skillId: string, name: string) => {
    startTransition(async () => {
      const res = await removeSkill(skillId);
      if (res?.error) { toast.error(res.error); return; }
      setSkills((prev) => prev.filter((s) => s.id !== skillId));
      toast.success(`"${name}" removed.`);
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") { e.preventDefault(); handleAdd(); }
    if (e.key === "Escape") { setShowInput(false); setInput(""); }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <Badge key={skill.id} variant="secondary" className="gap-1 pr-1 py-1 text-sm">
            {skill.name}
            <button
              type="button"
              onClick={() => handleRemove(skill.id, skill.name)}
              disabled={isPending}
              className="ml-1 rounded-full p-0.5 hover:bg-gray-200 focus:outline-none"
              aria-label={`Remove ${skill.name}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {showInput ? (
          <div className="flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="e.g. React"
              className="h-7 w-32 text-sm"
              autoFocus
              disabled={isPending}
            />
            <Button size="sm" className="h-7 bg-indigo-600 hover:bg-indigo-700 px-2" onClick={handleAdd} disabled={isPending || !input.trim()}>
              {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => { setShowInput(false); setInput(""); }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowInput(true)}>
            <Plus className="mr-1 h-3 w-3" /> Add skill
          </Button>
        )}
      </div>
      <p className="text-xs text-muted-foreground">Press Enter to add. Click × to remove.</p>
    </div>
  );
}
