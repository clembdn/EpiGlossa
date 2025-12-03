'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Play, Trophy, Clock, Target, Star, Loader2, ChevronRight, Search, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import type { Question, ReadingPassage } from '@/types/question';
import { useCategoryProgress } from '@/hooks/useProgress';
import { CategoryProgressBar } from '@/components/ProgressComponents';
import { useQuestionsCache } from '@/hooks/useQuestionsCache';

const categoryInfo: Record<string, {
  name: string;
  emoji: string;
  color: string;
  description: string;
}> = {
  'audio_with_images': {
    name: 'Audio avec Images',
    emoji: '🎧',
    color: 'from-purple-400 to-pink-400',
    description: 'Écoute des audios tout en regardant des images pour améliorer ta compréhension orale',
  },
  'qa': {
    name: 'Questions & Réponses',
    emoji: '❓',
    color: 'from-blue-400 to-cyan-400',
    description: 'Réponds à des questions variées pour tester ta compréhension',
  },
  'short_conversation': {
    name: 'Conversations Courtes',
    emoji: '💬',
    color: 'from-green-400 to-emerald-400',
    description: 'Écoute et comprends des dialogues du quotidien',
  },
  'short_talks': {
    name: 'Exposés Courts',
    emoji: '🎤',
    color: 'from-orange-400 to-red-400',
    description: 'Entraîne-toi avec des présentations et discours professionnels',
  },
  'incomplete_sentences': {
    name: 'Phrases à Compléter',
    emoji: '✍️',
    color: 'from-amber-400 to-yellow-400',
    description: 'Complète les phrases avec le bon mot ou expression',
  },
  'text_completion': {
    name: 'Textes à Compléter',
    emoji: '📝',
    color: 'from-indigo-400 to-purple-400',
    description: 'Remplis les blancs dans des textes variés',
  },
  'reading_comprehension': {
    name: 'Compréhension Écrite',
    emoji: '📚',
    color: 'from-teal-400 to-cyan-400',
    description: 'Lis et analyse des textes pour répondre aux questions',
  },
};

const getTextCompletionTitle = (text?: string | null) => {
  if (!text) return 'Texte à compléter';
  const cleaned = text
    .replace(/\{\{\d+\}\}/g, '____')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) return 'Texte à compléter';

  const sentenceMatch = cleaned.match(/[^.!?…]+[.!?…]?/);
  return (sentenceMatch ? sentenceMatch[0] : cleaned).trim();
};

