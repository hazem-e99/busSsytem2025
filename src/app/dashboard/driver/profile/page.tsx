'use client';

import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { 
  User,
  Mail,
  Phone,
  Shield,
  Edit3,
  Save,
  X,
  Car,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Upload,
  Eye,
  EyeOff,
  MapPin
} from 'lucide-react';
import { userAPI } from '@/lib/api';
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useI18n } from '@/contexts/LanguageContext';
import { formatDate } from '@/lib/format';

interface DriverProfile {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  profilePictureUrl: string;
  status: string;
  role: string;
  licenseNumber?: string;
}

export default function DriverProfile() {
  const { t, lang } = useI18n();
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [showSensitiveData, setShowSensitiveData] = useState(false);
  // const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    licenseNumber: ''
  });

  // Fetch driver profile data from /api/Users/profile
  const fetchDriverProfile = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Fetching driver profile from /api/Users/profile...');
      
      const response = await userAPI.getCurrentUserProfile();
      console.log('📊 Driver data loaded:', response);
      
      if (response) {
        const driverData: DriverProfile = {
          id: parseInt(response.id) || 0,
          firstName: response.firstName || '',
          lastName: response.lastName || '',
          email: response.email || '',
          phoneNumber: response.phoneNumber || '',
          nationalId: response.nationalId || '',
          profilePictureUrl: response.profilePictureUrl || '/avatar-placeholder.svg',
          status: response.status || 'Active',
          role: response.role || 'Driver',
          licenseNumber: response.licenseNumber || ''
        };
        
        setDriver(driverData);
        setFormData({
          firstName: driverData.firstName,
          lastName: driverData.lastName,
          email: driverData.email,
          phoneNumber: driverData.phoneNumber,
          licenseNumber: driverData.licenseNumber || ''
        });
        
        setLastRefresh(new Date());
        console.log('✅ Driver profile loaded successfully');
      }
    } catch (error) {
      console.error('❌ Failed to fetch driver profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDriverProfile();
  }, []);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      
      // Validate form data
      const trimmedData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phoneNumber.trim(),
        licenseNumber: formData.licenseNumber.trim()
      };

      // Check if at least one field is provided
      if (!trimmedData.firstName && !trimmedData.lastName && !trimmedData.email && !trimmedData.phoneNumber && !trimmedData.licenseNumber) {
        alert(t('pages.driver.profile.alerts.fillOne'));
        return;
      }

      // Validate name lengths
      if (trimmedData.firstName && (trimmedData.firstName.length < 2 || trimmedData.firstName.length > 50)) {
        alert(t('pages.driver.profile.alerts.firstNameLength'));
        return;
      }

      if (trimmedData.lastName && (trimmedData.lastName.length < 2 || trimmedData.lastName.length > 50)) {
        alert(t('pages.driver.profile.alerts.lastNameLength'));
        return;
      }

      // Validate email format
      if (trimmedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedData.email)) {
        alert(t('pages.driver.profile.alerts.invalidEmail'));
        return;
      }

      // Validate license number format (8-10 digits)
      if (trimmedData.licenseNumber && !/^\d{8,10}$/.test(trimmedData.licenseNumber)) {
        alert(t('pages.driver.profile.alerts.licenseNumberFormat'));
        return;
      }

      console.log('💾 Saving driver profile to /api/Users/driver-profile...');
      
      const response = await userAPI.updateDriverProfile(trimmedData);
      
      if (response) {
        setIsEditing(false);
        await fetchDriverProfile();
        setLastRefresh(new Date());
        
        // Dispatch events to update other components
        window.dispatchEvent(new StorageEvent('storage'));
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        alert(t('pages.driver.profile.alerts.updated'));
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert(t('pages.driver.profile.alerts.updateFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  // Handle cancel edit
  const handleCancelEdit = () => {
    if (driver) {
      setFormData({
        firstName: driver.firstName,
        lastName: driver.lastName,
        email: driver.email,
        phoneNumber: driver.phoneNumber,
        licenseNumber: driver.licenseNumber || ''
      });
    }
    setIsEditing(false);
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(t('pages.driver.profile.alerts.selectImage'));
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('pages.driver.profile.alerts.imageTooLarge'));
      return;
    }

    try {
      setIsUploadingImage(true);
      console.log('📸 Uploading new avatar to /api/Users/update-profile-picture...');
      
      const response = await userAPI.updateProfilePicture(file);
      
      if (response) {
        // Re-fetch profile data to get updated image
        await fetchDriverProfile();
        setLastRefresh(new Date());
        
        // Dispatch events to update other components
        window.dispatchEvent(new StorageEvent('storage'));
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
        alert(t('pages.driver.profile.alerts.pictureUpdated'));
      }
    } catch (error) {
      console.error('Failed to update profile picture:', error);
      alert(t('pages.driver.profile.alerts.pictureUpdateFailed'));
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Build image URL helper
  const buildImageUrl = (imagePath: string | undefined): string => {
    if (!imagePath) return '/logo2.png';
    if (imagePath.includes('example.com/default-profile.png')) return '/logo2.png';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return `/api/image-proxy?url=${encodeURIComponent(imagePath)}`;
    }
    
    // If it's a relative path, make it absolute
    if (imagePath.startsWith('/')) {
      if (imagePath.startsWith('/uploads')) {
        return `/api/image-proxy?url=${encodeURIComponent(`https://api.el-renad.com${imagePath}`)}`;
      }
      return `/api/image-proxy?url=${encodeURIComponent(`https://api.el-renad.com/api${imagePath}`)}`;
    }
    
    // If it's just a filename, assume it's in uploads folder
    return `/api/image-proxy?url=${encodeURIComponent(`https://api.el-renad.com/uploads/${imagePath}`)}`;
  };

  // Get avatar display
  const getAvatarDisplay = () => {
    if (driver?.profilePictureUrl) {
      return (
        <Image
          src={buildImageUrl(driver.profilePictureUrl)}
          alt={t('pages.driver.profile.header.alt', 'Profile')}
          fill
          sizes="80px"
          className="object-cover rounded-full"
          unoptimized
          onError={(e) => {
            const img = e.target as HTMLImageElement;
            img.src = '/logo2.png';
          }}
        />
      );
    }
    return (
      <Image src="/logo2.png" alt="Profile" fill unoptimized className="object-cover rounded-full" />
    );
  };

  // Mask sensitive data
  const maskData = (data: string, visibleChars: number = 4) => {
    if (!data || data.length <= visibleChars) return data;
    return '*'.repeat(data.length - visibleChars) + data.slice(-visibleChars);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <div className="flex items-center justify-between">
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded w-64"></div>
                  <div className="h-4 bg-gray-200 rounded w-96"></div>
                </div>
                <div className="flex gap-3">
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                  <div className="h-10 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            </div>
            
            {/* Content Skeleton */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1">
                <div className="bg-white rounded-2xl shadow-xl p-8 h-96"></div>
              </div>
              <div className="xl:col-span-2">
                <div className="bg-white rounded-2xl shadow-xl p-8 h-96"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!driver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-12 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('pages.driver.profile.notFound.title')}</h1>
          <p className="text-gray-600 mb-6">{t('pages.driver.profile.notFound.message')}</p>
          <Button onClick={fetchDriverProfile} className="bg-blue-600 hover:bg-blue-700">
            <RefreshCw className="w-4 h-4 mr-2" />
            {t('pages.driver.profile.notFound.tryAgain', t('common.tryAgain'))}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Modern Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                {getAvatarDisplay()}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    {driver.firstName} {driver.lastName}
                  </h1>
                  <Badge className="bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border-blue-200">
                    <Car className="w-3 h-3 mr-1" />
                    {t('roles.driver', driver.role)}
                  </Badge>
                </div>
                <p className="text-gray-600 text-lg">{t('pages.driver.profile.header.driverTitle')}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    {(() => {
                      const s = driver.status?.toLowerCase();
                      const key = s === 'active' ? 'active' : s === 'inactive' ? 'inactive' : undefined;
                      return key ? t(`common.status.${key}`) : driver.status;
                    })()}
                  </span>
                  <span>•</span>
                  <span>
                    {t('pages.driver.profile.header.lastUpdated')}: {formatDate(lang, lastRefresh, { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row flex-wrap gap-3 w-full lg:w-auto">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg w-full sm:w-auto"
              >
                {isUploadingImage ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 mr-2" />
                )}
                {isUploadingImage ? t('pages.driver.profile.header.uploading', t('common.loading')) : t('pages.driver.profile.header.changePhoto')}
              </Button>
              <Button
                onClick={() => setIsEditing(!isEditing)}
                className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white shadow-lg w-full sm:w-auto"
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {isEditing ? t('pages.driver.profile.header.cancelEdit') : t('pages.driver.profile.header.editProfile')}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* Profile Overview Card */}
          <div className="xl:col-span-1">
            <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MapPin className="w-5 h-5" />
                  {t('pages.driver.profile.overview.title')}
                </CardTitle>
                <CardDescription className="text-blue-100">
                  {t('pages.driver.profile.overview.description')}
                </CardDescription>
              </div>
              <CardContent className="p-6 space-y-6">
                
                {/* Avatar Section */}
                <div className="flex justify-center">
                  <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl">
                    {getAvatarDisplay()}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="text-center">
                  <Badge className={`px-4 py-2 text-sm font-medium ${
                    driver.status === 'Active' 
                      ? 'bg-green-100 text-green-800 border-green-200' 
                      : 'bg-red-100 text-red-800 border-red-200'
                  }`}>
                    <div className={`w-2 h-2 rounded-full mr-2 ${
                      driver.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                    }`}></div>
                    {(() => {
                      const s = driver.status?.toLowerCase();
                      const key = s === 'active' ? 'active' : s === 'inactive' ? 'inactive' : undefined;
                      return key ? t(`common.status.${key}`) : driver.status;
                    })()}
                  </Badge>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">{t('pages.driver.profile.overview.userId')}</span>
                    <span className="font-mono text-sm font-bold text-gray-900">#{driver.id}</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">{t('pages.driver.profile.overview.licenseNumber')}</span>
                    <span className="font-mono text-sm font-bold text-gray-900">
                      {driver.licenseNumber || t('common.na')}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-600">{t('pages.driver.profile.overview.roleLevel')}</span>
                    <Badge className="bg-blue-100 text-blue-800">
                      <Car className="w-3 h-3 mr-1" />
                      {t('pages.driver.profile.overview.roleDriver', t('roles.driver'))}
                    </Badge>
                  </div>
                </div>

                {/* Security Info */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-blue-600" />
                    {t('pages.driver.profile.overview.securityInfo')}
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{t('pages.driver.profile.overview.nationalId')}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm">
                          {showSensitiveData ? driver.nationalId : maskData(driver.nationalId)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSensitiveData(!showSensitiveData)}
                          className="p-1 h-auto"
                        >
                          {showSensitiveData ? (
                            <EyeOff className="w-3 h-3" />
                          ) : (
                            <Eye className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information Card */}
          <div className="xl:col-span-2">
            <Card className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
                <CardTitle className="flex items-center gap-2 text-white">
                  <User className="w-5 h-5" />
                  {t('pages.driver.profile.personal.title')}
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  {t('pages.driver.profile.personal.description')}
                </CardDescription>
              </div>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('pages.driver.profile.personal.firstName')}
                    </label>
                    <div className="relative">
                      <Input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={t('pages.driver.profile.personal.placeholders.firstName')}
                        className={`transition-all duration-200 ${
                          isEditing 
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('pages.driver.profile.personal.lastName')}
                    </label>
                    <div className="relative">
                      <Input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={t('pages.driver.profile.personal.placeholders.lastName')}
                        className={`transition-all duration-200 ${
                          isEditing 
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <User className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('pages.driver.profile.personal.email')}
                    </label>
                    <div className="relative">
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={t('pages.driver.profile.personal.placeholders.email')}
                        className={`transition-all duration-200 ${
                          isEditing 
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('pages.driver.profile.personal.phone')}
                    </label>
                    <div className="relative">
                      <Input
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={t('pages.driver.profile.personal.placeholders.phone')}
                        className={`transition-all duration-200 ${
                          isEditing 
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* License Number */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      {t('pages.driver.profile.personal.licenseNumber')}
                    </label>
                    <div className="relative">
                      <Input
                        name="licenseNumber"
                        value={formData.licenseNumber}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        placeholder={t('pages.driver.profile.personal.placeholders.licenseNumber')}
                        className={`transition-all duration-200 ${
                          isEditing 
                            ? 'border-blue-300 focus:border-blue-500 focus:ring-blue-500' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      />
                      {isEditing && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <Shield className="w-4 h-4 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {isEditing && (
                      <p className="text-xs text-gray-500 mt-1">
                        {t('pages.driver.profile.alerts.licenseNumberFormat')}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex gap-4 pt-6 mt-6 border-t border-gray-200">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg flex-1"
                    >
                      {isSaving ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t('common.saving')}
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          {t('common.saveChanges')}
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      className="flex-1 border-gray-300 hover:bg-gray-50"
                    >
                      <X className="w-4 h-4 mr-2" />
                      {t('common.cancel')}
                    </Button>
                  </div>
                )}

                {/* Info Footer */}
                <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Car className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-900 mb-1">{t('pages.driver.profile.footer.title')}</h4>
                      <p className="text-sm text-blue-700">{t('pages.driver.profile.footer.message')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}