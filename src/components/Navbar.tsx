'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Dumbbell, User, ChevronDown, Volume2, MessageSquare, Users, Radio, FileText, CheckSquare, BookText, Languages, Shield, Home, X, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
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
  const router = useRouter();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [activeDropdown, setActiveDropdown] = useState<'learn' | 'train' | null>(null);
  const [, setUser] = useState<unknown>(null);
  const { isAdmin, loading: roleLoading } = useUserRole();
  const dragControls = useDragControls();
  const sheetRef = useRef<HTMLDivElement>(null);
  const [sheetHeight, setSheetHeight] = useState(0);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  useEffect(() => {
    let mounted = true
    const getUser = async () => {
      try {
        const { data } = await supabase.auth.getUser()
        if (!mounted) return
        setUser(data?.user ?? null)
      } catch {
        console.error('Error getting user')
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
      } catch {
        // ignore
      }
    }
  }, [])

  const handleMobileDropdown = (type: 'learn' | 'train') => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const closeSheet = () => {
    setActiveDropdown(null);
  };

  // Gestion du long press pour navigation directe
  const handleTouchStart = useCallback((type: 'learn' | 'train', href: string) => {
    setIsLongPress(false);
    longPressTimer.current = setTimeout(() => {
      setIsLongPress(true);
      // Vibration haptique si disponible
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      router.push(href);
    }, 500);
  }, [router]);

  const handleTouchEnd = useCallback((type: 'learn' | 'train') => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    // Si ce n'était pas un long press, ouvrir le dropdown
    if (!isLongPress) {
      handleMobileDropdown(type);
    }
    setIsLongPress(false);
  }, [isLongPress]);

  const handleTouchCancel = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
    setIsLongPress(false);
  }, []);

  // Calculer la hauteur du sheet en fonction du contenu
  useEffect(() => {
    if (sheetRef.current && activeDropdown) {
      setSheetHeight(sheetRef.current.scrollHeight);
    }
  }, [activeDropdown]);

  // Fermer le sheet quand on navigue
  useEffect(() => {
    setActiveDropdown(null);
  }, [pathname]);

  const mobileNavItems = [
    { 
      name: 'Accueil', 
      href: '/', 
      icon: Home, 
      gradient: 'from-gray-500 to-gray-600',
      activeGradient: 'from-blue-500 to-purple-500',
    },
    { 
      name: 'Apprendre', 
      href: '/learn', 
      icon: BookOpen, 
      gradient: 'from-purple-400 to-pink-400',
      activeGradient: 'from-purple-500 to-pink-500',
      hasDropdown: true,
      dropdownType: 'learn' as const,
    },
    { 
      name: "S'entraîner", 
      href: '/train', 
      icon: Dumbbell, 
      gradient: 'from-blue-400 to-cyan-400',
      activeGradient: 'from-blue-500 to-cyan-500',
      hasDropdown: true,
      dropdownType: 'train' as const,
    },
    { 
      name: 'Profil', 
      href: '/profile', 
      icon: User, 
      gradient: 'from-yellow-400 to-orange-400',
      activeGradient: 'from-yellow-500 to-orange-500',
    },
  ];

  return (
    <>
      {/* Overlay sombre pour le bottom sheet */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={closeSheet}
          />
        )}
      </AnimatePresence>

      {/* Bottom Sheet Premium pour les catégories */}
      <AnimatePresence>
        {activeDropdown && (
          <motion.div
            ref={sheetRef}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            drag="y"
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                closeSheet();
              }
            }}
            className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-[32px] shadow-2xl z-50 max-h-[85vh] overflow-hidden"
            style={{ touchAction: 'none' }}
          >
            {/* Handle de drag */}
            <div 
              className="flex justify-center pt-3 pb-2 cursor-grab active:cursor-grabbing"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="w-10 h-1.5 bg-gray-300 rounded-full" />
            </div>

            {/* Header du sheet */}
            <div className="px-5 pb-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${
                    activeDropdown === 'learn' 
                      ? 'from-purple-500 to-pink-500' 
                      : 'from-blue-500 to-cyan-500'
                  } rounded-2xl flex items-center justify-center shadow-lg`}>
                    {activeDropdown === 'learn' ? (
                      <BookOpen className="w-6 h-6 text-white" />
                    ) : (
                      <Dumbbell className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {activeDropdown === 'learn' ? 'Apprendre' : "S'entraîner"}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {activeDropdown === 'learn' 
                        ? 'Cours pour le Tepitech' 
                        : 'Exercices pratiques'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Bouton Voir tout */}
                  <Link
                    href={activeDropdown === 'learn' ? '/learn' : '/train'}
                    onClick={closeSheet}
                    className={`px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r ${
                      activeDropdown === 'learn' 
                        ? 'from-purple-500 to-pink-500' 
                        : 'from-blue-500 to-cyan-500'
                    } active:opacity-80 transition-opacity`}
                  >
                    Voir tout
                  </Link>
                  <button
                    onClick={closeSheet}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center active:bg-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            {/* Liste des catégories */}
            <div 
              className="overflow-y-auto overscroll-contain px-4 pt-4 pb-24 scrollbar-hide" 
              style={{ 
                maxHeight: 'calc(85vh - 100px)',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <div className="space-y-2">
                {(activeDropdown === 'learn' ? learnCategories : trainCategories).map((category, index) => (
                  <Link
                    key={category.href}
                    href={category.href}
                    onClick={closeSheet}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.04, duration: 0.3 }}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex items-center gap-4 p-4 rounded-2xl bg-gray-50 active:bg-gray-100 transition-all"
                    >
                      {/* Icône avec gradient */}
                      <div className={`w-14 h-14 bg-gradient-to-br ${category.color} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}>
                        <span className="text-2xl">{category.emoji}</span>
                      </div>
                      
                      {/* Contenu */}
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 text-base">{category.name}</p>
                        <p className="text-sm text-gray-500 mt-0.5">{category.description}</p>
                      </div>
                      
                      {/* Chevron */}
                      <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar Mobile Premium - Style iOS/Android moderne */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Fond avec effet glassmorphism */}
        <div className="absolute inset-0 bg-white/90 backdrop-blur-xl border-t border-gray-200/50" />
        
        <div className="relative safe-area-inset-bottom">
          <div className="flex items-center justify-around px-2 py-2">
            {mobileNavItems.map((item) => {
              const active = item.href === '/' 
                ? pathname === '/' 
                : pathname.startsWith(item.href);
              const isSheetOpen = item.hasDropdown && activeDropdown === item.dropdownType;
              
              if (item.hasDropdown) {
                return (
                  <button
                    key={item.name}
                    onTouchStart={() => handleTouchStart(item.dropdownType!, item.href)}
                    onTouchEnd={() => handleTouchEnd(item.dropdownType!)}
                    onTouchCancel={handleTouchCancel}
                    onClick={() => handleMobileDropdown(item.dropdownType!)}
                    className="flex-1 flex flex-col items-center py-1 relative select-none"
                  >
                    {/* Indicateur de sélection */}
                    <AnimatePresence>
                      {(active || isSheetOpen) && (
                        <motion.div
                          layoutId="mobileTabIndicator"
                          className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r ${item.activeGradient}`}
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                        />
                      )}
                    </AnimatePresence>
                    
                    {/* Icône avec animation */}
                    <motion.div
                      animate={{ 
                        scale: active || isSheetOpen ? 1.1 : 1,
                        y: active || isSheetOpen ? -2 : 0
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                        active || isSheetOpen
                          ? `bg-gradient-to-br ${item.activeGradient} shadow-lg`
                          : 'bg-transparent'
                      }`}
                    >
                      <item.icon
                        size={24}
                        className={`transition-colors duration-200 ${
                          active || isSheetOpen ? 'text-white' : 'text-gray-400'
                        }`}
                        strokeWidth={active || isSheetOpen ? 2.5 : 2}
                      />
                    </motion.div>
                    
                    {/* Label */}
                    <motion.span
                      animate={{ 
                        opacity: active || isSheetOpen ? 1 : 0.6,
                        fontWeight: active || isSheetOpen ? 600 : 500
                      }}
                      className={`text-[11px] mt-1 transition-colors duration-200 ${
                        active || isSheetOpen ? 'text-gray-900' : 'text-gray-500'
                      }`}
                    >
                      {item.name}
                    </motion.span>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex-1 flex flex-col items-center py-1 relative"
                >
                  {/* Indicateur de sélection */}
                  <AnimatePresence>
                    {active && (
                      <motion.div
                        layoutId="mobileTabIndicator"
                        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r ${item.activeGradient}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Icône avec animation */}
                  <motion.div
                    animate={{ 
                      scale: active ? 1.1 : 1,
                      y: active ? -2 : 0
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                      active
                        ? `bg-gradient-to-br ${item.activeGradient} shadow-lg`
                        : 'bg-transparent'
                    }`}
                  >
                    <item.icon
                      size={24}
                      className={`transition-colors duration-200 ${
                        active ? 'text-white' : 'text-gray-400'
                      }`}
                      strokeWidth={active ? 2.5 : 2}
                    />
                  </motion.div>
                  
                  {/* Label */}
                  <motion.span
                    animate={{ 
                      opacity: active ? 1 : 0.6,
                      fontWeight: active ? 600 : 500
                    }}
                    className={`text-[11px] mt-1 transition-colors duration-200 ${
                      active ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {item.name}
                  </motion.span>
                </Link>
              );
            })}
            
            {/* Admin - visible uniquement pour les admins */}
            {!roleLoading && isAdmin && (
              <Link
                href="/admin"
                className="flex-1 flex flex-col items-center py-1 relative"
              >
                <AnimatePresence>
                  {pathname.startsWith('/admin') && (
                    <motion.div
                      layoutId="mobileTabIndicator"
                      className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-gradient-to-r from-red-500 to-pink-500"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    />
                  )}
                </AnimatePresence>
                
                <motion.div
                  animate={{ 
                    scale: pathname.startsWith('/admin') ? 1.1 : 1,
                    y: pathname.startsWith('/admin') ? -2 : 0
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200 ${
                    pathname.startsWith('/admin')
                      ? 'bg-gradient-to-br from-red-500 to-pink-500 shadow-lg'
                      : 'bg-transparent'
                  }`}
                >
                  <Shield
                    size={24}
                    className={`transition-colors duration-200 ${
                      pathname.startsWith('/admin') ? 'text-white' : 'text-gray-400'
                    }`}
                    strokeWidth={pathname.startsWith('/admin') ? 2.5 : 2}
                  />
                </motion.div>
                
                <motion.span
                  animate={{ 
                    opacity: pathname.startsWith('/admin') ? 1 : 0.6,
                    fontWeight: pathname.startsWith('/admin') ? 600 : 500
                  }}
                  className={`text-[11px] mt-1 transition-colors duration-200 ${
                    pathname.startsWith('/admin') ? 'text-gray-900' : 'text-gray-500'
                  }`}
                >
                  Admin
                </motion.span>
              </Link>
            )}
          </div>
        </div>
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
