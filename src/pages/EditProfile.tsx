import React, { useState } from 'react';
import AppNavbar from '../components/AppNavbar';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';

const EditProfile: React.FC = () => {
  const { user } = useAuth(); // Get current user data
  
  // Initialize state with current user data or empty strings
  const [name, setName] = useState(user?.name || '');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [bio, setBio] = useState(user?.bio || '');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // TODO: Connect this to the 'updateUserProfile' endpoint
    // You'd use `api.put(`/users/profile/${user.id}`, { ... })`
    console.log('Updating profile with:', { name, age: parseInt(age), bio });

    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Profile updated successfully!');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppNavbar />
      <main className="max-w-2xl mx-auto py-8 px-4 pb-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h1>
        <form 
          onSubmit={handleSubmit} 
          className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6"
        >
          <FormInput
            label="Full Name"
            type="text"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <FormInput
            label="Age"
            type="number"
            name="age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="18"
            max="100"
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
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition resize-none"
              placeholder="Tell us about yourself..."
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}
          {success && (
            <div className="text-green-600 text-sm">{success}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default EditProfile;