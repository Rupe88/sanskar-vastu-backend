'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

export default function AdminCoursesPage() {
  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[var(--foreground)]">Course Management</h1>
          <p className="text-[var(--muted-foreground)] mt-2">Manage all courses</p>
        </div>
        <Link href="/admin/courses/new">
          <Button variant="primary">Create Course</Button>
        </Link>
      </div>
      <Card padding="lg">
        <p className="text-[var(--muted-foreground)]">Course management coming soon...</p>
      </Card>
    </div>
  );
}

