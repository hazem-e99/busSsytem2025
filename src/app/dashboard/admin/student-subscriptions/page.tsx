'use client';

import { useEffect, useMemo, useState } from 'react';
import { useToast } from '@/components/ui/Toast';
import { studentAPI, paymentAPI, subscriptionPlansAPI } from '@/lib/api';
import { PaymentMethod, PaymentStatus, ReviewPaymentDTO } from '@/types/subscription';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { CheckCircle, XCircle, Clock, AlertCircle, Users, CreditCard, Search, Activity, Filter, X, Calendar, DollarSign } from 'lucide-react';
import { Select } from '@/components/ui/Select';

// Updated interfaces based on Swagger schemas
interface Student {
  id: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  nationalId?: string;
  profilePictureUrl?: string;
  status: string;
  role: string;
  studentProfileId: number;
  studentAcademicNumber?: string;
  department?: string;
  yearOfStudy?: number;
  emergencyContact?: string;
  emergencyPhone?: string;
}

interface Payment {
  id: number;
  studentId: number;
  tripId?: number;
  amount: number;
  subscriptionPlanId: number;
  subscriptionPlanName?: string;
  subscriptionCode?: string;
  paymentMethod: PaymentMethod;
  paymentMethodText?: string;
  paymentReferenceCode?: string;
  status: PaymentStatus;
  statusText?: string;
  adminReviewedById?: number;
  adminReviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt?: string;
  studentName?: string;
  studentEmail?: string;
}

interface SubscriptionPlan {
  id: number;
  name: string;
  description?: string;
  price: number;
  durationInDays: number;
  isActive: boolean;
}

