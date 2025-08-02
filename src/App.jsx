import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Grid,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  AppBar,
  Toolbar,
  Fab,
  CssBaseline,
  Tooltip,
  Tabs,
  Tab,
  ThemeProvider,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CircleIcon from "@mui/icons-material/Circle";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import TrendingFlatIcon from "@mui/icons-material/TrendingFlat";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import ChecklistIcon from '@mui/icons-material/Checklist';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';

import Calendar from './Calendar';
import HabitCalendar from './HabitCalendar';
import { useTheme } from './useTheme';

// Test data functions moved inline
import notificationService from './notificationService';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

// Custom hook for keyboard handling on mobile
const useKeyboardHandler = () => {
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const dialogRef = useRef(null);
  const initialViewportHeight = useRef(window.visualViewport?.height || window.innerHeight);

  useEffect(() => {
    const handleViewportResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile && window.visualViewport) {
        const currentHeight = window.visualViewport.height;
        const heightDifference = initialViewportHeight.current - currentHeight;
        
        // If viewport height decreased significantly, keyboard is likely visible
        if (heightDifference > 150) {
          setIsKeyboardVisible(true);
          // Scroll the dialog content into view
          if (dialogRef.current) {
            setTimeout(() => {
              const dialogContent = dialogRef.current?.querySelector('.MuiDialogContent-root');
              if (dialogContent) {
                dialogContent.scrollIntoView({ 
                  behavior: 'smooth', 
                  block: 'start' 
                });
              }
            }, 300);
          }
        } else {
          setIsKeyboardVisible(false);
        }
      }
    };

    const handleWindowResize = () => {
      const isMobile = window.innerWidth <= 768;
      if (isMobile) {
        const currentHeight = window.innerHeight;
        const heightDifference = initialViewportHeight.current - currentHeight;
        
        if (heightDifference > 200) {
          setIsKeyboardVisible(true);
        } else {
          setIsKeyboardVisible(false);
        }
      }
    };

    // Update initial height when component mounts
    initialViewportHeight.current = window.visualViewport?.height || window.innerHeight;

    window.visualViewport?.addEventListener('resize', handleViewportResize);
    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.visualViewport?.removeEventListener('resize', handleViewportResize);
      window.removeEventListener('resize', handleWindowResize);
    };
  }, []);

  return { isKeyboardVisible, dialogRef };
};

