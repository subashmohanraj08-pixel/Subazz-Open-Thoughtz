import Header from './Header';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <footer className="text-center text-xs text-gray-400 py-6">
        Subaz Open Thoughtz — Think Open. Share Freely. Inspire the World. 🌍💡
      </footer>
    </div>
  );
}
