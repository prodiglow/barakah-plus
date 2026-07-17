import React from 'react';
import { Box, Typography } from '@mui/material';

const HowitsWork: React.FC = () => {
  return (
    <Box sx={{ width: '100%', backgroundColor: '#fff', py: 6 }}>
      <Box sx={{ maxWidth: '1250px', margin: '0 auto', px: { xs: 2, sm: 3 } }}>
        <Typography 
          variant="h3" 
          color='black' 
          align="center" 
          fontWeight={700} 
          gutterBottom
          sx={{ fontSize: { xs: 'h4.fontSize', sm: 'h3.fontSize' } }}
        >
          How It Works (3 Steps)
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          flexWrap: 'wrap', 
          justifyContent: 'center', 
          gap: 4, 
          mt: 4 
        }}>
          {/* Step 1 */}
          <Box sx={{ 
            p: 3, 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            textAlign: 'center', 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.33% - 32px)' },
            maxWidth: { xs: '100%', sm: 'calc(33.33% - 32px)' },
            boxSizing: 'border-box' 
          }}>
            <svg width="40" height="44" viewBox="0 0 40 44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.1953 1.70508L2.19531 25.7051H20.1953L18.1953 41.7051L38.1953 17.7051H20.1953L22.1953 1.70508Z" stroke="#1B281B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Typography variant="h5" gutterBottom color='black' align='left' fontWeight={500}>
              Choose Service & Verified Scholars
            </Typography>
            <Typography variant="body2" color='black' align='left'>
              Pick a Quran Khani, Zikar, or Dua that fits your intention. Browse verified scholars and Madrassas you trust.
            </Typography>
          </Box>

          {/* Step 2 */}
          <Box sx={{ 
            p: 3, 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            textAlign: 'center', 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.33% - 32px)' },
            maxWidth: { xs: '100%', sm: 'calc(33.33% - 32px)' },
            boxSizing: 'border-box' 
          }}>
            <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M25.3987 10.5502C25.0323 10.924 24.827 11.4266 24.827 11.9502C24.827 12.4737 25.0323 12.9763 25.3987 13.3502L28.5987 16.5502C28.9726 16.9166 29.4752 17.1219 29.9987 17.1219C30.5222 17.1219 31.0249 16.9166 31.3987 16.5502L38.9387 9.01016C39.9444 11.2325 40.2489 13.7086 39.8116 16.1084C39.3744 18.5083 38.2162 20.7178 36.4913 22.4427C34.7664 24.1676 32.5568 25.3258 30.157 25.7631C27.7572 26.2003 25.2811 25.8958 23.0587 24.8902L9.23873 38.7102C8.44308 39.5058 7.36395 39.9528 6.23873 39.9528C5.11352 39.9528 4.03438 39.5058 3.23873 38.7102C2.44308 37.9145 1.99609 36.8354 1.99609 35.7102C1.99609 34.5849 2.44308 33.5058 3.23873 32.7102L17.0587 18.8902C16.0531 16.6678 15.7486 14.1917 16.1858 11.7919C16.6231 9.39204 17.7813 7.18247 19.5062 5.4576C21.231 3.73273 23.4406 2.57449 25.8404 2.13724C28.2403 1.69999 30.7164 2.00448 32.9387 3.01015L25.4187 10.5302L25.3987 10.5502Z" stroke="#1B281B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <Typography variant="h5" fontWeight={500} gutterBottom color='black' align='left'>
              Pay Securely Online
            </Typography>
            <Typography variant="body2" color='black' align='left'>
              Pick a Quran Khani, Zikar, or Dua that fits your intention. Browse verified scholars and Madrassas you trust.
            </Typography>
          </Box>

          {/* Step 3 */}
          <Box sx={{ 
            p: 3, 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px', 
            textAlign: 'center', 
            flex: { xs: '1 1 100%', sm: '1 1 calc(33.33% - 32px)' },
            maxWidth: { xs: '100%', sm: 'calc(33.33% - 32px)' },
            boxSizing: 'border-box' 
          }}>
            <svg width="48" height="49" viewBox="0 0 48 49" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M32 14.9502V10.9502C32 8.74106 30.2091 6.9502 28 6.9502H20C17.7909 6.9502 16 8.74106 16 10.9502V14.9502M8 42.9502H40C42.2091 42.9502 44 41.1593 44 38.9502V18.9502C44 16.7411 42.2091 14.9502 40 14.9502H8C5.79086 14.9502 4 16.7411 4 18.9502V38.9502C4 41.1593 5.79086 42.9502 8 42.9502Z" stroke="#111827" strokeWidth="3"/>
            </svg>
            <Typography variant="h5" fontWeight={500} gutterBottom color='black' align='left'>
              Receive Confirmation, Updates & Blessings
            </Typography>
            <Typography variant="body2" color='black' align='left'>
              Pick a Quran Khani, Zikar, or Dua that fits your intention. Browse verified scholars and Madrassas you trust.
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HowitsWork;