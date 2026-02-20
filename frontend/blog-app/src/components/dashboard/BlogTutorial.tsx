import React, { useState, useEffect } from 'react';
import { Button, Typography, Box, Stepper, Step, StepLabel, StepContent, Chip } from '@mui/material';
import { Play, Pause, RotateCcw, CheckCircle, Image, Type, Hash } from 'lucide-react';
import { LIVBlogCard, LIVBlogHeader } from '../ui';
import { useTheme } from '@mui/material/styles';

const tutorialSteps = [
  {
    title: 'Choose a Compelling Title',
    description: 'Your title is the first thing readers see. Make it engaging and descriptive.',
    example: '# How to Build Amazing Web Applications',
    tips: ['Keep it under 60 characters', 'Use action words', 'Be specific and clear'],
    icon: <Type size={20} />
  },
  {
    title: 'Structure with Headers',
    description: 'Use headers to organize your content and make it scannable.',
    example: '## Introduction\n### What You\'ll Learn\n## Getting Started\n### Prerequisites',
    tips: ['Use # for main title', 'Use ## for sections', 'Use ### for subsections'],
    icon: <Hash size={20} />
  },
  {
    title: 'Add Visual Appeal with Images',
    description: 'Images make your posts more engaging and help illustrate your points.',
    example: '![Beautiful sunset](https://example.com/sunset.jpg)',
    tips: ['Use descriptive alt text', 'Choose high-quality images', 'Place images strategically'],
    icon: <Image size={20} />
  },
  {
    title: 'Format Your Content',
    description: 'Use formatting to emphasize important points and improve readability.',
    example: '**Bold text** for emphasis\n*Italic text* for subtle emphasis\n> Blockquotes for important notes',
    tips: ['Use bold sparingly', 'Break up long paragraphs', 'Add lists for easy reading'],
    icon: <CheckCircle size={20} />
  }
];

