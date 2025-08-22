import Link from 'next/link';

export default function PatientDashboard() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Patient Dashboard</h1>
      <div className="medical-card">
        <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">Quick tip</div>
        <ul className="mt-2 text-sm text-gray-600 dark:text-gray-400 list-disc list-inside space-y-1">
          <li>Tap the body to zoom in and start painting.</li>
          <li>Use the slider to adjust brush size.</li>
          <li>Click Finish to describe your pain in simple terms.</li>
        </ul>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/patient/log" className="medical-card">
          <div className="text-lg font-medium text-gray-900 dark:text-white">New Pain Log</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Paint and describe a new pain entry
          </div>
        </Link>
        <Link href="/patient/history" className="medical-card">
          <div className="text-lg font-medium text-gray-900 dark:text-white">History</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">View your saved sessions</div>
        </Link>
      </div>
    </div>
  );
}
