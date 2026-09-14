export function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400">
      <div className="animate-spin h-8 w-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function EmptyState({ icon = '🪶', title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6 gap-2">
      <div className="text-5xl mb-2">{icon}</div>
      <h3 className="text-lg font-semibold">{title}</h3>
      {subtitle && <p className="text-gray-500 dark:text-gray-400 max-w-sm">{subtitle}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-sm rounded-xl px-4 py-3 mb-4 border border-red-100 dark:border-red-900">
      {message}
    </div>
  );
}

export function SuccessBanner({ message }) {
  if (!message) return null;
  return (
    <div className="bg-green-50 dark:bg-green-950/50 text-green-600 dark:text-green-400 text-sm rounded-xl px-4 py-3 mb-4 border border-green-100 dark:border-green-900">
      {message}
    </div>
  );
}
