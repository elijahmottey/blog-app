import React, { useState } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  TextField,
  Grid,
  Paper,
  Divider,
  useTheme,
  alpha
} from '@mui/material';
import {
  HelpCircle,
  ChevronDown,
  Mail,
  MessageCircle,
  FileText,
  ExternalLink,
  Search
} from 'lucide-react';
import { LIVBlogHeader, LIVBlogCard, LIVBlogLayout } from '../ui';
import useDocumentTitle from '../../hooks/useDocumentTitle';
import { toast } from 'sonner';

const faqs = [
  {
    question: 'How do I create a new blog post?',
    answer: 'To create a new post, navigate to the "Posts" section in the dashboard and click on the "Create Post" button. You can then use our rich text editor to write your content, add images, and format your post. Don\'t forget to add a relevant category and tags!'
  },
  {
    question: 'Can I edit my posts after publishing?',
    answer: 'Yes, absolutely! You can edit any of your posts at any time. Go to "My Posts", find the post you want to edit, and click the edit icon. Your changes will be updated immediately after you save.'
  },
  {
    question: 'How do I change my profile picture?',
    answer: 'Navigate to your "Profile" page from the user menu. Click on the "Edit Profile" button, and you\'ll see an option to upload a new profile picture. We support JPG and PNG formats.'
  },
  {
    question: 'Is there a limit to how many posts I can create?',
    answer: 'Currently, there is no limit to the number of posts you can create. We encourage you to share your thoughts and knowledge freely with the community!'
  },
  {
    question: 'How can I report inappropriate content?',
    answer: 'If you see content that violates our community guidelines, you can report it by clicking the "Report" flag icon on the post detail page. Our moderation team will review it shortly.'
  }
];

export const HelpSupport: React.FC = () => {
  useDocumentTitle('LIVBlog | Help & Support');
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send an API request
    console.log({ subject: contactSubject, message: contactMessage });
    toast.success('Your message has been sent to our support team!');
    setContactSubject('');
    setContactMessage('');
  };

  return (
    <LIVBlogLayout.Container>
      <LIVBlogHeader
        title="Help & Support"
        subtitle="Find answers to common questions or get in touch with our team."
        size="large"
      />

      <Grid container spacing={4}>
        {/* Left Column: FAQs */}
        <Grid item xs={12} md={8}>
          <LIVBlogCard
            title="Frequently Asked Questions"
            variant="elevated"
            padding="large"
            style={{ marginBottom: '32px' }}
          >
            <Box sx={{ mb: 3, position: 'relative' }}>
              <TextField
                fullWidth
                placeholder="Search for answers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search size={20} style={{ marginRight: '8px', color: theme.palette.text.secondary }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '12px',
                    backgroundColor: alpha(theme.palette.background.paper, 0.5),
                  }
                }}
              />
            </Box>

            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq, index) => (
                <Accordion
                  key={index}
                  elevation={0}
                  sx={{
                    border: `1px solid ${theme.palette.divider}`,
                    borderRadius: '8px !important',
                    mb: 2,
                    '&:before': { display: 'none' },
                    overflow: 'hidden'
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ChevronDown size={20} />}
                    sx={{
                      backgroundColor: alpha(theme.palette.primary.main, 0.03),
                      '& .MuiAccordionSummary-content': { margin: '12px 0' }
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={600}>
                      {faq.question}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ p: 2, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {faq.answer}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <HelpCircle size={48} style={{ color: theme.palette.text.disabled, marginBottom: '16px' }} />
                <Typography variant="body1" color="text.secondary">
                  No results found for "{searchQuery}"
                </Typography>
              </Box>
            )}
          </LIVBlogCard>

          <LIVBlogCard
            title="Contact Support"
            variant="elevated"
            padding="large"
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Can't find what you're looking for? Send us a message and we'll get back to you as soon as possible.
            </Typography>
            <form onSubmit={handleContactSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    variant="outlined"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    variant="outlined"
                    multiline
                    rows={4}
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    required
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    startIcon={<Mail size={18} />}
                    sx={{
                      borderRadius: '8px',
                      textTransform: 'none',
                      fontWeight: 600,
                      px: 4
                    }}
                  >
                    Send Message
                  </Button>
                </Grid>
              </Grid>
            </form>
          </LIVBlogCard>
        </Grid>

        {/* Right Column: Quick Links & Info */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <LIVBlogCard
              title="Quick Resources"
              variant="default"
              padding="medium"
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="outlined"
                  startIcon={<FileText size={18} />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: '8px', py: 1.5 }}
                >
                  Documentation
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<MessageCircle size={18} />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: '8px', py: 1.5 }}
                >
                  Community Forum
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<ExternalLink size={18} />}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', textAlign: 'left', borderRadius: '8px', py: 1.5 }}
                >
                  Video Tutorials
                </Button>
              </Box>
            </LIVBlogCard>

            <LIVBlogCard
              title="Support Hours"
              variant="default"
              padding="medium"
            >
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>Monday - Friday</Typography>
                <Typography variant="body2" color="text.secondary">9:00 AM - 6:00 PM EST</Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" fontWeight={600}>Weekend</Typography>
                <Typography variant="body2" color="text.secondary">Limited Support</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Mail size={16} color={theme.palette.primary.main} />
                <Typography variant="body2" fontWeight={500}>support@livblog.com</Typography>
              </Box>
            </LIVBlogCard>
          </Box>
        </Grid>
      </Grid>
    </LIVBlogLayout.Container>
  );
};
