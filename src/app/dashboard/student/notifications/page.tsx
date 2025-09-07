'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Bell, CheckCircle2, RefreshCw } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { NotificationCard } from '@/components/notifications/NotificationCard';
import { NotificationFiltersComponent } from '@/components/notifications/NotificationFilters';
import { NotificationStatsComponent } from '@/components/notifications/NotificationStats';
import { NotificationFilters } from '@/types/notification';

export default function StudentNotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAsUnread,
    deleteNotification,
    markAllAsRead,
    filterNotifications,
    getStats
  } = useNotifications();

  const [filters, setFilters] = useState<NotificationFilters>({
    search: '',
    type: 'all',
    isRead: 'all',
    dateRange: 'all'
  });

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#212121] flex items-center gap-2">
            <Bell className="w-7 h-7 text-primary" /> 
            My Notifications
          </h1>
          <p className="text-[#424242]">View notifications from supervisors and system</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <Badge variant="outline" className="text-primary border-primary">
            {unreadCount} Unread
          </Badge>
          <Button 
            variant="outline" 
            onClick={loadNotifications}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button 
              onClick={markAllAsRead}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark All as Read
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
          <CardTitle>Notifications</CardTitle>
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
                  ? "You're all caught up!" 
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
                  onDelete={deleteNotification}
                  showActions={true}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
