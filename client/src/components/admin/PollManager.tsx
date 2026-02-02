import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  Trash2,
  Edit,
  Play,
  Pause,
  RotateCcw,
  BarChart3,
  Cat,
} from "lucide-react";

type PollOption = {
  id: string;
  text: string;
  catId?: number;
  imageUrl?: string;
  voteCount?: number;
  percentage?: number;
};

type Poll = {
  id: number;
  question: string;
  options: string;
  status: "draft" | "active" | "ended";
  isRecurring: boolean;
  totalVotes: number;
  parsedOptions?: PollOption[];
};

export function PollManager() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);
  const [viewingResults, setViewingResults] = useState<number | null>(null);

  const { data: polls, refetch } = trpc.polls.getAll.useQuery();
  const { data: pollResults } = trpc.polls.getById.useQuery(
    { id: viewingResults! },
    { enabled: viewingResults !== null }
  );

  const createMutation = trpc.polls.create.useMutation({
    onSuccess: () => {
      refetch();
      setIsCreateOpen(false);
    },
  });

  const updateMutation = trpc.polls.update.useMutation({
    onSuccess: () => {
      refetch();
      setEditingPoll(null);
    },
  });

  const deleteMutation = trpc.polls.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const resetVotesMutation = trpc.polls.resetVotes.useMutation({
    onSuccess: () => refetch(),
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "ended":
        return <Badge variant="secondary">Ended</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Cat Polls</h2>
          <p className="text-muted-foreground">
            Create fun polls about adoptable cats for guests to vote on
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create Poll
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Poll</DialogTitle>
            </DialogHeader>
            <PollForm
              onSubmit={(data) => createMutation.mutate(data)}
              isLoading={createMutation.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Poll List */}
      <div className="grid gap-4">
        {polls?.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <Cat className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No Polls Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first poll to engage guests with fun cat questions!
              </p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
            </CardContent>
          </Card>
        )}

        {polls?.map((poll) => {
          // Handle options that might be a string (possibly double-encoded) or already parsed
          let options: PollOption[] = [];
          try {
            if (typeof poll.options === 'string') {
              let parsed = JSON.parse(poll.options);
              // Handle double-encoded JSON (string of a string)
              while (typeof parsed === 'string') {
                parsed = JSON.parse(parsed);
              }
              options = parsed;
            } else if (Array.isArray(poll.options)) {
              options = poll.options as PollOption[];
            }
          } catch (e) {
            console.error('Failed to parse poll options:', poll.options, e);
            options = [];
          }
          return (
            <Card key={poll.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{poll.question}</CardTitle>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(poll.status)}
                      {poll.isRecurring && (
                        <Badge variant="outline">Recurring</Badge>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {poll.totalVotes} votes
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setViewingResults(poll.id)}
                    >
                      <BarChart3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setEditingPoll(poll)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        if (confirm("Delete this poll?")) {
                          deleteMutation.mutate({ id: poll.id });
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {options.map((opt) => (
                    <Badge key={opt.id} variant="secondary">
                      {opt.text}
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  {poll.status === "draft" && (
                    <Button
                      size="sm"
                      onClick={() =>
                        updateMutation.mutate({ id: poll.id, status: "active" })
                      }
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Activate
                    </Button>
                  )}
                  {poll.status === "active" && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() =>
                        updateMutation.mutate({ id: poll.id, status: "ended" })
                      }
                    >
                      <Pause className="w-4 h-4 mr-1" />
                      End Poll
                    </Button>
                  )}
                  {poll.status === "ended" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        updateMutation.mutate({ id: poll.id, status: "active" })
                      }
                    >
                      <Play className="w-4 h-4 mr-1" />
                      Reactivate
                    </Button>
                  )}
                  {poll.totalVotes > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        if (confirm("Reset all votes for this poll?")) {
                          resetVotesMutation.mutate({ id: poll.id });
                        }
                      }}
                    >
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Reset Votes
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Poll Dialog */}
      <Dialog open={!!editingPoll} onOpenChange={() => setEditingPoll(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Poll</DialogTitle>
          </DialogHeader>
          {editingPoll && (
            <PollForm
              initialData={{
                question: editingPoll.question,
                options: (() => {
                  try {
                    if (typeof editingPoll.options === 'string') {
                      let parsed = JSON.parse(editingPoll.options);
                      while (typeof parsed === 'string') {
                        parsed = JSON.parse(parsed);
                      }
                      return parsed;
                    }
                    return (editingPoll.options as PollOption[]) || [];
                  } catch {
                    return [];
                  }
                })(),
                isRecurring: editingPoll.isRecurring,
              }}
              onSubmit={(data) =>
                updateMutation.mutate({ id: editingPoll.id, ...data })
              }
              isLoading={updateMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* View Results Dialog */}
      <Dialog
        open={viewingResults !== null}
        onOpenChange={() => setViewingResults(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Poll Results</DialogTitle>
          </DialogHeader>
          {pollResults && (
            <div className="space-y-4">
              <h3 className="font-semibold">{pollResults.question}</h3>
              <p className="text-sm text-muted-foreground">
                Total votes: {pollResults.totalVotes}
              </p>
              <div className="space-y-3">
                {pollResults.parsedOptions?.map((opt) => (
                  <div key={opt.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{opt.text}</span>
                      <span>
                        {opt.voteCount} ({opt.percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${opt.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Poll Form Component
function PollForm({
  initialData,
  onSubmit,
  isLoading,
}: {
  initialData?: {
    question: string;
    options: PollOption[];
    isRecurring: boolean;
  };
  onSubmit: (data: {
    question: string;
    options: PollOption[];
    isRecurring: boolean;
  }) => void;
  isLoading: boolean;
}) {
  const [question, setQuestion] = useState(initialData?.question || "");
  const [options, setOptions] = useState<PollOption[]>(
    initialData?.options || [
      { id: "opt1", text: "" },
      { id: "opt2", text: "" },
    ]
  );
  const [isRecurring, setIsRecurring] = useState(
    initialData?.isRecurring || false
  );

  const addOption = () => {
    if (options.length < 6) {
      setOptions([...options, { id: `opt${Date.now()}`, text: "" }]);
    }
  };

  const removeOption = (id: string) => {
    if (options.length > 2) {
      setOptions(options.filter((o) => o.id !== id));
    }
  };

  const updateOption = (id: string, text: string) => {
    setOptions(options.map((o) => (o.id === id ? { ...o, text } : o)));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim() && options.every((o) => o.text.trim())) {
      onSubmit({ question, options, isRecurring });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="question">Question</Label>
        <Input
          id="question"
          placeholder="Who has the fluffiest tail?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label>Options (2-6)</Label>
        <div className="space-y-2">
          {options.map((opt, idx) => (
            <div key={opt.id} className="flex gap-2">
              <Input
                placeholder={`Option ${idx + 1}`}
                value={opt.text}
                onChange={(e) => updateOption(opt.id, e.target.value)}
                required
              />
              {options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeOption(opt.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <Button type="button" variant="outline" size="sm" onClick={addOption}>
            <Plus className="w-4 h-4 mr-1" />
            Add Option
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="recurring"
          checked={isRecurring}
          onChange={(e) => setIsRecurring(e.target.checked)}
          className="rounded"
        />
        <Label htmlFor="recurring" className="font-normal">
          Include in rotation (shows repeatedly)
        </Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Saving..." : initialData ? "Update Poll" : "Create Poll"}
      </Button>
    </form>
  );
}
