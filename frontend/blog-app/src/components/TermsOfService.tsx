import React from 'react';
import { Box, Typography, Container, Paper, Divider } from '@mui/material';
import { FileText, Users } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', py: 6 }}>
      <Container maxWidth="md">
        <Paper sx={{ p: { xs: 3, md: 6 } }}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <FileText size={48} color="#1976d2" style={{ marginBottom: 16 }} />
            <Typography variant="h3" component="h1" sx={{ mb: 2, fontWeight: 'bold' }}>
              Terms of Service
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Last updated: {new Date().toLocaleDateString()}
            </Typography>
          </Box>

          <Box sx={{ '& h2': { mt: 4, mb: 2, fontWeight: 'bold' }, '& h3': { mt: 3, mb: 1.5, fontWeight: 600 }, '& p': { mb: 2, lineHeight: 1.6 } }}>

            <Typography variant="body1" sx={{ mb: 4, fontStyle: 'italic' }}>
              Welcome to DevBlog. By accessing or using our platform, you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, please do not use our service.
            </Typography>

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Acceptance of Terms
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              By accessing and using DevBlog, you accept and agree to be bound by the terms and provision of this agreement.
              These Terms apply to all users of the site, including without limitation users who are browsers, vendors,
              customers, merchants, and/or contributors of content.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              User Accounts
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, mb: 3 }}>
              <Users size={24} color="#666" />
              <Box>
                <Typography variant="h6" sx={{ mb: 1 }}>Account Creation</Typography>
                <Typography variant="body2">
                  To access certain features of our platform, you must register for an account.
                  You agree to provide accurate, current, and complete information during the registration process.
                </Typography>
              </Box>
            </Box>

            <Typography variant="body1" sx={{ mb: 2 }}>
              You are responsible for:
            </Typography>

            <Typography component="div" sx={{ mb: 4 }}>
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>Maintaining the confidentiality of your account credentials</li>
                <li style={{ marginBottom: 8 }}>All activities that occur under your account</li>
                <li style={{ marginBottom: 8 }}>Notifying us immediately of any unauthorized use of your account</li>
                <li style={{ marginBottom: 8 }}>Ensuring that you exit from your account at the end of each session</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Content and Conduct
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>User-Generated Content</Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              Our platform allows you to post, link, store, share and otherwise make available certain information,
              text, graphics, or other material ("Content"). You are responsible for the Content that you post.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              By posting Content, you grant us a non-exclusive, royalty-free, perpetual, and worldwide license to use,
              display, and distribute your Content on our platform.
            </Typography>

            <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>Prohibited Content and Conduct</Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              You agree not to use our platform to:
            </Typography>

            <Typography component="div" sx={{ mb: 4 }}>
              <ul style={{ paddingLeft: 20 }}>
                <li style={{ marginBottom: 8 }}>Post content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or invasive of another's privacy</li>
                <li style={{ marginBottom: 8 }}>Violate any intellectual property rights</li>
                <li style={{ marginBottom: 8 }}>Transmit any viruses, malware, or other harmful code</li>
                <li style={{ marginBottom: 8 }}>Attempt to gain unauthorized access to our systems</li>
                <li style={{ marginBottom: 8 }}>Interfere with the proper functioning of the platform</li>
                <li style={{ marginBottom: 8 }}>Use the platform for any commercial purposes without our written consent</li>
              </ul>
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Intellectual Property
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              The platform and its original content, features, and functionality are and will remain the exclusive property
              of DevBlog and its licensors. The platform is protected by copyright, trademark, and other laws.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              Our trademarks and trade dress may not be used in connection with any product or service without our prior written consent.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Termination
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              We may terminate or suspend your account and bar access to the platform immediately, without prior notice or liability,
              under our sole discretion, for any reason whatsoever and without limitation, including but not limited to a breach of the Terms.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              If you wish to terminate your account, you may simply discontinue using the platform.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Limitation of Liability
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              In no event shall DevBlog, nor its directors, employees, partners, agents, suppliers, or affiliates,
              be liable for any indirect, incidental, special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the platform.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Changes to Terms
            </Typography>

            <Typography variant="body1" sx={{ mb: 2 }}>
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time.
              If a revision is material, we will try to provide at least 30 days notice prior to any new terms taking effect.
            </Typography>

            <Typography variant="body1" sx={{ mb: 4 }}>
              By continuing to access or use our platform after those revisions become effective,
              you agree to be bound by the revised terms.
            </Typography>

            <Divider sx={{ my: 4 }} />

            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: 'primary.main' }}>
              Contact Information
            </Typography>

            <Box sx={{ bgcolor: 'grey.50', p: 3, borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>Email:</strong> legal@devblog.com<br />
                <strong>Address:</strong> 123 Developer Street, Tech City, TC 12345
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsOfService;