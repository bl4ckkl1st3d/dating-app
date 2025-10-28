import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FormInput from '../components/FormInput';
import { UploadCloud, User as UserIcon } from 'lucide-react'; // Import icons

// Removed AppNavbar import as it's handled by AppLayout

const EditProfile: React.FC = () => {
  const { user } = useAuth(); // Get current user data

  // Initialize state with current user data or empty strings
  const [name, setName] = useState(user?.name || '');
  const [bio, setBio] = useState(user?.bio || '');
  // State for file handling
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(user?.profile_picture_url || null); // Show current pic if available

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Handle file selection
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
    setLoading(true);
    setError('');
    setSuccess('');

    // Prepare data - only name and bio are directly editable text fields
    const updatedData = {
      name,
      bio,
    };

    console.log('Updating profile text data:', updatedData);

    // --- TODO: Connect this to the backend ---
    // 1. Update text fields (name, bio) using the existing endpoint:
    //    await api.put(`/users/profile/${user?.id}`, updatedData);

    // 2. If a new file exists, upload it using a separate endpoint (needs creation):
    if (file) {
      console.log('Uploading new profile picture:', file.name);
      // const formData = new FormData();
      // formData.append('profilePicture', file);
      // await api.post(`/users/profile/${user?.id}/upload`, formData, {
      //   headers: { 'Content-Type': 'multipart/form-data' },
      // });
    }
    // --- End TODO ---


    // Simulating API call
    setTimeout(() => {
      setLoading(false);
      setSuccess('Profile updated successfully!');
      // Maybe update the user context here with new data
    }, 1500);
  };

  return (
    <main className="max-w-2xl mx-auto py-8 px-4 pb-20 md:pt-16 md:pb-10">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Edit Profile</h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow border border-gray-200 space-y-6"
      >
        {/* Profile Picture Section */}
        <div className="flex flex-col items-center space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1 w-full text-center">
            Profile Picture
          </label>
          <div className="w-32 h-32 rounded-full border-4 border-pink-100 flex items-center justify-center bg-gray-100 overflow-hidden">
            {preview ? (
              <img
                src={preview}
                alt="Profile Preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon className="text-gray-400" size={48} />
            )}
          </div>
          <label
            htmlFor="profilePicture"
            className="cursor-pointer bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <UploadCloud size={16} />
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
             PNG, JPG, WEBP. 5MB max.
           </p>
        </div>

        {/* Name Input */}
        <FormInput
          label="Full Name"
          type="text"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Age Display (Not Editable) */}
        <div>
           <label className="block text-sm font-medium text-gray-700 mb-1">
             Age
           </label>
           <p className="w-full px-4 py-3 border border-gray-200 bg-gray-50 text-gray-500 rounded-xl">
             {user?.age || 'Not set'} {/* Display current age */}
           </p>
         </div>

        {/* Bio Textarea */}
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

        {/* Error/Success Messages */}
        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
        {success && (
          <div className="text-green-600 text-sm">{success}</div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-pink-500 text-white py-3 rounded-xl font-semibold hover:bg-pink-600 transition-colors disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
};

export default EditProfile;