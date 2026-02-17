import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import { LIVBlogCard, LIVBlogLayout } from './ui';

const CookieConsent = () => {
  const [showBanner, setShowBanner] = useState(false);
  const theme = useTheme();

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setShowBanner(false);
  };

  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-50" 
      style={{ 
        backgroundColor: theme.palette.background.paper,
        borderTop: `1px solid ${theme.palette.divider}`,
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.1)'
      }}
    >
      <LIVBlogLayout.Container>
        <div className="py-4">
          <LIVBlogCard
            variant="outlined" 
            padding="medium"
            className="border-0 shadow-none"
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex-1">
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ 
                    color: theme.palette.text.primary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    margin: 0,
                    lineHeight: 1.3
                  }}
                >
                  Cookie Preferences
                </h3>
                <p 
                  className="text-sm"
                  style={{ 
                    color: theme.palette.text.secondary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    margin: 0,
                    lineHeight: 1.4
                  }}
                >
                  We use essential cookies for authentication and site functionality. 
                  By clicking "Accept All", you consent to our use of cookies.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={acceptEssential}
                  className="px-4 py-2 text-sm rounded-md transition-colors"
                  style={{
                    border: `1px solid ${theme.palette.divider}`,
                    backgroundColor: 'transparent',
                    color: theme.palette.text.primary,
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.palette.action.hover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Essential Only
                </button>
                <button
                  onClick={acceptAll}
                  className="px-4 py-2 text-sm rounded-md transition-colors"
                  style={{
                    backgroundColor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    border: 'none',
                    fontFamily: 'Amazon Ember, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = theme.palette.primary.dark;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = theme.palette.primary.main;
                  }}
                >
                  Accept All
                </button>
              </div>
            </div>
          </LIVBlogCard>
        </div>
      </LIVBlogLayout.Container>
    </div>
  );
};

export default CookieConsent;
