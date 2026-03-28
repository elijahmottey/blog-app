import React, { useState } from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import {
  Typography,
  Box,
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
  Card,
  CardContent,
  Tooltip,
  Avatar,
  LinearProgress,
  InputAdornment,
  Badge,
  useTheme,
  alpha
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
  AdminPanelSettings,
  Group
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { toast } from 'sonner';
import BackendApi, { type UserRegistration } from '../../service/BackendApi';
import { LIVBlogHeader, LIVBlogCard, LIVBlogLayout } from '../ui';

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
  role: string; // API returns single role as string
  createdAt: string;
  updatedAt: string;
  posts?: any[]; // API returns posts array
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
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(50); // Increased to show more users
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



  // Safely extract users data - the API returns ApiResponse<PagedResponse<UserDto>>
  const users: ApiUser[] = apiResponse?.data?.content || [];
  const totalPages = apiResponse?.data?.totalPages || 0;
  const totalElements = apiResponse?.data?.totalElements || 0;

  // Filter users based on search (client-side filtering on current page)
  const filteredUsers = users.filter(user => {
    if (!user) return false;
    return (
        (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.role?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });

  // Decide which users to display
  // Note: When searching, we're filtering client-side which may not match pagination
  // For proper implementation, search should be server-side
  const displayUsers = searchTerm ? filteredUsers : users;

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
        return 'secondary';
      case 'MODERATOR':
        return 'warning';
      case 'EDITOR':
        return 'info';
      case 'USER':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      if (!dateString) return 'N/A';
      return format(new Date(dateString), 'MMM dd, yyyy');
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
    navigate(`/dashboard/admin/user/${user.id}/view`, {
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
          <CircularProgress size={60} thickness={4} />
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{ p: 3 }}>
          <Alert 
            severity="error" 
            sx={{ 
                mb: 2, 
                borderRadius: 2,
                boxShadow: theme.shadows[2]
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">Failed to load users</Typography>
            <Typography variant="body2">{(error as Error).message}</Typography>
          </Alert>
          <Button
              variant="contained"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{ borderRadius: 2 }}
          >
            Try Again
          </Button>
        </Box>
    );
  }

  return (
    <LIVBlogLayout.Container>
      <LIVBlogHeader
        title="Users Management"
        subtitle="Manage all registered users, roles, and permissions."
        size="large"
        actions={
          <Box sx={{
            display: 'flex',
            gap: 2,
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            width: { xs: '100%', md: 'auto' }
          }}>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<Refresh />}
              onClick={() => refetch()}
              sx={{ 
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '&:hover': { bgcolor: 'action.hover' }
              }}
            >
              Refresh Data
            </Button>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenCreateDialog}
              sx={{ 
                  borderRadius: 2,
                  boxShadow: theme.shadows[4]
              }}
            >
              Create User
            </Button>
          </Box>
        }
      />

        {/* Stats Cards */}
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(4, 1fr)'
            },
            gap: 3,
            mb: 4
        }}>
          <Card sx={{ 
              borderRadius: 3, 
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                          Total Users
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ mt: 1, color: 'text.primary' }}>
                          {totalElements || 0}
                      </Typography>
                  </Box>
                  <Avatar sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1), 
                      color: 'primary.main',
                      width: 56,
                      height: 56
                  }}>
                    <Group fontSize="large" />
                  </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
              borderRadius: 3, 
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                          Admins
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ mt: 1, color: 'secondary.main' }}>
                          {getAdminCount()}
                      </Typography>
                  </Box>
                  <Avatar sx={{ 
                      bgcolor: alpha(theme.palette.secondary.main, 0.1), 
                      color: 'secondary.main',
                      width: 56,
                      height: 56
                  }}>
                    <AdminPanelSettings fontSize="large" />
                  </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
              borderRadius: 3, 
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                          Total Posts
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ mt: 1, color: 'info.main' }}>
                          {getTotalPostsCount()}
                      </Typography>
                  </Box>
                  <Avatar sx={{ 
                      bgcolor: alpha(theme.palette.info.main, 0.1), 
                      color: 'info.main',
                      width: 56,
                      height: 56
                  }}>
                    <PostAdd fontSize="large" />
                  </Avatar>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ 
              borderRadius: 3, 
              boxShadow: theme.shadows[2],
              transition: 'transform 0.2s',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: theme.shadows[6] }
          }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                      <Typography variant="subtitle2" color="text.secondary" fontWeight="bold" textTransform="uppercase" letterSpacing={1}>
                          Total Comments
                      </Typography>
                      <Typography variant="h3" fontWeight="800" sx={{ mt: 1, color: 'success.main' }}>
                          {getTotalCommentsCount()}
                      </Typography>
                  </Box>
                  <Avatar sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1), 
                      color: 'success.main',
                      width: 56,
                      height: 56
                  }}>
                    <Comment fontSize="large" />
                  </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <LIVBlogCard
          variant="elevated"
          padding="none"
          style={{ overflow: 'hidden', borderRadius: theme.shape.borderRadius * 2 }}
        >
          {/* Search Bar Area */}
          <Box sx={{ 
              p: 3, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 2,
              bgcolor: alpha(theme.palette.background.default, 0.5)
          }}>
            <TextField
                placeholder="Search users by name, email, or role..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                variant="outlined"
                size="medium"
                sx={{ 
                    maxWidth: 500, 
                    width: '100%',
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.paper'
                    }
                }}
                InputProps={{
                  startAdornment: (
                      <InputAdornment position="start">
                        <Search color="action" />
                      </InputAdornment>
                  ),
                }}
            />
            <Typography variant="body2" color="text.secondary" fontWeight="medium">
                Showing <Typography component="span" color="text.primary" fontWeight="bold">{displayUsers.length}</Typography> of {totalElements} users
            </Typography>
          </Box>

          {/* Table Area */}
          <TableContainer>
            <Table sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow sx={{ bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>User Profile</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Access Role</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }} align="center">Activity</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }}>Joined Date</TableCell>
                  <TableCell sx={{ fontWeight: 600, py: 2 }} align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayUsers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: 0.6 }}>
                            <Search sx={{ fontSize: 60, mb: 2 }} />
                            <Typography variant="h6">
                            {searchTerm ? 'No matching users found' : 'No users available'}
                            </Typography>
                            <Typography variant="body2" mt={1}>
                            {searchTerm ? 'Try adjusting your search filters.' : 'Get started by adding a new user.'}
                            </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                ) : (
                    displayUsers.map((user) => (
                        <TableRow
                            key={user.id}
                            hover
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Badge
                                  color="secondary"
                                  variant="dot"
                                  overlap="circular"
                                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                  invisible={user.role?.toUpperCase() !== 'ADMIN'}
                                  sx={{ 
                                      '& .MuiBadge-badge': { 
                                          boxShadow: `0 0 0 2px ${theme.palette.background.paper}` 
                                      } 
                                  }}
                              >
                                <Avatar 
                                    src={user.avatar} // Assuming you might have avatar support later
                                    sx={{ 
                                        bgcolor: getRoleColor(user.role) + '.main',
                                        width: 48,
                                        height: 48,
                                        fontWeight: 'bold',
                                        fontSize: '1.2rem'
                                    }}
                                >
                                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                                </Avatar>
                              </Badge>
                              <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                  {user.name || 'Unnamed User'}
                                </Typography>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
                                  ID: #{user.id}
                                </Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Email fontSize="small" sx={{ color: 'text.disabled' }} />
                              <Typography variant="body2" fontWeight="medium">{user.email || 'No email'}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                                label={user.role || 'USER'}
                                size="small"
                                color={getRoleColor(user.role)}
                                variant="outlined"
                                icon={user.role?.toUpperCase() === 'ADMIN' ? <AdminPanelSettings fontSize="small" /> : <Person fontSize="small" />}
                                sx={{ 
                                    fontWeight: 'bold', 
                                    borderRadius: 1,
                                    borderWidth: 2
                                }}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                                <Tooltip title="Total Posts">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                            {getUserPostCount(user)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Posts</Typography>
                                    </Box>
                                </Tooltip>
                                <Tooltip title="Total Comments">
                                    <Box sx={{ textAlign: 'center' }}>
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">
                                            {getUserCommentCount(user)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">Cmnts</Typography>
                                    </Box>
                                </Tooltip>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="body2" fontWeight="medium">
                                {formatDate(user.createdAt)}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Active: {formatDate(user.updatedAt)}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                              <Tooltip title="View Detailed Profile">
                                <IconButton
                                    size="small"
                                    onClick={() => handleViewUserDetails(user)}
                                    sx={{ 
                                        color: 'primary.main',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                                    }}
                                >
                                  <Visibility fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit User">
                                <IconButton
                                    size="small"
                                    onClick={() => handleOpenEditDialog(user)}
                                    sx={{ 
                                        color: 'info.main',
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.info.main, 0.2) }
                                    }}
                                >
                                  <Edit fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete User">
                                <span>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpenDeleteDialog(user)}
                                        disabled={user.role?.toUpperCase() === 'ADMIN'}
                                        sx={{ 
                                            color: 'error.main',
                                            bgcolor: alpha(theme.palette.error.main, 0.1),
                                            '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) },
                                            '&.Mui-disabled': {
                                                bgcolor: 'action.disabledBackground',
                                                color: 'action.disabled'
                                            }
                                        }}
                                    >
                                    <Delete fontSize="small" />
                                    </IconButton>
                                </span>
                              </Tooltip>
                            </Box>
                          </TableCell>
                        </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
          
        {/* Pagination Footer */}
        {totalPages > 1 && (
            <Box sx={{ 
                p: 2, 
                borderTop: `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: alpha(theme.palette.background.default, 0.3)
            }}>
              <Typography variant="body2" color="text.secondary">
                Showing page <strong>{currentPage + 1}</strong> of <strong>{totalPages}</strong>
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mt: { xs: 2, sm: 0 } }}>
                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                    sx={{ borderRadius: 2 }}
                >
                  Previous
                </Button>
                
                <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
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
                                size="small"
                                variant={currentPage === pageNumber ? 'contained' : 'outlined'}
                                onClick={() => setCurrentPage(pageNumber)}
                                sx={{ 
                                    minWidth: '36px', 
                                    borderRadius: 2,
                                    ...(currentPage !== pageNumber && {
                                        borderColor: 'transparent',
                                        color: 'text.secondary',
                                        '&:hover': {
                                            borderColor: 'divider',
                                            bgcolor: 'action.hover'
                                        }
                                    })
                                }}
                            >
                            {pageNumber + 1}
                            </Button>
                        );
                    })}
                </Box>

                <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                    sx={{ borderRadius: 2 }}
                >
                  Next
                </Button>
              </Box>
            </Box>
        )}
        </LIVBlogCard>

        {/* Create/Edit User Dialog */}
        <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: { borderRadius: 3, boxShadow: theme.shadows[10] }
            }}
        >
          <DialogTitle sx={{ 
              pb: 2, 
              borderBottom: `1px solid ${theme.palette.divider}`,
              bgcolor: alpha(theme.palette.background.default, 0.5)
          }}>
            <Typography variant="h6" component="div" fontWeight="bold">
                {selectedUser ? 'Edit User Profile' : 'Create New User'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {selectedUser ? 'Update the details and permissions below.' : 'Fill in the details to add a new member.'}
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                  label="Full Name"
                  value={formData.name}
                  onChange={(e) => handleFormChange('name', e.target.value)}
                  fullWidth
                  required
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
                  InputProps={{
                      startAdornment: <InputAdornment position="start"><Person color="action" /></InputAdornment>
                  }}
              />
              <TextField
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange('email', e.target.value)}
                  fullWidth
                  required
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
                  InputProps={{
                      startAdornment: <InputAdornment position="start"><Email color="action" /></InputAdornment>
                  }}
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
                  label="Account Role"
                  value={formData.role}
                  onChange={(e) => handleFormChange('role', e.target.value)}
                  fullWidth
                  disabled={updateUserMutation.isPending || createUserMutation.isPending}
              >
                {['USER', 'ADMIN'].map((role) => (
                    <MenuItem key={role} value={role}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {role === 'ADMIN' ? <AdminPanelSettings fontSize="small" color="secondary" /> : <Person fontSize="small" color="primary" />}
                        <Typography fontWeight="medium">{role}</Typography>
                      </Box>
                    </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            {(updateUserMutation.isPending || createUserMutation.isPending) && (
                <Box sx={{ width: '100%', position: 'absolute', top: 0, left: 0 }}>
                    <LinearProgress color="primary" />
                </Box>
            )}
            <Button
                onClick={handleCloseDialog}
                disabled={updateUserMutation.isPending || createUserMutation.isPending}
                sx={{ borderRadius: 2, px: 3 }}
                color="inherit"
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
                sx={{ borderRadius: 2, px: 4, boxShadow: theme.shadows[4] }}
            >
              {selectedUser
                  ? (updateUserMutation.isPending ? 'Saving...' : 'Save Changes')
                  : (createUserMutation.isPending ? 'Creating...' : 'Create User')}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
            open={openDeleteDialog}
            onClose={() => setOpenDeleteDialog(false)}
            PaperProps={{
                sx: { borderRadius: 3, maxWidth: 450 }
            }}
        >
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <Delete /> Confirm Deletion
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
              This action is permanent and cannot be undone.
            </Alert>
            <Typography variant="body1">
              Are you sure you want to completely remove <strong>{selectedUser?.name}</strong> from the system? 
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                All their associated posts, comments, and data will be permanently deleted.
            </Typography>
            
            {selectedUser?.role?.toUpperCase() === 'ADMIN' && (
                <Alert severity="error" sx={{ mt: 3, borderRadius: 2, '& .MuiAlert-message': { fontWeight: 'bold' } }}>
                  DANGER: You are about to delete an Administrator account.
                </Alert>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 3, pt: 1 }}>
            <Button
                onClick={() => setOpenDeleteDialog(false)}
                disabled={deleteUserMutation.isPending}
                color="inherit"
                sx={{ borderRadius: 2 }}
            >
              Cancel
            </Button>
            <Button
                onClick={handleDeleteUser}
                color="error"
                variant="contained"
                disabled={deleteUserMutation.isPending}
                sx={{ borderRadius: 2, px: 3, boxShadow: theme.shadows[4] }}
            >
              {deleteUserMutation.isPending ? 'Deleting...' : 'Yes, Delete User'}
            </Button>
          </DialogActions>
        </Dialog>
    </LIVBlogLayout.Container>
  );
};