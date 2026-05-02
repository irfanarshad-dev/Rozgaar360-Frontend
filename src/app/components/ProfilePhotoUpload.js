'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Check } from 'lucide-react';
import api from '@/lib/axios';

export default function ProfilePhotoUpload({ userId, currentPhoto, onPhotoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setSuccess(false);

    // Validate file
    if (file.size > 2 * 1024 * 1024) {
      setError('File size must be less than 2MB');
      return;
    }

    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setError('Only JPEG, JPG and PNG files are allowed');
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
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Photo upload failed:', error);
      setError('Failed to upload photo. Please try again.');
      setPreview(currentPhoto);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Google-style card header */}
      <div className="mb-6">
        <h3 className="text-xl font-normal text-gray-900">Profile photo</h3>
        <p className="text-sm text-gray-600 mt-1">A photo helps personalize your account</p>
      </div>

      {/* Photo preview section */}
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
            {preview ? (
              <Image
                src={preview}
                alt="Profile"
                className="w-full h-full object-cover"
                height={96}
                width={96}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600">
                <span className="text-3xl font-bold text-white">
                  {userId?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
          
          {/* Upload overlay */}
          <label className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-8 h-8 text-white" />
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>

          {/* Loading spinner */}
          {uploading && (
            <div className="absolute inset-0 bg-white/90 rounded-full flex items-center justify-center">
              <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
        </div>

        {/* Upload button and info */}
        <div className="flex-1">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileChange}
              className="hidden"
              disabled={uploading}
            />
          </label>
          
          <div className="mt-3 space-y-1">
            <p className="text-xs text-gray-500">• Maximum file size: 2 MB</p>
            <p className="text-xs text-gray-500">• Supported formats: JPEG, JPG, PNG</p>
          </div>

          {/* Success message */}
          {success && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="w-4 h-4" />
              <span>Photo updated successfully</span>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mt-3 flex items-start gap-2 text-sm text-red-600">
              <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}