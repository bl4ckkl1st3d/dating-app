import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';

const SignupForm: React.FC = () => {
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
      await register(email, password, name, age ? parseInt(age) : undefined, bio || undefined);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to sign up. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-sm">
      <div className="text-center mb-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 text-center">Create Your Account</h2>
        <p className="text-gray-500 text-center text-sm sm:text-base">Join us and find your perfect match!</p>
      </div>

      {error && <p className="text-red-500 text-sm text-center">{error}</p>}

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

      <button
        type="submit"
        disabled={loading}
        className="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg"
      >
        {loading ? 'Signing up...' : 'Sign Up'}
      </button>

      <p className="text-center text-gray-500 text-sm">
        Already have an account?{' '}
        <Link to="/login" className="text-pink-500 hover:text-pink-600 font-semibold">
          Login
        </Link>
      </p>
    </form>
  );
};

export default SignupForm;
