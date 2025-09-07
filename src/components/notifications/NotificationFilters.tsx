'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Filter, Clock, Search } from 'lucide-react';
import { NotificationFilters, NotificationType } from '@/types/notification';

interface NotificationFiltersProps {
  filters: NotificationFilters;
  onFiltersChange: (filters: NotificationFilters) => void;
  totalCount: number;
  onClearFilters: () => void;
}

export function NotificationFiltersComponent({
  filters,
  onFiltersChange,
  totalCount,
  onClearFilters
}: NotificationFiltersProps) {
  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value });
  };

  const handleTypeChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      type: value === 'all' ? 'all' : value as NotificationType 
    });
  };

  const handleReadStatusChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      isRead: value === 'all' ? 'all' : value === 'read' 
    });
  };

  const handleDateRangeChange = (value: string) => {
    onFiltersChange({ 
      ...filters, 
      dateRange: value as 'all' | 'today' | '7d' | '30d' | 'specific',
      specificDate: value === 'specific' ? filters.specificDate : undefined
    });
  };

  const handleSpecificDateChange = (value: string) => {
    onFiltersChange({ ...filters, specificDate: value });
  };

  return (
    <Card className="bg-white border-[#E0E0E0]">
      <CardHeader>
        <CardTitle className="text-[#212121]">Filters & Search</CardTitle>
        <CardDescription className="text-[#757575]">
          Find the notifications you need quickly
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-[#757575]" />
            <Input
              placeholder="Search title, message..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Type Filter */}
          <Select
            value={filters.type || 'all'}
            onChange={(e) => handleTypeChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Types' },
              { value: NotificationType.System, label: 'System' },
              { value: NotificationType.Alert, label: 'Alert' },
              { value: NotificationType.Announcement, label: 'Announcement' },
              { value: NotificationType.Reminder, label: 'Reminder' },
              { value: NotificationType.Booking, label: 'Booking' },
            ]}
          />

          {/* Read Status Filter */}
          <Select
            value={filters.isRead === 'all' ? 'all' : filters.isRead ? 'read' : 'unread'}
            onChange={(e) => handleReadStatusChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Status' },
              { value: 'unread', label: 'Unread' },
              { value: 'read', label: 'Read' },
            ]}
          />

          {/* Date Range Filter */}
          <Select
            value={filters.dateRange || 'all'}
            onChange={(e) => handleDateRangeChange(e.target.value)}
            options={[
              { value: 'all', label: 'All Dates' },
              { value: 'today', label: 'Today' },
              { value: '7d', label: 'Last 7 Days' },
              { value: '30d', label: 'Last 30 Days' },
              { value: 'specific', label: 'Specific Date' },
            ]}
          />

          {/* Specific Date Input */}
          {filters.dateRange === 'specific' ? (
            <Input
              type="date"
              value={filters.specificDate || ''}
              onChange={(e) => handleSpecificDateChange(e.target.value)}
            />
          ) : (
            <div className="flex items-center text-sm text-[#757575]">
              <Clock className="w-4 h-4 mr-2" />
              {totalCount} notification(s)
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Clear Filters
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
