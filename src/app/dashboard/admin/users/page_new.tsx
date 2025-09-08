'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { 
  Users, 
  Search, 
  Edit, 
  Trash2, 
  Eye,
  UserPlus,
  Shield,
  Phone
} from 'lucide-react';
import { userAPI, authAPI, studentAPI } from '@/lib/api';
import { getApiConfig } from '@/lib/config';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { DataTable } from '@/components/ui/DataTable';
import { ColumnDef } from '@tanstack/react-table';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { User, UserRole } from '@/types/user';
import { formatDate } from '@/utils/formatDate';

// Student interface to match the API response
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  nationalId: string;
  status?: string;
  profilePictureUrl?: string;
  studentAcademicNumber?: string;
  department?: string;
  yearOfStudy?: string;
}

// API response interfaces
interface ApiResponse {
  success: boolean;
  message?: string;
  data?: unknown;
}

interface ErrorWithMessage {
  message?: string;
}

export default function UsersPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'driver' as UserRole,
    phoneNumber: '',
    nationalId: '',
    status: 'active' as 'active' | 'inactive' | 'suspended'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Build image URL helper
  const buildImageUrl = (imagePath: string | undefined): string | undefined => {
    if (!imagePath) return undefined;
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // If it's a relative path, build full URL
    if (imagePath.startsWith('/')) {
      if (imagePath.startsWith('/uploads')) {
        return `https://api.el-renad.com${imagePath}`;
      }
      return `https://api.el-renad.com/api${imagePath}`;
    }
    
    // If it's just a filename, assume it's in uploads folder
    return `https://api.el-renad.com/uploads/${imagePath}`;
  };

  // Fetch users from Global API (server-side role filter)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoadingUsers(true);
        let usersData: User[] = [];
        
        if (roleFilter === 'student') {
          // Use student-specific endpoint for students
          const studentUsers = await studentAPI.getAll();
          usersData = studentUsers.map((student: Student) => ({
            id: student.id,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phoneNumber,
            nationalId: student.nationalId,
            role: 'student' as UserRole,
            status: student.status?.toLowerCase() || 'active',
            avatar: student.profilePictureUrl,
            studentAcademicNumber: student.studentAcademicNumber,
            department: student.department,
            academicYear: student.yearOfStudy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) as User[];
        } else if (roleFilter !== 'all') {
          // Use role-specific endpoint for staff
          const roleUsers = await userAPI.getByRole(roleFilter);
          usersData = roleUsers.map((user: any) => ({
            ...user,
            role: user.role as UserRole
          })) as User[];
        } else {
          // Get all users (staff only from /Users)
          const allUsers = await userAPI.getAll();
          const studentUsers = await studentAPI.getAll();
          
          // Map student data to User format
          const mappedStudents = studentUsers.map((student: Student) => ({
            id: student.id,
            name: `${student.firstName || ''} ${student.lastName || ''}`.trim(),
            firstName: student.firstName,
            lastName: student.lastName,
            email: student.email,
            phone: student.phoneNumber,
            nationalId: student.nationalId,
            role: 'student' as UserRole,
            status: student.status?.toLowerCase() || 'active',
            avatar: student.profilePictureUrl,
            studentAcademicNumber: student.studentAcademicNumber,
            department: student.department,
            academicYear: student.yearOfStudy,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })) as User[];
          
          // Filter out students from allUsers to avoid duplication
          const nonStudentUsers = allUsers.filter((user: any) => user.role !== 'student');
          
          // Map staff users to ensure proper typing
          const mappedStaff = nonStudentUsers.map((user: any) => ({
            ...user,
            role: user.role as UserRole
          })) as User[];
          
          usersData = [...mappedStaff, ...mappedStudents];
        }
        
        setUsers(usersData);
      } catch (error) {
        console.error('Failed to fetch users:', error);
        showToast({ 
          type: 'error', 
          title: 'Error', 
          message: 'Failed to fetch users. Please try again.' 
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [roleFilter, showToast]);

  // Filter users based on search and filters
  const filteredUsers = users ? users.filter(user => {
    const userName = user.name || user.firstName || '';
    const userEmail = user.email || '';
    const matchesSearch = userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         userEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    
    return matchesSearch && matchesRole && matchesStatus;
  }) : [];

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Only admins can add staff
      if (!user || user.role !== 'admin') {
        throw new Error('Only admins can add staff');
      }

      // Validate StaffRegistrationDTO
      const errors: string[] = [];
      const nameMin = 2, nameMax = 20;
      const nationalIdRegex = /^\d{14}$/;
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const egMobileRegex = /^01[0-2,5]{1}[0-9]{8}$/;

      if (!newUser.firstName || newUser.firstName.trim().length < nameMin || newUser.firstName.trim().length > nameMax) {
        errors.push(`First name must be ${nameMin}-${nameMax} characters.`);
      }
      if (!newUser.lastName || newUser.lastName.trim().length < nameMin || newUser.lastName.trim().length > nameMax) {
        errors.push(`Last name must be ${nameMin}-${nameMax} characters.`);
      }
      if (!nationalIdRegex.test(newUser.nationalId)) {
        errors.push('National ID must be exactly 14 digits.');
      }
      if (!emailRegex.test(newUser.email)) {
        errors.push('Please enter a valid email address.');
      }
      if (!egMobileRegex.test(newUser.phoneNumber)) {
        errors.push('Phone number must be a valid Egyptian mobile (e.g., 01X XXXXXXXX).');
      }

      // Map role to API enum
      const roleMapping: Record<string, 'Admin' | 'Driver' | 'Conductor' | 'MovementManager'> = {
        'admin': 'Admin',
        'driver': 'Driver',
        'conductor': 'Conductor',
        'movement-manager': 'MovementManager'
      };
      const mappedRole = roleMapping[newUser.role];
      if (!mappedRole) {
        errors.push('Please select a valid staff role.');
      }

      if (errors.length > 0) {
        const msg = errors.join(' ');
        setError(msg);
        showToast({ type: 'error', title: 'Invalid input', message: msg });
        return;
      }

      // Create staff data for API
      const staffData = {
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        nationalId: newUser.nationalId,
        email: newUser.email,
        phoneNumber: newUser.phoneNumber,
        role: mappedRole
      };

      // Create user via staff registration API
      const response = await authAPI.registerStaff(staffData);
      
      if (!response || (response as ApiResponse).success === false) {
        throw new Error((response as ApiResponse)?.message || 'Failed to create user');
      }

      // Refresh users list from server
      const refreshed = roleFilter === 'student' ? [] : 
                       roleFilter !== 'all' ? await userAPI.getByRole(roleFilter) : 
                       await userAPI.getAll();
      setUsers(refreshed.map((user: any) => ({
        ...user,
        role: user.role as UserRole
      })) as User[]);
      
      // Show success message
      showToast({ 
        type: 'success', 
        title: 'Success!', 
        message: 'Staff member added successfully!' 
      });
      
      setShowAddModal(false);
      setNewUser({ firstName: '', lastName: '', email: '', role: 'driver', phoneNumber: '', nationalId: '', status: 'active' });
    } catch (error) {
      console.error('Failed to add user:', error);
      const errorMessage = (error as ErrorWithMessage)?.message || 'Failed to add user. Please try again.';
      setError(errorMessage);
      showToast({ 
        type: 'error', 
        title: 'Error!', 
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Edit not supported by Global API
  const handleEditUser = async (e: React.FormEvent) => {
    e.preventDefault();
    showToast({ type: 'error', title: 'Not supported', message: 'Updating users is not supported by the API.' });
  };

  const [confirmState, setConfirmState] = useState<{ open: boolean; userId?: string; message?: string }>({ open: false });
  const handleDeleteConfirmed = async () => {
    const userId = confirmState.userId;
    if (!userId) return;

    try {
      // Build URL from config to ensure correct backend base
      const api = getApiConfig();
      const url = api.buildUrl(`/Users/${encodeURIComponent(userId)}`);
      // Read token from localStorage (same shape used elsewhere)
      let token: string | undefined;
      try {
        const raw = typeof window !== 'undefined' ? window.localStorage.getItem('user') : null;
        if (raw) {
          const parsed = JSON.parse(raw);
          token = parsed?.token || parsed?.accessToken;
        }
      } catch (error) {
        console.warn('Failed to read auth token from localStorage', error);
      }

      if (!token) {
        showToast({ type: 'error', title: 'Unauthorized', message: 'No auth token found. Please login again.' });
        setConfirmState({ open: false });
        return;
      }

      const resp = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json, text/plain',
          'Authorization': `Bearer ${token}`,
        },
        redirect: 'follow',
      });

      const ct = resp.headers.get('content-type') || '';
      const body = ct.toLowerCase().includes('application/json') ? await resp.json().catch(() => null) : await resp.text().catch(() => null);

      if (!resp.ok) {
        const msg = typeof body === 'string' ? body : (body?.message || JSON.stringify(body) || `Status ${resp.status}`);
        console.error('Delete failed:', msg);
        showToast({ type: 'error', title: 'Error!', message: `Failed to delete user. ${msg}` });
      } else {
        setUsers(prevUsers => prevUsers.filter(user => user.id.toString() !== userId));
        showToast({ type: 'success', title: 'Success!', message: 'User deleted successfully!' });
        console.log('Delete result:', body);
      }
    } catch (error) {
      console.error('Failed to delete user:', error);
      showToast({ type: 'error', title: 'Error!', message: 'Failed to delete user. Please try again.' });
    } finally {
      setConfirmState({ open: false });
    }
  };

  const handleViewUser = (user: User) => {
    if (user.role === 'student') {
      // Navigate to dedicated student view page
      router.push(`/dashboard/admin/students/${user.id.toString()}`);
    } else {
      setSelectedUser(user);
      setShowViewModal(true);
    }
  };

  const handleEditUserClick = (user: User) => {
    if (user.role === 'student') {
      // Navigate to dedicated student edit page
      router.push(`/dashboard/admin/students/${user.id.toString()}/edit`);
    } else {
      setSelectedUser(user);
      setShowEditModal(true);
    }
  };

  if (isLoadingUsers) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto shadow-lg"></div>
            <p className="mt-6 text-text-secondary text-lg font-medium">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary tracking-tight">Users Management</h1>
            <p className="text-text-secondary mt-2">Manage all system users and their permissions</p>
          </div>
          <div className="flex items-center gap-3">
            <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add User
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Total Users</p>
                <p className="text-2xl font-bold text-text-primary">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Shield className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Active Users</p>
                <p className="text-2xl font-bold text-text-primary">
                  {users ? users.filter(u => u.status === 'active').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Students</p>
                <p className="text-2xl font-bold text-text-primary">
                  {users ? users.filter(u => u.role === 'student').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Drivers</p>
                <p className="text-2xl font-bold text-text-primary">
                  {users ? users.filter(u => u.role === 'driver').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-text-secondary">Conductors</p>
                <p className="text-2xl font-bold text-text-primary">
                  {users ? users.filter(u => u.role === 'conductor').length : 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="flex gap-4 items-center">
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="min-w-[150px]"
              >
                <option value="all">All Roles</option>
                <option value="student">Student</option>
                <option value="driver">Driver</option>
                <option value="conductor">Conductor</option>
                <option value="movement-manager">Movement Manager</option>
                <option value="admin">Admin</option>
              </Select>

              <div className="hidden md:flex items-center gap-2 rounded-full border bg-white px-1 py-1">
                {['all','active','inactive','suspended'].map((s) => (
                  <Button
                    key={s}
                    type="button"
                    size="sm"
                    variant={statusFilter === s ? 'default' : 'outline'}
                    className="rounded-full"
                    onClick={() => setStatusFilter(s)}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>Users List</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-4 rounded-full bg-slate-100 p-4">
                <Users className="w-8 h-8 text-slate-500" />
              </div>
              <p className="text-lg font-semibold text-text-primary">No users found</p>
              <p className="text-sm text-text-secondary mt-1">Try adjusting filters or add a new user.</p>
            </div>
          ) : (() => {
            const columns: ColumnDef<User>[] = [
              {
                header: 'User',
                accessorKey: 'name',
                cell: ({ row }) => (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full ring-1 ring-black/5 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center overflow-hidden shadow-sm relative">
                      {row.original.avatar ? (
                        <Image
                          src={buildImageUrl(row.original.avatar) || row.original.avatar}
                          alt={row.original.name || 'User'}
                          fill
                          sizes="40px"
                          className="rounded-full object-cover"
                          onError={(e) => {
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent) {
                              const fallback = parent.querySelector('span');
                              if (fallback) fallback.classList.remove('hidden');
                            }
                          }}
                        />
                      ) : null}
                      <span className={`text-gray-600 font-semibold ${row.original.avatar ? 'hidden' : ''}`}>
                        {(row.original.name || 'U').charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{row.original.name}</p>
                      <p className="text-sm text-text-secondary">{row.original.email}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: 'Role',
                accessorKey: 'role',
                cell: ({ getValue }) => (
                  <Badge variant={getValue<string>() === 'admin' ? 'destructive' : 'default'}>
                    {getValue<string>()}
                  </Badge>
                ),
              },
              {
                header: 'Status',
                accessorKey: 'status',
                cell: ({ getValue }) => (
                  <Badge
                    variant={
                      getValue<string>() === 'active' ? 'default' : getValue<string>() === 'inactive' ? 'secondary' : 'destructive'
                    }
                  >
                    {getValue<string>()}
                  </Badge>
                ),
              },
              {
                header: 'Contact',
                accessorKey: 'phone',
                cell: ({ row }) => (
                  <div className="flex items-center gap-2 text-sm text-text-secondary">
                    <Phone className="w-4 h-4" />
                    {row.original.phone || 'N/A'}
                  </div>
                ),
              },
              {
                header: 'Created',
                accessorKey: 'createdAt',
                cell: ({ getValue }) => (
                  <span className="text-sm text-text-secondary">
                    {getValue<string>() ? formatDate(getValue<string>()) : 'N/A'}
                  </span>
                ),
              },
              {
                header: 'Actions',
                id: 'actions',
                cell: ({ row }) => (
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleViewUser(row.original)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEditUserClick(row.original)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmState({ open: true, userId: row.original.id.toString(), message: `Delete ${row.original.name}?` })}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ),
              },
            ];
            const roleToRowClass: Record<string, string> = {
              admin: 'bg-red-50',
              driver: 'bg-orange-50',
              conductor: 'bg-purple-50',
              'movement-manager': 'bg-blue-50',
              student: 'bg-green-50',
            };
            return (
              <DataTable
                columns={columns}
                data={filteredUsers}
                searchPlaceholder="Search users..."
                hideFirstPrevious={true}
                hideLastNext={true}
                getRowClassName={(u) => roleToRowClass[(u as User).role]}
              />
            );
          })()}
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New User"
        size="lg"
      >
        <form onSubmit={handleAddUser} className="space-y-4">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="text-md font-semibold border-b pb-2">Basic Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <Input
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                  placeholder="Enter first name"
                  required
                  minLength={2}
                  maxLength={20}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <Input
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                  placeholder="Enter last name"
                  required
                  minLength={2}
                  maxLength={20}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <Input
                  value={newUser.nationalId}
                  onChange={(e) => {
                    const digitsOnly = e.target.value.replace(/[^0-9]/g, '').slice(0, 14);
                    setNewUser({ ...newUser, nationalId: digitsOnly });
                  }}
                  placeholder="Enter national ID"
                  required
                  pattern="^[0-9]{14}$"
                  maxLength={14}
                  inputMode="numeric"
                  title="National ID must be exactly 14 digits"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                required
              >
                <option value="driver">Driver</option>
                <option value="conductor">Conductor</option>
                <option value="movement-manager">Movement Manager</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <Input
                  value={newUser.phoneNumber}
                  onChange={(e) => setNewUser({ ...newUser, phoneNumber: e.target.value })}
                  placeholder="Enter phone number"
                  required
                  pattern="^01[0-2,5]{1}[0-9]{8}$"
                  inputMode="tel"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <Select
                value={newUser.status}
                onChange={(e) => setNewUser({ ...newUser, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                required
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </Select>
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add User'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit User"
        size="lg"
      >
        {selectedUser && (
          <form onSubmit={handleEditUser} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <Input
                  value={selectedUser.name || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, name: e.target.value })}
                  placeholder="Enter full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <Input
                  type="email"
                  value={selectedUser.email || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, email: e.target.value })}
                  placeholder="Enter email"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <Select
                  value={selectedUser.role}
                  onChange={(e) => setSelectedUser({ ...selectedUser, role: e.target.value as UserRole })}
                  required
                >
                  <option value="student">Student</option>
                  <option value="driver">Driver</option>
                  <option value="conductor">Conductor</option>
                  <option value="movement-manager">Movement Manager</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  value={selectedUser.phone || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, phone: e.target.value })}
                  placeholder="Enter phone number"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <Select
                  value={selectedUser.status || 'active'}
                  onChange={(e) => setSelectedUser({ ...selectedUser, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  required
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  National ID
                </label>
                <Input
                  value={selectedUser.nationalId || ''}
                  onChange={(e) => setSelectedUser({ ...selectedUser, nationalId: e.target.value })}
                  placeholder="Enter national ID"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowEditModal(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update User'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* View User Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="User Details"
        size="lg"
      >
        {selectedUser && (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center relative overflow-hidden">
                {selectedUser.avatar ? (
                  <Image
                    src={buildImageUrl(selectedUser.avatar) || selectedUser.avatar}
                    alt={selectedUser.name || 'User'}
                    fill
                    sizes="80px"
                    className="rounded-full object-cover"
                    onError={(e) => {
                      const parent = (e.target as HTMLImageElement).parentElement;
                      if (parent) {
                        const fallback = parent.querySelector('span');
                        if (fallback) fallback.classList.remove('hidden');
                      }
                    }}
                  />
                ) : null}
                <span className={`text-gray-600 font-semibold text-2xl ${selectedUser.avatar ? 'hidden' : ''}`}>
                  {(selectedUser.name || 'U').charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text-primary">{selectedUser.name}</h3>
                <p className="text-text-secondary">{selectedUser.email}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={selectedUser.role === 'admin' ? 'destructive' : 'default'}>
                    {selectedUser.role}
                  </Badge>
                  <Badge 
                    variant={
                      selectedUser.status === 'active' ? 'default' : 
                      selectedUser.status === 'inactive' ? 'secondary' : 'destructive'
                    }
                  >
                    {selectedUser.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <p className="text-text-primary">{selectedUser.phone || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <p className="text-text-primary">{selectedUser.nationalId || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created</label>
                <p className="text-text-primary">
                  {selectedUser.createdAt ? formatDate(selectedUser.createdAt) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Updated</label>
                <p className="text-text-primary">
                  {selectedUser.updatedAt ? formatDate(selectedUser.updatedAt) : 'N/A'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p className="text-text-primary font-mono text-sm">{selectedUser.id}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
      
      <ConfirmDialog
        open={confirmState.open}
        title="Delete user?"
        description={confirmState.message || ''}
        onCancel={() => setConfirmState({ open: false })}
        onConfirm={handleDeleteConfirmed}
      />

      
    </div>
  );
}