function App() {
  
  // All hooks must be called at the top, before any conditional returns
  const { darkMode, theme, toggleDarkMode } = useTheme();
  const { isKeyboardVisible, dialogRef } = useKeyboardHandler();
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });
  const [habit, setHabit] = useState({
    title: "",
    description: "",
    frequency: "daily",
    duration: "",
    times: "",
    startTime: "",
    weeklyDays: [],
    trackingType: "completion", // "completion" or "progress"
    units: "", // for progress tracking (e.g., "miles", "pages")
    target: "" // for progress tracking (e.g., "5")
  });
  const [editIndex, setEditIndex] = useState(null);
  const [open, setOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [habitFormStep, setHabitFormStep] = useState(1); // 1 = tracking type, 2 = habit details
  const [logEntry, setLogEntry] = useState(() => {
    // Get today's date in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    return {
      habitIndex: 0,
      date: todayString,
      feeling: 3,
      progress: '' // For progress tracking
    };
  });
  // Removed unused currentDate state
  const [completions, setCompletions] = useState(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : {};
  });
  const [weeklyHistory, setWeeklyHistory] = useState(() => {
    const saved = localStorage.getItem('weeklyHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentTab, setCurrentTab] = useState(0);
  const isDevelopment = false; // Disabled development mode for production
  const [bestStreakInfoOpen, setBestStreakInfoOpen] = useState(false);
  const [disciplineInfoOpen, setDisciplineInfoOpen] = useState(false);
  const [thisWeekInfoOpen, setThisWeekInfoOpen] = useState(false);
  const [last30DaysInfoOpen, setLast30DaysInfoOpen] = useState(false);
  const [sevenDayInfoOpen, setSevenDayInfoOpen] = useState(false);
  const [thirtyDayInfoOpen, setThirtyDayInfoOpen] = useState(false);
  const [bestNeedsInfoOpen, setBestNeedsInfoOpen] = useState(false);
  const [consistencyInfoOpen, setConsistencyInfoOpen] = useState(false);
  const [momentumInfoOpen, setMomentumInfoOpen] = useState(false);
  const [milestones, setMilestones] = useState(() => {
    const saved = localStorage.getItem('milestones');
    return saved ? JSON.parse(saved) : {};
  });
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] = useState(0);
  const [gapsInfoOpen, setGapsInfoOpen] = useState(false);

  const [onboardingOpen, setOnboardingOpen] = useState(() => !localStorage.getItem('onboardingComplete'));
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [editLog, setEditLog] = useState(null); // Track if editing a log
  const [logError, setLogError] = useState('');
  const [habitError, setHabitError] = useState('');
  const [selectedCalendarIndex, setSelectedCalendarIndex] = useState(0); // 0 = All Habits, 1+ = individual habits
  const [calendarLogModalOpen, setCalendarLogModalOpen] = useState(false);
  const [calendarLogEntry, setCalendarLogEntry] = useState(() => {
    // Get today's date in local timezone
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayString = `${year}-${month}-${day}`;
    
    return {
      habitIndex: 0,
      date: todayString,
      originalDate: todayString,
      completed: true,
      feeling: 3,
      notes: '',
      progress: ''
    };
  });

  // Add this helper function at the top-level of App
  const isFutureDate = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d > today;
  };



  // Helper function to get today's date in local timezone
  const getTodayString = () => {
    // Force local date to avoid timezone issues
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Milestone functions
  const getMilestoneThresholds = (habitType) => {
    if (habitType === 'progress') {
      return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000, 6000, 7000, 8000, 9000, 10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 50000, 60000, 70000, 80000, 90000, 100000];
    }
    return [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 60, 70, 80, 90, 100, 125, 150, 175, 200, 250, 300, 350, 400, 450, 500, 600, 700, 800, 900, 1000];
  };

  const getMilestoneEmoji = (milestone) => {
    // Major milestones (100s) - Biggest celebration
    if (milestone >= 1000) return '🏆🎉🎊';
    if (milestone >= 500) return '🏆🎉';
    if (milestone >= 250) return '🏆✨';
    if (milestone >= 200) return '🏆🌟';
    if (milestone >= 150) return '🏆💫';
    if (milestone >= 100) return '🏆';
    
    // Medium milestones (25s, 50s) - Medium celebration
    if (milestone >= 90) return '🥇🎉';
    if (milestone >= 80) return '🥇✨';
    if (milestone >= 70) return '🥇🌟';
    if (milestone >= 60) return '🥇💫';
    if (milestone >= 50) return '🥇';
    if (milestone >= 45) return '🥈🎉';
    if (milestone >= 40) return '🥈✨';
    if (milestone >= 35) return '🥈🌟';
    if (milestone >= 30) return '🥈💫';
    if (milestone >= 25) return '🥈';
    
    // Small milestones (10s) - Small celebration
    if (milestone >= 20) return '🥉🎉';
    if (milestone >= 15) return '🥉✨';
    if (milestone >= 10) return '🥉';
    
    // Micro milestones (5s) - Mini celebration
    if (milestone >= 5) return '⭐✨';
    
    return '⭐';
  };

  const getMilestoneEmojiBefore = (milestone) => {
    // Limit to 3 emojis before text
    const fullEmoji = getMilestoneEmoji(milestone);
    return fullEmoji.slice(0, 6); // Limit to 3 emojis (2 characters each)
  };

  const getMilestoneEmojiAfter = (milestone) => {
    // Limit to 3 emojis after text
    const fullEmoji = getMilestoneEmoji(milestone);
    return fullEmoji.length > 6 ? fullEmoji.slice(6) : '';
  };

  const formatMilestoneNumber = (number) => {
    if (number >= 1000) {
      return `${(number / 1000).toFixed(0)}K`;
    }
    return number.toString();
  };

  const getMilestoneMessage = (habitTitle, milestone, habitType, units) => {
    if (habitType === 'progress') {
      return `${formatMilestoneNumber(milestone)} ${units} (${habitTitle})`;
    }
    return `${formatMilestoneNumber(milestone)} ${habitTitle} sessions!`;
  };

  const getMilestoneCelebration = (milestone) => {
    // Different celebration levels based on milestone size
    if (milestone >= 100000) {
      return 'LEGENDARY! 👑🚀';
    } else if (milestone >= 50000) {
      return 'UNSTOPPABLE! 🔥💪';
    } else if (milestone >= 25000) {
      return 'PHENOMENAL! 🌟⚡';
    } else if (milestone >= 10000) {
      return 'EXTRAORDINARY! 🎊🚀';
    } else if (milestone >= 5000) {
      return 'INCREDIBLE! 🌟💫';
    } else if (milestone >= 2500) {
      return 'AMAZING! 🎯✨';
    } else if (milestone >= 1000) {
      return 'OUTSTANDING! 🏆🎉';
    } else if (milestone >= 500) {
      return 'FANTASTIC! 🌟';
    } else if (milestone >= 250) {
      return 'GREAT JOB! 💫';
    } else if (milestone >= 100) {
      return 'WELL DONE! 🎯';
    } else if (milestone >= 50) {
      return 'KEEP IT UP! 🎉';
    } else if (milestone >= 25) {
      return 'NICE WORK! ✨';
    } else if (milestone >= 10) {
      return 'GOOD START! 🌟';
    } else {
      return 'BEGINNING! ⭐';
    }
  };

  const calculateHabitMilestones = (habitIndex, habit) => {
    let totalCount = 0;
    
    // Count all completions for this habit
    Object.keys(completions).forEach(date => {
      if (date === '_durations' || date === '_feelings') return;
      
      const dayLogs = completions[date];
      if (Array.isArray(dayLogs) && dayLogs[habitIndex]) {
        totalCount++;
      } else if (dayLogs && typeof dayLogs === 'object' && dayLogs[habitIndex]) {
        if (habit.trackingType === 'progress') {
          const progress = parseFloat(dayLogs[habitIndex]?.progress) || 0;
          totalCount += progress;
        } else {
          totalCount++;
        }
      }
    });
    
    const thresholds = getMilestoneThresholds(habit.trackingType);
    let highestMilestone = 0;
    thresholds.forEach(threshold => {
      if (totalCount >= threshold) {
        highestMilestone = threshold;
      }
    });
    
    return totalCount;
  };

  const checkAndUpdateMilestones = (habitIndex, habit) => {
    const currentCount = calculateHabitMilestones(habitIndex, habit);
    const thresholds = getMilestoneThresholds(habit.trackingType);
    const habitKey = `${habitIndex}_${habit.title}`;
    
    if (!milestones[habitKey]) {
      milestones[habitKey] = { achieved: [], currentCount };
    }
    
    const newMilestones = [];
    thresholds.forEach(threshold => {
      if (currentCount >= threshold && !milestones[habitKey].achieved.includes(threshold)) {
        newMilestones.push({
          habitTitle: habit.title,
          milestone: threshold,
          achievedAt: new Date().toISOString(),
          habitType: habit.trackingType
        });
        milestones[habitKey].achieved.push(threshold);
      }
    });
    
    milestones[habitKey].currentCount = currentCount;
    
    if (newMilestones.length > 0) {
      setMilestones({ ...milestones });
      localStorage.setItem('milestones', JSON.stringify(milestones));
    }
    
    return newMilestones;
  };

  const getRecentMilestones = (days = 7) => {
    try {
      const habitMilestones = new Map(); // Use Map to track highest milestone per habit
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      // First, recalculate all milestones based on current completions
      habits.forEach((habit, habitIndex) => {
        const currentCount = calculateHabitMilestones(habitIndex, habit);
        const thresholds = getMilestoneThresholds(habit.trackingType);
        const habitKey = `${habitIndex}_${habit.title}`;
        
        // Find the highest milestone achieved based on current count
        let highestMilestone = 0;
        thresholds.forEach(threshold => {
          if (currentCount >= threshold) {
            highestMilestone = threshold;
          }
        });
        
        if (highestMilestone > 0) {
          habitMilestones.set(habit.title, {
            habitTitle: habit.title,
            milestone: highestMilestone,
            achievedAt: new Date().toISOString(),
            habitType: habit.trackingType,
            units: habit.units || 'units'
          });
        }
      });
      
      // Convert Map to array and sort by milestone value (highest first)
      const sortedMilestones = Array.from(habitMilestones.values())
        .sort((a, b) => b.milestone - a.milestone)
        .slice(0, 3); // Return top 3 highest milestones
      

      
      return sortedMilestones;
    } catch (error) {
      console.error('Error getting recent milestones:', error);
      return [];
    }
  };

  // Clean up old logs (older than 12 months) for performance
  const cleanupOldLogs = () => {
    const now = new Date();
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
    
    setCompletions(prev => {
      const newCompletions = { ...prev };
      let cleanedCount = 0;
      
      // Clean up main completion entries
      Object.keys(newCompletions).forEach(date => {
        // Skip special fields
        if (date === '_durations' || date === '_feelings') {
          return;
        }
        
        const logDate = new Date(date);
        if (logDate < twelveMonthsAgo) {
          delete newCompletions[date];
          cleanedCount++;
        }
      });
      
      // Clean up duration entries
      if (newCompletions._durations) {
        Object.keys(newCompletions._durations).forEach(date => {
          const logDate = new Date(date);
          if (logDate < twelveMonthsAgo) {
            delete newCompletions._durations[date];
          }
        });
      }
      
      // Clean up feeling entries
      if (newCompletions._feelings) {
        Object.keys(newCompletions._feelings).forEach(date => {
          const logDate = new Date(date);
          if (logDate < twelveMonthsAgo) {
            delete newCompletions._feelings[date];
          }
        });
      }
      
      if (cleanedCount > 0) {
      // Cleaned up old log entries
      }
      
      return newCompletions;
    });
  };

  // Clean up orphaned logs (logs for non-existent habits)
  const cleanupOrphanedLogs = () => {
    setCompletions(prev => {
      const newCompletions = { ...prev };
      let cleanedCount = 0;
      
      Object.keys(newCompletions).forEach(dateStr => {
        // Skip special fields
        if (dateStr === '_durations' || dateStr === '_feelings') {
          return;
        }
        
        const dateLogs = newCompletions[dateStr];
        
        if (Array.isArray(dateLogs)) {
          // Old format: check if any habit index is out of bounds
          const hasOrphanedLogs = dateLogs.some((log, index) => {
            return log && index >= habits.length;
          });
          
          if (hasOrphanedLogs) {
            // Remove logs for non-existent habits
            const cleanedLogs = dateLogs.slice(0, habits.length).map(log => 
              log && typeof log === 'object' ? log : null
            );
            newCompletions[dateStr] = cleanedLogs;
            cleanedCount++;
          }
        } else if (typeof dateLogs === 'object') {
          // New format: check if any habit index is out of bounds
          const hasOrphanedLogs = Object.keys(dateLogs).some(habitIndex => {
            return parseInt(habitIndex) >= habits.length;
          });
          
          if (hasOrphanedLogs) {
            // Remove logs for non-existent habits
            const cleanedLogs = {};
            Object.keys(dateLogs).forEach(habitIndex => {
              if (parseInt(habitIndex) < habits.length) {
                cleanedLogs[habitIndex] = dateLogs[habitIndex];
              }
            });
            newCompletions[dateStr] = cleanedLogs;
            cleanedCount++;
          }
        }
      });
      
      if (cleanedCount > 0) {
      // Cleaned up orphaned log entries
      }
      
      return newCompletions;
    });
  };

  // Notification scheduling functions
  const scheduleHabitNotifications = async (habit) => {
    try {
      await notificationService.scheduleNotification(habit);
    } catch (error) {
      // Error scheduling notification
    }
  };

  const cancelHabitNotifications = async (habit) => {
    await notificationService.cancelNotification(habit);
  };

  // All useEffect hooks must also be at the top
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Request notification permissions on app start
  useEffect(() => {
    const requestNotificationPermissions = async () => {
      try {
        await notificationService.requestPermissions();
        await notificationService.checkPermissions();
      } catch (error) {
        // Error requesting notification permissions
      }
    };
    
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  // Clean up old logs on app start and periodically
  useEffect(() => {
    // Run cleanup on app start
    cleanupOldLogs();
    cleanupOrphanedLogs();
    
    // Set up periodic cleanup (every 7 days)
    const cleanupInterval = setInterval(() => {
      cleanupOldLogs();
      cleanupOrphanedLogs();
    }, 7 * 24 * 60 * 60 * 1000); // 7 days in milliseconds
    
    return () => clearInterval(cleanupInterval);
  }, []);

  useEffect(() => {
    localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
  }, [weeklyHistory]);

  useEffect(() => {
    if (habits.length > 0) {
      const today = new Date();
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6);
      sevenDaysAgo.setHours(0, 0, 0, 0);
      
      const currentWeekKey = sevenDaysAgo.toISOString().split('T')[0];
      
      const weeklyStats = habits.map((habit, idx) => {
        const weekCompletions = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          if (completionDate < sevenDaysAgo || completionDate > today) return false;
          
          // Handle both old array format and new object format
          if (Array.isArray(completions[date])) {
            return completions[date][idx];
          } else if (completions[date] && typeof completions[date] === 'object') {
            return completions[date][idx] && completions[date][idx].completed;
          }
          return false;
        }).length;
        
        let totalDays;
        if (habit.frequency === 'daily') {
          totalDays = 7;
        } else if (habit.frequency === 'weekly') {
          // Count how many of the selected days fall within the last 7 days
          const selectedDays = habit.weeklyDays || [];
          let count = 0;
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(sevenDaysAgo);
            dayDate.setDate(sevenDaysAgo.getDate() + i);
            const dayOfWeek = dayDate.getDay(); // Sunday=0, Saturday=6
            if (selectedDays.includes(dayOfWeek)) {
              count++;
            }
          }
          totalDays = count;
        } else {
          totalDays = 7;
        }
        
        return {
          completed: weekCompletions,
          total: totalDays,
          percent: totalDays > 0 ? Math.round((weekCompletions / totalDays) * 100) : 0
        };
      });
      
      const totalPercent = weeklyStats.reduce((sum, stat) => sum + stat.percent, 0);
      const completionRate = Math.round(totalPercent / habits.length);
      
      if (weeklyHistory[currentWeekKey] !== completionRate) {
        setWeeklyHistory(prev => ({
          ...prev,
          [currentWeekKey]: completionRate
        }));
      }
    }
  }, [habits, completions]);

  // Remove this useEffect that was clearing data on every render
  // useEffect(() => {
  //   localStorage.removeItem('habits');
  //   localStorage.removeItem('completions');
  //   localStorage.removeItem('weeklyHistory');
  //   localStorage.removeItem('testData');
  // }, []);

  // Calculate real metrics
  const calculateMetrics = () => {
    if (habits.length === 0) return { disciplineScore: 0, weeklyStats: [], monthlyStats: [], streaks: [] };

    const today = new Date();
    // Calculate last 7 days (7 days ago from today)
    const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);
    
    const weeklyStats = habits.map((habit, idx) => {
      if (habit.trackingType === "progress") {
        // For progress-type habits, calculate based on actual progress values
        const weekProgressEntries = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          if (completionDate < sevenDaysAgo || completionDate > today) return false;
          
          // Handle both old array format and new object format
          if (Array.isArray(completions[date])) {
            return completions[date][idx] && completions[date][idx].progress;
          } else if (completions[date] && typeof completions[date] === 'object') {
            return completions[date][idx] && completions[date][idx].completed && completions[date][idx].progress;
          }
          return false;
        });
        
        // Sum up progress values, but cap each day at the target
        const target = parseFloat(habit.target) || 1;
        let totalProgress = 0;
        let completionDays = 0;
        
        weekProgressEntries.forEach(date => {
          let progress = 0;
          if (Array.isArray(completions[date])) {
            progress = parseFloat(completions[date][idx]?.progress) || 0;
          } else if (completions[date] && typeof completions[date] === 'object') {
            progress = parseFloat(completions[date][idx]?.progress) || 0;
          }
          // Cap progress at target per day
          const cappedProgress = Math.min(progress, target);
          totalProgress += cappedProgress;
          completionDays++;
        });
        
        // Calculate percentage based on total progress vs total target for the last 7 days
        let weeklyTarget;
        let count = 7; // Default for daily habits
        if (habit.frequency === 'weekly') {
          // For weekly habits, calculate how many times it should be done in the last 7 days
          const selectedDays = habit.weeklyDays || [];
          count = 0;
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(sevenDaysAgo);
            dayDate.setDate(sevenDaysAgo.getDate() + i);
            const dayOfWeek = dayDate.getDay(); // Sunday=0, Saturday=6
            if (selectedDays.includes(dayOfWeek)) {
              count++;
            }
          }
          weeklyTarget = target * count;
        } else {
          // For daily habits, use 7 days
          weeklyTarget = target * 7;
        }
        const percent = weeklyTarget > 0 ? parseFloat(((totalProgress / weeklyTarget) * 100).toFixed(1)) : 0;
        
        return {
          completed: completionDays,
          total: count,
          percent: percent,
          progress: totalProgress,
          target: weeklyTarget
        };
      } else {
        // For completion-type habits, use the existing logic
        const weekCompletions = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          if (completionDate < sevenDaysAgo || completionDate > today) return false;
          
          // Handle both old array format and new object format
          if (Array.isArray(completions[date])) {
            return completions[date][idx];
          } else if (completions[date] && typeof completions[date] === 'object') {
            return completions[date][idx] && completions[date][idx].completed;
          }
          return false;
        }).length;
        
        // Calculate total days based on habit frequency for last 7 days
        let totalDays;
        if (habit.frequency === 'daily') {
          // For daily habits, use 7 days
          totalDays = 7;
        } else if (habit.frequency === 'weekly') {
          // Count how many of the selected days fall within the last 7 days
          const selectedDays = habit.weeklyDays || [];
          let count = 0;
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(sevenDaysAgo);
            dayDate.setDate(sevenDaysAgo.getDate() + i);
            const dayOfWeek = dayDate.getDay(); // Sunday=0, Saturday=6
            if (selectedDays.includes(dayOfWeek)) {
              count++;
            }
          }
          totalDays = count;
        } else if (habit.frequency === 'monthly') {
          totalDays = Math.ceil((parseInt(habit.times) || 1) / 4); // Approximate weekly target
        } else {
          totalDays = 7;
        }
        
        return {
          completed: weekCompletions,
          total: totalDays,
          percent: totalDays > 0 ? Math.round((weekCompletions / totalDays) * 100) : 0
        };
      }
    });

    const monthlyStats = habits.map((habit, idx) => {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      
      if (habit.trackingType === "progress") {
        // For progress-type habits, calculate based on actual progress values
        const monthProgressEntries = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          if (completionDate < thirtyDaysAgo || completionDate > today) return false;
          
          // Handle both old array format and new object format
          if (Array.isArray(completions[date])) {
            return completions[date][idx] && completions[date][idx].progress;
          } else if (completions[date] && typeof completions[date] === 'object') {
            return completions[date][idx] && completions[date][idx].completed && completions[date][idx].progress;
          }
          return false;
        });
        
        // Sum up progress values, but cap each day at the target
        const target = parseFloat(habit.target) || 1;
        let totalProgress = 0;
        let completionDays = 0;
        
        monthProgressEntries.forEach(date => {
          let progress = 0;
          if (Array.isArray(completions[date])) {
            progress = parseFloat(completions[date][idx]?.progress) || 0;
          } else if (completions[date] && typeof completions[date] === 'object') {
            progress = parseFloat(completions[date][idx]?.progress) || 0;
          }
          // Cap progress at target per day
          const cappedProgress = Math.min(progress, target);
          totalProgress += cappedProgress;
          completionDays++;
        });
        
        // Calculate percentage based on total progress vs total target for the month
        let monthlyTarget;
        if (habit.frequency === 'weekly') {
          // For weekly habits, calculate based on weeks in a month
          const timesPerWeek = parseInt(habit.times) || 1;
          const weeksInMonth = 4; // Approximate
          monthlyTarget = target * timesPerWeek * weeksInMonth;
        } else {
          // For daily habits, use 30 days
          monthlyTarget = target * 30;
        }
        const percent = monthlyTarget > 0 ? parseFloat(((totalProgress / monthlyTarget) * 100).toFixed(1)) : 0;
        
        return {
          completed: completionDays,
          total: habit.frequency === 'weekly' ? (parseInt(habit.times) || 1) * 4 : 30,
          percent: percent,
          progress: totalProgress,
          target: monthlyTarget
        };
      } else {
        // For completion-type habits, use the existing logic
        const last30DaysCompletions = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          if (completionDate < thirtyDaysAgo || completionDate > today) return false;
          
          // Handle both old array format and new object format
          if (Array.isArray(completions[date])) {
            return completions[date][idx];
          } else if (completions[date] && typeof completions[date] === 'object') {
            return completions[date][idx] && completions[date][idx].completed;
          }
          return false;
        }).length;
        
        // Calculate total days based on habit frequency for last 30 days
        let totalDays;
        if (habit.frequency === 'daily') {
          totalDays = 30;
        } else if (habit.frequency === 'weekly') {
          // Count how many of the selected days fall within the last 30 days
          const selectedDays = habit.weeklyDays || [];
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          
          let count = 0;
          for (let i = 0; i < 30; i++) {
            const dayDate = new Date(thirtyDaysAgo);
            dayDate.setDate(thirtyDaysAgo.getDate() + i);
            const dayOfWeek = dayDate.getDay(); // Sunday=0, Saturday=6
            if (selectedDays.includes(dayOfWeek)) {
              count++;
            }
          }
          totalDays = count;
        } else {
          totalDays = 30;
        }
        
        return {
          completed: last30DaysCompletions,
          total: totalDays,
          percent: totalDays > 0 ? parseFloat(((last30DaysCompletions / totalDays) * 100).toFixed(1)) : 0
        };
      }
    });

    // Calculate weekly completion rate
    const totalPercent = weeklyStats.reduce((sum, stat) => sum + stat.percent, 0);
    const completionRate = habits.length > 0 ? parseFloat((totalPercent / habits.length).toFixed(1)) : 0;
    
    // Calculate weekly streak
    const calculateWeeklyStreak = () => {
      if (habits.length === 0) return 0;
      
      // Calculate streak by checking consecutive weeks
      let streak = 0;
      let checkDate = new Date(sevenDaysAgo);
      checkDate.setDate(checkDate.getDate() - 7); // Start from previous week
      
      while (true) {
        const weekKey = checkDate.toISOString().split('T')[0];
        const weekCompletion = weeklyHistory[weekKey];
        
        // Consider a week "completed" if average completion rate >= 70%
        if (weekCompletion && weekCompletion >= 70) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 7);
        } else {
          break;
        }
      }
      
      return streak;
    };
    
    // Calculate Hybrid Discipline Score
    const calculateHybridDisciplineScore = () => {
      if (habits.length === 0) return 0;
      
      // 1. Weekly Completion Rate (already calculated above)
      
      // 2. Streak Score
      const targetStreak = 4; // Target 4 weeks of consistency
      const currentStreak = calculateWeeklyStreak();
      const streakScore = Math.min(currentStreak / targetStreak, 1) * 100;
      
      // 3. Hybrid Formula: 50% Completion Rate + 50% Streak Score
      const hybridScore = parseFloat((0.5 * completionRate + 0.5 * streakScore).toFixed(1));
      
      return hybridScore;
    };
    
    const disciplineScore = calculateHybridDisciplineScore();

    // Calculate streaks (last 30 days only) - all habits count consecutive days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    // Helper function to format date consistently
    const formatDateForStreak = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const streaks = habits.map((habit, idx) => {
      let streak = 0;
      

      
      // Helper function to check if habit is completed (same as Dashboard)
      const isHabitCompleted = (dateStr, habitIdx, habit) => {
        let isCompleted = false;
        let meetsTarget = false;
        
        if (Array.isArray(completions[dateStr])) {
          isCompleted = completions[dateStr][habitIdx];
          if (habit.trackingType === 'progress' && isCompleted) {
            const progress = parseFloat(completions[dateStr][habitIdx]?.progress) || 0;
            const target = parseFloat(habit.target) || 1;
            meetsTarget = progress >= target;
          } else {
            meetsTarget = isCompleted;
          }
        } else if (completions[dateStr] && typeof completions[dateStr] === 'object') {
          isCompleted = completions[dateStr][habitIdx] && completions[dateStr][habitIdx].completed;
          if (habit.trackingType === 'progress' && isCompleted) {
            const progress = parseFloat(completions[dateStr][habitIdx]?.progress) || 0;
            const target = parseFloat(habit.target) || 1;
            meetsTarget = progress >= target;
          } else {
            meetsTarget = isCompleted;
          }
        }
        
        return habit.trackingType === 'progress' ? meetsTarget : isCompleted;
      };
      
      if (habit.frequency === 'daily') {
        // For daily habits, count consecutive days from today backwards
        let currentDateDaily = new Date(today);
        while (currentDateDaily >= thirtyDaysAgo) {
          const dateStr = formatDateForStreak(currentDateDaily);
          const isCompleted = isHabitCompleted(dateStr, idx, habit);
          

          
          if (isCompleted) {
            streak++;
            currentDateDaily.setDate(currentDateDaily.getDate() - 1);
          } else {
            break;
          }
        }
      } else if (habit.frequency === 'weekly') {
        // For weekly habits, count days when the habit was logged on the specific days it was supposed to be logged
        let currentDateWeekly = new Date(today);
        const selectedDays = habit.weeklyDays || [];
        
        while (currentDateWeekly >= thirtyDaysAgo) {
          const dateStr = formatDateForStreak(currentDateWeekly);
          const dayOfWeek = currentDateWeekly.getDay(); // Sunday=0, Saturday=6
          
          // Check if this day is one of the selected days for this habit
          if (selectedDays.includes(dayOfWeek)) {
            const isCompleted = isHabitCompleted(dateStr, idx, habit);
            

            
            if (isCompleted) {
              streak++;
            } else {
              break; // Stop counting when we find a scheduled day without completion
            }
          }
          
          currentDateWeekly.setDate(currentDateWeekly.getDate() - 1);
        }
      }
      

      
      return streak;
    });

    // Find best and worst performing habits for each metric
    const findBestWorstHabits = (stats) => {
      if (stats.length === 0) return { best: null, worst: null };
      
      const bestIndex = stats.reduce((best, current, index) => 
        current.percent > stats[best].percent ? index : best, 0);
      const worstIndex = stats.reduce((worst, current, index) => 
        current.percent < stats[worst].percent ? index : worst, 0);
      
      return {
        best: {
          habit: habits[bestIndex]?.title || '-',
          percent: stats[bestIndex]?.percent || 0
        },
        worst: {
          habit: habits[worstIndex]?.title || '-',
          percent: stats[worstIndex]?.percent || 0
        }
      };
    };

    const weeklyBestWorst = findBestWorstHabits(weeklyStats);
    const monthlyBestWorst = findBestWorstHabits(monthlyStats);

    return { 
      disciplineScore, 
      weeklyStats, 
      monthlyStats, 
      streaks,
      weeklyBestWorst,
      monthlyBestWorst
    };
  };

  const { 
    disciplineScore, 
    weeklyStats, 
    monthlyStats, 
    streaks,
    weeklyBestWorst,
    monthlyBestWorst
  } = calculateMetrics();
  
  // Find best and worst streaks and their habits
  const bestStreakValue = streaks.length > 0 ? Math.max(...streaks) : 0;
  const bestStreakIndex = streaks.findIndex(s => s === bestStreakValue);
  const bestStreakHabit = habits[bestStreakIndex]?.title || '-';
  // Removed unused worstStreakValue variable
  // Removed unused worstStreakIndex variable
  // Removed unused worstStreakHabit variable

  // Removed unused calendar helper functions

  // Handlers
  const handleOpen = () => {
    setHabit({
      title: "",
      description: "",
      frequency: "daily",
      duration: "",
      times: "",
      startTime: "",
      weeklyDays: [],
      trackingType: "completion",
      units: "",
      target: ""
    });
    setEditIndex(null);
    setHabitFormStep(1);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setHabit({
      title: "",
      description: "",
      frequency: "daily",
      duration: "",
      times: "",
      startTime: "",
      weeklyDays: [],
      trackingType: "completion",
      units: "",
      target: ""
    });
    setEditIndex(null);
    setHabitFormStep(1);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHabit(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = () => {
    if (habit.trackingType) {
      setHabitFormStep(2);
    }
  };

  const handlePrevStep = () => {
    setHabitFormStep(1);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    setHabitError('');
    if (habit.title.trim() === "") return;

    // Duplicate name validation (case-insensitive, ignore self if editing)
    const normalizedTitle = habit.title.trim().toLowerCase();
    const duplicate = habits.some((h, i) => i !== editIndex && h.title.trim().toLowerCase() === normalizedTitle);
    if (duplicate) {
      setHabitError('A habit with this name already exists. Please choose a different name.');
      return;
    }

    const newHabit = {
      ...habit,
      title: habit.title.trim(),
      description: habit.description.trim(),
      duration: habit.duration.trim(),
      times: habit.frequency === 'weekly' ? habit.weeklyDays.length.toString() : (habit.times || "1"),
      startTime: habit.startTime || "",
      weeklyDays: habit.weeklyDays || [],
      trackingType: habit.trackingType || "completion",
      units: habit.units || "",
      target: habit.target || ""
    };
    
    if (editIndex !== null) {
      setHabits(prev => prev.map((h, i) => i === editIndex ? newHabit : h));
      setEditIndex(null);
    } else {
      setHabits(prev => [...prev, newHabit]);
    }
    

    // Schedule notifications for the new habit
    if (newHabit.startTime) {
      scheduleHabitNotifications(newHabit);
    }
    
    setHabit({
      title: "",
      description: "",
      frequency: "daily",
      duration: "",
      times: "",
      startTime: "",
      weeklyDays: [],
      trackingType: "completion",
      units: "",
      target: ""
    });
    setOpen(false);
  };

  const handleEdit = (index) => {
    const habitToEdit = habits[index];
    setHabit(habitToEdit);
    setEditIndex(index);
    setOpen(true);
  };

  const handleDelete = (index) => {
    const habitToDelete = habits[index];
    
    if (window.confirm(`Are you sure you want to delete "${habitToDelete.title}"? This will also remove all associated logs and cannot be undone.`)) {
      // Cancel notifications for the habit being deleted
      cancelHabitNotifications(habitToDelete);
      

      
      // Delete the habit first
      setHabits(prev => {
        const newHabits = prev.filter((_, i) => i !== index);

        return newHabits;
      });
      
      // Rebuild completions object to fix indexing
      setCompletions(prev => {
        const newCompletions = {};
        
        // Preserve special fields
        if (prev._durations) newCompletions._durations = { ...prev._durations };
        if (prev._feelings) newCompletions._feelings = { ...prev._feelings };
        
        // Process each date
        Object.keys(prev).forEach(date => {
          // Skip special fields
          if (date === '_durations' || date === '_feelings') return;
          
          const dayLogs = prev[date];
          const newDayLogs = {};
          
          if (Array.isArray(dayLogs)) {
            // Old format: array of booleans - convert to new format and reindex
            dayLogs.forEach((completed, oldIndex) => {
              if (oldIndex !== index && completed) {
                const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
                newDayLogs[newIndex] = { completed: true };
              }
            });
          } else if (dayLogs && typeof dayLogs === 'object') {
            // New format: object with habit indices as keys - reindex
            Object.entries(dayLogs).forEach(([habitIndexStr, logData]) => {
              const oldIndex = parseInt(habitIndexStr);
              if (oldIndex !== index && logData && logData.completed) {
                const newIndex = oldIndex > index ? oldIndex - 1 : oldIndex;
                newDayLogs[newIndex] = { ...logData };
              }
            });
          }
          
          // Only add the date if there are logs
          if (Object.keys(newDayLogs).length > 0) {
            newCompletions[date] = newDayLogs;
          }
        });
        
        
        
        return newCompletions;
      });
    }
  };

  // Helper to get all logs as an array (last 30 days only)
  const getLogs = (filterHabitIndex = null) => {
    // Safety check - if no habits, return empty array
    if (!habits || habits.length === 0) {
      return [];
    }
    
    const logs = [];
    
    Object.entries(completions).forEach(([date, dayLogs]) => {
      // Skip special fields and invalid dates
      if (date === '_durations' || date === '_feelings' || !dayLogs || typeof dayLogs !== 'object') {
        return;
      }
      
      const logDate = new Date(date);
      
      // Skip future dates only (keep all past logs)
      if (logDate > new Date()) {
        return;
      }
      
      // Handle both old array format and new object format
      if (Array.isArray(dayLogs)) {
        // Old format: array of booleans
        dayLogs.forEach((completed, idx) => {
          // Apply filter if specified
          if (filterHabitIndex !== null && idx !== filterHabitIndex) {
            return;
          }
          
          // Check if habit exists at this index before accessing
          if (completed && habits[idx]) {
            const duration = completions._durations && completions._durations[date] && completions._durations[date][idx];
            const feeling = completions._feelings && completions._feelings[date] && completions._feelings[date][idx];
            logs.push({ 
              date, 
              habit: habits[idx].title, 
              habitIndex: idx, 
              duration, 
              feeling, 
              progress: ''
            });
          }
        });
      } else {
        // New format: object with habit indices as keys
        Object.entries(dayLogs).forEach(([habitIndex, logData]) => {
          const idx = parseInt(habitIndex);
          
          // Apply filter if specified
          if (filterHabitIndex !== null && idx !== filterHabitIndex) {
            return;
          }
          
          if (logData && logData.completed && idx >= 0 && idx < habits.length && habits[idx]) {
            logs.push({ 
              date, 
              habit: habits[idx].title, 
              habitIndex: idx, 
              duration: logData.duration || '',
              feeling: logData.feeling || 3,
              progress: logData.progress || '',
              notes: logData.notes || ''
            });
          }
        });
      }
    });
    
    // Sort logs by date descending
    logs.sort((a, b) => b.date.localeCompare(a.date));
    
    return logs;
  };

  const handleEditLog = (log) => {
    setEditLog(log);
    setLogEntry({
      habitIndex: log.habitIndex,
      date: log.date,
      feeling: log.feeling || 3,
      duration: log.duration || '',
      progress: log.progress || ''
    });
    setLogModalOpen(true);
  };

  const handleDeleteLog = (log) => {
    // Placeholder: remove the log from completions
    if (window.confirm(`Delete log for ${log.habit} on ${log.date}?`)) {
      setCompletions(prev => {
        const newCompletions = { ...prev };
        if (newCompletions[log.date]) {
          newCompletions[log.date][log.habitIndex] = false;
        }
        return newCompletions;
      });
    }
  };



  const handleLogModalOpen = () => {
    setLogModalOpen(true);
    setEditLog(null);
    setLogEntry({
      habitIndex: 0,
      date: getTodayString(),
      feeling: 3,
      progress: ''
    });
  };

  const handleLogModalClose = () => {
    setLogModalOpen(false);
    setEditLog(null);
    setLogEntry({
      habitIndex: 0,
      date: getTodayString(),
      feeling: 3,
      progress: ''
    });
    setLogError('');
  };

  const handleLogChange = (field, value) => {
    setLogEntry(prev => ({ ...prev, [field]: value }));
  };

  const getFeelingEmoji = (feeling) => {
    switch (feeling) {
      case 1: return '😞';
      case 2: return '😐';
      case 3: return '😊';
      case 4: return '😄';
      case 5: return '🤩';
      default: return '😊';
    }
  };

  const getFeelingText = (feeling) => {
    switch (feeling) {
      case 1: return 'Terrible';
      case 2: return 'Bad';
      case 3: return 'Okay';
      case 4: return 'Good';
      case 5: return 'Great';
      default: return 'Okay';
    }
  };

  const handleLogHabit = () => {
    if (!logEntry.date || logEntry.habitIndex === undefined) return;

    // Check for future dates
    if (isFutureDate(logEntry.date)) {
      setLogError('Cannot log for a future date. Please select today or a past date.');
      return;
    }

    // Check for duplicate entries
    const existingEntry = completions[logEntry.date]?.[logEntry.habitIndex];
    if (existingEntry && !editLog) {
      setLogError('Date logged already. Select different date.');
      return;
    }

    // Check if progress is required for progress-type habits
    const selectedHabit = habits[logEntry.habitIndex];
    if (selectedHabit?.trackingType === "progress" && !logEntry.progress) {
      setLogError('Progress is required for progress-type habits.');
      return;
    }

    setLogError(''); // Clear any previous errors

    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (!newCompletions[logEntry.date]) {
        newCompletions[logEntry.date] = [];
      }
      newCompletions[logEntry.date][logEntry.habitIndex] = {
        completed: true,
        feeling: logEntry.feeling,
        progress: logEntry.progress,
        notes: logEntry.notes || ''
      };
      return newCompletions;
    });

    // Check for new milestones
    const habit = habits[logEntry.habitIndex];
    if (habit) {
      checkAndUpdateMilestones(logEntry.habitIndex, habit);
    }

    handleLogModalClose();
  };

  const handleHabitCalendarLogEntry = (date, habitIndex, logEntry) => {
    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (!newCompletions[date]) {
        newCompletions[date] = [];
      }
      newCompletions[date][habitIndex] = {
        completed: true,
        feeling: logEntry.feeling,
        progress: logEntry.progress,
        notes: logEntry.notes || ''
      };
      return newCompletions;
    });
  };

  const handleOnboardingClose = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingOpen(false);
    setOnboardingStep(1); // Reset to first step for next time
  };

  const handleOnboardingNext = () => {
    setOnboardingStep(2);
  };

  const handleOnboardingPrev = () => {
    setOnboardingStep(1);
  };

  const handleSkipOnboarding = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingOpen(false);
    setOnboardingStep(1); // Reset to first step for next time
  };

  // Calendar carousel functions
  const handleCalendarPrev = () => {
    setSelectedCalendarIndex(prev => {
      if (prev === 0) return habits.length; // Wrap to last habit
      return prev - 1;
    });
  };

  const handleCalendarNext = () => {
    setSelectedCalendarIndex(prev => {
      if (prev === habits.length) return 0; // Wrap to All Habits
      return prev + 1;
    });
  };

  const getCalendarTitle = () => {
    if (selectedCalendarIndex === 0) return "All Habits";
    const habit = habits[selectedCalendarIndex - 1];
    return habit ? habit.title : "All Habits";
  };

  // Calendar date click handler
  const handleCalendarDateClick = (dateStr, habitIndex, existingEntry) => {
    if (selectedCalendarIndex === 0) return; // Don't allow clicks on "All Habits" calendar
    
    setCalendarLogEntry({
      habitIndex: habitIndex,
      date: dateStr,
      originalDate: dateStr, // Store original date for editing
      completed: existingEntry?.completed || true,
      feeling: existingEntry?.feeling || 3,
      duration: existingEntry?.duration || '',
      notes: existingEntry?.notes || '',
      progress: existingEntry?.progress || '',
      isExistingEntry: !!existingEntry // Flag to track if this is an existing entry
    });
    setCalendarLogModalOpen(true);
  };

  // Handle calendar log submission
  const handleCalendarLogSubmit = () => {
    const { habitIndex, date, completed, feeling, duration, notes, progress } = calendarLogEntry;
    
    // Check for future dates
    if (isFutureDate(date)) {
      // Don't allow submission of future dates
      return;
    }
    
    // Check if progress is required for progress-type habits
    const selectedHabit = habits[habitIndex];
    if (selectedHabit?.trackingType === "progress" && !progress) {
      // Show error message - we'll need to add error state for calendar modal
      alert('Progress is required for progress-type habits.');
      return;
    }
    
    // Get the original date from when the modal was opened
    const originalDate = calendarLogEntry.originalDate || date;
    
    // Update completions - remove from old date if different, add to new date
    setCompletions(prev => {
      const newCompletions = { ...prev };
      
      // If date changed, remove from original date
      if (originalDate !== date && newCompletions[originalDate]) {
        const updatedOriginalDate = { ...newCompletions[originalDate] };
        delete updatedOriginalDate[habitIndex];
        
        // If no more entries for this date, remove the date entirely
        if (Object.keys(updatedOriginalDate).length === 0) {
          delete newCompletions[originalDate];
        } else {
          newCompletions[originalDate] = updatedOriginalDate;
        }
      }
      
      // Add to new date
      newCompletions[date] = {
        ...newCompletions[date],
        [habitIndex]: {
          completed,
          feeling,
          duration,
          notes,
          progress
        }
      };
      
      return newCompletions;
    });

    // Check for new milestones
    const habit = habits[habitIndex];
    if (habit) {
      checkAndUpdateMilestones(habitIndex, habit);
    }

    setCalendarLogModalOpen(false);
  };

  // Handle calendar log change
  const handleCalendarLogChange = (field, value) => {
    setCalendarLogEntry(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Calculate additional metrics for new dashboard tiles
  const calculateDashboardMetrics = () => {
    try {
      // Force local date to avoid timezone issues
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 6); // 6 days back to get 7 days total including today (July 23-29)
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 29); // 29 days back to get 30 days total including today
      
      // Helper function to check if habit is completed
    const isHabitCompleted = (dateStr, habitIdx, habit) => {
      let isCompleted = false;
      let meetsTarget = false;
      
      if (Array.isArray(completions[dateStr])) {
        isCompleted = completions[dateStr][habitIdx];
        if (habit.trackingType === 'progress' && isCompleted) {
          const progress = parseFloat(completions[dateStr][habitIdx]?.progress) || 0;
          const target = parseFloat(habit.target) || 1;
          meetsTarget = progress >= target;
        } else {
          meetsTarget = isCompleted;
        }
      } else if (completions[dateStr] && typeof completions[dateStr] === 'object') {
        isCompleted = completions[dateStr][habitIdx] && completions[dateStr][habitIdx].completed;
        if (habit.trackingType === 'progress' && isCompleted) {
          const progress = parseFloat(completions[dateStr][habitIdx]?.progress) || 0;
          const target = parseFloat(habit.target) || 1;
          meetsTarget = progress >= target;
        } else {
          meetsTarget = isCompleted;
        }
      }
      
        const result = habit.trackingType === 'progress' ? meetsTarget : isCompleted;
        
        return result;
      };

      // Helper function to check if a habit was logged (regardless of target)
      const isHabitLogged = (dateStr, habitIdx, habit) => {
        let isLogged = false;
        
        if (Array.isArray(completions[dateStr])) {
          isLogged = completions[dateStr][habitIdx];
        } else if (completions[dateStr] && typeof completions[dateStr] === 'object') {
          isLogged = completions[dateStr][habitIdx] && completions[dateStr][habitIdx].completed;
        }
        
        return isLogged;
    };
    
    // Helper function to format date consistently
    const formatDateForMetrics = (date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

      // Calculate total logs across all time (for new rule)
      let totalLogsAllTime = 0;
      Object.keys(completions).forEach(date => {
        if (date === '_durations' || date === '_feelings') return;
        
        if (completions[date]) {
          if (Array.isArray(completions[date])) {
            const count = completions[date].filter(Boolean).length;
            totalLogsAllTime += count;
          } else if (typeof completions[date] === 'object') {
            const count = Object.values(completions[date]).filter(logData => logData && logData.completed).length;
            totalLogsAllTime += count;
          }
        }
      });

      // Check if there's at least 1 habit and at least 1 log total (new rule)
      const hasMinimumActivity = habits.length >= 1 && totalLogsAllTime >= 1;
      
      // Calculate real metrics
    let sevenDayCompletions = 0;
    let sevenDayTotal = 0;
    let thirtyDayCompletions = 0;
    let thirtyDayTotal = 0;
      let totalLogsInLast30Days = 0;
    let bestStreakValue = 0;
      let bestStreakHabit = '';
      
      // Calculate 7-day and 30-day metrics
    habits.forEach((habit, idx) => {
        // 7-day calculation
        let currentDate7 = new Date(sevenDaysAgo);
        while (currentDate7 <= today) {
          const dateStr = formatDateForMetrics(currentDate7);
          const dayOfWeek = currentDate7.getDay();
          
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'weekly') {
          isScheduled = habit.weeklyDays.includes(dayOfWeek);
        }
        
        if (isScheduled) {
            sevenDayTotal++;
            const isLogged = isHabitLogged(dateStr, idx, habit);
            if (isLogged) {
              sevenDayCompletions++;
            }
          }
          
          currentDate7.setDate(currentDate7.getDate() + 1);
        }
        
        // 30-day calculation - FIXED: Use same logic as 7-day
        let currentDate30 = new Date(thirtyDaysAgo);
        while (currentDate30 <= today) {
          const dateStr = formatDateForMetrics(currentDate30);
          const dayOfWeek = currentDate30.getDay();
          
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'weekly') {
          isScheduled = habit.weeklyDays.includes(dayOfWeek);
        }
        
        if (isScheduled) {
            thirtyDayTotal++;
            const isLogged = isHabitLogged(dateStr, idx, habit);
            if (isLogged) {
              thirtyDayCompletions++;
            }
          }
          
          currentDate30.setDate(currentDate30.getDate() + 1);
        }
        
        // Calculate streak for this habit
        let currentStreak = 0;
        let maxStreak = 0;
        let currentDateStreak = new Date(today);
        const oneEightyDaysAgo = new Date(today);
        oneEightyDaysAgo.setDate(today.getDate() - 180);
        
        while (currentDateStreak >= oneEightyDaysAgo) {
          const dateStr = formatDateForMetrics(currentDateStreak);
          const dayOfWeek = currentDateStreak.getDay();
          
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'weekly') {
          isScheduled = habit.weeklyDays.includes(dayOfWeek);
        }
        
        if (isScheduled) {
          const isCompleted = isHabitCompleted(dateStr, idx, habit);
            if (isCompleted) {
              currentStreak++;
              maxStreak = Math.max(maxStreak, currentStreak);
            } else {
              currentStreak = 0;
            }
          }
          
          currentDateStreak.setDate(currentDateStreak.getDate() - 1);
        }
        
        if (maxStreak > bestStreakValue) {
          bestStreakValue = maxStreak;
          bestStreakHabit = habit.title;
        }
      });
      
      // Calculate total logs in last 30 days
      let currentDate30Logs = new Date(thirtyDaysAgo);
      while (currentDate30Logs <= today) {
        const dateStr = formatDateForMetrics(currentDate30Logs);
        if (completions[dateStr]) {
          if (Array.isArray(completions[dateStr])) {
            totalLogsInLast30Days += completions[dateStr].filter(Boolean).length;
          } else if (typeof completions[dateStr] === 'object') {
            totalLogsInLast30Days += Object.values(completions[dateStr]).filter(logData => logData && logData.completed).length;
          }
        }
        currentDate30Logs.setDate(currentDate30Logs.getDate() + 1);
      }
      
      // Calculate rates
      const sevenDayRate = sevenDayTotal > 0 ? parseFloat(((sevenDayCompletions / sevenDayTotal) * 100).toFixed(1)) : 0;
      

      

      
      // Calculate 30-day rate using the same logic as 7-day
      const thirtyDayRate = thirtyDayTotal > 0 ? parseFloat(((thirtyDayCompletions / thirtyDayTotal) * 100).toFixed(1)) : 0;
      
      // Calculate momentum (last 7 days vs previous 7 days)
      let momentum = 0;
      
      // Calculate previous 7 days rate (7 days before the current 7 days)
      let previousSevenDayCompletions = 0;
      let previousSevenDayTotal = 0;
      
      const fourteenDaysAgo = new Date(today);
      fourteenDaysAgo.setDate(today.getDate() - 14); // 14 days back to get 7 days for previous period
      const sevenDaysAgoForPrev = new Date(today);
      sevenDaysAgoForPrev.setDate(today.getDate() - 7);
    
    habits.forEach((habit, idx) => {
        let currentDatePrev = new Date(fourteenDaysAgo);
        while (currentDatePrev <= sevenDaysAgoForPrev) {
          const dateStr = formatDateForMetrics(currentDatePrev);
          const dayOfWeek = currentDatePrev.getDay();
          
        let isScheduled = false;
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'weekly') {
          isScheduled = habit.weeklyDays.includes(dayOfWeek);
        }
        
        if (isScheduled) {
            previousSevenDayTotal++;
            const isLogged = isHabitLogged(dateStr, idx, habit);
            if (isLogged) {
              previousSevenDayCompletions++;
            }
          }
          
          currentDatePrev.setDate(currentDatePrev.getDate() + 1);
        }
      });
      
      const previousSevenDayRate = previousSevenDayTotal > 0 ? parseFloat(((previousSevenDayCompletions / previousSevenDayTotal) * 100).toFixed(1)) : 0;
      
      // Calculate momentum as difference between current 7-day rate and previous 7-day rate
      momentum = parseFloat((sevenDayRate - previousSevenDayRate).toFixed(1));
      
      // Calculate gaps in last 7 days (days with no logs)
      let missedDays = 0;
      let scheduledDays = 0;
      

      
      if (hasMinimumActivity) {
        // Count days with no logs in last 7 days (including today)
        let currentDateGaps = new Date(sevenDaysAgo);
        
        for (let i = 0; i < 7; i++) {
          const dateStr = formatDateForMetrics(currentDateGaps);
          const dayOfWeek = currentDateGaps.getDay();
          
          let dayHasScheduledHabit = false;
          let dayHasAnyLog = false;
          
          // Check if any habit was scheduled for this day
          habits.forEach((habit, idx) => {
            let isScheduled = false;
            if (habit.frequency === 'daily') {
              isScheduled = true;
            } else if (habit.frequency === 'weekly') {
              isScheduled = habit.weeklyDays.includes(dayOfWeek);
            }
            
            if (isScheduled) {
              dayHasScheduledHabit = true;
            }
          });
          
          // Check if there are any logs for this day (any habit, any progress)
          if (completions[dateStr]) {
            if (Array.isArray(completions[dateStr])) {
              dayHasAnyLog = completions[dateStr].some(Boolean);
            } else if (typeof completions[dateStr] === 'object') {
              dayHasAnyLog = Object.values(completions[dateStr]).some(logData => logData && logData.completed);
            }
          }
          
          if (dayHasScheduledHabit) {
            scheduledDays++;
            if (!dayHasAnyLog) {
              missedDays++;
            }
          }
          

          
          currentDateGaps.setDate(currentDateGaps.getDate() + 1);
        }
      }
      
      // Other metrics
      const needsImprovementHabit = '';
      const needsImprovementRate = 100;
      const consistencyRate = hasMinimumActivity ? 70 : 0;
      const hasWeekOfData = hasMinimumActivity;
    
    return {
      sevenDayRate,
      thirtyDayRate,
      bestStreakHabit,
      bestStreakValue,
      needsImprovementHabit,
        needsImprovementRate,
      consistencyRate,
        momentum,
      missedDays,
      scheduledDays,
      hasMinimumActivity,
      totalLogsInLast30Days,
        totalLogsAllTime,
      hasWeekOfData,
      recentMilestones: getRecentMilestones()
    };
    } catch (error) {
      console.error('Error calculating dashboard metrics:', error);
      // Return default values to prevent crash
      return {
        sevenDayRate: 0,
        thirtyDayRate: 0,
        bestStreakHabit: '',
        bestStreakValue: 0,
        needsImprovementHabit: '',
        needsImprovementRate: 0,
        consistencyRate: 0,
        momentum: 0,
        missedDays: 0,
        scheduledDays: 0,
        hasMinimumActivity: false,
        totalLogsInLast30Days: 0,
        totalLogsAllTime: 0,
        hasWeekOfData: false,
        recentMilestones: []
      };
    }
  };


  const dashboardMetrics = calculateDashboardMetrics();

  const renderDashboard = () => (
    <Box>
      {/* New Dashboard Tiles */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr 1fr', // 2 columns on extra small screens (portrait phones)
          sm: '1fr 1fr 1fr', // 3 columns on small screens (landscape phones)
          md: '1fr 1fr 1fr', // 3 columns on medium screens (tablets)
          lg: '1fr 1fr 1fr 1fr', // 4 columns on large screens (10-inch tablet landscape)
          xl: '1fr 1fr 1fr 1fr 1fr 1fr' // 6 columns on extra large screens (desktop)
        },
        gap: 2,
        mb: 3,
        width: '100%'
      }}>
        {/* 1. Last 7 Days Completion Rate */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0 
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 600, mb: 1 }}>
              Last 7 Days
            </Typography>
            
            {dashboardMetrics.hasMinimumActivity ? (
              <>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: dashboardMetrics.sevenDayRate < 33 ? '#e74c3c' : 
                         dashboardMetrics.sevenDayRate < 66 ? '#f39c12' : '#27ae60', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  {dashboardMetrics.sevenDayRate}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 1 }}>
                  habits completed this week
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.85rem', sm: '0.95rem' }, fontStyle: 'italic' }}>
                  {(() => {
                    if (dashboardMetrics.sevenDayRate > 100) {
                      return 'Amazing! You exceeded your goal! 🎉';
                    } else if (dashboardMetrics.sevenDayRate >= 90) {
                      return 'Outstanding! Keep up the amazing work!';
                    } else if (dashboardMetrics.sevenDayRate >= 75) {
                      return 'Great job! You\'re crushing it!';
                    } else if (dashboardMetrics.sevenDayRate >= 50) {
                      return `Good progress! Try to hit ${Math.min(75, Math.ceil(dashboardMetrics.sevenDayRate + 25))}%`;
                    } else {
                      return `Try to hit ${Math.min(75, Math.ceil(dashboardMetrics.sevenDayRate + 25))}%, you can do it`;
                    }
                  })()}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  --
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.8rem', sm: '0.9rem', md: '0.85rem' }, mb: 1, lineHeight: 1.3 }}>
                  Log 3+ habits this week to see your progress
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.7rem' }, fontStyle: 'italic' }}>
                  Start logging your habits
                </Typography>
              </>
            )}
            </CardContent>
            <IconButton 
              onClick={() => setSevenDayInfoOpen(true)} 
              sx={{ 
                position: 'absolute', 
                top: 8, 
                right: 8, 
                p: 0.5,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.2)'
                }
              }}
            >
              <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 16, sm: 18 } }} />
            </IconButton>
          </Card>

        {/* 2. Last 30 Days Completion Rate */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0 
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 600, mb: 1 }}>
              Last 30 Days
            </Typography>
            {dashboardMetrics.hasMinimumActivity ? (
              <>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: dashboardMetrics.thirtyDayRate < 33 ? '#e74c3c' : 
                         dashboardMetrics.thirtyDayRate < 66 ? '#f39c12' : '#27ae60', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  {dashboardMetrics.thirtyDayRate}%
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 1 }}>
                  habits completed in last 30 days
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  --
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.8rem' }, mb: 1, lineHeight: 1.3 }}>
                  Log 10+ habits to see your progress
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.7rem' }, fontStyle: 'italic' }}>
                  Start logging your habits regularly
                </Typography>
              </>
            )}

          </CardContent>
          <IconButton 
            onClick={() => setThirtyDayInfoOpen(true)} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              p: 0.5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>
        </Card>

        {/* 3. Momentum */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0 
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 600, mb: 1 }}>
              Momentum
            </Typography>
            {dashboardMetrics.hasWeekOfData ? (
              <>
                                <Typography variant="h3" sx={{ fontWeight: 'bold', color: dashboardMetrics.momentum > 0 ? '#27ae60' : dashboardMetrics.momentum < 0 ? '#e74c3c' : '#f39c12', fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  {Math.abs(dashboardMetrics.momentum)}%
                  {dashboardMetrics.momentum > 0 ?
                    <TrendingUpIcon sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem', md: '1.95rem' }, color: '#27ae60' }} /> :
                    dashboardMetrics.momentum < 0 ?
                    <TrendingDownIcon sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem', md: '1.95rem' }, color: '#e74c3c' }} /> :
                    <TrendingFlatIcon sx={{ fontSize: { xs: '1.35rem', sm: '1.65rem', md: '1.95rem' }, color: '#f39c12' }} />
                  }
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 1 }}>
                  {dashboardMetrics.momentum > 0 ? 'Up in the last 7 days!' : 
                   dashboardMetrics.momentum < 0 ? 'Down in the last 7 days' : 
                   dashboardMetrics.sevenDayRate < 75 ? 'Ready to build momentum!' : 
                   'Maintaining consistency!'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontStyle: 'italic' }}>
                  {dashboardMetrics.momentum > 0 ? 'You\'re on a positive streak!' : 
                   dashboardMetrics.momentum < 0 ? 'Easy to recover and get back on track' : 
                   Math.abs(dashboardMetrics.momentum) === 0 && dashboardMetrics.sevenDayRate < 75 ? 'Time to improve your momentum!' : 
                   Math.abs(dashboardMetrics.momentum) === 0 ? 'You\'re being consistent - great job!' : 
                   'Small improvements lead to big changes!'}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  --
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.8rem' }, mb: 1, lineHeight: 1.3 }}>
                  Log data at least for a week to see your momentum
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.7rem' }, fontStyle: 'italic' }}>
                  Start logging your habits
                </Typography>
              </>
            )}
          </CardContent>
          <IconButton 
            onClick={() => setMomentumInfoOpen(true)} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              p: 0.5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>
        </Card>

        {/* 4. Milestones */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0,
          overflow: 'hidden'
        }}>
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
            pointerEvents: 'none'
          }} />
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, height: '100%', position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="h6" sx={{ 
                fontSize: { xs: '1.125rem', sm: '1.25rem' }, 
                fontWeight: 600
              }}>
                Milestones
              </Typography>
              <Box sx={{
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderRadius: '12px',
                px: 1,
                py: 0.5,
                minWidth: '24px',
                textAlign: 'center'
              }}>
                <Typography variant="caption" sx={{ 
                  color: 'white', 
                  fontSize: { xs: '0.7rem', sm: '0.8rem' },
                  fontWeight: 600
                }}>
                  {dashboardMetrics.recentMilestones?.length || 0}
                </Typography>
              </Box>
            </Box>
            
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {dashboardMetrics.recentMilestones && dashboardMetrics.recentMilestones.length > 0 ? (
                dashboardMetrics.recentMilestones.length === 1 ? (
                  // Single milestone display
                  <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.91rem', sm: '1.14rem', md: '1.37rem' },
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}>
                    {getMilestoneMessage(
                      dashboardMetrics.recentMilestones[0]?.habitTitle,
                      dashboardMetrics.recentMilestones[0]?.milestone,
                      dashboardMetrics.recentMilestones[0]?.habitType,
                      dashboardMetrics.recentMilestones[0]?.units
                    )}
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}>
                    {getMilestoneEmojiBefore(dashboardMetrics.recentMilestones[0]?.milestone)}{getMilestoneEmojiAfter(dashboardMetrics.recentMilestones[0]?.milestone)}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    opacity: 0.9,
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {getMilestoneCelebration(dashboardMetrics.recentMilestones[0]?.milestone)}
                  </Typography>
                </Box>
              ) : (
                // Carousel for multiple milestones
                <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                  <Typography variant="body2" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.91rem', sm: '1.14rem', md: '1.37rem' },
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}>
                    {getMilestoneMessage(
                      dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.habitTitle,
                      dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.milestone,
                      dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.habitType,
                      dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.units
                    )}
                  </Typography>
                  <Typography variant="h4" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '1.5rem', sm: '1.8rem', md: '2rem' },
                    fontWeight: 600,
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                    mb: 0.5,
                    lineHeight: 1.2
                  }}>
                    {getMilestoneEmojiBefore(dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.milestone)}{getMilestoneEmojiAfter(dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.milestone)}
                  </Typography>
                  <Typography variant="body2" sx={{
                    color: '#ffffff',
                    fontSize: { xs: '0.9rem', sm: '1rem' },
                    opacity: 0.9,
                    fontWeight: 500,
                    textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                  }}>
                    {getMilestoneCelebration(dashboardMetrics.recentMilestones[selectedMilestoneIndex]?.milestone)}
                  </Typography>
                  
                  {/* Carousel Navigation */}
                  <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                    <IconButton 
                      onClick={() => setSelectedMilestoneIndex(prev => 
                        prev === 0 ? dashboardMetrics.recentMilestones.length - 1 : prev - 1
                      )}
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        p: 0.5,
                        '&:hover': { color: 'white' }
                      }}
                    >
                      <ChevronLeftIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    
                    {/* Carousel Indicators */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mx: 1 }}>
                      {dashboardMetrics.recentMilestones.map((_, index) => (
                        <Box
                          key={index}
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            backgroundColor: index === selectedMilestoneIndex ? 'white' : 'rgba(255,255,255,0.3)',
                            mx: 0.5,
                            transition: 'all 0.2s ease'
                          }}
                        />
                      ))}
                    </Box>
                    
                    <IconButton 
                      onClick={() => setSelectedMilestoneIndex(prev => 
                        prev === dashboardMetrics.recentMilestones.length - 1 ? 0 : prev + 1
                      )}
                      sx={{ 
                        color: 'rgba(255,255,255,0.8)', 
                        p: 0.5,
                        '&:hover': { color: 'white' }
                      }}
                    >
                      <ChevronRightIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                </Box>
              )
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                <Typography variant="h3" sx={{ 
                  fontWeight: 'bold', 
                  color: 'rgba(255,255,255,0.6)', 
                  fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, 
                  mb: 1 
                }}>
                  🎯
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.8rem' }, mb: 1, lineHeight: 1.3 }}>
                  Complete habits to unlock your first milestone
                </Typography>
              </Box>
            )}
            </Box>
          </CardContent>
        </Card>

        {/* 5. Best Streak & Needs Improvement */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0 
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 600, mb: 1 }}>
              Best Streak
            </Typography>
            <Box sx={{ mb: 1 }}>
              {dashboardMetrics.hasMinimumActivity ? (
                <>
                  <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '1.2rem', sm: '1.35rem' }, mb: 1.5, fontWeight: 'bold' }}>
                    🏆 {dashboardMetrics.bestStreakHabit}—{dashboardMetrics.bestStreakValue} days!
                  </Typography>
                  {dashboardMetrics.needsImprovementHabit && (
                    <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' } }}>
                      ⚡ Needs Improvement: {dashboardMetrics.needsImprovementHabit}
                    </Typography>
                  )}
                </>
              ) : (
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 0.5 }}>
                  No streaks to show
                </Typography>
              )}
            </Box>
            
          </CardContent>
          <IconButton 
            onClick={() => setBestNeedsInfoOpen(true)} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              p: 0.5,
              backgroundColor: 'rgba(255,255,255,0.1)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.2)'
              }
            }}
          >
            <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>
        </Card>

        {/* 6. Gaps */}
        <Card sx={{ 
          minWidth: 0, 
          width: '100%', 
          height: { xs: 180, lg: 200 }, 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between', 
          position: 'relative', 
          background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)', 
          color: 'white', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
          p: 0, 
          m: 0 
        }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '1.125rem', sm: '1.25rem' }, fontWeight: 600, mb: 1 }}>
              Gaps
            </Typography>
            {habits.length === 0 ? (
              <>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#95a5a6', fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, mb: 1 }}>
                  —
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.75rem', sm: '0.85rem', md: '0.8rem' }, mb: 1, lineHeight: 1.3 }}>
                  Add your habit to see updates here
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.65rem', sm: '0.75rem', md: '0.7rem' }, fontStyle: 'italic' }}>
                  Start building your habits
                </Typography>
              </>
            ) : dashboardMetrics.scheduledDays === 0 ? (
              <>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#95a5a6', fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, mb: 1 }}>
                  —
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 1 }}>
                  {habits.length > 0 ? 'Log your first habit' : 'No logs in the last 7 days'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontStyle: 'italic' }}>
                  {habits.length > 0 ? 'Start building momentum!' : 'Start logging your habits'}
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: dashboardMetrics.missedDays === 0 ? '#27ae60' : '#e74c3c', fontSize: { xs: '1.62rem', sm: '2.025rem', md: '2.43rem' }, mb: 1 }}>
                  {dashboardMetrics.missedDays}
                  {dashboardMetrics.missedDays === 0 ? ' 🎉' : 
                   dashboardMetrics.missedDays > 20 ? ' 😢😢😢' : 
                   dashboardMetrics.missedDays > 10 ? ' 😢😢' : 
                   dashboardMetrics.missedDays > 2 ? ' 😢' : ''}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.9rem', sm: '1rem' }, mb: 1 }}>
                  {dashboardMetrics.missedDays === 0 ? 'perfect days in the last 7 days' : 'missed logs in the last 7 days'}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.75rem', sm: '0.85rem' }, fontStyle: 'italic' }}>
                  {dashboardMetrics.missedDays === 0 ? 'Amazing! You logged every scheduled day!' : 
                   dashboardMetrics.missedDays <= 2 ? 'A small gap—easy to recover!' : 
                   'Try to close the gap next week!'}
                </Typography>
              </>
            )}
          </CardContent>
          <IconButton 
            onClick={() => setGapsInfoOpen(true)} 
            sx={{ 
              position: 'absolute', 
              top: 8, 
              right: 8, 
              p: 0.5,
              backgroundColor: 'rgba(255,255,255,0.2)',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.3)'
              }
            }}
          >
            <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 16, sm: 18 } }} />
          </IconButton>
        </Card>
      </Box>
      
      {/* Log Generator Button */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>

      </Box>
    </Box>
  );

  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Box sx={{ 
        height: '100vh', 
        width: '100%',
        maxWidth: '100vw',
        backgroundColor: 'background.default',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        overflowX: 'hidden',
        pt: { xs: 6, sm: 5, md: 5 } // Increased top padding
      }}>
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary', width: '100%', pt: { xs: 1, sm: 0.5 }, backgroundImage: 'none' }}>
          <Toolbar sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 }, flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.75 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="img" src="/assets/icon.png" alt="HabitForge icon" sx={{ height: 60, mr: 1.125, borderRadius: '12px' }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  HabitForge
                </Typography>
              </Box>

            </Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.2, pl: 0, fontSize: '1rem' }}>
              Build discipline. Track habits. Transform your life.
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper', backgroundImage: 'none', mt: 2 }}>
          <Tabs 
            value={currentTab} 
            onChange={(e, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{
              '& .MuiTab-root': {
                minHeight: 48,
                fontSize: { xs: '0.875rem', sm: '1rem' },
                fontWeight: 600,
                textTransform: 'none',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.hover'
                },
                '&.Mui-selected': {
                  color: 'primary.main',
                  fontWeight: 700,
                  backgroundColor: 'action.selected',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
                height: 3
              }
            }}
          >
            <Tab label="Dashboard" />
            <Tab label={habits.length > 0 ? `Habits (${habits.length})` : "Habits"} />
            <Tab label="Log" />
          </Tabs>
        </Box>

        <Box sx={{ 
          flex: 1,
          overflow: 'auto',
          width: '100%',
          maxWidth: '100vw',
          px: { xs: 1, sm: 2, md: 3 },
          py: 2,
          pb: { xs: 8, sm: 10 }, // Add bottom padding to account for floating buttons
          boxSizing: 'border-box',
          overflowX: 'hidden'
        }}>
          {currentTab === 0 && (
            <Box>
              {(() => {
                try {
              
                  return renderDashboard();
                } catch (error) {
                  console.error('Error rendering dashboard:', error);
                  return (
                    <Box sx={{ p: 2, textAlign: 'center' }}>
                      <Typography variant="h6" color="error">
                        Error loading dashboard
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {error.message}
                      </Typography>
                    </Box>
                  );
                }
              })()}
            </Box>
          )}
          {currentTab === 1 && (
            <Box sx={{ 
              width: '100%', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch'
            }}>

              {habits.length > 0 ? (
                <Box sx={{ 
                  width: '100%', 
                  maxWidth: '100%',
                  mx: 'auto'
                }}>
                  {/* Mobile: One row per tile, dynamic width */}
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr', // 1 column on phones (portrait)
                      sm: '1fr 1fr', // 2 columns on phones (landscape)
                      md: '1fr 1fr 1fr' // 3 columns on tablets
                    },
                    gap: { xs: 2, md: 1.5 },
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden',
                    gridAutoRows: 'min-content'
                  }}>
                    {habits.map((habit, idx) => (
                              <Card key={idx} sx={{ 
          width: '100%',
          minWidth: 0,
          height: { xs: 158, md: 180 }, // Larger on tablets for better readability
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          boxShadow: 2,
          m: 0,
          p: 0,
          cursor: 'pointer',
          '&:hover': {
            boxShadow: 4,
            transform: 'translateY(-1px)',
            transition: 'all 0.2s ease-in-out'
          }
        }}
        onClick={() => handleEdit(idx)}
        >
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: { xs: 1, md: 1.5 }, pb: '6px !important' }}>
    <Box sx={{ mb: 0.3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: { xs: '1rem', md: '1.1rem' }, lineHeight: 1.1, mr: 1 }}>
            {habit.title}
          </Typography>
          <Chip 
            label={habit.frequency} 
            size="small" 
            color="primary" 
            variant="outlined"
            sx={{ flexShrink: 0, height: 18, fontSize: '0.7rem', px: 0.5 }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={(e) => {
            e.stopPropagation();
            handleDelete(idx);
          }} sx={{ p: 0.5 }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      <Typography 
        variant="body2" 
        color="text.secondary" 
        sx={{ 
          mb: 0.2,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
          fontSize: { xs: '0.85rem', md: '0.9rem' },
          lineHeight: 1.2
        }}
      >
        {habit.description}
      </Typography>
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.1, fontSize: '0.7rem' }}>
        {habit.trackingType === "progress" && `${habit.units} • Target: ${habit.target} • `}
        {habit.duration && `${habit.duration} • `}
        {habit.frequency === 'daily' ? 'Once per day' :
         habit.frequency === 'weekly' ? `${habit.times || 1} time${habit.times > 1 ? 's' : ''} per week` :
         'Custom frequency'}
        {habit.frequency === 'weekly' && habit.weeklyDays.length > 0 && 
         ` • ${habit.weeklyDays.map(day => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][day]).join(', ')}`}
        {habit.startTime && ` • Reminder: ${habit.startTime}`}
      </Typography>
    </Box>
    <Box sx={{ mb: 0.3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.1 }}>
        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
          {habit.trackingType === "progress" ? "Last 7 Days" : "Last 7 Days"}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontSize: '0.8rem' }}>
          {habit.trackingType === "progress" 
            ? `${parseFloat((weeklyStats[idx]?.progress || 0).toFixed(1))}/${weeklyStats[idx]?.target || 0} ${habit.units || 'units'} (${parseFloat((weeklyStats[idx]?.percent || 0).toFixed(1))}%)`
            : `${weeklyStats[idx]?.completed || 0}/${weeklyStats[idx]?.total || 0} (${parseFloat((weeklyStats[idx]?.percent || 0).toFixed(1))}%)`
          }
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={weeklyStats[idx]?.percent || 0} 
        sx={{ height: 5, borderRadius: 3 }}
      />
    </Box>
    <Box sx={{ mb: 0.1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>Last 30 Days</Typography>
        <Typography variant="body2" color="secondary" sx={{ fontSize: '0.8rem' }}>
          {habit.trackingType === "progress" 
            ? `${parseFloat((monthlyStats[idx]?.progress || 0).toFixed(1))}/${monthlyStats[idx]?.target || 0} ${habit.units || 'units'} (${parseFloat((monthlyStats[idx]?.percent || 0).toFixed(1))}%)`
            : `${monthlyStats[idx]?.completed || 0}/${monthlyStats[idx]?.total || 0} (${parseFloat((monthlyStats[idx]?.percent || 0).toFixed(1))}%)`
          }
        </Typography>
      </Box>
      <LinearProgress 
        variant="determinate" 
        value={monthlyStats[idx]?.percent || 0} 
        sx={{ height: 4, borderRadius: 3, background: 'action.hover', '& .MuiLinearProgress-bar': { backgroundColor: 'secondary.main' } }}
      />
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.3 }}>
      <LocalFireDepartmentIcon sx={{ color: 'orange', mr: 0.5, fontSize: 16 }} />
      <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
        {streaks[idx] || 0} {(streaks[idx] || 0) === 1 ? 'day' : 'days'} current streak
      </Typography>
    </Box>
  </CardContent>
                      </Card>
                    ))}
                    {/* Extra scroll space for FAB - now at least one full tile height */}
                    <Box sx={{ height: { xs: 170, sm: 180, md: 180 } }} />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    No habits created yet
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Create your first habit to get started
                  </Typography>
                </Box>
              )}
            </Box>
          )}
          {currentTab === 2 && (
            <Box sx={{ 
              width: '100%', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              {/* Calendar Carousel Section at the top */}
              <Box sx={{ mb: 4, width: '100%' }}>
                <Box sx={{ 
                  width: '100%', 
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}>
                  {/* Calendar Navigation */}
                  <Box sx={{ 
                    width: '100%', 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    px: 2
                  }}>
                    <IconButton 
                      onClick={handleCalendarPrev}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ArrowBackIosNewIcon />
                    </IconButton>
                    
                    <Typography variant="h6" sx={{ fontWeight: 'bold', textAlign: 'center', flex: 1 }}>
                      {getCalendarTitle()}
                    </Typography>
                    
                    <IconButton 
                      onClick={handleCalendarNext}
                      sx={{ 
                        color: 'primary.main',
                        '&:hover': { backgroundColor: 'action.hover' }
                      }}
                    >
                      <ArrowForwardIosIcon />
                    </IconButton>
                  </Box>



                  <Box sx={{ 
                    width: '100%', 
                    maxWidth: '100%',
                    mx: 'auto'
                  }}>
                    <Card sx={{
                      background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
                      color: 'white',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      borderRadius: 2,
                      overflow: 'hidden'
                    }}>
                      <CardContent sx={{ p: { xs: 1, sm: 2 } }}>
                        {selectedCalendarIndex === 0 ? (
                          <Calendar completions={completions} habits={habits} weeklyStats={weeklyStats} />
                        ) : (
                          <HabitCalendar 
                            habit={habits[selectedCalendarIndex - 1]}
                            habitIndex={selectedCalendarIndex - 1}
                            completions={completions}
                            weeklyStats={weeklyStats}
                            onLogEntry={handleHabitCalendarLogEntry}
                            onDateClick={handleCalendarDateClick}
                          />
                        )}
                      </CardContent>
                    </Card>
                  </Box>
                </Box>
              </Box>



              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                {(() => {
                  const filterHabitIndex = selectedCalendarIndex > 0 ? selectedCalendarIndex - 1 : null;
                  const logs = getLogs(filterHabitIndex);
                  const totalLogs = logs.length;
                  
                  if (selectedCalendarIndex > 0) {
                    return `${habits[selectedCalendarIndex - 1]?.title || 'Habit'} Logs (${totalLogs})`;
                  } else {
                    return `All Habits Logs (${totalLogs})`;
                  }
                })()}
              </Typography>
              

              
              <Box sx={{ 
                width: '100%', 
                maxWidth: '100%',
                mx: 'auto',
                overflow: 'hidden'
              }}>
                <TableContainer component={Paper} sx={{ 
                  maxHeight: 'calc(100vh - 300px)',
                  overflow: 'auto',
                  borderRadius: 2,
                  boxShadow: 2,
                  width: '100%',
                  overflowX: 'hidden'
                }}>
                  <Table size="small" stickyHeader sx={{ width: '100%', tableLayout: 'fixed' }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, width: { xs: '18%', sm: '16%' }, textAlign: 'left' }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: { xs: '32%', sm: '38%' }, textAlign: 'left' }}>Habit</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: { xs: '22%', sm: '24%' }, textAlign: 'center' }}>Progress</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: { xs: '18%', sm: '14%' }, textAlign: 'center' }}>Feeling</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: { xs: '10%', sm: '8%' }, textAlign: 'center' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(() => {
                        try {
                          // Filter logs based on selected calendar habit
                          const filterHabitIndex = selectedCalendarIndex > 0 ? selectedCalendarIndex - 1 : null;
                          const logs = getLogs(filterHabitIndex);
                          
                          if (logs.length === 0) {
                            return (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                                  <Typography variant="body1" color="text.secondary">
                                    {habits.length === 0
                                      ? 'Create your habit and then log them to see logs here'
                                      : selectedCalendarIndex > 0
                                      ? `No logs found for ${habits[selectedCalendarIndex - 1]?.title || 'this habit'}`
                                      : 'Add your first log'}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          }
                          
                          // Limit to first 100 logs for performance
                          const displayLogs = logs.slice(0, 100);
                          
                          return (
                            <>
                              {displayLogs.map((log, index) => {
                            const habit = habits[log.habitIndex];
                            return (
                              <TableRow 
                                key={log.date + '-' + log.habitIndex}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover'
                                  },
                                  cursor: 'pointer'
                                }}
                                onClick={() => handleEditLog(log)}
                              >
                                <TableCell sx={{ 
                                  fontWeight: 500, 
                                  color: 'text.primary',
                                  width: { xs: '18%', sm: '16%' },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  fontSize: { xs: '0.7rem', sm: '0.75rem' },
                                  px: { xs: 0.5, sm: 1 }
                                }}>
                                  {(() => {
                                    // Parse date string consistently to avoid timezone issues
                                    const [year, month, day] = log.date.split('-').map(Number);
                                    const date = new Date(year, month - 1, day);
                                    return date.toLocaleDateString('en-US', { 
                                      month: 'short', 
                                      day: 'numeric',
                                      year: 'numeric'
                                    });
                                  })()}
                                </TableCell>
                                <TableCell sx={{ 
                                  width: { xs: '32%', sm: '38%' },
                                  overflow: 'hidden',
                                  px: { xs: 0.5, sm: 1 }
                                  }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                    fontSize: { xs: '0.7rem', sm: '0.75rem' }
                                    }}>
                                      {log.habit}
                                    </Typography>
                                </TableCell>

                                <TableCell align="center" sx={{ 
                                  width: { xs: '22%', sm: '24%' },
                                  overflow: 'hidden',
                                  px: { xs: 0.5, sm: 1 }
                                }}>
                                  {habit?.trackingType === 'progress' && log.progress ? (
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500,
                                      color: 'primary.main',
                                      fontSize: { xs: '0.65rem', sm: '0.7rem' },
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}>
                                      {parseFloat(log.progress).toFixed(1)} {habit.units || 'units'}
                                    </Typography>
                                  ) : (
                                    <Typography variant="body2" sx={{ 
                                      color: 'text.secondary',
                                      fontSize: { xs: '0.65rem', sm: '0.7rem' }
                                    }}>
                                      —
                                    </Typography>
                                  )}
                                </TableCell>

                                <TableCell align="center" sx={{ 
                                  width: { xs: '18%', sm: '14%' },
                                  px: { xs: 0.5, sm: 1 }
                                }}>
                                  <Typography variant="body2" sx={{ 
                                    fontSize: { xs: '1rem', sm: '1.2rem' },
                                    lineHeight: 1
                                  }}>
                                    {log.feeling ? getFeelingEmoji(log.feeling) : '—'}
                                  </Typography>
                                </TableCell>

                                <TableCell align="center" sx={{ 
                                  width: { xs: '10%', sm: '8%' },
                                  px: { xs: 0.25, sm: 0.5 }
                                }}>
                                  <Box sx={{ 
                                    display: 'flex',
                                    gap: { xs: 0.25, sm: 0.5 },
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  }}>
                                    <Tooltip title="Delete" placement="top">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLog(log);
                                        }}
                                        sx={{ p: { xs: 0.25, sm: 0.5 }, color: 'error.main' }}
                                      >
                                        <DeleteIcon sx={{ fontSize: { xs: 12, sm: 14 } }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Extra scroll space for FAB - now at least one full row height */}
                          <TableRow>
                            <TableCell colSpan={5} sx={{ height: { xs: 70, sm: 80, md: 80 }, border: 0, p: 0, background: 'transparent' }} />
                          </TableRow>
                        </>
                      );
                    } catch (error) {
                      console.error('Error rendering logs:', error);
                      return (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="error">
                              Error loading logs. Please try refreshing the app.
                            </Typography>
                          </TableCell>
                        </TableRow>
                      );
                    }
                  })()}
                    </TableBody>
                  </Table>
                </TableContainer>
                

              </Box>
            </Box>
          )}
        </Box>

        {/* Floating Action Buttons - ensure this is outside the metrics tiles container and at the top level of the main layout */}
        <Box sx={{ 
          position: 'fixed', 
          bottom: { xs: 40, sm: 48 }, 
          right: { xs: 16, sm: 24 }, 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 2,
          zIndex: 1000
        }}>
          <Tooltip title="Log Habits" placement="left" arrow enterDelay={300} leaveDelay={0}>
            <span>
              <Fab
                color="secondary"
                aria-label="log habit"
                onClick={handleLogModalOpen}
                disabled={habits.length === 0}
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  '&:focus': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <CheckCircleIcon sx={{ fontSize: { xs: 24, sm: 28 }, color: 'white' }} />
              </Fab>
            </span>
          </Tooltip>
          <Tooltip title="Add Habits" placement="left" arrow enterDelay={300} leaveDelay={0}>
            <span>
              <Fab
                color="primary"
                aria-label="add"
                onClick={handleOpen}
                sx={{
                  width: { xs: 56, sm: 64 },
                  height: { xs: 56, sm: 64 },
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  '&:hover': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  '&:focus': {
                    transform: 'scale(1.1)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
                  },
                  '&:active': {
                    transform: 'scale(0.95)',
                  },
                }}
              >
                <AddIcon sx={{ fontSize: { xs: 24, sm: 28 } }} />
              </Fab>
            </span>
          </Tooltip>
        </Box>

        {/* Add/Edit Habit Modal */}
        <Dialog 
          open={open} 
          onClose={handleClose} 
          maxWidth="sm" 
          fullWidth
          ref={dialogRef}
          sx={{
            '& .MuiDialog-paper': {
              maxHeight: isKeyboardVisible ? '80vh' : '90vh',
              margin: isKeyboardVisible ? '20px' : '32px',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold', textAlign: 'center', pb: 0 }}>
            {editIndex !== null ? "Edit Habit" : "Add New Habit"}
          </DialogTitle>
          <DialogContent>
            {editIndex !== null ? (
              // Edit mode - show all fields at once
              <Box
                component="form"
                sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
                onSubmit={handleSubmit}
              >
                <TextField
                  label="Title"
                  name="title"
                  value={habit.title}
                  onChange={handleChange}
                  required
                  fullWidth
                  variant="outlined"
                  inputProps={{ maxLength: 25 }}
                  helperText={`${habit.title.length}/25 characters`}
                  error={!!habitError}
                />
                {habitError && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>{habitError}</Typography>
                )}
                <TextField
                  label="Description"
                  name="description"
                  value={habit.description}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  multiline
                  rows={2}
                />
                
                <TextField
                  select
                  label="Tracking Type"
                  name="trackingType"
                  value={habit.trackingType}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                  required
                >
                  <MenuItem value="completion">Track Completion (e.g., Did you go to gym today?)</MenuItem>
                  <MenuItem value="progress">Track Progress (e.g., How many miles did you run today?)</MenuItem>
                </TextField>
                
                {habit.trackingType === "progress" && (
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <TextField
                      label="Target"
                      name="target"
                      value={habit.target}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., 5"
                      required
                      type="number"
                    />
                    <TextField
                      label="Units"
                      name="units"
                      value={habit.units}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      placeholder="e.g., miles, pages, minutes"
                      required
                    />
                  </Box>
                )}
                
                <TextField
                  select
                  label="Frequency"
                  name="frequency"
                  value={habit.frequency}
                  onChange={handleChange}
                  fullWidth
                  variant="outlined"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </TextField>
                
                {habit.frequency === "weekly" && (
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                      Select days of the week:
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      {['M', 'T', 'W', 'TH', 'F', 'SA', 'SU'].map((day, index) => (
                        <Button
                          key={day}
                          variant={habit.weeklyDays.includes(index) ? "contained" : "outlined"}
                          size="small"
                          onClick={() => {
                            const newDays = habit.weeklyDays.includes(index)
                              ? habit.weeklyDays.filter(d => d !== index)
                              : [...habit.weeklyDays, index];
                            setHabit(prev => ({ 
                              ...prev, 
                              weeklyDays: newDays,
                              times: newDays.length.toString() // Auto-calculate times based on selected days
                            }));
                          }}
                          sx={{ minWidth: 'auto', px: 1 }}
                        >
                          {day}
                        </Button>
                      ))}
                    </Box>
                    {habit.weeklyDays.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        {habit.weeklyDays.length} time{habit.weeklyDays.length > 1 ? 's' : ''} per week
                      </Typography>
                    )}
                  </Box>
                )}
                
                {/* Reminder Toggle */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Remind me
                  </Typography>
                  <Button
                    variant={habit.startTime ? "contained" : "outlined"}
                    size="small"
                    onClick={() => {
                      if (habit.startTime) {
                        setHabit(prev => ({ ...prev, startTime: "" }));
                      } else {
                        setHabit(prev => ({ ...prev, startTime: "09:00" }));
                      }
                    }}
                    sx={{ minWidth: 80 }}
                  >
                    {habit.startTime ? "On" : "Off"}
                  </Button>
                </Box>
                
                {habit.startTime && (
                  <TextField
                    label="Reminder time"
                    name="startTime"
                    type="time"
                    value={habit.startTime}
                    onChange={handleChange}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    helperText="When should the reminder be sent?"
                  />
                )}
                

              </Box>
            ) : (
              // Add mode - 2-step process
              <>
                {habitFormStep === 1 ? (
                  // Compact tracking type selection
                  <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1, justifyContent: 'center' }}>
                    {[{
                      type: 'completion',
                      icon: <ChecklistIcon sx={{ fontSize: 32, color: habit.trackingType === 'completion' ? 'primary.main' : 'text.secondary' }} />,
                      title: 'Track Completion',
                      desc: 'Simple yes/no tracking. E.g., Meditate daily, Gym Weekly M, W & F'
                    }, {
                      type: 'progress',
                      icon: <TrendingUpIcon sx={{ fontSize: 32, color: habit.trackingType === 'progress' ? 'primary.main' : 'text.secondary' }} />,
                      title: 'Track Progress',
                      desc: 'Measure with units and targets. E.g., Read 50 Pages daily, Run 5 Miles Su & W'
                    }].map(opt => (
                      <Card
                        key={opt.type}
                        variant="outlined"
                        sx={{
                          flex: 1,
                          minWidth: 0,
                          cursor: 'pointer',
                          border: habit.trackingType === opt.type ? '2px solid' : '1px solid',
                          borderColor: habit.trackingType === opt.type ? 'primary.main' : 'divider',
                          boxShadow: habit.trackingType === opt.type ? 2 : 1,
                          background: habit.trackingType === opt.type ? 
                            (theme.palette.mode === 'dark' ? 'rgba(25, 118, 210, 0.1)' : 'linear-gradient(135deg, #e3f2fd 0%, #fff 100%)') : 
                            'background.paper',
                          transition: 'all 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: 2,
                          },
                          display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2, px: 1.5
                        }}
                        onClick={() => setHabit(prev => ({ ...prev, trackingType: opt.type }))}
                      >
                        {opt.icon}
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 0.5, mb: 0.25, textAlign: 'center' }}>{opt.title}</Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center', fontSize: '0.75rem' }}>{opt.desc}</Typography>
                      </Card>
                    ))}
                  </Box>
                ) : (
                  // Compact Step 2: Habit details
                  <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }} onSubmit={handleSubmit}>
                    <TextField
                      label="Title"
                      name="title"
                      value={habit.title}
                      onChange={handleChange}
                      required
                      fullWidth
                      variant="outlined"
                      inputProps={{ maxLength: 25 }}
                      helperText={`${habit.title.length}/25 characters`}
                      error={!!habitError}
                    />
                    {habitError && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>{habitError}</Typography>
                    )}
                    <TextField
                      label="Description"
                      name="description"
                      value={habit.description}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                      multiline
                      rows={2}
                      helperText="Optional: Add a short description"
                    />
                    {habit.trackingType === "progress" && (
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <TextField
                          label="Target"
                          name="target"
                          value={habit.target}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., 5"
                          required
                          type="number"
                        />
                        <TextField
                          label="Units"
                          name="units"
                          value={habit.units}
                          onChange={handleChange}
                          fullWidth
                          variant="outlined"
                          placeholder="e.g., miles, pages, minutes"
                          required
                        />
                      </Box>
                    )}
                    <TextField
                      select
                      label="Frequency"
                      name="frequency"
                      value={habit.frequency}
                      onChange={handleChange}
                      fullWidth
                      variant="outlined"
                    >
                      <MenuItem value="daily">Daily</MenuItem>
                      <MenuItem value="weekly">Weekly</MenuItem>
                    </TextField>
                    {habit.frequency === "weekly" && (
                      <Box>
                        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'medium' }}>
                          Select days of the week:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {['M', 'T', 'W', 'TH', 'F', 'SA', 'SU'].map((day, index) => (
                            <Button
                              key={day}
                              variant={habit.weeklyDays.includes(index) ? "contained" : "outlined"}
                              size="small"
                              onClick={() => {
                                const newDays = habit.weeklyDays.includes(index)
                                  ? habit.weeklyDays.filter(d => d !== index)
                                  : [...habit.weeklyDays, index];
                                setHabit(prev => ({ 
                                  ...prev, 
                                  weeklyDays: newDays,
                                  times: newDays.length.toString() // Auto-calculate times based on selected days
                                }));
                              }}
                              sx={{ minWidth: 'auto', px: 1 }}
                            >
                              {day}
                            </Button>
                          ))}
                        </Box>
                        {habit.weeklyDays.length > 0 && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            {habit.weeklyDays.length} time{habit.weeklyDays.length > 1 ? 's' : ''} per week
                          </Typography>
                        )}
                      </Box>
                    )}
                    
                    {/* Reminder Toggle */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        Remind me
                      </Typography>
                      <Button
                        variant={habit.startTime ? "contained" : "outlined"}
                        size="small"
                        onClick={() => {
                          if (habit.startTime) {
                            setHabit(prev => ({ ...prev, startTime: "" }));
                          } else {
                            setHabit(prev => ({ ...prev, startTime: "09:00" }));
                          }
                        }}
                        sx={{ minWidth: 80 }}
                      >
                        {habit.startTime ? "On" : "Off"}
                      </Button>
                    </Box>
                    
                    {habit.startTime && (
                      <TextField
                        label="Reminder time"
                        name="startTime"
                        type="time"
                        value={habit.startTime}
                        onChange={handleChange}
                        fullWidth
                        variant="outlined"
                        InputLabelProps={{ shrink: true }}
                        helperText="When should the reminder be sent?"
                      />
                    )}
                    

                  </Box>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose} color="secondary">
              Cancel
            </Button>
            {editIndex !== null ? (
              <Button onClick={(e) => handleSubmit(e)} variant="contained" color="primary">
                Update
              </Button>
            ) : habitFormStep === 1 ? (
              <Button 
                onClick={handleNextStep} 
                variant="contained" 
                color="primary"
                disabled={!habit.trackingType}
              >
                Next
              </Button>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button onClick={handlePrevStep} color="secondary">
                  Back
                </Button>
                <Button onClick={(e) => handleSubmit(e)} variant="contained" color="primary">
                  Add
                </Button>
              </Box>
            )}
          </DialogActions>
        </Dialog>

        {/* Log Habit Modal */}
        <Dialog 
          open={logModalOpen} 
          onClose={handleLogModalClose} 
          maxWidth="sm" 
          fullWidth
          ref={dialogRef}
          sx={{
            '& .MuiDialog-paper': {
              maxHeight: isKeyboardVisible ? '80vh' : '90vh',
              margin: isKeyboardVisible ? '20px' : '32px',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            Log Habit Completion
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                select
                label="Habit"
                value={logEntry.habitIndex}
                onChange={e => handleLogChange('habitIndex', Number(e.target.value))}
                fullWidth
              >
                {habits.map((habit, idx) => (
                  <MenuItem key={idx} value={idx}>{habit.title}</MenuItem>
                ))}
              </TextField>
              <TextField
                label="Date"
                type="date"
                value={logEntry.date}
                onChange={e => handleLogChange('date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  max: getTodayString(),
                  style: { 
                    paddingRight: '12px',
                    textAlign: 'left'
                  }
                }}
                InputProps={{
                  style: {
                    paddingRight: '8px'
                  }
                }}
                error={isFutureDate(logEntry.date)}
                helperText={isFutureDate(logEntry.date) ? 'Cannot log for a future date' : ''}
              />
              {logError && (
                <Typography color="error" variant="body2" sx={{ mt: 1 }}>{logError}</Typography>
              )}
              {habits[logEntry.habitIndex]?.trackingType === "progress" && (
                <TextField
                  label={`Progress (${habits[logEntry.habitIndex]?.units || 'units'})`}
                  value={logEntry.progress}
                  onChange={e => handleLogChange('progress', e.target.value)}
                  fullWidth
                  placeholder={`e.g. ${habits[logEntry.habitIndex]?.target || '5'}`}
                  type="number"
                  required
                />
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  How did you feel?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((feeling) => (
                    <Box
                      key={feeling}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: logEntry.feeling === feeling ? 'primary.light' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                      onClick={() => handleLogChange('feeling', feeling)}
                    >
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        {getFeelingEmoji(feeling)}
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'center' }}>
                        {getFeelingText(feeling)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleLogModalClose} color="secondary">
              Cancel
            </Button>
            <Button onClick={handleLogHabit} variant="contained" color="primary">
              {editLog ? 'Update' : 'Log'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Best Streak Info Dialog */}
        <Dialog open={bestStreakInfoOpen} onClose={() => setBestStreakInfoOpen(false)}>
          <DialogTitle>Best Streak</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Best Streak:</b> The highest number of consecutive days you've completed a habit in the last 30 days. Shows the habit with the longest streak.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBestStreakInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Enhanced 2-Page Onboarding Modal */}
        <Dialog 
          open={onboardingOpen} 
          onClose={handleOnboardingClose} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
              maxHeight: '80vh'
            }
          }}
        >
          {/* Header with step indicator */}
          <DialogTitle sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            pb: 1, 
            position: 'relative',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                              Welcome to HabitForge!
            </Typography>
            {/* Step indicator */}
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mt: 1 }}>
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: onboardingStep === 1 ? 'white' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }} />
              <Box sx={{ 
                width: 8, 
                height: 8, 
                borderRadius: '50%', 
                backgroundColor: onboardingStep === 2 ? 'white' : 'rgba(255,255,255,0.3)',
                transition: 'all 0.3s ease'
              }} />
            </Box>
          </DialogTitle>

          <DialogContent sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
            {onboardingStep === 1 ? (
              // Page 1: Create Your Habits
              <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, mt: 1, fontWeight: 'bold', color: 'white' }}>
                  Create Your Habits
            </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                  Set up habits with flexible tracking options
                </Typography>
                
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Feature 1: Tracking Types */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  background: 'rgba(255,255,255,0.15)'
                }
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                      <ChecklistIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                    <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Choose Tracking Style
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem', mb: 0.5 }}>
                        <strong>Progress Completion:</strong> Yes/No type habits (E.g., Daily Gym)
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        <strong>Progress Tracker:</strong> Measure progress (E.g., Run 5 Miles Weekly Su, W)
                  </Typography>
                </Box>
              </Box>
              
                  {/* Feature 2: Frequency & Scheduling */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'flex-start', 
                gap: 2,
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                  background: 'rgba(255,255,255,0.15)'
                }
              }}>
                <Box sx={{ 
                  width: 40, 
                  height: 40, 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                  border: '2px solid rgba(255,255,255,0.3)'
                }}>
                      <CalendarTodayIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Flexible Scheduling
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        Daily or Weekly on specific days
                      </Typography>
                    </Box>
                  </Box>

                  {/* Feature 3: Smart Reminders */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <NotificationsIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Reminders
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        Set notification so you don't forget
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            ) : (
              // Page 2: Log Habits
                <Box>
                <Typography variant="h5" sx={{ textAlign: 'center', mb: 2, mt: 1, fontWeight: 'bold', color: 'white' }}>
                  Log Your Habits
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'center', mb: 3, color: 'rgba(255,255,255,0.9)', fontSize: '1rem' }}>
                  Track progress and build lasting discipline
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {/* Feature 1: Quick Logging */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <AssignmentIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Quick & Easy Logging
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        Use Calendar to log habit completion or record progress
                  </Typography>
                </Box>
              </Box>

                  {/* Feature 2: Mood Tracking */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <SentimentSatisfiedAltIcon sx={{ color: 'white', fontSize: 20 }} />
            </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Track Your Feelings
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        Log your feelings for each session
                      </Typography>
                    </Box>
                  </Box>

                  {/* Feature 3: Progress Dashboard */}
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    gap: 2,
                    p: 2,
                    borderRadius: 2,
                    background: 'rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                      background: 'rgba(255,255,255,0.15)'
                    }
                  }}>
                    <Box sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                        Watch Progress Grow
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                        Track progress and metrics
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Box>
            )}
          </DialogContent>

          <DialogActions sx={{ 
            justifyContent: 'space-between', 
            pb: 3, 
            pt: 2,
            px: 3,
            background: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            {onboardingStep === 1 ? (
              <>
            <Button 
                  onClick={handleSkipOnboarding}
                  sx={{
                    color: 'rgba(255,255,255,0.7)',
                    textTransform: 'none',
                    fontSize: '1rem',
                    height: 48,
                    '&:hover': {
                      color: 'white',
                      background: 'rgba(255,255,255,0.1)'
                    }
                  }}
                >
                  Skip
                </Button>
                <Button 
                  onClick={handleOnboardingNext} 
              variant="contained" 
              color="primary"
              sx={{ 
                minWidth: 140,
                    height: 48,
                    px: 4,
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                }
              }}
            >
                  Next Step →
            </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={handleOnboardingPrev} 
                  variant="outlined"
                  sx={{ 
                    minWidth: 120,
                    height: 48,
                    px: 3,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    borderColor: 'rgba(255,255,255,0.3)',
                    color: 'white',
                    '&:hover': {
                      borderColor: 'white',
                      backgroundColor: 'rgba(255,255,255,0.1)',
                    }
                  }}
                >
                  ← Previous
                </Button>
                <Button 
                  onClick={handleOnboardingClose} 
                  variant="contained" 
                  color="primary"
                  sx={{ 
                    minWidth: 140,
                    height: 48,
                    px: 4,
                    fontSize: '0.875rem',
                    fontWeight: 'bold',
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
                    '&:hover': {
                      transform: 'translateY(-1px)',
                      boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
                    }
                  }}
                >
                  Get Started
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Info Dialogs for Dashboard Metrics */}
        <Dialog open={disciplineInfoOpen} onClose={() => setDisciplineInfoOpen(false)}>
          <DialogTitle>Discipline Score</DialogTitle>
          <DialogContent>
            <Box>
              <Typography variant="body2"><b>Hybrid Discipline Score:</b> Combines your current week completion rate (50%) with your consistency streak (50%).</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Completion Rate:</b> Average % of all habits completed this week.</Typography>
              <Typography variant="body2" sx={{ mt: 1 }}><b>Streak Score:</b> Based on consecutive weeks with ≥70% completion (target: 4 weeks).</Typography>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDisciplineInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={thisWeekInfoOpen} onClose={() => setThisWeekInfoOpen(false)}>
          <DialogTitle>This Week</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Average completion rate (%) of all habits for the current week. For each habit, it's the % of its weekly goal completed, then averaged across all habits.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setThisWeekInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={last30DaysInfoOpen} onClose={() => setLast30DaysInfoOpen(false)}>
          <DialogTitle>Last 30 Days</DialogTitle>
          <DialogContent>
            <Typography variant="body2">Average completion rate (%) of all habits over the last 30 days. For each habit, it's the % of its 30-day goal completed, then averaged across all habits.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLast30DaysInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* New Dashboard Info Dialogs */}
        <Dialog open={sevenDayInfoOpen} onClose={() => setSevenDayInfoOpen(false)}>
          <DialogTitle>Last 7 Days Completion Rate</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Definition:</b> Percentage of scheduled habits (across all habits) that were completed/logged in the last 7 days.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Calculation:</b> For each habit, we count how many times it was scheduled vs. how many times it was completed in the past 7 days, then average across all habits.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> This metric helps you see your weekly momentum and encourages consistent daily effort.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSevenDayInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={thirtyDayInfoOpen} onClose={() => setThirtyDayInfoOpen(false)}>
          <DialogTitle>Last 30 Days Completion Rate</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Definition:</b> Percentage of scheduled habits (across all habits) that were completed/logged in the last 30 days.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Calculation:</b> For each habit, we count how many times it was scheduled vs. how many times it was completed in the past 30 days, then average across all habits.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> This longer-term view helps you build sustainable habits and see month-over-month improvement.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setThirtyDayInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={bestNeedsInfoOpen} onClose={() => setBestNeedsInfoOpen(false)}>
          <DialogTitle>Best Streak & Needs Improvement</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Best Streak:</b> The habit with the highest consecutive completion streak in the last 180 days.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Needs Improvement:</b> The habit with the lowest completion rate or most broken streaks.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> Celebrate your wins while gently nudging you to improve areas that need attention.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setBestNeedsInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={consistencyInfoOpen} onClose={() => setConsistencyInfoOpen(false)}>
          <DialogTitle>Consistency</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Definition:</b> Average percentage of completion for each habit over the last 30 days.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Calculation:</b> For each habit, we calculate its individual completion rate, then average all rates together.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> Consistent small wins beat perfection! This metric encourages steady progress over sporadic bursts.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConsistencyInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={momentumInfoOpen} onClose={() => setMomentumInfoOpen(false)}>
          <DialogTitle>Momentum</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Definition:</b> Are you trending up or down? Compares completion rates for the last 7 days vs previous 7 days.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Calculation:</b> We compare your last 7 days' completion rate with the previous 7 days' rate to show your trend.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> Highlights recent improvement or encourages course correction to maintain positive momentum.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setMomentumInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={gapsInfoOpen} onClose={() => setGapsInfoOpen(false)}>
          <DialogTitle>Gaps</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Definition:</b> Number of scheduled days in the past 7 days where the habit was missed (no log made).
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Calculation:</b> We count all the days in the past 7 days where you had habits scheduled but didn't log any completion.
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <b>Motivation:</b> A small gap is easy to recover from! This metric helps you identify missed opportunities and encourages you to close the gap in the next 7 days.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setGapsInfoOpen(false)} color="primary">Close</Button>
          </DialogActions>
        </Dialog>

        {/* Calendar Log Modal */}
        <Dialog 
          open={calendarLogModalOpen} 
          onClose={() => setCalendarLogModalOpen(false)} 
          maxWidth="sm" 
          fullWidth
          ref={dialogRef}
          sx={{
            '& .MuiDialog-paper': {
              maxHeight: isKeyboardVisible ? '80vh' : '90vh',
              margin: isKeyboardVisible ? '20px' : '32px',
            }
          }}
        >
          <DialogTitle sx={{ fontWeight: 'bold' }}>
            {habits[calendarLogEntry.habitIndex] ? `Log ${habits[calendarLogEntry.habitIndex].title}` : 'Log Habit'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                label="Date"
                type="date"
                value={calendarLogEntry.date}
                onChange={e => handleCalendarLogChange('date', e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
                inputProps={{ 
                  max: getTodayString(),
                  style: { 
                    paddingRight: '12px',
                    textAlign: 'left'
                  }
                }}
                InputProps={{
                  style: {
                    paddingRight: '8px'
                  }
                }}
                error={isFutureDate(calendarLogEntry.date)}
                helperText={isFutureDate(calendarLogEntry.date) ? 'Cannot log for a future date' : ''}
              />
              {habits[calendarLogEntry.habitIndex]?.trackingType === "progress" && (
                <TextField
                  label={`Progress (${habits[calendarLogEntry.habitIndex]?.units || 'units'})`}
                  value={calendarLogEntry.progress}
                  onChange={e => handleCalendarLogChange('progress', e.target.value)}
                  fullWidth
                  placeholder={`e.g. ${habits[calendarLogEntry.habitIndex]?.target || '5'}`}
                  type="number"
                  required
                />
              )}
              <Box>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'medium' }}>
                  How did you feel?
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {[1, 2, 3, 4, 5].map((feeling) => (
                    <Box
                      key={feeling}
                      sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        cursor: 'pointer',
                        p: 1,
                        borderRadius: 1,
                        backgroundColor: calendarLogEntry.feeling === feeling ? 'primary.light' : 'transparent',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        }
                      }}
                      onClick={() => handleCalendarLogChange('feeling', feeling)}
                    >
                      <Typography variant="h4" sx={{ mb: 0.5 }}>
                        {getFeelingEmoji(feeling)}
                      </Typography>
                      <Typography variant="caption" sx={{ textAlign: 'center' }}>
                        {getFeelingText(feeling)}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              <TextField
                label="Notes (optional)"
                value={calendarLogEntry.notes}
                onChange={e => handleCalendarLogChange('notes', e.target.value)}
                fullWidth
                multiline
                rows={3}
                placeholder="How did it go? Any thoughts?"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCalendarLogModalOpen(false)} color="secondary">
              Cancel
            </Button>
            <Button 
              onClick={handleCalendarLogSubmit} 
              variant="contained" 
              color="primary"
              disabled={isFutureDate(calendarLogEntry.date)}
            >
              {calendarLogEntry.isExistingEntry ? 'Update' : 'Log'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Log Generator */}
        

      </Box>
    </ThemeProvider>
  );
}

export default App;