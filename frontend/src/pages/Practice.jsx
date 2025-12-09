import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Slider,
  Stack,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
  useTheme,
  IconButton,
  CircularProgress,
  Fade,
  Chip,
  Grid,
  Tooltip,
} from "@mui/material";
import {
  CheckCircle,
  Timer,
  Settings,
  RotateCcw,
  Trophy,
  Play,
  AlertTriangle,
  Gauge,
  TrendingUp,
  TrendingDown,
  Clock,
  Square,
  ArrowRight,
  XCircle,
  BarChart2,
  Mic,
  MicOff,
} from "lucide-react";
import useSpeechRecognition, { parseSpokenNumber } from "../hooks/useSpeechRecognition";

const TOPICS = [
  { value: "addition", label: "Addition", icon: "+" },
  { value: "subtraction", label: "Subtraction", icon: "-" },
  { value: "multiplication", label: "Multiplication", icon: "×" },
  { value: "division", label: "Division", icon: "÷" },
];

const Practice = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [phase, setPhase] = useState("setup");

  // Setup State
  const [selectedTopics, setSelectedTopics] = useState(["addition"]);
  const [difficulty, setDifficulty] = useState(1.0);
  const [questionCount, setQuestionCount] = useState(10);
  const [practiceMode, setPracticeMode] = useState("fixed"); // 'fixed' or 'timer'
  const [timerDuration, setTimerDuration] = useState(60); // in seconds

  // Adaptive & Session State
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [wrongAnswers, setWrongAnswers] = useState(0);
  const [skippedQuestions, setSkippedQuestions] = useState(0);
  const [problem, setProblem] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [answerFeedback, setAnswerFeedback] = useState(null); // 'correct' | 'wrong' | null

  // Custom Mode State
  // Custom Mode State
  const [practiceType, setPracticeType] = useState('custom'); // 'custom' | 'adaptive'
  // Box 1: Digits for first number
  const [digitCount1, setDigitCount1] = useState(1);
  // Box 3: Digits for second number
  const [digitCount2, setDigitCount2] = useState(1);
  
  const [customOperator, setCustomOperator] = useState('addition');
  const [allowNegative, setAllowNegative] = useState(false); // For subtraction
  const [allowDecimal, setAllowDecimal] = useState(false); // For division


  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const timerIntervalRef = useRef(null);

  // Animation State
  const [flipKey, setFlipKey] = useState(0);
  const [isFlipping, setIsFlipping] = useState(false);

  // Metrics
  const [questionStartTime, setQuestionStartTime] = useState(0);
  const [timeHistory, setTimeHistory] = useState([]);
  const [difficultyHistory, setDifficultyHistory] = useState([]);
  const [sessionDifficulty, setSessionDifficulty] = useState(1.0);
  const [recentPerformance, setRecentPerformance] = useState([]); // For enhanced ML
  const [currentTopic, setCurrentTopic] = useState(null);
  const [topicHistory, setTopicHistory] = useState([]);

  // Voice Recognition
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

  const inputRef = useRef(null);

  // Helper to get token
  const getAuthToken = () => {
    return (
      localStorage.getItem("accessToken") ||
      sessionStorage.getItem("accessToken")
    );
  };

  // Focus input on new problem
  useEffect(() => {
    if (phase === "playing" && problem && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [problem, phase]);

  // Handle voice recognition transcript
  useEffect(() => {
    if (transcript && phase === 'playing' && problem) {
      const parsed = parseSpokenNumber(transcript);
      if (parsed !== null) {
        const parsedStr = parsed.toString();
        setUserAnswer(parsedStr);
        resetTranscript();
        
        // Check if answer is correct and auto-advance
        const isCorrect = Math.abs(parsed - problem.answer) < 0.001;
        if (isCorrect) {
          // Immediate advancement for voice
          handleAnswer(true);
        }
      }
    }
  }, [transcript, phase, problem, resetTranscript]);

  // Timer countdown effect
  useEffect(() => {
    if (timerActive && timeRemaining > 0 && phase === "playing") {
      timerIntervalRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [timerActive, timeRemaining, phase]);

  // Separate effect to end game when timer reaches zero
  useEffect(() => {
    if (phase === "playing" && practiceMode === "timer" && timeRemaining === 0 && !timerActive) {
      // Small delay to ensure state is updated
      setTimeout(() => endGame(), 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRemaining, timerActive, phase, practiceMode]);

  // Effect to end game when question count is reached in fixed mode
  useEffect(() => {
    if (
      phase === "playing" &&
      practiceMode === "fixed" &&
      timeHistory.length > 0 &&
      timeHistory.length >= questionCount
    ) {
      console.log("Question count reached via useEffect, ending game");
      console.log("timeHistory.length:", timeHistory.length);
      console.log("questionCount:", questionCount);
      endGame();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeHistory.length, phase, practiceMode, questionCount]);

  const startGame = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setWrongAnswers(0);
    setSkippedQuestions(0);
    setProblem(null);
    setError(false);
    setLoading(true);
    setTimeHistory([]);
    setDifficultyHistory([]);
    setRecentPerformance([]);
    setTopicHistory([]);
    setSessionDifficulty(difficulty);
    setFlipKey(0);

    if (practiceMode === "timer") {
      setTimeRemaining(timerDuration);
      setTimerActive(true);
    }

    setPhase("playing");
    setTimeout(() => fetchProblem(true), 0);
  };

  const generateCustomProblem = () => {
    let num1, num2, answer, symbol;
    
    // Helper helpers
    const getMin = (d) => Math.pow(10, d - 1);
    const getMax = (d) => Math.pow(10, d) - 1;
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    const min1 = getMin(digitCount1);
    const max1 = getMax(digitCount1);
    const min2 = getMin(digitCount2);
    const max2 = getMax(digitCount2);

    switch (customOperator) {
      case 'addition':
        num1 = getRandomInt(min1, max1);
        num2 = getRandomInt(min2, max2);
        answer = num1 + num2;
        symbol = '+';
        break;
      case 'subtraction':
        num1 = getRandomInt(min1, max1);
        num2 = getRandomInt(min2, max2);
        if (!allowNegative && num2 > num1) {
             // If negative not allowed and num2 > num1, we have a problem.
             // We can satisfy digit counts strictly OR satisfy non-negative.
             // If we swap, we might break digit count rules (e.g. 2-digit minus 3-digit).
             // If D1 != D2, swapping breaks D1/D2 assignment.
             // Strategy: Regenerate num2 until <= num1, OR if impossible (min2 > max1), swap and accept digit count mismatch?
             // User preference usually implies "Big number - Small number".
             // Let's swap if needed but strictly speaking it swaps the digit counts too.
             // Simple approach: JUST SWAP. User cares about difficulty roughly.
             [num1, num2] = [num2, num1];
        }
        answer = num1 - num2;
        symbol = '-';
        break;
      case 'multiplication':
        num1 = getRandomInt(min1, max1);
        num2 = getRandomInt(min2, max2);
        answer = num1 * num2;
        symbol = '×';
        break;
      case 'division':
        if (allowDecimal) {
            num1 = getRandomInt(min1, max1);
            num2 = getRandomInt(min2, max2);
            // Avoid division by zero (min is at least 1, so safe usually)
            if (num2 === 0) num2 = 1;
            answer = parseFloat((num1 / num2).toFixed(2));
        } else {
            // Strict integer division with digit constraints is hard to guarantee 100% of time randomly.
            // Approach: Generate Divisor (num2) using D2.
            // Generate Quotient such that Divisor * Quotient has D1 digits.
            // This ensures Num1 (Dividend) has D1 digits and Num2 (Divisor) has D2 digits.
            
            num2 = getRandomInt(min2, max2);
            if (num2 === 0) num2 = 1;

            // We need Product P s.t. min1 <= P <= max1
            // P = num2 * Quotient
            // So min1/num2 <= Quotient <= max1/num2
            const qMin = Math.ceil(min1 / num2);
            const qMax = Math.floor(max1 / num2);

            if (qMin > qMax) {
                // Impossible to fit strict digit counts (e.g. 2 digit / 3 digit = integer)
                // Fallback: Just generate num1 and num2 and do floor division? 
                // Or generate num2(D2) and random simple quotient?
                // Left fallback: num1 with D1, num2 with D2.
                // Just construct a valid problem ignoring strict D1 for dividend if necessary?
                // Let's try to honor D1 for Dividend if possible.
                // If impossible, we relax D1.
                const quotient = getRandomInt(1, 12);
                num1 = num2 * quotient;
            } else {
                const quotient = getRandomInt(qMin, qMax);
                num1 = num2 * quotient;
            }
            answer = num1 / num2;
        }
        symbol = '÷';
        break;
      default:
         num1=1; num2=1; answer=2; symbol='+';
    }

    return {
        id: Date.now(),
        question: `${num1} ${symbol} ${num2}`,
        answer: answer,
        difficulty: 1.0, 
        topic: customOperator
    };
  };

  const endGame = async () => {
    setTimerActive(false);
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }

    // Calculate Metrics
    const totalTime = timeHistory.reduce((a, b) => a + b, 0);
    const avgTime = timeHistory.length > 0 ? totalTime / timeHistory.length : 0;
    
    // Use timeHistory.length as it's the most reliable count of answered questions
    // (updated before this function is called)
    const totalQuestions = timeHistory.length;

    // Calculate score percentage
    const scorePercentage =
      totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;

    // Prepare detailed session data
    const avgDifficulty =
      difficultyHistory.length > 0
        ? difficultyHistory.reduce((a, b) => a + b, 0) /
          difficultyHistory.length
        : difficulty;

    const sessionData = {
      score: scorePercentage,
      wrongAnswers: wrongAnswers,
      skippedQuestions: skippedQuestions,
      totalQuestions: totalQuestions,
      accuracy: scorePercentage,
      avgTime: parseFloat(avgTime.toFixed(2)),
      avgDifficulty: parseFloat(avgDifficulty.toFixed(2)),
      finalDifficulty: parseFloat(sessionDifficulty.toFixed(2)),
      initialDifficulty: parseFloat(difficulty.toFixed(2)),
      timeHistory: timeHistory,
      difficultyHistory: difficultyHistory,
      practiceMode: practiceMode,
      timerDuration: timerDuration,
      topics: selectedTopics,
      correctAnswers: score,
      topicHistory: topicHistory,
      practiceType: practiceType,
      customConfig: practiceType === 'custom' ? {
        digits1: digitCount1,
        digits2: digitCount2,
        operator: customOperator,
        allowNegative,
        allowDecimal
      } : null
    };

    console.log("Session Data being passed:", sessionData);

    // Save Session Data
    try {
      const token = getAuthToken();
      if (token) {
        const resp = await axios.post(
          "http://localhost:8000/api/student/practice/",
          {
            score: scorePercentage,
            total_questions: totalQuestions,
            topic_names: selectedTopics,
            difficulty: difficulty,
            final_difficulty: sessionDifficulty,
            avg_time_per_question: avgTime,
            difficulty_progression: difficultyHistory,
            time_per_question: timeHistory,
            accuracy_per_question: Array(totalQuestions)
              .fill(false)
              .map((_, i) => i < score),
            practice_mode: practiceMode,
            timer_duration: practiceMode === "timer" ? timerDuration : null,
            skipped_questions: skippedQuestions,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // If the API returned the created session, attach its id so
        // the results page can exclude the current session from "previous sessions".
        const created = resp?.data;
        if (created && created.id) {
          sessionData.sessionId = created.id;
          console.log("Saved session id:", created.id);
        }

        console.log("Session saved successfully");
      }
    } catch (err) {
      console.error("Failed to save session", err);
    }

    // Persist sessionData locally
    try {
      localStorage.setItem('lastSessionData', JSON.stringify(sessionData));
    } catch (e) {
      console.warn('Failed to persist session data to localStorage', e);
    }

    // Navigate to results page
    navigate("/practice/results", { state: { sessionData } });
  };

  const fetchProblem = async (isFirst = false) => {
    // Trigger flip animation immediately
    setIsFlipping(true);
    setFlipKey((prev) => prev + 1);
    setAnswerFeedback(null);

    // Minimize loading state - fetch immediately
    setError(false);
    setUserAnswer("");

    // Pre-fetch while showing animation
    try {
      let problemData = null;

      // Use current adaptive difficulty
      if (practiceType === 'adaptive') {
          const randomTopic =
            selectedTopics[Math.floor(Math.random() * selectedTopics.length)];
          
          setCurrentTopic(randomTopic);

          const response = await axios.get(
            "http://localhost:8000/api/math/problem/",
            {
              params: { topic: randomTopic, difficulty: sessionDifficulty },
            }
          );
          problemData = response.data;
      } else {
          // Custom Mode
          problemData = generateCustomProblem();
          setCurrentTopic(customOperator);
          // Small delay to simulate fetch
          await new Promise(r => setTimeout(r, 50));
      }

      // Set problem after short animation
      setTimeout(() => {
        setIsFlipping(false);
        setProblem(problemData);
        setQuestionStartTime(Date.now());
        setDifficultyHistory((prev) => [...prev, sessionDifficulty]);
        setCurrentQuestionIndex((prev) => prev + 1);
      }, 150); // Faster transition
    } catch (error) {
      console.error("Error fetching problem:", error);
      setIsFlipping(false);
      setError(true);
    }
  };
  const handleInput = (e) => {
    const val = e.target.value;
    if (!/^-?\d*\.?\d*$/.test(val)) return;
    setUserAnswer(val);

    // Auto-check answer when user types (for correct answers, auto-advance)
    if (problem && val && val.trim() !== "") {
      const numVal = parseFloat(val);
      const isCorrect = Math.abs(numVal - problem.answer) < 0.001;
      if (isCorrect) {
        // Auto-advance on correct answer
        handleAnswer(true);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && problem && userAnswer) {
      const numVal = parseFloat(userAnswer);
      const isCorrect = Math.abs(numVal - problem.answer) < 0.001;
      handleAnswer(isCorrect);
    } else if (e.key === " " && problem) {
      // Spacebar to skip question
      e.preventDefault(); // Prevent scrolling
      handleSkip();
    }
  };

  const handleSkip = () => {
    // Record skip in topic history
    setTopicHistory(prev => [...prev, { topic: currentTopic, correct: null, skipped: true }]);
    
    // Increment skipped counter
    setSkippedQuestions(prev => prev + 1);
    
    // Add placeholder time (0 seconds for skipped questions)
    setTimeHistory((prev) => [...prev, 0]);
    
    // Fetch next problem
    fetchProblem();
  };

  const handleAnswer = (isCorrect) => {
    const endTime = Date.now();
    const timeTaken = (endTime - questionStartTime) / 1000;
    setTimeHistory((prev) => [...prev, timeTaken]);

    // Show visual feedback
    setAnswerFeedback(isCorrect ? "correct" : "wrong");

    // Update performance tracking
    const performance = {
      correct: isCorrect,
      timeTaken: timeTaken,
      difficulty: sessionDifficulty,
      topic: currentTopic,
      timestamp: Date.now(),
    };
    
    setTopicHistory(prev => [...prev, { topic: currentTopic, correct: isCorrect }]);

    setRecentPerformance((prev) => {
      const updated = [...prev, performance];
      // Keep only last 10 for ML analysis
      return updated.slice(-10);
    });

    if (isCorrect) {
      setScore((prev) => prev + 1);
    } else {
      setWrongAnswers((prev) => prev + 1);
    }

    // Enhanced Adaptive Learning Algorithm
    const totalAnswered = score + wrongAnswers + (isCorrect ? 1 : 0);
    const currentAccuracy =
      totalAnswered > 0 ? (score + (isCorrect ? 1 : 0)) / totalAnswered : 0;

    // Calculate moving average of recent performance
    const recentAccuracy =
      recentPerformance.length > 0
        ? recentPerformance.filter((p) => p.correct).length /
          recentPerformance.length
        : currentAccuracy;
    const avgRecentTime =
      recentPerformance.length > 0
        ? recentPerformance.reduce((sum, p) => sum + p.timeTaken, 0) /
          recentPerformance.length
        : timeTaken;

    let diffChange = 0;

    if (isCorrect) {
      // Multi-factor difficulty increase
      const speedFactor =
        timeTaken < 2 ? 1.5 : timeTaken < 4 ? 1.2 : timeTaken < 6 ? 1.0 : 0.8;
      const accuracyFactor =
        currentAccuracy > 0.9
          ? 1.3
          : currentAccuracy > 0.8
          ? 1.1
          : currentAccuracy > 0.7
          ? 1.0
          : 0.9;
      const consistencyFactor =
        recentAccuracy > 0.85 ? 1.2 : recentAccuracy > 0.75 ? 1.0 : 0.9;

      // Base increase with factors
      const baseIncrease = 0.3;
      diffChange =
        baseIncrease * speedFactor * accuracyFactor * consistencyFactor;

      // Bonus for very fast correct answers
      if (timeTaken < 2 && currentAccuracy > 0.85) {
        diffChange += 0.2;
      }

      setSessionDifficulty((prev) =>
        Math.min(5.0, parseFloat((prev + diffChange).toFixed(1)))
      );
    } else {
      // Smart difficulty decrease based on struggle patterns
      const struggleFactor =
        currentAccuracy < 0.4 ? 1.5 : currentAccuracy < 0.5 ? 1.2 : 1.0;
      const timeFactor = timeTaken > 15 ? 1.2 : timeTaken > 10 ? 1.0 : 0.8;
      const recentStruggle =
        recentPerformance.length >= 3
          ? recentPerformance.slice(-3).filter((p) => !p.correct).length / 3
          : 0;
      const struggleBonus = recentStruggle > 0.6 ? 0.3 : 0;

      const baseDecrease = 0.4;
      const decrease =
        (baseDecrease + struggleBonus) * struggleFactor * timeFactor;

      setSessionDifficulty((prev) =>
        Math.max(1.0, parseFloat((prev - decrease).toFixed(1)))
      );
    }

    // If correct, move to next question immediately
    // If wrong, show feedback and wait for user to press Enter or continue
    if (isCorrect) {
      setAnswerFeedback(null);
      fetchProblem();
    } else {
      // For wrong answers, wait a bit then allow user to continue
      setTimeout(() => {
        setAnswerFeedback(null);
        fetchProblem();
      }, 1500);
    }
  };

  // --- RENDERERS ---

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const renderSetup = () => (
    <Card
      sx={{
        maxWidth: 700,
        mx: "auto",
        p: 3,
        borderRadius: 4,
        boxShadow: theme.shadows[8],
        background: `linear-gradient(135deg, ${
          theme.palette.background.paper
        } 0%, ${
          theme.palette.mode === "dark"
            ? "rgba(25, 25, 35, 0.8)"
            : "rgba(245, 245, 255, 0.8)"
        } 100%)`,
      }}
    >
      <CardContent>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Settings size={50} color={theme.palette.primary.main} style={{ marginBottom: 16 }} />
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Practice Setup
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Choose your mode and customize your session
          </Typography>
        </Box>

          <Stack spacing={4}>
            {/* 1. Learning Mode Selector */}
            <Box>
                <Typography gutterBottom variant="h6" fontWeight="bold">Learning Mode</Typography>
                <ToggleButtonGroup
                    value={practiceType}
                    exclusive
                    onChange={(e, val) => { if(val) setPracticeType(val); }}
                    fullWidth
                    sx={{ mb: 2 }}
                >
                    <ToggleButton value="custom" color="primary" sx={{ py: 2 }}>
                        <Typography fontWeight="bold">Custom Practice</Typography>
                    </ToggleButton>
                    <ToggleButton value="adaptive" color="secondary" sx={{ py: 2 }}>
                         <Typography fontWeight="bold">Adaptive Learning</Typography>
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>
            
            {/* 2. CUSTOM MODE SETTINGS - 3 BOX LAYOUT */}
            {practiceType === 'custom' && (
                <Stack spacing={3} sx={{ p: 3, bgcolor: 'background.default', borderRadius: 2 }}>
                    
                    <Typography gutterBottom fontWeight="bold" variant="h6">Configure Problem</Typography>
                    
                    <Grid container spacing={4} justifyContent="center" alignItems="center">
                        {/* BOX 1: Digits for Operand 1 */}
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">FIRST NUMBER</Typography>
                                <Typography variant="h4" color="primary.main" sx={{ my: 1 }}>{digitCount1}</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>Digits</Typography>
                                <Slider
                                    value={digitCount1}
                                    onChange={(e, v) => setDigitCount1(v)}
                                    min={1}
                                    max={4}
                                    step={1}
                                    size="small"
                                />
                            </Card>
                        </Grid>

                        {/* BOX 2: Operator Selection */}
                        <Grid item xs={12} md={4}>
                            <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 1, display: 'block' }}>OPERATION</Typography>
                                <ToggleButtonGroup
                                    value={customOperator}
                                    exclusive
                                    onChange={(e, val) => { if(val) setCustomOperator(val); }}
                                    size="large"
                                    orientation="vertical"
                                    sx={{ width: '100%' }}
                                >
                                    <ToggleButton value="addition" sx={{ py: 1 }}>
                                        <Typography variant="h6" sx={{ mr: 1 }}>+</Typography> Add
                                    </ToggleButton>
                                    <ToggleButton value="subtraction" sx={{ py: 1 }}>
                                        <Typography variant="h6" sx={{ mr: 1 }}>-</Typography> Subtract
                                    </ToggleButton>
                                    <ToggleButton value="multiplication" sx={{ py: 1 }}>
                                        <Typography variant="h6" sx={{ mr: 1 }}>×</Typography> Multiply
                                    </ToggleButton>
                                    <ToggleButton value="division" sx={{ py: 1 }}>
                                        <Typography variant="h6" sx={{ mr: 1 }}>÷</Typography> Divide
                                    </ToggleButton>
                                </ToggleButtonGroup>
                            </Card>
                        </Grid>

                        {/* BOX 3: Digits for Operand 2 */}
                        <Grid item xs={12} md={4}>
                             <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                                <Typography variant="caption" fontWeight="bold" color="text.secondary">SECOND NUMBER</Typography>
                                <Typography variant="h4" color="primary.main" sx={{ my: 1 }}>{digitCount2}</Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>Digits</Typography>
                                <Slider
                                    value={digitCount2}
                                    onChange={(e, v) => setDigitCount2(v)}
                                    min={1}
                                    max={4}
                                    step={1}
                                    size="small"
                                />
                            </Card>
                        </Grid>
                    </Grid>

                    {/* Conditional Options */}
                    {customOperator === 'subtraction' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                             <Typography>Allow Negative Answers</Typography>
                             <ToggleButtonGroup
                                value={allowNegative}
                                exclusive
                                onChange={(e, val) => setAllowNegative(val)}
                                size="small"
                             >
                                <ToggleButton value={false}>No</ToggleButton>
                                <ToggleButton value={true}>Yes</ToggleButton>
                             </ToggleButtonGroup>
                        </Box>
                    )}

                    {customOperator === 'division' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1 }}>
                             <Typography>Allow Decimals</Typography>
                             <ToggleButtonGroup
                                value={allowDecimal}
                                exclusive
                                onChange={(e, val) => setAllowDecimal(val)}
                                size="small"
                             >
                                <ToggleButton value={false}>No</ToggleButton>
                                <ToggleButton value={true}>Yes</ToggleButton>
                             </ToggleButtonGroup>
                        </Box>
                    )}
                </Stack>
            )}

            {/* 3. ADAPTIVE MODE SETTINGS (Original UI) */}
            {practiceType === 'adaptive' && (
              <Box>
                <Typography gutterBottom fontWeight="bold">
                  Select Topics
                </Typography>
                <ToggleButtonGroup
                  value={selectedTopics}
                  onChange={(e, newTopics) => {
                    if (newTopics.length) setSelectedTopics(newTopics);
                  }}
                  aria-label="topics"
                  fullWidth
                  color="primary"
                  sx={{ flexWrap: "wrap", gap: 1 }}
                >
                  {TOPICS.map((t) => (
                    <ToggleButton
                      key={t.value}
                      value={t.value}
                      sx={{ flexGrow: 1, py: 1.5 }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', marginRight: 8, fontSize: "1.3em" }}>
                        {t.icon}
                      </span>
                      <Typography fontWeight="bold">{t.label}</Typography>
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                
                <Box sx={{ mt: 3 }}>
                    <Typography gutterBottom fontWeight="bold">
                    Starting Difficulty: {difficulty}
                    </Typography>
                    <Slider
                    value={difficulty}
                    onChange={(e, v) => setDifficulty(v)}
                    min={1.0}
                    max={5.0}
                    step={0.5}
                    marks={[
                        { value: 1.0, label: "Easy" },
                        { value: 3.0, label: "Medium" },
                        { value: 5.0, label: "Hard" },
                    ]}
                    valueLabelDisplay="auto"
                    />
                </Box>
              </Box>
            )}

          {/* Practice Mode Selection (Timer/Fixed) - AVAILABLE FOR BOTH */}
          <Box>
            <Typography gutterBottom fontWeight="bold" sx={{ mb: 2 }}>
              Session Type
            </Typography>
            <ToggleButtonGroup
              value={practiceMode}
              exclusive
              onChange={(e, newMode) => {
                if (newMode) setPracticeMode(newMode);
              }}
              sx={{ mb: 2, width: '100%' }}
            >
              <ToggleButton value="fixed" sx={{ flex: 1, py: 2 }}>
                Fixed Questions
              </ToggleButton>
              <ToggleButton value="timer" sx={{ flex: 1, py: 2 }}>
                Timer Mode
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {practiceMode === "fixed" ? (
            <Box>
              <Typography gutterBottom fontWeight="bold">
                Number of Problems: {questionCount}
              </Typography>
              <Slider
                value={questionCount}
                onChange={(e, val) => setQuestionCount(val)}
                min={5}
                max={50}
                step={5}
                marks={[
                  { value: 5, label: "5" },
                  { value: 25, label: "25" },
                  { value: 50, label: "50" },
                ]}
                valueLabelDisplay="auto"
              />
            </Box>
          ) : (
            <Box>
              <Typography gutterBottom fontWeight="bold">
                Timer Duration: {formatTime(timerDuration)}
              </Typography>
              <Slider
                value={timerDuration}
                onChange={(e, val) => setTimerDuration(val)}
                min={30}
                max={600}
                step={30}
                marks={[
                  { value: 30, label: "30s" },
                  { value: 300, label: "5m" },
                  { value: 600, label: "10m" },
                ]}
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => formatTime(val)}
              />
            </Box>
          )}

          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={startGame}
            sx={{
              py: 2.5,
              fontSize: "1.2rem",
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              boxShadow: theme.shadows[6],
              "&:hover": {
                boxShadow: theme.shadows[12],
                transform: "translateY(-2px)",
              },
              transition: "all 0.3s",
            }}
            startIcon={<Play />}
          >
            Start {practiceType === 'custom' ? 'Custom' : 'Adaptive'} Session
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );

  const renderPlaying = () => (
    <Card
      sx={{
        maxWidth: 900,
        mx: "auto",
        borderRadius: 4,
        minHeight: 500,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: theme.shadows[12],
      }}
    >
      {/* Enhanced HUD */}
      <Box
        sx={{
          p: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          color: "white",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Chip
            icon={<CheckCircle size={20} />}
            label={`Correct: ${score}`}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.2)",
              color: "white",
              fontWeight: "bold",
              fontSize: "0.95rem",
            }}
          />
          {practiceMode === "fixed" ? (
            <Chip
              label={`${currentQuestionIndex} / ${questionCount}`}
              sx={{
                bgcolor: "rgba(255, 255, 255, 0.2)",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.95rem",
              }}
            />
          ) : (
            <>
              {/* Circular Timer */}
              <Box sx={{ position: "relative", display: "inline-flex", mr: 2 }}>
                <CircularProgress
                  variant="determinate"
                  value={(timeRemaining / timerDuration) * 100}
                  size={60}
                  thickness={4}
                  sx={{
                    color: timeRemaining < 10 ? "error.main" : "white",
                    animation:
                      timeRemaining < 10 ? "pulse 1s infinite" : "none",
                    "@keyframes pulse": {
                      "0%, 100%": { opacity: 1 },
                      "50%": { opacity: 0.7 },
                    },
                  }}
                />
                <Box
                  sx={{
                    top: 0,
                    left: 0,
                    bottom: 0,
                    right: 0,
                    position: "absolute",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography
                    variant="caption"
                    component="div"
                    sx={{
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "0.75rem",
                    }}
                  >
                    {formatTime(timeRemaining)}
                  </Typography>
                </Box>
              </Box>
              <Chip
                label={`Questions: ${currentQuestionIndex}`}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.2)",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "0.95rem",
                }}
              />
            </>
          )}
          {wrongAnswers > 0 && (
            <Chip
              label={`Wrong: ${wrongAnswers}`}
              sx={{
                bgcolor: "rgba(255, 0, 0, 0.3)",
                color: "white",
                fontWeight: "bold",
                fontSize: "0.95rem",
              }}
            />
          )}
        </Box>
        <IconButton
          onClick={() => {
            if (practiceMode === "timer") {
              setTimerActive(false);
            }
            setPhase("setup");
          }}
          sx={{ color: "white" }}
        >
          <Square />
        </IconButton>
      </Box>
      <LinearProgress
        variant="determinate"
        value={
          practiceMode === "fixed"
            ? (currentQuestionIndex / questionCount) * 100
            : ((timerDuration - timeRemaining) / timerDuration) * 100
        }
        sx={{ height: 6 }}
      />

      <CardContent
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          p: 4,
          position: "relative",
          overflow: "hidden",
          minHeight: 400,
        }}
      >
        {error ? (
          <Box sx={{ textAlign: "center" }}>
            <AlertTriangle color={theme.palette.error.main} size={60} style={{ marginBottom: 16 }} />
            <Typography gutterBottom>Failed to load problem.</Typography>
            <Button
              startIcon={<RotateCcw />}
              variant="outlined"
              onClick={() => fetchProblem(currentQuestionIndex === 0)}
            >
              Retry
            </Button>
          </Box>
        ) : problem ? (
          <Box
            key={flipKey}
            sx={{
              width: "100%",
              textAlign: "center",
              animation: isFlipping
                ? "pageUp 0.4s ease-out"
                : "fadeIn 0.2s ease-in",
              "@keyframes pageUp": {
                "0%": {
                  transform: "translateY(100%)",
                  opacity: 0,
                },
                "100%": {
                  transform: "translateY(0)",
                  opacity: 1,
                },
              },
              "@keyframes fadeIn": {
                "0%": {
                  opacity: 0,
                  transform: "translateY(10px)",
                },
                "100%": {
                  opacity: 1,
                  transform: "translateY(0)",
                },
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "baseline",
                flexWrap: "wrap",
                gap: 3,
                mb: 4,
                position: "relative",
              }}
            >
              <Typography
                variant="h1"
                fontWeight="800"
                sx={{
                  fontFamily: "monospace",
                  fontSize: { xs: "3.5rem", md: "6rem" },
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  textShadow:
                    theme.palette.mode === "dark"
                      ? "0 0 20px rgba(255,255,255,0.1)"
                      : "none",
                }}
              >
                {problem.question}
              </Typography>

              <Typography
                variant="h1"
                fontWeight="800"
                sx={{
                  fontFamily: "monospace",
                  fontSize: { xs: "3.5rem", md: "6rem" },
                  color: "text.secondary",
                  opacity: 0.7,
                }}
              >
                =
              </Typography>

              <Box sx={{ position: "relative" }}>
                <input
                  ref={inputRef}
                  value={userAnswer}
                  onChange={handleInput}
                  onKeyPress={handleKeyPress}
                  placeholder="?"
                  type="tel"
                  inputMode="decimal"
                  autoFocus
                  autoComplete="off"
                  disabled={answerFeedback !== null}
                  style={{
                    fontSize: "5rem",
                    fontFamily: "monospace",
                    textAlign: "center",
                    fontWeight: "bold",
                    border: "none",
                    borderBottom: `5px solid ${
                      answerFeedback === "correct"
                        ? theme.palette.success.main
                        : answerFeedback === "wrong"
                        ? theme.palette.error.main
                        : theme.palette.primary.main
                    }`,
                    width: "180px",
                    backgroundColor: "transparent",
                    padding: "0 15px",
                    color:
                      answerFeedback === "correct"
                        ? theme.palette.success.main
                        : answerFeedback === "wrong"
                        ? theme.palette.error.main
                        : theme.palette.primary.main,
                    outline: "none",
                    height: "120px",
                    transition: "all 0.3s",
                    boxShadow:
                      answerFeedback === "correct"
                        ? `0 4px 20px ${theme.palette.success.main}40`
                        : answerFeedback === "wrong"
                        ? `0 4px 20px ${theme.palette.error.main}40`
                        : `0 4px 20px ${theme.palette.primary.main}20`,
                    opacity: answerFeedback !== null ? 0.7 : 1,
                  }}
                />
                
                {/* Voice Recognition Button */}
                <Tooltip 
                  title={!isSupported ? "Voice recognition not supported in this browser" : isListening ? "Listening... (click to stop)" : "Start voice input"}
                  arrow
                >
                  <span>
                    <IconButton
                      onClick={() => {
                        if (isListening) {
                          stopListening();
                        } else {
                          startListening();
                        }
                      }}
                      disabled={!isSupported || answerFeedback !== null}
                      sx={{
                        position: "absolute",
                        right: -60,
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: isListening ? theme.palette.success.main : theme.palette.primary.main,
                        animation: isListening ? "pulse 1.5s infinite" : "none",
                        "@keyframes pulse": {
                          "0%, 100%": { 
                            opacity: 1,
                            transform: "translateY(-50%) scale(1)",
                          },
                          "50%": { 
                            opacity: 0.7,
                            transform: "translateY(-50%) scale(1.15)",
                          },
                        },
                        "&:hover": {
                          backgroundColor: isListening 
                            ? `${theme.palette.success.main}20` 
                            : `${theme.palette.primary.main}20`,
                        },
                        "&.Mui-disabled": {
                          color: theme.palette.action.disabled,
                        },
                      }}
                    >
                      <Mic size={28} />
                    </IconButton>
                  </span>
                </Tooltip>

                {answerFeedback === "wrong" && problem && (
                  <Typography
                    variant="h6"
                    sx={{
                      position: "absolute",
                      top: "100%",
                      left: "50%",
                      transform: "translateX(-50%)",
                      mt: 1,
                      color: "error.main",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Correct: {problem.answer}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
        ) : !problem ? (
          <Box sx={{ textAlign: "center", p: 4 }}>
            <CircularProgress size={40} />
          </Box>
        ) : null}
      </CardContent>

      <Box
        sx={{
          p: 2,
          textAlign: "center",
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          color="error"
          onClick={() => {
            if (practiceMode === "timer") {
              setTimerActive(false);
            }
            setPhase("setup");
          }}
          variant="outlined"
          sx={{ borderRadius: 2 }}
        >
          End Session
        </Button>
      </Box>
    </Card>
  );

  const renderSummary = () => {
    const totalQuestions =
      practiceMode === "timer" ? currentQuestionIndex : questionCount;
    const accuracy = totalQuestions > 0 ? (score / totalQuestions) * 100 : 0;
    const avgDifficulty = difficultyHistory.length
      ? (
          difficultyHistory.reduce((a, b) => a + b, 0) /
          difficultyHistory.length
        ).toFixed(1)
      : 0;
    const improvement = sessionDifficulty - difficulty;
    const avgTime =
      timeHistory.length > 0
        ? (timeHistory.reduce((a, b) => a + b, 0) / timeHistory.length).toFixed(
            1
          )
        : 0;

    return (
      <Card
        sx={{
          maxWidth: 900,
          mx: "auto",
          textAlign: "center",
          p: 6,
          borderRadius: 4,
          boxShadow: theme.shadows[12],
          background: `linear-gradient(135deg, ${
            theme.palette.background.paper
          } 0%, ${
            theme.palette.mode === "dark"
              ? "rgba(25, 25, 35, 0.8)"
              : "rgba(245, 245, 255, 0.8)"
          } 100%)`,
        }}
      >
        <Box
          sx={{
            display: "inline-flex",
            p: 2,
            borderRadius: "50%",
            bgcolor: "primary.light",
            mb: 3,
          }}
        >
          <Trophy size={80} color="gold" />
        </Box>
        <Typography variant="h3" fontWeight="bold" gutterBottom>
          Session Complete!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {practiceMode === "timer"
            ? "Great job completing the timer challenge!"
            : "Well done on finishing all questions!"}
        </Typography>

        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                color: "white",
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", minHeight: 180 }}>
                <CheckCircle size={60} style={{ marginBottom: 16 }} />
                <Typography variant="h1" fontWeight="bold">
                  {score}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 500 }}>
                  Correct
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                color: "white",
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", minHeight: 180 }}>
                <XCircle size={60} style={{ marginBottom: 16 }} />
                <Typography variant="h1" fontWeight="bold">
                  {wrongAnswers}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 500 }}>
                  Wrong
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                color: "white",
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", minHeight: 180 }}>
                <BarChart2 size={60} style={{ marginBottom: 16 }} />
                <Typography variant="h1" fontWeight="bold">
                  {totalQuestions}
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 500 }}>
                  Total
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              sx={{
                height: "100%",
                background: `linear-gradient(135deg, ${theme.palette.info.main} 0%, ${theme.palette.info.dark} 100%)`,
                color: "white",
                boxShadow: theme.shadows[8],
              }}
            >
              <CardContent sx={{ p: 5, textAlign: "center", minHeight: 180 }}>
                <Trophy size={60} style={{ marginBottom: 16 }} />
                <Typography variant="h1" fontWeight="bold">
                  {accuracy.toFixed(0)}%
                </Typography>
                <Typography variant="h5" sx={{ mt: 2, fontWeight: 500 }}>
                  Accuracy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          justifyContent="center"
          spacing={4}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h6" color="text.secondary">
              Avg Time
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {avgTime}s
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Avg Difficulty
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {avgDifficulty}
            </Typography>
          </Box>
          <Box>
            <Typography variant="h6" color="text.secondary">
              Final Difficulty
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 0.5,
              }}
            >
              {improvement >= 0 ? (
                <TrendingUp color={theme.palette.success.main} />
              ) : (
                <TrendingDown color={theme.palette.error.main} />
              )}
              <Typography
                variant="h5"
                fontWeight="bold"
                color={improvement >= 0 ? "success.main" : "error.main"}
              >
                {sessionDifficulty.toFixed(1)}
              </Typography>
            </Box>
          </Box>
        </Stack>

        <Button
          variant="contained"
          size="large"
          onClick={() => setPhase("setup")}
          startIcon={<RotateCcw />}
          sx={{
            borderRadius: 3,
            px: 5,
            py: 1.5,
            fontSize: "1.1rem",
            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            boxShadow: theme.shadows[6],
            "&:hover": {
              boxShadow: theme.shadows[12],
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s",
          }}
        >
          Practice Again
        </Button>
      </Card>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {phase === "setup" && renderSetup()}
      {phase === "playing" && renderPlaying()}
      {phase === "summary" && renderSummary()}
    </Container>
  );
};

export default Practice;
