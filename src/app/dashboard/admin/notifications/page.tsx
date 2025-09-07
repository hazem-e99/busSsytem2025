'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle2, RefreshCw, Send, Shield, Trash2 } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFiltersComponent } from '@/components/notifications/NotificationFilters';
import { NotificationStatsComponent } from '@/components/notifications/NotificationStats';
import { BroadcastNotificationModal } from '@/components/notifications/BroadcastNotificationModal';
import { NotificationFilters, BroadcastNotificationDTO } from '@/types/notification';
import { notificationAPI } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function AdminNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    clearAll,
    broadcastNotification,
    filterNotifications,
    getStats
  } = useNotifications();

  const { showToast } = useToast();
  const [filters, setFilters] = useState<NotificationFilters>({
    search: '',
    type: 'all',
    isRead: 'all',
    dateRange: 'all'
  });

  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isClearingAll, setIsClearingAll] = useState(false);

  const filteredNotifications = filterNotifications(filters);
  const stats = getStats();

  const handleFiltersChange = (newFilters: NotificationFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      type: 'all',
      isRead: 'all',
      dateRange: 'all'
    });
  };

  const handleBroadcast = async (data: BroadcastNotificationDTO) => {
    setIsBroadcasting(true);
    try {
      await broadcastNotification(data);
      setBroadcastModalOpen(false);
    } catch (error) {
      console.error('Failed to broadcast notification:', error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!confirm('Are you sure you want to clear ALL notifications? This action cannot be undone.')) {
      return;
    }

    setIsClearingAll(true);
    try {
      await clearAll();
      showToast({
        type: 'success',
        title: 'Success',
        message: 'All notifications have been cleared'
      });
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to clear all notifications'
      });
    } finally {
      setIsClearingAll(false);
    }
  };

  const handleAdminDelete = async (id: number) => {
    try {
      const response = await notificationAPI.adminDelete(id);
      if (response.success) {
        // Remove from local state
        const updatedNotifications = notifications.filter(n => n.id !== id);
        // Update unread count if needed
        const deletedNotification = notifications.find(n => n.id === id);
        if (deletedNotification && !deletedNotification.isRead) {
          // This would need to be handled by the hook
        }
        showToast({
          type: 'success',
          title: 'Success',
          message: 'Notification deleted successfully'
        });
        // Reload notifications to get updated data
        await loadNotifications();
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
      showToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to delete notification'
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#212121] flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> 
            Admin Notifications
          </h1>
          <p className="text-[#424242]">Manage all system notifications and broadcast messages</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="text-primary border-primary">
            {unreadCount} Unread
          </Badge>
          <Button 
            variant="outline" 
            onClick={loadNotifications}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button 
            onClick={() => setBroadcastModalOpen(true)}
            className="flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            Broadcast
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              className="flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All Read
            </Button>
          )}
          {notifications.length > 0 && (
            <Button 
              variant="destructive"
              onClick={handleClearAllNotifications}
              disabled={isClearingAll}
              className="flex items-center gap-2"
            >
              {isClearingAll ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear All
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Stats */}
      <NotificationStatsComponent stats={stats} />

      {/* Filters */}
      <NotificationFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalCount={filteredNotifications.length}
        onClearFilters={handleClearFilters}
      />

      {/* Notifications List */}
      <Card className="bg-white border-[#E0E0E0]">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
          <CardDescription>
            {loading ? 'Loading...' : `${filteredNotifications.length} result(s)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-[#757575]">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Loading notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12 text-[#757575]">
              <Bell className="w-16 h-16 mx-auto mb-4 text-[#BDBDBD]" />
              <h3 className="text-lg font-medium mb-2">No notifications</h3>
              <p className="text-sm">
                {notifications.length === 0 
                  ? "No notifications in the system." 
                  : "No notifications match your current filters."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onMarkAsUnread={markAsUnread}
                  onDelete={handleAdminDelete}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Broadcast Modal */}
      <BroadcastNotificationModal
        isOpen={broadcastModalOpen}
        onClose={() => setBroadcastModalOpen(false)}
        onSend={handleBroadcast}
        isLoading={isBroadcasting}
      />
    </div>
  );
}
