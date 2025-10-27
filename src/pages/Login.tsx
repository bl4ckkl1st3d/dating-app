import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import AuthForm from '../components/AuthForm.tsx';
import FormInput from '../components/FormInput.tsx';

const Login: React.FC = () => {
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
      // Redirect handled by useAuth
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Welcome Back!"
      subtitle="Login to your account"
      onSubmit={handleSubmit}
      submitText="Login"
      loading={loading}
      error={error}
      footer={
        <p>
          Don't have an account?{' '}
          <Link to="/signup" className="text-pink-500 hover:text-pink-600 font-semibold">
            Sign Up
          </Link>
        </p>
      }
    >
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
    </AuthForm>
  );
};

export default Login;
