import { Container, Typography, Card, CardContent, Box, Grid, Chip, Paper, useTheme, Button } from '@mui/material';
import { TrendingUp, Zap, Trophy, Info, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const LevelInfo = () => {
  const theme = useTheme();
  const navigate = useNavigate();

  const levels = [
    {
      range: "1.0 - 2.0",
      title: "Beginner",
      description: "Basic arithmetic and fundamental concepts. Perfect for building a strong foundation.",
      color: theme.palette.success.main,
      icon: <Zap size={60} />,
      characteristics: [
        "Simple addition and subtraction",
        "Basic multiplication tables",
        "Elementary problem solving",
        "Foundational concepts"
      ]
    },
    {
      range: "2.1 - 3.5",
      title: "Intermediate",
      description: "More complex operations and multi-step problems. Developing problem-solving skills.",
      color: theme.palette.primary.main,
      icon: <TrendingUp size={60} />,
      characteristics: [
        "Multi-step calculations",
        "Fractions and decimals",
        "Word problems",
        "Pattern recognition"
      ]
    },
    {
      range: "3.6 - 5.0",
      title: "Advanced",
      description: "Challenging problems requiring critical thinking and advanced mathematical concepts.",
      color: theme.palette.secondary.main,
      icon: <Trophy size={60} />,
      characteristics: [
        "Complex equations",
        "Advanced algebra",
        "Critical thinking required",
        "Competition-level problems"
      ]
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Button
        startIcon={<ArrowLeft />}
        onClick={() => navigate(-1)}
        sx={{ mb: 3 }}
      >
        Back
      </Button>

      {/* Header */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mb: 4,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Info size={80} style={{ marginBottom: 16 }} />
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Understanding Difficulty Levels
        </Typography>
        <Typography variant="h6" sx={{ opacity: 0.9 }}>
          Learn what each difficulty level means and how the system adapts to your performance
        </Typography>
      </Paper>

      {/* Adaptive System Explanation */}
      <Card sx={{ mb: 4, borderRadius: 3 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            How Adaptive Difficulty Works
          </Typography>
          <Typography variant="body1" paragraph>
            Our adaptive learning system automatically adjusts the difficulty of questions based on your performance:
          </Typography>
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 2, color: 'success.contrastText' }}>
                <Typography variant="h6" fontWeight="bold">✓ Correct Answer</Typography>
                <Typography variant="body2">
                  Difficulty increases based on your speed and accuracy
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'error.light', borderRadius: 2, color: 'error.contrastText' }}>
                <Typography variant="h6" fontWeight="bold">✗ Wrong Answer</Typography>
                <Typography variant="body2">
                  Difficulty decreases to help you build confidence
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box sx={{ p: 2, bgcolor: 'warning.light', borderRadius: 2, color: 'warning.contrastText' }}>
                <Typography variant="h6" fontWeight="bold">⊘ Skipped</Typography>
                <Typography variant="body2">
                  No difficulty change, move to next question
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Level Cards */}
      <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
        Difficulty Levels Explained
      </Typography>
      
      <Grid container spacing={4}>
        {levels.map((level, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card
              sx={{
                height: '100%',
                borderRadius: 3,
                border: `3px solid ${level.color}`,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: theme.shadows[12]
                }
              }}
            >
              <CardContent sx={{ p: 4, textAlign: 'center' }}>
                <Box sx={{ color: level.color, mb: 2 }}>
                  {level.icon}
                </Box>
                <Chip
                  label={level.range}
                  sx={{
                    bgcolor: level.color,
                    color: 'white',
                    fontWeight: 'bold',
                    mb: 2,
                    fontSize: '1rem',
                    px: 2
                  }}
                />
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {level.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {level.description}
                </Typography>
                
                <Box sx={{ mt: 3, textAlign: 'left' }}>
                  <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                    Characteristics:
                  </Typography>
                  {level.characteristics.map((char, idx) => (
                    <Typography key={idx} variant="body2" sx={{ mb: 1, pl: 2 }}>
                      • {char}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Profile Stats Explanation */}
      <Card sx={{ mt: 4, borderRadius: 3, bgcolor: 'background.paper' }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom color="primary">
            Profile Statistics Explained
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📊 Total Sessions (Matches)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The total number of practice sessions you've completed. Each session counts as one match, whether in fixed questions or timer mode.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🏆 Highest Score
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Your best performance across all practice sessions, shown as a percentage. This represents your peak achievement.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  📈 Average Score
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The mean of all your session scores. This shows your overall performance consistency across all practice sessions.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  🎯 Average Difficulty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The average difficulty level you've reached across all sessions. Higher numbers indicate more challenging problems.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⚡ Max Difficulty
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The highest difficulty level you've achieved in any session. This shows your maximum capability.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  ⏱️ Average Speed
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The average time you take to answer each question, measured in seconds. Lower is faster!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default LevelInfo;
