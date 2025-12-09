import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Custom hook for speech recognition using Web Speech API
 * Captures spoken input and converts it to text
 */
const useSpeechRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState(null);
  
  const recognitionRef = useRef(null);

  // Check browser support on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      
      // Initialize recognition
      const recognition = new SpeechRecognition();
      recognition.continuous = true; // Enable continuous mode
      recognition.interimResults = true; // Enable interim results for faster response
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onresult = (event) => {
        // Get the latest result
        const lastResult = event.results[event.results.length - 1];
        const speechResult = lastResult[0].transcript;
        
        // Only process final results (when user finishes speaking a phrase)
        if (lastResult.isFinal) {
          console.log('Speech recognized (final):', speechResult);
          setTranscript(speechResult);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        // Don't stop on 'no-speech' error, just continue
        if (event.error !== 'no-speech') {
          setError(event.error);
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        // Auto-restart if still supposed to be listening
        if (recognitionRef.current && isListening) {
          try {
            recognitionRef.current.start();
          } catch (err) {
            console.log('Recognition already started or error:', err);
            setIsListening(false);
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = recognition;
    } else {
      setIsSupported(false);
      console.warn('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const startListening = useCallback(() => {
    if (!isSupported || !recognitionRef.current) {
      setError('Speech recognition not supported');
      return;
    }

    try {
      setError(null);
      setTranscript('');
      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error starting recognition:', err);
      setError(err.message);
    }
  }, [isSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setError(null);
  }, []);

  return {
    transcript,
    isListening,
    isSupported,
    error,
    startListening,
    stopListening,
    resetTranscript,
  };
};

/**
 * Parse spoken number into numeric value
 * Handles various spoken formats like "forty two", "negative five", "three point five"
 */
export const parseSpokenNumber = (text) => {
  if (!text) return null;

  const cleaned = text.toLowerCase().trim();
  
  // Word to number mapping
  const wordToNum = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4,
    'five': 5, 'six': 6, 'seven': 7, 'eight': 8, 'nine': 9,
    'ten': 10, 'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14,
    'fifteen': 15, 'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19,
    'twenty': 20, 'thirty': 30, 'forty': 40, 'fifty': 50,
    'sixty': 60, 'seventy': 70, 'eighty': 80, 'ninety': 90,
    'hundred': 100, 'thousand': 1000
  };

  // Check if it's already a number
  const directNum = parseFloat(cleaned);
  if (!isNaN(directNum)) {
    return directNum;
  }

  // Handle negative numbers
  let isNegative = false;
  let workingText = cleaned;
  if (cleaned.startsWith('negative ') || cleaned.startsWith('minus ')) {
    isNegative = true;
    workingText = cleaned.replace(/^(negative|minus)\s+/, '');
  }

  // Handle decimals (e.g., "three point five")
  if (workingText.includes(' point ')) {
    const parts = workingText.split(' point ');
    const wholePart = convertWordsToNumber(parts[0], wordToNum);
    const decimalPart = convertWordsToNumber(parts[1], wordToNum);
    
    if (wholePart !== null && decimalPart !== null) {
      const decimalPlaces = parts[1].split(' ').length;
      const result = wholePart + (decimalPart / Math.pow(10, decimalPlaces));
      return isNegative ? -result : result;
    }
  }

  // Convert word number to numeric
  const result = convertWordsToNumber(workingText, wordToNum);
  if (result !== null) {
    return isNegative ? -result : result;
  }

  return null;
};

/**
 * Convert word-based numbers to numeric value
 */
const convertWordsToNumber = (text, wordToNum) => {
  const words = text.split(/\s+/);
  let total = 0;
  let current = 0;

  for (const word of words) {
    const num = wordToNum[word];
    
    if (num !== undefined) {
      if (num === 100 || num === 1000) {
        current = current === 0 ? num : current * num;
      } else {
        current += num;
      }
    } else {
      // Try to parse as number
      const parsed = parseFloat(word);
      if (!isNaN(parsed)) {
        current += parsed;
      } else {
        // Unknown word, might not be a number
        continue;
      }
    }
  }

  total += current;
  return total > 0 ? total : null;
};

export default useSpeechRecognition;
