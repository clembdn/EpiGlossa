'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, use } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Upload, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Choice, QuestionCategory } from '@/types/question';

const categoryOptions: { value: QuestionCategory; label: string }[] = [
  { value: 'audio_with_images', label: '🎧 Audio avec Images' },
  { value: 'qa', label: '❓ Questions & Réponses' },
  { value: 'short_conversation', label: '💬 Conversations Courtes' },
  { value: 'short_talks', label: '🎤 Exposés Courts' },
  { value: 'incomplete_sentences', label: '✍️ Phrases Incomplètes' },
  { value: 'text_completion', label: '📝 Complétion de Texte' },
  { value: 'reading_comprehension', label: '📚 Compréhension Écrite' },
];

export default function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Form state
  const [category, setCategory] = useState<QuestionCategory>('audio_with_images');
  const [questionText, setQuestionText] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [choices, setChoices] = useState<Choice[]>([
    { option: 'A', text: '', is_correct: false },
    { option: 'B', text: '', is_correct: false },
    { option: 'C', text: '', is_correct: false },
    { option: 'D', text: '', is_correct: false },
  ]);
  const [explanation, setExplanation] = useState('');
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    fetchQuestion();
  }, [resolvedParams.id]);

  const fetchQuestion = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error) throw error;

      if (data) {
        setCategory(data.category);
        setQuestionText(data.question_text || '');
        setAudioUrl(data.audio_url || '');
        setImageUrl(data.image_url || '');
        setChoices(data.choices);
        setExplanation(data.explanation || '');
      }
    } catch (error) {
      console.error('Error fetching question:', error);
      setMessage('❌ Erreur lors du chargement de la question');
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (
    file: File,
    bucket: 'question-audio' | 'question-images'
  ): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading to ${bucket}:`, error);
      return null;
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);
    const url = await uploadFile(file, 'question-audio');
    if (url) {
      setAudioUrl(url);
      setMessage('✅ Audio téléchargé !');
    } else {
      setMessage('❌ Erreur lors du téléchargement de l\'audio');
    }
    setUploadingAudio(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const url = await uploadFile(file, 'question-images');
    if (url) {
      setImageUrl(url);
      setMessage('✅ Image téléchargée !');
    } else {
      setMessage('❌ Erreur lors du téléchargement de l\'image');
    }
    setUploadingImage(false);
  };

  const handleChoiceChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newChoices = [...choices];
    if (field === 'is_correct') {
      // Reset all to false, then set the selected one to true
      newChoices.forEach((c) => (c.is_correct = false));
      newChoices[index].is_correct = value as boolean;
    } else {
      newChoices[index].text = value as string;
    }
    setChoices(newChoices);
  };

  const deleteAudio = async () => {
    if (!audioUrl) return;
    
    try {
      // Extract filename from URL
      const urlParts = audioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      await supabase.storage.from('question-audio').remove([fileName]);
      setAudioUrl('');
      setMessage('🗑️ Audio supprimé');
    } catch (error) {
      console.error('Error deleting audio:', error);
    }
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

  const validateForm = (): boolean => {
    if (!category) {
      setMessage('❌ Veuillez sélectionner une catégorie');
      return false;
    }

    const hasCorrectAnswer = choices.some((c) => c.is_correct);
    if (!hasCorrectAnswer) {
      setMessage('❌ Veuillez sélectionner la bonne réponse');
      return false;
    }

    const allChoicesFilled = choices.every((c) => c.text.trim() !== '');
    if (!allChoicesFilled) {
      setMessage('❌ Veuillez remplir toutes les réponses');
      return false;
    }

    if (!explanation.trim()) {
      setMessage('❌ Veuillez ajouter une explication');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSaving(true);
      setMessage('💾 Sauvegarde en cours...');

      const questionData = {
        category,
        question_text: questionText || null,
        audio_url: audioUrl || null,
        image_url: imageUrl || null,
        choices: JSON.parse(JSON.stringify(choices)),
        gap_choices: null, // NULL pour questions standards
        explanation,
      };

      const { error } = await supabase
        .from('questions')
        .update(questionData)
        .eq('id', resolvedParams.id);

      if (error) {
        console.error('Supabase error:', error);
        console.error('Error message:', error.message);
        console.error('Error details:', error.details);
        console.error('Error hint:', error.hint);
        throw error;
      }

      setMessage('✅ Question modifiée avec succès !');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (error: unknown) {
      console.error('Error updating question:', error);
      setMessage(`❌ Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pb-20 md:pt-24">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200 mb-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Modifier la Question
                </h1>
                <p className="text-gray-600">Modifiez les informations de la question</p>
              </div>
              <Link href="/admin/questions">
                <button className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors">
                  <ArrowLeft className="w-6 h-6 text-gray-700" />
                </button>
              </Link>
            </div>

            {message && (
              <div className={`p-4 rounded-xl mb-6 ${
                message.includes('✅') ? 'bg-green-100 text-green-700' :
                message.includes('❌') ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                <p className="font-medium">{message}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Catégorie *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                  className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors text-gray-900"
                  required
                >
                  {categoryOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Texte de la question (optionnel)
                </label>
                <textarea
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                  rows={3}
                  placeholder="Entrez le texte de la question..."
                />
              </div>

              {/* Audio Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Audio (optionnel)
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      className="hidden"
                      id="audio-upload"
                      disabled={uploadingAudio}
                    />
                    <label
                      htmlFor="audio-upload"
                      className={`flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        uploadingAudio
                          ? 'border-gray-300 bg-gray-50'
                          : 'border-blue-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {uploadingAudio ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                          <span className="text-gray-600">Téléchargement...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5 text-blue-600" />
                          <span className="text-blue-600 font-medium">
                            {audioUrl ? 'Changer l\'audio' : 'Télécharger un audio'}
                          </span>
                        </>
                      )}
                    </label>
                  </div>
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={deleteAudio}
                      className="px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {audioUrl && (
                  <audio src={audioUrl} controls className="w-full mt-2" />
                )}
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Image (optionnel)
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
                            {imageUrl ? 'Changer l\'image' : 'Télécharger une image'}
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
                {imageUrl && (
                  <img src={imageUrl} alt="Preview" className="w-full rounded-xl mt-2" />
                )}
              </div>

              {/* Choices */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Réponses * (sélectionnez la bonne réponse)
                </label>
                <div className="space-y-3">
                  {choices.map((choice, index) => (
                    <div key={choice.option} className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={choice.is_correct}
                        onChange={() => handleChoiceChange(index, 'is_correct', true)}
                        className="w-5 h-5 text-green-600"
                      />
                      <span className="font-bold text-gray-700 w-8">{choice.option}.</span>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
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
                  Explication *
                </label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                  rows={4}
                  placeholder="Expliquez pourquoi cette réponse est correcte..."
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sauvegarde en cours...
                  </>
                ) : (
                  <>💾 Enregistrer les modifications</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