export const BlogTutorial: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [animationKey, setAnimationKey] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    let interval: number;
    if (isPlaying) {
      interval = window.setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= tutorialSteps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setCurrentStep(0);
    setIsPlaying(false);
    setAnimationKey(prev => prev + 1);
  };

  const renderExample = (example: string) => {
    return example.split('\n').map((line, index) => {
      // Handle headers
      if (line.startsWith('# ')) {
        return (
          <Typography key={index} variant="h4" sx={{ fontWeight: 'bold', color: theme.palette.primary.main, mb: 1 }}>
            {line.substring(2)}
          </Typography>
        );
      }
      if (line.startsWith('## ')) {
        return (
          <Typography key={index} variant="h5" sx={{ fontWeight: 'bold', color: theme.palette.secondary.main, mb: 1 }}>
            {line.substring(3)}
          </Typography>
        );
      }
      if (line.startsWith('### ')) {
        return (
          <Typography key={index} variant="h6" sx={{ fontWeight: 'bold', color: theme.palette.info.main, mb: 1 }}>
            {line.substring(4)}
          </Typography>
        );
      }
      
      // Handle images
      const imageMatch = line.match(/!\[([^\]]*)\]\(([^)]+)\)/);
      if (imageMatch) {
        const [, altText, imageUrl] = imageMatch;
        return (
          <Box key={index} sx={{ mb: 2, p: 2, border: '2px dashed', borderColor: theme.palette.primary.main, borderRadius: 2 }}>
            <Image size={24} style={{ color: theme.palette.primary.main, marginBottom: '8px' }} />
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
              Image: {altText}
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
              URL: {imageUrl}
            </Typography>
          </Box>
        );
      }

      // Handle blockquotes
      if (line.startsWith('> ')) {
        return (
          <Box key={index} sx={{ 
            borderLeft: `4px solid ${theme.palette.warning.main}`, 
            pl: 2, 
            py: 1, 
            backgroundColor: theme.palette.warning.light + '20',
            mb: 1
          }}>
            <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
              {line.substring(2)}
            </Typography>
          </Box>
        );
      }

      // Handle bold and italic
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      processedLine = processedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

      return (
        <Typography 
          key={index} 
          variant="body1" 
          sx={{ mb: 1 }}
          dangerouslySetInnerHTML={{ __html: processedLine }}
        />
      );
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
      <LIVBlogHeader
        title="How to Create Amazing Blog Posts"
        subtitle="Learn the secrets to writing engaging content on LIVBlog"
        size="large"
        actions={
          <div style={{ display: 'flex', gap: '12px' }}>
            <Button
              onClick={handlePlay}
              variant="contained"
              startIcon={isPlaying ? <Pause /> : <Play />}
              sx={{ borderRadius: '10px' }}
            >
              {isPlaying ? 'Pause' : 'Play'} Tutorial
            </Button>
            <Button
              onClick={handleReset}
              variant="outlined"
              startIcon={<RotateCcw />}
              sx={{ borderRadius: '10px' }}
            >
              Reset
            </Button>
          </div>
        }
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Steps Panel */}
        <LIVBlogCard title="Tutorial Steps" padding="large">
          <Stepper activeStep={currentStep} orientation="vertical">
            {tutorialSteps.map((step, index) => (
              <Step key={index}>
                <StepLabel
                  icon={
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: index <= currentStep ? theme.palette.primary.main : theme.palette.grey[300],
                      color: 'white',
                      transition: 'all 0.3s ease'
                    }}>
                      {step.icon}
                    </div>
                  }
                >
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {step.title}
                  </Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" sx={{ mb: 2, color: theme.palette.text.secondary }}>
                    {step.description}
                  </Typography>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {step.tips.map((tip, tipIndex) => (
                      <Chip
                        key={tipIndex}
                        label={tip}
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                      />
                    ))}
                  </div>
                  <div style={{ marginTop: '16px' }}>
                    <Button
                      size="small"
                      onClick={() => setCurrentStep(index)}
                      variant={currentStep === index ? 'contained' : 'outlined'}
                    >
                      {currentStep === index ? 'Current Step' : 'Go to Step'}
                    </Button>
                  </div>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </LIVBlogCard>

        {/* Preview Panel */}
        <LIVBlogCard title="Live Preview" padding="large">
          <div
            key={animationKey}
            style={{
              minHeight: '400px',
              animation: isPlaying ? 'fadeInUp 0.5s ease-out' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            {currentStep < tutorialSteps.length && (
              <>
                <div style={{
                  marginBottom: '16px',
                  padding: '12px',
                  backgroundColor: theme.palette.primary.light + '20',
                  borderRadius: '8px',
                  borderLeft: `4px solid ${theme.palette.primary.main}`
                }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
                    Step {currentStep + 1}: {tutorialSteps[currentStep].title}
                  </Typography>
                </div>

                <div style={{
                  padding: '20px',
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: '12px',
                  border: `1px solid ${theme.palette.divider}`,
                  minHeight: '300px'
                }}>
                  {renderExample(tutorialSteps[currentStep].example)}
                </div>

                <div style={{ marginTop: '16px' }}>
                  <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mb: 1 }}>
                    Markdown Code:
                  </Typography>
                  <Box sx={{
                    backgroundColor: theme.palette.grey[100],
                    padding: '12px',
                    borderRadius: '6px',
                    fontFamily: 'monospace',
                    fontSize: '0.875rem',
                    border: `1px solid ${theme.palette.divider}`
                  }}>
                    {tutorialSteps[currentStep].example}
                  </Box>
                </div>
              </>
            )}
          </div>
        </LIVBlogCard>
      </div>

      {/* Quick Tips */}
      <LIVBlogCard title="Pro Tips for Great Blog Posts" padding="large" style={{ marginTop: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div>
            <Typography variant="h6" sx={{ color: theme.palette.success.main, mb: 1 }}>
              📝 Writing Tips
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Start with an engaging hook</li>
              <li>Keep paragraphs short (3-4 lines)</li>
              <li>Use active voice</li>
              <li>End with a call-to-action</li>
            </ul>
          </div>
          <div>
            <Typography variant="h6" sx={{ color: theme.palette.info.main, mb: 1 }}>
              🎨 Visual Tips
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Use high-quality images</li>
              <li>Add images every 300-500 words</li>
              <li>Include descriptive alt text</li>
              <li>Optimize image sizes</li>
            </ul>
          </div>
          <div>
            <Typography variant="h6" sx={{ color: theme.palette.warning.main, mb: 1 }}>
              🚀 SEO Tips
            </Typography>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Use descriptive headers</li>
              <li>Include relevant keywords</li>
              <li>Write meta descriptions</li>
              <li>Link to related content</li>
            </ul>
          </div>
        </div>
      </LIVBlogCard>

      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};