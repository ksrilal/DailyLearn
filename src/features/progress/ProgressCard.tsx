import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProgressCardProps {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}

export function ProgressCard({ label, value, icon: Icon }: ProgressCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}
