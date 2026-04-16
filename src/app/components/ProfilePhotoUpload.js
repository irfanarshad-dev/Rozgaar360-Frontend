'use client';
import { useState } from 'react';
import Image from 'next/image';
import api from '@/lib/axios';

export default function ProfilePhotoUpload({ userId, currentPhoto, onPhotoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      alert('Only JPEG, JPG and PNG files are allowed');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    const formData = new FormData();
    formData.append('profilePhoto', file);

    try {
      const response = await api.post('/api/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPhotoUpdate(response.data.profilePicture);
      alert('Profile photo updated successfully!');
    } catch (error) {
      console.error('Photo upload failed:', error);
      alert('Failed to upload photo. Please try again.');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">Profile Photo</h3>
      
      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <Image
            src={preview || '/default-avatar.png'}
            alt="Profile"
            className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
            height={128}
            width={128}
          />
          {uploading && (
            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        <label className="cursor-pointer bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={uploading}
          />
          {uploading ? 'Uploading...' : 'Change Photo'}
        </label>
        
        <p className="text-sm text-gray-500 text-center">
          Upload a photo (Max 2MB, JPEG/PNG only)
        </p>
      </div>
    </div>
  );
}