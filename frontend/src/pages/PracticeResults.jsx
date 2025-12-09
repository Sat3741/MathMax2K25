import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Stack,
  LinearProgress,
  useTheme,
  Paper,
  Divider,
  CircularProgress,
} from "@mui/material";

import { 
  Trophy, 
  BarChart2, 
  SkipForward, 
  Timer, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target,
  Activity,
  RotateCcw,
  ArrowLeft
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid 
} from 'recharts';
import axios from "axios";
import { getAuthToken } from "../utils/authUtils";

const PracticeResults = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [sessionData, setSessionData] = useState(null);
  const [previousSessions, setPreviousSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get session data from location state
    let data = location.state?.sessionData;
    console.log("Received session data from location.state:", data);

    // Fallback: try lastSessionData in localStorage (survives refresh)
    if (!data) {
      try {
        const stored = localStorage.getItem("lastSessionData");
        if (stored) {
          data = JSON.parse(stored);
          console.log("Recovered session data from localStorage", data);
        }
      } catch (e) {
        console.warn("Failed to parse lastSessionData from localStorage", e);
      }
    }

    if (data) {
      setSessionData(data);
      setLoading(false);
      fetchPreviousSessions(data);
    } else {
      console.warn("No session data found, redirecting to practice");
      navigate("/practice");
    }
  }, [location, navigate]);

  const fetchPreviousSessions = async (currentData) => {
    try {
      const token = getAuthToken();
      if (!token) {
        console.warn("No auth token available");
        setPreviousSessions([]);
        return;
      }

      const response = await axios.get(
        "http://localhost:8000/api/student/practice/sessions/",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Handle both list and paginated responses
      const sessions = Array.isArray(response.data)
        ? response.data
        : response.data.results || [];

      // Get last 5 sessions (excluding current if it exists)
      const filtered = sessions
        .filter(
          (s) =>
            String(s.id) !==
            String(currentData?.sessionId || currentData?.id || "")
        )
        .slice(0, 5)
        .map((s) => ({
          ...s,
          accuracy: s.accuracy || s.score || 0,
          avgTime: s.avgTime || s.avg_time_per_question || 0,
        }));
      setPreviousSessions(filtered);
    } catch (err) {
      console.error("Failed to fetch previous sessions:", err);
      if (err.response) {
        console.error("Response status:", err.response.status);
        console.error("Response data:", err.response.data);
      }
      setPreviousSessions([]);
    }
  };

  if (loading || !sessionData) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
      </Container>
    );
  }

  const {
    score = 0,
    wrongAnswers = 0,
    skippedQuestions = 0,
    totalQuestions = 0,
    accuracy = 0,
    avgTime = 0,
    avgDifficulty = 0,
    finalDifficulty = 0,
    initialDifficulty = 0,
    timeHistory = [],
    difficultyHistory = [],
    practiceMode = "fixed",
    timerDuration = 0,
    correctAnswers = 0,
  } = sessionData || {};

  // Normalize accuracy: backend may return 0-1 or 0-100 scale
  let accuracyValue = Number(accuracy ?? score ?? 0) || 0;
  if (accuracyValue > 0 && accuracyValue <= 1)
    accuracyValue = accuracyValue * 100;

  // Calculate improvements with proper normalization
  const previousSession = previousSessions[0];
  
  // Normalize previous session accuracy (handle 0-1 or 0-100 scale)
  let prevAccuracy = 0;
  if (previousSession) {
    prevAccuracy = Number(previousSession.accuracy || previousSession.score || 0);
    if (prevAccuracy > 0 && prevAccuracy <= 1) {
      prevAccuracy = prevAccuracy * 100;
    }
  }
  
  const scoreImprovement = previousSession ? accuracyValue - prevAccuracy : 0;
  const accuracyImprovement = scoreImprovement; // Same as score improvement
  const speedImprovement = previousSession
    ? (previousSession.avgTime || previousSession.avg_time_per_question || 0) - avgTime
    : 0;

  // Performance analysis
  const getPerformanceLevel = (acc) => {
    if (acc >= 90)
      return { level: "Excellent", color: "success.main", icon: "🌟" };
    if (acc >= 75) return { level: "Good", color: "info.main", icon: "👍" };
    if (acc >= 60) return { level: "Fair", color: "warning.main", icon: "📊" };
    return { level: "Needs Improvement", color: "error.main", icon: "📈" };
  };

  const performance = getPerformanceLevel(accuracyValue);

  // Areas to improve with more specific feedback
  const getImprovements = () => {
    const improvements = [];
    
    // Accuracy-based suggestions
    if (accuracyValue < 50) {
      improvements.push({
        icon: "📚",
        text: "Review fundamentals - accuracy below 50% indicates need for concept review",
        priority: "high"
      });
    } else if (accuracyValue < 70) {
      improvements.push({
        icon: "📖",
        text: "Practice more problems - aim for 70%+ accuracy before increasing difficulty",
        priority: "medium"
      });
    } else if (accuracyValue < 85) {
      improvements.push({
        icon: "🎯",
        text: "You're doing well! Focus on consistency to reach 85%+ accuracy",
        priority: "low"
      });
    }
    
    // Speed-based suggestions
    if (avgTime > 15) {
      improvements.push({
        icon: "⏱️",
        text: `Average time is ${avgTime.toFixed(1)}s - practice mental math to improve speed`,
        priority: "medium"
      });
    } else if (avgTime > 8 && accuracyValue > 80) {
      improvements.push({
        icon: "⚡",
        text: "Good accuracy! Now work on speed - aim for under 8 seconds per question",
        priority: "low"
      });
    }
    
    // Difficulty progression suggestions
    if (difficultyHistory.length > 0) {
      const finalDiff = difficultyHistory[difficultyHistory.length - 1];
      const initialDiff = difficultyHistory[0];
      const diffChange = finalDiff - initialDiff;
      
      if (diffChange < 0.3 && accuracyValue > 80) {
        improvements.push({
          icon: "🚀",
          text: "Ready for harder challenges! Try increasing starting difficulty",
          priority: "low"
        });
      }
    }
    
    // Skipped questions feedback
    if (skippedQuestions > totalQuestions * 0.2) {
      improvements.push({
        icon: "⏭️",
        text: `You skipped ${skippedQuestions} questions - try to attempt all problems`,
        priority: "medium"
      });
    }
    
    // Excellent performance
    if (accuracyValue >= 90 && avgTime < 8 && improvements.length === 0) {
      improvements.push({
        icon: "🌟",
        text: "Outstanding performance! You're mastering this topic",
        priority: "success"
      });
    }
    
    // Default encouragement
    if (improvements.length === 0) {
      improvements.push({
        icon: "👍",
        text: "Great job! Keep practicing to maintain your performance",
        priority: "success"
      });
    }
    
    return improvements;
  };

  const improvements = getImprovements();

  // Topic performance breakdown with better labels
  const topicLabelMap = {
    'addition': 'Addition',
    'subtraction': 'Subtraction',
    'multiplication': 'Multiplication',
    'division': 'Division',
    'custom': 'Custom'
  };
  
  const topicPerformance =
    sessionData.topics?.map((topicSlug) => {
      // Filter history for this topic
      const history = (sessionData.topicHistory || []).filter(h => h.topic === topicSlug && h.correct !== null);
      const total = history.length;
      const correct = history.filter(h => h.correct === true).length;
      
      // Get display label
      const topicLabel = topicLabelMap[topicSlug] || topicSlug.charAt(0).toUpperCase() + topicSlug.slice(1);

      return {
        topic: topicLabel,
        correct: correct,
        total: total,
        wrong: total - correct,
        accuracy: total > 0 ? Math.round((correct / total) * 100) : 0
      };
    }).filter(t => t.total > 0) || [];

  const pieData = [
    { name: 'Correct', value: score, color: theme.palette.success.main },
    { name: 'Wrong', value: wrongAnswers, color: theme.palette.error.main },
    { name: 'Skipped', value: skippedQuestions, color: theme.palette.warning.main },
  ].filter(d => d.value > 0);

  const CustomTooltip = ({ active, payload, label }) => {
      if (active && payload && payload.length) {
      return (
          <Box sx={{ bgcolor: 'background.paper', p: 1.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="body2" fontWeight="bold">{label || payload[0].name}</Typography>
            <Typography variant="body2" color="text.secondary">
                {payload[0].value} {payload[0].dataKey === 'accuracy' ? '%' : 'Questions'}
            </Typography>
          </Box>
      );
      }
      return null;
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        startIcon={<ArrowLeft />}
        onClick={() => navigate("/practice")}
        sx={{ mb: 3 }}
      >
        Back to Practice
      </Button>

      {/* Header */}
      <Card
        sx={{
          mb: 4,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: "white",
        }}
      >
        <CardContent sx={{ textAlign: "center", py: 4 }}>
          <Trophy size={80} style={{ marginBottom: 16, color: "gold" }} />
          <Typography variant="h3" fontWeight="bold" gutterBottom>
            Session Complete!
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            {practiceMode === "timer"
              ? "Timer Challenge Finished"
              : "All Questions Completed"}
          </Typography>
        </CardContent>
      </Card>

      {/* Main Stats - Even Wider Cards */}
      <Grid container spacing={4} sx={{ mb: 4, justifyContent: "center" }}>
        <Grid item xs={12} sm={6} md={2.5}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: "white",
              boxShadow: theme.shadows[8],
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5, textAlign: "center", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <BarChart2 size={64} style={{ marginBottom: 20, opacity: 0.9 }} />
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1.2 }}
              >
                {totalQuestions}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 600, opacity: 0.95 }}>
                Total Questions
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: "white",
              boxShadow: theme.shadows[8],
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5, textAlign: "center", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Trophy size={64} style={{ marginBottom: 20, opacity: 0.9 }} />
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1.2 }}
              >
                {Math.round(accuracyValue)}%
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 600, opacity: 0.95 }}>
                Score
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
              color: "white",
              boxShadow: theme.shadows[8],
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5, textAlign: "center", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <SkipForward size={64} style={{ marginBottom: 20, opacity: 0.9 }} />
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1.2 }}
              >
                {skippedQuestions}
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 600, opacity: 0.95 }}>
                Skipped
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.5}>
          <Card
            sx={{
              height: "100%",
              background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
              color: "white",
              boxShadow: theme.shadows[8],
              borderRadius: 4,
            }}
          >
            <CardContent sx={{ p: 5, textAlign: "center", minHeight: 240, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
              <Timer size={64} style={{ marginBottom: 20, opacity: 0.9 }} />
              <Typography
                variant="h2"
                fontWeight="bold"
                sx={{ fontSize: { xs: "3rem", md: "4rem" }, lineHeight: 1.2 }}
              >
                {avgTime.toFixed(1)}s
              </Typography>
              <Typography variant="h5" sx={{ mt: 1.5, fontWeight: 600, opacity: 0.95 }}>
                Avg Time
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Performance Analysis */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <Activity /> Performance Analysis
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Performance Level
                  </Typography>
                  <Typography
                    variant="h4"
                    fontWeight="bold"
                    color={performance.color}
                  >
                    {performance.icon} {performance.level}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Average Time per Question
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {avgTime}s
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Difficulty Progression
                  </Typography>
                  <Typography variant="h5" fontWeight="bold">
                    {initialDifficulty.toFixed(1)} →{" "}
                    {finalDifficulty.toFixed(1)}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography
                variant="h5"
                fontWeight="bold"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <TrendingUp /> Comparison with Previous
              </Typography>
              <Divider sx={{ my: 2 }} />
              {previousSession ? (
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Score Change
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {scoreImprovement >= 0 ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={
                          scoreImprovement >= 0 ? "success.main" : "error.main"
                        }
                      >
                        {scoreImprovement >= 0 ? "+" : ""}
                        {scoreImprovement.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Accuracy Change
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {accuracyImprovement >= 0 ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={
                          accuracyImprovement >= 0
                            ? "success.main"
                            : "error.main"
                        }
                      >
                        {accuracyImprovement >= 0 ? "+" : ""}
                        {accuracyImprovement.toFixed(1)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Speed Change
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {speedImprovement >= 0 ? (
                        <TrendingUp color="success" />
                      ) : (
                        <TrendingDown color="error" />
                      )}
                      <Typography
                        variant="h5"
                        fontWeight="bold"
                        color={
                          speedImprovement >= 0 ? "success.main" : "error.main"
                        }
                      >
                        {speedImprovement >= 0 ? "+" : ""}
                        {speedImprovement.toFixed(1)}s faster
                      </Typography>
                    </Box>
                  </Box>
                </Stack>
              ) : (
                <Typography color="text.secondary">
                  No previous sessions to compare
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
                <CardContent>
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography component="span"><Activity /></Typography> Session Overview
                    </Typography>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    </Box>
                </CardContent>
            </Card>
        </Grid>
        
        <Grid item xs={12} md={7}>
             <Card sx={{ height: '100%' }}>
                <CardContent>
                   <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <Target /> Topic Breakdown
                   </Typography>
                   <Divider sx={{ my: 2 }} />
                   
                   {topicPerformance.length > 0 ? (
                       <Box sx={{ height: 300, width: '100%' }}>
                        <ResponsiveContainer>
                            <BarChart data={topicPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={theme.palette.divider} />
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis 
                                    dataKey="topic" 
                                    type="category" 
                                    width={100} 
                                    tick={{ fill: theme.palette.text.primary, fontSize: 12, fontFamily: 'Fredoka' }} 
                                />
                                <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                                <Bar dataKey="accuracy" name="Accuracy" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topicPerformance.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.accuracy > 70 ? theme.palette.success.main : theme.palette.warning.main} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                       </Box>
                   ) : (
                       <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography color="text.secondary">No topic data available.</Typography>
                       </Box>
                   )}
                </CardContent>
             </Card>
        </Grid>
      </Grid>

      {/* Areas to Improve */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography
            variant="h5"
            fontWeight="bold"
            gutterBottom
            sx={{ display: "flex", alignItems: "center", gap: 1 }}
          >
            <Zap /> Areas to Improve
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack spacing={1.5}>
            {improvements.map((improvement, index) => (
              <Box
                key={index}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  bgcolor:
                    improvement.priority === 'high'
                      ? theme.palette.mode === "dark"
                        ? "rgba(244, 67, 54, 0.1)"
                        : "rgba(244, 67, 54, 0.05)"
                      : improvement.priority === 'medium'
                      ? theme.palette.mode === "dark"
                        ? "rgba(255, 152, 0, 0.1)"
                        : "rgba(255, 152, 0, 0.05)"
                      : improvement.priority === 'success'
                      ? theme.palette.mode === "dark"
                        ? "rgba(76, 175, 80, 0.1)"
                        : "rgba(76, 175, 80, 0.05)"
                      : theme.palette.mode === "dark"
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(0,0,0,0.02)",
                  borderLeft: `4px solid ${
                    improvement.priority === 'high'
                      ? theme.palette.error.main
                      : improvement.priority === 'medium'
                      ? theme.palette.warning.main
                      : improvement.priority === 'success'
                      ? theme.palette.success.main
                      : theme.palette.info.main
                  }`,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                  <Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>
                    {improvement.icon}
                  </Typography>
                  <Typography sx={{ flex: 1, pt: 0.25 }}>
                    {improvement.text}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <Box sx={{ display: "flex", justifyContent: "center", gap: 2 }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<RotateCcw />}
          onClick={() => navigate("/practice")}
          sx={{ px: 4, py: 1.5 }}
        >
          Practice Again
        </Button>
        <Button
          variant="outlined"
          size="large"
          onClick={() => navigate("/dashboard")}
          sx={{ px: 4, py: 1.5 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default PracticeResults;
