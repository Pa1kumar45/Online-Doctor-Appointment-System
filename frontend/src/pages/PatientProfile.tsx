/**
 * PatientProfile Component
 * 
 * Complete profile management page for patients.
 * Allows patients to update their personal and medical information.
 * 
 * Features:
 * - Edit personal information (name, email, contact)
 * - Update medical details (DOB, gender, blood group, allergies)
 * - Manage emergency contacts (add/remove multiple)
 * - Upload/update profile avatar
 * - Age auto-calculation from DOB
 * - 18+ age validation
 * - Change password
 * - Form validation
 * - Image preview
 * - Dark mode support
 * 
 * Emergency Contacts:
 * - Multiple emergency contacts support
 * - Name, relationship, and phone number fields
 * - Add/remove functionality
 * 
 * @component
 * @example
 * return (
 *   <PatientProfile />
 * )
 */

import React, { useState, useEffect, useRef } from 'react';
import { User, Mail, Calendar, Phone, Droplet, AlertCircle, Plus, Trash2, Image, Upload } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ChangePasswordForm from '../components/ChangePasswordForm';
import { Patient, EmergencyContact } from '../types/index.ts';
import { apiService } from '../services/api.service';
import { useApp } from '../context/AppContext';
import { uploadService } from '../services/upload.service';

/**
 * Form data interface for patient profile
 */
interface PatientFormData {
  name: string;
  email: string;
  avatar: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | '';
  role: string;
  bloodGroup: string;
  allergies: string;
  contactNumber: string;
  emergencyContact: EmergencyContact[];
}

/**
 * Calculate age from date of birth
 * 
 * Computes current age based on birth date,
 * accounting for month and day differences.
 * 
 * @param {string} dateOfBirth - Date of birth in ISO format
 * @returns {number} Calculated age in years
 */
const calculateAge = (dateOfBirth: string): number => {
  if (!dateOfBirth) return 0;
  
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Get minimum date for 18+ validation (18 years ago from today)
 * 
 * Calculates the maximum birth date that allows user to be 18 years old.
 * Used for form validation to ensure adults-only registration.
 * 
 * @returns {string} Date string in YYYY-MM-DD format
 */
const getMinDateFor18Plus = (): string => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 18);
  return date.toISOString().split('T')[0];
};

