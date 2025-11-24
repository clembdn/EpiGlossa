'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Dumbbell, User, ChevronDown, Volume2, MessageSquare, Users, Radio, FileText, CheckSquare, BookText, Languages, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useUserRole } from '@/hooks/useUserRole';

const trainCategories = [
  { 
    name: 'TEPITECH BLANC', 
    href: '/train/toeic-blanc',
    icon: Volume2,
    emoji: '🎯',
    color: 'from-red-500 to-orange-500',
    description: 'Test complet 2h'
  },
  { 
    name: 'Audio avec Images', 
    href: '/train/audio_with_images',
    icon: Volume2,
    emoji: '🎧',
    color: 'from-purple-400 to-pink-400',
    description: 'Écoute et regarde'
  },
  { 
    name: 'Questions & Réponses', 
    href: '/train/qa',
    icon: MessageSquare,
    emoji: '❓',
    color: 'from-blue-400 to-cyan-400',
    description: 'Réponds aux questions'
  },
  { 
    name: 'Conversations Courtes', 
    href: '/train/short_conversation',
    icon: Users,
    emoji: '💬',
    color: 'from-green-400 to-emerald-400',
    description: 'Dialogue simple'
  },
  { 
    name: 'Exposés Courts', 
    href: '/train/short_talks',
    icon: Radio,
    emoji: '📻',
    color: 'from-yellow-400 to-orange-400',
    description: 'Écoute active'
  },
  { 
    name: 'Phrases Incomplètes', 
    href: '/train/incomplete_sentences',
    icon: FileText,
    emoji: '✍️',
    color: 'from-amber-400 to-yellow-400',
    description: 'Complète les phrases'
  },
  { 
    name: 'Complétion de Texte', 
    href: '/train/text_completion',
    icon: CheckSquare,
    emoji: '📝',
    color: 'from-indigo-400 to-purple-400',
    description: 'Remplis les blancs'
  },
  { 
    name: 'Compréhension Écrite', 
    href: '/train/reading_comprehension',
    icon: BookText,
    emoji: '📖',
    color: 'from-pink-400 to-rose-400',
    description: 'Lis et comprends'
  },
];

const learnCategories = [
  { 
    name: 'Vocabulaire', 
    href: '/learn/vocabulaire',
    icon: BookText,
    emoji: '📚',
    color: 'from-purple-400 to-pink-400',
    description: 'Mots essentiels pour réussir le Tepitech'
  },
  { 
    name: 'Grammaire', 
    href: '/learn/grammaire',
    icon: CheckSquare,
    emoji: '💡',
    color: 'from-yellow-400 to-orange-400',
    description: 'Règles grammaticales clés du Tepitech'
  },
  { 
    name: 'Conjugaison', 
    href: '/learn/conjugaison',
    icon: FileText,
    emoji: '✏️',
    color: 'from-blue-400 to-cyan-400',
    description: 'Temps et verbes pour le Tepitech'
  },
  { 
    name: 'Compréhension', 
    href: '/learn/comprehension',
    icon: MessageSquare,
    emoji: '📖',
    color: 'from-green-400 to-emerald-400',
    description: 'Lecture et analyse façon Tepitech'
  },
];

const navItems = [
  { 
    name: 'Apprendre', 
    href: '/learn', 
    icon: BookOpen, 
    color: 'bg-gradient-to-br from-purple-400 to-pink-400',
    activeColor: 'text-purple-600',
    hasDropdown: true
  },
  { 
    name: "S'entraîner", 
    href: '/train', 
    icon: Dumbbell, 
    color: 'bg-gradient-to-br from-blue-400 to-cyan-400',
    activeColor: 'text-blue-600',
    hasDropdown: true
  },
  { 
    name: 'Profil', 
    href: '/profile', 
    icon: User, 
    color: 'bg-gradient-to-br from-yellow-400 to-orange-400',
    activeColor: 'text-orange-600',
    hasDropdown: false
  },
];

