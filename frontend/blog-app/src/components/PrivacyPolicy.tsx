import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';
import { Shield, Lock, Database, User } from 'lucide-react';
import useDocumentTitle from "../hooks/useDocumentTitle.ts";

const PrivacyPolicy: React.FC = () => {
  useDocumentTitle('LIVBlog - Privacy Policy');
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Box sx={{ color: 'primary.main', display: 'inline-flex' }}>
              <Shield size={48} style={{ marginBottom: 16 }} />
            </Box>
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Privacy Policy
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ '& h2': { mt: 4, mb: 2, fontWeight: 'bold' }, '& h3': { mt: 3, mb: 1.5, fontWeight: 600 }, '& p': { mb: 2, lineHeight: 1.6 } }}>

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Information We Collect
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                <User size={24} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Personal Information</Typography>
                <Typography variant="body2">
                  When you register for an account, we collect your name, email address, and password.
                  This information is used to create and manage your account.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                <Database size={24} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Usage Data</Typography>
                <Typography variant="body2">
                  We collect information about how you use our platform, including pages visited,
                  time spent on the site, and interactions with content.
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 4 }}>
              <Box sx={{ color: 'text.secondary', display: 'inline-flex' }}>
                <Lock size={24} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Cookies and Tracking</Typography>
                <Typography variant="body2">
                  We use cookies and similar technologies to enhance your experience,
                  remember your preferences, and analyze site usage.
                </Typography>
              </Box>
            </Box>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              How We Use Your Information
            </Typography>

            <Typography component="div">
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>To provide and maintain our service</li>
                <li style={{ marginBottom: 8 }}>To notify you about changes to our service</li>
                <li style={{ marginBottom: 8 }}>To provide customer support</li>
                <li style={{ marginBottom: 8 }}>To gather analysis and valuable information for improving our service</li>
                <li style={{ marginBottom: 8 }}>To monitor the usage of our service</li>
                <li style={{ marginBottom: 8 }}>To detect, prevent and address technical issues</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Information Sharing and Disclosure
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              We do not sell, trade, or otherwise transfer your personal information to third parties without your consent,
              except as described in this policy.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              We may share your information in the following circumstances:
            </Typography>

            <Typography component="div">
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>With service providers who assist us in operating our platform</li>
                <li style={{ marginBottom: 8 }}>To comply with legal obligations</li>
                <li style={{ marginBottom: 8 }}>To protect and defend our rights and property</li>
                <li style={{ marginBottom: 8 }}>With your explicit consent</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Data Security
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              We implement appropriate security measures to protect your personal information against unauthorized access,
              alteration, disclosure, or destruction. However, no method of transmission over the internet is 100% secure.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Your Rights
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              You have the right to:
            </Typography>

            <Typography component="div">
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>Access the personal information we have about you</li>
                <li style={{ marginBottom: 8 }}>Correct any inaccurate personal information</li>
                <li style={{ marginBottom: 8 }}>Request deletion of your personal information</li>
                <li style={{ marginBottom: 8 }}>Object to or restrict processing of your personal information</li>
                <li style={{ marginBottom: 8 }}>Data portability</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Contact Us
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              If you have any questions about this Privacy Policy, please contact us:
            </Typography>

            <Box sx={(theme) => ({ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 1, border: `1px solid ${theme.palette.divider}` })}>
              <Typography variant="body2">
                <strong>Email:</strong> privacy@devblog.com<br />
                <strong>Address:</strong> 123 Developer Street, Tech City, TC 12345
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;