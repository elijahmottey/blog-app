import React from 'react';
import { Box, Typography, Container, Grid, Paper, Avatar, Chip } from '@mui/material';
import { Code, Users, BookOpen, Award } from 'lucide-react';

const About: React.FC = () => {
  const team = [
    {
      name: 'Sarah Johnson',
      role: 'Lead Developer',
      bio: 'Full-stack developer with 8+ years of experience in React and Node.js',
      avatar: 'SJ',
      skills: ['React', 'TypeScript', 'Node.js', 'AWS']
    },
    {
      name: 'Mike Chen',
      role: 'UI/UX Designer',
      bio: 'Creative designer focused on user-centered design and accessibility',
      avatar: 'MC',
      skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research']
    },
    {
      name: 'Alex Rodriguez',
      role: 'Content Strategist',
      bio: 'Technical writer and content creator specializing in developer education',
      avatar: 'AR',
      skills: ['Technical Writing', 'SEO', 'Content Strategy', 'React']
    }
  ];

  const values = [
    {
      icon: <Code size={32} />,
      title: 'Code Quality',
      description: 'We believe in writing clean, maintainable, and scalable code that stands the test of time.'
    },
    {
      icon: <Users size={32} />,
      title: 'Community First',
      description: 'Building a supportive community where developers can learn, share, and grow together.'
    },
    {
      icon: <BookOpen size={32} />,
      title: 'Knowledge Sharing',
      description: 'Making complex technical concepts accessible through clear, comprehensive tutorials.'
    },
    {
      icon: <Award size={32} />,
      title: 'Excellence',
      description: 'Striving for excellence in everything we do, from code to content to user experience.'
    }
  ];

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          py: { xs: 8, md: 12 },
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h2" component="h1" sx={{ mb: 3, fontWeight: 'bold' }}>
            About DevBlog
          </Typography>
          <Typography variant="h5" sx={{ mb: 4, opacity: 0.9 }}>
            Empowering developers through knowledge sharing and community building
          </Typography>
          <Typography variant="body1" sx={{ fontSize: '1.1rem', opacity: 0.8 }}>
            We're passionate about creating a platform where developers can share their expertise,
            learn from each other, and build amazing things together.
          </Typography>
        </Container>
      </Box>

      {/* Mission Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 8, md: 12 } }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Mission
          </Typography>
          <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary', maxWidth: 800, mx: 'auto' }}>
            To create the most comprehensive and accessible platform for developer education,
            fostering a global community of learners and educators.
          </Typography>
        </Box>

        {/* Values Grid */}
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {values.map((value, index) => (
            <Grid xs={12} sm={6} md={3} key={index}>
              <Paper
                sx={{
                  p: 3,
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' }
                }}
              >
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {value.icon}
                </Box>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  {value.title}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {value.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Team Section */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h2" sx={{ mb: 4, fontWeight: 'bold' }}>
            Meet Our Team
          </Typography>
          <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 600, mx: 'auto' }}>
            Our diverse team brings together expertise in development, design, and content creation
            to deliver the best possible experience for our community.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {team.map((member, index) => (
            <Grid xs={12} md={4} key={index}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main',
                    fontSize: '1.5rem',
                    fontWeight: 'bold'
                  }}
                >
                  {member.avatar}
                </Avatar>
                <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
                  {member.name}
                </Typography>
                <Typography variant="subtitle1" sx={{ mb: 2, color: 'primary.main' }}>
                  {member.role}
                </Typography>
                <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
                  {member.bio}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, justifyContent: 'center' }}>
                  {member.skills.map((skill) => (
                    <Chip
                      key={skill}
                      label={skill}
                      size="small"
                      variant="outlined"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Stats Section */}
        <Box sx={{ mt: 8, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold' }}>
            Our Impact
          </Typography>
          <Grid container spacing={4}>
            <Grid xs={12} sm={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                  10K+
                </Typography>
                <Typography variant="body1">Active Developers</Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                  500+
                </Typography>
                <Typography variant="body1">Published Articles</Typography>
              </Paper>
            </Grid>
            <Grid xs={12} sm={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h3" sx={{ color: 'primary.main', fontWeight: 'bold', mb: 1 }}>
                  50K+
                </Typography>
                <Typography variant="body1">Monthly Readers</Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>
      </Container>
    </Box>
  );
};

export default About;