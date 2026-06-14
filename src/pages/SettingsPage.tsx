import { useEffect, useState } from 'react';
import { CheckCircle2, Eye, EyeOff, Languages, Loader2, Moon, Sun, XCircle, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProviderSelector } from '@/features/settings/ProviderSelector';
import { ModelSelector } from '@/features/settings/ModelSelector';
import { ImportExportPanel } from '@/features/settings/ImportExportPanel';
import { UsageSummaryCard } from '@/features/settings/UsageSummaryCard';
import { useSettingsStore } from '@/stores/settingsStore';
import { useAuthStore } from '@/stores/authStore';
import { getProvider, getSystemProvider } from '@/providers/factory';
import { checkSystemAvailability } from '@/providers/system';
import { cn } from '@/lib/cn';
import type { LearningLanguage, ThemeMode } from '@/types/settings';
import { LEARNING_LANGUAGE_LABELS } from '@/types/settings';

export default function SettingsPage() {
  const provider = useSettingsStore((s) => s.provider);
  const apiKeys = useSettingsStore((s) => s.apiKeys);
  const models = useSettingsStore((s) => s.models);
  const useSystemKey = useSettingsStore((s) => s.useSystemKey);
  const theme = useSettingsStore((s) => s.theme);
  const learningLanguage = useSettingsStore((s) => s.learningLanguage);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const setApiKey = useSettingsStore((s) => s.setApiKey);
  const setModel = useSettingsStore((s) => s.setModel);
  const setUseSystemKey = useSettingsStore((s) => s.setUseSystemKey);
  const setTheme = useSettingsStore((s) => s.setTheme);
  const setLearningLanguage = useSettingsStore((s) => s.setLearningLanguage);

  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [systemAvailable, setSystemAvailable] = useState(false);
  const [systemInfo, setSystemInfo] = useState<{ provider?: string; model?: string }>({});

  const profile = useAuthStore((s) => s.profile);
  const trialExhausted = !!profile && !profile.ai_enabled_by_admin && !profile.ai_enabled;

  useEffect(() => {
    checkSystemAvailability().then((result) => {
      setSystemAvailable(result.available);
      setSystemInfo({ provider: result.defaultProvider, model: result.defaultModel });
    });
  }, []);

  const model = models[provider];
  const usingSystemKey = systemAvailable && useSystemKey[provider] && !trialExhausted;
  const apiKey = apiKeys[provider];

  async function handleTestConnection() {
    setTesting(true);
    setTestResult(null);
    try {
      const result = usingSystemKey
        ? await getSystemProvider().testConnection('', model)
        : await getProvider(provider).testConnection(apiKey, model);
      setTestResult(result);
    } catch (err) {
      setTestResult({ ok: false, message: err instanceof Error ? err.message : 'Unknown error' });
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">Configure your AI provider, model, and appearance.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Provider</CardTitle>
          <CardDescription>
            By default, DailyLearn uses a built-in AI connection — no API key needed. If you provide your own key,
            it's stored locally on this device and sent directly to the provider's API. It is never sent anywhere
            else.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemAvailable && (
            <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="space-y-0.5">
                <Label htmlFor="use-own-key">Use my own API key</Label>
                <p className="text-xs text-muted-foreground">
                  {trialExhausted
                    ? "You've used up your free AI trial. Add your own API key below to continue."
                    : usingSystemKey
                      ? "Currently using DailyLearn's built-in AI access. No setup required."
                      : 'Currently using your own API key, entered below.'}
                </p>
              </div>
              <Switch
                id="use-own-key"
                checked={!usingSystemKey}
                disabled={trialExhausted}
                onCheckedChange={(checked) => {
                  setUseSystemKey(provider, !checked);
                  setTestResult(null);
                }}
              />
            </div>
          )}

          {usingSystemKey ? (
            <p className="text-sm text-muted-foreground">
              Lessons are generated using DailyLearn's built-in AI
              {systemInfo.provider && systemInfo.model ? ` (${systemInfo.provider} · ${systemInfo.model})` : ''}.
            </p>
          ) : (
            <>
              <ProviderSelector value={provider} onChange={setProvider} />
              <ModelSelector provider={provider} value={model} onChange={(m) => setModel(provider, m)} />

              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="relative">
                  <Input
                    id="api-key"
                    type={showKey ? 'text' : 'password'}
                    value={apiKeys[provider]}
                    onChange={(e) => {
                      setApiKey(provider, e.target.value);
                      setTestResult(null);
                    }}
                    placeholder="Enter your API key"
                    className="pr-10"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showKey ? 'Hide API key' : 'Show API key'}
                  >
                    {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button onClick={handleTestConnection} disabled={(!usingSystemKey && !apiKey) || testing} variant="outline">
              {testing && <Loader2 className="h-4 w-4 animate-spin" />}
              Test Connection
            </Button>
            {testResult && (
              <div
                className={cn(
                  'flex items-center gap-2 text-sm',
                  testResult.ok ? 'text-success' : 'text-destructive',
                )}
              >
                {testResult.ok ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                <span className="break-all">{testResult.message}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose how DailyLearn looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={theme} onValueChange={(v) => setTheme(v as ThemeMode)}>
            <TabsList>
              <TabsTrigger value="light">
                <Sun className="h-4 w-4" />
                Light
              </TabsTrigger>
              <TabsTrigger value="dark">
                <Moon className="h-4 w-4" />
                Dark
              </TabsTrigger>
              <TabsTrigger value="system">
                <Monitor className="h-4 w-4" />
                System
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Learning Language
          </CardTitle>
          <CardDescription>
            Choose how AI-generated lessons explain concepts. Technical terms, code, and
            framework names always stay in English.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={learningLanguage} onValueChange={(v) => setLearningLanguage(v as LearningLanguage)}>
            <TabsList>
              {Object.entries(LEARNING_LANGUAGE_LABELS).map(([value, label]) => (
                <TabsTrigger key={value} value={value}>
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </CardContent>
      </Card>

      <UsageSummaryCard />

      <ImportExportPanel />
    </div>
  );
}
