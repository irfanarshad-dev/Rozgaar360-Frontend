'use client';
import { useState } from 'react';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import { Upload, X, Check, FileText } from 'lucide-react';
import api from '@/lib/axios';

export default function UploadCNIC({ userId, onUploadSuccess }) {
  const { t } = useTranslation('worker');
  const [files, setFiles] = useState({ front: null, back: null });
  const [previews, setPreviews] = useState({ front: null, back: null });
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [statusType, setStatusType] = useState('');
  const [errors, setErrors] = useState({ front: '', back: '' });

  const handleFileChange = (side, file) => {
    if (file) {
      // Validate file size (2MB limit)
      const maxSize = 2 * 1024 * 1024;
      if (file.size > maxSize) {
        setErrors(prev => ({ ...prev, [side]: t('uploadCnic.fileTooLarge', { defaultValue: 'File size must be less than 2MB' }) }));
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, [side]: t('uploadCnic.fileTypeInvalid', { defaultValue: 'Only JPEG, JPG and PNG files are allowed' }) }));
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
      setStatus(t('uploadCnic.selectBothSides', { defaultValue: 'Please select both sides of CNIC' }));
      setStatusType('error');
      return;
    }

    // Validate file size (2MB limit)
    const maxSize = 2 * 1024 * 1024;
    if (files.front.size > maxSize || files.back.size > maxSize) {
      setStatus(t('uploadCnic.fileMustBeLessThan2mb', { defaultValue: 'File size must be less than 2MB' }));
      setStatusType('error');
      return;
    }

    // Validate file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(files.front.type) || !allowedTypes.includes(files.back.type)) {
      setStatus(t('uploadCnic.fileTypeInvalid', { defaultValue: 'Only JPEG, JPG and PNG files are allowed' }));
      setStatusType('error');
      return;
    }

    setUploading(true);
    setStatus('');
    setStatusType('');
    const formData = new FormData();
    formData.append('cnicFront', files.front);
    formData.append('cnicBack', files.back);

    try {
      await api.post('/api/verification/upload', formData, {
        headers: { 
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds for file upload
      });
      setStatus(t('uploadCnic.uploadSuccess', { defaultValue: 'CNIC uploaded successfully! Verification pending.' }));
      setStatusType('success');
      setFiles({ front: null, back: null });
      setPreviews({ front: null, back: null });
      
      // Notify parent component to refresh profile
      if (onUploadSuccess) {
        setTimeout(() => onUploadSuccess(), 1500);
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMsg = error.response?.data?.message || error.message || t('uploadCnic.uploadFailed', { defaultValue: 'Upload failed. Please try again.' });
      setStatus(errorMsg);
      setStatusType('error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-4">
        {/* Front Side */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('uploadCnic.cnicFront', { defaultValue: 'CNIC Front' })}
          </label>
          
          {!previews.front ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 text-center px-2">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG (max. 2MB)</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('front', e.target.files[0])}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full h-40 border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={previews.front}
                alt="CNIC Front"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={() => handleRemove('front')}
                className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-1.5 shadow-md transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {errors.front && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600">
              <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{errors.front}</span>
            </div>
          )}
        </div>

        {/* Back Side */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('uploadCnic.cnicBack', { defaultValue: 'CNIC Back' })}
          </label>
          
          {!previews.back ? (
            <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <FileText className="w-10 h-10 text-gray-400 mb-2" />
                <p className="text-xs text-gray-500 text-center px-2">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
                <p className="text-xs text-gray-400 mt-1">PNG, JPG (max. 2MB)</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png"
                onChange={(e) => handleFileChange('back', e.target.files[0])}
                className="hidden"
              />
            </label>
          ) : (
            <div className="relative w-full h-40 border-2 border-gray-200 rounded-lg overflow-hidden">
              <Image
                src={previews.back}
                alt="CNIC Back"
                fill
                className="object-cover"
                unoptimized
              />
              <button
                onClick={() => handleRemove('back')}
                className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-700 rounded-full p-1.5 shadow-md transition-colors"
                title="Remove"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
          
          {errors.back && (
            <div className="mt-2 flex items-start gap-2 text-xs text-red-600">
              <X className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{errors.back}</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUpload}
        disabled={uploading || !files.front || !files.back || errors.front || errors.back}
        className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {uploading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>{t('uploadCnic.uploading', { defaultValue: 'Uploading...' })}</span>
          </>
        ) : (
          <>
            <Upload className="w-4 h-4" />
            <span>{t('uploadCnic.uploadButton', { defaultValue: 'Upload CNIC' })}</span>
          </>
        )}
      </button>

      {/* Status Messages */}
      {status && (
        <div className={`mt-4 flex items-start gap-2 text-sm ${
          statusType === 'success' ? 'text-green-600' : 'text-red-600'
        }`}>
          {statusType === 'success' ? (
            <Check className="w-4 h-4 mt-0.5 flex-shrink-0" />
          ) : (
            <X className="w-4 h-4 mt-0.5 flex-shrink-0" />
          )}
          <span>{status}</span>
        </div>
      )}

      {/* Info */}
      <div className="mt-4 space-y-1">
        <p className="text-xs text-gray-500">• Maximum file size: 2 MB per image</p>
        <p className="text-xs text-gray-500">• Supported formats: JPEG, JPG, PNG</p>
        <p className="text-xs text-gray-500">• Both front and back sides are required</p>
      </div>
    </div>
  );
}