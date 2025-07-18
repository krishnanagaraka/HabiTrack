import React, { useState, useEffect } from "react";
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
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SelfImprovementIcon from '@mui/icons-material/SelfImprovement';
import ChecklistIcon from '@mui/icons-material/Checklist';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import CloseIcon from '@mui/icons-material/Close';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import Calendar from './Calendar';
import HabitCalendar from './HabitCalendar';
import { useTheme } from './ThemeContext';
import { generateTestData, clearTestData, generateMinimalTestData } from '../test-data-generator';
import notificationService from './notificationService';
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

function App() {
  // All hooks must be called at the top, before any conditional returns
  const { darkMode, toggleDarkMode, theme } = useTheme();
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
  const [logEntry, setLogEntry] = useState({
    habitIndex: 0,
    date: new Date().toISOString().split('T')[0],
    feeling: 3,
    duration: '', // Optional duration
    progress: '' // For progress tracking
  });
  const [currentDate, setCurrentDate] = useState(new Date());
  const [completions, setCompletions] = useState(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : {};
  });
  const [weeklyHistory, setWeeklyHistory] = useState(() => {
    const saved = localStorage.getItem('weeklyHistory');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentTab, setCurrentTab] = useState(0);
  const [showDevPanel, setShowDevPanel] = useState(false);
  const isDevelopment = process.env.NODE_ENV === 'development';
  const [bestStreakInfoOpen, setBestStreakInfoOpen] = useState(false);
  const [disciplineInfoOpen, setDisciplineInfoOpen] = useState(false);
  const [thisWeekInfoOpen, setThisWeekInfoOpen] = useState(false);
  const [last30DaysInfoOpen, setLast30DaysInfoOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(() => !localStorage.getItem('onboardingComplete'));
  const [editLog, setEditLog] = useState(null); // Track if editing a log
  const [logError, setLogError] = useState('');
  const [habitError, setHabitError] = useState('');

  // Add this helper function at the top-level of App
  const isFutureDate = (dateStr) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const d = new Date(dateStr);
    d.setHours(0,0,0,0);
    return d > today;
  };

  // Notification scheduling functions
  const scheduleHabitNotifications = async (habit) => {
    console.log('Scheduling notifications for habit:', habit.title, 'at time:', habit.startTime);
    try {
      await notificationService.scheduleNotification(habit);
      console.log('Notification scheduled successfully for:', habit.title);
    } catch (error) {
      console.log('Error scheduling notification for:', habit.title, error);
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
        console.log('Requesting notification permissions...');
        const hasPermission = await notificationService.requestPermissions();
        console.log('Notification permission granted:', hasPermission);
        
        // Also check current permission status
        const currentPermission = await notificationService.checkPermissions();
        console.log('Current notification permission status:', currentPermission);
        
        if (hasPermission) {
          console.log('✅ Notification permissions are granted!');
        } else {
          console.log('❌ Notification permissions are NOT granted!');
        }
      } catch (error) {
        console.log('Error requesting notification permissions:', error);
      }
    };
    
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  useEffect(() => {
    localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
  }, [weeklyHistory]);

  useEffect(() => {
    if (habits.length > 0) {
      const today = new Date();
      const weekStart = new Date(today);
      const dayOfWeek = today.getDay();
      const daysToSubtract = dayOfWeek; // Sunday = 0, so no subtraction needed for Sunday
      weekStart.setDate(today.getDate() - daysToSubtract);
      weekStart.setHours(0, 0, 0, 0);
      
      const currentWeekKey = weekStart.toISOString().split('T')[0];
      
      const weeklyStats = habits.map((habit, idx) => {
        const weekCompletions = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          return completionDate >= weekStart && 
                 completionDate <= today && 
                 completions[date][idx];
        }).length;
        
        let totalDays;
        if (habit.frequency === 'daily') {
          const daysDiff = Math.floor((today - weekStart) / (1000 * 60 * 60 * 24)) + 1;
          totalDays = Math.min(7, Math.max(1, daysDiff));
        } else if (habit.frequency === 'weekly') {
          // Count how many of the selected days fall within this week
          const selectedDays = habit.weeklyDays || [];
          const weekDays = [];
          for (let i = 0; i < 7; i++) {
            const dayDate = new Date(weekStart);
            dayDate.setDate(weekStart.getDate() + i);
            const dayOfWeek = dayDate.getDay(); // Sunday=0, Saturday=6
            if (selectedDays.includes(dayOfWeek)) {
              weekDays.push(dayDate);
            }
          }
          // Only count days that are today or in the past
          totalDays = weekDays.filter(day => day <= today).length;
        } else {
          totalDays = Math.min(7, Math.floor((today - weekStart) / (1000 * 60 * 60 * 24)) + 1);
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
  }, [habits, completions, weeklyHistory]);

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
    // Calculate week start (Sunday as first day of week)
    const weekStart = new Date(today);
    const dayOfWeek = today.getDay();
    const daysToSubtract = dayOfWeek; // Sunday = 0, so no subtraction needed for Sunday
    weekStart.setDate(today.getDate() - daysToSubtract);
    weekStart.setHours(0, 0, 0, 0);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const weeklyStats = habits.map((habit, idx) => {
      if (habit.trackingType === "progress") {
        // For progress-type habits, calculate based on actual progress values
        const weekProgressEntries = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          return completionDate >= weekStart && 
                 completionDate <= today && 
                 completions[date][idx] &&
                 completions[date][idx].progress;
        });
        
        // Sum up progress values, but cap each day at the target
        const target = parseFloat(habit.target) || 1;
        let totalProgress = 0;
        let completionDays = 0;
        
        weekProgressEntries.forEach(date => {
          const progress = parseFloat(completions[date][idx].progress) || 0;
          // Cap progress at target per day
          const cappedProgress = Math.min(progress, target);
          totalProgress += cappedProgress;
          completionDays++;
        });
        
        // Calculate percentage based on total progress vs total target for the week
        let weeklyTarget;
        if (habit.frequency === 'weekly') {
          // For weekly habits, use the actual frequency (times per week)
          const timesPerWeek = parseInt(habit.times) || 1;
          weeklyTarget = target * timesPerWeek;
        } else {
          // For daily habits, use 7 days
          weeklyTarget = target * 7;
        }
        const percent = weeklyTarget > 0 ? Math.round((totalProgress / weeklyTarget) * 100) : 0;
        
        return {
          completed: completionDays,
          total: habit.frequency === 'weekly' ? (parseInt(habit.times) || 1) : 7,
          percent: percent,
          progress: totalProgress,
          target: weeklyTarget
        };
      } else {
        // For completion-type habits, use the existing logic
        const weekCompletions = Object.keys(completions).filter(date => {
          const completionDate = new Date(date);
          return completionDate >= weekStart && 
                 completionDate <= today && 
                 completions[date][idx];
        }).length;
        
        // Calculate total days based on habit frequency
        let totalDays;
        if (habit.frequency === 'daily') {
          // For daily habits, count actual days from week start to today
          const daysDiff = Math.floor((today - weekStart) / (1000 * 60 * 60 * 24)) + 1;
          totalDays = Math.min(7, Math.max(1, daysDiff));
        } else if (habit.frequency === 'weekly') {
          totalDays = parseInt(habit.times) || 1;
        } else if (habit.frequency === 'monthly') {
          totalDays = Math.ceil((parseInt(habit.times) || 1) / 4); // Approximate weekly target
        } else {
          totalDays = Math.min(7, Math.floor((today - weekStart) / (1000 * 60 * 60 * 24)) + 1);
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
          return completionDate >= thirtyDaysAgo && 
                 completionDate <= today && 
                 completions[date][idx] &&
                 completions[date][idx].progress;
        });
        
        // Sum up progress values, but cap each day at the target
        const target = parseFloat(habit.target) || 1;
        let totalProgress = 0;
        let completionDays = 0;
        
        monthProgressEntries.forEach(date => {
          const progress = parseFloat(completions[date][idx].progress) || 0;
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
        const percent = monthlyTarget > 0 ? Math.round((totalProgress / monthlyTarget) * 100) : 0;
        
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
          return completionDate >= thirtyDaysAgo && 
                 completionDate <= today && 
                 completions[date][idx];
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
          percent: totalDays > 0 ? Math.round((last30DaysCompletions / totalDays) * 100) : 0
        };
      }
    });

    // Calculate weekly completion rate
    const totalPercent = weeklyStats.reduce((sum, stat) => sum + stat.percent, 0);
    const completionRate = habits.length > 0 ? Math.round(totalPercent / habits.length) : 0;
    
    // Calculate weekly streak
    const calculateWeeklyStreak = () => {
      if (habits.length === 0) return 0;
      
      // Calculate streak by checking consecutive weeks
      let streak = 0;
      let checkDate = new Date(weekStart);
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
      const hybridScore = Math.round(0.5 * completionRate + 0.5 * streakScore);
      
      return hybridScore;
    };
    
    const disciplineScore = calculateHybridDisciplineScore();

    // Calculate streaks (last 30 days only) - all habits count consecutive days
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    const streaks = habits.map((habit, idx) => {
      let streak = 0;
      
      if (habit.frequency === 'daily') {
        // For daily habits, count consecutive days from today backwards
        let currentDate = new Date(today);
        while (currentDate >= thirtyDaysAgo) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (completions[dateStr] && completions[dateStr][idx]) {
            streak++;
            currentDate.setDate(currentDate.getDate() - 1);
          } else {
            break;
          }
        }
      } else {
        // For weekly/monthly habits, count total completions in last 30 days
        let currentDate = new Date(today);
        while (currentDate >= thirtyDaysAgo) {
          const dateStr = currentDate.toISOString().split('T')[0];
          if (completions[dateStr] && completions[dateStr][idx]) {
            streak++;
          }
          currentDate.setDate(currentDate.getDate() - 1);
        }
      }
      
      // Debug individual habit streak
      console.log(`Habit ${idx} (${habit.title}): streak = ${streak} (${habit.frequency})`);
      
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

  // Debug: Log detailed streak information
  console.log('=== STREAK DEBUG ===');
  console.log('Habits:', habits.map((h, i) => ({ index: i, title: h.title, frequency: h.frequency })));
  console.log('Streaks:', streaks);
  console.log('Completions keys:', Object.keys(completions).filter(key => key !== '_durations' && key !== '_feelings').sort());
  
  // Find best and worst streaks and their habits
  const bestStreakValue = streaks.length > 0 ? Math.max(...streaks) : 0;
  const bestStreakIndex = streaks.findIndex(s => s === bestStreakValue);
  const bestStreakHabit = habits[bestStreakIndex]?.title || '-';
  
  console.log('Best streak value:', bestStreakValue);
  console.log('Best streak index:', bestStreakIndex);
  console.log('Best streak habit:', bestStreakHabit);
  console.log('=== END STREAK DEBUG ===');
  const worstStreakValue = streaks.length > 0 ? Math.min(...streaks) : 0;
  const worstStreakIndex = streaks.findIndex(s => s === worstStreakValue);
  const worstStreakHabit = habits[worstStreakIndex]?.title || '-';

  // Calendar helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCompleted = (date, habitIndex) => {
    const dateStr = formatDate(date);
    return completions[dateStr] && completions[dateStr][habitIndex];
  };

  const toggleCompletion = (date, habitIndex) => {
    const dateStr = formatDate(date);
    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (!newCompletions[dateStr]) {
        newCompletions[dateStr] = new Array(habits.length).fill(false);
      }
      newCompletions[dateStr][habitIndex] = !newCompletions[dateStr][habitIndex];
      return newCompletions;
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

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
    
    // Debug log for notification scheduling
    console.log('DEBUG: handleSubmit - about to schedule notifications for habit:', JSON.stringify(newHabit));
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
      
      setHabits(prev => prev.filter((_, i) => i !== index));
      setCompletions(prev => {
        const newCompletions = {};
        Object.keys(prev).forEach(date => {
          const newCompletionsForDate = prev[date].filter((_, i) => i !== index);
          if (newCompletionsForDate.length > 0) {
            newCompletions[date] = newCompletionsForDate;
          }
        });
        return newCompletions;
      });
    }
  };

  // Helper to get all logs as an array (last 30 days only)
  const getLogs = () => {
    const logs = [];
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    Object.entries(completions).forEach(([date, arr]) => {
      if (date === '_durations' || date === '_feelings') return;
      const logDate = new Date(date);
      if (logDate < thirtyDaysAgo || logDate > now) return;
      arr.forEach((completed, idx) => {
        if (completed && habits[idx]) {
          const duration = completions._durations && completions._durations[date] && completions._durations[date][idx];
          const feeling = completions._feelings && completions._feelings[date] && completions._feelings[date][idx];
          const progress = completed.progress;
          logs.push({ date, habit: habits[idx].title, habitIndex: idx, duration, feeling, progress });
        }
      });
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

  const handleDuplicateLog = (log) => {
    setEditLog(null); // Not editing, creating new
    setLogEntry({
      habitIndex: log.habitIndex,
      date: new Date().toISOString().split('T')[0], // today
      feeling: log.feeling || 3,
      duration: log.duration || '',
      progress: log.progress || ''
    });
    setLogModalOpen(true);
  };

  const handleLogModalOpen = () => {
    setLogModalOpen(true);
    setEditLog(null);
    setLogEntry({
      habitIndex: 0,
      date: new Date().toISOString().split('T')[0],
      feeling: 3,
      duration: '',
      progress: ''
    });
  };

  const handleLogModalClose = () => {
    setLogModalOpen(false);
    setEditLog(null);
    setLogEntry({
      habitIndex: 0,
      date: new Date().toISOString().split('T')[0],
      feeling: 3,
      duration: '',
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
        duration: logEntry.duration,
        progress: logEntry.progress,
        notes: logEntry.notes || ''
      };
      return newCompletions;
    });

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
        duration: logEntry.duration,
        progress: logEntry.progress,
        notes: logEntry.notes || ''
      };
      return newCompletions;
    });
  };

  const handleOnboardingClose = () => {
    localStorage.setItem('onboardingComplete', 'true');
    setOnboardingOpen(false);
  };

  const renderDashboard = () => (
    <Box>
      {/* Enhanced Metrics Cards */}
      <Box sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr 1fr', // 2 columns on extra small screens
          sm: '1fr 1fr', // 2 columns on small screens
          md: '1fr 1fr 1fr 1fr' // 4 columns on medium and up
        },
        gap: 2,
        mb: 3,
        width: '100%'
      }}>
        {/* Discipline Score */}
        <Card sx={{ minWidth: 0, width: '100%', height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: 0, m: 0 }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Discipline Score</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', mb: { xs: 0.2, sm: 0.5 }, color: '#3498db', fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2.1rem' } }}>
              {disciplineScore}%
            </Typography>
            <LinearProgress 
              variant="determinate" 
              value={disciplineScore} 
              sx={{ 
                backgroundColor: 'rgba(255,255,255,0.2)',
                height: { xs: 5, sm: 6, md: 8 },
                borderRadius: 4,
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#3498db',
                  borderRadius: 4
                }
              }}
            />
            {habits.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                  Best: {weeklyBestWorst.best?.habit} ({weeklyBestWorst.best?.percent}%)
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' }, display: 'block' }}>
                  Needs Improvement: {weeklyBestWorst.worst?.habit} ({weeklyBestWorst.worst?.percent}%)
                </Typography>
              </Box>
            )}
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <IconButton onClick={() => setDisciplineInfoOpen(true)} sx={{ p: 0.5 }}>
                <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        {/* Best Streak */}
        <Card sx={{ minWidth: 0, width: '100%', height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: 0, m: 0 }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Best Streak</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#e74c3c', fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2.1rem' } }}>
              {bestStreakValue} {bestStreakValue === 1 ? 'Day' : 'Days'}
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
              Best: {bestStreakHabit}
            </Typography>
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <IconButton onClick={() => setBestStreakInfoOpen(true)} sx={{ p: 0.5 }}>
                <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        {/* This Week */}
        <Card sx={{ minWidth: 0, width: '100%', height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'linear-gradient(135deg, #34495e 0%, #2c3e50 100%)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: 0, m: 0 }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>This Week</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#f39c12', fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2.1rem' } }}>
              {weeklyStats.length > 0 ? Math.round(weeklyStats.reduce((sum, stat) => sum + stat.percent, 0) / weeklyStats.length) : 0}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
              average completion
            </Typography>
            {habits.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                  Best: {weeklyBestWorst.best?.habit} ({weeklyBestWorst.best?.percent}%)
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' }, display: 'block' }}>
                  Needs Improvement: {weeklyBestWorst.worst?.habit} ({weeklyBestWorst.worst?.percent}%)
                </Typography>
              </Box>
            )}
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <IconButton onClick={() => setThisWeekInfoOpen(true)} sx={{ p: 0.5 }}>
                <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
        {/* Last 30 Days */}
        <Card sx={{ minWidth: 0, width: '100%', height: 160, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)', color: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', p: 0, m: 0 }}>
          <CardContent sx={{ p: { xs: 1, sm: 1.5, md: 2 }, pb: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ fontSize: { xs: '0.95rem', sm: '1.1rem' }, fontWeight: 600, mb: 0.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Last 30 Days</Typography>
            <Typography variant="h3" sx={{ fontWeight: 'bold', color: '#9b59b6', fontSize: { xs: '1.3rem', sm: '1.7rem', md: '2.1rem' } }}>
              {monthlyStats.length > 0 ? Math.round(monthlyStats.reduce((sum, stat) => sum + stat.percent, 0) / monthlyStats.length) : 0}%
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' } }}>
              average completion
            </Typography>
            {habits.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' } }}>
                  Best: {monthlyBestWorst.best?.habit} ({monthlyBestWorst.best?.percent}%)
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8, fontSize: { xs: '0.6rem', sm: '0.7rem' }, display: 'block' }}>
                  Needs Improvement: {monthlyBestWorst.worst?.habit} ({monthlyBestWorst.worst?.percent}%)
                </Typography>
              </Box>
            )}
            <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
              <IconButton onClick={() => setLast30DaysInfoOpen(true)} sx={{ p: 0.5 }}>
                <InfoOutlinedIcon sx={{ color: 'rgba(255,255,255,0.7)', fontSize: { xs: 18, sm: 20 } }} />
              </IconButton>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Calendar Section */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
          Habit Calendar
        </Typography>
        <Box sx={{ 
          width: '100%', 
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>
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
                <Calendar completions={completions} habits={habits} />
              </CardContent>
            </Card>
          </Box>
        </Box>
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
        <AppBar position="static" elevation={0} sx={{ backgroundColor: 'background.paper', color: 'text.primary', width: '100%', pt: { xs: 4, sm: 2 } }}>
          <Toolbar sx={{ width: '100%', px: { xs: 1, sm: 2, md: 3 }, flexDirection: 'column', alignItems: 'flex-start', py: 1 }}>
            <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.25 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box component="img" src="/icon.svg" alt="HabiTrack icon" sx={{ height: 36, mr: 1 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                  HabiTrack
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <IconButton 
                  color="secondary" 
                  size="small" 
                  onClick={toggleDarkMode}
                  sx={{ 
                    p: 1,
                    mr: 1,
                    border: '1px solid',
                    borderColor: 'secondary.main',
                    '&:hover': {
                      backgroundColor: 'secondary.light',
                      color: 'secondary.contrastText'
                    }
                  }}
                >
                  {darkMode ? <Brightness7Icon sx={{ fontSize: 20 }} /> : <Brightness4Icon sx={{ fontSize: 20 }} />}
                </IconButton>
              </Box>
            </Box>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary', fontWeight: 500, lineHeight: 1.2, pl: 0 }}>
              Build discipline. Track Habits. Change your life.
            </Typography>
          </Toolbar>
        </AppBar>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', backgroundColor: 'background.paper' }}>
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
            <Tab label="Activity Log" />
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
          {currentTab === 0 && renderDashboard()}
          {currentTab === 1 && (
            <Box sx={{ 
              width: '100%', 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center'
            }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                Your Habits
              </Typography>
              {habits.length > 0 ? (
                <Box sx={{ 
                  width: '100%', 
                  maxWidth: '100%',
                  mx: 'auto'
                }}>
                  {/* Mobile: One row per tile, dynamic width */}
                  <Box sx={{ 
                    display: { xs: 'flex', md: 'grid' },
                    flexDirection: { xs: 'column', md: 'unset' },
                    gridTemplateColumns: { md: 'repeat(auto-fill, minmax(300px, 1fr))' },
                    gap: 2,
                    width: '100%',
                    maxWidth: '100%',
                    overflow: 'hidden'
                  }}>
                    {habits.map((habit, idx) => (
                              <Card key={idx} sx={{ 
          width: { xs: '100%', md: 'auto' },
          minWidth: { xs: 280, md: 300 },
          maxWidth: { xs: '100%', md: 320 },
          height: 158, // 75% of 210 (210 * 0.75 = 157.5, rounded to 158)
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'space-between',
          flexShrink: 0,
          flexGrow: 0,
          boxShadow: 2,
          m: 0,
          p: 0
        }}>
                          <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', p: 1, pb: '6px !important' }}>
    <Box sx={{ mb: 0.3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1rem', lineHeight: 1.1, mr: 1 }}>
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
          <IconButton size="small" onClick={() => handleEdit(idx)} sx={{ p: 0.5 }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(idx)} sx={{ p: 0.5 }}>
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
          fontSize: '0.85rem',
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
          {habit.trackingType === "progress" ? "Weekly Progress" : "Weekly Progress"}
        </Typography>
        <Typography variant="body2" color="primary" sx={{ fontSize: '0.8rem' }}>
          {habit.trackingType === "progress" 
            ? `${weeklyStats[idx]?.progress || 0}/${weeklyStats[idx]?.target || 0} ${habit.units || 'units'} (${weeklyStats[idx]?.percent || 0}%)`
            : `${weeklyStats[idx]?.completed || 0}/${weeklyStats[idx]?.total || 0} (${weeklyStats[idx]?.percent || 0}%)`
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
            ? `${monthlyStats[idx]?.progress || 0}/${monthlyStats[idx]?.target || 0} ${habit.units || 'units'} (${monthlyStats[idx]?.percent || 0}%)`
            : `${monthlyStats[idx]?.percent || 0}%`
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
        {streaks[idx] || 0} {(streaks[idx] || 0) === 1 ? 'day' : 'days'} streak
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
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 700, textAlign: 'center' }}>
                Activity Log
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
                  width: '100%'
                }}>
                  <Table size="small" stickyHeader sx={{ minWidth: { xs: 300, sm: 400 } }}>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 100, sm: 120 }, maxWidth: { xs: 120, sm: 150 } }}>Date</TableCell>
                        <TableCell sx={{ fontWeight: 600, minWidth: { xs: 180, sm: 250 }, maxWidth: { xs: 220, sm: 350 } }}>Habit</TableCell>
                        <TableCell sx={{ fontWeight: 600, width: { xs: 100, sm: 120 }, textAlign: 'center' }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {getLogs().length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} align="center" sx={{ py: 4 }}>
                            <Typography variant="body1" color="text.secondary">
                              {habits.length === 0
                                ? 'Create your habit and then log them to see logs here'
                                : 'Add your first log'}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        <>
                          {getLogs().map((log, idx) => {
                            const habit = habits[log.habitIndex];
                            return (
                              <TableRow 
                                key={log.date + '-' + log.habitIndex}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: 'action.hover'
                                  }
                                }}
                              >
                                <TableCell sx={{ 
                                  fontWeight: 500, 
                                  color: 'text.primary',
                                  maxWidth: { xs: 100, sm: 120 },
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}>
                                  {new Date(log.date).toLocaleDateString('en-US', { 
                                    month: 'short', 
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </TableCell>
                                <TableCell sx={{ maxWidth: { xs: 150, sm: 300 } }}>
                                  <Box sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: { xs: 0.5, sm: 1 },
                                    overflow: 'hidden'
                                  }}>
                                    <Typography variant="body2" sx={{ 
                                      fontWeight: 500,
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      flex: 1
                                    }}>
                                      {log.habit}
                                    </Typography>
                                    <Chip 
                                      label={habit?.frequency || 'daily'} 
                                      size="small" 
                                      variant="outlined"
                                      sx={{ 
                                        height: { xs: 16, sm: 20 }, 
                                        fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                        minWidth: 'fit-content',
                                        flexShrink: 0
                                      }}
                                    />
                                  </Box>
                                </TableCell>

                                <TableCell align="center" sx={{ width: { xs: 80, sm: 100 } }}>
                                  <Box sx={{ 
                                    display: 'flex',
                                    gap: { xs: 0.25, sm: 0.5 },
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                  }}>
                                    <Tooltip title="Edit" placement="top">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditLog(log);
                                        }}
                                        sx={{ p: { xs: 0.25, sm: 0.5 } }}
                                      >
                                        <EditIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Duplicate" placement="top">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDuplicateLog(log);
                                        }}
                                        sx={{ p: { xs: 0.25, sm: 0.5 } }}
                                      >
                                        <ContentCopyIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                                      </IconButton>
                                    </Tooltip>
                                    <Tooltip title="Delete" placement="top">
                                      <IconButton 
                                        size="small" 
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteLog(log);
                                        }}
                                        sx={{ p: { xs: 0.25, sm: 0.5 }, color: 'error.main' }}
                                      >
                                        <DeleteIcon sx={{ fontSize: { xs: 14, sm: 16 } }} />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                          {/* Extra scroll space for FAB - now at least one full row height */}
                          <TableRow>
                            <TableCell colSpan={3} sx={{ height: { xs: 70, sm: 80, md: 80 }, border: 0, p: 0, background: 'transparent' }} />
                          </TableRow>
                        </>
                      )}
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
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                      desc: 'Simple yes/no tracking'
                    }, {
                      type: 'progress',
                      icon: <TrendingUpIcon sx={{ fontSize: 32, color: habit.trackingType === 'progress' ? 'primary.main' : 'text.secondary' }} />,
                      title: 'Track Progress',
                      desc: 'Measure with units and targets'
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
        <Dialog open={logModalOpen} onClose={handleLogModalClose} maxWidth="sm" fullWidth>
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
                  max: new Date().toISOString().split('T')[0],
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
              {habits[logEntry.habitIndex]?.trackingType === "progress" ? (
                <TextField
                  label={`Progress (${habits[logEntry.habitIndex]?.units || 'units'})`}
                  value={logEntry.progress}
                  onChange={e => handleLogChange('progress', e.target.value)}
                  fullWidth
                  placeholder={`e.g. ${habits[logEntry.habitIndex]?.target || '5'}`}
                  type="number"
                  required
                />
              ) : (
                <TextField
                  label="Duration (optional)"
                  value={logEntry.duration}
                  onChange={e => handleLogChange('duration', e.target.value)}
                  fullWidth
                  placeholder="e.g. 30 min"
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

        {/* Onboarding Modal */}
        <Dialog 
          open={onboardingOpen} 
          onClose={handleOnboardingClose} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              overflow: 'hidden',
              maxHeight: '70vh'
            }
          }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            fontWeight: 'bold', 
            pb: 1, 
            position: 'relative',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Welcome to HabiTrack!
            </Typography>
          </DialogTitle>
          <DialogContent sx={{ p: 2, background: 'rgba(255,255,255,0.05)' }}>
            <Typography variant="h6" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold', color: 'white' }}>
              2 Steps to Build Lasting Discipline
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                  <AddIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                    Create Your Habits
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                    Add habits you want to build. Set frequency, choose specific days, and add optional reminders.
                  </Typography>
                </Box>
              </Box>
              
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
                  <TrendingUpIcon sx={{ color: 'white', fontSize: 20 }} />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 0.5, color: 'white' }}>
                    Track & Build Discipline
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontSize: '0.875rem' }}>
                    Mark habits complete daily, log your feelings, and watch your discipline score grow through consistency!
                  </Typography>
                </Box>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ 
            justifyContent: 'center', 
            pb: 2, 
            pt: 1,
            background: 'rgba(255,255,255,0.05)',
            borderTop: '1px solid rgba(255,255,255,0.2)'
          }}>
            <Button 
              onClick={handleOnboardingClose} 
              variant="contained" 
              color="primary"
              sx={{ 
                minWidth: 140,
                py: 1,
                px: 3,
                fontSize: '1rem',
                fontWeight: 'bold',
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                '&:hover': {
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                }
              }}
            >
              Get Started! 🚀
            </Button>
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
      </Box>
    </ThemeProvider>
  );
}

export default App;