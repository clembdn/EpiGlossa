"use client"

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [user, setUser] = useState<any>(null)

  const router = useRouter()

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data?.user ?? null)
    }
    check()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      // trim inputs to avoid accidental spaces
      const emailTrimmed = email.trim()
      const passwordTrimmed = password.trim()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailTrimmed,
        password: passwordTrimmed
      })

      // debug info to help diagnose 400 errors
      // AuthApiError usually contains `status` and `message`.
      console.log('supabase signInWithPassword result', { data, error })

      setLoading(false)

      if (error) {
        // show more informative message in UI when available
        const status = (error as any)?.status
        const serverMessage = (error as any)?.message || JSON.stringify(error)
        const errorDescription = (error as any)?.error_description || (error as any)?.description || ''
        const combined = [serverMessage, errorDescription].filter(Boolean).join(' — ')
        setMessage(`Erreur ${status ?? ''}: ${combined}`)
        return
      }

      if (!data?.user) {
        setMessage("Impossible de récupérer l'utilisateur après connexion. Vérifiez vos identifiants.")
        return
      }

      setMessage('Connexion réussie')
      router.push('/')
    } catch (err: any) {
      setLoading(false)
      console.error('Erreur inattendue lors de la connexion', err)
      setMessage(err?.message ?? 'Erreur inattendue — voir la console pour plus de détails')
    }
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setMessage('Déconnecté')
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage('Entrez votre email au-dessus pour recevoir un email de réinitialisation.')
      return
    }

    try {
      setLoading(true)
      const emailTrimmed = email.trim()
      const { data, error } = await supabase.auth.resetPasswordForEmail(emailTrimmed)
      setLoading(false)
      console.log('resetPasswordForEmail result', { data, error })
      if (error) {
        setMessage((error as any)?.message || 'Erreur lors de l\'envoi de l\'email de réinitialisation')
        return
      }

      setMessage('Si ce compte existe, un email de réinitialisation a été envoyé.')
    } catch (err: any) {
      setLoading(false)
      console.error('Erreur reset password', err)
      setMessage('Erreur inattendue lors de la demande de réinitialisation')
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 20 }}>
      <h1>Connexion</h1>

      {user ? (
        <div>
          <p>Connecté en tant que: {user.email}</p>
          <button onClick={handleSignOut} style={{ padding: '8px 12px' }}>
            Se déconnecter
          </button>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <label style={{ display: 'block', marginBottom: 8 }}>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>

          <label style={{ display: 'block', marginBottom: 12 }}>
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: 8, marginTop: 4 }}
            />
          </label>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button type="submit" disabled={loading} style={{ padding: '10px 16px' }}>
              {loading ? 'En cours...' : 'Se connecter'}
            </button>
            <button type="button" onClick={handleForgotPassword} style={{ padding: '10px 12px' }}>
              Mot de passe oublié
            </button>
          </div>
        </form>
      )}

      <p style={{ marginTop: 12 }}>
        Pas de compte ? <Link href="/auth/signup">S'inscrire</Link>
      </p>

      {message && <p style={{ marginTop: 12 }}>{message}</p>}
    </div>
  )
}
