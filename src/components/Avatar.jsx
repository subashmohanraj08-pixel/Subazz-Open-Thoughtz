export default function Avatar({ src, name = '?', size = 'md' }) {
  const sizes = {
    sm: 'h-8 w-8 text-xs',
    md: 'h-11 w-11 text-sm',
    lg: 'h-20 w-20 text-2xl',
    xl: 'h-28 w-28 text-3xl',
  };
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white dark:border-gray-900 shadow-sm`}
      />
    );
  }

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-brand-400 to-accent-500 text-white flex items-center justify-center font-semibold border-2 border-white dark:border-gray-900 shadow-sm`}
    >
      {initials}
    </div>
  );
}
