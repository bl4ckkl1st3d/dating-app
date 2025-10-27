import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthForm from '../components/AuthForm';
import FormInput from '../components/FormInput';

const Signup: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [bio, setBio] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔄 [Signup] Starting signup process...');
      console.log('📝 [Signup] Form data:', { email, name, age, bio: bio.substring(0, 20) + '...' });
      
      await register(
        email,
        password,
        name,
        age ? parseInt(age) : undefined,
        bio || undefined
      );
      
      console.log('✅ [Signup] Signup successful!');
      // Redirect handled by useAuth
    } catch (err: any) {
      console.error('❌ [Signup] Signup failed:', err);
      console.error('📄 [Signup] Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
        statusText: err.response?.statusText
      });
      setError(err.response?.data?.error || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthForm
      title="Create Your Account"
      subtitle="Join us and find your perfect match!"
      onSubmit={handleSubmit}
      submitText="Sign Up"
      loading={loading}
      error={error}
      footer={
        <p>
          Already have an account?{' '}
          <Link to="/login" className="text-pink-500 hover:text-pink-600 font-semibold">
            Login
          </Link>
        </p>
      }
    >
      <FormInput
        label="Full Name"
        type="text"
        name="name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="Enter your full name"
      />

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
        minLength={6}
        placeholder="Create a password (min 6 characters)"
      />

      <FormInput
        label="Age"
        type="number"
        name="age"
        value={age}
        onChange={(e) => setAge(e.target.value)}
        min="18"
        max="100"
        placeholder="Enter your age"
      />

      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
          Bio
        </label>
        <textarea
          id="bio"
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
          placeholder="Tell us about yourself..."
        />
      </div>
    </AuthForm>
  );
};

export default Signup;