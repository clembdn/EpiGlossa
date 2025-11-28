'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Clock } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { computeToeicSummary, TOEIC_SECTION_CONFIG, TOEIC_SECTION_ORDER } from '@/lib/toeic';
import type { Question, QuestionCategory } from '@/types/question';
import type { ToeicResultEntry } from '@/types/toeic';
import AudioPlayer from '@/components/ui/audio-player';

const PROGRESSION_SECTIONS = [
  {
    id: 'audio_with_images',
    start: 1,
    count: 20,
    label: 'Audio + Images (1-20)',
    icon: '🎧',
    theme: {
      wrapper: 'bg-purple-50 border border-purple-200',
      header: 'text-purple-700',
      pending: 'border border-purple-300 text-purple-600',
    },
  },
  {
    id: 'qa',
    start: 21,
    count: 30,
    label: 'Q&A (21-50)',
    icon: '❓',
    theme: {
      wrapper: 'bg-blue-50 border border-blue-200',
      header: 'text-blue-700',
      pending: 'border border-blue-300 text-blue-600',
    },
  },
  {
    id: 'short_conversation',
    start: 51,
    count: 30,
    label: 'Conversations (51-80)',
    icon: '💬',
    theme: {
      wrapper: 'bg-green-50 border border-green-200',
      header: 'text-green-700',
      pending: 'border border-green-300 text-green-600',
    },
  },
  {
    id: 'short_talks',
    start: 81,
    count: 19,
    label: 'Exposés (81-99)',
    icon: '📻',
    theme: {
      wrapper: 'bg-yellow-50 border border-yellow-200',
      header: 'text-yellow-700',
      pending: 'border border-yellow-300 text-yellow-700',
    },
  },
  {
    id: 'incomplete_sentences',
    start: 100,
    count: 40,
    label: 'Phrases (100-139)',
    icon: '✍️',
    theme: {
      wrapper: 'bg-amber-50 border border-amber-200',
      header: 'text-amber-700',
      pending: 'border border-amber-300 text-amber-700',
    },
  },
  {
    id: 'text_completion',
    start: 140,
    count: 5,
    label: 'Textes (140-144)',
    icon: '📝',
    theme: {
      wrapper: 'bg-indigo-50 border border-indigo-200',
      header: 'text-indigo-700',
      pending: 'border border-indigo-300 text-indigo-600',
    },
  },
  {
    id: 'reading_comprehension',
    start: 145,
    count: 13,
    label: 'Lecture (145-157)',
    icon: '📖',
    theme: {
      wrapper: 'bg-pink-50 border border-pink-200',
      header: 'text-pink-700',
      pending: 'border border-pink-300 text-pink-600',
    },
  },
];

type TestQuestion = Question & {
  instanceId: string;
  questionNumber: number;
};

const generateInstanceId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const isQuestionValid = (question: Question) => {
  if (question.category === 'text_completion') {
    return Boolean(
      question.text_with_gaps &&
      question.gap_choices &&
      Object.keys(question.gap_choices).length > 0
    );
  }

  return Array.isArray(question.choices) && question.choices.length > 0;
};

