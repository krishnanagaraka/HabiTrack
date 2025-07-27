import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
  Typography,
  Chip,
  Grid,
  FormHelperText
} from '@mui/material';

const HabitForm = ({
  open,
  onClose,
  habit,
  onHabitChange,
  editIndex,
  habitFormStep,
  onNextStep,
  onPrevStep,
  onSubmit,
  habitError
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onHabitChange({ ...habit, [name]: value });
  };

  const handleWeeklyDayToggle = (dayIndex) => {
    const newWeeklyDays = habit.weeklyDays.includes(dayIndex)
      ? habit.weeklyDays.filter(d => d !== dayIndex)
      : [...habit.weeklyDays, dayIndex];
    onHabitChange({ ...habit, weeklyDays: newWeeklyDays });
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        How do you want to track this habit?
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6}>
          <Box
            onClick={() => onHabitChange({ ...habit, trackingType: 'completion' })}
            sx={{
              p: 2,
              border: `2px solid ${habit.trackingType === 'completion' ? 'primary.main' : 'divider'}`,
              borderRadius: 2,
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: habit.trackingType === 'completion' ? 'primary.light' : 'background.paper',
              '&:hover': {
                backgroundColor: habit.trackingType === 'completion' ? 'primary.light' : 'action.hover'
              }
            }}
          >
            <Typography variant="h6">Completion</Typography>
            <Typography variant="body2" color="text.secondary">
              Mark as done/not done
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={6}>
          <Box
            onClick={() => onHabitChange({ ...habit, trackingType: 'progress' })}
            sx={{
              p: 2,
              border: `2px solid ${habit.trackingType === 'progress' ? 'primary.main' : 'divider'}`,
              borderRadius: 2,
              cursor: 'pointer',
              textAlign: 'center',
              backgroundColor: habit.trackingType === 'progress' ? 'primary.light' : 'background.paper',
              '&:hover': {
                backgroundColor: habit.trackingType === 'progress' ? 'primary.light' : 'action.hover'
              }
            }}
          >
            <Typography variant="h6">Progress</Typography>
            <Typography variant="body2" color="text.secondary">
              Track numerical progress
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Habit Details
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            name="title"
            label="Habit Title"
            value={habit.title}
            onChange={handleChange}
            fullWidth
            required
            error={!!habitError}
            helperText={habitError}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            name="description"
            label="Description (optional)"
            value={habit.description}
            onChange={handleChange}
            fullWidth
            multiline
            rows={2}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Frequency</InputLabel>
            <Select
              name="frequency"
              value={habit.frequency}
              onChange={handleChange}
              label="Frequency"
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            name="times"
            label={habit.frequency === 'daily' ? 'Times per day' : 
                   habit.frequency === 'weekly' ? 'Times per week' : 'Times per month'}
            value={habit.times}
            onChange={handleChange}
            fullWidth
            type="number"
            placeholder={habit.frequency === 'daily' ? '1' : 
                        habit.frequency === 'weekly' ? '3' : '4'}
          />
        </Grid>
        {habit.frequency === 'weekly' && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Select days of the week:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                <Chip
                  key={day}
                  label={day}
                  onClick={() => handleWeeklyDayToggle(index)}
                  color={habit.weeklyDays.includes(index) ? 'primary' : 'default'}
                  variant={habit.weeklyDays.includes(index) ? 'filled' : 'outlined'}
                  clickable
                />
              ))}
            </Box>
          </Grid>
        )}
        <Grid item xs={12} sm={6}>
          <TextField
            name="startTime"
            label="Reminder Time (optional)"
            value={habit.startTime}
            onChange={handleChange}
            fullWidth
            type="time"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        {habit.trackingType === 'progress' && (
          <>
            <Grid item xs={12} sm={6}>
              <TextField
                name="units"
                label="Units"
                value={habit.units}
                onChange={handleChange}
                fullWidth
                placeholder="e.g., miles, pages, minutes"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                name="target"
                label="Daily Target"
                value={habit.target}
                onChange={handleChange}
                fullWidth
                type="number"
                placeholder="e.g., 5"
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editIndex !== null ? 'Edit Habit' : 'Add New Habit'}
      </DialogTitle>
      <DialogContent>
        {habitFormStep === 1 ? renderStep1() : renderStep2()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Cancel
        </Button>
        {habitFormStep === 1 && (
          <Button 
            onClick={onNextStep} 
            variant="contained" 
            disabled={!habit.trackingType}
          >
            Next
          </Button>
        )}
        {habitFormStep === 2 && (
          <>
            <Button onClick={onPrevStep} color="secondary">
              Back
            </Button>
            <Button 
              onClick={onSubmit} 
              variant="contained" 
              color="primary"
              disabled={!habit.title || (habit.frequency === 'weekly' && habit.weeklyDays.length === 0)}
            >
              {editIndex !== null ? 'Update' : 'Create'}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default HabitForm; 