const adminNavItem = {
  name: 'Admin',
  href: '/admin',
  icon: Shield,
  color: 'bg-gradient-to-br from-red-400 to-pink-400',
  activeColor: 'text-red-600',
  hasDropdown: false
};

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<'learn' | 'train' | null>(null);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const { isAdmin, loading: roleLoading } = useUserRole();

  useEffect(() => {
    let mounted = true
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(data?.user ?? null)
      } catch (err) {
        console.error('Error getting user', err)
      }
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      mounted = false
      try {
        listener?.subscription?.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      // clear our cookie so middleware won't consider the user authenticated
      if (typeof document !== 'undefined') {
        document.cookie = 'epig_token=; path=/; max-age=0;'
      }
      setUser(null)
      router.push('/auth/login')
    } catch (err) {
      console.error('Error signing out', err)
    }
  }

  const handleMobileDropdown = (type: 'learn' | 'train') => {
    setActiveDropdown(type);
    setMobileMenuOpen(true);
  };

  return (
    <>
      {/* Navbar pour mobile - En bas */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-[0_-4px_20px_rgba(0,0,0,0.08)] z-50 border-t border-gray-100">
        <div className="safe-area-inset-bottom">
          <div className="flex justify-around items-center px-2 py-2">
            {navItems.map(({ name, href, icon: Icon, color, activeColor, hasDropdown }) => {
              const active = pathname.startsWith(href);
              
              if (hasDropdown) {
                return (
                  <div key={name} className="flex-1">
                    <button
                      onClick={() => handleMobileDropdown(name === 'Apprendre' ? 'learn' : 'train')}
                      className="w-full"
                    >
                      <motion.div
                        className="relative flex flex-col items-center gap-1 py-2"
                      >
                        <div className="relative">
                          <AnimatePresence>
                            {active && (
                              <motion.div
                                layoutId="mobileActiveBackground"
                                className={`absolute inset-0 ${color} rounded-2xl -m-2`}
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                              />
                            )}
                          </AnimatePresence>
                          <div className="relative z-10 p-2">
                            <Icon
                              size={24}
                              className={`transition-all duration-200 ${
                                active ? 'text-white scale-110' : 'text-gray-400'
                              }`}
                              strokeWidth={active ? 2.5 : 2}
                            />
                          </div>
                        </div>
                        <motion.span
                          className={`text-[11px] font-bold transition-all duration-200 ${
                            active ? activeColor : 'text-gray-400'
                          }`}
                          animate={{ scale: active ? 1.05 : 1 }}
                        >
                          {name}
                        </motion.span>
                      </motion.div>
                    </button>
                  </div>
                );
              }
              
              return (
                <Link key={name} href={href} className="flex-1">
                  <motion.div
                    className="relative flex flex-col items-center gap-1 py-2"
                  >
                    <div className="relative">
                      <AnimatePresence>
                        {active && (
                          <motion.div
                            layoutId="mobileActiveBackground"
                            className={`absolute inset-0 ${color} rounded-2xl -m-2`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          />
                        )}
                      </AnimatePresence>
                      <div className="relative z-10 p-2">
                        <Icon
                          size={24}
                          className={`transition-all duration-200 ${
                            active ? 'text-white scale-110' : 'text-gray-400'
                          }`}
                          strokeWidth={active ? 2.5 : 2}
                        />
                      </div>
                    </div>
                    <motion.span
                      className={`text-[11px] font-bold transition-all duration-200 ${
                        active ? activeColor : 'text-gray-400'
                      }`}
                      animate={{ scale: active ? 1.05 : 1 }}
                    >
                      {name}
                    </motion.span>
                  </motion.div>
                </Link>
              );
            })}
            {/* Admin nav item for mobile - only visible to admins */}
            {!roleLoading && isAdmin && (
              <Link href={adminNavItem.href} className="flex-1">
                <motion.div
                  className="relative flex flex-col items-center gap-1 py-2"
                >
                  <div className="relative">
                    <AnimatePresence>
                      {pathname.startsWith(adminNavItem.href) && (
                        <motion.div
                          layoutId="mobileActiveBackground"
                          className={`absolute inset-0 ${adminNavItem.color} rounded-2xl -m-2`}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </AnimatePresence>
                    <div className="relative z-10 p-2">
                      <adminNavItem.icon
                        size={24}
                        className={`transition-all duration-200 ${
                          pathname.startsWith(adminNavItem.href) ? 'text-white scale-110' : 'text-gray-400'
                        }`}
                        strokeWidth={pathname.startsWith(adminNavItem.href) ? 2.5 : 2}
                      />
                    </div>
                  </div>
                  <motion.span
                    className={`text-[11px] font-bold transition-all duration-200 ${
                      pathname.startsWith(adminNavItem.href) ? adminNavItem.activeColor : 'text-gray-400'
                    }`}
                    animate={{ scale: pathname.startsWith(adminNavItem.href) ? 1.05 : 1 }}
                  >
                    {adminNavItem.name}
                  </motion.span>
                </motion.div>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute bottom-full left-0 right-0 bg-white/98 backdrop-blur-xl border-t border-gray-100 shadow-2xl max-h-[70vh] overflow-y-auto"
            >
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">
                    {activeDropdown === 'learn' ? 'Cours Tepitech' : 'Catégories d\'entraînement'}
                  </h3>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                {(activeDropdown === 'learn' ? learnCategories : trainCategories).map((category, index) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setActiveDropdown(null);
                    }}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="group relative overflow-hidden flex items-center gap-3 p-3 rounded-2xl bg-white hover:shadow-lg transition-all border-2 border-gray-100"
                    >
                      {/* Hover color-fill overlay */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${category.color}`} />
                      <div className={`relative z-10 w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-md`}>
                        <span className="text-2xl">{category.emoji}</span>
                      </div>
                      <div className="relative z-10 flex-1">
                        <p className="font-bold text-gray-800 text-sm transition-colors group-hover:text-white">{category.name}</p>
                        <p className="text-xs text-gray-500 transition-colors group-hover:text-white/90">{category.description}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Navbar pour desktop - En haut */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-lg shadow-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                transition={{ duration: 0.5 }}
                className="relative"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                  <Languages className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  EpiGlossa
                </h1>
                <p className="text-xs text-gray-500 font-medium">Apprendre en s&apos;amusant</p>
              </div>
            </Link>

            {/* Navigation items */}
            <div className="flex items-center gap-2">

              {/* eslint-disable-next-line @typescript-eslint/no-unused-vars */}
              {navItems.map(({ name, href, icon: Icon, color, activeColor, hasDropdown }) => {
                const active = pathname.startsWith(href);
                const categories = href === '/train' ? trainCategories : learnCategories;
                
                if (hasDropdown) {
                  return (
                    <div
                      key={name}
                      className="relative"
                      onMouseEnter={() => setHoveredItem(name)}
                      onMouseLeave={() => setHoveredItem(null)}
                    >
                      <Link href={href}>
                        <motion.div
                          className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                            active
                              ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Icon size={20} strokeWidth={2.5} />
                            <span>{name}</span>
                            <ChevronDown 
                              size={16} 
                              className={`transition-transform duration-300 ${
                                hoveredItem === name ? 'rotate-180' : ''
                              }`}
                            />
                          </div>

                          {active && (
                            <motion.div
                              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
                              initial={{ x: '-100%' }}
                              animate={{ x: '100%' }}
                              transition={{ 
                                repeat: Infinity, 
                                duration: 2, 
                                ease: "linear",
                                repeatDelay: 1
                              }}
                            />
                          )}
                        </motion.div>
                      </Link>

                      {/* Mega Dropdown Menu */}
                      <AnimatePresence>
                        {hoveredItem === name && (
                          <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2 }}
                            className={`absolute top-full left-1/2 -translate-x-1/2 mt-2 ${
                              name === 'Apprendre' ? 'w-[500px]' : 'w-[600px]'
                            } bg-white/98 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-gray-100 p-6 z-50`}
                          >
                            <div className="mb-4">
                              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                                {name === 'Apprendre' ? 'Choisis ton cours' : 'Choisis ta catégorie'}
                              </h3>
                              <p className="text-sm text-gray-500">
                                {name === 'Apprendre' 
                                  ? 'Cours et mini-exercices spécialisés pour Tepitech'
                                  : 'Sélectionne le type d\'exercice que tu souhaites pratiquer'
                                }
                              </p>
                            </div>
                            
                            <div className={`grid ${name === 'Apprendre' ? 'grid-cols-2' : 'grid-cols-2'} gap-3`}>
                              {categories.map((category, index) => (
                                <Link
                                  key={category.href}
                                  href={category.href}
                                >
                                  <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group relative overflow-hidden bg-white rounded-2xl p-4 border-2 border-gray-100 transition-colors cursor-pointer"
                                  >
                                    {/* Hover color-fill overlay */}
                                    <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br ${category.color}`} />

                                    <div className="relative z-10 flex items-start gap-3">
                                      <div className={`w-12 h-12 bg-gradient-to-br ${category.color} rounded-xl flex items-center justify-center shadow-md flex-shrink-0`}>
                                        <span className="text-2xl">{category.emoji}</span>
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 text-sm mb-0.5 transition-colors group-hover:text-white">
                                          {category.name}
                                        </p>
                                        <p className="text-xs text-gray-500 leading-relaxed transition-colors group-hover:text-white/90">
                                          {category.description}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500 will-change-transform z-20" />
                                  </motion.div>
                                </Link>
                              ))}
                            </div>

                            {/* Arrow pointer */}
                            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-l-2 border-t-2 border-gray-100 rotate-45" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }
                
                return (
                  <Link key={name} href={href}>
                    <motion.div
                      className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                        active
                          ? 'bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-lg'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon size={20} strokeWidth={2.5} />
                        <span>{name}</span>
                      </div>

                      {active && (
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
                          initial={{ x: '-100%' }}
                          animate={{ x: '100%' }}
                          transition={{ 
                            repeat: Infinity, 
                            duration: 2, 
                            ease: "linear",
                            repeatDelay: 1
                          }}
                        />
                      )}
                    </motion.div>
                  </Link>
                );
              })}
              
              {/* Admin nav item for desktop - only visible to admins */}
              {!roleLoading && isAdmin && (
                <Link href={adminNavItem.href}>
                  <motion.div
                    className={`relative px-6 py-3 rounded-2xl font-semibold transition-all duration-200 ${
                      pathname.startsWith(adminNavItem.href)
                        ? 'bg-gradient-to-br from-red-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <adminNavItem.icon size={20} strokeWidth={2.5} />
                      <span>{adminNavItem.name}</span>
                    </div>

                    {pathname.startsWith(adminNavItem.href) && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-2xl"
                        initial={{ x: '-100%' }}
                        animate={{ x: '100%' }}
                        transition={{ 
                          repeat: Infinity, 
                          duration: 2, 
                          ease: "linear",
                          repeatDelay: 1
                        }}
                      />
                    )}
                  </motion.div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
