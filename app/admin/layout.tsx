'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayoutClient from "@/components/admin/admin-layout-client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Check session on client side
    fetch('/api/auth/check-admin')
      .then(res => {
        if (!res.ok) {
          router.replace('/login');
        }
      })
      .catch(() => {
        router.replace('/login');
      });
  }, [router]);

  return <AdminLayoutClient>{children}</AdminLayoutClient>;

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
