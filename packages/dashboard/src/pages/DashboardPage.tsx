import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">KV Storage Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Logout
          </button>
        </div>
      </nav>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">Welcome, {user?.email}</h2>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600">Plan: {user?.plan}</p>
          <p className="text-gray-600 mt-2">Dashboard features coming in next prompts...</p>
        </div>
      </div>
    </div>
  );
}
