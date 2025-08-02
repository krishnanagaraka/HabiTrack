import React, { useState } from 'react';
import { Box, Typography, IconButton, useTheme } from '@mui/material';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

const WEEKDAYS = ['Su', 'M', 'T', 'W', 'Th', 'F', 'Sa'];

const MIN_WIDTH = 42; // Increased from 36 to make calendar bigger

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfWeek(year, month) {
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

const HabitCalendar = ({ habit, habitIndex, completions = {}, weeklyStats = [], onLogEntry, onDateClick }) => {
  const theme = useTheme();
  // Force local date to avoid timezone issues
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const [current, setCurrent] = useState({
    year: today.getFullYear(),
    month: today.getMonth(),
  });



  const daysInMonth = getDaysInMonth(current.year, current.month);
  const firstDay = getFirstDayOfWeek(current.year, current.month);

  // Build calendar grid
  const calendarRows = [];
  let day = 1;
  let done = false;
  while (!done) {
    const week = [];
    for (let col = 0; col < 7; col++) {
      if (calendarRows.length === 0 && col < firstDay) {
        week.push(null);
      } else if (day > daysInMonth) {
        week.push(null);
        done = true;
      } else {
        week.push(day);
        day++;
      }
    }
    calendarRows.push(week);
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

  const handleDateClick = (date) => {
    if (!date) return;
    
    const dateStr = formatDate(current.year, current.month, date);
    // Force local date to avoid timezone issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(dateStr);
    selectedDate.setHours(0, 0, 0, 0);
    
    // Prevent clicking on future dates
    if (selectedDate > today) return;
    
    const existingEntry = completions[dateStr]?.[habitIndex];
    
    // Call the parent's onDateClick handler with more detailed information
    if (onDateClick) {
      onDateClick(dateStr, habitIndex, existingEntry, habit);
    } else {
      // Fallback to old behavior
      onLogEntry(dateStr, habitIndex, {
        completed: true,
        feeling: existingEntry?.feeling || 3,
        duration: existingEntry?.duration || '',
        notes: existingEntry?.notes || ''
      });
    }
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
      {/* Title with habit name and navigation */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1, px: 1, minHeight: 48 }}>
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

      {/* Weekday headers */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderTop: cellBorder,
          borderLeft: cellBorder,
          borderRight: cellBorder,
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
            <Typography sx={{ fontWeight: 700, fontSize: '0.75rem', letterSpacing: 1, color: textColor }}>{day}</Typography>
          </Box>
        ))}
      </Box>

      {/* Calendar grid */}
      {calendarRows.map((week, rowIdx) => (
        <Box
          key={rowIdx}
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderLeft: cellBorder,
            borderRight: cellBorder,
            background: cellBg,
          }}
        >
          {week.map((date, colIdx) => {
            if (!date) {
              return (
                <Box
                  key={colIdx}
                                  sx={{
                  minHeight: 42,
                  minWidth: MIN_WIDTH,
                  borderBottom: cellBorder,
                  borderRight: colIdx === 6 ? 'none' : cellBorder,
                  background: cellBg,
                  textAlign: 'center',
                  p: 0,
                }}
                />
              );
            }

            const dateStr = formatDate(current.year, current.month, date);
            const entry = completions[dateStr]?.[habitIndex];
            
            // More robust check for logged entries - handle both old and new formats
            let isLogged = false;
            if (entry) {
              if (typeof entry === 'object') {
                // New format: object with properties
                isLogged = entry.completed || entry.feeling > 0 || entry.progress || entry.notes;
              } else if (typeof entry === 'boolean') {
                // Old format: boolean
                isLogged = entry === true;
              } else if (entry) {
                // Any truthy value
                isLogged = true;
              }
            }
            // Force local date to avoid timezone issues
            const now = new Date();
            const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            const todayStr = formatDate(today.getFullYear(), today.getMonth(), today.getDate());
            const isToday = dateStr === todayStr;
            
            // Determine completion status based on habit type
            let isSuccessful = false;
            let isBelowTarget = false;
            
            if (isLogged && habit) {
              if (typeof entry === 'object') {
                // New format: object with properties
                if (habit.trackingType === "progress" && entry.progress) {
                  // Progress-based habit: check if target was met
                  const target = parseFloat(habit.target) || 0;
                  const progress = parseFloat(entry.progress) || 0;
                  isSuccessful = progress >= target;
                  isBelowTarget = progress < target && progress > 0;
                } else {
                  // Completion-based habit: check if completed
                  isSuccessful = entry.completed === true;
                  isBelowTarget = !entry.completed && (entry.feeling > 0 || entry.notes);
                }
              } else {
                // Old format: boolean or simple value
                isSuccessful = entry === true || (typeof entry === 'object' && entry.completed === true);
                isBelowTarget = false;
              }
            }

            return (
              <Box
                key={colIdx}
                onClick={() => handleDateClick(date)}
                sx={{
                  minHeight: 42,
                  minWidth: MIN_WIDTH,
                  borderBottom: cellBorder,
                  borderRight: colIdx === 6 ? 'none' : cellBorder,
                  background: cellBg,
                  textAlign: 'center',
                  fontWeight: 500,
                  fontSize: '0.9rem',
                  color: textColor,
                  position: 'relative',
                  p: 0,
                  cursor: 'pointer',
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                  },
                  ...(isToday && {
                    border: `2px solid ${theme.palette.primary.main}`,
                  }),
                }}
              >
                <Typography sx={{ fontSize: '0.8rem', fontWeight: isToday ? 'bold' : 'normal' }}>
                  {date}
                </Typography>
                {isLogged && (
                  <Box sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    background: isSuccessful ? '#27ae60' : isBelowTarget ? '#f39c12' : '#e74c3c',
                    position: 'absolute',
                    bottom: 4,
                    left: '50%',
                    transform: 'translateX(-50%)',
                  }} />
                )}
              </Box>
            );
          })}
        </Box>
      ))}


    </Box>
  );
};

export default HabitCalendar; 