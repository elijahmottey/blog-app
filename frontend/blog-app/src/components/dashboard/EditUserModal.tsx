// import React, { useState, useEffect } from 'react';
// import { useMutation, useQueryClient } from '@tanstack/react-query';
// import {
//     Modal,
//     Box,
//     Typography,
//     Button,
//     MenuItem,
//     FormControl,
//     InputLabel,
//     TextField,
//     Stack
// } from '@mui/material';
// //import Select, { SelectChangeEvent } from '@mui/material/Select';
// import BackendApi, { type UserDto } from '../../service/BackendApi';
// import { toast } from 'sonner';
// import { Roles } from '../../enums/Roles';
//
// interface EditUserModalProps {
//     open: boolean;
//     onClose: () => void;
//     user: UserDto | null;
// }
//
// export const EditUserModal: React.FC<EditUserModalProps> = ({ open, onClose, user }) => {
//     const queryClient = useQueryClient();
//     const [formData, setFormData] = useState({
//         name: '',
//         email: '',
//         password: '',
//         roles: '',
//     });
//
//     const isEditMode = !!user;
//
//     useEffect(() => {
//         if (isEditMode) {
//             setFormData({
//                 name: user.name || '',
//                 email: user.email || '',
//                 password: '',
//                 roles: user.roles || [],
//             });
//         } else {
//             setFormData({
//                 name: '',
//                 email: '',
//                 password: '',
//                 roles: [Roles.USER],
//             });
//         }
//     }, [user, isEditMode]);
//
//     const updateUserMutation = useMutation({
//         mutationFn: (updatedData: { userId: number; roles: Roles[] }) =>
//             BackendApi.updateUserRole(updatedData.userId, updatedData.roles),
//         onSuccess: () => {
//             toast.success('User updated successfully');
//             queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
//             onClose();
//         },
//         onError: (error: any) => {
//             toast.error(error.message || 'Failed to update user');
//         },
//     });
//
//     const createUserMutation = useMutation({
//         mutationFn: (newUserData: any) => BackendApi.createUser(newUserData),
//         onSuccess: () => {
//             toast.success('User created successfully');
//             queryClient.invalidateQueries({ queryKey: ['admin-users-list'] });
//             onClose();
//         },
//         onError: (error: any) => {
//             toast.error(error.message || 'Failed to create user');
//         },
//     });
//
//     const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//     };
//
//     const handleRoleChange = (event: SelectChangeEvent<Roles[]>) => {
//         const {
//             target: { value },
//         } = event;
//         setFormData(prev => ({
//             ...prev,
//             roles: typeof value === 'string' ? (value.split(',') as Roles[]) : value,
//         }));
//     };
//
//     const handleSave = () => {
//         if (isEditMode) {
//             updateUserMutation.mutate({ userId: user.id!, roles: formData.roles });
//         } else {
//             createUserMutation.mutate(formData);
//         }
//     };
//
//     const isLoading = updateUserMutation.isPending || createUserMutation.isPending;
//
//     return (
//         <Modal open={open} onClose={onClose}>
//             <Box
//                 sx={{
//                     position: 'absolute',
//                     top: '50%',
//                     left: '50%',
//                     transform: 'translate(-50%, -50%)',
//                     width: 400,
//                     bgcolor: 'background.paper',
//                     boxShadow: 24,
//                     p: 4,
//                     borderRadius: 2
//                 }}
//             >
//                 <Typography variant="h6" component="h2">
//                     {isEditMode ? 'Edit User' : 'Add New User'}
//                 </Typography>
//
//                 <Stack spacing={2} sx={{ mt: 2 }}>
//                     <TextField
//                         label="Name"
//                         name="name"
//                         value={formData.name}
//                         onChange={handleInputChange}
//                         disabled={isEditMode}
//                         fullWidth
//                     />
//                     <TextField
//                         label="Email"
//                         name="email"
//                         type="email"
//                         value={formData.email}
//                         onChange={handleInputChange}
//                         disabled={isEditMode}
//                         fullWidth
//                     />
//                     {!isEditMode && (
//                         <TextField
//                             label="Password"
//                             name="password"
//                             type="password"
//                             value={formData.password}
//                             onChange={handleInputChange}
//                             fullWidth
//                         />
//                     )}
//                     <FormControl fullWidth>
//                         <InputLabel>Roles</InputLabel>
//                         <Select
//                             multiple
//                             name="roles"
//                             value={formData.roles}
//                             onChange={handleRoleChange}
//                             label="Roles"
//                         >
//                             {Object.values(Roles).map((role) => (
//                                 <MenuItem key={role} value={role}>
//                                     {role}
//                                 </MenuItem>
//                             ))}
//                         </Select>
//                     </FormControl>
//                 </Stack>
//
//                 <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
//                     <Button onClick={onClose}>Cancel</Button>
//                     <Button
//                         variant="contained"
//                         onClick={handleSave}
//                         disabled={isLoading}
//                     >
//                         {isLoading ? 'Saving...' : 'Save'}
//                     </Button>
//                 </Box>
//             </Box>
//         </Modal>
//     );
// };
//
