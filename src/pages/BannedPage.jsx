import { useAuth } from '../contexts/AuthContext';

export default function BannedPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">⛔</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Account Banned
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          আপনার account টি permanently banned করা হয়েছে।
          আর কোনো access সম্ভব নয়।
        </p>
        <button
          onClick={signOut}
          className="text-sm text-gray-400 underline hover:text-gray-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
}