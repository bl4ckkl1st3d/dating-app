import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm';
import { UploadCloud, User as UserIcon } from 'lucide-react'; // Assuming lucide-react is installed
import { useAuth } from '../context/AuthContext';
// import api from '../lib/api'; // You would use this for the actual upload

const SignupProfile: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // const { user } = useAuth(); // Get user context if needed for the API call

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
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
    if (!file) {
      setError('Please select a picture to upload.');
      return;
    }
    setError('');
    setLoading(true);

    // -----------------------------------------------------------------
    // TODO: Implement actual API upload logic
    // -----------------------------------------------------------------
    // The backend currently doesn't have an endpoint for file uploads.
    // When it does, the logic would look something like this:
    //
    // const formData = new FormData();
    // formData.append('profilePicture', file);
    //
    // try {
    //   // You would need to create this endpoint
    //   // The 'user.controller.js' only handles text fields for updates.
    //   // You'd also need to update 'user.routes.js'
    //   const response = await api.post(`/users/profile/${user.id}/upload`, formData, {
    //     headers: { 'Content-Type': 'multipart/form-data' },
    //   });
    //   console.log('Upload successful:', response.data);
    //   navigate('/dashboard'); // Navigate to the main app
    // } catch (err: any) {
    //   console.error('Upload failed:', err);
    //   setError(err.response?.data?.error || 'Upload failed. Please try again.');
    // } finally {
    //   setLoading(false);
    // }
    // -----------------------------------------------------------------

    // Simulating upload for now
    console.log('Simulating upload of:', file.name);
    setTimeout(() => {
      setLoading(false);
      console.log('Upload complete, navigating to home.');
      navigate('/'); // Navigate to home/dashboard
    }, 1500);
  };

  return (
    <AuthForm
      title="Set Up Your Profile"
      subtitle="Add a profile picture so others can see you"
      onSubmit={handleSubmit}
      submitText="Save & Continue"
      loading={loading}
      error={error}
      footer={
        <p>
          <Link to="/" className="text-gray-600 hover:text-pink-500 font-semibold">
          </Link>
        </p>
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
          className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2"
        >
          <UploadCloud size={20} />
          <span>{file ? 'Change Picture' : 'Upload Picture'}</span>
        </label>
        <input
          type="file"
          id="profilePicture"
          name="profilePicture"
          className="hidden"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
        />
        <p className="text-xs text-gray-500 text-center">
          PNG, JPG, or WEBP. <br /> 5MB max.
        </p>
      </div>
    </AuthForm>
  );
};

export default SignupProfile;