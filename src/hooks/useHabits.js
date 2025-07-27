import { useState, useEffect } from 'react';
import notificationService from '../notificationService';

export const useHabits = () => {
  const [habits, setHabits] = useState(() => {
    const saved = localStorage.getItem('habits');
    return saved ? JSON.parse(saved) : [];
  });

  const [completions, setCompletions] = useState(() => {
    const saved = localStorage.getItem('completions');
    return saved ? JSON.parse(saved) : {};
  });

  const [weeklyHistory, setWeeklyHistory] = useState(() => {
    const saved = localStorage.getItem('weeklyHistory');
    return saved ? JSON.parse(saved) : {};
  });

  // Save habits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Save completions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('completions', JSON.stringify(completions));
  }, [completions]);

  // Save weekly history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('weeklyHistory', JSON.stringify(weeklyHistory));
  }, [weeklyHistory]);

  const addHabit = async (newHabit) => {
    const habitWithId = {
      ...newHabit,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    };
    
    setHabits(prev => [...prev, habitWithId]);
    
    // Schedule notifications if time is set
    if (newHabit.startTime) {
      await notificationService.scheduleNotification(habitWithId);
    }
  };

  const updateHabit = async (index, updatedHabit) => {
    const updatedHabits = [...habits];
    updatedHabits[index] = { ...updatedHabits[index], ...updatedHabit };
    setHabits(updatedHabits);
    
    // Reschedule notifications
    if (updatedHabit.startTime) {
      await notificationService.cancelNotification(habits[index]);
      await notificationService.scheduleNotification(updatedHabits[index]);
    }
  };

  const deleteHabit = async (index) => {
    const habitToDelete = habits[index];
    
    // Cancel notifications
    await notificationService.cancelNotification(habitToDelete);
    
    // Remove from habits array
    setHabits(prev => prev.filter((_, i) => i !== index));
    
    // Clean up completions for this habit
    setCompletions(prev => {
      const newCompletions = { ...prev };
      Object.keys(newCompletions).forEach(date => {
        if (newCompletions[date][index]) {
          delete newCompletions[date][index];
          // If no more entries for this date, remove the date entirely
          if (Object.keys(newCompletions[date]).length === 0) {
            delete newCompletions[date];
          }
        }
      });
      return newCompletions;
    });
  };

  const toggleCompletion = (date, habitIndex, completionData = {}) => {
    setCompletions(prev => {
      const newCompletions = { ...prev };
      if (!newCompletions[date]) {
        newCompletions[date] = {};
      }
      
      if (newCompletions[date][habitIndex]) {
        // Remove completion
        delete newCompletions[date][habitIndex];
        if (Object.keys(newCompletions[date]).length === 0) {
          delete newCompletions[date];
        }
      } else {
        // Add completion
        newCompletions[date][habitIndex] = {
          completed: true,
          feeling: 3,
          duration: '',
          notes: '',
          progress: '',
          ...completionData
        };
      }
      
      return newCompletions;
    });
  };

  const getHabitCompletion = (date, habitIndex) => {
    return completions[date]?.[habitIndex] || null;
  };

  const getHabitStats = (habitIndex, days = 7) => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - days + 1);
    
    let completedDays = 0;
    let totalProgress = 0;
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const completion = getHabitCompletion(dateStr, habitIndex);
      
      if (completion?.completed) {
        completedDays++;
        if (completion.progress) {
          totalProgress += parseFloat(completion.progress) || 0;
        }
      }
    }
    
    return {
      completedDays,
      totalDays: days,
      completionRate: Math.round((completedDays / days) * 100),
      totalProgress
    };
  };

  return {
    habits,
    completions,
    weeklyHistory,
    setWeeklyHistory,
    addHabit,
    updateHabit,
    deleteHabit,
    toggleCompletion,
    getHabitCompletion,
    getHabitStats
  };
}; 