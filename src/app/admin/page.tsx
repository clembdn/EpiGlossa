'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Upload, Plus, Trash2, Save, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import Link from 'next/link';

type QuestionCategory = 
  | 'audio_with_images'
  | 'qa'
  | 'short_conversation'
  | 'short_talks'
  | 'incomplete_sentences'
  | 'text_completion'
  | 'reading_comprehension';

interface Choice {
  option: 'A' | 'B' | 'C' | 'D';
  text: string;
  is_correct: boolean;
}

const categories = [
  { value: 'audio_with_images', label: '🎧 Audio avec Images', description: 'Question avec audio et image' },
  { value: 'qa', label: '❓ Questions & Réponses', description: 'Question avec audio' },
  { value: 'short_conversation', label: '💬 Conversations Courtes', description: 'Dialogue audio' },
  { value: 'short_talks', label: '🎤 Exposés Courts', description: 'Présentation audio' },
  { value: 'incomplete_sentences', label: '✍️ Phrases Incomplètes', description: 'Compléter la phrase' },
  { value: 'text_completion', label: '📝 Complétion de Texte', description: 'Remplir les blancs' },
  { value: 'reading_comprehension', label: '📚 Compréhension Écrite', description: 'Lire et analyser' },
];

export default function AdminPage() {
  const [category, setCategory] = useState<QuestionCategory>('qa');
  const [questionText, setQuestionText] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  const [explanation, setExplanation] = useState('');
  const [choices, setChoices] = useState<Choice[]>([
    { option: 'A', text: '', is_correct: false },
    { option: 'B', text: '', is_correct: false },
    { option: 'C', text: '', is_correct: false },
    { option: 'D', text: '', is_correct: false },
  ]);
  
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const uploadFile = async (file: File, bucket: string): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
      return data.publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      return null;
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAudioFile(file);
    setUploading(true);
    setMessage(null);

    const url = await uploadFile(file, 'question-audio');
    if (url) {
      setAudioUrl(url);
      setMessage({ type: 'success', text: '✅ Audio uploadé avec succès!' });
    } else {
      setMessage({ type: 'error', text: '❌ Erreur lors de l\'upload de l\'audio' });
    }
    setUploading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    setUploading(true);
    setMessage(null);

    const url = await uploadFile(file, 'question-images');
    if (url) {
      setImageUrl(url);
      setMessage({ type: 'success', text: '✅ Image uploadée avec succès!' });
    } else {
      setMessage({ type: 'error', text: '❌ Erreur lors de l\'upload de l\'image' });
    }
    setUploading(false);
  };

  const handleChoiceChange = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newChoices = [...choices];
    if (field === 'is_correct') {
      // Une seule réponse correcte à la fois
      newChoices.forEach((choice, i) => {
        choice.is_correct = i === index ? (value as boolean) : false;
      });
    } else {
      newChoices[index].text = value as string;
    }
    setChoices(newChoices);
  };

  const validateForm = (): boolean => {
    if (!category) {
      setMessage({ type: 'error', text: '❌ Veuillez sélectionner une catégorie' });
      return false;
    }

    if (!questionText.trim() && !audioUrl) {
      setMessage({ type: 'error', text: '❌ Veuillez ajouter un texte de question ou un audio' });
      return false;
    }

    if (choices.some(c => !c.text.trim())) {
      setMessage({ type: 'error', text: '❌ Toutes les réponses doivent être remplies' });
      return false;
    }

    if (!choices.some(c => c.is_correct)) {
      setMessage({ type: 'error', text: '❌ Vous devez sélectionner une réponse correcte' });
      return false;
    }

    if (!explanation.trim()) {
      setMessage({ type: 'error', text: '❌ Veuillez ajouter une explication' });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setSaving(true);
    setMessage(null);

    try {
      // Préparer les données à insérer
      const questionData = {
        category,
        question_text: questionText.trim() || null,
        audio_url: audioUrl || null,
        image_url: imageUrl || null,
        choices: JSON.parse(JSON.stringify(choices)), // Ensure proper JSON format
        explanation: explanation.trim(),
      };

      console.log('Inserting question:', questionData);

      const { data, error } = await supabase.from('questions').insert(questionData).select();

      if (error) {
        console.error('Supabase error details:', error);
        throw error;
      }

      console.log('Question inserted successfully:', data);
      setMessage({ type: 'success', text: '🎉 Question ajoutée avec succès!' });
      
      // Reset form
      setTimeout(() => {
        setQuestionText('');
        setAudioUrl('');
        setImageUrl('');
        setAudioFile(null);
        setImageFile(null);
        setExplanation('');
        setChoices([
          { option: 'A', text: '', is_correct: false },
          { option: 'B', text: '', is_correct: false },
          { option: 'C', text: '', is_correct: false },
          { option: 'D', text: '', is_correct: false },
        ]);
        setMessage(null);
      }, 2000);
    } catch (error: any) {
      console.error('Error saving question:', error);
      console.error('Error message:', error?.message);
      console.error('Error details:', error?.details);
      console.error('Error hint:', error?.hint);
      setMessage({ 
        type: 'error', 
        text: `❌ Erreur: ${error?.message || 'Erreur inconnue'}` 
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Admin - Ajouter une Question
                </h1>
                <p className="text-gray-600">
                  Créez de nouvelles questions pour enrichir l'expérience d'apprentissage
                </p>
              </div>
              <div className="flex gap-2">
                <Link href="/admin/questions">
                  <button className="px-4 py-2 bg-blue-100 hover:bg-blue-200 rounded-xl text-blue-700 font-medium transition-colors">
                    📋 Gérer les questions
                  </button>
                </Link>
                <Link href="/train">
                  <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors">
                    Retour
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Message de notification */}
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-2xl border-2 flex items-center gap-3 ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-red-50 border-red-200 text-red-800'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
            )}
            <span className="font-medium">{message.text}</span>
          </motion.div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100 space-y-6"
          >
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Catégorie de la question *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value as QuestionCategory)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      category === cat.value
                        ? 'border-purple-400 bg-purple-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="font-bold text-gray-800">{cat.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{cat.description}</div>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Texte de la question */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Texte de la question
              </label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                placeholder="Entrez le texte de la question ici (optionnel si audio)"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none transition-colors resize-none text-gray-900 placeholder:text-gray-400"
              />
              <p className="text-xs text-gray-500 mt-2">
                💡 Pour les questions audio pures, laissez ce champ vide
              </p>
            </div>

            {/* Upload Audio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Fichier Audio (optionnel)
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {audioFile ? audioFile.name : 'Cliquez pour uploader un fichier MP3'}
                    </span>
                    <span className="text-xs text-gray-400">MP3, WAV (Max 10MB)</span>
                  </div>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                </label>
                {audioUrl && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-green-800">✅ Audio uploadé</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAudioUrl('');
                          setAudioFile(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <audio controls className="w-full" src={audioUrl} />
                  </div>
                )}
              </div>
            </div>

            {/* Upload Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Image (optionnel)
              </label>
              <div className="space-y-3">
                <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all">
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="w-8 h-8 text-gray-400" />
                    <span className="text-sm font-medium text-gray-600">
                      {imageFile ? imageFile.name : 'Cliquez pour uploader une image'}
                    </span>
                    <span className="text-xs text-gray-400">JPG, PNG (Max 5MB)</span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {imageUrl && (
                  <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-green-800">✅ Image uploadée</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageUrl('');
                          setImageFile(null);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <img
                      src={imageUrl}
                      alt="Preview"
                      className="w-full rounded-xl shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Choix de réponses */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3">
                Réponses (A, B, C, D) *
              </label>
              <div className="space-y-3">
                {choices.map((choice, index) => (
                  <div key={choice.option} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl flex items-center justify-center text-white font-bold shadow-md mt-1">
                      {choice.option}
                    </div>
                    <input
                      type="text"
                      value={choice.text}
                      onChange={(e) => handleChoiceChange(index, 'text', e.target.value)}
                      placeholder={`Réponse ${choice.option}`}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none transition-colors text-gray-900 placeholder:text-gray-400"
                    />
                    <label className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-xl border-2 border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors">
                      <input
                        type="radio"
                        name="correct-answer"
                        checked={choice.is_correct}
                        onChange={(e) => handleChoiceChange(index, 'is_correct', e.target.checked)}
                        className="w-5 h-5 text-green-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Correcte</span>
                    </label>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Sélectionnez la réponse correcte en cochant le bouton radio
              </p>
            </div>

            {/* Explication */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Explication *
              </label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                placeholder="Expliquez pourquoi la réponse est correcte..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none transition-colors resize-none text-gray-900 placeholder:text-gray-400"
              />
            </div>

            {/* Bouton Submit */}
            <motion.button
              type="submit"
              disabled={uploading || saving}
              whileHover={!uploading && !saving ? { scale: 1.02 } : {}}
              whileTap={!uploading && !saving ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3 ${
                uploading || saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-2xl'
              }`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : uploading ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Upload en cours...</span>
                </>
              ) : (
                <>
                  <Save className="w-6 h-6" />
                  <span>Enregistrer la question</span>
                </>
              )}
            </motion.button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
