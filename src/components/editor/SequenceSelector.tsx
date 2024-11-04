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
  return (
    <div className="flex flex-row gap-2 items-baseline">
      <span className="text-sm font-medium">Sequence:</span>
      <Select
        value={activeSequenceId}
        onValueChange={onSequenceChange}
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
