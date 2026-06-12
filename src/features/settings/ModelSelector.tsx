import type { AIProviderId } from '@/types/settings';
import { MODEL_OPTIONS } from '@/types/settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ModelSelectorProps {
  provider: AIProviderId;
  value: string;
  onChange: (model: string) => void;
}

export function ModelSelector({ provider, value, onChange }: ModelSelectorProps) {
  const options = MODEL_OPTIONS[provider];

  return (
    <div className="space-y-2">
      <Label htmlFor="ai-model">Model</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger id="ai-model">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.id} value={option.id}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
