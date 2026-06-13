import { useRef, useState } from 'react';
import { Download, Loader2, RotateCcw, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/toast';
import { applyImport, buildExport, downloadExport, isValidExport, resetAllAppData } from '@/features/settings/exportImport';

export function ImportExportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  async function handleExport() {
    try {
      const data = await buildExport();
      downloadExport(data);
      toast({ title: 'Export ready', description: 'dailylearn-export.json has been downloaded.', variant: 'success' });
    } catch {
      toast({ title: 'Export failed', description: 'Could not build export file.', variant: 'error' });
    }
  }

  function handleImportClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!isValidExport(data)) {
        throw new Error('Invalid export file');
      }
      applyImport(data);
      toast({ title: 'Import complete', description: 'Settings, progress, and streaks have been restored.', variant: 'success' });
    } catch {
      toast({ title: 'Import failed', description: 'The selected file is not a valid DailyLearn export.', variant: 'error' });
    } finally {
      event.target.value = '';
    }
  }

  async function handleReset() {
    setResetting(true);
    try {
      await resetAllAppData();
      toast({ title: 'Data reset', description: 'All locally saved data has been cleared.', variant: 'success' });
      setResetOpen(false);
      window.location.reload();
    } catch {
      toast({ title: 'Reset failed', description: 'Could not clear local data.', variant: 'error' });
      setResetting(false);
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Import / Export</CardTitle>
          <CardDescription>Back up your settings, progress, and streaks, or restore them on another device.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" onClick={handleExport} className="flex-1">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" onClick={handleImportClick} className="flex-1">
            <Upload className="h-4 w-4" />
            Import Data
          </Button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleFileChange} />
        </CardContent>
      </Card>

      <Card className="border-destructive/40">
        <CardHeader>
          <CardTitle>Reset App Data</CardTitle>
          <CardDescription>
            Permanently delete all locally saved data on this device, including settings, API keys, progress,
            streaks, mentor chats, flashcard ratings, and cached lessons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      <Dialog open={resetOpen} onOpenChange={setResetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset all data?</DialogTitle>
            <DialogDescription>
              This will permanently erase your settings, API keys, progress, streaks, mentor chats, and cached
              lessons from this device. This action cannot be undone. Consider exporting your data first.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetOpen(false)} disabled={resetting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleReset} disabled={resetting}>
              {resetting && <Loader2 className="h-4 w-4 animate-spin" />}
              Yes, reset everything
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
