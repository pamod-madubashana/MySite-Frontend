import { useEffect, useMemo, useState } from "react";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  contactApi,
  ContactMessage,
  ContactMessageStatus,
} from "@/api/contactApi";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

  return "bg-muted text-muted-foreground border-border";
};

const MessagesManager = () => {
  const { token } = useAuth();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [updatingMessageId, setUpdatingMessageId] = useState<string | null>(null);

  const newMessageCount = useMemo(
    () => messages.filter((message) => message.status === "new").length,
    [messages],
  );

  const loadMessages = async () => {
    if (!token) {
      setLoading(false);
      setError("Authentication is required to view contact messages.");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const fetched = await contactApi.getMessages(token);
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
          <Button variant="outline" onClick={loadMessages} disabled={loading}>
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
              </div>

              <div className="rounded-md border border-border bg-muted/30 p-4 whitespace-pre-wrap">
                {selectedMessage.message}
              </div>

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
    </div>
  );
};

export default MessagesManager;
