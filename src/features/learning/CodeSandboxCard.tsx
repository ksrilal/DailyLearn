import { useState } from 'react';
import { Play, SquareTerminal } from 'lucide-react';
import type { LessonSandbox } from '@/types/lesson';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExpectedOutputPanel } from '@/features/learning/ExpectedOutputPanel';

/**
 * Non-executing "predict the output" sandbox. Shows code and a Run Example
 * button that reveals the expected output, designed so a future version can
 * swap in real execution (WebContainer / Monaco) without changing the API.
 */
export function CodeSandboxCard({ sandbox }: { sandbox: LessonSandbox }) {
  const [ran, setRan] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <SquareTerminal className="h-4 w-4 text-primary" />
          Interactive Sandbox
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 text-xs">
          <code className={`language-${sandbox.language}`}>{sandbox.code}</code>
        </pre>

        <Button size="sm" onClick={() => setRan(true)} disabled={ran}>
          <Play className="h-4 w-4" />
          Run Example
        </Button>

        <ExpectedOutputPanel output={sandbox.expectedOutput} visible={ran} />
      </CardContent>
    </Card>
  );
}
