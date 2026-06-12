import { useAuth } from '../contexts/AuthContext';

export default function SuspendedPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">🚫</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Account Suspended
        </h1>
        <p className="text-sm text-gray-500 mb-6">
          আপনার account টি সাময়িকভাবে suspended করা হয়েছে।
          বিস্তারিত জানতে support-এ যোগাযোগ করুন।
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