export default function TrainCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const info = categoryInfo[category];
  
  const [search, setSearch] = useState('');
  
  // Hook pour le cache des questions
  const { questions, loading, error, fromCache, refresh } = useQuestionsCache(category);
  
  // Hook pour la progression
  const { stats, isQuestionCompleted, loading: progressLoading } = useCategoryProgress(category);
  
  // Ignore error warning
  void error;
  
  // Fonction pour créer un ID de passage à partir de l'image_url
  const getPassageId = (imageUrl: string) => encodeURIComponent(imageUrl);
  
  // Fonction pour obtenir les questions d'un passage comme tableau
  const getPassageQuestionsArray = (passage: ReadingPassage) => {
    return Object.entries(passage.questions)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .map(([num, q]) => ({
        id: `${getPassageId(passage.image_url)}_q${num}`,
        questionNumber: num,
        ...q
      }));
  };
  
  useEffect(() => {
    // Sauvegarder l'ordre des questions dans sessionStorage pour la navigation
    if (questions.length > 0) {
      if (category === 'reading_comprehension') {
        const passageIds = (questions as ReadingPassage[]).map(p => getPassageId(p.image_url));
        sessionStorage.setItem(`question_order_${category}`, JSON.stringify(passageIds));
      } else {
        const questionIds = (questions as Question[]).map(q => q.id);
        sessionStorage.setItem(`question_order_${category}`, JSON.stringify(questionIds));
      }
    }
  }, [questions, category]);

  if (!info) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <p className="text-6xl mb-4">❌</p>
          <p className="text-gray-600 text-lg font-semibold mb-2">Catégorie introuvable</p>
          <Link href="/train">
            <button className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors">
              Retour aux catégories
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const totalXP = questions.length * 50;
  const completedCount = stats?.correct_count || 0;

  // Filtrage des questions par texte de question ou de réponse
  const term = search.trim().toLowerCase();
  const matchesRCPassage = (passage: ReadingPassage): boolean => {
    if (!term) return true;
    // Chercher dans toutes les questions du passage
    return Object.values(passage.questions).some(q => {
      const text = (q.question_text || '').toLowerCase();
      if (text.includes(term)) return true;
      if (q.choices?.some(c => (c.text || '').toLowerCase().includes(term))) return true;
      return false;
    });
  };
  
  const matchesQuestion = (q: Question) => {
    if (!term) return true;
    const questionWithText = q as { question_text?: string; text_with_gaps?: string; choices?: { text?: string }[]; gap_choices?: Record<string, { text?: string }[]> };
    const text = (questionWithText.question_text || questionWithText.text_with_gaps || '').toLowerCase();
    if (text.includes(term)) return true;
    // choices (A-D)
    if (Array.isArray(questionWithText.choices)) {
      if (questionWithText.choices.some((c) => (c.text || '').toLowerCase().includes(term))) return true;
    }
    // gap_choices for text_completion
    if (questionWithText.gap_choices && typeof questionWithText.gap_choices === 'object') {
      const all = Object.values(questionWithText.gap_choices).flat();
      if (all.some((c) => (c.text || '').toLowerCase().includes(term))) return true;
    }
    return false;
  };

  const filteredItems = ((): (Question | ReadingPassage)[] => {
    if (!term) return questions as (Question | ReadingPassage)[];
    if (category === 'reading_comprehension') {
      return (questions as ReadingPassage[]).filter(p => matchesRCPassage(p));
    }
    return (questions as Question[]).filter(q => matchesQuestion(q));
  })();

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 font-medium transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
            Retour
          </button>

          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-blue-100">
            <div className="flex items-start gap-4 md:gap-6">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                className={`w-20 h-20 md:w-24 md:h-24 bg-gradient-to-br ${info.color} rounded-3xl flex items-center justify-center shadow-lg flex-shrink-0`}
              >
                <span className="text-5xl md:text-6xl">{info.emoji}</span>
              </motion.div>
              
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-4xl font-bold text-gray-800 mb-2">
                  {info.name}
                </h1>
                <p className="text-gray-600 text-sm md:text-base leading-relaxed mb-4">
                  {info.description}
                </p>

                <div className="grid grid-cols-3 gap-3 md:gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-3 border border-blue-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-4 h-4 text-blue-500" />
                      <span className="text-xs text-gray-600 font-medium">Questions</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-blue-600">{questions.length}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-3 border border-yellow-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Trophy className="w-4 h-4 text-yellow-600" />
                      <span className="text-xs text-gray-600 font-medium">Total XP</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-yellow-600">{totalXP}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-3 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <Star className="w-4 h-4 text-green-600" />
                      <span className="text-xs text-gray-600 font-medium">Complétées</span>
                    </div>
                    <p className="text-xl md:text-2xl font-bold text-green-600">{completedCount}/{questions.length}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Barre de progression XP */}
        {!loading && !progressLoading && questions.length > 0 && (
          <div className="mb-10">
            <CategoryProgressBar 
              stats={stats} 
              totalQuestions={questions.length} 
              loading={progressLoading}
            />
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 font-medium">Chargement des questions...</p>
            </div>
          </div>
        )}

        {error && !loading && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center">
            <p className="text-red-600 font-medium mb-2">❌ {error}</p>
            <p className="text-gray-600 text-sm">Veuillez réessayer plus tard</p>
          </div>
        )}

        {!loading && !error && questions.length === 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 text-center">
            <p className="text-yellow-700 font-medium mb-2">🔍 Aucune question disponible</p>
            <p className="text-gray-600 text-sm">Les questions pour cette catégorie seront bientôt ajoutées!</p>
          </div>
        )}

        {!loading && !error && questions.length > 0 && (
          <>
            {/* Indicateur de cache et barre de recherche */}
            <div className="mb-4 space-y-3">
              {/* Indicateur si les données viennent du cache */}
              {fromCache && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-xl px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-blue-700 font-medium">
                      📦 Chargées depuis le cache (instantané)
                    </span>
                  </div>
                  <button
                    onClick={() => refresh()}
                    className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Actualiser
                  </button>
                </motion.div>
              )}
              
              {/* Barre de recherche */}
              <div className="group rounded-xl p-[2px] bg-gradient-to-r from-blue-300 to-purple-400 focus-within:from-blue-500 focus-within:to-purple-600 transition-colors">
                <div className="relative">
                  <Search className="w-5 h-5 text-gray-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors group-focus-within:text-blue-600" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Rechercher une question ou une réponse..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-[10px] border-0 outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 focus:border-transparent bg-white text-gray-900 placeholder-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Séparer les exercices en deux groupes: non réussis et réussis */}
            {(() => {
              // Séparer les items en fonction de leur statut de complétion
              const notCompletedItems: (Question | ReadingPassage)[] = [];
              const completedItems: (Question | ReadingPassage)[] = [];

              filteredItems.forEach((item) => {
                if (category === 'reading_comprehension' && 'questions' in item) {
                  const passage = item as ReadingPassage;
                  const questionsArray = getPassageQuestionsArray(passage);
                  const passageCompleted = questionsArray.every(q => isQuestionCompleted(q.id));
                  if (passageCompleted) {
                    completedItems.push(item);
                  } else {
                    notCompletedItems.push(item);
                  }
                } else {
                  const question = item as Question;
                  if (isQuestionCompleted(question.id)) {
                    completedItems.push(item);
                  } else {
                    notCompletedItems.push(item);
                  }
                }
              });

              const renderItem = (item: Question | ReadingPassage, index: number, isInCompletedSection: boolean) => {
                // For READING COMPREHENSION: item is a passage with questions object
                if (category === 'reading_comprehension' && 'questions' in item) {
                  const passage = item as ReadingPassage;
                  const questionsArray = getPassageQuestionsArray(passage);
                  const passageId = getPassageId(passage.image_url);
                  const questionCount = questionsArray.length;
                  const passageCompleted = questionsArray.every(q => isQuestionCompleted(q.id));
                  
                  return (
                    <motion.div
                      key={passageId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Link href={`/train/${category}/${passageId}`}>
                        <div className={`bg-white rounded-2xl p-6 shadow-lg transition-all cursor-pointer group relative ${
                          passageCompleted 
                            ? 'border-4 border-green-500 hover:shadow-2xl opacity-75' 
                            : 'border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl'
                        }`}>
                          
                          <div className="flex items-start gap-4">
                            <div className={`w-16 h-16 flex-shrink-0 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center shadow-md ${passageCompleted ? 'grayscale-[30%]' : ''}`}>
                              <span className="text-3xl">{info.emoji}</span>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-lg font-bold text-gray-800">
                                  Passage de lecture ({questionCount} question{questionCount > 1 ? 's' : ''})
                                </h3>
                                <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                                  {questionCount} Q
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm line-clamp-2">
                                {questionsArray.map((q, i) => 
                                  `Q${i+1}: ${q.question_text?.substring(0, 30)}...`
                                ).join(' • ')}
                              </p>
                              {passage.image_url && (
                                <div className="relative w-full h-32 mt-3">
                                  <Image
                                    src={passage.image_url}
                                    alt="Passage"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 400px"
                                    className={`object-cover rounded-xl ${passageCompleted ? 'grayscale-[30%]' : ''}`}
                                    priority={index < 2}
                                  />
                                </div>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <div className={`flex items-center gap-2 px-3 py-1 rounded-full border ${
                                passageCompleted 
                                  ? 'bg-green-100 border-green-300 text-green-700' 
                                  : 'bg-yellow-50 border-yellow-200 text-yellow-600'
                              }`}>
                                <Trophy className={`w-4 h-4 ${passageCompleted ? 'text-green-600' : 'text-yellow-600'}`} />
                                <span className="text-sm font-bold">
                                  {passageCompleted ? `✓ ${questionCount * 50} XP` : `+${questionCount * 50} XP`}
                                </span>
                              </div>
                              <ChevronRight className="w-6 h-6 text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  );
                }
                
                // For other categories: standard question display
                const question = item as Question;
                const questionUrl = `/train/${category}/${question.id}`;
                const displayTitle = 
                  category === 'text_completion'
                    ? getTextCompletionTitle(question.text_with_gaps)
                    : question.question_text || 'Question audio';
                
                const isCompleted = isQuestionCompleted(question.id);

                return (
                  <div key={question.id}>
                    <Link href={questionUrl} className="block">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`bg-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden ${
                          isCompleted 
                            ? 'border-4 border-green-500 opacity-75' 
                            : 'border-2 border-gray-100 hover:border-blue-200'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform ${isCompleted ? 'grayscale-[30%]' : ''}`}>
                            {isInCompletedSection ? '✓' : index + 1}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4 mb-2">
                              <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2 pr-10">
                                {displayTitle}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-blue-100 text-blue-700">
                                TEPITECH
                              </span>
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <div className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                <span>3 min</span>
                              </div>
                              <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg ${
                                isCompleted 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-yellow-50 text-yellow-600'
                              }`}>
                                <Trophy className={`w-4 h-4 ${isCompleted ? 'text-green-600' : 'text-yellow-500'}`} />
                                <span className="font-bold">
                                  {isCompleted ? '✓ 50 XP' : '+50 XP'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-4 h-4 text-blue-500" />
                                <span>{question.choices?.length || 0} choix</span>
                              </div>
                            </div>
                            
                            {/* Display image thumbnail for audio_with_images category */}
                            {category === 'audio_with_images' && question.image_url && (
                              <div className="relative w-full h-32 mt-3">
                                <Image
                                  src={question.image_url}
                                  alt="Question illustration"
                                  fill
                                  sizes="(max-width: 768px) 100vw, 400px"
                                  className={`object-cover rounded-xl ${isCompleted ? 'grayscale-[30%]' : ''}`}
                                  priority={index < 4}
                                />
                              </div>
                            )}
                          </div>

                          <motion.div
                            className={`w-12 h-12 bg-gradient-to-br ${isCompleted ? 'from-green-500 to-emerald-500' : 'from-blue-500 to-purple-500'} rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0`}
                          >
                            <Play className="w-5 h-5 fill-current" />
                          </motion.div>
                        </div>
                      </motion.div>
                    </Link>
                  </div>
                );
              };

              return (
                <>
                  {/* Section: Exercices à faire */}
                  {notCompletedItems.length > 0 && (
                    <div className="mb-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">À faire</h2>
                          <p className="text-sm text-gray-500">{notCompletedItems.length} exercice{notCompletedItems.length > 1 ? 's' : ''} restant{notCompletedItems.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      <div className="space-y-4 md:space-y-6">
                        {notCompletedItems.map((item, index) => renderItem(item, index, false))}
                      </div>
                    </div>
                  )}

                  {/* Section: Exercices réussis */}
                  {completedItems.length > 0 && (
                    <div className="mt-8">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                          <Trophy className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">Déjà réussis</h2>
                          <p className="text-sm text-gray-500">{completedItems.length} exercice{completedItems.length > 1 ? 's' : ''} complété{completedItems.length > 1 ? 's' : ''}</p>
                        </div>
                      </div>
                      
                      {/* Collapse/Expand toggle pour les exercices réussis */}
                      <details className="group">
                        <summary className="cursor-pointer list-none mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors">
                            <ChevronRight className="w-4 h-4 transition-transform group-open:rotate-90" />
                            <span>Afficher les {completedItems.length} exercice{completedItems.length > 1 ? 's' : ''} réussi{completedItems.length > 1 ? 's' : ''}</span>
                          </div>
                        </summary>
                        <div className="space-y-4 md:space-y-6">
                          {completedItems.map((item, index) => renderItem(item, index, true))}
                        </div>
                      </details>
                    </div>
                  )}

                  {/* Message si tout est complété */}
                  {notCompletedItems.length === 0 && completedItems.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 text-center mb-6"
                    >
                      <span className="text-5xl mb-3 block">🎉</span>
                      <h3 className="text-xl font-bold text-green-700 mb-2">Bravo !</h3>
                      <p className="text-green-600">Tu as réussi tous les exercices de cette catégorie !</p>
                    </motion.div>
                  )}
                </>
              );
            })()}
          </>
        )}
      </div>
    </div>
  );
}
