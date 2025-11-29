import { VocabularyLesson } from '@/types/lesson';

export const vocabularyLessons: VocabularyLesson[] = [
  {
    id: 1,
    title: 'Les 3 mots les plus fréquents',
  description: 'Maîtrise les verbes qui tombent à TOUS les TEPITECH',
    theme: 'Vocabulaire essentiel',
    xp: 50,
    duration: 5,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'To pick up',
        french: 'Récupérer / Passer prendre',
        phonetic: '/pɪk ʌp/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'Please pick up your tickets at the front desk.',
            french: 'Veuillez récupérer vos billets à l\'accueil.'
          },
          {
            english: 'I\'ll pick you up at the airport.',
            french: 'Je viendrai te chercher à l\'aéroport.'
          },
          {
            english: 'Can you pick up the documents from my office?',
            french: 'Peux-tu récupérer les documents dans mon bureau ?'
          }
        ],
  tips: '🔥 ULTRA FRÉQUENT au TEPITECH ! Apparaît dans presque tous les tests. Ne confonds pas avec "to pick" seul.'
      },
      {
        english: 'To attend',
        french: 'Assister à / Participer à',
        phonetic: '/əˈtend/',
        category: 'Verbe d\'action',
        frequency: 'essential',
        examples: [
          {
            english: 'All employees must attend the meeting.',
            french: 'Tous les employés doivent assister à la réunion.'
          },
          {
            english: 'How many people will attend the conference?',
            french: 'Combien de personnes vont participer à la conférence ?'
          },
          {
            english: 'She attended the training session last week.',
            french: 'Elle a assisté à la session de formation la semaine dernière.'
          }
        ],
        tips: '⚠️ FAUX AMI ! "Attend" ne veut PAS dire "attendre" (= to wait) mais "assister à".'
      },
      {
        english: 'Available',
        french: 'Disponible',
        phonetic: '/əˈveɪləbl/',
        category: 'Adjectif',
        frequency: 'essential',
        examples: [
          {
            english: 'Tickets are available at the box office.',
            french: 'Les billets sont disponibles à la billetterie.'
          },
          {
            english: 'Is Mr. Johnson available for a meeting?',
            french: 'Est-ce que M. Johnson est disponible pour une réunion ?'
          },
          {
            english: 'Free parking is available for visitors.',
            french: 'Un parking gratuit est disponible pour les visiteurs.'
          }
        ],
        tips: '💡 Très utilisé pour parler de disponibilité (personnes, billets, services). Souvent dans les annonces.'
      }
    ],
    exercises: [
      {
        id: 'ex1_1',
        type: 'multiple-choice',
        question: 'What does "to pick up" mean?',
        options: [
          'To choose something',
          'To collect/get something',
          'To pick flowers',
          'To wake up'
        ],
        correctAnswer: 'To collect/get something',
        explanation: '"To pick up" signifie récupérer ou aller chercher quelque chose ou quelqu\'un.'
      },
      {
        id: 'ex1_2',
        type: 'fill-blank',
        question: 'Complete: "Please ___ your badge at the reception."',
        correctAnswer: 'pick up',
        explanation: 'On utilise "pick up" pour dire récupérer quelque chose à un endroit précis.'
      },
      {
        id: 'ex1_3',
        type: 'multiple-choice',
        question: '"I will attend the conference" means:',
        options: [
          'J\'attendrai la conférence',
          'J\'assisterai à la conférence',
          'Je donnerai la conférence',
          'J\'organiserai la conférence'
        ],
        correctAnswer: 'J\'assisterai à la conférence',
        explanation: '"Attend" est un faux ami ! Il signifie "assister à" et non "attendre".'
      },
      {
        id: 'ex1_4',
        type: 'translation',
        question: 'Translate: "Les billets sont disponibles en ligne."',
        correctAnswer: 'Tickets are available online',
        explanation: '"Available" = disponible. "Online" = en ligne.'
      },
      {
        id: 'ex1_5',
        type: 'matching',
        question: 'Match the words with their French translation',
        options: ['To pick up', 'To attend', 'Available'],
        correctAnswer: ['Récupérer', 'Assister à', 'Disponible'],
  explanation: 'Ces trois mots sont les plus fréquents au TEPITECH !'
      }
    ]
  },
  {
    id: 2,
    title: 'Le monde de l\'entreprise - Part 1',
    description: 'Vocabulaire professionnel essentiel',
    theme: 'Business & Travail',
    xp: 60,
    duration: 7,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'Joint venture',
        french: 'Coentreprise / Partenariat commercial',
        phonetic: '/dʒɔɪnt ˈventʃər/',
        category: 'Business',
        frequency: 'important',
        examples: [
          {
            english: 'The two companies formed a joint venture to expand internationally.',
            french: 'Les deux entreprises ont formé une coentreprise pour se développer à l\'international.'
          },
          {
            english: 'This joint venture will create 500 new jobs.',
            french: 'Cette coentreprise va créer 500 nouveaux emplois.'
          }
        ],
        tips: '🤝 Souvent utilisé dans les contextes de partenariats entre entreprises.'
      },
      {
        english: 'Market share',
        french: 'Part de marché',
        phonetic: '/ˈmɑːrkɪt ʃeər/',
        category: 'Business',
        frequency: 'important',
        examples: [
          {
            english: 'Our market share increased by 15% this year.',
            french: 'Notre part de marché a augmenté de 15% cette année.'
          },
          {
            english: 'The company holds a 30% market share in Asia.',
            french: 'L\'entreprise détient une part de marché de 30% en Asie.'
          }
        ],
        tips: '📊 Très utilisé dans les rapports financiers et présentations business.'
      },
      {
        english: 'To diversify',
        french: 'Se diversifier',
        phonetic: '/daɪˈvɜːrsɪfaɪ/',
        category: 'Business Verb',
        frequency: 'important',
        examples: [
          {
            english: 'The company plans to diversify into renewable energy.',
            french: 'L\'entreprise prévoit de se diversifier dans les énergies renouvelables.'
          },
          {
            english: 'We need to diversify our product range.',
            french: 'Nous devons diversifier notre gamme de produits.'
          }
        ],
        tips: '💡 Souvent suivi de "into" pour indiquer le nouveau secteur.'
      },
      {
        english: 'Personnel office',
        french: 'Bureau du personnel / RH',
        phonetic: '/ˌpɜːrsəˈnel ˈɔːfɪs/',
        category: 'Business',
        frequency: 'useful',
        examples: [
          {
            english: 'Please submit your application to the personnel office.',
            french: 'Veuillez soumettre votre candidature au bureau du personnel.'
          },
          {
            english: 'The personnel office is located on the third floor.',
            french: 'Le bureau du personnel se trouve au troisième étage.'
          }
        ],
        tips: '🏢 Synonyme de "HR department" (département des Ressources Humaines).'
      },
      {
        english: 'To retire / Retirement',
        french: 'Prendre sa retraite / Retraite',
        phonetic: '/rɪˈtaɪər/ /rɪˈtaɪərmənt/',
        category: 'Work Life',
        frequency: 'important',
        examples: [
          {
            english: 'Mr. Smith will retire next month after 30 years of service.',
            french: 'M. Smith prendra sa retraite le mois prochain après 30 ans de service.'
          },
          {
            english: 'The retirement party will be held on Friday.',
            french: 'La fête de départ à la retraite aura lieu vendredi.'
          }
        ],
        tips: '👴 Très fréquent dans les annonces de départ et les hommages.'
      }
    ],
    exercises: [
      {
        id: 'ex2_1',
        type: 'multiple-choice',
        question: 'A "joint venture" is:',
        options: [
          'A company building',
          'A business partnership',
          'A job interview',
          'A retirement plan'
        ],
        correctAnswer: 'A business partnership',
        explanation: 'Une "joint venture" est un partenariat commercial entre deux entreprises.'
      },
      {
        id: 'ex2_2',
        type: 'fill-blank',
        question: 'Complete: "Our ___ ___ has grown to 25%." (notre part de marché)',
        correctAnswer: 'market share',
        explanation: '"Market share" = part de marché.'
      },
      {
        id: 'ex2_3',
        type: 'multiple-choice',
        question: 'Where would you submit your job application?',
        options: [
          'Market share office',
          'Personnel office',
          'Joint venture',
          'Retirement office'
        ],
        correctAnswer: 'Personnel office',
        explanation: 'Le "personnel office" (bureau du personnel) gère les candidatures et les employés.'
      },
      {
        id: 'ex2_4',
        type: 'translation',
        question: 'Translate: "L\'entreprise veut se diversifier dans la technologie."',
        correctAnswer: 'The company wants to diversify into technology',
        explanation: '"To diversify into" = se diversifier dans un nouveau secteur.'
      },
      {
        id: 'ex2_5',
        type: 'multiple-choice',
        question: 'Complete: "After 40 years, she decided to ___."',
        options: [
          'joint venture',
          'market share',
          'retire',
          'diversify'
        ],
        correctAnswer: 'retire',
        explanation: '"To retire" = prendre sa retraite.'
      }
    ]
  },
  {
    id: 3,
    title: 'Événements et Réunions',
    description: 'Vocabulaire des conférences et événements professionnels',
    theme: 'Événements',
    xp: 55,
    duration: 6,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'To hold',
        french: 'Tenir / Organiser (un événement)',
        phonetic: '/həʊld/',
        category: 'Event Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'The meeting will be held in Conference Room A.',
            french: 'La réunion se tiendra dans la salle de conférence A.'
          },
          {
            english: 'We are holding a party to celebrate our success.',
            french: 'Nous organisons une fête pour célébrer notre succès.'
          },
          {
            english: 'The annual conference is held in different cities each year.',
            french: 'La conférence annuelle se tient dans différentes villes chaque année.'
          }
        ],
        tips: '⚠️ Souvent au passif : "will be held" = se tiendra. TRÈS fréquent dans les annonces !'
      },
      {
        english: 'Annual',
        french: 'Annuel',
        phonetic: '/ˈænjuəl/',
        category: 'Adjective',
        frequency: 'important',
        examples: [
          {
            english: 'Don\'t miss our annual summer sale!',
            french: 'Ne manquez pas notre solde d\'été annuel !'
          },
          {
            english: 'The annual report shows impressive growth.',
            french: 'Le rapport annuel montre une croissance impressionnante.'
          }
        ],
        tips: '📅 Utilisé pour tout ce qui revient chaque année (réunion, rapport, événement).'
      },
      {
        english: 'To honor',
        french: 'Rendre hommage à / Honorer',
        phonetic: '/ˈɒnər/',
        category: 'Verb',
        frequency: 'important',
        examples: [
          {
            english: 'Tonight, we honor our retiring CEO.',
            french: 'Ce soir, nous rendons hommage à notre PDG qui part à la retraite.'
          },
          {
            english: 'This award honors employees with outstanding performance.',
            french: 'Ce prix honore les employés ayant une performance exceptionnelle.'
          }
        ],
        tips: '🏆 Très utilisé lors de cérémonies et événements spéciaux.'
      },
      {
        english: 'Retreat',
        french: 'Séminaire (hors bureau)',
        phonetic: '/rɪˈtriːt/',
        category: 'Event',
        frequency: 'useful',
        examples: [
          {
            english: 'The company retreat will take place in the mountains.',
            french: 'Le séminaire d\'entreprise aura lieu dans les montagnes.'
          },
          {
            english: 'Team-building activities are planned for the retreat.',
            french: 'Des activités de team-building sont prévues pour le séminaire.'
          }
        ],
        tips: '🏔️ Un "retreat" est généralement organisé en dehors du bureau pour renforcer l\'équipe.'
      },
      {
        english: 'Opening',
        french: 'Inauguration / Vernissage',
        phonetic: '/ˈəʊpənɪŋ/',
        category: 'Event',
        frequency: 'useful',
        examples: [
          {
            english: 'The grand opening of our new store is next Friday.',
            french: 'La grande inauguration de notre nouveau magasin est vendredi prochain.'
          },
          {
            english: 'Everyone is invited to the gallery opening.',
            french: 'Tout le monde est invité au vernissage de la galerie.'
          }
        ],
        tips: '🎉 "Grand opening" = grande inauguration (très courant pour les nouveaux magasins).'
      }
    ],
    exercises: [
      {
        id: 'ex3_1',
        type: 'multiple-choice',
        question: '"The meeting will be held on Monday" means:',
        options: [
          'La réunion sera retenue lundi',
          'La réunion se tiendra lundi',
          'La réunion sera portée lundi',
          'La réunion sera tenue lundi'
        ],
        correctAnswer: 'La réunion se tiendra lundi',
  explanation: '"Will be held" = se tiendra (passif de "to hold"). Expression TRÈS fréquente au TEPITECH !'
      },
      {
        id: 'ex3_2',
        type: 'fill-blank',
        question: 'Complete: "The ___ company picnic is in July." (chaque année)',
        correctAnswer: 'annual',
        explanation: '"Annual" = annuel, qui a lieu chaque année.'
      },
      {
        id: 'ex3_3',
        type: 'multiple-choice',
        question: 'A company "retreat" is:',
        options: [
          'A retirement party',
          'An office meeting',
          'A team seminar outside the office',
          'A product launch'
        ],
        correctAnswer: 'A team seminar outside the office',
        explanation: 'Un "retreat" est un séminaire d\'entreprise, généralement organisé hors du bureau.'
      },
      {
        id: 'ex3_4',
        type: 'translation',
        question: 'Translate: "Nous honorons nos meilleurs employés ce soir."',
        correctAnswer: 'We honor our best employees tonight',
        explanation: '"To honor" = rendre hommage à / honorer.'
      },
      {
        id: 'ex3_5',
        type: 'multiple-choice',
        question: 'The "grand opening" of a store is:',
        options: [
          'The closing ceremony',
          'The inauguration',
          'The annual sale',
          'The retirement party'
        ],
        correctAnswer: 'The inauguration',
        explanation: '"Grand opening" = grande inauguration (d\'un magasin, d\'un bâtiment, etc.).'
      }
    ]
  },
  {
    id: 4,
    title: 'Phrasal Verbs indispensables',
    description: 'Les verbes à particule qui tombent tout le temps',
    theme: 'Verbes d\'action',
    xp: 70,
    duration: 8,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'To look for',
        french: 'Chercher / Rechercher',
        phonetic: '/lʊk fɔːr/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'I\'m looking for the conference room.',
            french: 'Je cherche la salle de conférence.'
          },
          {
            english: 'We are looking for experienced developers.',
            french: 'Nous recherchons des développeurs expérimentés.'
          },
          {
            english: 'What are you looking for?',
            french: 'Que cherchez-vous ?'
          }
        ],
        tips: '🔍 ULTRA COURANT ! Ne pas confondre avec "to search" (fouiller). "Look for" = chercher.'
      },
      {
        english: 'To hand over',
        french: 'Remettre / Donner (de la main à la main)',
        phonetic: '/hænd ˈəʊvər/',
        category: 'Phrasal Verb',
        frequency: 'important',
        examples: [
          {
            english: 'Please hand over your reports to the manager.',
            french: 'Veuillez remettre vos rapports au manager.'
          },
          {
            english: 'He handed over the keys to the new owner.',
            french: 'Il a remis les clés au nouveau propriétaire.'
          }
        ],
        tips: '🤝 Implique un transfert direct de quelque chose à quelqu\'un.'
      },
      {
        english: 'To investigate',
        french: 'Enquêter / Examiner',
        phonetic: '/ɪnˈvestɪɡeɪt/',
        category: 'Verb',
        frequency: 'useful',
        examples: [
          {
            english: 'We need to investigate the cause of the problem.',
            french: 'Nous devons enquêter sur la cause du problème.'
          },
          {
            english: 'The team is investigating several options.',
            french: 'L\'équipe examine plusieurs options.'
          }
        ],
        tips: '🔎 Utilisé pour parler d\'enquêtes ou d\'examens approfondis.'
      },
      {
        english: 'To tow',
        french: 'Remorquer (fourrière)',
        phonetic: '/təʊ/',
        category: 'Verb',
        frequency: 'useful',
        examples: [
          {
            english: 'Your car will be towed if you park here.',
            french: 'Votre voiture sera remorquée si vous vous garez ici.'
          },
          {
            english: 'Illegally parked vehicles will be towed at the owner\'s expense.',
            french: 'Les véhicules mal garés seront remorqués aux frais du propriétaire.'
          }
        ],
        tips: '🚗 MOT-CLÉ dans les annonces de parking ! Souvent : "will be towed" = sera remorqué.'
      }
    ],
    exercises: [
      {
        id: 'ex4_1',
        type: 'multiple-choice',
        question: '"I\'m looking for the restroom" means:',
        options: [
          'Je regarde les toilettes',
          'Je cherche les toilettes',
          'Je nettoie les toilettes',
          'Je répare les toilettes'
        ],
        correctAnswer: 'Je cherche les toilettes',
        explanation: '"To look for" = chercher (quelque chose ou quelqu\'un).'
      },
      {
        id: 'ex4_2',
        type: 'fill-blank',
        question: 'Complete: "Please ___ ___ the documents to HR." (remettre)',
        correctAnswer: 'hand over',
        explanation: '"To hand over" = remettre quelque chose directement à quelqu\'un.'
      },
      {
        id: 'ex4_3',
        type: 'multiple-choice',
        question: 'If your car is illegally parked, it might be:',
        options: [
          'investigated',
          'handed over',
          'towed',
          'looked for'
        ],
        correctAnswer: 'towed',
  explanation: '"Towed" = remorqué. Très courant dans les annonces de parking au TEPITECH !'
      },
      {
        id: 'ex4_4',
        type: 'translation',
        question: 'Translate: "Nous devons enquêter sur ce problème."',
        correctAnswer: 'We need to investigate this problem',
        explanation: '"To investigate" = enquêter sur / examiner.'
      },
      {
        id: 'ex4_5',
        type: 'matching',
        question: 'Match the phrasal verbs with their meanings',
        options: ['To look for', 'To hand over', 'To tow', 'To investigate'],
        correctAnswer: ['Chercher', 'Remettre', 'Remorquer', 'Enquêter'],
  explanation: 'Ces verbes sont essentiels pour le TEPITECH !'
      }
    ]
  },
  {
    id: 5,
    title: 'Logistique et Gestion',
    description: 'Vocabulaire de la gestion des stocks et des installations',
    theme: 'Entreprise & Travail',
    xp: 65,
    duration: 7,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'Facilities Manager',
        french: 'Responsable des services généraux',
        phonetic: '/fəˈsɪlətiz ˈmænɪdʒər/',
        category: 'Job Title',
        frequency: 'useful',
        examples: [
          {
            english: 'Contact the facilities manager for building issues.',
            french: 'Contactez le responsable des services généraux pour les problèmes de bâtiment.'
          },
          {
            english: 'The facilities manager oversees maintenance and security.',
            french: 'Le responsable des services généraux supervise la maintenance et la sécurité.'
          }
        ],
        tips: '🏢 Personne qui gère le bâtiment (maintenance, sécurité, équipements).'
      },
      {
        english: 'Inventory process',
        french: 'Gestion des stocks / Inventaire',
        phonetic: '/ˈɪnvəntri ˈprəʊses/',
        category: 'Business Process',
        frequency: 'important',
        examples: [
          {
            english: 'The inventory process will begin next Monday.',
            french: 'L\'inventaire commencera lundi prochain.'
          },
          {
            english: 'We need to improve our inventory process.',
            french: 'Nous devons améliorer notre gestion des stocks.'
          }
        ],
        tips: '📦 Processus de comptage et de gestion des stocks.'
      },
      {
        english: 'Logistics',
        french: 'Logistique',
        phonetic: '/ləˈdʒɪstɪks/',
        category: 'Business',
        frequency: 'important',
        examples: [
          {
            english: 'Our logistics team handles all shipments.',
            french: 'Notre équipe logistique gère toutes les expéditions.'
          },
          {
            english: 'Logistics costs have increased this quarter.',
            french: 'Les coûts logistiques ont augmenté ce trimestre.'
          }
        ],
        tips: '🚚 Tout ce qui concerne le transport et la distribution des marchandises.'
      },
      {
        english: 'To be short on staff',
        french: 'Être en sous-effectif / Manquer de personnel',
        phonetic: '/ʃɔːrt ɒn stɑːf/',
        category: 'Expression',
        frequency: 'useful',
        examples: [
          {
            english: 'We\'re short on staff this week due to vacations.',
            french: 'Nous manquons de personnel cette semaine à cause des vacances.'
          },
          {
            english: 'The restaurant is short on staff tonight.',
            french: 'Le restaurant est en sous-effectif ce soir.'
          }
        ],
        tips: '👥 Expression courante pour dire qu\'il manque des employés.'
      }
    ],
    exercises: [
      {
        id: 'ex5_1',
        type: 'multiple-choice',
        question: 'Who should you contact for building maintenance issues?',
        options: [
          'The logistics manager',
          'The facilities manager',
          'The inventory manager',
          'The personnel office'
        ],
        correctAnswer: 'The facilities manager',
        explanation: 'Le "facilities manager" gère tout ce qui concerne le bâtiment.'
      },
      {
        id: 'ex5_2',
        type: 'fill-blank',
        question: 'Complete: "The ___ handles all our shipments." (logistique)',
        correctAnswer: 'logistics',
        explanation: '"Logistics" = la logistique (transport et distribution).'
      },
      {
        id: 'ex5_3',
        type: 'translation',
        question: 'Translate: "Nous manquons de personnel aujourd\'hui."',
        correctAnswer: 'We are short on staff today',
        explanation: '"To be short on staff" = manquer de personnel / être en sous-effectif.'
      },
      {
        id: 'ex5_4',
        type: 'multiple-choice',
        question: 'The "inventory process" refers to:',
        options: [
          'Hiring new employees',
          'Managing stock and supplies',
          'Building maintenance',
          'Staff training'
        ],
        correctAnswer: 'Managing stock and supplies',
        explanation: '"Inventory process" = processus d\'inventaire / gestion des stocks.'
      }
    ]
  },
  {
    id: 6,
    title: 'Arts, Médias et Communication',
    description: 'Vocabulaire des expositions, médias et diffusions',
    theme: 'Culture & Médias',
    xp: 60,
    duration: 6,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'Exhibit / Exhibition',
        french: 'Exposition',
        phonetic: '/ɪɡˈzɪbɪt/ /ˌeksɪˈbɪʃn/',
        category: 'Arts',
        frequency: 'important',
        examples: [
          {
            english: 'The new exhibit opens this Saturday.',
            french: 'La nouvelle exposition ouvre ce samedi.'
          },
          {
            english: 'Don\'t miss our photography exhibition.',
            french: 'Ne manquez pas notre exposition de photographie.'
          }
        ],
        tips: '🎨 "Exhibit" (nom ou verbe) et "Exhibition" (nom seulement) sont interchangeables.'
      },
      {
        english: 'Broadcast',
        french: 'Émission / Diffusion',
        phonetic: '/ˈbrɔːdkɑːst/',
        category: 'Media',
        frequency: 'useful',
        examples: [
          {
            english: 'The interview will be broadcast live at 8 PM.',
            french: 'L\'interview sera diffusée en direct à 20h.'
          },
          {
            english: 'Listen to our daily news broadcast.',
            french: 'Écoutez notre bulletin d\'informations quotidien.'
          }
        ],
        tips: '📻 Utilisé pour la radio et la télévision. "Live broadcast" = diffusion en direct.'
      },
      {
        english: 'Headlines',
        french: 'Les gros titres (de l\'actualité)',
        phonetic: '/ˈhedlaɪnz/',
        category: 'Media',
        frequency: 'useful',
        examples: [
          {
            english: 'Here are today\'s top headlines.',
            french: 'Voici les gros titres du jour.'
          },
          {
            english: 'The story made headlines around the world.',
            french: 'L\'histoire a fait les gros titres dans le monde entier.'
          }
        ],
        tips: '📰 Toujours au pluriel : "headlines" (les titres principaux des journaux/actualités).'
      },
      {
        english: 'Stay tuned',
        french: 'Restez à l\'écoute',
        phonetic: '/steɪ tjuːnd/',
        category: 'Expression',
        frequency: 'useful',
        examples: [
          {
            english: 'Stay tuned for more information.',
            french: 'Restez à l\'écoute pour plus d\'informations.'
          },
          {
            english: 'Stay tuned, we\'ll be right back after the break.',
            french: 'Restez à l\'écoute, nous revenons tout de suite après la pause.'
          }
        ],
        tips: '📻 Expression TRÈS courante à la radio et à la télévision.'
      },
      {
        english: 'Permanent collection',
        french: 'Collection permanente',
        phonetic: '/ˈpɜːrmənənt kəˈlekʃn/',
        category: 'Arts',
        frequency: 'useful',
        examples: [
          {
            english: 'The permanent collection features works from the 19th century.',
            french: 'La collection permanente présente des œuvres du 19ème siècle.'
          },
          {
            english: 'Access to the permanent collection is free.',
            french: 'L\'accès à la collection permanente est gratuit.'
          }
        ],
        tips: '🏛️ Par opposition à "temporary exhibition" (exposition temporaire).'
      }
    ],
    exercises: [
      {
        id: 'ex6_1',
        type: 'multiple-choice',
        question: 'An "exhibit" is:',
        options: [
          'A television show',
          'An art exhibition',
          'A radio program',
          'A newspaper'
        ],
        correctAnswer: 'An art exhibition',
        explanation: '"Exhibit" ou "Exhibition" = une exposition (art, photos, musée, etc.).'
      },
      {
        id: 'ex6_2',
        type: 'fill-blank',
        question: 'Complete: "The concert will be ___ live on TV." (diffusé)',
        correctAnswer: 'broadcast',
        explanation: '"Broadcast" = diffuser (à la radio ou à la télévision).'
      },
      {
        id: 'ex6_3',
        type: 'translation',
        question: 'Translate: "Restez à l\'écoute pour les dernières nouvelles."',
        correctAnswer: 'Stay tuned for the latest news',
        explanation: '"Stay tuned" = restez à l\'écoute (expression radio/TV).'
      },
      {
        id: 'ex6_4',
        type: 'multiple-choice',
        question: '"Headlines" refers to:',
        options: [
          'Radio stations',
          'Museum guides',
          'Main news stories',
          'Art exhibitions'
        ],
        correctAnswer: 'Main news stories',
        explanation: '"Headlines" = les gros titres de l\'actualité.'
      }
    ]
  },
  {
    id: 7,
    title: 'Contrats et Business',
    description: 'Vocabulaire des contrats et du monde professionnel',
    theme: 'Business & Contrats',
    xp: 70,
    duration: 8,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'To draw up',
        french: 'Rédiger (un contrat, un document)',
        phonetic: '/drɔː ʌp/',
        category: 'Phrasal Verb',
        frequency: 'important',
        examples: [
          {
            english: 'Our legal department will draw up the new agreement by Friday.',
            french: 'Notre département juridique rédigera le nouvel accord d\'ici vendredi.'
          },
          {
            english: 'The lawyers are drawing up a contract for the partnership.',
            french: 'Les avocats rédigent un contrat pour le partenariat.'
          },
          {
            english: 'We need to draw up a detailed budget proposal.',
            french: 'Nous devons rédiger une proposition budgétaire détaillée.'
          }
        ],
        tips: '📝 Très utilisé dans le contexte juridique et des contrats professionnels.'
      },
      {
        english: 'To commence',
        french: 'Commencer (formel)',
        phonetic: '/kəˈmens/',
        category: 'Verb',
        frequency: 'important',
        examples: [
          {
            english: 'The consultation period commences on March 1st.',
            french: 'La période de consultation commence le 1er mars.'
          },
          {
            english: 'The meeting will commence at 9 AM sharp.',
            french: 'La réunion commencera à 9h précises.'
          },
          {
            english: 'Work on the new project will commence next week.',
            french: 'Le travail sur le nouveau projet commencera la semaine prochaine.'
          }
        ],
        tips: '⚠️ Plus formel que "to start" ou "to begin". Très utilisé dans les documents officiels.'
      },
      {
        english: 'Invoice',
        french: 'Facture',
        phonetic: '/ˈɪnvɔɪs/',
        category: 'Noun',
        frequency: 'essential',
        examples: [
          {
            english: 'Please submit your invoice no later than the 20th of the month.',
            french: 'Veuillez soumettre votre facture au plus tard le 20 du mois.'
          },
          {
            english: 'The invoice must include all itemized charges.',
            french: 'La facture doit inclure tous les frais détaillés.'
          },
          {
            english: 'We haven\'t received the invoice for last month\'s services.',
            french: 'Nous n\'avons pas reçu la facture des services du mois dernier.'
          }
        ],
  tips: '💰 TRÈS fréquent au TEPITECH ! À ne pas confondre avec "bill" (note de restaurant, facture simple).'
      },
      {
        english: 'To be in effect',
        french: 'Être en vigueur',
        phonetic: '/ɪn ɪˈfekt/',
        category: 'Expression',
        frequency: 'important',
        examples: [
          {
            english: 'This policy will remain in effect until next year.',
            french: 'Cette politique restera en vigueur jusqu\'à l\'année prochaine.'
          },
          {
            english: 'The new regulations are now in effect.',
            french: 'Les nouveaux règlements sont maintenant en vigueur.'
          },
          {
            english: 'The discount will be in effect from Monday to Friday.',
            french: 'La réduction sera en vigueur du lundi au vendredi.'
          }
        ],
        tips: '📋 Expression clé pour parler de règles, politiques ou lois actives.'
      },
      {
        english: 'Parties',
        french: 'Les parties (contractuelles)',
        phonetic: '/ˈpɑːrtiz/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'Both parties must sign the document.',
            french: 'Les deux parties doivent signer le document.'
          },
          {
            english: 'The agreement benefits all parties involved.',
            french: 'L\'accord bénéficie à toutes les parties impliquées.'
          },
          {
            english: 'If either party wishes to terminate the contract...',
            french: 'Si l\'une ou l\'autre partie souhaite résilier le contrat...'
          }
        ],
        tips: '⚠️ Dans un contexte légal, "parties" = les personnes/entités dans un contrat (pas les fêtes!).'
      }
    ],
    exercises: [
      {
        id: 'ex7_1',
        type: 'multiple-choice',
        question: '"To draw up a contract" means:',
        options: [
          'To tear up a contract',
          'To prepare/write a contract',
          'To sign a contract',
          'To cancel a contract'
        ],
        correctAnswer: 'To prepare/write a contract',
        explanation: '"To draw up" signifie rédiger ou préparer un document officiel.'
      },
      {
        id: 'ex7_2',
        type: 'fill-blank',
        question: 'Complete: "Please submit your ___ by the end of the month."',
        correctAnswer: 'invoice',
  explanation: '"Invoice" = facture. Très courant dans les contextes business du TEPITECH.'
      },
      {
        id: 'ex7_3',
        type: 'multiple-choice',
        question: 'Which word is more formal?',
        options: [
          'To start',
          'To commence',
          'To begin',
          'To kick off'
        ],
        correctAnswer: 'To commence',
        explanation: '"To commence" est le terme le plus formel pour dire "commencer".'
      },
      {
        id: 'ex7_4',
        type: 'translation',
        question: 'Translate: "Cette politique est en vigueur depuis janvier."',
        correctAnswer: 'This policy has been in effect since January',
        explanation: '"To be in effect" = être en vigueur (pour des règles, lois, politiques).'
      },
      {
        id: 'ex7_5',
        type: 'multiple-choice',
        question: 'In a legal context, "parties" refers to:',
        options: [
          'Celebrations',
          'Political groups',
          'People/entities in a contract',
          'Company departments'
        ],
        correctAnswer: 'People/entities in a contract',
        explanation: 'Dans un contexte juridique, "parties" désigne les personnes/entités impliquées dans un contrat.'
      }
    ]
  },
  {
    id: 8,
    title: 'Vente et Service Client',
    description: 'Vocabulaire du retail et du service client',
    theme: 'Sales & Retail',
    xp: 65,
    duration: 7,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'Misprint',
        french: 'Coquille / Erreur d\'impression',
        phonetic: '/ˈmɪsprɪnt/',
        category: 'Noun',
        frequency: 'useful',
        examples: [
          {
            english: 'There was a misprint in the flyer; the price is wrong.',
            french: 'Il y avait une coquille dans le prospectus ; le prix est incorrect.'
          },
          {
            english: 'We apologize for the misprint in yesterday\'s advertisement.',
            french: 'Nous nous excusons pour l\'erreur d\'impression dans la publicité d\'hier.'
          },
          {
            english: 'The misprint caused confusion among customers.',
            french: 'La coquille a causé de la confusion parmi les clients.'
          }
        ],
        tips: '📰 Erreur typographique dans un document imprimé. Courant dans les contextes publicitaires.'
      },
      {
        english: 'To apologize',
        french: 'S\'excuser',
        phonetic: '/əˈpɒlədʒaɪz/',
        category: 'Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'Please apologize to the customer for the delay.',
            french: 'Veuillez vous excuser auprès du client pour le retard.'
          },
          {
            english: 'We apologize for any inconvenience this may have caused.',
            french: 'Nous nous excusons pour tout désagrément que cela aurait pu causer.'
          },
          {
            english: 'The manager apologized personally to each affected customer.',
            french: 'Le manager s\'est excusé personnellement auprès de chaque client concerné.'
          }
        ],
        tips: '🔥 TRÈS fréquent dans le service client ! "Apologize TO someone FOR something".'
      },
      {
        english: 'Outlet',
        french: 'Point de vente / Magasin d\'usine',
        phonetic: '/ˈaʊtlet/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'They plan to open a new retail outlet in the city center.',
            french: 'Ils prévoient d\'ouvrir un nouveau point de vente au centre-ville.'
          },
          {
            english: 'This outlet offers discounts of up to 50%.',
            french: 'Ce magasin d\'usine offre des réductions jusqu\'à 50%.'
          },
          {
            english: 'Our company operates 20 outlets nationwide.',
            french: 'Notre entreprise exploite 20 points de vente dans tout le pays.'
          }
        ],
        tips: '🏪 Un "outlet" peut être un magasin d\'usine ou simplement un point de vente.'
      },
      {
        english: 'Franchise / Franchisee',
        french: 'Franchise / Franchisé',
        phonetic: '/ˈfræntʃaɪz/ /ˌfræntʃaɪˈziː/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'We are looking for potential franchisees to expand our network.',
            french: 'Nous recherchons des franchisés potentiels pour étendre notre réseau.'
          },
          {
            english: 'The franchise agreement includes training and support.',
            french: 'Le contrat de franchise inclut la formation et le soutien.'
          },
          {
            english: 'This restaurant is a franchise of a larger chain.',
            french: 'Ce restaurant est une franchise d\'une plus grande chaîne.'
          }
        ],
        tips: '🍔 Très courant dans le retail. "Franchisee" = la personne qui achète la franchise.'
      },
      {
        english: 'Refund / Discount',
        french: 'Remboursement / Réduction',
        phonetic: '/ˈriːfʌnd/ /ˈdɪskaʊnt/',
        category: 'Noun',
        frequency: 'essential',
        examples: [
          {
            english: 'Customers can request a full refund within 30 days.',
            french: 'Les clients peuvent demander un remboursement complet sous 30 jours.'
          },
          {
            english: 'We\'re offering a 20% discount on all winter items.',
            french: 'Nous offrons une réduction de 20% sur tous les articles d\'hiver.'
          },
          {
            english: 'If you\'re not satisfied, you\'ll get a refund.',
            french: 'Si vous n\'êtes pas satisfait, vous serez remboursé.'
          }
        ],
  tips: '💰 ULTRA courant au TEPITECH ! "Refund" = rembourser/remboursement, "Discount" = réduction.'
      }
    ],
    exercises: [
      {
        id: 'ex8_1',
        type: 'multiple-choice',
        question: 'A "misprint" is:',
        options: [
          'A mistake in pricing',
          'A printing error',
          'A missing product',
          'A delayed shipment'
        ],
        correctAnswer: 'A printing error',
        explanation: '"Misprint" = une erreur d\'impression ou coquille dans un document imprimé.'
      },
      {
        id: 'ex8_2',
        type: 'fill-blank',
        question: 'Complete: "We ___ for the inconvenience caused." (s\'excuser)',
        correctAnswer: 'apologize',
        explanation: '"To apologize" = s\'excuser. Structure : apologize TO someone FOR something.'
      },
      {
        id: 'ex8_3',
        type: 'multiple-choice',
        question: 'An "outlet" is:',
        options: [
          'An exit door',
          'A power socket',
          'A retail store',
          'An online shop'
        ],
        correctAnswer: 'A retail store',
        explanation: 'Dans un contexte business, "outlet" = point de vente ou magasin d\'usine.'
      },
      {
        id: 'ex8_4',
        type: 'translation',
        question: 'Translate: "Nous offrons un remboursement complet."',
        correctAnswer: 'We offer a full refund',
        explanation: '"Refund" = remboursement. "Full refund" = remboursement complet.'
      },
      {
        id: 'ex8_5',
        type: 'multiple-choice',
        question: 'A person who buys a franchise is called:',
        options: [
          'A franchisor',
          'A franchisee',
          'A franchise owner',
          'A seller'
        ],
        correctAnswer: 'A franchisee',
        explanation: '"Franchisee" = le franchisé (celui qui achète). "Franchisor" = le franchiseur (celui qui vend).'
      }
    ]
  },
  {
    id: 9,
    title: 'RH et Management',
    description: 'Vocabulaire des ressources humaines',
    theme: 'HR & Management',
    xp: 60,
    duration: 6,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'Layoffs',
        french: 'Licenciements (économiques)',
        phonetic: '/ˈleɪɒfs/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'Because of the economic crisis, the company announced substantial layoffs.',
            french: 'En raison de la crise économique, l\'entreprise a annoncé des licenciements importants.'
          },
          {
            english: 'The layoffs will affect 200 employees across three departments.',
            french: 'Les licenciements affecteront 200 employés dans trois départements.'
          },
          {
            english: 'We hope to avoid layoffs by reducing costs elsewhere.',
            french: 'Nous espérons éviter les licenciements en réduisant les coûts ailleurs.'
          }
        ],
        tips: '⚠️ "Layoffs" = licenciements économiques (pas pour faute). Toujours au pluriel dans ce sens.'
      },
      {
        english: 'To foster',
        french: 'Encourager / Favoriser',
        phonetic: '/ˈfɒstər/',
        category: 'Verb',
        frequency: 'important',
        examples: [
          {
            english: 'We want to foster a sense of teamwork among employees.',
            french: 'Nous voulons favoriser un esprit d\'équipe parmi les employés.'
          },
          {
            english: 'The new policy will foster innovation and creativity.',
            french: 'La nouvelle politique encouragera l\'innovation et la créativité.'
          },
          {
            english: 'Good communication fosters trust in the workplace.',
            french: 'Une bonne communication favorise la confiance au travail.'
          }
        ],
        tips: '💡 "To foster" = encourager le développement de quelque chose de positif (culture, innovation, etc.).'
      },
      {
        english: 'Feedback',
        french: 'Retour / Commentaires',
        phonetic: '/ˈfiːdbæk/',
        category: 'Noun',
        frequency: 'essential',
        examples: [
          {
            english: 'Could you provide some feedback on my proposal?',
            french: 'Pourriez-vous me donner votre avis sur ma proposition ?'
          },
          {
            english: 'We appreciate all customer feedback to improve our services.',
            french: 'Nous apprécions tous les retours clients pour améliorer nos services.'
          },
          {
            english: 'The manager gave positive feedback on the project.',
            french: 'Le manager a donné un retour positif sur le projet.'
          }
        ],
        tips: '🔥 ULTRA fréquent ! "Feedback" est indénombrable (pas de "s" : "some feedback", pas "feedbacks").'
      },
      {
        english: 'Facility',
        french: 'Installation / Établissement',
        phonetic: '/fəˈsɪləti/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'The new generator powers the entire manufacturing facility.',
            french: 'Le nouveau générateur alimente toute l\'installation de fabrication.'
          },
          {
            english: 'Our company operates three facilities in Asia.',
            french: 'Notre entreprise exploite trois établissements en Asie.'
          },
          {
            english: 'The training facility is equipped with the latest technology.',
            french: 'Le centre de formation est équipé des dernières technologies.'
          }
        ],
        tips: '🏭 "Facility" = le lieu physique (usine, centre, installation). Pluriel : "facilities".'
      },
      {
        english: 'To take time off',
        french: 'Prendre des congés',
        phonetic: '/teɪk taɪm ɒf/',
        category: 'Expression',
        frequency: 'essential',
        examples: [
          {
            english: 'Why don\'t you take a few days off to relax?',
            french: 'Pourquoi ne prends-tu pas quelques jours de congé pour te détendre ?'
          },
          {
            english: 'I need to take time off for a family emergency.',
            french: 'Je dois prendre des congés pour une urgence familiale.'
          },
          {
            english: 'Employees are encouraged to take time off during the summer.',
            french: 'Les employés sont encouragés à prendre des congés pendant l\'été.'
          }
        ],
        tips: '🏖️ Expression courante pour parler de congés ou vacances. "Time off" = temps libre.'
      }
    ],
    exercises: [
      {
        id: 'ex9_1',
        type: 'multiple-choice',
        question: '"Layoffs" refers to:',
        options: [
          'Hiring new employees',
          'Economic dismissals',
          'Employee promotions',
          'Training sessions'
        ],
        correctAnswer: 'Economic dismissals',
        explanation: '"Layoffs" = licenciements économiques (pour raisons financières, pas pour faute).'
      },
      {
        id: 'ex9_2',
        type: 'fill-blank',
        question: 'Complete: "We need your ___ on the new design." (retour/avis)',
        correctAnswer: 'feedback',
        explanation: '"Feedback" = retour, avis, commentaires. Mot indénombrable (pas de pluriel).'
      },
      {
        id: 'ex9_3',
        type: 'multiple-choice',
        question: '"To foster teamwork" means:',
        options: [
          'To force teamwork',
          'To encourage teamwork',
          'To eliminate teamwork',
          'To avoid teamwork'
        ],
        correctAnswer: 'To encourage teamwork',
        explanation: '"To foster" = encourager, favoriser le développement de quelque chose.'
      },
      {
        id: 'ex9_4',
        type: 'translation',
        question: 'Translate: "Je dois prendre quelques jours de congé."',
        correctAnswer: 'I need to take a few days off',
        explanation: '"To take time off" = prendre des congés. "Days off" = jours de congé.'
      },
      {
        id: 'ex9_5',
        type: 'multiple-choice',
        question: 'A "facility" is:',
        options: [
          'An easy task',
          'A physical building/location',
          'A special ability',
          'A discount'
        ],
        correctAnswer: 'A physical building/location',
        explanation: '"Facility" = installation, établissement, usine (le lieu physique).'
      }
    ]
  },
  {
    id: 10,
    title: 'Voyage et Douanes',
    description: 'Vocabulaire des voyages d\'affaires et formalités',
    theme: 'Travel & Logistics',
    xp: 55,
    duration: 6,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'Customs',
        french: 'La douane',
        phonetic: '/ˈkʌstəmz/',
        category: 'Noun',
        frequency: 'important',
        examples: [
          {
            english: 'You must complete the customs declaration form before landing.',
            french: 'Vous devez remplir le formulaire de déclaration en douane avant l\'atterrissage.'
          },
          {
            english: 'All passengers must go through customs after arrival.',
            french: 'Tous les passagers doivent passer par la douane après leur arrivée.'
          },
          {
            english: 'The package is held up in customs.',
            french: 'Le colis est bloqué à la douane.'
          }
        ],
        tips: '✈️ Toujours avec un "s" : "customs" (la douane). "Customs officer" = douanier.'
      },
      {
        english: 'To fill out',
        french: 'Remplir (un formulaire)',
        phonetic: '/fɪl aʊt/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'Passengers are required to fill out the white form.',
            french: 'Les passagers doivent remplir le formulaire blanc.'
          },
          {
            english: 'Please fill out this application form completely.',
            french: 'Veuillez remplir ce formulaire de candidature complètement.'
          },
          {
            english: 'Don\'t forget to fill out the survey before leaving.',
            french: 'N\'oubliez pas de remplir le sondage avant de partir.'
          }
        ],
        tips: '⚠️ Pour les formulaires, on dit "fill OUT" (pas "fill up"). "Fill up" = remplir un réservoir.'
      },
      {
        english: 'Valid',
        french: 'Valide / En cours de validité',
        phonetic: '/ˈvælɪd/',
        category: 'Adjective',
        frequency: 'important',
        examples: [
          {
            english: 'You must have a valid passport to enter the country.',
            french: 'Vous devez avoir un passeport valide pour entrer dans le pays.'
          },
          {
            english: 'This ticket is valid for three months.',
            french: 'Ce billet est valable trois mois.'
          },
          {
            english: 'Please ensure your credit card is still valid.',
            french: 'Veuillez vous assurer que votre carte bancaire est toujours valide.'
          }
        ],
        tips: '📋 Très utilisé pour parler de documents, billets, cartes en cours de validité.'
      }
    ],
    exercises: [
      {
        id: 'ex10_1',
        type: 'multiple-choice',
        question: '"Customs" refers to:',
        options: [
          'Traditional practices',
          'Border control for goods',
          'Customer service',
          'Customized products'
        ],
        correctAnswer: 'Border control for goods',
        explanation: '"Customs" (toujours avec "s") = la douane, le contrôle des marchandises aux frontières.'
      },
      {
        id: 'ex10_2',
        type: 'fill-blank',
        question: 'Complete: "Please ___ ___ this form in capital letters."',
        correctAnswer: 'fill out',
        explanation: '"To fill out" = remplir (un formulaire). On dit "fill out" pour les documents.'
      },
      {
        id: 'ex10_3',
        type: 'multiple-choice',
        question: 'If your passport is "valid", it means:',
        options: [
          'It is expired',
          'It is in good condition',
          'It is current and usable',
          'It is damaged'
        ],
        correctAnswer: 'It is current and usable',
        explanation: '"Valid" = valide, en cours de validité (pas expiré).'
      },
      {
        id: 'ex10_4',
        type: 'translation',
        question: 'Translate: "Tous les passagers doivent passer par la douane."',
        correctAnswer: 'All passengers must go through customs',
        explanation: '"Customs" = la douane. "To go through customs" = passer la douane.'
      },
      {
        id: 'ex10_5',
        type: 'multiple-choice',
        question: 'Which is correct for forms?',
        options: [
          'Fill in',
          'Fill out',
          'Fill up',
          'Both A and B'
        ],
        correctAnswer: 'Both A and B',
        explanation: 'On peut dire "fill in" ou "fill out" pour les formulaires. "Fill up" = remplir un réservoir.'
      }
    ]
  },
  {
    id: 11,
    title: 'Connecteurs et Grammaire',
  description: 'Mots de liaison essentiels pour le TEPITECH',
    theme: 'Grammar & Linking',
    xp: 75,
    duration: 9,
    locked: true,
    completed: false,
    status: 'locked',
    words: [
      {
        english: 'However',
        french: 'Cependant / Toutefois',
        phonetic: '/haʊˈevər/',
        category: 'Connector',
        frequency: 'essential',
        examples: [
          {
            english: 'The product is great; however, it is quite expensive.',
            french: 'Le produit est excellent ; cependant, il est assez cher.'
          },
          {
            english: 'We wanted to hire more staff. However, the budget doesn\'t allow it.',
            french: 'Nous voulions embaucher plus de personnel. Toutefois, le budget ne le permet pas.'
          },
          {
            english: 'The report was late. However, the quality was excellent.',
            french: 'Le rapport était en retard. Cependant, la qualité était excellente.'
          }
        ],
        tips: '🔥 CRUCIAL pour Part 5 ! Marque le contraste. Souvent précédé d\'un point-virgule ou point.'
      },
      {
        english: 'Rather than',
        french: 'Plutôt que',
        phonetic: '/ˈrɑːðər ðæn/',
        category: 'Connector',
        frequency: 'important',
        examples: [
          {
            english: 'The discount is 15% rather than 55%.',
            french: 'La réduction est de 15% plutôt que 55%.'
          },
          {
            english: 'We decided to email rather than call.',
            french: 'Nous avons décidé d\'envoyer un email plutôt que d\'appeler.'
          },
          {
            english: 'Choose quality rather than quantity.',
            french: 'Choisissez la qualité plutôt que la quantité.'
          }
        ],
        tips: '💡 Marque la préférence ou la correction. Suivi d\'un verbe de même forme (email/call).'
      },
      {
        english: 'Because of',
        french: 'À cause de / En raison de',
        phonetic: '/bɪˈkɒz əv/',
        category: 'Connector',
        frequency: 'essential',
        examples: [
          {
            english: 'Because of the rain, the event was canceled.',
            french: 'En raison de la pluie, l\'événement a été annulé.'
          },
          {
            english: 'We lost the contract because of their lower prices.',
            french: 'Nous avons perdu le contrat à cause de leurs prix plus bas.'
          },
          {
            english: 'Because of staff shortages, we\'re hiring.',
            french: 'En raison du manque de personnel, nous recrutons.'
          }
        ],
        tips: '⚠️ "Because of" + NOM. "Because" + PHRASE. Ex: Because of the rain ≠ Because it rained.'
      },
      {
        english: 'Since',
        french: 'Depuis / Puisque',
        phonetic: '/sɪns/',
        category: 'Connector',
        frequency: 'essential',
        examples: [
          {
            english: 'We have grown since 1997. (temps)',
            french: 'Nous avons grandi depuis 1997.'
          },
          {
            english: 'Since the departments collaborate, let\'s put them in the same room. (cause)',
            french: 'Puisque les départements collaborent, mettons-les dans la même salle.'
          },
          {
            english: 'I\'ve been working here since January.',
            french: 'Je travaille ici depuis janvier.'
          }
        ],
        tips: '🎯 DOUBLE SENS ! 1) Depuis (temps) avec present perfect. 2) Puisque (cause) = because.'
      },
      {
        english: 'Capable of + ING',
        french: 'Capable de',
        phonetic: '/ˈkeɪpəbl əv/',
        category: 'Expression',
        frequency: 'important',
        examples: [
          {
            english: 'This machine is capable of reducing costs by 30%.',
            french: 'Cette machine est capable de réduire les coûts de 30%.'
          },
          {
            english: 'Our team is capable of handling large projects.',
            french: 'Notre équipe est capable de gérer de grands projets.'
          },
          {
            english: 'She\'s capable of managing multiple tasks simultaneously.',
            french: 'Elle est capable de gérer plusieurs tâches simultanément.'
          }
        ],
        tips: '⚠️ PIÈGE FRÉQUENT ! Après "capable OF", toujours verbe+ING (jamais infinitif). OF = préposition.'
      }
    ],
    exercises: [
      {
        id: 'ex11_1',
        type: 'multiple-choice',
        question: 'Choose the correct sentence:',
        options: [
          'However the price, we will buy it.',
          'The price is high; however, we will buy it.',
          'However, the price is high we will buy it.',
          'The price however is high.'
        ],
        correctAnswer: 'The price is high; however, we will buy it.',
        explanation: '"However" relie deux phrases contrastées. Souvent avec point-virgule avant et virgule après.'
      },
      {
        id: 'ex11_2',
        type: 'fill-blank',
        question: 'Complete: "___ ___ the weather, the event is postponed."',
        correctAnswer: 'Because of',
        explanation: '"Because of" + NOM (the weather). "Because" serait suivi d\'une phrase complète.'
      },
      {
        id: 'ex11_3',
        type: 'multiple-choice',
        question: 'Which is correct?',
        options: [
          'The machine is capable to reduce costs.',
          'The machine is capable of reduce costs.',
          'The machine is capable of reducing costs.',
          'The machine capable reducing costs.'
        ],
        correctAnswer: 'The machine is capable of reducing costs.',
        explanation: 'Après "capable OF" (préposition), on utilise toujours le verbe+ING.'
      },
      {
        id: 'ex11_4',
        type: 'translation',
        question: 'Translate: "Nous travaillons ici depuis 2010."',
        correctAnswer: 'We have been working here since 2010',
        explanation: '"Since" (temps) + present perfect. "Since 2010" = depuis 2010.'
      },
      {
        id: 'ex11_5',
        type: 'multiple-choice',
        question: 'In "since the departments collaborate...", "since" means:',
        options: [
          'From that time',
          'Because/as',
          'After',
          'During'
        ],
        correctAnswer: 'Because/as',
        explanation: 'Ici "since" = cause (puisque). "Since" peut signifier "depuis" (temps) ou "puisque" (cause).'
      }
    ]
  },
  {
    id: 12,
    title: 'Noms d\'Affaires Essentiels',
    description: 'Vocabulaire professionnel qui revient constamment',
    theme: 'Vocabulaire Business',
    xp: 60,
    duration: 8,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'Comptroller',
        french: 'Contrôleur financier',
        phonetic: '/kənˈtroʊlər/',
        category: 'Poste/Fonction',
        frequency: 'essential',
        examples: [
          {
            english: 'The comptroller reviewed the financial forecasts.',
            french: 'Le contrôleur financier a examiné les prévisions financières.'
          },
          {
            english: 'Our comptroller manages all accounting operations.',
            french: 'Notre contrôleur financier gère toutes les opérations comptables.'
          },
          {
            english: 'Report these figures to the comptroller.',
            french: 'Rapportez ces chiffres au contrôleur financier.'
          }
        ],
  tips: '🔥 TRÈS FRÉQUENT au TEPITECH ! Attention à l\'orthographe : comptroller (pas "controller").'
      },
      {
        english: 'Competitors',
        french: 'Concurrents',
        phonetic: '/kəmˈpetɪtərz/',
        category: 'Business',
        frequency: 'essential',
        examples: [
          {
            english: 'Our competitors are launching new products.',
            french: 'Nos concurrents lancent de nouveaux produits.'
          },
          {
            english: 'We need to stay ahead of our competitors.',
            french: 'Nous devons garder une longueur d\'avance sur nos concurrents.'
          },
          {
            english: 'The company outperformed its competitors.',
            french: 'L\'entreprise a surpassé ses concurrents.'
          }
        ],
        tips: '⚠️ Toujours au pluriel dans le contexte business ! Ne pas confondre avec "competition".'
      },
      {
        english: 'Trade barriers',
        french: 'Barrières commerciales',
        phonetic: '/treɪd ˈbæriərz/',
        category: 'Commerce international',
        frequency: 'important',
        examples: [
          {
            english: 'The government reduced trade barriers.',
            french: 'Le gouvernement a réduit les barrières commerciales.'
          },
          {
            english: 'Trade barriers affect import costs.',
            french: 'Les barrières commerciales affectent les coûts d\'importation.'
          },
          {
            english: 'We must comply with international trade barriers.',
            french: 'Nous devons nous conformer aux barrières commerciales internationales.'
          }
        ],
        tips: '📊 Expression fixe ! Toujours "trade barriers" ensemble, jamais "trading barriers".'
      },
      {
        english: 'Audit controls',
        french: 'Contrôles d\'audit',
        phonetic: '/ˈɔːdɪt kənˈtroʊlz/',
        category: 'Finance/Comptabilité',
        frequency: 'important',
        examples: [
          {
            english: 'The bank implemented strict audit controls.',
            french: 'La banque a mis en place des contrôles d\'audit stricts.'
          },
          {
            english: 'Audit controls ensure financial accuracy.',
            french: 'Les contrôles d\'audit garantissent l\'exactitude financière.'
          },
          {
            english: 'We conduct regular audit controls.',
            french: 'Nous effectuons des contrôles d\'audit réguliers.'
          }
        ],
        tips: '💼 Souvent au pluriel dans le contexte professionnel !'
      },
      {
        english: 'Forecast',
        french: 'Prévision',
        phonetic: '/ˈfɔːrkæst/',
        category: 'Business/Planification',
        frequency: 'essential',
        examples: [
          {
            english: 'The sales forecast looks promising.',
            french: 'Les prévisions de ventes semblent prometteuses.'
          },
          {
            english: 'We need to update our financial forecast.',
            french: 'Nous devons mettre à jour nos prévisions financières.'
          },
          {
            english: 'The weather forecast affected our delivery schedule.',
            french: 'Les prévisions météorologiques ont affecté notre calendrier de livraison.'
          }
        ],
        tips: '🎯 Peut être nom OU verbe ! "to forecast" (prévoir) / "a forecast" (une prévision).'
      },
      {
        english: 'Workload',
        french: 'Charge de travail',
        phonetic: '/ˈwɜːrkloʊd/',
        category: 'Travail',
        frequency: 'essential',
        examples: [
          {
            english: 'My workload has increased this month.',
            french: 'Ma charge de travail a augmenté ce mois-ci.'
          },
          {
            english: 'Can you handle this additional workload?',
            french: 'Peux-tu gérer cette charge de travail supplémentaire ?'
          },
          {
            english: 'We need to distribute the workload evenly.',
            french: 'Nous devons répartir la charge de travail équitablement.'
          }
        ],
        tips: '💪 Un seul mot ! Pas "work load" séparé.'
      }
    ],
    exercises: [
      {
        id: 'v12-ex1',
        type: 'multiple-choice',
        question: 'The _____ approved the annual budget.',
        options: ['comptroller', 'controller', 'compte-roller', 'comptroler'],
        correctAnswer: 'comptroller',
        explanation: 'L\'orthographe correcte est "comptroller" (contrôleur financier).'
      },
      {
        id: 'v12-ex2',
        type: 'multiple-choice',
        question: 'Our _____ are offering lower prices.',
        options: ['competition', 'competitors', 'competitive', 'compete'],
        correctAnswer: 'competitors',
        explanation: '"Competitors" = concurrents (nom pluriel).'
      },
      {
        id: 'v12-ex3',
        type: 'multiple-choice',
        question: 'The company reduced _____ barriers to expand globally.',
        options: ['trade', 'trading', 'trader', 'traded'],
        correctAnswer: 'trade',
        explanation: 'Expression fixe : "trade barriers" (barrières commerciales).'
      },
      {
        id: 'v12-ex4',
        type: 'multiple-choice',
        question: 'The sales _____ indicates strong growth.',
        options: ['forecast', 'forecastle', 'for cast', 'forecasted'],
        correctAnswer: 'forecast',
        explanation: '"Forecast" (nom) = prévision. Un seul mot !'
      },
      {
        id: 'v12-ex5',
        type: 'multiple-choice',
        question: 'The _____ is too heavy this week.',
        options: ['work load', 'workload', 'work-load', 'working load'],
        correctAnswer: 'workload',
        explanation: '"Workload" s\'écrit en un seul mot = charge de travail.'
      }
    ]
  },
  {
    id: 13,
    title: 'Adverbes de Manière et Degré',
    description: 'Mots essentiels pour nuancer vos phrases',
  theme: 'Adverbes TEPITECH',
    xp: 65,
    duration: 9,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'Approximately',
        french: 'Approximativement / Environ',
        phonetic: '/əˈprɑːksɪmətli/',
        category: 'Adverbe de degré',
        frequency: 'essential',
        examples: [
          {
            english: 'The package will arrive approximately at 7:00 PM.',
            french: 'Le colis arrivera environ à 19h.'
          },
          {
            english: 'There were approximately 200 attendees.',
            french: 'Il y avait environ 200 participants.'
          },
          {
            english: 'The project will cost approximately $50,000.',
            french: 'Le projet coûtera environ 50 000 $.'
          }
        ],
  tips: '⏰ ULTRA FRÉQUENT avec les heures, quantités et coûts au TEPITECH !'
      },
      {
        english: 'Hardly',
        french: 'À peine / Presque pas',
        phonetic: '/ˈhɑːrdli/',
        category: 'Adverbe négatif',
        frequency: 'essential',
        examples: [
          {
            english: 'There is hardly any food left.',
            french: 'Il ne reste presque pas de nourriture.'
          },
          {
            english: 'I can hardly hear you.',
            french: 'Je t\'entends à peine.'
          },
          {
            english: 'She hardly ever complains.',
            french: 'Elle se plaint presque jamais.'
          }
        ],
        tips: '⚠️ "Hardly" = négatif ! Ne PAS utiliser avec "not" (double négation).'
      },
      {
        english: 'Consequently',
        french: 'Par conséquent / En conséquence',
        phonetic: '/ˈkɑːnsɪkwentli/',
        category: 'Adverbe de conséquence',
        frequency: 'important',
        examples: [
          {
            english: 'Sales dropped; consequently, we reduced staff.',
            french: 'Les ventes ont chuté ; par conséquent, nous avons réduit le personnel.'
          },
          {
            english: 'The delay was costly. Consequently, we changed suppliers.',
            french: 'Le retard était coûteux. En conséquence, nous avons changé de fournisseurs.'
          },
          {
            english: 'He missed the deadline; consequently, he was reprimanded.',
            french: 'Il a raté la date limite ; par conséquent, il a été réprimandé.'
          }
        ],
        tips: '📌 Toujours suivi d\'une virgule ou point-virgule avant !'
      },
      {
        english: 'Frequently',
        french: 'Fréquemment / Souvent',
        phonetic: '/ˈfriːkwəntli/',
        category: 'Adverbe de fréquence',
        frequency: 'essential',
        examples: [
          {
            english: 'We frequently update our policies.',
            french: 'Nous mettons fréquemment à jour nos politiques.'
          },
          {
            english: 'Customers frequently ask this question.',
            french: 'Les clients posent fréquemment cette question.'
          },
          {
            english: 'He travels frequently for business.',
            french: 'Il voyage fréquemment pour affaires.'
          }
        ],
        tips: '🔄 Synonymes : often, regularly, commonly.'
      },
      {
        english: 'Daily',
        french: 'Quotidiennement / Tous les jours',
        phonetic: '/ˈdeɪli/',
        category: 'Adverbe de fréquence',
        frequency: 'essential',
        examples: [
          {
            english: 'We check emails daily.',
            french: 'Nous vérifions les emails quotidiennement.'
          },
          {
            english: 'The report is updated daily.',
            french: 'Le rapport est mis à jour quotidiennement.'
          },
          {
            english: 'She commutes daily to the office.',
            french: 'Elle fait le trajet quotidiennement jusqu\'au bureau.'
          }
        ],
        tips: '📅 Peut être adjectif OU adverbe ! "daily report" / "updated daily".'
      },
      {
        english: 'Superior',
        french: 'Supérieur',
        phonetic: '/suːˈpɪriər/',
        category: 'Adjectif de comparaison',
        frequency: 'important',
        examples: [
          {
            english: 'This product is superior to the competition.',
            french: 'Ce produit est supérieur à la concurrence.'
          },
          {
            english: 'We offer superior customer service.',
            french: 'Nous offrons un service client supérieur.'
          },
          {
            english: 'The quality is superior to what we expected.',
            french: 'La qualité est supérieure à ce que nous attendions.'
          }
        ],
        tips: '⚠️ TOUJOURS suivi de "TO" jamais "than" ! Superior TO (not than).'
      }
    ],
    exercises: [
      {
        id: 'v13-ex1',
        type: 'multiple-choice',
        question: 'The meeting will start _____ at 3 PM.',
        options: ['approximate', 'approximately', 'approximation', 'approximated'],
        correctAnswer: 'approximately',
        explanation: '"Approximately" (adverbe) = environ, modifie l\'heure.'
      },
      {
        id: 'v13-ex2',
        type: 'multiple-choice',
        question: 'There is _____ any time left.',
        options: ['hardly', 'hard', 'hardness', 'harden'],
        correctAnswer: 'hardly',
        explanation: '"Hardly" = à peine, presque pas (adverbe négatif).'
      },
      {
        id: 'v13-ex3',
        type: 'multiple-choice',
        question: 'The system failed; _____, we lost data.',
        options: ['consequent', 'consequently', 'consequence', 'consequential'],
        correctAnswer: 'consequently',
        explanation: '"Consequently" (adverbe) = par conséquent, en conséquence.'
      },
      {
        id: 'v13-ex4',
        type: 'multiple-choice',
        question: 'Our product is _____ to theirs.',
        options: ['superior than', 'superior to', 'more superior', 'superior for'],
        correctAnswer: 'superior to',
        explanation: 'Expression fixe : "superior TO" (jamais "than") !'
      },
      {
        id: 'v13-ex5',
        type: 'multiple-choice',
        question: 'We _____ review our procedures.',
        options: ['frequent', 'frequency', 'frequently', 'frequented'],
        correctAnswer: 'frequently',
        explanation: '"Frequently" (adverbe) = fréquemment, souvent.'
      }
    ]
  },
  {
    id: 14,
    title: 'Verbes d\'Action Professionnels',
    description: 'Verbes essentiels du monde du travail',
    theme: 'Verbes Business',
    xp: 70,
    duration: 10,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'To implement',
        french: 'Mettre en œuvre / Implémenter',
        phonetic: '/ˈɪmplɪment/',
        category: 'Verbe d\'action',
        frequency: 'essential',
        examples: [
          {
            english: 'We will implement the new policy next month.',
            french: 'Nous mettrons en œuvre la nouvelle politique le mois prochain.'
          },
          {
            english: 'The company implemented cost-saving measures.',
            french: 'L\'entreprise a mis en place des mesures d\'économie.'
          },
          {
            english: 'They are implementing a new software system.',
            french: 'Ils sont en train d\'implémenter un nouveau système logiciel.'
          }
        ],
        tips: '🔥 TRÈS FRÉQUENT ! Souvent utilisé avec "policy", "system", "strategy".'
      },
      {
        english: 'To oversee',
        french: 'Superviser / Surveiller',
        phonetic: '/ˌoʊvərˈsiː/',
        category: 'Verbe de management',
        frequency: 'essential',
        examples: [
          {
            english: 'She oversees all marketing operations.',
            french: 'Elle supervise toutes les opérations marketing.'
          },
          {
            english: 'The manager will oversee the project.',
            french: 'Le manager supervisera le projet.'
          },
          {
            english: 'Who oversees the quality control department?',
            french: 'Qui supervise le département contrôle qualité ?'
          }
        ],
        tips: '👀 Verbe irrégulier : oversee / oversaw / overseen.'
      },
      {
        english: 'To ensure',
        french: 'Assurer / Garantir',
        phonetic: '/ɪnˈʃʊr/',
        category: 'Verbe d\'action',
        frequency: 'essential',
        examples: [
          {
            english: 'We must ensure customer satisfaction.',
            french: 'Nous devons assurer la satisfaction client.'
          },
          {
            english: 'Please ensure all documents are signed.',
            french: 'Veuillez vous assurer que tous les documents sont signés.'
          },
          {
            english: 'The system ensures data security.',
            french: 'Le système garantit la sécurité des données.'
          }
        ],
        tips: '⚠️ Ne pas confondre avec "insure" (assurer = insurance).'
      },
      {
        english: 'To procrastinate',
        french: 'Remettre à plus tard / Procrastiner',
        phonetic: '/proʊˈkræstɪneɪt/',
        category: 'Verbe d\'action',
        frequency: 'useful',
        examples: [
          {
            english: 'Don\'t procrastinate on important tasks.',
            french: 'Ne remets pas à plus tard les tâches importantes.'
          },
          {
            english: 'He procrastinated and missed the deadline.',
            french: 'Il a procrastiné et a raté la date limite.'
          },
          {
            english: 'Stop procrastinating and start working!',
            french: 'Arrête de procrastiner et commence à travailler !'
          }
        ],
        tips: '📝 Sens négatif ! Implique un retard volontaire.'
      },
      {
        english: 'To comply (with)',
        french: 'Se conformer à / Respecter',
        phonetic: '/kəmˈplaɪ/',
        category: 'Verbe juridique/business',
        frequency: 'important',
        examples: [
          {
            english: 'All employees must comply with safety regulations.',
            french: 'Tous les employés doivent se conformer aux règles de sécurité.'
          },
          {
            english: 'The company complies with international standards.',
            french: 'L\'entreprise se conforme aux normes internationales.'
          },
          {
            english: 'Failure to comply may result in penalties.',
            french: 'Le non-respect peut entraîner des pénalités.'
          }
        ],
        tips: '⚠️ TOUJOURS avec "WITH" ! Comply WITH (jamais "to" ou "for").'
      }
    ],
    exercises: [
      {
        id: 'v14-ex1',
        type: 'multiple-choice',
        question: 'We will _____ the new system next week.',
        options: ['implement', 'implementation', 'implementing', 'implementer'],
        correctAnswer: 'implement',
        explanation: '"Implement" (verbe) = mettre en œuvre.'
      },
      {
        id: 'v14-ex2',
        type: 'multiple-choice',
        question: 'The director _____ three departments.',
        options: ['oversees', 'oversee', 'overseeing', 'oversight'],
        correctAnswer: 'oversees',
        explanation: '"Oversees" (3e personne) = supervise.'
      },
      {
        id: 'v14-ex3',
        type: 'multiple-choice',
        question: 'We must _____ quality standards.',
        options: ['ensure', 'insure', 'assure', 'unsure'],
        correctAnswer: 'ensure',
        explanation: '"Ensure" = garantir, s\'assurer que.'
      },
      {
        id: 'v14-ex4',
        type: 'multiple-choice',
        question: 'All staff must _____ with company policies.',
        options: ['comply', 'comply with', 'comply to', 'comply for'],
        correctAnswer: 'comply with',
        explanation: 'Expression fixe : "comply WITH" (se conformer à).'
      },
      {
        id: 'v14-ex5',
        type: 'multiple-choice',
        question: 'Stop _____ and submit your report!',
        options: ['procrastinate', 'procrastinating', 'procrastination', 'procrastinator'],
        correctAnswer: 'procrastinating',
        explanation: 'Après "stop", on utilise le gérondif (-ing).'
      }
    ]
  },
  {
    id: 15,
    title: 'Phrasal Verbs Essentiels',
    description: 'Verbes à particules qui tombent souvent',
  theme: 'Phrasal Verbs TEPITECH',
    xp: 75,
    duration: 11,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'To count on',
        french: 'Compter sur / Faire confiance à',
        phonetic: '/kaʊnt ɑːn/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'You can count on me to finish the project.',
            french: 'Tu peux compter sur moi pour finir le projet.'
          },
          {
            english: 'We count on our team members.',
            french: 'Nous comptons sur les membres de notre équipe.'
          },
          {
            english: 'Can I count on your support?',
            french: 'Puis-je compter sur votre soutien ?'
          }
        ],
  tips: '🤝 Exprime la confiance et la fiabilité ! Très courant au TEPITECH.'
      },
      {
        english: 'To find out',
        french: 'Découvrir / Se renseigner',
        phonetic: '/faɪnd aʊt/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'I need to find out when the meeting starts.',
            french: 'J\'ai besoin de découvrir quand la réunion commence.'
          },
          {
            english: 'Let\'s find out more information.',
            french: 'Découvrons plus d\'informations.'
          },
          {
            english: 'How did you find out about this job?',
            french: 'Comment as-tu découvert ce travail ?'
          }
        ],
        tips: '🔍 Implique une recherche active d\'information.'
      },
      {
        english: 'To break down',
        french: 'Tomber en panne / Se décomposer',
        phonetic: '/breɪk daʊn/',
        category: 'Phrasal Verb',
        frequency: 'important',
        examples: [
          {
            english: 'My car broke down on the highway.',
            french: 'Ma voiture est tombée en panne sur l\'autoroute.'
          },
          {
            english: 'The machine broke down during production.',
            french: 'La machine est tombée en panne pendant la production.'
          },
          {
            english: 'The negotiations broke down.',
            french: 'Les négociations ont échoué.'
          }
        ],
        tips: '⚠️ Peut signifier "tomber en panne" (machine) ou "échouer" (négociations).'
      },
      {
        english: 'To stop by',
        french: 'Passer (rapidement) / Faire un saut',
        phonetic: '/stɑːp baɪ/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'Can you stop by my office later?',
            french: 'Peux-tu passer à mon bureau plus tard ?'
          },
          {
            english: 'I\'ll stop by the store on my way home.',
            french: 'Je passerai au magasin en rentrant chez moi.'
          },
          {
            english: 'Feel free to stop by anytime.',
            french: 'N\'hésite pas à passer quand tu veux.'
          }
        ],
        tips: '🚶 Visite courte et informelle ! Très courant dans les emails professionnels.'
      },
      {
        english: 'To turn down',
        french: 'Refuser / Rejeter',
        phonetic: '/tɜːrn daʊn/',
        category: 'Phrasal Verb',
        frequency: 'important',
        examples: [
          {
            english: 'She turned down the job offer.',
            french: 'Elle a refusé l\'offre d\'emploi.'
          },
          {
            english: 'They turned down our proposal.',
            french: 'Ils ont rejeté notre proposition.'
          },
          {
            english: 'I had to turn down the invitation.',
            french: 'J\'ai dû refuser l\'invitation.'
          }
        ],
        tips: '❌ Sens négatif = refuser quelque chose qu\'on vous propose.'
      },
      {
        english: 'To look forward to',
        french: 'Avoir hâte de / Attendre avec impatience',
        phonetic: '/lʊk ˈfɔːrwərd tuː/',
        category: 'Phrasal Verb',
        frequency: 'essential',
        examples: [
          {
            english: 'I look forward to hearing from you.',
            french: 'J\'ai hâte d\'avoir de vos nouvelles.'
          },
          {
            english: 'We look forward to working with you.',
            french: 'Nous avons hâte de travailler avec vous.'
          },
          {
            english: 'She looks forward to the meeting.',
            french: 'Elle attend la réunion avec impatience.'
          }
        ],
        tips: '📧 ULTRA FRÉQUENT dans les emails professionnels ! Toujours suivi de -ING.'
      }
    ],
    exercises: [
      {
        id: 'v15-ex1',
        type: 'multiple-choice',
        question: 'You can _____ me to help you.',
        options: ['count in', 'count on', 'count at', 'count with'],
        correctAnswer: 'count on',
        explanation: '"Count on" = compter sur (faire confiance).'
      },
      {
        id: 'v15-ex2',
        type: 'multiple-choice',
        question: 'I need to _____ more about this project.',
        options: ['find in', 'find up', 'find out', 'find on'],
        correctAnswer: 'find out',
        explanation: '"Find out" = découvrir, se renseigner.'
      },
      {
        id: 'v15-ex3',
        type: 'multiple-choice',
        question: 'The printer _____ this morning.',
        options: ['broke down', 'broke up', 'broke in', 'broke off'],
        correctAnswer: 'broke down',
        explanation: '"Broke down" = est tombé en panne.'
      },
      {
        id: 'v15-ex4',
        type: 'multiple-choice',
        question: 'Please _____ my desk when you have time.',
        options: ['stop at', 'stop by', 'stop in', 'stop on'],
        correctAnswer: 'stop by',
        explanation: '"Stop by" = passer rapidement (visite courte).'
      },
      {
        id: 'v15-ex5',
        type: 'multiple-choice',
        question: 'We _____ hearing from you soon.',
        options: ['look forward', 'look forward to', 'look forwards', 'looking forward'],
        correctAnswer: 'look forward to',
        explanation: 'Expression fixe : "look forward TO" (+ -ing).'
      }
    ]
  },
  {
    id: 16,
    title: 'Conjonctions et Connecteurs',
    description: 'Mots de liaison essentiels pour la cohérence',
    theme: 'Connecteurs Logiques',
    xp: 65,
    duration: 9,
    locked: false,
    completed: false,
    status: 'available',
    words: [
      {
        english: 'Unless',
        french: 'À moins que / Sauf si',
        phonetic: '/ənˈles/',
        category: 'Conjonction conditionnelle',
        frequency: 'essential',
        examples: [
          {
            english: 'We can\'t proceed unless you approve.',
            french: 'Nous ne pouvons pas continuer à moins que vous n\'approuviez.'
          },
          {
            english: 'Unless you finish today, we\'ll miss the deadline.',
            french: 'À moins que tu ne finisses aujourd\'hui, nous raterons la date limite.'
          },
          {
            english: 'Don\'t call me unless it\'s urgent.',
            french: 'Ne m\'appelle pas sauf si c\'est urgent.'
          }
        ],
        tips: '⚠️ "Unless" = condition NÉGATIVE obligatoire ! = "if... not".'
      },
      {
        english: 'Whether... or not',
        french: 'Que... ou non / Si... ou non',
        phonetic: '/ˈweðər ... ɔːr nɑːt/',
        category: 'Conjonction de choix',
        frequency: 'essential',
        examples: [
          {
            english: 'I don\'t know whether he\'ll come or not.',
            french: 'Je ne sais pas s\'il viendra ou non.'
          },
          {
            english: 'Whether you like it or not, we must finish.',
            french: 'Que tu aimes ça ou non, nous devons finir.'
          },
          {
            english: 'Call me whether you find it or not.',
            french: 'Appelle-moi que tu le trouves ou non.'
          }
        ],
        tips: '🔄 Présente DEUX options possibles ! Souvent utilisé dans les questions indirectes.'
      },
      {
        english: 'Whereas',
        french: 'Tandis que / Alors que',
        phonetic: '/werˈæz/',
        category: 'Conjonction de contraste',
        frequency: 'important',
        examples: [
          {
            english: 'Sales increased, whereas costs decreased.',
            french: 'Les ventes ont augmenté, alors que les coûts ont diminué.'
          },
          {
            english: 'He prefers emails, whereas she likes phone calls.',
            french: 'Il préfère les emails, tandis qu\'elle aime les appels téléphoniques.'
          },
          {
            english: 'Accounts payable increased, whereas receivables dropped.',
            french: 'Les comptes créditeurs ont augmenté, alors que les débiteurs ont chuté.'
          }
        ],
        tips: '⚖️ Montre un CONTRASTE fort entre deux situations opposées !'
      },
      {
        english: 'Neither... nor',
        french: 'Ni... ni',
        phonetic: '/ˈnaɪðər ... nɔːr/',
        category: 'Conjonction négative corrélative',
        frequency: 'important',
        examples: [
          {
            english: 'Neither the manager nor the staff were informed.',
            french: 'Ni le manager ni le personnel n\'ont été informés.'
          },
          {
            english: 'I have neither time nor money.',
            french: 'Je n\'ai ni temps ni argent.'
          },
          {
            english: 'The product is neither cheap nor expensive.',
            french: 'Le produit n\'est ni bon marché ni cher.'
          }
        ],
        tips: '❌❌ Double négation ! Toujours "neither... NOR" (pas "or").'
      },
      {
        english: 'In accordance with',
        french: 'Conformément à / En conformité avec',
        phonetic: '/ɪn əˈkɔːrdəns wɪð/',
        category: 'Expression de conformité',
        frequency: 'important',
        examples: [
          {
            english: 'Audits are conducted in accordance with standards.',
            french: 'Les audits sont menés conformément aux normes.'
          },
          {
            english: 'Please act in accordance with company policy.',
            french: 'Veuillez agir conformément à la politique de l\'entreprise.'
          },
          {
            english: 'In accordance with your request, here is the report.',
            french: 'Conformément à votre demande, voici le rapport.'
          }
        ],
        tips: '📋 Expression FIXE formelle ! Très courante dans les documents officiels.'
      }
    ],
    exercises: [
      {
        id: 'v16-ex1',
        type: 'multiple-choice',
        question: '_____ you submit it today, we\'ll be late.',
        options: ['Unless', 'If', 'When', 'Because'],
        correctAnswer: 'Unless',
        explanation: '"Unless" = à moins que, sauf si (condition négative).'
      },
      {
        id: 'v16-ex2',
        type: 'multiple-choice',
        question: 'I don\'t know _____ he will attend.',
        options: ['whether or not', 'if or not', 'weather or not', 'wether or not'],
        correctAnswer: 'whether or not',
        explanation: '"Whether or not" = si... ou non (choix entre deux options).'
      },
      {
        id: 'v16-ex3',
        type: 'multiple-choice',
        question: 'Sales rose, _____ profits fell.',
        options: ['whereas', 'while', 'during', 'because'],
        correctAnswer: 'whereas',
        explanation: '"Whereas" = tandis que (contraste fort).'
      },
      {
        id: 'v16-ex4',
        type: 'multiple-choice',
        question: '_____ the CEO _____ the board approved.',
        options: ['Neither... nor', 'Either... or', 'Both... and', 'Not... but'],
        correctAnswer: 'Neither... nor',
        explanation: '"Neither... nor" = ni... ni (double négation).'
      },
      {
        id: 'v16-ex5',
        type: 'multiple-choice',
        question: 'The audit was done _____ international standards.',
        options: ['in accordance with', 'in accordance to', 'in accordance for', 'in accordance of'],
        correctAnswer: 'in accordance with',
        explanation: 'Expression fixe : "in accordance WITH" (conformément à).'
      }
    ]
  }
];
