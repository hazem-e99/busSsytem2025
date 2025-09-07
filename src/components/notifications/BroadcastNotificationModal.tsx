'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { 
  X, 
  Send, 
  Users, 
  Megaphone,
  AlertTriangle,
  Calendar,
  Bus,
  Bell
} from 'lucide-react';
import { BroadcastNotificationDTO, NotificationType } from '@/types/notification';
import { userAPI } from '@/lib/api';

interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface BroadcastNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (data: BroadcastNotificationDTO) => Promise<void>;
  isLoading?: boolean;
}

type TargetType = 'all' | 'role' | 'specific';

export function BroadcastNotificationModal({
  isOpen,
  onClose,
  onSend,
  isLoading = false
}: BroadcastNotificationModalProps) {
  const [formData, setFormData] = useState<BroadcastNotificationDTO>({
    title: '',
    message: '',
    type: NotificationType.System,
    userIds: null
  });
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [selectedRole, setSelectedRole] = useState<string>('student');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    if (isOpen && (targetType === 'specific' || targetType === 'role')) {
      loadUsers();
    }
  }, [isOpen, targetType]);

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      // Load all users for selection
      const response = await userAPI.getAll();
      const transformedUsers = (response || []).map((user: any) => ({
        id: parseInt(user.id),
        name: user.name || user.fullName || '',
        email: user.email || '',
        role: user.role || ''
      }));
      setUsers(transformedUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleSend = async () => {
    if (!formData.title.trim() || !formData.message.trim()) {
      return;
    }

    let userIds: number[] | null = null;
    
    if (targetType === 'specific') {
      userIds = selectedUsers;
    } else if (targetType === 'role') {
      userIds = users.filter(user => user.role === selectedRole).map(user => user.id);
    }

    const broadcastData: BroadcastNotificationDTO = {
      ...formData,
      userIds
    };

    await onSend(broadcastData);
    
    // Reset form
    setFormData({
      title: '',
      message: '',
      type: NotificationType.System,
      userIds: null
    });
    setTargetType('all');
    setSelectedRole('student');
    setSelectedUsers([]);
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Alert:
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case NotificationType.Announcement:
        return <Megaphone className="w-5 h-5 text-blue-500" />;
      case NotificationType.Reminder:
        return <Calendar className="w-5 h-5 text-yellow-500" />;
      case NotificationType.Booking:
        return <Bus className="w-5 h-5 text-green-500" />;
      case NotificationType.System:
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const isFormValid = formData.title.trim() && 
    formData.message.trim() && 
    (targetType === 'all' || targetType === 'role' || selectedUsers.length > 0);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Broadcast Notification</h3>
              <p className="text-sm text-gray-600">Send notifications to users</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <Input
              placeholder="Enter notification title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              maxLength={200}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.title.length}/200 characters
            </p>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter notification message"
              value={formData.message}
              onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {formData.message.length}/1000 characters
            </p>
          </div>

          {/* Type and Target */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notification Type
              </label>
              <Select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as NotificationType }))}
                options={[
                  { value: NotificationType.System, label: 'System' },
                  { value: NotificationType.Alert, label: 'Alert' },
                  { value: NotificationType.Announcement, label: 'Announcement' },
                  { value: NotificationType.Reminder, label: 'Reminder' },
                  { value: NotificationType.Booking, label: 'Booking' },
                ]}
              />
            </div>

            {/* Target */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Audience
              </label>
              <Select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value as TargetType)}
                options={[
                  { value: 'all', label: 'All Users' },
                  { value: 'role', label: 'By Role' },
                  { value: 'specific', label: 'Specific Users' },
                ]}
              />
            </div>
          </div>

          {/* Role Selection */}
          {targetType === 'role' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Role
              </label>
              <Select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                options={[
                  { value: 'student', label: 'Students' },
                  { value: 'driver', label: 'Drivers' },
                  { value: 'supervisor', label: 'Supervisors' },
                  { value: 'movement-manager', label: 'Movement Managers' },
                  { value: 'admin', label: 'Admins' },
                ]}
              />
              <p className="text-xs text-gray-500 mt-1">
                Will send to all users with the selected role
              </p>
            </div>
          )}

          {/* User Selection */}
          {targetType === 'specific' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Users ({selectedUsers.length} selected)
              </label>
              {loadingUsers ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-sm text-gray-600">Loading users...</p>
                </div>
              ) : (
                <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2 space-y-1">
                  {users.map(user => (
                    <label
                      key={user.id}
                      className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers(prev => [...prev, user.id]);
                          } else {
                            setSelectedUsers(prev => prev.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="font-medium">
                        {user.name || 'Unknown User'}
                      </span>
                      <span className="text-xs text-gray-500">
                        ({user.role})
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Preview */}
          <div className="p-3 bg-gray-50 rounded-lg border">
            <div className="flex items-center gap-2 mb-2">
              {getTypeIcon(formData.type)}
              <span className="text-sm font-medium text-gray-700">Preview</span>
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-gray-900 text-sm">
                  {formData.title || 'Notification Title'}
                </h4>
                <Badge className="text-xs">
                  {formData.type}
                </Badge>
              </div>
              <p className="text-xs text-gray-700">
                {formData.message || 'Notification message will appear here...'}
              </p>
              <p className="text-xs text-gray-500">
                Target: {
                  targetType === 'all' ? 'All Users' : 
                  targetType === 'role' ? `All ${selectedRole}s` :
                  `${selectedUsers.length} selected users`
                }
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t">
          <Button variant="outline" onClick={onClose} size="sm">
            Cancel
          </Button>
          <Button
            onClick={handleSend}
            disabled={!isFormValid || isLoading}
            className="bg-primary hover:bg-primary-hover"
            size="sm"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                Send
              </>
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
