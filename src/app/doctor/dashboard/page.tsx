'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { mockPatients } from '@/lib/mockPatients';
import useSWR from 'swr';
const fetcher = (url: string) => fetch(url).then(r => r.json());
import { AlertTriangle, Clock, User, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type SessionLite = {
  id: string;
  createdAt: string;
  userId?: string;
  painData?: { points?: unknown[] };
};

export default function DoctorDashboard() {
  const { data } = useSWR('/api/doctor/sessions', fetcher);

  // Get recent sessions for dashboard
  const recentSessions = useMemo(() => {
    const liveSessions: SessionLite[] = Array.isArray(data) ? (data as SessionLite[]) : [];
    const mockSessions: SessionLite[] = mockPatients.flatMap(p => p.sessions as SessionLite[]);
    const allSessions: SessionLite[] = [...liveSessions, ...mockSessions];
    return allSessions
      .sort(
        (a: SessionLite, b: SessionLite) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      .slice(0, 5);
  }, [data]);

  // Mock emergency notifications
  const emergencyNotifications = [
    {
      id: 1,
      patient: 'Sarah Johnson',
      type: 'High pain intensity',
      time: '5 minutes ago',
      severity: 'high',
      message: 'Patient reported pain level 9/10 in lower back',
    },
    {
      id: 2,
      patient: 'Mike Chen',
      type: 'New assessment',
      time: '15 minutes ago',
      severity: 'medium',
      message: 'New pain assessment submitted for review',
    },
  ];

  // Mock daily stats
  const dailyStats = {
    patientsSeen: 12,
    assessmentsReviewed: 8,
    pendingReviews: 3,
    emergencyAlerts: 2,
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

      {/* Daily Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dailyStats.patientsSeen}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Patients Today</div>
          </CardContent>
        </Card>
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {dailyStats.assessmentsReviewed}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Assessments Reviewed</div>
          </CardContent>
        </Card>
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {dailyStats.pendingReviews}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</div>
          </CardContent>
        </Card>
        <Card className="medical-card text-center">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {dailyStats.emergencyAlerts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Emergency Alerts</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Notifications */}
        <Card className="medical-card">
          <CardHeader className="flex-row items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <CardTitle>Emergency Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {emergencyNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-3 rounded-md border ${
                  notification.severity === 'high'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {notification.patient}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {notification.time}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {notification.message}
                </div>
              </div>
            ))}
            <Button asChild variant="link" className="px-0">
              <Link href="/doctor/patients">View all notifications →</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Assessments */}
        <Card className="medical-card">
          <CardHeader className="flex-row items-center gap-2">
            <Clock className="w-5 h-5 text-blue-500" />
            <CardTitle>Recent Assessments</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentSessions.map((session: SessionLite) => (
              <div key={session.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {session.userId || 'Unknown Patient'}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(session.createdAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {session.painData?.points?.length || 0} pain areas recorded
                </div>
                <Button asChild variant="link" className="px-0 mt-1">
                  <Link href={`/doctor/session/${session.id}`}>Review assessment →</Link>
                </Button>
              </div>
            ))}
            <Button asChild variant="link" className="px-0">
              <Link href="/doctor/patients">View all patients →</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="medical-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/doctor/patients"
              className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-md text-center hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Patient List</div>
            </Link>
            <Link
              href="/doctor/patients"
              className="p-4 bg-green-50 dark:bg-green-900/20 rounded-md text-center hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <Activity className="w-6 h-6 text-green-600 dark:text-green-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                Review Assessments
              </div>
            </Link>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
              <Clock className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Schedule</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md text-center">
              <AlertTriangle className="w-6 h-6 text-gray-600 dark:text-gray-400 mx-auto mb-2" />
              <div className="text-sm font-medium text-gray-900 dark:text-white">Alerts</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
