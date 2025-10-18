"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Mail } from "lucide-react";
import ReportModal from "@/components/admin/report-modal";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ApplicationItem {
  id: number;
  name: string;
  email: string;
  submissionDate: string;
  analysisStatus: string;
  totalScore: number | null;
  isEligible: boolean | null;
  emailSent: boolean;
  initialPhase: 'accepted' | 'refused' | null;
}

interface ApiResponse {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  items: ApplicationItem[];
}

export default function ApplicationsTable() {
  const [data, setData] = useState<ApplicationItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const [page, setPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);

  const [status, setStatus] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resendingId, setResendingId] = useState<number | null>(null);
  const [confirmResendId, setConfirmResendId] = useState<number | null>(null);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("pageSize", String(pageSize));
    if (status && status !== "all") params.set("status", status);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    return params.toString();
  }, [page, pageSize, status, dateFrom, dateTo]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/applications?${query}`);
      if (!res.ok) throw new Error((await res.json()).error || "Request failed");
      const json: ApiResponse = await res.json();
      setData(json.items);
    } catch (e: any) {
      setError(e?.message || "Failed to load applications");
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => fetchData();

  const handleResendEmail = async (id: number) => {
    setConfirmResendId(null);
    setResendingId(id);
    try {
      const res = await fetch(`/api/admin/applications/${id}/resend-email`, { method: "POST" });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || "Failed to resend email");
      }
      toast.success("Email sent successfully!");
      await fetchData(); // Refresh table to show updated status
    } catch (e: any) {
      toast.error(e?.message || "Failed to resend email");
    } finally {
      setResendingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
          <div className="md:col-span-2">
            <label className="block text-sm mb-1">Status</label>
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger>
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="analyzed">Analyzed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm mb-1">From</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div>
            <label className="block text-sm mb-1">To</label>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setStatus("all"); setDateFrom(""); setDateTo(""); setPage(1); }}>Clear</Button>
            <Button onClick={onRefresh}>Refresh</Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Submission Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Initial Phase</TableHead>
              <TableHead>Email Sent</TableHead>
              <TableHead className="w-[220px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-10" /></TableCell>
                <TableCell><Skeleton className="h-8 w-40" /></TableCell>
              </TableRow>
            ))}

            {!loading && data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No applications found
                </TableCell>
              </TableRow>
            )}

            {!loading && data.map((item) => (
              <TableRow key={item.id}>
                <TableCell>{item.name}</TableCell>
                <TableCell>{new Date(item.submissionDate).toLocaleString()}</TableCell>
                <TableCell className="capitalize">{item.analysisStatus || "unknown"}</TableCell>
                <TableCell className="capitalize">{item.initialPhase ?? "-"}</TableCell>
                <TableCell>{item.emailSent ? "✅" : "❌"}</TableCell>
                <TableCell className="space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedId(item.id)}>
                    View Report
                  </Button>
                  {!item.emailSent && (
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      onClick={() => setConfirmResendId(item.id)}
                      disabled={resendingId === item.id}
                    >
                      {resendingId === item.id ? (
                        <>
                          <Mail className="h-3 w-3 mr-1 animate-pulse" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="h-3 w-3 mr-1" />
                          Resend Email
                        </>
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">Page {page}</div>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); setPage(Math.max(1, page - 1)); }} />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" onClick={(e) => { e.preventDefault(); setPage(page + 1); }} />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <ReportModal id={selectedId} onOpenChange={(open: boolean) => !open && setSelectedId(null)} />

      <AlertDialog open={!!confirmResendId} onOpenChange={(open) => !open && setConfirmResendId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Resend Email Confirmation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to resend the analysis email to this applicant? This will trigger the email sending process.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => confirmResendId && handleResendEmail(confirmResendId)}>
              Yes, Resend Email
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
