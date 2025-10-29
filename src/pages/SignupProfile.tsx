// src/pages/SignupProfile.tsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm'; //
import { UploadCloud, User as UserIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; //
import api from '../lib/api'; // <-- Import api instance

const SignupProfile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // <-- Get user, resetNewSignupFlag, and fetchCurrentUser from AuthContext
  const { user, resetNewSignupFlag, fetchCurrentUser } = useAuth(); //

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // 5MB limit check from upload middleware
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File is too large. Please select a file under 5MB.');
        return;
      }
      setFile(selectedFile);
      const previewUrl = URL.createObjectURL(selectedFile);
      setPreview(previewUrl);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { // Check if user data is available
        setError('User not loaded. Cannot upload profile picture.');
        return;
    }
    setError('');
    setLoading(true);

    try {
        // --- Actual Upload Logic ---
        if (file) {
            console.log('Attempting to upload picture:', file.name);
            const formData = new FormData();
            // Field name must match upload middleware
            formData.append('profilePicture', file);

            // API call to the backend endpoint
            const response = await api.post(`/users/profile/${user.id}/upload`, formData, {
               headers: { 'Content-Type': 'multipart/form-data' },
            });
            console.log('Upload successful:', response.data);

            // <-- Refresh user data in context after successful upload
            await fetchCurrentUser(); //

        } else {
            console.log('No picture selected, skipping upload.');
            // Proceed without uploading if no file is chosen
        }
        // --- End Upload Logic ---

        resetNewSignupFlag(); // <-- Reset the new signup flag
        navigate('/dashboard'); // Navigate to the main app dashboard

    } catch (err: any) {
      console.error('Upload failed:', err);
      // Display error from backend if available, otherwise generic message
      setError(err.response?.data?.error || 'Upload failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Skip function remains the same
  const handleSkip = () => {
    resetNewSignupFlag(); // <-- Reset the flag when skipping
    navigate('/dashboard');
  };

  return (
    <AuthForm
      title="Set Up Your Profile"
      subtitle="Add a profile picture so others can see you"
      onSubmit={handleSubmit}
      submitText={loading ? "Saving..." : "Save & Continue"}
      loading={loading}
      error={error}
      footer={
         <button
            type="button"
            onClick={handleSkip}
            className="text-gray-600 hover:text-pink-500 font-semibold text-sm"
            disabled={loading} // Disable skip button while loading
          >
            Skip for now
          </button>
      }
    >
      <div className="flex flex-col items-center space-y-4">
        {/* File Preview */}
        <div className="w-40 h-40 rounded-full border-4 border-pink-100 flex items-center justify-center bg-gray-100 overflow-hidden">
          {preview ? (
            <img
              src={preview}
              alt="Profile Preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <UserIcon className="text-gray-400" size={64} />
          )}
        </div>

        {/* File Upload Button */}
        <label
          htmlFor="profilePicture"
          className={`cursor-pointer bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} // Add disabled style
        >
          <UploadCloud size={20} />
          <span>{file ? 'Change Picture' : 'Upload Picture'}</span>
        </label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          className="hidden"
          accept="image/png, image/jpeg, image/webp" // Accepted types
          onChange={handleFileChange}
          disabled={loading} // Disable input while loading
        />
        <p className="text-xs text-gray-500 text-center">
          PNG, JPG, or WEBP. <br /> 5MB max. {/* */}
        </p>
      </div>
    </AuthForm>
  );
};

export default SignupProfile;