import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WEEKDAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa']; // Sunday to Saturday

const MIN_WIDTH = 42; // px (consistent with HabitCalendar)

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
  // Returns 0 for Sunday, 6 for Saturday
  return new Date(year, month, 1).getDay();
}

function getPrevMonth(year, month) {
  if (month === 0) return { year: year - 1, month: 11 };
  return { year, month: month - 1 };
}

function getNextMonth(year, month) {
  if (month === 11) return { year: year + 1, month: 0 };
  return { year, month: month + 1 };
}

function formatDate(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

const Calendar = ({ completions = {}, habits = [], weeklyStats = [] }) => {
  console.log('Calendar component received completions:', completions);
  console.log('Calendar component received habits:', habits);
  const theme = useTheme();
  
  // Force local date to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });

  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfWeek(current.year, current.month); // 0=Sunday

  // Build calendar grid: dynamically add rows until all days are included
  const calendarRows = [];
  let day = 1;
  let done = false;
  while (!done) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      if (calendarRows.length === 0 && col < firstDay) {
        week.push(null); // Empty cell before 1st
      } else if (day > daysInMonth) {
        week.push(null); // Empty cell after last day
        done = true;
      } else {
        week.push(day);
        day++;
      }
    }
    calendarRows.push(week);
    // If we've filled all days, but the last week isn't full, keep adding rows until the last day is included
    if (day > daysInMonth && week.every(cell => cell === null)) {
      break;
    }
  }

  const handlePrev = () => {
    setCurrent(getPrevMonth(current.year, current.month));
  };
  const handleNext = () => {
    setCurrent(getNextMonth(current.year, current.month));
  };

  // Theme-aware colors
  const borderColor = theme.palette.mode === 'dark' ? '#555' : '#222';
  const tileBg = theme.palette.mode === 'dark' 
    ? 'linear-gradient(135deg, #1e1e1e 0%, #2d2d2d 100%)' 
    : 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)';
  const cellBg = theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 30, 0.95)' 
    : 'rgba(44, 62, 80, 0.95)';
  const headerBg = theme.palette.mode === 'dark' 
    ? 'rgba(30, 30, 30, 1)' 
    : 'rgba(44, 62, 80, 1)';
  const textColor = theme.palette.mode === 'dark' ? '#e0e0e0' : 'white';
  const cellBorder = `1px solid ${borderColor}`;

  return (
    <Box sx={{ width: '100%', maxWidth: 320, mx: 'auto', mt: 1, p: 0, background: tileBg, borderRadius: 2 }}>
      {/* Title with month/year and navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, minHeight: 48 }}>
        <IconButton onClick={handlePrev} size="small" sx={{ mr: 0.5, p: 0.5, color: textColor }}>
          <ArrowBackIosNewIcon fontSize="inherit" />
        </IconButton>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, flex: 1, textAlign: 'center', letterSpacing: 1, fontSize: '1.1rem', color: textColor }}>
          {new Date(current.year, current.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
        </Typography>
        <IconButton onClick={handleNext} size="small" sx={{ ml: 0.5, p: 0.5, color: textColor }}>
          <ArrowForwardIosIcon fontSize="inherit" />
        </IconButton>
      </Box>
      {/* Weekday headers using CSS grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderTop: cellBorder,
          borderLeft: cellBorder,
          borderRight: cellBorder, // ensure right border
          background: headerBg,
        }}
      >
        {WEEKDAYS.map((day, idx) => (
          <Box
            key={day}
            sx={{
              textAlign: 'center',
              minWidth: MIN_WIDTH,
              minHeight: 42,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: cellBorder,
              borderRight: idx === 6 ? 'none' : cellBorder,
              background: headerBg,
            }}
          >
            <Typography sx={{ fontWeight: 700, fontSize: '0.85rem', letterSpacing: 1, color: textColor }}>{day}</Typography>
          </Box>
        ))}
      </Box>
      {/* 5 rows with dates below header */}
      {calendarRows.map((week, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderLeft: cellBorder,
            borderRight: cellBorder, // ensure right border
            background: cellBg,
          }}
        >
          {week.map((date, colIdx) => {
            // Removed unused content variable
            let circle = null;
            if (date) {
              const dateStr = formatDate(current.year, current.month, date);
              const dayLogs = completions[dateStr];
              
              let completedCount = 0;
              console.log('Checking date:', dateStr, 'dayLogs:', dayLogs);
              if (Array.isArray(dayLogs)) {
                // Old format: array of booleans
                completedCount = dayLogs.filter(Boolean).length;
                console.log('Array format - completedCount:', completedCount);
              } else if (dayLogs && typeof dayLogs === 'object') {
                // New format: object with habit indices as keys
                const validLogs = Object.values(dayLogs).filter(logData => 
                  logData && 
                  logData.completed === true && 
                  (logData.feeling > 0 || logData.progress || logData.notes)
                );
                completedCount = validLogs.length;
                console.log('Object format - dayLogs keys:', Object.keys(dayLogs), 'validLogs:', validLogs, 'completedCount:', completedCount);
              }
              if (completedCount > 0) {
                circle = (
                  <Box sx={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#27ae60 !important',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mt: 0.2,
                    border: '2px solid #27ae60',
                  }}>
                    <Typography sx={{ color: 'white', fontWeight: 700, fontSize: '0.8rem' }}>{completedCount}</Typography>
                  </Box>
                );
              }
            }
            return (
              <Box
                key={colIdx}
                sx={{
                  minHeight: 42,
                  minWidth: MIN_WIDTH,
                  borderBottom: cellBorder,
                  borderRight: colIdx === 6 ? 'none' : cellBorder,
                  background: cellBg,
                  ...(rowIdx === 4 && { borderBottom: cellBorder }), // bottom border for last row
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: textColor,
                  position: 'relative',
                  p: 0,
                }}
              >
                {date}
                {circle}
              </Box>
            );
          })}
        </Box>
      ))}



    </Box>
  );
};

export default Calendar; 