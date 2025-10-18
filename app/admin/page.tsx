import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ApplicationsTable from "@/components/admin/applications-table";

export default function AdminPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications</CardTitle>
      </CardHeader>
      <CardContent>
        <ApplicationsTable />
      </CardContent>
    </Card>
  );
}