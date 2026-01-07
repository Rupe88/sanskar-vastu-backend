'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { HiHome, HiUsers, HiBookOpen, HiFolder, HiUserGroup, HiCreditCard, HiTag, HiShoppingBag, HiDocumentText, HiPhotograph, HiChat, HiQuestionMarkCircle, HiCalendar, HiVideoCamera, HiClipboardList, HiAcademicCap, HiChartBar, HiBell, HiStar, HiMail, HiShieldCheck } from 'react-icons/hi';
import { ROUTES } from '@/lib/utils/constants';

const adminMenuItems = [
  { href: ROUTES.ADMIN, label: 'Overview', icon: HiHome },
  { href: `${ROUTES.ADMIN}/users`, label: 'Users', icon: HiUsers },
  { href: `${ROUTES.ADMIN}/courses`, label: 'Courses', icon: HiBookOpen },
  { href: `${ROUTES.ADMIN}/categories`, label: 'Categories', icon: HiFolder },
  { href: `${ROUTES.ADMIN}/instructors`, label: 'Instructors', icon: HiUserGroup },
  { href: `${ROUTES.ADMIN}/enrollments`, label: 'Enrollments', icon: HiBookOpen },
  { href: `${ROUTES.ADMIN}/payments`, label: 'Payments', icon: HiCreditCard },
  { href: `${ROUTES.ADMIN}/coupons`, label: 'Coupons', icon: HiTag },
  { href: `${ROUTES.ADMIN}/products`, label: 'Products', icon: HiShoppingBag },
  { href: `${ROUTES.ADMIN}/orders`, label: 'Orders', icon: HiShoppingBag },
  { href: `${ROUTES.ADMIN}/blog`, label: 'Blog', icon: HiDocumentText },
  { href: `${ROUTES.ADMIN}/testimonials`, label: 'Testimonials', icon: HiStar },
  { href: `${ROUTES.ADMIN}/gallery`, label: 'Gallery', icon: HiPhotograph },
  { href: `${ROUTES.ADMIN}/consultations`, label: 'Consultations', icon: HiChat },
  { href: `${ROUTES.ADMIN}/faqs`, label: 'FAQs', icon: HiQuestionMarkCircle },
  { href: `${ROUTES.ADMIN}/events`, label: 'Events', icon: HiCalendar },
  { href: `${ROUTES.ADMIN}/live-classes`, label: 'Live Classes', icon: HiVideoCamera },
  { href: `${ROUTES.ADMIN}/assignments`, label: 'Assignments', icon: HiClipboardList },
  { href: `${ROUTES.ADMIN}/quizzes`, label: 'Quizzes', icon: HiClipboardList },
  { href: `${ROUTES.ADMIN}/certificates`, label: 'Certificates', icon: HiAcademicCap },
  { href: `${ROUTES.ADMIN}/affiliates`, label: 'Affiliates', icon: HiChartBar },
  { href: `${ROUTES.ADMIN}/notifications`, label: 'Notifications', icon: HiBell },
  { href: `${ROUTES.ADMIN}/student-success`, label: 'Student Success', icon: HiStar },
  { href: `${ROUTES.ADMIN}/contact-submissions`, label: 'Contact', icon: HiMail },
  { href: `${ROUTES.ADMIN}/newsletter`, label: 'Newsletter', icon: HiMail },
  { href: `${ROUTES.ADMIN}/audit-logs`, label: 'Audit Logs', icon: HiShieldCheck },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    window.location.href = ROUTES.DASHBOARD;
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--muted)]">
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md min-h-screen sticky top-0 overflow-y-auto">
          <div className="p-6 border-b border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--foreground)]">Admin Panel</h2>
            <p className="text-sm text-[var(--muted-foreground)] mt-1">{user?.fullName}</p>
          </div>
          <nav className="p-4">
            <ul className="space-y-2">
              {adminMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-[var(--primary-700)] text-white'
                          : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

