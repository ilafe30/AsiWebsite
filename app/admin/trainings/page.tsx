"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from "lucide-react";

interface Training {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  description?: string | null;
  created_at: string;
  updated_at: string;
}

export default function TrainingsPage() {
  const [items, setItems] = useState<Training[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Form state (create/edit)
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDate("");
    setTime("");
    setDescription("");
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/trainings?page=${page}&pageSize=${pageSize}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load trainings");
      setItems(json.items || []);
      setTotal(json.total || 0);
      setTotalPages(json.totalPages || 0);
    } catch (e: any) {
      setError(e?.message || "Failed to load trainings");
      toast.error(e?.message || "Failed to load trainings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [page]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!title || !date || !time) {
        toast.error("Title, date and time are required");
        return;
      }
      if (isEditing && editingId) {
        const res = await fetch(`/api/admin/trainings/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, date, time, description }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to update training");
        toast.success("Training updated");
      } else {
        const res = await fetch("/api/admin/trainings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, date, time, description }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Failed to create training");
        toast.success("Training created");
      }
      resetForm();
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Save failed");
    }
  };

  const onEdit = (t: Training) => {
    setEditingId(t.id);
    setTitle(t.title);
    setDate(t.date);
    setTime(t.time);
    setDescription(t.description || "");
  };

  const onConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`/api/admin/trainings/${deleteId}`, { method: "DELETE" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to delete training");
      toast.success("Training deleted");
      setDeleteId(null);
      await load();
    } catch (e: any) {
      toast.error(e?.message || "Delete failed");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{isEditing ? "Edit Training" : "Add New Training"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm mb-1">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Pitch Training" />
            </div>
            <div>
              <label className="block text-sm mb-1">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Time</label>
              <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div className="md:col-span-4">
              <label className="block text-sm mb-1">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" />
            </div>
            <div className="md:col-span-4 flex gap-2">
              <Button type="submit">
                <Plus className="h-4 w-4 mr-2" /> {isEditing ? "Save Changes" : "Add Training"}
              </Button>
              {isEditing && (
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Trainings</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-[160px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.title}</TableCell>
                  <TableCell>{t.date}</TableCell>
                  <TableCell>{t.time}</TableCell>
                  <TableCell className="max-w-[400px] truncate" title={t.description || undefined}>{t.description || "-"}</TableCell>
                  <TableCell className="space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(t)}>
                      <Pencil className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeleteId(t.id)}>
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-muted-foreground text-center">No trainings yet</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Page {page} of {totalPages || 1} • Total: {total} trainings
        </div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (page > 1) setPage(page - 1); 
                }}
                className={page <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext 
                href="#" 
                onClick={(e) => { 
                  e.preventDefault(); 
                  if (page < totalPages) setPage(page + 1); 
                }}
                className={page >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Training</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Are you sure you want to delete this training?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
