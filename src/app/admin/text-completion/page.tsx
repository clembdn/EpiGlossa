'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import type { Choice } from '@/types/question';

export default function AddTextCompletionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const [textWithGaps, setTextWithGaps] = useState('');
  const [gapChoices, setGapChoices] = useState<{ [key: string]: Choice[] }>({
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
  const [explanation, setExplanation] = useState('');

  const handleGapChoiceChange = (
    gapNumber: string,
    choiceIndex: number,
    field: 'text' | 'is_correct',
    value: string | boolean
  ) => {
    const newGapChoices = { ...gapChoices };
    if (field === 'is_correct') {
      newGapChoices[gapNumber].forEach((c) => (c.is_correct = false));
      newGapChoices[gapNumber][choiceIndex].is_correct = value as boolean;
    } else {
      newGapChoices[gapNumber][choiceIndex].text = value as string;
    }
    setGapChoices(newGapChoices);
  };

  const validateForm = (): boolean => {
    if (!textWithGaps.trim()) {
      setMessage('❌ Veuillez entrer le texte avec les marqueurs {{1}}, {{2}}, {{3}}, {{4}}');
      return false;
    }

    // Vérifier que les 4 trous sont présents
    const gaps = ['{{1}}', '{{2}}', '{{3}}', '{{4}}'];
    for (const gap of gaps) {
      if (!textWithGaps.includes(gap)) {
        setMessage(`❌ Le texte doit contenir ${gap}`);
        return false;
      }
    }

    // Vérifier que chaque trou a une réponse correcte et tous les choix remplis
    for (let i = 1; i <= 4; i++) {
      const gapNum = i.toString();
      const choices = gapChoices[gapNum];

      const hasCorrect = choices.some((c) => c.is_correct);
      if (!hasCorrect) {
        setMessage(`❌ Veuillez sélectionner la bonne réponse pour le trou ${i}`);
        return false;
      }

      const allFilled = choices.every((c) => c.text.trim() !== '');
      if (!allFilled) {
        setMessage(`❌ Veuillez remplir tous les choix pour le trou ${i}`);
        return false;
      }
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
        category: 'text_completion',
        text_with_gaps: textWithGaps,
        gap_choices: JSON.parse(JSON.stringify(gapChoices)),
        choices: null, // NULL pour TEXT COMPLETION (utilise gap_choices)
        explanation,
      };

      const { error } = await supabase.from('questions').insert(questionData);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      setMessage('✅ Question TEXT COMPLETION créée avec succès !');
      setTimeout(() => {
        router.push('/admin/questions');
      }, 1500);
    } catch (error: any) {
      console.error('Error creating question:', error);
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
                  📝 Text Completion
                </h1>
                <p className="text-gray-600">Texte avec 4 trous à compléter</p>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Instructions */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-900 mb-2">📌 Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Écrivez votre texte en utilisant les marqueurs <code className="bg-blue-200 px-1 rounded">{'{{1}}'}</code>, <code className="bg-blue-200 px-1 rounded">{'{{2}}'}</code>, <code className="bg-blue-200 px-1 rounded">{'{{3}}'}</code>, <code className="bg-blue-200 px-1 rounded">{'{{4}}'}</code></li>
                  <li>• Les utilisateurs verront des menus déroulants à ces emplacements</li>
                  <li>• Remplissez ensuite les 4 choix pour chaque trou</li>
                </ul>
              </div>

              {/* Text with gaps */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">
                  Texte avec trous * (utilisez {'{{1}}'}, {'{{2}}'}, {'{{3}}'}, {'{{4}}'})
                </label>
                <textarea
                  value={textWithGaps}
                  onChange={(e) => setTextWithGaps(e.target.value)}
                  className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400 font-mono"
                  rows={12}
                  placeholder="Dear Customer,&#10;&#10;We are {{1}} to announce that our new product will be {{2}} next month. This innovation has been {{3}} to meet your needs and will {{4}} improve your experience.&#10;&#10;Best regards"
                  required
                />
              </div>

              {/* Gap choices */}
              {[1, 2, 3, 4].map((gapNum) => (
                <div key={gapNum} className="bg-gray-50 rounded-xl p-5 border-2 border-gray-200">
                  <h3 className="font-bold text-gray-800 mb-3">
                    Trou {gapNum} : {'{{' + gapNum + '}}'}
                  </h3>
                  <div className="space-y-3">
                    {gapChoices[gapNum.toString()].map((choice, idx) => (
                      <div key={choice.option} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`gap-${gapNum}-correct`}
                          checked={choice.is_correct}
                          onChange={() =>
                            handleGapChoiceChange(gapNum.toString(), idx, 'is_correct', true)
                          }
                          className="w-5 h-5 text-green-600"
                        />
                        <span className="font-bold text-gray-700 w-8">{choice.option}.</span>
                        <input
                          type="text"
                          value={choice.text}
                          onChange={(e) =>
                            handleGapChoiceChange(gapNum.toString(), idx, 'text', e.target.value)
                          }
                          className="flex-1 px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors text-gray-900 placeholder:text-gray-400"
                          placeholder={`Choix ${choice.option} pour le trou ${gapNum}`}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Explanation */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Explication *</label>
                <textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-4 py-3 outline-none border-2 border-gray-300 rounded-xl focus:border-purple-400 transition-colors resize-none text-gray-900 placeholder:text-gray-400"
                  rows={4}
                  placeholder="Expliquez les réponses correctes pour les 4 trous..."
                  required
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>💾 Enregistrer</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
