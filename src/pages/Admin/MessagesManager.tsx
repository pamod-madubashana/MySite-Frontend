import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, RefreshCw, Reply } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  contactApi,
  ContactMessage,
  ContactMessageStatus,
} from "@/api/contactApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const DEFAULT_REPLY_SUBJECT = "Re: Your message to Pamod";

const formatDate = (value: string): string => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const statusBadgeClass = (status: ContactMessageStatus): string => {
  if (status === "new") {
    return "bg-primary/20 text-primary border-primary/30";
  }

  if (status === "replied") {
    return "bg-emerald-500/20 text-emerald-500 border-emerald-500/30";
  }

  return "bg-muted text-muted-foreground border-border";
};

interface ReplyFormState {
  subject: string;
  body: string;
  includeOriginal: boolean;
}

const INITIAL_REPLY_FORM: ReplyFormState = {
  subject: DEFAULT_REPLY_SUBJECT,
  body: "",
  includeOriginal: true,
};

const MessagesManager = () => {
  const { token } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);
  const [replyTarget, setReplyTarget] = useState<ContactMessage | null>(null);
  const [replyForm, setReplyForm] = useState<ReplyFormState>(INITIAL_REPLY_FORM);
  const [replyError, setReplyError] = useState<string | null>(null);
  const [sendingReply, setSendingReply] = useState(false);

  const newMessageCount = useMemo(
    () => messages.filter((message) => message.status === "new").length,
    [messages],
  );

  const loadMessages = async (forceRefresh = false) => {
    if (!token) {
      setLoading(false);
      setError("Authentication is required to view contact messages.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetched = await contactApi.getMessages(token, forceRefresh);
      setMessages(fetched);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Failed to load messages.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [token]);

  const openReplyModal = (message: ContactMessage) => {
    setReplyTarget(message);
    setReplyForm(INITIAL_REPLY_FORM);
    setReplyError(null);
  };

  const closeReplyModal = () => {
    if (sendingReply) {
      return;
    }

    setReplyTarget(null);
    setReplyForm(INITIAL_REPLY_FORM);
    setReplyError(null);
  };

  const handleSendReply = async () => {
    if (!token || !replyTarget) {
      return;
    }

    const subject = replyForm.subject.trim();
    const body = replyForm.body.trim();

    if (subject.length < 3 || subject.length > 140) {
      setReplyError("Subject must be between 3 and 140 characters.");
      return;
    }

    if (body.length < 5 || body.length > 5000) {
      setReplyError("Message must be between 5 and 5000 characters.");
      return;
    }

    try {
      setSendingReply(true);
      setReplyError(null);

      const updated = await contactApi.sendReply(token, replyTarget.id, {
        subject,
        body,
        includeOriginal: replyForm.includeOriginal,
      });

      setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

      if (selectedMessage?.id === updated.id) {
        setSelectedMessage(updated);
      }

      toast({
        title: "Reply sent",
        description: "Your reply was sent successfully.",
      });

      setReplyTarget(null);
      setReplyForm(INITIAL_REPLY_FORM);
      setReplyError(null);
    } catch (sendError) {
      setReplyError(sendError instanceof Error ? sendError.message : "Failed to send reply.");
      toast({
        title: "Reply failed",
        description: "Could not send this reply right now.",
        variant: "destructive",
      });
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusUpdate = async (message: ContactMessage, status: ContactMessageStatus) => {
    if (!token) {
      return;
    }

    try {
      setUpdatingMessageId(message.id);
      const updated = await contactApi.updateMessageStatus(token, message.id, status);

      setMessages((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));

      if (selectedMessage?.id === updated.id) {
        setSelectedMessage(updated);
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Failed to update message status.");
    } finally {
      setUpdatingMessageId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass border border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-foreground/80">
              <Mail className="w-5 h-5 text-primary" />
              Contact Messages
            </CardTitle>
            <p className="mt-2 text-sm text-muted-foreground">
              {newMessageCount} new {newMessageCount === 1 ? "message" : "messages"}
            </p>
          </div>
          <Button variant="outline" onClick={() => loadMessages(true)} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">No contact messages yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Received</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {messages.map((message) => (
                  <TableRow key={message.id}>
                    <TableCell className="font-medium">{message.name}</TableCell>
                    <TableCell className="text-muted-foreground">{message.email}</TableCell>
                    <TableCell>{formatDate(message.createdAt)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadgeClass(message.status)}>
                        {message.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedMessage(message)}>
                        View
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openReplyModal(message)}>
                        <Reply className="w-3 h-3 mr-2" />
                        Reply
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={updatingMessageId === message.id}
                        onClick={() =>
                          handleStatusUpdate(message, message.status === "new" ? "read" : "new")
                        }
                      >
                        {updatingMessageId === message.id && (
                          <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                        )}
                        Mark as {message.status === "new" ? "read" : "new"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={Boolean(selectedMessage)} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.name || "Contact message"}</DialogTitle>
          </DialogHeader>

          {selectedMessage && (
            <div className="space-y-4 text-sm">
              <div className="space-y-1">
                <p>
                  <span className="font-medium">Email:</span> {selectedMessage.email}
                </p>
                <p>
                  <span className="font-medium">Received:</span> {formatDate(selectedMessage.createdAt)}
                </p>
                <p>
                  <span className="font-medium">Status:</span>{" "}
                  <Badge variant="outline" className={statusBadgeClass(selectedMessage.status)}>
                    {selectedMessage.status}
                  </Badge>
                </p>
                {selectedMessage.lastRepliedAt && (
                  <p>
                    <span className="font-medium">Last replied:</span>{" "}
                    {formatDate(selectedMessage.lastRepliedAt)}
                  </p>
                )}
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-4 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

              {selectedMessage.replies.length > 0 && (
                <div className="space-y-3">
                  <p className="font-medium">Reply history</p>
                  {selectedMessage.replies.map((reply, index) => (
                    <div key={`${reply.sentAt}-${index}`} className="rounded-md border border-border p-3">
                      <p className="text-xs text-muted-foreground">{formatDate(reply.sentAt)}</p>
                      <p className="text-sm font-medium mt-1">{reply.subject}</p>
                      <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                        {reply.body.length > 180 ? `${reply.body.slice(0, 177)}...` : reply.body}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  disabled={updatingMessageId === selectedMessage.id}
                  onClick={() =>
                    handleStatusUpdate(
                      selectedMessage,
                      selectedMessage.status === "new" ? "read" : "new",
                    )
                  }
                >
                  {updatingMessageId === selectedMessage.id && (
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  )}
                  Mark as {selectedMessage.status === "new" ? "read" : "new"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(replyTarget)} onOpenChange={(open) => !open && closeReplyModal()}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Reply to message</DialogTitle>
          </DialogHeader>

          {replyTarget && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-to">Recipient</Label>
                <Input id="reply-to" value={replyTarget.email} readOnly disabled={sendingReply} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-subject">Subject</Label>
                <Input
                  id="reply-subject"
                  value={replyForm.subject}
                  onChange={(event) =>
                    setReplyForm((prev) => ({ ...prev, subject: event.target.value }))
                  }
                  disabled={sendingReply}
                  maxLength={140}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reply-body">Message</Label>
                <Textarea
                  id="reply-body"
                  rows={8}
                  value={replyForm.body}
                  onChange={(event) =>
                    setReplyForm((prev) => ({ ...prev, body: event.target.value }))
                  }
                  disabled={sendingReply}
                  maxLength={5000}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border border-border p-3">
                <Label htmlFor="include-original" className="cursor-pointer">
                  Include original message
                </Label>
                <Switch
                  id="include-original"
                  checked={replyForm.includeOriginal}
                  onCheckedChange={(checked) =>
                    setReplyForm((prev) => ({ ...prev, includeOriginal: checked }))
                  }
                  disabled={sendingReply}
                />
              </div>

              {replyError && <p className="text-sm text-destructive">{replyError}</p>}

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeReplyModal} disabled={sendingReply}>
                  Cancel
                </Button>
                <Button onClick={handleSendReply} disabled={sendingReply}>
                  {sendingReply && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Send Reply
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesManager;
