"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Mail, Lock, AlertCircle, ArrowRight, Sparkles } from 'lucide-react'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'error' | 'success'>('error')

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const emailTrimmed = email.trim()
      const passwordTrimmed = password.trim()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: passwordTrimmed
      })

      console.log('supabase signInWithPassword result', { data, error })

      setLoading(false)

      if (error) {
        const serverMessage = (error as any)?.message || JSON.stringify(error)
        const errorDescription = (error as any)?.error_description || (error as any)?.description || ''
        const combined = [serverMessage, errorDescription].filter(Boolean).join(' — ')
        setMessage(combined)
        setMessageType('error')
        return
      }

      if (!data?.user) {
        setMessage("Impossible de récupérer l'utilisateur. Vérifiez vos identifiants.")
        setMessageType('error')
        return
      }

      setMessage('Connexion réussie !')
      setMessageType('success')

      const accessToken = (data as any)?.session?.access_token
      if (accessToken && typeof window !== 'undefined') {
        document.cookie = `epig_token=${accessToken}; path=/; max-age=604800;`;
      }

      setTimeout(() => router.push('/'), 500)
    } catch (err: any) {
      setLoading(false)
      console.error('Erreur connexion', err)
      setMessage(err?.message ?? 'Erreur inattendue')
      setMessageType('error')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Entrez votre email pour recevoir un lien de réinitialisation.')
      setMessageType('error')
      return
    }

    try {
      setLoading(true)
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim())
      setLoading(false)
      if (error) {
        setMessage(error.message)
        setMessageType('error')
        return
      }
      setMessage('Email de réinitialisation envoyé si le compte existe.')
      setMessageType('success')
    } catch (err: any) {
      setLoading(false)
      setMessage('Erreur lors de la demande')
      setMessageType('error')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-center mb-8">
          <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }} className="text-6xl mb-4">
            🌟
          </motion.div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Connexion
          </h1>
          <p className="text-gray-600">Content de te revoir !</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-3xl p-8 shadow-2xl border-2 border-gray-100">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all text-gray-800"
                  placeholder="ton@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:outline-none transition-all text-gray-800"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {message && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`flex items-start gap-3 p-4 rounded-xl ${messageType === 'error' ? 'bg-red-50 border-2 border-red-200' : 'bg-green-50 border-2 border-green-200'}`}>
                <AlertCircle className={`w-5 h-5 flex-shrink-0 ${messageType === 'error' ? 'text-red-500' : 'text-green-500'}`} />
                <p className={`text-sm ${messageType === 'error' ? 'text-red-700' : 'text-green-700'}`}>{message}</p>
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 group"
            >
              {loading ? (
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Se connecter
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            <button type="button" onClick={handleForgotPassword} className="w-full text-sm text-purple-600 hover:text-purple-700 font-medium">
              Mot de passe oublié ?
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-100"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-medium">Nouveau sur EpiGlossa ?</span></div>
          </div>

          <Link href="/auth/signup">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full bg-gradient-to-r from-yellow-400 to-orange-400 text-white py-4 rounded-xl font-bold text-center shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer">
              Créer un compte
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  )
}
