// src/components/LoginForm.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-gray-800">Welcome Back!</h2>
        <p className="text-gray-500">Login to your account</p>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

      <FormInput
        label="Email"
        type="email"
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        placeholder="Enter your email"
      />

      <FormInput
        label="Password"
        type="password"
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        placeholder="Enter your password"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg"
      >
        {loading ? 'Logging in...' : 'Login'}
      </button>

      <p className="text-center text-gray-500 text-sm">
        Don’t have an account?{' '}
        <Link to="/signup" className="text-pink-500 hover:text-pink-600 font-semibold">
          Sign Up
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
