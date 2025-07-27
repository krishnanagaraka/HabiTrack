import React, { useState } from 'react';
import { 
  Button, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Typography, 
  Box,
  LinearProgress,
  Alert
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';

const LogGenerator = ({ habits, completions, setCompletions, onClose }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentHabit, setCurrentHabit] = useState('');
  const [logsGenerated, setLogsGenerated] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);

  const clearAllLogs = () => {
    if (window.confirm('Are you sure you want to delete ALL logs? This action cannot be undone.')) {
      setCompletions({});
      localStorage.setItem('completions', JSON.stringify({}));
      alert('All logs have been cleared!');
    }
  };

  const generateRandomLogs = async () => {
    if (habits.length === 0) {
      alert('No habits found. Please add some habits first.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setLogsGenerated(0);
    
    const logsPerHabit = 50;
    const totalLogsToGenerate = habits.length * logsPerHabit;
    setTotalLogs(totalLogsToGenerate);

    const newCompletions = { ...completions };
    let currentLogCount = 0;

    // Generate logs for each habit
    for (let habitIndex = 0; habitIndex < habits.length; habitIndex++) {
      const habit = habits[habitIndex];
      setCurrentHabit(habit.title);

      // Generate 50 logs for this habit
      for (let i = 0; i < logsPerHabit; i++) {
        // Generate a random date within the last 6 months
        const randomDate = new Date();
        randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 180));
        
        const year = randomDate.getFullYear();
        const month = String(randomDate.getMonth() + 1).padStart(2, '0');
        const day = String(randomDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${day}`;

        // Check if this day should have the habit scheduled
        const dayOfWeek = randomDate.getDay();
        let isScheduled = false;
        
        if (habit.frequency === 'daily') {
          isScheduled = true;
        } else if (habit.frequency === 'weekly') {
          isScheduled = habit.weeklyDays.includes(dayOfWeek);
        }

        // Only generate logs for scheduled days (70% completion rate)
        if (isScheduled && Math.random() < 0.7) {
          // Initialize the date entry if it doesn't exist
          if (!newCompletions[dateStr]) {
            newCompletions[dateStr] = {};
          }

          // Generate random log data
          const feeling = Math.floor(Math.random() * 5) + 1; // 1-5
          const notes = Math.random() < 0.3 ? generateRandomNote() : '';
          
          let progress = '';
          if (habit.trackingType === 'progress') {
            const target = parseFloat(habit.target) || 1;
            const minProgress = target * 0.5; // At least 50% of target
            const maxProgress = target * 1.5; // Up to 150% of target
            progress = (Math.random() * (maxProgress - minProgress) + minProgress).toFixed(1);
          }

          // Create the log entry
          newCompletions[dateStr][habitIndex] = {
            completed: true,
            feeling,
            notes,
            progress,
            timestamp: randomDate.getTime()
          };

          currentLogCount++;
        }

        // Update progress
        const currentProgress = ((habitIndex * logsPerHabit + i + 1) / totalLogsToGenerate) * 100;
        setProgress(currentProgress);
        setLogsGenerated(currentLogCount);

        // Small delay to show progress
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    }

    // Update completions state
    setCompletions(newCompletions);
    
    // Save to localStorage
    localStorage.setItem('completions', JSON.stringify(newCompletions));
    
    setIsGenerating(false);
    setProgress(100);
    
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const generateRandomNote = () => {
    const notes = [
      'Feeling great today!',
      'Made good progress',
      'Stayed consistent',
      'Pushed through',
      'On track with goals',
      'Building momentum',
      'Small win today',
      'Getting stronger',
      'Maintaining focus',
      'Step by step progress'
    ];
    return notes[Math.floor(Math.random() * notes.length)];
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Test Logs</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          This will generate 50 random logs for each habit over the last 6 months.
        </Typography>
        
        {habits.length === 0 ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            No habits found. Please add some habits first.
          </Alert>
        ) : (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Habits found: {habits.length}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Total logs to generate: {habits.length * 50}
            </Typography>
          </Box>
        )}

        {isGenerating && (
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Generating logs for: {currentHabit}
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Progress: {logsGenerated} / {totalLogs} logs generated
            </Typography>
            <LinearProgress variant="determinate" value={progress} sx={{ mb: 1 }} />
            <Typography variant="caption" color="text.secondary">
              {Math.round(progress)}% complete
            </Typography>
          </Box>
        )}

        {progress === 100 && !isGenerating && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Successfully generated {logsGenerated} logs!
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={clearAllLogs} 
          disabled={isGenerating}
          color="error"
          variant="outlined"
        >
          Clear All Logs
        </Button>
        <Button onClick={onClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button 
          onClick={generateRandomLogs} 
          disabled={isGenerating || habits.length === 0}
          variant="contained"
          startIcon={<AddIcon />}
        >
          {isGenerating ? 'Generating...' : 'Generate Logs'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LogGenerator; 