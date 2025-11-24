import { ConjugationLesson } from '@/types/lesson';

export const conjugationLessons: ConjugationLesson[] = [
  {
    id: 1,
    title: 'Le Présent Simple',
    description: 'La base de la conjugaison anglaise',
    theme: 'Temps de base',
    xp: 80,
    duration: 12,
    locked: false,
    completed: false,
    status: 'available',
    tense: 'Present Simple',
    rules: [
      {
        title: 'Formation affirmative',
        explanation: 'Sujet + verbe (ajouter -s/-es à la 3e personne du singulier)',
        examples: [
          {
            english: 'I work in an office.',
            french: 'Je travaille dans un bureau.',
            correct: true
          },
          {
            english: 'She works from home.',
            french: 'Elle travaille de chez elle.',
            correct: true
          },
          {
            english: 'The company provides training.',
            french: 'L\'entreprise fournit de la formation.',
            correct: true
          }
        ],
        tips: '✅ He/She/It → ajoute -s ou -es (work → works, go → goes)'
      },
      {
        title: 'Formation négative',
        explanation: 'Sujet + do/does + not + verbe',
        examples: [
          {
            english: 'I don\'t understand the instructions.',
            french: 'Je ne comprends pas les instructions.',
            correct: true
          },
          {
            english: 'He doesn\'t work on weekends.',
            french: 'Il ne travaille pas le week-end.',
            correct: true
          },
          {
            english: 'They don\'t offer remote positions.',
            french: 'Ils n\'offrent pas de postes en télétravail.',
            correct: true
          }
        ],
        tips: '❌ I/You/We/They → don\'t | He/She/It → doesn\'t (pas de -s au verbe !)'
      },
      {
        title: 'Formation interrogative',
        explanation: 'Do/Does + sujet + verbe ?',
        examples: [
          {
            english: 'Do you work full-time?',
            french: 'Travailles-tu à temps plein ?',
            correct: true
          },
          {
            english: 'Does she speak English?',
            french: 'Parle-t-elle anglais ?',
            correct: true
          },
          {
            english: 'Do they accept credit cards?',
            french: 'Acceptent-ils les cartes de crédit ?',
            correct: true
          }
        ],
        tips: '❓ I/You/We/They → Do | He/She/It → Does (pas de -s au verbe !)'
      },
      {
        title: 'Utilisations principales',
        explanation: 'Habitudes, vérités générales, faits',
        examples: [
          {
            english: 'The store opens at 9 AM every day. (habitude)',
            french: 'Le magasin ouvre à 9h tous les jours.',
            correct: true
          },
          {
            english: 'Water boils at 100°C. (vérité générale)',
            french: 'L\'eau bout à 100°C.',
            correct: true
          },
          {
            english: 'I work for a tech company. (fait)',
            french: 'Je travaille pour une entreprise technologique.',
            correct: true
          }
        ],
        tips: '🎯 Présent simple = actions habituelles, faits, vérités générales'
      }
    ],
    exercises: [
      {
        id: 'c1-ex1',
        type: 'multiple-choice',
        question: 'She _____ to work by train.',
        options: ['go', 'goes', 'going', 'to go'],
        correctAnswer: 'goes',
        explanation: '3e personne du singulier (She) → verbe + s'
      },
      {
        id: 'c1-ex2',
        type: 'multiple-choice',
        question: 'They _____ work on Sundays.',
        options: ['doesn\'t', 'don\'t', 'not', 'aren\'t'],
        correctAnswer: 'don\'t',
        explanation: 'They → don\'t (forme négative pluriel)'
      },
      {
        id: 'c1-ex3',
        type: 'multiple-choice',
        question: '_____ you speak Spanish?',
        options: ['Do', 'Does', 'Are', 'Is'],
        correctAnswer: 'Do',
        explanation: 'You → Do (forme interrogative)'
      },
      {
        id: 'c1-ex4',
        type: 'multiple-choice',
        question: 'The meeting _____ at 10 AM.',
        options: ['start', 'starts', 'starting', 'to start'],
        correctAnswer: 'starts',
        explanation: '3e personne du singulier (The meeting) → verbe + s'
      },
      {
        id: 'c1-ex5',
        type: 'multiple-choice',
        question: 'I _____ understand this document.',
        options: ['doesn\'t', 'don\'t', 'not', 'am not'],
        correctAnswer: 'don\'t',
        explanation: 'I → don\'t (forme négative)'
      }
    ]
  },
  {
    id: 2,
    title: 'Le Présent Continu',
    description: 'Actions en cours maintenant',
    theme: 'Temps de base',
    xp: 85,
    duration: 12,
    locked: false,
    completed: false,
    status: 'available',
    tense: 'Present Continuous',
    rules: [
      {
        title: 'Formation',
        explanation: 'Sujet + am/is/are + verbe-ing',
        examples: [
          {
            english: 'I am working on the report right now.',
            french: 'Je travaille sur le rapport en ce moment.',
            correct: true
          },
          {
            english: 'She is meeting with clients today.',
            french: 'Elle rencontre des clients aujourd\'hui.',
            correct: true
          },
          {
            english: 'They are preparing the presentation.',
            french: 'Ils préparent la présentation.',
            correct: true
          }
        ],
        tips: '⏱️ am/is/are + verbe-ing (I am working, He is working, They are working)'
      },
      {
        title: 'Formation négative',
        explanation: 'Sujet + am/is/are + not + verbe-ing',
        examples: [
          {
            english: 'I am not attending the meeting.',
            french: 'Je ne participe pas à la réunion.',
            correct: true
          },
          {
            english: 'He is not working today.',
            french: 'Il ne travaille pas aujourd\'hui.',
            correct: true
          },
          {
            english: 'We are not hiring at the moment.',
            french: 'Nous n\'embauchons pas en ce moment.',
            correct: true
          }
        ],
        tips: '❌ I\'m not, He isn\'t/He\'s not, They aren\'t/They\'re not'
      },
      {
        title: 'Formation interrogative',
        explanation: 'Am/Is/Are + sujet + verbe-ing ?',
        examples: [
          {
            english: 'Are you working on the project?',
            french: 'Travailles-tu sur le projet ?',
            correct: true
          },
          {
            english: 'Is she coming to the meeting?',
            french: 'Vient-elle à la réunion ?',
            correct: true
          },
          {
            english: 'Are they hiring new employees?',
            french: 'Embauchent-ils de nouveaux employés ?',
            correct: true
          }
        ],
        tips: '❓ Am I...? Is he/she...? Are you/we/they...?'
      },
      {
        title: 'Utilisations',
        explanation: 'Action en cours, temporaire, futur proche planifié',
        examples: [
          {
            english: 'I am typing an email now. (en cours)',
            french: 'Je tape un email maintenant.',
            correct: true
          },
          {
            english: 'She is staying at a hotel this week. (temporaire)',
            french: 'Elle séjourne dans un hôtel cette semaine.',
            correct: true
          },
          {
            english: 'We are launching the product next month. (futur planifié)',
            french: 'Nous lançons le produit le mois prochain.',
            correct: true
          }
        ],
        tips: '🎯 Présent continu = action en cours MAINTENANT ou situation temporaire'
      }
    ],
    exercises: [
      {
        id: 'c2-ex1',
        type: 'multiple-choice',
        question: 'I _____ on a new project this week.',
        options: ['work', 'working', 'am working', 'works'],
        correctAnswer: 'am working',
        explanation: 'Présent continu : I am + verbe-ing'
      },
      {
        id: 'c2-ex2',
        type: 'multiple-choice',
        question: '_____ she attending the conference?',
        options: ['Does', 'Is', 'Do', 'Are'],
        correctAnswer: 'Is',
        explanation: 'Question au présent continu : Is + she + verbe-ing'
      },
      {
        id: 'c2-ex3',
        type: 'multiple-choice',
        question: 'They _____ not hiring right now.',
        options: ['is', 'are', 'do', 'does'],
        correctAnswer: 'are',
        explanation: 'Négation au présent continu : They are not'
      },
      {
        id: 'c2-ex4',
        type: 'multiple-choice',
        question: 'He _____ with a client at the moment.',
        options: ['meet', 'meets', 'is meeting', 'meeting'],
        correctAnswer: 'is meeting',
        explanation: 'Présent continu : He is + verbe-ing'
      },
      {
        id: 'c2-ex5',
        type: 'multiple-choice',
        question: 'What _____ you doing?',
        options: ['is', 'are', 'do', 'does'],
        correctAnswer: 'are',
        explanation: 'Question au présent continu : are + you + doing'
      }
    ]
  },
  {
    id: 3,
    title: 'Le Passé Simple',
    description: 'Actions terminées dans le passé',
    theme: 'Temps du passé',
    xp: 90,
    duration: 15,
    locked: false,
    completed: false,
    status: 'available',
    tense: 'Past Simple',
    rules: [
      {
        title: 'Verbes réguliers (+ed)',
        explanation: 'Verbe + -ed pour tous les sujets',
        examples: [
          {
            english: 'I worked late yesterday.',
            french: 'J\'ai travaillé tard hier.',
            correct: true
          },
          {
            english: 'She finished the project last week.',
            french: 'Elle a terminé le projet la semaine dernière.',
            correct: true
          },
          {
            english: 'They launched the product in 2022.',
            french: 'Ils ont lancé le produit en 2022.',
            correct: true
          }
        ],
        tips: '📝 Verbes réguliers : work → worked, finish → finished, launch → launched'
      },
      {
        title: 'Verbes irréguliers',
        explanation: 'Forme spécifique à apprendre par cœur',
        examples: [
          {
            english: 'I went to the office yesterday.',
            french: 'Je suis allé au bureau hier.',
            correct: true
          },
          {
            english: 'She made a presentation last month.',
            french: 'Elle a fait une présentation le mois dernier.',
            correct: true
          },
          {
            english: 'They took the decision last year.',
            french: 'Ils ont pris la décision l\'année dernière.',
            correct: true
          }
        ],
        tips: '⚠️ Verbes irréguliers fréquents : go → went, make → made, take → took, see → saw'
      },
      {
        title: 'Formation négative',
        explanation: 'Sujet + did not (didn\'t) + verbe',
        examples: [
          {
            english: 'I didn\'t attend the meeting.',
            french: 'Je n\'ai pas assisté à la réunion.',
            correct: true
          },
          {
            english: 'She didn\'t receive the email.',
            french: 'Elle n\'a pas reçu l\'email.',
            correct: true
          },
          {
            english: 'They didn\'t approve the budget.',
            french: 'Ils n\'ont pas approuvé le budget.',
            correct: true
          }
        ],
        tips: '❌ didn\'t + verbe de base (pas de -ed après didn\'t !)'
      },
      {
        title: 'Formation interrogative',
        explanation: 'Did + sujet + verbe ?',
        examples: [
          {
            english: 'Did you finish the report?',
            french: 'As-tu terminé le rapport ?',
            correct: true
          },
          {
            english: 'Did she call you yesterday?',
            french: 'T\'a-t-elle appelé hier ?',
            correct: true
          },
          {
            english: 'Did they accept the offer?',
            french: 'Ont-ils accepté l\'offre ?',
            correct: true
          }
        ],
        tips: '❓ Did + verbe de base (pas de -ed après did !)'
      }
    ],
    exercises: [
      {
        id: 'c3-ex1',
        type: 'multiple-choice',
        question: 'I _____ the meeting yesterday.',
        options: ['attend', 'attended', 'attending', 'attends'],
        correctAnswer: 'attended',
        explanation: 'Passé simple régulier : attend + -ed'
      },
      {
        id: 'c3-ex2',
        type: 'multiple-choice',
        question: 'She _____ to the office last week.',
        options: ['go', 'goes', 'went', 'going'],
        correctAnswer: 'went',
        explanation: 'Passé simple irrégulier : go → went'
      },
      {
        id: 'c3-ex3',
        type: 'multiple-choice',
        question: 'They _____ not accept the proposal.',
        options: ['do', 'does', 'did', 'done'],
        correctAnswer: 'did',
        explanation: 'Négation au passé : did not'
      },
      {
        id: 'c3-ex4',
        type: 'multiple-choice',
        question: '_____ you see the email I sent?',
        options: ['Do', 'Does', 'Did', 'Done'],
        correctAnswer: 'Did',
        explanation: 'Question au passé : Did + you + verbe'
      },
      {
        id: 'c3-ex5',
        type: 'multiple-choice',
        question: 'We _____ a new contract last month.',
        options: ['sign', 'signed', 'signing', 'signs'],
        correctAnswer: 'signed',
        explanation: 'Passé simple régulier : sign + -ed'
      }
    ]
  },
  {
    id: 4,
    title: 'Le Futur (will/going to)',
    description: 'Parle du futur avec précision',
    theme: 'Temps du futur',
    xp: 85,
    duration: 13,
    locked: false,
    completed: false,
    status: 'available',
    tense: 'Future',
    rules: [
      {
        title: 'WILL - Décision spontanée',
        explanation: 'Sujet + will + verbe (décision au moment où on parle)',
        examples: [
          {
            english: 'I will call you later.',
            french: 'Je t\'appellerai plus tard.',
            correct: true
          },
          {
            english: 'The company will announce the results tomorrow.',
            french: 'L\'entreprise annoncera les résultats demain.',
            correct: true
          },
          {
            english: 'Don\'t worry, I will help you.',
            french: 'Ne t\'inquiète pas, je vais t\'aider.',
            correct: true
          }
        ],
        tips: '⚡ WILL = décision spontanée, promesse, prédiction'
      },
      {
        title: 'GOING TO - Intention planifiée',
        explanation: 'Sujet + am/is/are going to + verbe',
        examples: [
          {
            english: 'I am going to start a new project next week.',
            french: 'Je vais commencer un nouveau projet la semaine prochaine.',
            correct: true
          },
          {
            english: 'She is going to attend the conference.',
            french: 'Elle va assister à la conférence.',
            correct: true
          },
          {
            english: 'They are going to hire new employees.',
            french: 'Ils vont embaucher de nouveaux employés.',
            correct: true
          }
        ],
        tips: '📅 GOING TO = intention, plan déjà décidé'
      },
      {
        title: 'Différence WILL vs GOING TO',
        explanation: 'Will = spontané | Going to = planifié',
        examples: [
          {
            english: 'Look at those clouds! It\'s going to rain. (évidence)',
            french: 'Regarde ces nuages ! Il va pleuvoir.',
            correct: true
          },
          {
            english: 'I think the meeting will be interesting. (opinion)',
            french: 'Je pense que la réunion sera intéressante.',
            correct: true
          },
          {
            english: 'We are going to launch the product in June. (planifié)',
            french: 'Nous allons lancer le produit en juin.',
            correct: true
          }
        ],
        tips: '🎯 WILL = décision spontanée, opinion | GOING TO = plan, intention, évidence'
      },
      {
        title: 'Formes négatives et interrogatives',
        explanation: 'won\'t / isn\'t going to | Will you? / Are you going to?',
        examples: [
          {
            english: 'I won\'t be late.',
            french: 'Je ne serai pas en retard.',
            correct: true
          },
          {
            english: 'She isn\'t going to accept the offer.',
            french: 'Elle ne va pas accepter l\'offre.',
            correct: true
          },
          {
            english: 'Will you attend the meeting?',
            french: 'Vas-tu assister à la réunion ?',
            correct: true
          }
        ],
        tips: '❌ won\'t = will not | ❓ Will...? / Are...going to...?'
      }
    ],
    exercises: [
      {
        id: 'c4-ex1',
        type: 'multiple-choice',
        question: 'I _____ start the presentation now.',
        options: ['will', 'am going to', 'going to', 'shall'],
        correctAnswer: 'will',
        explanation: 'Décision spontanée au moment présent → will'
      },
      {
        id: 'c4-ex2',
        type: 'multiple-choice',
        question: 'She _____ visit the client next week. (planned)',
        options: ['will', 'is going to', 'going to', 'shall'],
        correctAnswer: 'is going to',
        explanation: 'Plan déjà décidé → going to'
      },
      {
        id: 'c4-ex3',
        type: 'multiple-choice',
        question: 'Look! The system _____ crash!',
        options: ['will', 'is going to', 'going to', 'shall'],
        correctAnswer: 'is going to',
        explanation: 'Évidence basée sur la situation → going to'
      },
      {
        id: 'c4-ex4',
        type: 'multiple-choice',
        question: '_____ you attend the training tomorrow?',
        options: ['Will', 'Are', 'Do', 'Does'],
        correctAnswer: 'Will',
        explanation: 'Question au futur simple → Will you'
      },
      {
        id: 'c4-ex5',
        type: 'multiple-choice',
        question: 'I think the project _____ be successful.',
        options: ['will', 'is going to', 'going to', 'shall'],
        correctAnswer: 'will',
        explanation: 'Opinion/prédiction → will'
      }
    ]
  },
  {
    id: 5,
    title: 'Le Present Perfect',
    description: 'Lie le passé au présent',
    theme: 'Temps avancés',
    xp: 100,
    duration: 18,
    locked: false,
    completed: false,
    status: 'available',
    tense: 'Present Perfect',
    rules: [
      {
        title: 'Formation',
        explanation: 'Sujet + have/has + participe passé',
        examples: [
          {
            english: 'I have worked here for 5 years.',
            french: 'Je travaille ici depuis 5 ans.',
            correct: true
          },
          {
            english: 'She has finished the report.',
            french: 'Elle a terminé le rapport.',
            correct: true
          },
          {
            english: 'They have completed the project.',
            french: 'Ils ont terminé le projet.',
            correct: true
          }
        ],
        tips: '✅ I/You/We/They have | He/She/It has'
      },
      {
        title: 'Expériences de vie',
        explanation: 'Actions passées sans moment précis',
        examples: [
          {
            english: 'I have visited Paris three times.',
            french: 'J\'ai visité Paris trois fois.',
            correct: true
          },
          {
            english: 'Have you ever worked abroad?',
            french: 'As-tu déjà travaillé à l\'étranger ?',
            correct: true
          },
          {
            english: 'She has never used this software.',
            french: 'Elle n\'a jamais utilisé ce logiciel.',
            correct: true
          }
        ],
        tips: '🌍 Ever/never = expériences de vie (pas de date précise)'
      },
      {
        title: 'Actions récentes avec résultat',
        explanation: 'Action passée avec conséquence présente',
        examples: [
          {
            english: 'I have just sent the email. (it\'s sent now)',
            french: 'Je viens d\'envoyer l\'email.',
            correct: true
          },
          {
            english: 'She has already left. (she\'s not here)',
            french: 'Elle est déjà partie.',
            correct: true
          },
          {
            english: 'We have not received the payment yet.',
            french: 'Nous n\'avons pas encore reçu le paiement.',
            correct: true
          }
        ],
        tips: '⏰ Just/already/yet = actions récentes avec impact maintenant'
      },
      {
        title: 'Durée (depuis)',
        explanation: 'FOR (durée) et SINCE (point de départ)',
        examples: [
          {
            english: 'I have worked here for 3 years. (durée)',
            french: 'Je travaille ici depuis 3 ans.',
            correct: true
          },
          {
            english: 'She has been manager since 2020. (point de départ)',
            french: 'Elle est manager depuis 2020.',
            correct: true
          },
          {
            english: 'We have known each other for a long time.',
            french: 'Nous nous connaissons depuis longtemps.',
            correct: true
          }
        ],
        tips: '⏳ FOR = durée (3 years, 2 months) | SINCE = point de départ (2020, Monday)'
      }
    ],
    exercises: [
      {
        id: 'c5-ex1',
        type: 'multiple-choice',
        question: 'I _____ finished my work.',
        options: ['has', 'have', 'had', 'having'],
        correctAnswer: 'have',
        explanation: 'Present perfect : I have + participe passé'
      },
      {
        id: 'c5-ex2',
        type: 'multiple-choice',
        question: 'She _____ worked here since 2019.',
        options: ['has', 'have', 'had', 'having'],
        correctAnswer: 'has',
        explanation: 'Present perfect : She has + participe passé'
      },
      {
        id: 'c5-ex3',
        type: 'multiple-choice',
        question: 'Have you _____ been to London?',
        options: ['never', 'ever', 'yet', 'already'],
        correctAnswer: 'ever',
        explanation: 'Ever = déjà (dans les questions sur les expériences)'
      },
      {
        id: 'c5-ex4',
        type: 'multiple-choice',
        question: 'I have lived here _____ 5 years.',
        options: ['since', 'for', 'during', 'from'],
        correctAnswer: 'for',
        explanation: 'FOR + durée (5 years, 2 months...)'
      },
      {
        id: 'c5-ex5',
        type: 'multiple-choice',
        question: 'They _____ not replied yet.',
        options: ['has', 'have', 'had', 'having'],
        correctAnswer: 'have',
        explanation: 'Present perfect négatif : have not (haven\'t)'
      }
    ]
  }
];
