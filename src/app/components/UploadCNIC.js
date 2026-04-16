'use client';
import { useState } from 'react';
import api from '@/lib/axios';
import { X } from 'lucide-react';

export default function UploadCNIC({ userId, onUploadSuccess }) {
  const [files, setFiles] = useState({ front: null, back: null });
  const [previews, setPreviews] = useState({ front: null, back: null });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [errors, setErrors] = useState({ front: '', back: '' });

  const handleFileChange = (side, file) => {
    if (file) {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [side]: 'File size exceeds 2MB limit' }));
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [side]: 'Only JPEG, JPG and PNG files are allowed' }));
        return;
      }

      // Clear error for this side
      setErrors(prev => ({ ...prev, [side]: '' }));
      setFiles(prev => ({ ...prev, [side]: file }));
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({ ...prev, [side]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = (side) => {
    setFiles(prev => ({ ...prev, [side]: null }));
    setPreviews(prev => ({ ...prev, [side]: null }));
    setErrors(prev => ({ ...prev, [side]: '' }));
  };

  const handleUpload = async () => {
    if (!files.front || !files.back) {
      alert('Please select both front and back images');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (files.front.size > maxSize || files.back.size > maxSize) {
      setStatus('File size must be less than 2MB');
      return;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(files.front.type) || !allowedTypes.includes(files.back.type)) {
      setStatus('Only JPEG, JPG and PNG files are allowed');
      return;
    }

    setUploading(true);
    setStatus('');
    const formData = new FormData();
    formData.append('cnicFront', files.front);
    formData.append('cnicBack', files.back);

    try {
      const response = await api.post('/api/verification/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds for file upload
      });
      setStatus('CNIC uploaded successfully! Verification pending.');
      setFiles({ front: null, back: null });
      setPreviews({ front: null, back: null });
      
      // Notify parent component to refresh profile
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Upload failed. Please try again.';
      setStatus(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h3 className="text-xl font-semibold mb-4">CNIC Verification {/* شناختی کارڈ کی تصدیق */}</h3>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">CNIC Front {/* شناختی کارڈ کا اگلا حصہ */}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('front', e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {errors.front && (
            <p className="mt-1 text-xs text-red-600">{errors.front}</p>
          )}
          {previews.front && (
            <div className="relative mt-2">
              <img src={previews.front} alt="CNIC Front" className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => handleRemove('front')}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">CNIC Back {/* شناختی کارڈ کا پچھلا حصہ */}</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => handleFileChange('back', e.target.files[0])}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          {errors.back && (
            <p className="mt-1 text-xs text-red-600">{errors.back}</p>
          )}
          {previews.back && (
            <div className="relative mt-2">
              <img src={previews.back} alt="CNIC Back" className="w-full h-32 object-cover rounded-lg" />
              <button
                onClick={() => handleRemove('back')}
                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-colors"
                title="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={uploading || !files.front || !files.back || errors.front || errors.back}
        className="mt-4 w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? 'Uploading...' : 'Upload CNIC'} {/* اپ لوڈ کیا جا رہا ہے */}
      </button>

      {status && (
        <p className={`mt-2 text-sm ${status.includes('success') ? 'text-green-600' : 'text-red-600'}`}>
          {status}
        </p>
      )}
    </div>
  );
}