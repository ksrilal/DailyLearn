import { AnimatePresence, motion } from 'framer-motion';
import { Terminal } from 'lucide-react';

export function ExpectedOutputPanel({ output, visible }: { output: string; visible: boolean }) {
  return (
    <AnimatePresence initial={false}>
      {visible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="overflow-hidden"
        >
          <div className="rounded-md border bg-muted p-3">
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Terminal className="h-3.5 w-3.5" />
              Output
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap text-xs">
              <code>{output}</code>
            </pre>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
