'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Trash2, Edit, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import type { Question } from '@/types/question';

const categoryLabels: Record<string, string> = {
  audio_with_images: '🎧 Audio avec Images',
  qa: '❓ Questions & Réponses',
  short_conversation: '💬 Conversations Courtes',
  short_talks: '🎤 Exposés Courts',
  incomplete_sentences: '✍️ Phrases Incomplètes',
  text_completion: '📝 Complétion de Texte',
  reading_comprehension: '📚 Compréhension Écrite',
};

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette question ?')) return;

    try {
      setDeleting(id);
      const { error } = await supabase.from('questions').delete().eq('id', id);

      if (error) throw error;

      setQuestions(questions.filter(q => q.id !== id));
      alert('✅ Question supprimée avec succès !');
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('❌ Erreur lors de la suppression');
    } finally {
      setDeleting(null);
    }
  };

  const filteredQuestions = filter === 'all' 
    ? questions 
    : questions.filter(q => q.category === filter);

  const categoryCounts = questions.reduce((acc, q) => {
    acc[q.category] = (acc[q.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Gestion des Questions
                </h1>
                <p className="text-gray-600">
                  {questions.length} question{questions.length > 1 ? 's' : ''} au total
                </p>
              </div>
              <div className="flex gap-3">
                <Link href="/admin">
                  <button className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:shadow-lg transition-all">
                    ➕ Nouvelle Question
                  </button>
                </Link>
                <Link href="/">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors">
                    Retour
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats par catégorie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
        >
          <button
            onClick={() => setFilter('all')}
            className={`p-4 rounded-2xl border-2 transition-all ${
              filter === 'all'
                ? 'border-purple-400 bg-purple-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="text-2xl font-bold text-purple-600">{questions.length}</div>
            <div className="text-sm text-gray-600 font-medium">Toutes</div>
          </button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`p-4 rounded-2xl border-2 transition-all ${
                filter === key
                  ? 'border-blue-400 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-2xl font-bold text-blue-600">{categoryCounts[key] || 0}</div>
              <div className="text-xs text-gray-600 font-medium truncate">{label}</div>
            </button>
          ))}
        </motion.div>

        {/* Liste des questions */}
        {filteredQuestions.length === 0 ? (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-3" />
            <p className="text-yellow-700 font-medium mb-2">Aucune question trouvée</p>
            <p className="text-gray-600 text-sm">
              {filter === 'all' 
                ? 'Commencez par ajouter votre première question !'
                : 'Aucune question dans cette catégorie'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question, index) => (
              <motion.div
                key={question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-2xl p-5 md:p-6 shadow-lg border-2 border-gray-100 hover:border-blue-200 transition-all"
              >
                <div className="flex items-start gap-4">
                  {/* Category Badge */}
                  <div className="flex-shrink-0">
                    <div className="px-3 py-1 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg">
                      <span className="text-sm font-bold text-blue-700">
                        {categoryLabels[question.category]}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">
                      {question.question_text || question.text_with_gaps?.substring(0, 100) || '🔊 Question audio'}
                    </h3>
                    
                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
                      {question.audio_url && <span>🎵 Audio</span>}
                      {question.image_url && <span>🖼️ Image</span>}
                      {question.choices && <span>• {question.choices.length} choix</span>}
                      {question.gap_choices && <span>• 4 trous à compléter</span>}
                      <span>• {new Date(question.created_at || '').toLocaleDateString('fr-FR')}</span>
                    </div>

                    {/* Choices preview */}
                    <div className="flex flex-wrap gap-2">
                      {question.choices && question.choices.map((choice) => (
                        <span
                          key={choice.option}
                          className={`px-2 py-1 rounded-lg text-xs font-medium ${
                            choice.is_correct
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {choice.option}: {choice.text.substring(0, 20)}
                          {choice.text.length > 20 ? '...' : ''}
                          {choice.is_correct && ' ✓'}
                        </span>
                      ))}
                      {question.gap_choices && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-purple-100 text-purple-700">
                          📝 Text Completion (4 trous)
                        </span>
                      )}
                      {question.text_with_gaps && (
                        <span className="px-2 py-1 rounded-lg text-xs font-medium bg-indigo-100 text-indigo-700">
                          {question.text_with_gaps.substring(0, 50)}...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 flex-shrink-0">
                    <Link href={`/admin/edit/${question.id}`}>
                      <button className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl transition-colors">
                        <Edit className="w-5 h-5" />
                      </button>
                    </Link>
                    <button
                      onClick={() => handleDelete(question.id)}
                      disabled={deleting === question.id}
                      className="p-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {deleting === question.id ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
