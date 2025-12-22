import { useState, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white shadow z-10">
        <div className="px-4 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold">KV Storage</Link>
          <button onClick={() => setMenuOpen(!menuOpen)} className="p-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside className={`${menuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:static inset-y-0 left-0 w-64 bg-white shadow-lg transition-transform z-20 flex flex-col`}>
        <div className="p-6">
          <Link to="/dashboard" className="text-xl font-bold">KV Storage</Link>
        </div>
        <nav className="flex-1 px-4">
          <Link to="/dashboard" className="block py-3 px-4 rounded hover:bg-gray-100">Dashboard</Link>
          <Link to="/namespaces" className="block py-3 px-4 rounded hover:bg-gray-100">Namespaces</Link>
          <Link to="/pricing" className="block py-3 px-4 rounded hover:bg-gray-100">Pricing</Link>
        </nav>
        <div className="p-4 border-t">
          <button onClick={logout} className="w-full px-4 py-2 bg-gray-200 rounded hover:bg-gray-300">Logout</button>
        </div>
      </aside>

      {/* Overlay */}
      {menuOpen && <div onClick={() => setMenuOpen(false)} className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-10"></div>}

      {/* Main Content */}
      <div className="flex-1 md:ml-0 mt-16 md:mt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