const PatientProfile = () => {
  const { currentUser, setCurrentUser } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<PatientFormData | null>({
    name: '',
    email: '',
    avatar: '',
    dateOfBirth: '',
    role: 'patient',
    gender: '',
    bloodGroup: '',
    allergies: '',
    contactNumber: '',
    emergencyContact: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Fetch and initialize patient profile data
   * 
   * Loads current patient's profile and initializes form with existing data.
   * Only accessible to users with 'patient' role.
   */
  useEffect(() => {
    const fetchPatientProfile = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Only allow patients to access this page
        if (currentUser?.role === 'doctor' || currentUser?.role === 'admin' || currentUser?.role === 'super_admin') {
          return;
        }

        if (currentUser?.role === 'patient') {
          const patientUser = currentUser as Patient;
          const initialFormData: PatientFormData = {
            name: patientUser.name || '',
            email: patientUser.email || '',
            avatar: patientUser.avatar || '',
            dateOfBirth: patientUser.dateOfBirth || '',
            role: patientUser.role || 'patient',
            gender: patientUser.gender || '',
            bloodGroup: patientUser.bloodGroup || '',
            allergies: patientUser.allergies || '',
            contactNumber: patientUser.contactNumber || '',
            emergencyContact: patientUser.emergencyContact || []
          };
          
          setFormData(initialFormData);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
        setError('Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatientProfile();
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    
    const { name, value } = e.target;

    // For contact number, only allow digits and limit to 10 characters
    if (name === 'contactNumber') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        setFormData(prev => ({ ...prev!, [name]: digits }));
      }
      return;
    }
    
    setFormData(prev => ({
      ...prev!,
      [name]: value
    }));
  };

  const handleEmergencyContactChange = (index: number, field: keyof EmergencyContact, value: string) => {
    if (!formData) return;

    const updatedContacts = [...formData.emergencyContact];

    // For emergency contact phone, only allow digits and limit to 10 characters
    if (field === 'phone') {
      const digits = value.replace(/\D/g, '');
      if (digits.length <= 10) {
        updatedContacts[index] = { ...updatedContacts[index], [field]: digits };
      } else {
        return;
      }
    } else {
      updatedContacts[index] = { ...updatedContacts[index], [field]: value };
    }

    setFormData(prev => ({
      ...prev!,
      emergencyContact: updatedContacts
    }));
  };

  const addEmergencyContact = () => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      emergencyContact: [
        ...prev!.emergencyContact,
        { name: '', relationship: '', phone: '' }
      ]
    }));
  };

  const removeEmergencyContact = (index: number) => {
    if (!formData) return;

    setFormData(prev => ({
      ...prev!,
      emergencyContact: prev!.emergencyContact.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    // Validate date of birth and age
    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age < 18) {
        setError('You must be at least 18 years old to use this platform');
        return;
      }
    }

    // Validate contact number is exactly 10 digits
    if (formData.contactNumber && formData.contactNumber.length !== 10) {
      setError('Contact number must be exactly 10 digits');
      return;
    }

    // Validate emergency contact phone numbers are exactly 10 digits
    for (let i = 0; i < formData.emergencyContact.length; i++) {
      const phone = formData.emergencyContact[i].phone;
      if (phone && phone.length !== 10) {
        setError(`Emergency contact ${i + 1} phone number must be exactly 10 digits`);
        return;
      }
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);

      // Create a new object with all the form data
      const submitData = {
        ...currentUser,
        ...formData,
        emergencyContact: formData.emergencyContact
      };

      const UpdatedData = await apiService.updatePatientProfile(submitData as Patient);
      const updatedData=UpdatedData;

      // Update both currentUser and formData with the complete data
      setCurrentUser(UpdatedData);

      // Create a new form data object with all required fields
      const newFormData: PatientFormData = {
        name: updatedData.name || '',
        email: updatedData.email || '',
        avatar: updatedData.avatar || '',
        dateOfBirth: updatedData.dateOfBirth || '',
        role: updatedData.role || 'patient',
        gender: updatedData.gender || '',
        bloodGroup: updatedData.bloodGroup || '',
        allergies: updatedData.allergies || '',
        contactNumber: updatedData.contactNumber || '',
        emergencyContact: formData.emergencyContact
      };
      
      setFormData(newFormData);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    try {
      setIsUploading(true);
      const url = await uploadService.uploadAvatar(file);
      setFormData(prev => ({ ...prev!, avatar: url }));
      setSuccess('Profile picture uploaded. Don\'t forget to save changes.');
    } catch (err: unknown) {
      console.error('Avatar upload failed:', err);
      setUploadError('Failed to upload image. Please try a different file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    if (!formData) return;
    setUploadError(null);
    setFormData(prev => ({ ...prev!, avatar: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSuccess('Profile picture removed. Don\'t forget to save changes.');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!currentUser && !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="p-4 text-center text-red-600 dark:text-red-400">
          Please login to access your profile
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-400 text-red-700 shadow-sm" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {success && (
        <div className="mb-6 p-4 rounded-lg bg-green-50 border border-green-400 text-green-700 shadow-sm" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center space-x-6">
              {formData?.avatar ? (
                <img
                  src={formData.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 dark:border-blue-900"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold border-4 border-blue-100 dark:border-blue-900">
                  {formData?.name?.charAt(0).toUpperCase() || 'P'}
                </div>
              )}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formData?.name}
                </h1>
                <p className="text-lg text-blue-600 dark:text-blue-400 mt-1">
                  Patient Profile
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <label className=" text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData?.name}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Mail size={18} className="text-blue-500" /> Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData?.email}
                    onChange={handleChange}
                    disabled
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm bg-gray-50 dark:bg-gray-600 dark:border-gray-600 dark:text-gray-300 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Calendar size={18} className="text-blue-500" /> Date of Birth
                    {formData?.dateOfBirth && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        (Age: {calculateAge(formData.dateOfBirth)} years)
                      </span>
                    )}
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData?.dateOfBirth}
                    onChange={handleChange}
                    max={getMinDateFor18Plus()}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                  {formData?.dateOfBirth && calculateAge(formData.dateOfBirth) < 18 && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      You must be at least 18 years old
                    </p>
                  )}
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <User size={18} className="text-blue-500" /> Gender
                  </label>
                  <select
                    name="gender"
                    value={formData?.gender}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  >
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Droplet size={18} className="text-blue-500" /> Blood Group
                  </label>
                  <select
                    name="bloodGroup"
                    value={formData?.bloodGroup}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  >
                    <option value="">Select Blood Group</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                  </select>
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Phone size={18} className="text-blue-500" /> Contact Number
                  </label>
                  <input
                    type="tel"
                    name="contactNumber"
                    value={formData?.contactNumber}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <AlertCircle size={18} className="text-blue-500" /> Allergies
                  </label>
                  <input
                    type="text"
                    name="allergies"
                    value={formData?.allergies}
                    onChange={handleChange}
                    placeholder="Enter allergies (if any)"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                  />
                </div>

                <div>
                  <label className="  text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <Image size={18} className="text-blue-500" /> Profile Picture
                  </label>
                  <input
                    id="patient-avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileChange}
                    className="hidden"
                    ref={fileInputRef}
                  />
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="patient-avatar"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <Upload size={16} />
                      Upload image
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveAvatar}
                      disabled={!formData?.avatar || isUploading}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 disabled:opacity-50"
                    >
                      Remove image
                    </button>
                  </div>
                  {isUploading && (
                    <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">Uploading image...</p>
                  )}
                  {uploadError && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                  )}
                  
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Phone size={20} className="text-blue-500" /> Emergency Contacts
                </h3>
                <button
                  type="button"
                  onClick={addEmergencyContact}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                >
                  <Plus size={16} /> Add Contact
                </button>
              </div>

              {formData?.emergencyContact.map((contact, index) => (
                <div key={index} className="p-6 border rounded-xl dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={contact.name}
                        onChange={(e) => handleEmergencyContactChange(index, 'name', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Relationship
                      </label>
                      <input
                        type="text"
                        value={contact.relationship}
                        onChange={(e) => handleEmergencyContactChange(index, 'relationship', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={contact.phone}
                        onChange={(e) => handleEmergencyContactChange(index, 'phone', e.target.value)}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeEmergencyContact(index)}
                    className="mt-2 px-3 py-2 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 size={16} /> Remove Contact
                  </button>
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? <LoadingSpinner /> : 'Save Changes'}
            </button>
          </form>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="mt-8">
        <ChangePasswordForm 
          onSuccess={() => {
            setSuccess('Password changed successfully! Please use your new password for future logins.');
            setTimeout(() => setSuccess(null), 5000);
          }}
        />
      </div>
    </div>
  );
};

export default PatientProfile;