export default function StudentSubscriptionsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | 'all'>('all');
  const [methodFilter, setMethodFilter] = useState<PaymentMethod | 'all'>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customDateFrom, setCustomDateFrom] = useState('');
  const [customDateTo, setCustomDateTo] = useState('');
  const [amountFilter, setAmountFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const { showToast } = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      setLoading(true);
      console.log('🔍 Loading admin student subscriptions data...');
      
      const [studentsData, paymentsData, plansData] = await Promise.all([
        studentAPI.getAll().catch((error) => {
          console.error('❌ Students API Error:', error);
          return [];
        }),
        paymentAPI.getAll().catch((error) => {
          console.error('❌ Payments API Error:', error);
          return [];
        }),
        subscriptionPlansAPI.getAll().catch((error) => {
          console.error('❌ Plans API Error:', error);
          return [];
        })
      ]);

      console.log('📊 Students data:', studentsData);
      console.log('💳 Payments data:', paymentsData);
      console.log('📋 Plans data:', plansData);

      setStudents(studentsData || []);
      setPayments(paymentsData || []);
      setPlans(plansData || []);

      // Show success message if data loaded successfully
      if (paymentsData && paymentsData.length > 0) {
        console.log('✅ Data loaded successfully!');
        showToast({ 
          type: 'success', 
          title: 'Data Loaded Successfully', 
          message: `Found ${paymentsData.length} payment records` 
        });
      } else {
        console.warn('⚠️ No payment data received');
        showToast({ 
          type: 'warning', 
          title: 'No payment data', 
          message: 'No payment records found in the system' 
        });
      }
    } catch (error) {
      console.error('❌ Error loading data:', error);
      showToast({ type: 'error', title: 'Failed to load data', message: 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  // Get subscription payments (payments without tripId)
  const subscriptionPayments = useMemo(() => {
    console.log('🔍 All payments:', payments);
    const filtered = payments.filter(p => !p.tripId);
    console.log('🔍 Subscription payments (filtered):', filtered);
    return filtered;
  }, [payments]);

  // Create a map of plans for quick lookup
  const plansMap = useMemo(() => {
    const map = new Map<number, SubscriptionPlan>();
    plans.forEach(plan => map.set(plan.id, plan));
    return map;
  }, [plans]);

  // Get unique plan names for filter
  const planOptions = useMemo(() => {
    const uniquePlans = new Set<string>();
    subscriptionPayments.forEach(payment => {
      const planDetails = payment.subscriptionPlanId ? plansMap.get(payment.subscriptionPlanId) : null;
      const planName = planDetails?.name || payment.subscriptionPlanName || 'No Plan';
      uniquePlans.add(planName);
    });
    return Array.from(uniquePlans).sort();
  }, [subscriptionPayments, plansMap]);

  // Filter by date range
  const getDateRange = (filter: string) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (filter) {
      case 'today':
        return { from: today, to: new Date(today.getTime() + 24 * 60 * 60 * 1000) };
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        return { from: weekStart, to: new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000) };
      case 'month':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return { from: monthStart, to: monthEnd };
      case 'custom':
        return {
          from: customDateFrom ? new Date(customDateFrom) : null,
          to: customDateTo ? new Date(customDateTo + 'T23:59:59') : null
        };
      default:
        return { from: null, to: null };
    }
  };

  // Filter by amount range
  const getAmountRange = (filter: string) => {
    switch (filter) {
      case 'low':
        return { min: 0, max: 100 };
      case 'medium':
        return { min: 100, max: 500 };
      case 'high':
        return { min: 500, max: Infinity };
      default:
        return { min: 0, max: Infinity };
    }
  };

  const studentSubscriptions = useMemo(() => {
    console.log('🔄 Processing subscription payments with filters:', {
      search, statusFilter, methodFilter, planFilter, dateFilter, amountFilter
    });
    
    const dateRange = getDateRange(dateFilter);
    const amountRange = getAmountRange(amountFilter);
    
    return subscriptionPayments.map(payment => {
      const planDetails = payment.subscriptionPlanId ? plansMap.get(payment.subscriptionPlanId) : null;
      
      const result = {
        paymentId: payment.id,
        studentId: payment.studentId,
        studentName: payment.studentName || 'Unknown Student',
        studentEmail: payment.studentEmail || '',
        planName: planDetails?.name || payment.subscriptionPlanName || 'No Plan',
        planPrice: planDetails?.price || 0,
        planDuration: planDetails?.durationInDays || 0,
        paymentMethod: payment.paymentMethod,
        paymentMethodText: payment.paymentMethodText || '',
        paymentReferenceCode: payment.paymentReferenceCode || '',
        status: payment.status,
        amount: payment.amount,
        createdAt: payment.createdAt,
        reviewedAt: payment.reviewedAt || '',
        adminReviewedBy: payment.adminReviewedByName || '',
        subscriptionCode: payment.subscriptionCode || ''
      };
      
      return result;
    }).filter(row => {
      // Search filter
      const matchesSearch = !search || 
        row.studentName.toLowerCase().includes(search.toLowerCase()) ||
        row.studentEmail.toLowerCase().includes(search.toLowerCase()) ||
        row.planName.toLowerCase().includes(search.toLowerCase()) ||
        row.paymentReferenceCode.toLowerCase().includes(search.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || row.status === statusFilter;
      
      // Method filter
      const matchesMethod = methodFilter === 'all' || row.paymentMethod === methodFilter;
      
      // Plan filter
      const matchesPlan = planFilter === 'all' || row.planName === planFilter;
      
      // Date filter
      const paymentDate = new Date(row.createdAt);
      const matchesDate = !dateRange.from || !dateRange.to || 
        (paymentDate >= dateRange.from && paymentDate < dateRange.to);
      
      // Amount filter
      const matchesAmount = row.amount >= amountRange.min && row.amount <= amountRange.max;
      
      return matchesSearch && matchesStatus && matchesMethod && matchesPlan && matchesDate && matchesAmount;
    });
  }, [subscriptionPayments, plansMap, search, statusFilter, methodFilter, planFilter, dateFilter, amountFilter, customDateFrom, customDateTo]);

  const reviewPayment = async (paymentId: number, status: PaymentStatus, reviewNotes?: string) => {
    try {
      console.log('🔍 Reviewing payment:', { paymentId, status, reviewNotes });
      
      const reviewData: ReviewPaymentDTO = {
        status: status,
        reviewNotes: reviewNotes || null,
        subscriptionCode: null // Will be generated by backend if needed
      };

      const result = await paymentAPI.review(paymentId, reviewData);
      
      if (result?.success) {
        showToast({ 
          type: 'success', 
          title: 'Payment reviewed successfully',
          message: `Payment ${status === 'Accepted' ? 'accepted' : status === 'Rejected' ? 'rejected' : 'updated'}`
        });
        await load(); // Refresh data
      } else {
        throw new Error(result?.message || 'Review failed');
      }
    } catch (error) {
      console.error('❌ Error reviewing payment:', error);
      showToast({ 
        type: 'error', 
        title: 'Failed to review payment',
        message: 'Please try again'
      });
    }
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'Accepted':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Accepted</Badge>;
      case 'Rejected':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'Cancelled':
        return <Badge className="bg-gray-100 text-gray-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
      case 'Expired':
        return <Badge className="bg-orange-100 text-orange-800"><AlertCircle className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const getPaymentMethodDisplay = (method: PaymentMethod | null) => {
    switch (method) {
      case 'Online':
        return 'InstaPay';
      case 'Offline':
        return 'Offline';
      default:
        return method || '—';
    }
  };

  const getRowClassName = (status: PaymentStatus) => {
    switch (status) {
      case 'Accepted':
        return 'bg-green-50/60';
      case 'Rejected':
        return 'bg-red-50/60';
      case 'Pending':
        return 'bg-yellow-50/60';
      case 'Cancelled':
        return 'bg-gray-50/60';
      case 'Expired':
        return 'bg-orange-50/60';
      default:
        return 'bg-white';
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setMethodFilter('all');
    setPlanFilter('all');
    setDateFilter('all');
    setCustomDateFrom('');
    setCustomDateTo('');
    setAmountFilter('all');
  };

  // Check if any filters are active
  const hasActiveFilters = search || statusFilter !== 'all' || methodFilter !== 'all' || 
    planFilter !== 'all' || dateFilter !== 'all' || amountFilter !== 'all';

  if (loading) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Creative Hero */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Student Subscriptions Management</h1>
            <p className="text-text-secondary mt-1">Manage student subscription payments and review payment status</p>
          </div>
          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search students, plans..." 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-text-secondary">Total Students</p>
              <p className="font-semibold">{students.length}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-text-secondary">Active Subscriptions</p>
              <p className="font-semibold">{subscriptionPayments.filter(p => p.status === 'Accepted').length}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-text-secondary">Pending Reviews</p>
              <p className="font-semibold">{subscriptionPayments.filter(p => p.status === 'Pending').length}</p>
            </div>
          </div>
          <div className="rounded-xl border bg-white/70 backdrop-blur p-4 flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-purple-600" />
            <div>
              <p className="text-sm text-text-secondary">Total Payments</p>
              <p className="font-semibold">{subscriptionPayments.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <Card className="rounded-xl border bg-white">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5" />
              <CardTitle>Advanced Filters</CardTitle>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4 mr-1" />
                  Clear All
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? 'Hide Filters' : 'Show Filters'}
              </Button>
            </div>
          </div>
        </CardHeader>
        {showFilters && (
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {/* Status Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Status</label>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PaymentStatus | 'all')}
                >
                  <option value="all">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Cancelled">Cancelled</option>
                  <option value="Expired">Expired</option>
                </Select>
              </div>

              {/* Payment Method Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Payment Method</label>
                <Select
                  value={methodFilter}
                  onChange={(e) => setMethodFilter(e.target.value as PaymentMethod | 'all')}
                >
                  <option value="all">All Methods</option>
                  <option value="Online">InstaPay</option>
                  <option value="Offline">Offline</option>
                </Select>
              </div>

              {/* Plan Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Subscription Plan</label>
                <Select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                >
                  <option value="all">All Plans</option>
                  {planOptions.map(plan => (
                    <option key={plan} value={plan}>{plan}</option>
                  ))}
                </Select>
              </div>

              {/* Date Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Date Range</label>
                <Select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value as any)}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="custom">Custom Range</option>
                </Select>
              </div>

              {/* Amount Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Amount Range</label>
                <Select
                  value={amountFilter}
                  onChange={(e) => setAmountFilter(e.target.value as any)}
                >
                  <option value="all">All Amounts</option>
                  <option value="low">Low ($0 - $100)</option>
                  <option value="medium">Medium ($100 - $500)</option>
                  <option value="high">High ($500+)</option>
                </Select>
              </div>

              {/* Custom Date Range */}
              {dateFilter === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Custom Range</label>
                  <div className="space-y-2">
                    <Input
                      type="date"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                      placeholder="From Date"
                    />
                    <Input
                      type="date"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                      placeholder="To Date"
                    />
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Subscription Payments Table */}
      <Card className="rounded-xl border bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Subscription Payments
            {hasActiveFilters && (
              <Badge variant="outline" className="ml-2">
                {studentSubscriptions.length} filtered
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            {studentSubscriptions.length} payment(s) from /api/Payment endpoint
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-x-auto">
          <Table className="min-w-[900px] sm:min-w-0">
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {studentSubscriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center space-y-2">
                      <AlertCircle className="w-12 h-12 text-gray-400" />
                      <div className="text-lg font-medium text-gray-500">No Payment Data</div>
                      <div className="text-sm text-gray-400">
                        {payments.length === 0 
                          ? 'No payment data available. Please check if you are logged in as admin.'
                          : 'No subscription payments found in the system.'
                        }
                      </div>
                      <Button 
                        onClick={load} 
                        variant="outline" 
                        className="mt-2"
                      >
                        Refresh Data
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                studentSubscriptions.map(row => (
                  <TableRow key={row.paymentId} className={getRowClassName(row.status)}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.studentName}</div>
                        <div className="text-sm text-gray-500">{row.studentEmail}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{row.planName}</div>
                        <div className="text-sm text-gray-500">
                          {row.planDuration} days
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-green-600">
                        ${row.amount?.toFixed(2) || '0.00'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{getPaymentMethodDisplay(row.paymentMethod)}</div>
                        {row.paymentReferenceCode && (
                          <div className="text-sm text-gray-500">
                            Ref: {row.paymentReferenceCode}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(row.status)}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="text-sm">
                          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
                        </div>
                        {row.reviewedAt && (
                          <div className="text-xs text-gray-500">
                            Reviewed: {new Date(row.reviewedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {row.paymentId && row.status === 'Pending' && (
                        <div className="flex flex-wrap gap-2">
                          <Button 
                            size="sm" 
                            onClick={() => reviewPayment(row.paymentId!, PaymentStatus.Accepted, 'Payment approved by admin')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accept
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => reviewPayment(row.paymentId!, PaymentStatus.Rejected, 'Payment rejected by admin')}
                            className="border-red-300 text-red-600 hover:bg-red-50"
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {row.status === 'Accepted' && (
                        <div className="text-sm text-green-600 font-medium">
                          ✓ Active
                        </div>
                      )}
                      {row.status === 'Rejected' && (
                        <div className="text-sm text-red-600 font-medium">
                          ✗ Rejected
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


