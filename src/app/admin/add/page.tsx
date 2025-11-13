'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ChevronLeft, Loader2, Plus } from 'lucide-react';
import type { QuestionCategory } from '@/types/question';

export default function AddQuestionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<QuestionCategory>('audio_with_images');
  
  // Standard fields
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  // Standard choices (A, B, C, D)
  const [choices, setChoices] = useState([
    { option: 'A' as const, text: '', is_correct: false },
    { option: 'B' as const, text: '', is_correct: false },
    { option: 'C' as const, text: '', is_correct: false },
    { option: 'D' as const, text: '', is_correct: false },
  ]);
  
  // TEXT COMPLETION fields
  const [textWithGaps, setTextWithGaps] = useState('');
  const [gapChoices, setGapChoices] = useState<{
    [key: string]: Array<{ option: 'A' | 'B' | 'C' | 'D'; text: string; is_correct: boolean }>
  }>({
    '1': [
      { option: 'A', text: '', is_correct: false },
      { option: 'B', text: '', is_correct: false },
      { option: 'C', text: '', is_correct: false },
      { option: 'D', text: '', is_correct: false },
    ],
    '2': [
      { option: 'A', text: '', is_correct: false },
      { option: 'B', text: '', is_correct: false },
      { option: 'C', text: '', is_correct: false },
      { option: 'D', text: '', is_correct: false },
    ],
    '3': [
      { option: 'A', text: '', is_correct: false },
      { option: 'B', text: '', is_correct: false },
      { option: 'C', text: '', is_correct: false },
      { option: 'D', text: '', is_correct: false },
    ],
    '4': [
      { option: 'A', text: '', is_correct: false },
      { option: 'B', text: '', is_correct: false },
      { option: 'C', text: '', is_correct: false },
      { option: 'D', text: '', is_correct: false },
    ],
  });
  
  // READING COMPREHENSION fields (3 questions)
  const [readingQuestions, setReadingQuestions] = useState([
    {
      question_text: '',
      choices: [
        { option: 'A' as const, text: '', is_correct: false },
        { option: 'B' as const, text: '', is_correct: false },
        { option: 'C' as const, text: '', is_correct: false },
        { option: 'D' as const, text: '', is_correct: false },
      ],
      explanation: '',
    },
    {
      question_text: '',
      choices: [
        { option: 'A' as const, text: '', is_correct: false },
        { option: 'B' as const, text: '', is_correct: false },
        { option: 'C' as const, text: '', is_correct: false },
        { option: 'D' as const, text: '', is_correct: false },
      ],
      explanation: '',
    },
    {
      question_text: '',
      choices: [
        { option: 'A' as const, text: '', is_correct: false },
        { option: 'B' as const, text: '', is_correct: false },
        { option: 'C' as const, text: '', is_correct: false },
        { option: 'D' as const, text: '', is_correct: false },
      ],
      explanation: '',
    },
  ]);

  const categories = [
    { value: 'audio_with_images', label: 'Audio avec Images' },
    { value: 'qa', label: 'Questions & Réponses' },
    { value: 'short_conversation', label: 'Conversations Courtes' },
    { value: 'short_talks', label: 'Exposés Courts' },
    { value: 'incomplete_sentences', label: 'Phrases à Compléter' },
    { value: 'text_completion', label: 'Textes à Compléter' },
    { value: 'reading_comprehension', label: 'Compréhension Écrite' },
  ];

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from(bucket).getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let audio_url = null;
      let image_url = null;

      // Upload files if present
      if (audioFile) {
        audio_url = await uploadFile(audioFile, 'question-audio');
      }
      if (imageFile) {
        image_url = await uploadFile(imageFile, 'question-images');
      }

      // Handle different category types
      if (category === 'text_completion') {
        // TEXT COMPLETION: Single question with gaps
        const { error } = await supabase.from('questions').insert({
          category,
          question_text: null,
          text_with_gaps: textWithGaps,
          gap_choices: gapChoices,
          choices: null,
          explanation,
          audio_url,
          image_url,
        });

        if (error) throw error;
      } else if (category === 'reading_comprehension') {
        // READING COMPREHENSION: 3 questions with same passage_id and image
        const passageId = crypto.randomUUID();
        
        const questionsToInsert = readingQuestions.map((q, index) => ({
          category,
          passage_id: passageId,
          question_number: index + 1,
          question_text: q.question_text,
          choices: q.choices,
          explanation: q.explanation,
          audio_url: null,
          image_url,
          text_with_gaps: null,
          gap_choices: null,
        }));

        const { error } = await supabase.from('questions').insert(questionsToInsert);
        if (error) throw error;
      } else {
        // STANDARD QUESTION: Single question with 4 choices
        const { error } = await supabase.from('questions').insert({
          category,
          question_text: questionText,
          choices,
          explanation,
          audio_url,
          image_url,
          text_with_gaps: null,
          gap_choices: null,
        });

        if (error) throw error;
      }

      alert('Question ajoutée avec succès!');
      router.push('/admin');
    } catch (error) {
      console.error('Error:', error);
      alert('Erreur lors de l\'ajout de la question');
    } finally {
      setLoading(false);
    }
  };

  const updateChoice = (index: number, field: 'text' | 'is_correct', value: string | boolean) => {
    const newChoices = [...choices];
    if (field === 'is_correct') {
      newChoices.forEach((c, i) => (c.is_correct = i === index));
    } else {
      newChoices[index].text = value as string;
    }
    setChoices(newChoices);
  };

  const updateGapChoice = (
    gapNum: string,
    choiceIndex: number,
    field: 'text' | 'is_correct',
    value: string | boolean
  ) => {
    const newGapChoices = { ...gapChoices };
    if (field === 'is_correct') {
      newGapChoices[gapNum].forEach((c, i) => (c.is_correct = i === choiceIndex));
    } else {
      newGapChoices[gapNum][choiceIndex].text = value as string;
    }
    setGapChoices(newGapChoices);
  };

  const updateReadingQuestion = (
    qIndex: number,
    choiceIndex: number,
    field: 'text' | 'is_correct',
    value: string | boolean
  ) => {
    const newQuestions = [...readingQuestions];
    if (field === 'is_correct') {
      newQuestions[qIndex].choices.forEach((c, i) => (c.is_correct = i === choiceIndex));
    } else {
      newQuestions[qIndex].choices[choiceIndex].text = value as string;
    }
    setReadingQuestions(newQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 font-medium transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Retour
        </button>

        <div className="bg-white rounded-3xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Ajouter une Question</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Catégorie *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as QuestionCategory)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* STANDARD QUESTIONS */}
            {category !== 'text_completion' && category !== 'reading_comprehension' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texte de la question *
                  </label>
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    rows={3}
                    required
                  />
                </div>

                {/* Audio Upload */}
                {(category === 'audio_with_images' || category === 'qa' || category === 'short_conversation' || category === 'short_talks') && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fichier Audio
                    </label>
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={(e) => setAudioFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Image Upload */}
                {category === 'audio_with_images' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {/* Standard Choices */}
                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700">
                    Réponses (A, B, C, D) *
                  </label>
                  {choices.map((choice, index) => (
                    <div key={choice.option} className="flex items-start gap-3">
                      <div className="w-10 h-10 flex-shrink-0 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-600">
                        {choice.option}
                      </div>
                      <input
                        type="text"
                        value={choice.text}
                        onChange={(e) => updateChoice(index, 'text', e.target.value)}
                        placeholder={`Réponse ${choice.option}`}
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                      <label className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                        <input
                          type="radio"
                          name="correct"
                          checked={choice.is_correct}
                          onChange={() => updateChoice(index, 'is_correct', true)}
                          className="w-5 h-5 text-green-600"
                        />
                        <span className="text-sm font-medium text-green-700">Correcte</span>
                      </label>
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Explication *
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    rows={3}
                    required
                  />
                </div>
              </>
            )}

            {/* TEXT COMPLETION */}
            {category === 'text_completion' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Texte avec trous (utilisez {`{{1}}, {{2}}, {{3}}, {{4}}`}) *
                  </label>
                  <textarea
                    value={textWithGaps}
                    onChange={(e) => setTextWithGaps(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors font-mono"
                    rows={8}
                    placeholder="Exemple: The company {{1}} a new product last year. It {{2}} very successful..."
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    💡 Utilisez {`{{1}}, {{2}}, {{3}}, {{4}}`} pour marquer les emplacements des menus déroulants
                  </p>
                </div>

                {/* Gap Choices */}
                {Object.keys(gapChoices).map((gapNum) => (
                  <div key={gapNum} className="space-y-3 p-6 bg-purple-50 rounded-2xl border-2 border-purple-200">
                    <h3 className="font-bold text-purple-900 text-lg">Trou #{gapNum}</h3>
                    {gapChoices[gapNum].map((choice, choiceIndex) => (
                      <div key={choice.option} className="flex items-start gap-3">
                        <div className="w-10 h-10 flex-shrink-0 bg-purple-100 rounded-lg flex items-center justify-center font-bold text-purple-600">
                          {choice.option}
                        </div>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) =>
                            updateGapChoice(gapNum, choiceIndex, 'text', e.target.value)
                          }
                          placeholder={`Réponse ${choice.option}`}
                          className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                          required
                        />
                        <label className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                          <input
                            type="radio"
                            name={`gap-${gapNum}-correct`}
                            checked={choice.is_correct}
                            onChange={() => updateGapChoice(gapNum, choiceIndex, 'is_correct', true)}
                            className="w-5 h-5 text-green-600"
                          />
                          <span className="text-sm font-medium text-green-700">Correcte</span>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Explication *
                  </label>
                  <textarea
                    value={explanation}
                    onChange={(e) => setExplanation(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    rows={3}
                    required
                  />
                </div>
              </>
            )}

            {/* READING COMPREHENSION */}
            {category === 'reading_comprehension' && (
              <>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image du passage (obligatoire) *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    📚 Cette image sera affichée pour les 3 questions
                  </p>
                </div>

                {readingQuestions.map((q, qIndex) => (
                  <div
                    key={qIndex}
                    className="space-y-4 p-6 bg-teal-50 rounded-2xl border-2 border-teal-200"
                  >
                    <h3 className="font-bold text-teal-900 text-xl">Question #{qIndex + 1}</h3>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Texte de la question *
                      </label>
                      <textarea
                        value={q.question_text}
                        onChange={(e) => {
                          const newQuestions = [...readingQuestions];
                          newQuestions[qIndex].question_text = e.target.value;
                          setReadingQuestions(newQuestions);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                        rows={2}
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="block text-sm font-semibold text-gray-700">
                        Réponses (A, B, C, D) *
                      </label>
                      {q.choices.map((choice, choiceIndex) => (
                        <div key={choice.option} className="flex items-start gap-3">
                          <div className="w-10 h-10 flex-shrink-0 bg-teal-100 rounded-lg flex items-center justify-center font-bold text-teal-600">
                            {choice.option}
                          </div>
                          <input
                            type="text"
                            value={choice.text}
                            onChange={(e) =>
                              updateReadingQuestion(qIndex, choiceIndex, 'text', e.target.value)
                            }
                            placeholder={`Réponse ${choice.option}`}
                            className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                            required
                          />
                          <label className="flex items-center gap-2 px-4 py-3 bg-green-50 rounded-xl border-2 border-green-200 cursor-pointer hover:bg-green-100 transition-colors">
                            <input
                              type="radio"
                              name={`reading-q${qIndex}-correct`}
                              checked={choice.is_correct}
                              onChange={() =>
                                updateReadingQuestion(qIndex, choiceIndex, 'is_correct', true)
                              }
                              className="w-5 h-5 text-green-600"
                            />
                            <span className="text-sm font-medium text-green-700">Correcte</span>
                          </label>
                        </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Explication *
                      </label>
                      <textarea
                        value={q.explanation}
                        onChange={(e) => {
                          const newQuestions = [...readingQuestions];
                          newQuestions[qIndex].explanation = e.target.value;
                          setReadingQuestions(newQuestions);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-teal-500 focus:outline-none transition-colors"
                        rows={2}
                        required
                      />
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-2xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Ajouter la question
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
