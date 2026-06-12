import { useAuth } from '../contexts/AuthContext';

export default function RejectedPage() {
  const { profile, signOut } = useAuth();

  const canReapply = profile?.reapply_after
    ? new Date() > new Date(profile.reapply_after)
    : false;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow p-8 max-w-md w-full text-center">
        <div className="text-5xl mb-4">X</div>
        <h1 className="text-xl font-semibold text-gray-800 mb-2">
          Application Rejected
        </h1>

        {profile?.rejection_reason && (
          <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs font-medium text-red-600 mb-1">
              Rejection Reason:
            </p>
            <p className="text-sm text-red-700">{profile.rejection_reason}</p>
          </div>
        )}

        {profile?.reapply_after && !canReapply && (
          <p className="text-sm text-gray-500 mb-4">
            Reapply korte parben:{' '}
            <span className="font-medium">
              {new Date(profile.reapply_after).toLocaleDateString('en-GB')}
            </span>
          </p>
        )}

        {canReapply && (
          <a
            href="/signup"
            className="inline-block bg-blue-600 text-white text-sm px-6 py-2 rounded-lg mb-4"
          >
            Reapply korun
          </a>
        )}

        <div>
          <button
            onClick={signOut}
            className="text-sm text-gray-400 underline hover:text-gray-600"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
