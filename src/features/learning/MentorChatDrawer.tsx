import { useEffect, useRef, useState } from 'react';
import { Loader2, Send, Sparkles } from 'lucide-react';
import type { LessonInput } from '@/types/ai';
import type { Lesson } from '@/types/lesson';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MentorMessageBubble } from '@/features/learning/MentorMessageBubble';
import { useMentorChat } from '@/features/learning/useMentorChat';

const SUGGESTIONS = [
  'Explain simpler',
  'Give another example',
  'Show a .NET example',
  'Show a Java example',
  'Show a production example',
  "Explain like I'm a junior developer",
];

interface MentorChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  input: LessonInput;
  lesson: Lesson;
}

export function MentorChatDrawer({ open, onOpenChange, input, lesson }: MentorChatDrawerProps) {
  const { messages, send, pending, error } = useMentorChat(input, lesson);
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, pending]);

  function handleSend(text: string) {
    if (!text.trim() || pending) return;
    setDraft('');
    void send(text);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-3">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            Ask Mentor
          </DialogTitle>
          <DialogDescription>Ask follow-up questions about "{input.learningUnit}".</DialogDescription>
        </DialogHeader>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto pr-1">
          {messages.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Ask anything about this lesson, or try a suggestion below.
            </p>
          )}
          {messages.map((message, i) => (
            <MentorMessageBubble key={i} message={message} />
          ))}
          {pending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Thinking…
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => handleSend(suggestion)}
              disabled={pending}
              className="rounded-full border bg-background px-3 py-1 text-xs transition-colors hover:bg-accent disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(draft);
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask a follow-up question…"
            disabled={pending}
          />
          <Button type="submit" size="icon" disabled={pending || !draft.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
