"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportModalProps {
  id: number | null;
  onOpenChange: (open: boolean) => void;
}

interface ReportData {
  id: number;
  name: string;
  submissionDate: string;
  analysis: {
    totalScore: number | null;
    isEligible: boolean | null;
    summary: string;
    structured: any;
  };
}

export default function ReportModal({ id, onOpenChange }: ReportModalProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [data, setData] = useState<ReportData | null>(null);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (id) {
      setOpen(true);
      setLoading(true);
      setError("");
      setData(null);
      const controller = new AbortController();
      fetch(`/api/admin/applications/${id}/report`, { signal: controller.signal })
        .then(async (res) => {
          if (!res.ok) throw new Error((await res.json()).error || "Failed to load report");
          return res.json();
        })
        .then((json: ReportData) => setData(json))
        .catch((e) => setError((e as any)?.message || "Failed to load report"))
        .finally(() => setLoading(false));
      return () => controller.abort();
    } else {
      setOpen(false);
    }
  }, [id]);

  const handleOpenChange = (v: boolean) => {
    setOpen(v);
    onOpenChange(v);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-3xl w-[95vw] md:w-[70vw] lg:w-[60vw] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Analysis Report</DialogTitle>
        </DialogHeader>
        {loading && (
          <div className="space-y-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        )}
        {!loading && error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}
        {!loading && !error && data && (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground">Application</div>
              <div className="font-medium">{data.name}</div>
              <div className="text-xs text-muted-foreground">Submitted: {new Date(data.submissionDate).toLocaleString()}</div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Total Score</div>
                <div className="text-xl font-semibold">{data.analysis.totalScore ?? "-"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Eligible</div>
                <div className="text-xl font-semibold">{data.analysis.isEligible == null ? "-" : data.analysis.isEligible ? "Yes" : "No"}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Candidature ID</div>
                <div className="text-xl font-semibold">{data.id}</div>
              </div>
            </div>
            {data.analysis.summary && (
              <div>
                <div className="text-sm font-medium mb-1">Summary</div>
                <p className="text-sm text-foreground whitespace-pre-wrap">{data.analysis.summary}</p>
              </div>
            )}
            {data.analysis.structured && (
              <div className="space-y-3">
                {Array.isArray(data.analysis.structured?.criteria_results) && (
                  <div>
                    <div className="text-sm font-medium mb-1">Criteria Results</div>
                    <div className="space-y-1">
                      {data.analysis.structured.criteria_results.map((c: any, idx: number) => (
                        <div key={idx} className="text-sm flex justify-between gap-3">
                          <span className="text-muted-foreground">{c.criterion_name || c.name || `Criterion ${idx+1}`}</span>
                          <span>{c.earned_points ?? c.score ?? "-"} / {c.max_points ?? c.max ?? "-"}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {Array.isArray(data.analysis.structured?.recommendations) && data.analysis.structured.recommendations.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-1">Recommendations</div>
                    <ul className="list-disc pl-6 text-sm space-y-1">
                      {data.analysis.structured.recommendations.map((r: any, idx: number) => (
                        <li key={idx}>{typeof r === 'string' ? r : r.text || JSON.stringify(r)}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
