"use client";

import { useState, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Sequence {
  id: string;
  name: string;
  // Add other sequence properties as needed
}

interface SequenceSelectorProps {
  sequences: Sequence[];
  activeSequenceId: string;
  onSequenceChange: (sequenceId: string) => void;
}

export function SequenceSelector({
  sequences,
  activeSequenceId,
  onSequenceChange,
}: SequenceSelectorProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Avoid hydration mismatch by only rendering after mount
  if (!mounted) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-[300px] h-10 rounded-md border border-input bg-background" />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center">
      <Select
        value={activeSequenceId}
        onValueChange={onSequenceChange}
        defaultValue={activeSequenceId}
      >
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a sequence" />
        </SelectTrigger>
        <SelectContent>
          {sequences.map((sequence) => (
            <SelectItem
              key={sequence.id}
              value={sequence.id}
            >
              {sequence.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
