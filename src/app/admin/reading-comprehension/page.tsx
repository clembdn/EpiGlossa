'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Choice } from '@/types/question';

interface QuestionData {
  questionText: string;
  choices: Choice[];
  explanation: string;
}

export default function AddReadingComprehensionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState('');

  const [imageUrl, setImageUrl] = useState('');
  const [questions, setQuestions] = useState<QuestionData[]>([
    {
      questionText: '',
      choices: [
        { option: 'A', text: '', is_correct: false },
        { option: 'B', text: '', is_correct: false },
        { option: 'C', text: '', is_correct: false },
        { option: 'D', text: '', is_correct: false },
      ],
      explanation: '',
    },
    {
      questionText: '',
      choices: [
        { option: 'A', text: '', is_correct: false },
        { option: 'B', text: '', is_correct: false },
        { option: 'C', text: '', is_correct: false },
        { option: 'D', text: '', is_correct: false },
      ],
      explanation: '',
    },
    {
      questionText: '',
      choices: [
        { option: 'A', text: '', is_correct: false },
        { option: 'B', text: '', is_correct: false },
        { option: 'C', text: '', is_correct: false },
        { option: 'D', text: '', is_correct: false },
      ],
      explanation: '',
    },
  ]);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('question-images')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('question-images')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await uploadFile(file);
    if (url) {
      setImageUrl(url);
      setMessage('✅ Image téléchargée !');
    } else {
      setMessage('❌ Erreur lors du téléchargement');
    }
    setUploadingImage(false);
  };

  const deleteImage = async () => {
    if (!imageUrl) return;

    try {
      const urlParts = imageUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      await supabase.storage.from('question-images').remove([fileName]);
      setImageUrl('');
      setMessage('🗑️ Image supprimée');
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  const handleQuestionChange = (
    qIndex: number,
    field: 'questionText' | 'explanation',
    value: string
  ) => {
    const newQuestions = [...questions];
    newQuestions[qIndex][field] = value;
    setQuestions(newQuestions);
  };

  const handleChoiceChange = (
    qIndex: number,
    cIndex: number,
    field: 'text' | 'is_correct',
    value: string | boolean
  ) => {
    const newQuestions = [...questions];
    if (field === 'is_correct') {
      newQuestions[qIndex].choices.forEach((c) => (c.is_correct = false));
      newQuestions[qIndex].choices[cIndex].is_correct = value as boolean;
    } else {
      newQuestions[qIndex].choices[cIndex].text = value as string;
    }
    setQuestions(newQuestions);
  };

  const validateForm = (): boolean => {
    if (!imageUrl) {
      setMessage('❌ Veuillez télécharger l\'image du texte');
      return false;
    }

    for (let i = 0; i < 3; i++) {
      if (!questions[i].questionText.trim()) {
        setMessage(`❌ Veuillez remplir la question ${i + 1}`);
        return false;
      }

      const hasCorrect = questions[i].choices.some((c) => c.is_correct);
      if (!hasCorrect) {
        setMessage(`❌ Veuillez sélectionner la bonne réponse pour la question ${i + 1}`);
        return false;
      }

      const allFilled = questions[i].choices.every((c) => c.text.trim() !== '');
      if (!allFilled) {
        setMessage(`❌ Veuillez remplir tous les choix pour la question ${i + 1}`);
        return false;
      }

      if (!questions[i].explanation.trim()) {
        setMessage(`❌ Veuillez ajouter une explication pour la question ${i + 1}`);
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setMessage('💾 Sauvegarde en cours...');

      // Generate a common group_id for the 3 questions
      const groupId = crypto.randomUUID();

      // Insert all 3 questions
      const questionsToInsert = questions.map((q, index) => ({
        category: 'reading_comprehension',
        group_id: groupId,
        question_number: index + 1,
        image_url: imageUrl,
        question_text: q.questionText,
        choices: JSON.parse(JSON.stringify(q.choices)),
        gap_choices: null, // NULL pour READING COMPREHENSION (utilise choices)
        explanation: q.explanation,
      }));

      const { error } = await supabase.from('questions').insert(questionsToInsert);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setMessage('✅ Les 3 questions READING COMPREHENSION créées avec succès !');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating questions:', error);
      setMessage(`❌ Erreur: ${error?.message || 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  📚 Reading Comprehension
                </h1>
                <p className="text-gray-600">1 image de texte + 3 questions</p>
              </div>
              <Link href="/admin">
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
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
                <p className="font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2">📌 Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Téléchargez une image contenant le texte long</li>
                  <li>• Créez 3 questions basées sur ce texte</li>
                  <li>• Les 3 questions partageront la même image</li>
                </ul>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Image du texte * (PNG, JPG)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploadingImage
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-purple-300 hover:border-purple-400 hover:bg-purple-50'
                      }`}
                    >
                      {uploadingImage ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                          <span className="text-gray-600">Téléchargement...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-purple-600" />
                          <span className="text-purple-600 font-medium">
                            {imageUrl ? 'Changer l\'image' : 'Télécharger l\'image du texte'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {imageUrl && (
                    <button
                      type="button"
                      onClick={deleteImage}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {imageUrl && <img src={imageUrl} alt="Preview" className="w-full rounded-xl mt-2" />}
              </div>

              {/* 3 Questions */}
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-gray-50 rounded-2xl p-6 border-2 border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    Question {qIndex + 1}/3
                  </h2>

                  {/* Question text */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">
                      Question {qIndex + 1} *
                    </label>
                    <textarea
                      value={q.questionText}
                      onChange={(e) =>
                        handleQuestionChange(qIndex, 'questionText', e.target.value)
                      }
                      className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={`Entrez la question ${qIndex + 1}...`}
                      required
                    />
                  </div>

                  {/* Choices */}
                  <div className="mb-4">
                    <label className="block text-gray-700 font-bold mb-2">Réponses *</label>
                    <div className="space-y-3">
                      {q.choices.map((choice, cIndex) => (
                        <div key={choice.option} className="flex items-center gap-3">
                          <input
                            type="radio"
                            name={`q${qIndex}-correct`}
                            checked={choice.is_correct}
                            onChange={() => handleChoiceChange(qIndex, cIndex, 'is_correct', true)}
                            className="w-5 h-5 text-green-600"
                          />
                          <span className="font-bold text-gray-700 w-8">{choice.option}.</span>
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) =>
                              handleChoiceChange(qIndex, cIndex, 'text', e.target.value)
                            }
                            className="flex-1 px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors text-gray-900 placeholder:text-gray-400"
                            placeholder={`Réponse ${choice.option}`}
                            required
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Explanation */}
                  <div>
                    <label className="block text-gray-700 font-bold mb-2">
                      Explication {qIndex + 1} *
                    </label>
                    <textarea
                      value={q.explanation}
                      onChange={(e) => handleQuestionChange(qIndex, 'explanation', e.target.value)}
                      className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                      rows={3}
                      placeholder={`Expliquez la réponse correcte pour la question ${qIndex + 1}...`}
                      required
                    />
                  </div>
                </div>
              ))}

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sauvegarde des 3 questions...
                  </>
                ) : (
                  <>💾 Enregistrer les 3 questions</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
