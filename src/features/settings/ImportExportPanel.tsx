import { useRef } from 'react';
import { Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/components/ui/toast';
import { applyImport, buildExport, downloadExport, isValidExport } from '@/features/settings/exportImport';

export function ImportExportPanel() {
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  return (
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
  );
}
