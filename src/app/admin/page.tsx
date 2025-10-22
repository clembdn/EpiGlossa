'use client';

import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen pb-24 md:pb-8 md:pt-24 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-purple-200">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <Plus className="w-8 h-8 text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Gérez les questions et suivez les statistiques</p>
              </div>
              <Link href="/train"><button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-700 font-medium transition-colors">Retour</button></Link>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6 border-2 border-orange-200">
            <h2 className="text-xl font-bold text-gray-800 mb-4">⚡ Actions Rapides</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/admin/add"><div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-blue-400 group"><div className="text-4xl mb-3 group-hover:scale-110 transition-transform">➕</div><h3 className="font-bold text-gray-800 mb-2 text-lg">Ajouter une Question</h3><p className="text-sm text-gray-600">Formulaire dynamique</p></div></Link>
              <Link href="/admin/questions"><div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-purple-400 group"><div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📋</div><h3 className="font-bold text-gray-800 mb-2 text-lg">Gérer les Questions</h3><p className="text-sm text-gray-600">Liste et modification</p></div></Link>
              <Link href="/admin/import"><div className="bg-white rounded-xl p-6 hover:shadow-xl transition-all cursor-pointer border-2 border-transparent hover:border-green-400 group"><div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📤</div><h3 className="font-bold text-gray-800 mb-2 text-lg">Import JSON</h3><p className="text-sm text-gray-600">Import en masse</p></div></Link>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-2 border-gray-100">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">📊 Statistiques</h2>
            <div className="p-4 bg-yellow-50 rounded-2xl border-2 border-yellow-200"><p className="text-yellow-800 font-medium text-center">💡 Dashboard utilisateurs à venir</p></div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
