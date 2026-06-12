import type { AIProviderId } from '@/types/settings';
import { PROVIDER_LABELS } from '@/types/settings';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface ProviderSelectorProps {
  value: AIProviderId;
  onChange: (provider: AIProviderId) => void;
}

const PROVIDERS: AIProviderId[] = ['openai', 'anthropic', 'gemini'];

export function ProviderSelector({ value, onChange }: ProviderSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="ai-provider">AI Provider</Label>
      <Select value={value} onValueChange={(v) => onChange(v as AIProviderId)}>
        <SelectTrigger id="ai-provider">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {PROVIDERS.map((provider) => (
            <SelectItem key={provider} value={provider}>
              {PROVIDER_LABELS[provider]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