const selectRandomQuestions = (questions: Question[], count: number): Question[] => {
  if (!questions.length || count <= 0) {
    return [];
  }

  const basePool = [...questions];
  let pool = [...basePool];
  const selection: Question[] = [];

  while (selection.length < count) {
    if (pool.length === 0) {
      pool = [...basePool];
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    const [picked] = pool.splice(randomIndex, 1);
    selection.push(picked);
  }

  return selection;
};

const TOTAL_TIME = 120 * 60; // 2 heures en secondes

const TOEIC_SAVED_STATE_KEY = 'tepitech_blanc_saved_state';

interface SavedTestState {
  allQuestions: TestQuestion[];
  currentQuestionIndex: number;
  results: ToeicResultEntry[];
  timeRemaining: number;
  savedAt: number; // timestamp for validation
}

const saveTestState = (state: SavedTestState) => {
  try {
    localStorage.setItem(TOEIC_SAVED_STATE_KEY, JSON.stringify(state));
  } catch (err) {
    console.warn('Unable to save TOEIC test state:', err);
  }
};

const loadSavedTestState = (): SavedTestState | null => {
  try {
    const raw = localStorage.getItem(TOEIC_SAVED_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedTestState;
    // Validate structure
    if (
      !Array.isArray(parsed.allQuestions) ||
      typeof parsed.currentQuestionIndex !== 'number' ||
      !Array.isArray(parsed.results) ||
      typeof parsed.timeRemaining !== 'number'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const clearSavedTestState = () => {
  try {
    localStorage.removeItem(TOEIC_SAVED_STATE_KEY);
  } catch (err) {
    console.warn('Unable to clear TOEIC saved state:', err);
  }
};

export default function ToeicBlancTestPage() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [allQuestions, setAllQuestions] = useState<TestQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<TestQuestion | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [selectedGapAnswers, setSelectedGapAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(TOTAL_TIME);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [audioHasPlayed, setAudioHasPlayed] = useState(false);
  const [audioPermissionNeeded, setAudioPermissionNeeded] = useState(false);
  const [questionProgress, setQuestionProgress] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // Résultats
  const [results, setResults] = useState<ToeicResultEntry[]>([]);
  const resultsRef = useRef<ToeicResultEntry[]>([]);
  
  // Détection de changement de page
  const [tabChangeDetected, setTabChangeDetected] = useState(false);
  const [mobileProgressOpen, setMobileProgressOpen] = useState(false);
  const [showQuitModal, setShowQuitModal] = useState(false);

  const totalQuestions = allQuestions.length;
  const answeredCount = results.length;
  const answeredQuestionSet = useMemo(() => new Set(results.map((r) => r.questionNumber)), [results]);

    const recordResult = useCallback((entry: ToeicResultEntry) => {
      const prevResults = resultsRef.current;

      if (prevResults.some((r) => r.questionInstanceId === entry.questionInstanceId)) {
        return { nextResults: prevResults, isDuplicate: true };
      }

      const updatedResults = [...prevResults, entry];
      resultsRef.current = updatedResults;
      setResults(updatedResults);

      return { nextResults: updatedResults, isDuplicate: false };
    }, []);

  useEffect(() => {
    resultsRef.current = results;
  }, [results]);

  useEffect(() => {
    if (!totalQuestions) {
      setQuestionProgress(0);
      return;
    }

    setQuestionProgress(((currentQuestionIndex + 1) / totalQuestions) * 100);
  }, [currentQuestionIndex, totalQuestions]);

  // Charger toutes les questions du test
  useEffect(() => {
    let mounted = true;

    const fetchUser = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !mounted) return;
        setUserId(data.user?.id ?? null);
      } catch (err) {
        console.warn('Unable to fetch user for TOEIC save:', err);
      }
    };

    fetchUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Persister l'état du test à chaque changement significatif
  useEffect(() => {
    if (!hasStarted || allQuestions.length === 0) return;

    saveTestState({
      allQuestions,
      currentQuestionIndex,
      results,
      timeRemaining,
      savedAt: Date.now(),
    });
  }, [allQuestions, currentQuestionIndex, results, timeRemaining, hasStarted]);

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setLoading(true);
        setLoadError(null);

        // Vérifier s'il y a un test sauvegardé à reprendre
        const savedState = loadSavedTestState();
        if (savedState && savedState.allQuestions.length > 0 && savedState.timeRemaining > 0) {
          // Restaurer l'état sauvegardé
          setAllQuestions(savedState.allQuestions);
          setCurrentQuestionIndex(savedState.currentQuestionIndex);
          setResults(savedState.results);
          resultsRef.current = savedState.results;
          setTimeRemaining(savedState.timeRemaining);
          setCurrentQuestion(savedState.allQuestions[savedState.currentQuestionIndex] ?? null);
          setLoading(false);
          return;
        }

        const generatedQuestions: TestQuestion[] = [];

        for (const category of TOEIC_SECTION_ORDER) {
          const config = TOEIC_SECTION_CONFIG[category];
          if (!config) continue;

          const { data, error } = await supabase
            .from('questions')
            .select('*')
            .eq('category', config.category);

          if (error) throw error;

          const validQuestions = (data ?? []).filter(isQuestionValid);

          if (validQuestions.length === 0) {
            throw new Error(`Aucune question valide disponible pour la catégorie ${config.category}.`);
          }

          if (validQuestions.length < config.count) {
            console.warn(`Questions insuffisantes pour ${config.category}. Des doublons seront utilisés.`);
          }

          const selected = selectRandomQuestions(validQuestions, config.count);

          selected.forEach((question, index) => {
            generatedQuestions.push({
              ...question,
              instanceId: `${config.category}-${config.start + index}-${generateInstanceId()}`,
              questionNumber: config.start + index,
            });
          });
        }

        setAllQuestions(generatedQuestions);
        setCurrentQuestion(generatedQuestions[0] ?? null);
      } catch (err) {
        console.error('Error loading questions:', err);
        setLoadError(
          err instanceof Error
            ? err.message
            : 'Impossible de générer un test complet pour le moment. Réessaie dans un instant.'
        );
        setAllQuestions([]);
        setCurrentQuestion(null);
      } finally {
        setLoading(false);
      }
    };

    loadQuestions();
  }, []);

  const finishTest = useCallback(async (finalResults?: ToeicResultEntry[]) => {
    const payload = (finalResults && finalResults.length ? finalResults : resultsRef.current) ?? [];

    if (!payload.length) {
      router.push('/train/toeic-blanc/results');
      return;
    }

    const summary = computeToeicSummary(payload);

    try {
      sessionStorage.setItem('tepitech_blanc_results', JSON.stringify(payload));
      sessionStorage.setItem('tepitech_blanc_summary', JSON.stringify(summary));
      localStorage.removeItem('profile_data_cache');
    } catch (storageError) {
      console.error('Error saving TOEIC results locally:', storageError);
    }

    let effectiveUserId = userId;
    if (!effectiveUserId) {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (!error) {
          effectiveUserId = data.user?.id ?? null;
        }
      } catch (authError) {
        console.warn('Unable to resolve user before saving TOEIC result:', authError);
      }
    }

    if (effectiveUserId) {
      let persisted = false;

      try {
        const { error } = await supabase.from('toeic_blanc_results').insert({
          user_id: effectiveUserId,
          total_score: summary.totalScore,
          listening_score: summary.listeningScore,
          reading_score: summary.readingScore,
        });

        if (error) {
          console.error('Client Supabase insert error:', error?.message || error);
        } else {
          persisted = true;
        }
      } catch (dbError) {
        console.error('Client Supabase insert threw:', dbError);
      }

      if (!persisted) {
        try {
          const response = await fetch('/api/toeic/results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: effectiveUserId,
              totalScore: summary.totalScore,
              listeningScore: summary.listeningScore,
              readingScore: summary.readingScore,
            }),
          });

          if (!response.ok) {
            const details = await response.json().catch(() => null);
            console.error('Fallback TOEIC result save failed:', details || response.statusText);
          }
        } catch (apiError) {
          console.error('Error calling TOEIC results API:', apiError);
        }
      }
    }

    // Nettoyer la sauvegarde locale après un test terminé
    clearSavedTestState();

    router.push('/train/toeic-blanc/results');
  }, [router, userId]);

  // Timer
  useEffect(() => {
    if (!hasStarted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Temps écoulé, terminer le test
          void finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [finishTest, hasStarted, timeRemaining]);

  // Démarrer le test automatiquement
  useEffect(() => {
    if (!loading && allQuestions.length > 0 && !loadError) {
      setHasStarted(true);
    }
  }, [loading, allQuestions, loadError]);


  // Lecture automatique de l'audio
  useEffect(() => {
    if (!currentQuestion?.audio_url || audioHasPlayed || !hasStarted) {
      return;
    }

    let cancelled = false;
    const attemptPlay = () => {
      if (cancelled) return;
      const element = audioRef.current;
      if (!element || !element.isConnected) return;

      element
        .play()
        .then(() => {
          if (!cancelled) {
            setAudioPermissionNeeded(false);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          if (err?.name === 'NotAllowedError') {
            setAudioPermissionNeeded(true);
            return;
          }
          if (typeof err?.message === 'string' && err.message.includes('was interrupted')) {
            return; // Element removed before playback started – safe to ignore
          }
          console.error('Audio play error:', err);
        });
    };

    const timeout = setTimeout(attemptPlay, 500);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [audioHasPlayed, currentQuestion, hasStarted]);

  const handleAudioEnded = () => {
    setIsAudioPlaying(false);
    setAudioHasPlayed(true);
    setAudioPermissionNeeded(false);
  };

  const handleManualAudioStart = useCallback(() => {
    if (!audioRef.current || !audioRef.current.isConnected) return;
    audioRef.current
      .play()
      .then(() => {
        setAudioPermissionNeeded(false);
      })
      .catch((err) => {
        console.error('Manual audio start error:', err);
      });
  }, []);


  const getCurrentQuestionNumber = useCallback(() => {
    if (currentQuestion?.questionNumber) {
      return currentQuestion.questionNumber;
    }
    return currentQuestionIndex + 1;
  }, [currentQuestion, currentQuestionIndex]);

  const handleFinishLater = useCallback(() => {
    // Sauvegarder l'état avant de quitter
    saveTestState({
      allQuestions,
      currentQuestionIndex,
      results,
      timeRemaining,
      savedAt: Date.now(),
    });

    try {
      sessionStorage.removeItem('tepitech_blanc_results');
      sessionStorage.removeItem('tepitech_blanc_summary');
    } catch (storageError) {
      console.warn('Unable to clear TOEIC interim data before pausing:', storageError);
    }

    setShowQuitModal(false);
    router.push('/train/toeic-blanc');
  }, [router, allQuestions, currentQuestionIndex, results, timeRemaining]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePoints = (isCorrect: boolean) => {
    if (!isCorrect) return 0;
    
    const category = currentQuestion?.category;
    
    // Pour text_completion, calculer les points par trou
    if (category === 'text_completion' && currentQuestion?.gap_choices) {
      let correctGaps = 0;
      Object.entries(selectedGapAnswers).forEach(([gapNumber, selectedOption]) => {
        const gapChoices = currentQuestion.gap_choices?.[gapNumber];
        const selectedChoice = gapChoices?.find(c => c.option === selectedOption);
        if (selectedChoice?.is_correct) {
          correctGaps++;
        }
      });
      return correctGaps * 5; // 5 points par trou correct
    }
    
    return 5; // 5 points pour les autres questions
  };

  const checkAnswer = () => {
    if (!currentQuestion) return false;

    // Pour text_completion
    if (currentQuestion.text_with_gaps && currentQuestion.gap_choices) {
      return Object.entries(selectedGapAnswers).every(([gapNumber, selectedOption]) => {
        const gapChoices = currentQuestion.gap_choices?.[gapNumber];
        const selectedChoice = gapChoices?.find(c => c.option === selectedOption);
        return selectedChoice?.is_correct === true;
      });
    }

    // Pour les autres questions
    const correctChoice = currentQuestion.choices.find(c => c.is_correct);
    return selectedAnswer === correctChoice?.option;
  };

  const handleSubmitAnswer = () => {
    const isCorrect = checkAnswer();
    const points = calculatePoints(isCorrect);
    const questionNum = getCurrentQuestionNumber();
    const category = (currentQuestion?.category ?? 'audio_with_images') as QuestionCategory;

    const entry: ToeicResultEntry = {
      questionInstanceId: currentQuestion?.instanceId ?? `${questionNum}-${Date.now()}`,
      questionNumber: questionNum,
      isCorrect,
      points,
      category,
    };

    const { nextResults } = recordResult(entry);
    moveToNextQuestion(nextResults);
  };


  const moveToNextQuestion = useCallback((latestResults?: ToeicResultEntry[]) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    if (currentQuestionIndex < allQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setCurrentQuestion(allQuestions[nextIndex]);
      setSelectedAnswer(null);
      setSelectedGapAnswers({});
      setAudioHasPlayed(false);
      setAudioPermissionNeeded(false);
      setTabChangeDetected(false);
    } else {
      void finishTest(latestResults ?? resultsRef.current);
    }
  }, [allQuestions, currentQuestionIndex, finishTest]);

  const handleTabChangeViolation = useCallback(() => {
    if (!hasStarted || !currentQuestion || tabChangeDetected) return;

    setTabChangeDetected(true);

    const entry: ToeicResultEntry = {
      questionInstanceId: currentQuestion.instanceId ?? `${getCurrentQuestionNumber()}-${Date.now()}`,
      questionNumber: getCurrentQuestionNumber(),
      isCorrect: false,
      points: 0,
      category: (currentQuestion.category || 'audio_with_images') as QuestionCategory,
    };

    const { nextResults } = recordResult(entry);
    
    // Passer automatiquement à la question suivante après 500ms
    setTimeout(() => {
      moveToNextQuestion(nextResults);
    }, 500);
  }, [currentQuestion, getCurrentQuestionNumber, hasStarted, moveToNextQuestion, recordResult, tabChangeDetected]);

  // Détection de changement d'onglet/page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!hasStarted || tabChangeDetected) return;
      // Ne déclencher que si la page devient vraiment cachée (changement d'onglet)
      if (document.hidden) {
        handleTabChangeViolation();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [handleTabChangeViolation, hasStarted, tabChangeDetected]);

  const canSubmit = () => {
    if (currentQuestion?.text_with_gaps && currentQuestion?.gap_choices) {
      const totalGaps = Object.keys(currentQuestion.gap_choices).length;
      return Object.keys(selectedGapAnswers).length === totalGaps;
    }
    return selectedAnswer !== null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
          />
          <p className="text-gray-600 font-medium text-lg">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 px-4">
        <div className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-red-100 max-w-lg text-center">
          <div className="text-5xl mb-4">😕</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Impossible de générer le test complet</h2>
          <p className="text-gray-600 mb-4">
            {loadError}
          </p>
          <p className="text-sm text-gray-500 mb-6">
            Vérifie ta connexion ou réessaie d&apos;ici quelques instants. Si le problème persiste, contacte ton coach.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => router.push('/train/toeic-blanc')}
              className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              ← Retour à l&apos;aperçu
            </button>
            <button
              onClick={() => window.location.reload()}
              className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              Recharger le test
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <p className="text-2xl mb-4">❌</p>
          <p className="text-gray-600 text-lg font-semibold">Impossible de charger les questions</p>
        </div>
      </div>
    );
  }

  const ProgressPanel = ({ variant }: { variant: 'desktop' | 'mobile' }) => {
    const tileBaseClasses =
      'aspect-square rounded-xl font-bold flex items-center justify-center text-[0.6rem] sm:text-[0.7rem] xl:text-[0.8rem] 2xl:text-sm min-w-[2.25rem] min-h-[2.25rem] transition-all duration-200';
    const answeredTileClasses = 'bg-gradient-to-br from-[#5F4B8B] to-[#A4508B] text-white shadow-md border-transparent';

    return (
      <div className={`space-y-6 ${variant === 'desktop' ? 'flex-1' : ''}`}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-orange-500 rounded-xl flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
        <div>
          <h1 className="font-bold text-gray-800">TEPITECH BLANC</h1>
          <p className="text-sm text-gray-600">Test complet</p>
        </div>
      </div>

      {/* Timer */}
      <div
        className={`p-4 rounded-xl ${
          timeRemaining < 600
            ? 'bg-red-100 border-2 border-red-300'
            : 'bg-blue-100 border-2 border-blue-300'
        }`}
      >
        <div className="flex items-center gap-2 mb-2">
          <Clock
            className={`w-5 h-5 ${timeRemaining < 600 ? 'text-red-600' : 'text-blue-600'}`}
          />
          <span className="text-sm font-medium text-gray-700">Temps restant</span>
        </div>
        <div
          className={`text-2xl font-bold ${timeRemaining < 600 ? 'text-red-800' : 'text-blue-800'}`}
        >
          {formatTime(timeRemaining)}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Progression</span>
          <span className="text-sm font-bold text-blue-600">
            {answeredCount} / {totalQuestions}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-[width] duration-500 ease-out"
            style={{ width: `${questionProgress}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-gray-600 text-center">
          {questionProgress.toFixed(0)}% complété
        </div>
      </div>

      {/* Visual Question Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 text-sm">Grille de progression</h3>
        {PROGRESSION_SECTIONS.map((section) => (
          <div key={section.id} className={`rounded-2xl p-3 ${section.theme.wrapper}`}>
            <div className={`text-xs font-bold mb-2 flex items-center gap-1 ${section.theme.header}`}>
              <span>{section.icon}</span> {section.label}
            </div>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 xl:gap-2">
              {Array.from({ length: section.count }).map((_, i) => {
                const questionNum = section.start + i;
                const isAnswered = answeredQuestionSet.has(questionNum);

                return (
                  <div
                    key={questionNum}
                    className={`${tileBaseClasses} ${
                      isAnswered
                        ? answeredTileClasses
                        : `bg-white ${section.theme.pending}`
                    }`}
                  >
                    {questionNum}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* Mobile Progress Summary */}
        <div className="lg:hidden w-full">
          <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-white/70 px-4 py-3 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Progression</p>
                <p className="text-lg font-bold text-gray-900">
                  {results.length} / {allQuestions.length}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span
                  className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    timeRemaining < 600
                      ? 'bg-red-100 text-red-700'
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {formatTime(timeRemaining)}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowQuitModal(true)}
                    className="px-3 py-1 text-xs font-semibold rounded-full border border-red-200 text-red-600 bg-white shadow-sm"
                  >
                    Quitter
                  </button>
                  <button
                    onClick={() => setMobileProgressOpen((prev) => !prev)}
                    className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-sm"
                  >
                    {mobileProgressOpen ? 'Masquer' : 'Grille'}
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-3 h-2 bg-gray-200/80 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                style={{ width: `${questionProgress}%` }}
              />
            </div>
          </div>

          <AnimatePresence>
            {mobileProgressOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="px-4"
              >
                <div className="mt-4 mb-4 bg-white rounded-3xl border border-gray-100 shadow-xl p-4">
                  <ProgressPanel variant="mobile" />
                  <button
                    onClick={() => setShowQuitModal(true)}
                    className="mt-4 w-full px-4 py-3 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl font-semibold text-gray-700 hover:text-red-600 transition-all shadow-lg"
                  >
                    ← Quitter le test
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {/* Desktop Sidebar - Progress & Visual Grid */}
        <div className="hidden lg:flex lg:w-96 xl:w-[420px] 2xl:w-[460px] bg-white border-r border-gray-200 p-6 overflow-y-auto flex-col">
          <ProgressPanel variant="desktop" />
          <button
            onClick={() => setShowQuitModal(true)}
            className="mt-4 w-full px-4 py-3 bg-white hover:bg-red-50 border-2 border-gray-200 hover:border-red-300 rounded-xl font-semibold text-gray-700 hover:text-red-600 transition-all shadow-lg"
          >
            ← Quitter le test
          </button>
        </div>

        {/* Right Side - Question Content */}
        <div className="flex-1 w-full px-4 py-4 pb-16 lg:p-8">
          <div className="max-w-3xl mx-auto pt-4 lg:pt-2 flex flex-col gap-6">
            {/* Question Card */}
            <motion.div
              key={currentQuestionIndex}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100"
            >
              {/* Audio Player */}
              {currentQuestion.audio_url && (
                <div className="mb-6">
                  <AudioPlayer
                    ref={audioRef}
                    src={currentQuestion.audio_url}
                    locked
                    label="Consigne audio"
                    description="L'écoute démarre automatiquement et ne peut pas être relancée."
                    status={
                      audioPermissionNeeded
                        ? '⚠️ Autorise la lecture pour lancer l’audio'
                        : isAudioPlaying
                        ? '🔊 Lecture en cours...'
                        : audioHasPlayed
                        ? '✓ Lecture terminée'
                        : '⏳ Lecture automatique imminente'
                    }
                    onEnded={handleAudioEnded}
                    onPlay={() => setIsAudioPlaying(true)}
                    onPause={() => setIsAudioPlaying(false)}
                  />
                  <div className="mt-3 text-sm text-gray-600 space-y-3">
                    <p>
                      {audioHasPlayed
                        ? 'L’audio a été diffusé une seule fois.'
                        : 'L’audio va se lancer automatiquement.'}
                    </p>
                    {audioPermissionNeeded && (
                      <div className="p-3 rounded-xl border border-yellow-200 bg-yellow-50 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-yellow-900">
                          Ton navigateur bloque la lecture automatique. Clique ci-dessous pour démarrer l’audio une seule fois.
                        </span>
                        <button
                          onClick={handleManualAudioStart}
                          className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-semibold shadow-sm hover:bg-yellow-600"
                        >
                          Autoriser l’audio
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Image */}
              {currentQuestion.image_url && (
                <div className="mb-6">
                  <img
                    src={currentQuestion.image_url}
                    alt="Question illustration"
                    className="w-full max-h-64 md:max-h-72 object-contain mx-auto"
                  />
                </div>
              )}

              {/* Question Text */}
              {currentQuestion.question_text && !currentQuestion.text_with_gaps && (
                <div className="mb-8">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-800 leading-relaxed">
                    {currentQuestion.question_text}
                  </h2>
                </div>
              )}

              {/* Text with gaps (pour text_completion) */}
              {currentQuestion.text_with_gaps && currentQuestion.gap_choices && (
                <div className="mb-8">
                  <div className="prose prose-lg max-w-none">
                    {(() => {
                      const text = currentQuestion.text_with_gaps;
                      const parts: React.ReactNode[] = [];
                      let lastIndex = 0;
                      const regex = /\{\{(\d+)\}\}/g;
                      let match;

                      while ((match = regex.exec(text)) !== null) {
                        const gapNumber = match[1];
                        const beforeText = text.substring(lastIndex, match.index);
                        
                        if (beforeText) {
                          parts.push(
                            <span key={`text-${lastIndex}`} className="text-gray-800 text-lg">
                              {beforeText}
                            </span>
                          );
                        }

                        const gapChoices = currentQuestion.gap_choices?.[gapNumber] || [];
                        const selectedOption = selectedGapAnswers[gapNumber];

                        parts.push(
                          <select
                            key={`gap-${gapNumber}`}
                            value={selectedOption || ''}
                            onChange={(e) => {
                              setSelectedGapAnswers(prev => ({
                                ...prev,
                                [gapNumber]: e.target.value
                              }));
                            }}
                            className="inline-block mx-1 px-3 py-2 rounded-lg border-2 border-gray-300 bg-white font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
                          >
                            <option value="" disabled>
                              ({gapNumber})
                            </option>
                            {gapChoices.map((choice) => (
                              <option key={choice.option} value={choice.option}>
                                {choice.option}. {choice.text}
                              </option>
                            ))}
                          </select>
                        );

                        lastIndex = match.index + match[0].length;
                      }

                      if (lastIndex < text.length) {
                        parts.push(
                          <span key={`text-${lastIndex}`} className="text-gray-800 text-lg">
                            {text.substring(lastIndex)}
                          </span>
                        );
                      }

                      return <div className="leading-relaxed">{parts}</div>;
                    })()}
                  </div>
                </div>
              )}

              {/* Choices */}
              {currentQuestion.choices && currentQuestion.choices.length > 0 && (
                <div className="space-y-3">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice.option;

                    return (
                      <motion.button
                        key={choice.option}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedAnswer(choice.option)}
                        className={`w-full text-left p-4 md:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center font-bold text-lg ${
                            isSelected
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {choice.option}
                          </div>
                          <span className={`flex-1 font-medium ${
                            isSelected ? 'text-blue-800' : 'text-gray-800'
                          }`}>
                            {choice.text}
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.button
              onClick={handleSubmitAnswer}
              disabled={!canSubmit()}
              className={`w-full py-5 rounded-2xl font-bold text-xl shadow-xl transition-all ${
                canSubmit()
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-2xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {currentQuestionIndex < allQuestions.length - 1 ? 'Question suivante →' : 'Terminer le test 🏁'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Quit confirmation modal */}
      <AnimatePresence>
        {showQuitModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-orange-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center text-2xl">
                  ⚠️
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Quitter le test ?</h3>
                  <p className="text-sm text-gray-600">
                    Tu peux continuer, revenir plus tard ou tout arrêter. Quitter réinitialise ce test.
                  </p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Question en cours : <span className="font-semibold text-gray-900">#{getCurrentQuestionNumber()}</span>
                </p>
                <p className="text-sm text-gray-700">
                  Temps restant :{' '}
                  <span className="font-semibold text-gray-900">{formatTime(timeRemaining)}</span>
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  onClick={() => setShowQuitModal(false)}
                  className="flex-1 py-3 rounded-xl border-2 border-gray-200 font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Continuer le test
                </button>
                <button
                  onClick={handleFinishLater}
                  className="flex-1 py-3 rounded-xl border-2 border-amber-200 bg-amber-50 font-semibold text-amber-800 hover:bg-amber-100 transition-colors"
                >
                  Finir plus tard
                </button>
                <button
                  onClick={() => {
                    setShowQuitModal(false);
                    router.push('/');
                  }}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-500 to-orange-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  Quitter maintenant
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
