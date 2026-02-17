# AWS Console Style Components

This guide explains how to use the AWS Console-style components for consistent styling throughout your blog application.

## Components Overview

### 1. AwsHeader
Consistent header component with AWS Console typography and spacing.

```tsx
import { AwsHeader } from './components/ui';

<AwsHeader
  title="Dashboard"
  subtitle="Manage your blog posts and analytics"
  size="large" // 'small' | 'medium' | 'large'
  actions={
    <Button variant="contained">Create Post</Button>
  }
/>
```

### 2. AwsCard
AWS Console-style card component with consistent styling.

```tsx
import { AwsCard } from './components/ui';

<AwsCard
  title="Card Title"
  subtitle="Optional subtitle"
  variant="default" // 'default' | 'outlined' | 'elevated'
  padding="medium" // 'none' | 'small' | 'medium' | 'large'
  hoverable={true}
  onClick={() => console.log('Card clicked')}
>
  <p>Card content goes here</p>
</AwsCard>
```

### 3. AwsLayout
Layout utilities for consistent spacing and grid layouts.

```tsx
import { AwsLayout } from './components/ui';

// Container
<AwsLayout.Container>
  <p>Content with max-width and centered</p>
</AwsLayout.Container>

// Section
<AwsLayout.Section>
  <p>Content with vertical padding</p>
</AwsLayout.Section>

// Grid
<AwsLayout.Grid cols={3} gap="lg">
  <div>Grid item 1</div>
  <div>Grid item 2</div>
  <div>Grid item 3</div>
</AwsLayout.Grid>
```

## CSS Utility Classes

### Typography
- `.aws-font` - Apply Amazon Ember font
- `.aws-header-xl` - Extra large header (2rem)
- `.aws-header-lg` - Large header (1.5rem)
- `.aws-header-md` - Medium header (1.25rem)
- `.aws-header-sm` - Small header (1.125rem)
- `.aws-text-body` - Body text (0.875rem)
- `.aws-text-body-lg` - Large body text (1rem)

### Cards
- `.aws-card` - Default card styling
- `.aws-card-outlined` - Outlined card variant
- `.aws-card-elevated` - Elevated card with shadow
- `.aws-card-clickable` - Clickable card with hover effects

### Spacing
- `.aws-spacing-xs` to `.aws-spacing-2xl` - Padding utilities
- `.aws-spacing-x-*` - Horizontal padding
- `.aws-spacing-y-*` - Vertical padding
- `.aws-margin-*` - Margin utilities

### Buttons
- `.aws-button` - Base button styling
- `.aws-button-primary` - Primary button
- `.aws-button-secondary` - Secondary button

### Layout
- `.aws-container` - Max-width container
- `.aws-section` - Section with padding
- `.aws-grid` - Grid layout
- `.aws-grid-cols-*` - Grid column utilities

## Font Usage

The Amazon Ember font is automatically applied to:
- All body text
- All headings (h1-h6)
- All components

To manually apply the font:
```css
font-family: 'Amazon Ember', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
```

## Consistent Heights

Use these classes for consistent card heights:
- `.aws-min-h-card-sm` - 150px minimum height
- `.aws-min-h-card` - 200px minimum height
- `.aws-min-h-card-lg` - 300px minimum height

## Theme Integration

All components automatically integrate with your Material-UI theme:

```tsx
import { useTheme } from '@mui/material/styles';

const MyComponent = () => {
  const theme = useTheme();
  
  return (
    <AwsCard>
      <p style={{ color: theme.palette.text.primary }}>
        This text uses theme colors
      </p>
    </AwsCard>
  );
};
```

## Responsive Design

All components are responsive by default:
- Mobile-first approach
- Automatic grid column adjustments
- Responsive typography scaling

## Best Practices

1. **Consistent Spacing**: Use the provided spacing utilities instead of custom margins/padding
2. **Typography**: Always use the AWS Console font classes for consistency
3. **Cards**: Use appropriate card variants based on content importance
4. **Headers**: Use proper header hierarchy (large -> medium -> small)
5. **Grid**: Use the grid system for consistent layouts

## Example Usage

```tsx
import React from 'react';
import { AwsHeader, AwsCard, AwsLayout } from './components/ui';
import { Button } from '@mui/material';

const MyPage = () => {
  return (
    <AwsLayout.Container>
      <AwsHeader
        title="My Dashboard"
        subtitle="Overview of your blog"
        size="large"
        actions={<Button variant="contained">New Post</Button>}
      />
      
      <AwsLayout.Grid cols={3} gap="lg">
        <AwsCard title="Posts" padding="medium">
          <div className="text-center">
            <div className="aws-header-lg">24</div>
            <p className="aws-text-body">Total posts</p>
          </div>
        </AwsCard>
        
        <AwsCard title="Views" padding="medium">
          <div className="text-center">
            <div className="aws-header-lg">1,234</div>
            <p className="aws-text-body">Page views</p>
          </div>
        </AwsCard>
        
        <AwsCard title="Users" padding="medium">
          <div className="text-center">
            <div className="aws-header-lg">89</div>
            <p className="aws-text-body">Active users</p>
          </div>
        </AwsCard>
      </AwsLayout.Grid>
    </AwsLayout.Container>
  );
};
```

This ensures consistent AWS Console styling throughout your entire application.