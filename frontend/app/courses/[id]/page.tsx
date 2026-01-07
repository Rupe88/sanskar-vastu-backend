'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import * as courseApi from '@/lib/api/courses';
import * as enrollmentApi from '@/lib/api/enrollments';
import { Course } from '@/lib/types/course';
import { formatCurrency } from '@/lib/utils/helpers';
import { useAuth } from '@/lib/context/AuthContext';
import { ROUTES } from '@/lib/utils/constants';

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string);
    }
  }, [params.id]);

  const fetchCourse = async (id: string) => {
    try {
      setLoading(true);
      const data = await courseApi.getCourseById(id);
      setCourse(data);
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      router.push(ROUTES.LOGIN);
      return;
    }

    if (!course) return;

    try {
      setEnrolling(true);
      await enrollmentApi.enrollInCourse(course.id);
      router.push(ROUTES.DASHBOARD);
    } catch (error: any) {
      alert(error.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Course not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--muted)] py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {course.thumbnail && (
              <div className="relative h-96 w-full mb-6 rounded-lg overflow-hidden">
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <Card padding="lg" className="mb-6">
              <h1 className="text-3xl font-bold text-[var(--foreground)] mb-4">
                {course.title}
              </h1>
              <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: course.description }} />
            </Card>

            {course.instructor && (
              <Card padding="lg">
                <h2 className="text-2xl font-semibold text-[var(--foreground)] mb-4">Instructor</h2>
                <div className="flex items-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--primary-700)] flex items-center justify-center text-white font-semibold text-xl mr-4">
                    {course.instructor.fullName[0]}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--foreground)]">
                      {course.instructor.fullName}
                    </h3>
                    {course.instructor.bio && (
                      <p className="text-[var(--muted-foreground)]">{course.instructor.bio}</p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card padding="lg" className="sticky top-4">
              <div className="mb-6">
                <div className="text-3xl font-bold text-[var(--primary-700)] mb-2">
                  {course.isFree ? 'Free' : formatCurrency(course.price)}
                </div>
                {course.level && (
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Level: {course.level}
                  </div>
                )}
                {course.duration && (
                  <div className="text-sm text-[var(--muted-foreground)]">
                    Duration: {course.duration} hours
                  </div>
                )}
              </div>

              <Button
                variant="primary"
                size="lg"
                className="w-full mb-4"
                onClick={handleEnroll}
                isLoading={enrolling}
              >
                {course.isFree ? 'Enroll for Free' : 'Enroll Now'}
              </Button>

              <div className="space-y-2 text-sm text-[var(--muted-foreground)]">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium">{course.status}</span>
                </div>
                {course.language && (
                  <div className="flex justify-between">
                    <span>Language:</span>
                    <span className="font-medium">{course.language}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

