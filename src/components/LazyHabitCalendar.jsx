import React, { Suspense } from 'react';
import { Box, CircularProgress } from '@mui/material';

// Lazy load the HabitCalendar component
const HabitCalendar = React.lazy(() => import('../HabitCalendar'));

const LazyHabitCalendar = (props) => {
  return (
    <Suspense fallback={
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400,
        width: '100%'
      }}>
        <CircularProgress />
      </Box>
    }>
      <HabitCalendar {...props} />
    </Suspense>
  );
};

export default LazyHabitCalendar; 