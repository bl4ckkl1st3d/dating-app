import React, { ReactNode } from 'react';

interface AuthFormProps {
  title: string;
  subtitle: string;
  onSubmit: (e: React.FormEvent) => void;
  submitText: string;
  loading: boolean;
  error: string;
  footer: ReactNode;
  children: ReactNode;
}

const AuthForm: React.FC<AuthFormProps> = ({
  title,
  subtitle,
  onSubmit,
  submitText,
  loading,
  error,
  footer,
  children,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-500 mb-2">💕 DatingApp</h1>
          <h2 className="text-2xl font-semibold text-gray-800">{title}</h2>
          <p className="text-gray-600 mt-2">{subtitle}</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : submitText}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-600">
          {footer}
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
