import React from 'react';
import { Box, Typography, Container, Paper, Avatar, Chip } from '@mui/material';
import { Code, Users, BookOpen, Award } from 'lucide-react';

const About: React.FC = () => {
  const team = [
    {
      name: 'Elijah Mottey',
      role: 'Lead Developer',
      bio: 'Full-stack developer with  experience in React and Spring Boot',
      avatar: 'SJ',
      skills: ['React', 'TypeScript', 'Spring Boot', 'AWS' , 'Docker']
    },
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
            <Typography variant="h2" component="h1" sx={{ mb: 3, fontWeight: 'bold',color:'white' }}>
              About LIVBlog
            </Typography>
            <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, color:'white' }}>
              Empowering developers through knowledge sharing and community building
            </Typography>
            <Typography variant="body1" sx={{ fontSize: '1.1rem', opacity: 0.8, color:'white' }}>
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
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4, mb: 8 }}>
            {values.map((value, index) => (
                <Box
                    key={index}
                    sx={{
                      flex: '1 1 300px',
                      maxWidth: { xs: '100%', sm: 'calc(50% - 16px)', md: 'calc(33.333% - 16px)' },
                      minWidth: '250px'
                    }}
                >
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
                </Box>
            ))}
          </Box>

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

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {team.map((member, index) => (
                <Box
                    key={index}
                    sx={{
                      flex: '1 1 300px',
                      maxWidth: { xs: '100%', md: 'calc(33.333% - 16px)' },
                      minWidth: '250px'
                    }}
                >
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
                </Box>
            ))}
          </Box>
        </Container>
      </Box>
  );
};

export default About;