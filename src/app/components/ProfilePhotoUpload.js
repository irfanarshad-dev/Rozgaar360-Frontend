'use client';
import { useState, useCallback } from 'react';
import Image from 'next/image';
import { Camera, Upload, X, Check, Crop } from 'lucide-react';
import Cropper from 'react-easy-crop';
import api from '@/lib/axios';

const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, 'image/jpeg', 0.95);
  });
};

export default function ProfilePhotoUpload({ userId, currentPhoto, onPhotoUpdate }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(currentPhoto);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [originalFile, setOriginalFile] = useState(null);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

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

    setOriginalFile(file);

    // Show preview for cropping
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageToCrop(e.target.result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropCancel = () => {
    setShowCropModal(false);
    setImageToCrop(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setOriginalFile(null);
  };

  const handleCropConfirm = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      
      // Show preview
      const croppedUrl = URL.createObjectURL(croppedBlob);
      setPreview(croppedUrl);
      setShowCropModal(false);

      // Upload cropped image
      setUploading(true);
      const formData = new FormData();
      formData.append('profilePhoto', croppedBlob, originalFile.name);

      const response = await api.post('/api/users/upload-photo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      onPhotoUpdate(response.data.profilePicture);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      
      // Cleanup
      setImageToCrop(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setOriginalFile(null);
    } catch (error) {
      console.error('Photo upload failed:', error);
      setError('Failed to upload photo. Please try again.');
      setPreview(currentPhoto);
      setShowCropModal(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Crop Modal */}
      {showCropModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Crop Profile Photo</h3>
              <button onClick={handleCropCancel} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="relative w-full h-96 bg-gray-100 rounded-lg overflow-hidden">
                <Cropper
                  image={imageToCrop}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zoom
                </label>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={handleCropCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCropConfirm}
                disabled={uploading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Apply & Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
        </div>

        {/* Upload button and info */}
        <div className="flex-1">
          <label className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            <Crop className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload & Crop photo'}</span>
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
            <p className="text-xs text-gray-500">• You can crop and adjust your photo before uploading</p>
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