'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, CheckCircle2, FileJson } from 'lucide-react';
import Link from 'next/link';

interface JsonQuestion {
  category: string;
  question_text?: string;
  audio_url?: string;
  image_url?: string;
  choices?: Array<{ option: string; text: string; is_correct: boolean }>;
  explanation: string;
  passage_id?: string;
  question_number?: number;
  text_with_gaps?: string;
  gap_choices?: Record<string, Array<{ option: string; text: string; is_correct: boolean }>>;
}

export default function ImportJsonPage() {
  const router = useRouter();
  const [importing, setImporting] = useState(false);
  const [validating, setValidating] = useState(false);
  const [message, setMessage] = useState('');
  const [preview, setPreview] = useState<JsonQuestion[] | null>(null);

  const validateJson = async (file: File) => {
    setValidating(true);
    setMessage('');
    setPreview(null);

    try {
      const text = await file.text();
      const questions = JSON.parse(text);

      if (!Array.isArray(questions)) {
        throw new Error('Le fichier JSON doit contenir un tableau de questions');
      }

      if (questions.length === 0) {
        throw new Error('Le fichier JSON est vide');
      }

      // Validate each question
      const errors: string[] = [];
      questions.forEach((q, index) => {
        if (!q.category) {
          errors.push(`Question ${index + 1}: catégorie manquante`);
        }
        // TEXT COMPLETION: needs gap_choices instead of choices
        if (q.category === 'text_completion') {
          if (!q.text_with_gaps) {
            errors.push(`Question ${index + 1}: text_with_gaps manquant pour TEXT COMPLETION`);
          }
          if (!q.gap_choices) {
            errors.push(`Question ${index + 1}: gap_choices manquants pour TEXT COMPLETION`);
          }
        } else {
          // Standard questions need choices
          if (!q.choices || !Array.isArray(q.choices) || q.choices.length === 0) {
            errors.push(`Question ${index + 1}: choix manquants ou invalides`);
          }
        }
        if (!q.explanation) {
          errors.push(`Question ${index + 1}: explication manquante`);
        }
      });

      if (errors.length > 0) {
        throw new Error(`Erreurs de validation:\n${errors.join('\n')}`);
      }

      setPreview(questions);
      setMessage(`✅ ${questions.length} question(s) valide(s) prête(s) à être importée(s)`);
    } catch (error: unknown) {
      console.error('Validation error:', error);
      setMessage(`❌ ${error instanceof Error ? error.message : 'Une erreur est survenue'}`);
      setPreview(null);
    } finally {
      setValidating(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateJson(file);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    setMessage('💾 Import en cours...');

    try {
      const questionsToInsert = preview.map((q) => ({
        category: q.category,
        question_text: q.question_text || null,
        audio_url: q.audio_url || null,
        image_url: q.image_url || null,
        choices: q.choices || null,
        gap_choices: q.gap_choices || null,
        explanation: q.explanation,
        passage_id: q.passage_id || null,
        question_number: q.question_number || null,
        text_with_gaps: q.text_with_gaps || null,
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert)
        .select();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setMessage(`✅ ${preview.length} question(s) importée(s) avec succès!`);
      
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (error: unknown) {
      console.error('Import error:', error);
      setMessage(`❌ Erreur d'import: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setImporting(false);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      audio_with_images: '🎧 Audio avec Images',
      qa: '❓ Questions & Réponses',
      short_conversation: '💬 Conversations Courtes',
      short_talks: '🎤 Exposés Courts',
      incomplete_sentences: '✍️ Phrases Incomplètes',
      text_completion: '📝 Complétion de Texte',
      reading_comprehension: '📚 Compréhension Écrite',
    };
    return labels[category] || category;
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  📤 Import JSON
                </h1>
                <p className="text-gray-600">Importez plusieurs questions depuis un fichier JSON</p>
              </div>
              <Link href="/admin">
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-bold text-blue-900 mb-2">📌 Format JSON attendu</h3>
              <pre className="text-xs text-blue-800 bg-white p-3 rounded-lg overflow-x-auto">
{`[
  {
    "category": "incomplete_sentences",
    "question_text": "The meeting was _____ until next week.",
    "choices": [
      { "option": "A", "text": "postponed", "is_correct": true },
      { "option": "B", "text": "advanced", "is_correct": false },
      { "option": "C", "text": "cancelled", "is_correct": false },
      { "option": "D", "text": "ignored", "is_correct": false }
    ],
    "explanation": "Postponed means delayed to a later date."
  }
]`}
              </pre>
              <p className="text-sm text-blue-800 mt-2">
                <strong>Champs requis:</strong> category, choices, explanation
              </p>
              <p className="text-sm text-blue-800">
                <strong>Champs optionnels:</strong> question_text, audio_url, image_url, text_with_gaps, gap_choices, group_id, question_number
              </p>
            </div>

            {message && (
              <div
                className={`p-4 rounded-xl mb-6 ${
                  message.includes('✅')
                    ? 'bg-green-100 text-green-700'
                    : message.includes('❌')
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                <p className="font-medium whitespace-pre-wrap">{message}</p>
              </div>
            )}

            {/* File upload */}
            <div className="mb-6">
              <input
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="hidden"
                id="json-file"
                disabled={validating || importing}
              />
              <label
                htmlFor="json-file"
                className={`flex items-center justify-center gap-3 w-full px-6 py-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
                  validating || importing
                    ? 'border-gray-300 bg-gray-50'
                    : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                }`}
              >
                {validating ? (
                  <>
                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                    <span className="text-lg font-medium text-gray-600">Validation en cours...</span>
                  </>
                ) : (
                  <>
                    <FileJson className="w-8 h-8 text-purple-600" />
                    <div className="text-center">
                      <p className="text-lg font-bold text-purple-600">
                        Cliquez pour sélectionner un fichier JSON
                      </p>
                      <p className="text-sm text-gray-600">ou glissez-déposez ici</p>
                    </div>
                  </>
                )}
              </label>
            </div>

            {/* Preview */}
            {preview && preview.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  📋 Aperçu ({preview.length} question{preview.length > 1 ? 's' : ''})
                </h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {preview.map((q, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-sm font-bold text-purple-600">
                          {getCategoryLabel(q.category)}
                        </span>
                        <span className="text-xs text-gray-500">#{index + 1}</span>
                      </div>
                      <p className="text-gray-800 font-medium mb-2 line-clamp-2">
                        {q.question_text || q.text_with_gaps || 'Question audio'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        {q.choices && <span>✓ {q.choices.length} choix</span>}
                        {q.gap_choices && <span>✓ {Object.keys(q.gap_choices).length} trous</span>}
                        {q.audio_url && <span>• 🎵 Audio</span>}
                        {q.image_url && <span>• 🖼️ Image</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Import button */}
            {preview && preview.length > 0 && (
              <button
                onClick={handleImport}
                disabled={importing}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {importing ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Import en cours...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-6 h-6" />
                    Importer {preview.length} question{preview.length > 1 ? 's' : ''}
                  </>
                )}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
