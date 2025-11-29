import { GrammarLesson } from '@/types/lesson';

export const grammarLessons: GrammarLesson[] = [
  {
    id: 1,
    title: 'Les Articles (a, an, the)',
    description: 'Maîtrise les articles définis et indéfinis',
    theme: 'Grammaire de base',
    xp: 60,
    duration: 8,
    locked: false,
    completed: false,
    status: 'available',
    rules: [
      {
        title: 'Article indéfini A',
        explanation: 'Utilisé devant un nom singulier commençant par une consonne',
        examples: [
          {
            english: 'I need a pen.',
            french: 'J\'ai besoin d\'un stylo.',
            correct: true
          },
          {
            english: 'She is a doctor.',
            french: 'Elle est médecin.',
            correct: true
          },
          {
            english: 'We have a meeting at 3 PM.',
            french: 'Nous avons une réunion à 15h.',
            correct: true
          }
        ],
        tips: '💡 "A" s\'utilise pour parler d\'une chose non spécifique parmi d\'autres.'
      },
      {
        title: 'Article indéfini AN',
        explanation: 'Utilisé devant un nom singulier commençant par une voyelle (a, e, i, o, u)',
        examples: [
          {
            english: 'He is an engineer.',
            french: 'Il est ingénieur.',
            correct: true
          },
          {
            english: 'I have an appointment.',
            french: 'J\'ai un rendez-vous.',
            correct: true
          },
          {
            english: 'This is an important document.',
            french: 'C\'est un document important.',
            correct: true
          }
        ],
        tips: '⚠️ Attention au son, pas à l\'orthographe ! On dit "an hour" (la lettre H est muette).'
      },
      {
        title: 'Article défini THE',
        explanation: 'Utilisé pour parler de quelque chose de spécifique ou déjà mentionné',
        examples: [
          {
            english: 'The manager will arrive soon.',
            french: 'Le directeur arrivera bientôt.',
            correct: true
          },
          {
            english: 'Please submit the report by Friday.',
            french: 'Veuillez soumettre le rapport d\'ici vendredi.',
            correct: true
          },
          {
            english: 'The meeting has been postponed.',
            french: 'La réunion a été reportée.',
            correct: true
          }
        ],
  tips: '🎯 Au TEPITECH, "the" est souvent utilisé pour parler d\'un élément précis du contexte professionnel.'
      },
      {
        title: 'Pas d\'article (Ø)',
        explanation: 'Certains cas ne nécessitent pas d\'article',
        examples: [
          {
            english: 'We need Ø employees with experience.',
            french: 'Nous avons besoin d\'employés avec de l\'expérience.',
            correct: true
          },
          {
            english: 'Ø Breakfast is served at 7 AM.',
            french: 'Le petit-déjeuner est servi à 7h.',
            correct: true
          },
          {
            english: 'She speaks Ø English fluently.',
            french: 'Elle parle anglais couramment.',
            correct: true
          }
        ],
        tips: '📌 Pas d\'article devant les noms au pluriel généraux, les langues, les repas.'
      }
    ],
    exercises: [
      {
        id: 'g1-ex1',
        type: 'multiple-choice',
        question: '_____ meeting will start at 10 AM.',
        options: ['A', 'An', 'The', 'Ø (pas d\'article)'],
        correctAnswer: 'The',
        explanation: 'On parle d\'une réunion spécifique, donc on utilise "the".'
      },
      {
        id: 'g1-ex2',
        type: 'multiple-choice',
        question: 'He is _____ excellent employee.',
        options: ['a', 'an', 'the', 'Ø (pas d\'article)'],
        correctAnswer: 'an',
        explanation: '"Excellent" commence par une voyelle (son "e"), donc on utilise "an".'
      },
      {
        id: 'g1-ex3',
        type: 'multiple-choice',
        question: 'I need _____ computer for this task.',
        options: ['a', 'an', 'the', 'Ø (pas d\'article)'],
        correctAnswer: 'a',
        explanation: 'On parle d\'un ordinateur non spécifique, et "computer" commence par une consonne.'
      },
      {
        id: 'g1-ex4',
        type: 'multiple-choice',
        question: 'Please send me _____ files you mentioned.',
        options: ['a', 'an', 'the', 'Ø (pas d\'article)'],
        correctAnswer: 'the',
        explanation: 'Les fichiers sont spécifiques (ceux que vous avez mentionnés).'
      },
      {
        id: 'g1-ex5',
        type: 'multiple-choice',
        question: 'We need _____ new marketing strategy.',
        options: ['a', 'an', 'the', 'Ø (pas d\'article)'],
        correctAnswer: 'a',
        explanation: 'On parle d\'une stratégie non spécifique, "new" commence par une consonne.'
      }
    ]
  },
  {
    id: 2,
    title: 'Les Prépositions de Temps',
    description: 'In, on, at - Maîtrise les prépositions temporelles',
    theme: 'Grammaire de base',
    xp: 70,
    duration: 10,
    locked: false,
    completed: false,
    status: 'available',
    rules: [
      {
        title: 'Préposition IN',
        explanation: 'Utilisé pour les mois, années, saisons, parties de la journée',
        examples: [
          {
            english: 'The conference is in June.',
            french: 'La conférence est en juin.',
            correct: true
          },
          {
            english: 'We started this project in 2023.',
            french: 'Nous avons commencé ce projet en 2023.',
            correct: true
          },
          {
            english: 'The office is closed in the afternoon.',
            french: 'Le bureau est fermé l\'après-midi.',
            correct: true
          }
        ],
        tips: '📅 IN = périodes longues (mois, années, saisons, parties du jour)'
      },
      {
        title: 'Préposition ON',
        explanation: 'Utilisé pour les jours et les dates',
        examples: [
          {
            english: 'The meeting is on Monday.',
            french: 'La réunion est lundi.',
            correct: true
          },
          {
            english: 'The deadline is on March 15th.',
            french: 'La date limite est le 15 mars.',
            correct: true
          },
          {
            english: 'We are closed on weekends.',
            french: 'Nous sommes fermés le week-end.',
            correct: true
          }
        ],
        tips: '📆 ON = jours spécifiques et dates précises'
      },
      {
        title: 'Préposition AT',
        explanation: 'Utilisé pour les heures précises et certains moments',
        examples: [
          {
            english: 'The presentation starts at 9 AM.',
            french: 'La présentation commence à 9h.',
            correct: true
          },
          {
            english: 'We have lunch at noon.',
            french: 'Nous déjeunons à midi.',
            correct: true
          },
          {
            english: 'The store opens at midnight.',
            french: 'Le magasin ouvre à minuit.',
            correct: true
          }
        ],
        tips: '🕐 AT = heures précises et moments spécifiques (noon, midnight, night)'
      }
    ],
    exercises: [
      {
        id: 'g2-ex1',
        type: 'multiple-choice',
        question: 'The training session starts _____ 2 PM.',
        options: ['in', 'on', 'at'],
        correctAnswer: 'at',
        explanation: 'On utilise "at" pour une heure précise.'
      },
      {
        id: 'g2-ex2',
        type: 'multiple-choice',
        question: 'We will launch the product _____ September.',
        options: ['in', 'on', 'at'],
        correctAnswer: 'in',
        explanation: 'On utilise "in" pour un mois.'
      },
      {
        id: 'g2-ex3',
        type: 'multiple-choice',
        question: 'The office is closed _____ Sunday.',
        options: ['in', 'on', 'at'],
        correctAnswer: 'on',
        explanation: 'On utilise "on" pour un jour spécifique.'
      },
      {
        id: 'g2-ex4',
        type: 'multiple-choice',
        question: 'I arrived _____ the morning.',
        options: ['in', 'on', 'at'],
        correctAnswer: 'in',
        explanation: 'On utilise "in" pour une partie de la journée.'
      },
      {
        id: 'g2-ex5',
        type: 'multiple-choice',
        question: 'The company was founded _____ 1995.',
        options: ['in', 'on', 'at'],
        correctAnswer: 'in',
        explanation: 'On utilise "in" pour une année.'
      }
    ]
  },
  {
    id: 3,
    title: 'Les Comparatifs et Superlatifs',
    description: 'Compare et classe avec -er/-est, more/most',
    theme: 'Grammaire intermédiaire',
    xp: 80,
    duration: 12,
    locked: false,
    completed: false,
    status: 'available',
    rules: [
      {
        title: 'Comparatif avec -er',
        explanation: 'Adjectifs courts (1-2 syllabes) + -er + than',
        examples: [
          {
            english: 'This printer is faster than the old one.',
            french: 'Cette imprimante est plus rapide que l\'ancienne.',
            correct: true
          },
          {
            english: 'The new office is bigger than before.',
            french: 'Le nouveau bureau est plus grand qu\'avant.',
            correct: true
          },
          {
            english: 'This solution is cheaper and easier.',
            french: 'Cette solution est moins chère et plus facile.',
            correct: true
          }
        ],
        tips: '⚡ Adjectifs courts : fast → faster, cheap → cheaper, easy → easier'
      },
      {
        title: 'Comparatif avec MORE',
        explanation: 'Adjectifs longs (3+ syllabes) : more + adjectif + than',
        examples: [
          {
            english: 'This method is more efficient than the previous one.',
            french: 'Cette méthode est plus efficace que la précédente.',
            correct: true
          },
          {
            english: 'The project is more complex than expected.',
            french: 'Le projet est plus complexe que prévu.',
            correct: true
          },
          {
            english: 'Digital marketing is more effective nowadays.',
            french: 'Le marketing digital est plus efficace de nos jours.',
            correct: true
          }
        ],
        tips: '📊 Adjectifs longs : efficient → more efficient, expensive → more expensive'
      },
      {
        title: 'Superlatif avec -est',
        explanation: 'THE + adjectif court + -est',
        examples: [
          {
            english: 'This is the fastest computer in the office.',
            french: 'C\'est l\'ordinateur le plus rapide du bureau.',
            correct: true
          },
          {
            english: 'She is the best candidate for this position.',
            french: 'Elle est la meilleure candidate pour ce poste.',
            correct: true
          },
          {
            english: 'This is the cheapest option available.',
            french: 'C\'est l\'option la moins chère disponible.',
            correct: true
          }
        ],
        tips: '🏆 Superlatifs courts : fast → the fastest, cheap → the cheapest'
      },
      {
        title: 'Superlatif avec MOST',
        explanation: 'THE + most + adjectif long',
        examples: [
          {
            english: 'This is the most important project of the year.',
            french: 'C\'est le projet le plus important de l\'année.',
            correct: true
          },
          {
            english: 'He is the most experienced employee.',
            french: 'Il est l\'employé le plus expérimenté.',
            correct: true
          },
          {
            english: 'This is the most efficient solution.',
            french: 'C\'est la solution la plus efficace.',
            correct: true
          }
        ],
        tips: '⭐ Superlatifs longs : important → the most important, efficient → the most efficient'
      }
    ],
    exercises: [
      {
        id: 'g3-ex1',
        type: 'multiple-choice',
        question: 'This laptop is _____ than my old one.',
        options: ['faster', 'more fast', 'fastest', 'most fast'],
        correctAnswer: 'faster',
        explanation: '"Fast" est un adjectif court, donc on ajoute -er pour le comparatif.'
      },
      {
        id: 'g3-ex2',
        type: 'multiple-choice',
        question: 'This is the _____ expensive option.',
        options: ['more', 'most', 'much', 'many'],
        correctAnswer: 'most',
        explanation: '"Expensive" est long, donc on utilise "most" pour le superlatif.'
      },
      {
        id: 'g3-ex3',
        type: 'multiple-choice',
        question: 'The new system is _____ efficient.',
        options: ['more', 'most', 'much', '-er'],
        correctAnswer: 'more',
        explanation: '"Efficient" est un adjectif long, donc on utilise "more" au comparatif.'
      },
      {
        id: 'g3-ex4',
        type: 'multiple-choice',
        question: 'This is the _____ building in the city.',
        options: ['taller', 'more tall', 'tallest', 'most tall'],
        correctAnswer: 'tallest',
        explanation: '"Tall" est court, donc on ajoute -est pour le superlatif.'
      },
      {
        id: 'g3-ex5',
        type: 'multiple-choice',
        question: 'Online shopping is _____ convenient than in-store.',
        options: ['more', 'most', 'much', '-er'],
        correctAnswer: 'more',
        explanation: '"Convenient" est long, donc on utilise "more" au comparatif.'
      }
    ]
  },
  {
    id: 4,
    title: 'Les Pronoms Relatifs',
    description: 'Who, which, that, where - Lie tes phrases',
    theme: 'Grammaire intermédiaire',
    xp: 75,
    duration: 10,
    locked: false,
    completed: false,
    status: 'available',
    rules: [
      {
        title: 'WHO - Pour les personnes',
        explanation: 'Utilisé pour parler des personnes',
        examples: [
          {
            english: 'The employee who finished the project is here.',
            french: 'L\'employé qui a terminé le projet est là.',
            correct: true
          },
          {
            english: 'I need someone who speaks Spanish.',
            french: 'J\'ai besoin de quelqu\'un qui parle espagnol.',
            correct: true
          },
          {
            english: 'The manager who hired me has retired.',
            french: 'Le manager qui m\'a embauché a pris sa retraite.',
            correct: true
          }
        ],
        tips: '👤 WHO = toujours pour les personnes'
      },
      {
        title: 'WHICH - Pour les choses',
        explanation: 'Utilisé pour parler des objets, animaux, idées',
        examples: [
          {
            english: 'The report which I sent you contains errors.',
            french: 'Le rapport que je vous ai envoyé contient des erreurs.',
            correct: true
          },
          {
            english: 'This is the software which we use daily.',
            french: 'C\'est le logiciel que nous utilisons quotidiennement.',
            correct: true
          },
          {
            english: 'The project, which starts next week, is important.',
            french: 'Le projet, qui commence la semaine prochaine, est important.',
            correct: true
          }
        ],
        tips: '📦 WHICH = pour les choses, objets, concepts'
      },
      {
        title: 'THAT - Universel',
        explanation: 'Peut remplacer WHO ou WHICH dans certains cas',
        examples: [
          {
            english: 'The person that called is waiting.',
            french: 'La personne qui a appelé attend.',
            correct: true
          },
          {
            english: 'The document that you need is on my desk.',
            french: 'Le document dont vous avez besoin est sur mon bureau.',
            correct: true
          },
          {
            english: 'This is the best offer that we have.',
            french: 'C\'est la meilleure offre que nous ayons.',
            correct: true
          }
        ],
        tips: '🔄 THAT = peut remplacer WHO/WHICH, souvent dans un contexte formel'
      },
      {
        title: 'WHERE - Pour les lieux',
        explanation: 'Utilisé pour parler de lieux',
        examples: [
          {
            english: 'This is the office where I work.',
            french: 'C\'est le bureau où je travaille.',
            correct: true
          },
          {
            english: 'The city where the conference takes place is beautiful.',
            french: 'La ville où se déroule la conférence est belle.',
            correct: true
          },
          {
            english: 'The building where our meeting is has parking.',
            french: 'Le bâtiment où se tient notre réunion a un parking.',
            correct: true
          }
        ],
        tips: '📍 WHERE = pour les lieux et endroits'
      }
    ],
    exercises: [
      {
        id: 'g4-ex1',
        type: 'multiple-choice',
        question: 'The colleague _____ sits next to me is very helpful.',
        options: ['who', 'which', 'where', 'what'],
        correctAnswer: 'who',
        explanation: 'On parle d\'une personne (collègue), donc on utilise "who".'
      },
      {
        id: 'g4-ex2',
        type: 'multiple-choice',
        question: 'This is the computer _____ I use for presentations.',
        options: ['who', 'which', 'where', 'what'],
        correctAnswer: 'which',
        explanation: 'On parle d\'un objet (ordinateur), donc on utilise "which".'
      },
      {
        id: 'g4-ex3',
        type: 'multiple-choice',
        question: 'The room _____ the meeting takes place is on the 3rd floor.',
        options: ['who', 'which', 'where', 'what'],
        correctAnswer: 'where',
        explanation: 'On parle d\'un lieu (salle), donc on utilise "where".'
      },
      {
        id: 'g4-ex4',
        type: 'multiple-choice',
        question: 'The project _____ we discussed yesterday needs approval.',
        options: ['who', 'which', 'where', 'what'],
        correctAnswer: 'which',
        explanation: 'On parle d\'une chose (projet), donc on utilise "which".'
      },
      {
        id: 'g4-ex5',
        type: 'multiple-choice',
        question: 'I know someone _____ can help you.',
        options: ['who', 'which', 'where', 'what'],
        correctAnswer: 'who',
        explanation: 'On parle d\'une personne (quelqu\'un), donc on utilise "who".'
      }
    ]
  },
  {
    id: 5,
    title: 'Les Modaux',
    description: 'Can, must, should, may - Exprime possibilité et obligation',
    theme: 'Grammaire avancée',
    xp: 90,
    duration: 15,
    locked: false,
    completed: false,
    status: 'available',
    rules: [
      {
        title: 'CAN / CAN\'T - Capacité',
        explanation: 'Exprimer la capacité ou l\'incapacité',
        examples: [
          {
            english: 'I can speak three languages.',
            french: 'Je peux parler trois langues.',
            correct: true
          },
          {
            english: 'She can\'t attend the meeting today.',
            french: 'Elle ne peut pas assister à la réunion aujourd\'hui.',
            correct: true
          },
          {
            english: 'Can you send me the file?',
            french: 'Peux-tu m\'envoyer le fichier ?',
            correct: true
          }
        ],
        tips: '💪 CAN = capacité, possibilité, permission informelle'
      },
      {
        title: 'MUST / MUST NOT - Obligation',
        explanation: 'Exprimer une obligation forte ou interdiction',
        examples: [
          {
            english: 'All employees must wear ID badges.',
            french: 'Tous les employés doivent porter des badges.',
            correct: true
          },
          {
            english: 'You must submit the report by Friday.',
            french: 'Vous devez remettre le rapport d\'ici vendredi.',
            correct: true
          },
          {
            english: 'Visitors must not enter without permission.',
            french: 'Les visiteurs ne doivent pas entrer sans permission.',
            correct: true
          }
        ],
        tips: '⚠️ MUST = obligation forte, souvent dans les règlements'
      },
      {
        title: 'SHOULD / SHOULDN\'T - Conseil',
        explanation: 'Donner un conseil ou une recommandation',
        examples: [
          {
            english: 'You should arrive 10 minutes early.',
            french: 'Tu devrais arriver 10 minutes en avance.',
            correct: true
          },
          {
            english: 'We should review the contract carefully.',
            french: 'Nous devrions examiner le contrat attentivement.',
            correct: true
          },
          {
            english: 'They shouldn\'t make that decision hastily.',
            french: 'Ils ne devraient pas prendre cette décision hâtivement.',
            correct: true
          }
        ],
        tips: '💡 SHOULD = conseil, recommandation (moins fort que MUST)'
      },
      {
        title: 'MAY / MIGHT - Possibilité',
        explanation: 'Exprimer une possibilité ou demander poliment',
        examples: [
          {
            english: 'The package may arrive tomorrow.',
            french: 'Le colis pourrait arriver demain.',
            correct: true
          },
          {
            english: 'May I help you?',
            french: 'Puis-je vous aider ?',
            correct: true
          },
          {
            english: 'It might rain this afternoon.',
            french: 'Il pourrait pleuvoir cet après-midi.',
            correct: true
          }
        ],
        tips: '🤔 MAY/MIGHT = possibilité, permission formelle'
      }
    ],
    exercises: [
      {
        id: 'g5-ex1',
        type: 'multiple-choice',
        question: 'All employees _____ attend the safety training.',
        options: ['can', 'must', 'should', 'might'],
        correctAnswer: 'must',
        explanation: '"Must" exprime une obligation forte - c\'est obligatoire.'
      },
      {
        id: 'g5-ex2',
        type: 'multiple-choice',
        question: '_____ you help me with this report?',
        options: ['Must', 'Should', 'Can', 'May'],
        correctAnswer: 'Can',
        explanation: '"Can" est utilisé pour demander quelque chose de façon informelle.'
      },
      {
        id: 'g5-ex3',
        type: 'multiple-choice',
        question: 'You _____ check your email regularly.',
        options: ['can', 'must', 'should', 'might'],
        correctAnswer: 'should',
        explanation: '"Should" donne un conseil - c\'est recommandé mais pas obligatoire.'
      },
      {
        id: 'g5-ex4',
        type: 'multiple-choice',
        question: 'The meeting _____ be postponed due to bad weather.',
        options: ['can', 'must', 'should', 'might'],
        correctAnswer: 'might',
        explanation: '"Might" exprime une possibilité incertaine.'
      },
      {
        id: 'g5-ex5',
        type: 'multiple-choice',
        question: 'Visitors _____ not take photos in this area.',
        options: ['can', 'must', 'should', 'might'],
        correctAnswer: 'must',
        explanation: '"Must not" exprime une interdiction forte.'
      }
    ]
  }
];
