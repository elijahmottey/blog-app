import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  Typography,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Grid,
  Card,
  CardContent,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  Badge
} from '@mui/material';
import {
  Edit,
  Delete,
  Add,
  Visibility,
  Refresh,
  Search,
  Email,
  Person,
  CalendarToday,
  PostAdd,
  Comment,
  AdminPanelSettings
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import BackendApi, { type UserRegistration } from '../../service/BackendApi';

interface PagedResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  pageNumber: number;
  pageSize: number;
  lastPage: boolean;
}

interface ApiUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
  posts?: any[];
  comments?: any[];
}

// Define form data type that matches UserRegistration structure
interface UserFormData {
  name: string;
  email: string;
  password: string;
  role: string; // Single role, not array
}

export const AdminUsers: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);
  const [formData, setFormData] = useState<UserFormData>({
    name: '',
    email: '',
    password: '',
    role: 'USER'
  });

  // Fetch users with pagination
  const {
    data: apiResponse,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-users', currentPage, pageSize],
    queryFn: () => BackendApi.getAllUsers(currentPage, pageSize),
    staleTime: 30000,
  });

  // Safely extract users data - based on your API response structure
  const usersData = apiResponse?.data as PagedResponse<ApiUser> | undefined;
  const users: ApiUser[] = usersData?.content || [];
  const totalPages = usersData?.totalPages || 0;
  const totalElements = usersData?.totalElements || 0;

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: (userData: UserRegistration) =>
        BackendApi.registerAdmin(userData),
    onSuccess: () => {
      toast.success('User created successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(`Failed to create user: ${error.message}`);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: UserRegistration }) =>
        BackendApi.updateUser(userId, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      handleCloseDialog();
    },
    onError: (error: any) => {
      toast.error(`Failed to update user: ${error.message}`);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: number) => BackendApi.deleteUser(userId),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setOpenDeleteDialog(false);
    },
    onError: (error: any) => {
      toast.error(`Failed to delete user: ${error.message}`);
    },
  });

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    return (
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  const handleOpenCreateDialog = () => {
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER'
    });
    setOpenDialog(true);
  };

  const handleOpenEditDialog = (user: ApiUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '', // Don't pre-fill password for security
      role: user.role || 'USER'
    });
    setOpenDialog(true);
  };

  const handleOpenDeleteDialog = (user: ApiUser) => {
    setSelectedUser(user);
    setOpenDeleteDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'USER'
    });
  };

  const handleFormChange = (field: keyof UserFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }

    // For new users, password is required
    if (!selectedUser && !formData.password) {
      toast.error('Password is required for new users');
      return;
    }

    // Create proper UserRegistration object
    const userData: UserRegistration = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    };

    if (selectedUser?.id) {
      // Update existing user
      updateUserMutation.mutate({
        userId: selectedUser.id,
        data: userData
      });
    } else {
      // Create new user
      createUserMutation.mutate(userData);
    }
  };

  const handleDeleteUser = () => {
    if (selectedUser?.id) {
      deleteUserMutation.mutate(selectedUser.id);
    }
  };

  const getRoleColor = (role: string): "default" | "primary" | "secondary" | "error" | "info" | "success" | "warning" => {
    if (!role) return 'default';
    switch (role.toUpperCase()) {
      case 'ADMIN':
        return 'error';
      case 'MODERATOR':
        return 'warning';
      case 'EDITOR':
        return 'info';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch {
      return 'Invalid date';
    }
  };

  // Safe access to posts and comments arrays
  const getUserPostCount = (user: ApiUser): number => {
    return Array.isArray(user.posts) ? user.posts.length : 0;
  };

  const getUserCommentCount = (user: ApiUser): number => {
    return Array.isArray(user.comments) ? user.comments.length : 0;
  };

  const getTotalPostsCount = () => {
    return users.reduce((total, user) => total + getUserPostCount(user), 0);
  };

  const getTotalCommentsCount = () => {
    return users.reduce((total, user) => total + getUserCommentCount(user), 0);
  };

  const getAdminCount = () => {
    return users.filter(user =>
        user.role?.toUpperCase() === 'ADMIN'
    ).length;
  };

  // Function to view user details
  const handleViewUserDetails = (user: ApiUser) => {
    navigate(`/admin/users/${user.id}`, {
      state: {
        user,
        postCount: getUserPostCount(user),
        commentCount: getUserCommentCount(user)
      }
    });
  };

  if (isLoading) {
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
          <CircularProgress />
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            Failed to load users: {(error as Error).message}
          </Alert>
          <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => refetch()}
          >
            Retry
          </Button>
        </Box>
    );
  }

  return (
      <Box sx={{ p: { xs: 2, md: 3 } }}>
        {/* Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center" justifyContent="space-between">
            <Grid item xs={12} md={6}>
              <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                Users Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage users, roles, and permissions ({users.length} users loaded)
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Button
                    variant="outlined"
                    startIcon={<Refresh />}
                    onClick={() => refetch()}
                >
                  Refresh
                </Button>
                <Button
                    variant="contained"
                    startIcon={<Add />}
                    onClick={handleOpenCreateDialog}
                >
                  Add New User
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Stats Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', mr: 2 }}>
                    <Person />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {totalElements || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'error.50', color: 'error.main', mr: 2 }}>
                    <AdminPanelSettings />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {getAdminCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Admin Users
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', mr: 2 }}>
                    <PostAdd />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {getTotalPostsCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Posts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', borderRadius: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', mr: 2 }}>
                    <Comment />
                  </Avatar>
                  <Box>
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      {getTotalCommentsCount()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Comments
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Filter */}
        <Paper sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                  fullWidth
                  placeholder="Search users by name, email, or role..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                          <Search />
                        </InputAdornment>
                    ),
                  }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                <Typography variant="body2" color="text.secondary">
                  Showing {filteredUsers.length} of {totalElements} users
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Users Table */}
        <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'grey.50' }}>
                  <TableCell sx={{ fontWeight: 'bold' }}>User</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Role</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Posts/Comments</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>Last Active</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }} align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary">
                          {searchTerm ? 'No users found matching your search' : 'No users found'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                ) : (
                    filteredUsers.map((user) => (
                        <TableRow
                            key={user.id}
                            hover
                            sx={{
                              '&:hover': {
                                bgcolor: 'action.hover'
                              }
                            }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Badge
                                  color="error"
                                  variant="dot"
                                  invisible={user.role?.toUpperCase() !== 'ADMIN'}
                              >
                                <Avatar sx={{ bgcolor: 'primary.main' }}>
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                                  {user.name || 'Unnamed User'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  ID: {user.id || 'N/A'}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Email fontSize="small" color="action" />
                              <Typography>{user.email || 'No email'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                                label={user.role || 'USER'}
                                size="small"
                                color={getRoleColor(user.role)}
                                variant="filled"
                                icon={user.role?.toUpperCase() === 'ADMIN' ? <AdminPanelSettings /> : undefined}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 3 }}>
                              <Tooltip title="Posts">
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" color="primary">
                                    {getUserPostCount(user)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Posts
                                  </Typography>
                                </Box>
                              </Tooltip>
                              <Tooltip title="Comments">
                                <Box sx={{ textAlign: 'center' }}>
                                  <Typography variant="h6" color="secondary">
                                    {getUserCommentCount(user)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Comments
                                  </Typography>
                                </Box>
                              </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <CalendarToday fontSize="small" color="action" />
                              <Typography variant="body2">
                                {formatDate(user.createdAt)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {formatDate(user.updatedAt)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                              <Tooltip title="View Details">
                                <IconButton
                                    size="small"
                                    onClick={() => handleViewUserDetails(user)}
                                    color="primary"
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit User">
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(user)}
                                    color="info"
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenDeleteDialog(user)}
                                    color="error"
                                    disabled={user.role?.toUpperCase() === 'ADMIN'}
                                >
                                  <Delete fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        {/* Pagination */}
        {totalPages > 1 && (
            <Paper sx={{ p: 2, mt: 3, borderRadius: 2 }}>
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                <Grid item>
                  <Typography variant="body2" color="text.secondary">
                    Page {currentPage + 1} of {totalPages}
                  </Typography>
                </Grid>
                <Grid item>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                        variant="outlined"
                        onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                        disabled={currentPage === 0}
                    >
                      Previous
                    </Button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNumber;
                      if (totalPages <= 5) {
                        pageNumber = i;
                      } else if (currentPage < 3) {
                        pageNumber = i;
                      } else if (currentPage > totalPages - 4) {
                        pageNumber = totalPages - 5 + i;
                      } else {
                        pageNumber = currentPage - 2 + i;
                      }

                      return (
                          <Button
                              key={pageNumber}
                              variant={currentPage === pageNumber ? 'contained' : 'outlined'}
                              onClick={() => setCurrentPage(pageNumber)}
                              sx={{ minWidth: '40px' }}
                          >
                            {pageNumber + 1}
                          </Button>
                      );
                    })}
                    <Button
                        variant="outlined"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                        disabled={currentPage === totalPages - 1}
                    >
                      Next
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
        )}

        {/* Create/Edit User Dialog */}
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
        >
          <DialogTitle>
            {selectedUser ? 'Edit User' : 'Create New User'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  fullWidth
                  required
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
              />
              <TextField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  fullWidth
                  required
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
              />
              <TextField
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleFormChange('password', e.target.value)}
                  fullWidth
                  required={!selectedUser}
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
                  helperText={selectedUser ? "Leave empty to keep current password" : "Minimum 8 characters"}
              />
              <TextField
                  select
                  label="Role"
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  fullWidth
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
              >
                {['USER', 'EDITOR', 'MODERATOR', 'ADMIN'].map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                ))}
              </TextField>
              {(updateUserMutation.isPending || createUserMutation.isPending) && (
                  <LinearProgress />
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
                onClick={handleCloseDialog}
                disabled={updateUserMutation.isPending || createUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
                onClick={handleSubmit}
                variant="contained"
                disabled={
                    !formData.name ||
                    !formData.email ||
                    (!selectedUser && !formData.password) ||
                    updateUserMutation.isPending ||
                    createUserMutation.isPending
                }
            >
              {selectedUser
                  ? (updateUserMutation.isPending ? 'Updating...' : 'Update User')
                  : (createUserMutation.isPending ? 'Creating...' : 'Create User')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
        >
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action cannot be undone. All posts and comments by this user will also be deleted.
            </Alert>
            <Typography>
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?
            </Typography>
            {selectedUser?.role?.toUpperCase() === 'ADMIN' && (
                <Alert severity="error" sx={{ mt: 2 }}>
                  Warning: This user has ADMIN role. Deleting admin users may affect system functionality.
                </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button
                onClick={() => setOpenDeleteDialog(false)}
                disabled={deleteUserMutation.isPending}
            >
              Cancel
            </Button>
            <Button
                onClick={handleDeleteUser}
                color="error"
                variant="contained"
                disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
  );
};