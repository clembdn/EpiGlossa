'use client';

import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Play, Trophy, Clock, Target, Star, Loader2, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Question, ReadingPassage } from '@/types/question';

// Fonction pour mélanger un tableau
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

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
    color: 'from-pink-400 to-rose-400',
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

export default function TrainCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const category = params.category as string;
  const info = categoryInfo[category];
  
  const [questions, setQuestions] = useState<Question[] | ReadingPassage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (category === 'reading_comprehension') {
          // For READING COMPREHENSION: group by passage_id
          const { data, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('category', category)
            .order('passage_id', { ascending: false });

          if (fetchError) throw fetchError;
          
          // Group by passage_id and keep all 3 questions together
          const passageMap = new Map<string, ReadingPassage>();
          (data || []).forEach((q) => {
            if (q.passage_id) {
              if (!passageMap.has(q.passage_id)) {
                passageMap.set(q.passage_id, {
                  passage_id: q.passage_id,
                  image_url: q.image_url,
                  questions: [],
                });
              }
              passageMap.get(q.passage_id)!.questions.push(q);
            }
          });
          
          // Convert to array and sort questions by question_number
          const passages = Array.from(passageMap.values()).map(passage => ({
            ...passage,
            questions: passage.questions.sort((a, b) => (a.question_number || 0) - (b.question_number || 0)),
          }));
          
          // Mélanger l'ordre des passages
          const shuffledPassages = shuffleArray(passages);
          setQuestions(shuffledPassages);
          
          // Sauvegarder l'ordre des passage_ids dans sessionStorage
          const passageIds = shuffledPassages.map(p => p.passage_id);
          sessionStorage.setItem(`question_order_${category}`, JSON.stringify(passageIds));
        } else {
          // For other categories: standard fetch
          const { data, error: fetchError } = await supabase
            .from('questions')
            .select('*')
            .eq('category', category);

          if (fetchError) throw fetchError;
          
          // Mélanger l'ordre des questions
          const shuffledQuestions = shuffleArray(data || []);
          setQuestions(shuffledQuestions);
          
          // Sauvegarder l'ordre des question IDs dans sessionStorage
          const questionIds = shuffledQuestions.map(q => q.id);
          sessionStorage.setItem(`question_order_${category}`, JSON.stringify(questionIds));
        }
      } catch (err) {
        console.error('Error fetching questions:', err);
        setError('Impossible de charger les questions');
      } finally {
        setLoading(false);
      }
    };

    if (info) {
      fetchQuestions();
    } else {
      setLoading(false);
    }
  }, [category, info]);

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
  const completedCount = 0;

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
          <div className="space-y-4">
            {questions.map((item, index) => {
              // For READING COMPREHENSION: item is a passage with 3 questions
              if (category === 'reading_comprehension' && 'questions' in item) {
                const passage = item as ReadingPassage;
                
                return (
                  <motion.div
                    key={passage.passage_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link href={`/train/${category}/${passage.passage_id}`}>
                      <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-100 hover:border-blue-300 hover:shadow-xl transition-all cursor-pointer group">
                        <div className="flex items-start gap-4">
                          <div className={`w-16 h-16 flex-shrink-0 bg-gradient-to-br ${info.color} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                            <span className="text-3xl">{info.emoji}</span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold text-gray-800">
                                Passage de lecture (3 questions)
                              </h3>
                              <span className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                                3 Q
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm line-clamp-2">
                              {passage.questions.map((q, i) => 
                                `Q${i+1}: ${q.question_text?.substring(0, 30)}...`
                              ).join(' • ')}
                            </p>
                            {passage.image_url && (
                              <div className="mt-3">
                                <img 
                                  src={passage.image_url} 
                                  alt="Passage" 
                                  className="w-full h-32 object-cover rounded-xl"
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <div className="flex items-center gap-2 px-3 py-1 bg-yellow-50 rounded-full border border-yellow-200">
                              <Trophy className="w-4 h-4 text-yellow-600" />
                              <span className="text-sm font-bold text-yellow-600">150 XP</span>
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
                  ? `Texte à compléter (4 trous)`
                  : question.question_text || 'Question audio';

              return (
                <Link key={question.id} href={questionUrl}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white rounded-2xl p-5 md:p-6 shadow-lg hover:shadow-xl transition-all border-2 border-gray-100 hover:border-blue-200 group cursor-pointer relative overflow-hidden"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br ${info.color} rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-2">
                            {displayTitle}
                          </h3>
                          <span className="px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap bg-blue-100 text-blue-700">
                            TOEIC
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>3 min</span>
                          </div>
                        <div className="flex items-center gap-1">
                          <Trophy className="w-4 h-4 text-yellow-500" />
                          <span className="font-bold text-yellow-600">+50 XP</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4 text-blue-500" />
                          <span>{question.choices?.length || 0} choix</span>
                        </div>
                      </div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow flex-shrink-0"
                    >
                      <Play className="w-5 h-5 fill-current" />
                    </motion.div>
                  </div>
                </motion.div>
              </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
