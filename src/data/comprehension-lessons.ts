import { ComprehensionLesson } from '@/types/lesson';

export const comprehensionLessons: ComprehensionLesson[] = [
  {
    id: 1,
    title: 'Lire des Emails Professionnels',
    description: 'Comprendre les emails d\'entreprise rapidement',
    theme: 'Communication professionnelle',
    xp: 80,
    duration: 12,
    locked: false,
    completed: false,
    status: 'available',
    strategies: [
      {
        title: 'Identifier l\'expéditeur et le destinataire',
        explanation: 'Regardez toujours "From:" et "To:" en premier',
        tips: '📧 Cela vous dit QUI communique avec QUI = contexte clé !',
        examples: [
          'From: manager@company.com → Un supérieur',
          'To: all-staff@company.com → Message général',
          'CC: hr@company.com → RH en copie = important'
        ]
      },
      {
        title: 'Repérer l\'objet (Subject)',
        explanation: 'Le sujet résume le contenu principal',
        tips: '🎯 L\'objet contient souvent la réponse à "What is the email about?"',
        examples: [
          'Subject: Office Relocation → Déménagement',
          'Subject: New Policy Update → Nouvelle politique',
          'Subject: Meeting Reminder → Rappel de réunion'
        ]
      },
      {
        title: 'Trouver l\'action demandée',
        explanation: 'Cherchez les verbes d\'action : "please", "must", "should"',
        tips: '✅ Les questions demandent souvent "What is the reader asked to do?"',
        examples: [
          'Please submit your report by Friday.',
          'You must attend the training session.',
          'Employees should review the new guidelines.'
        ]
      },
      {
        title: 'Identifier les dates et délais',
        explanation: 'Les dates sont des informations clés',
        tips: '📅 Souvent testées : "When is the deadline?" "When will it happen?"',
        examples: [
          'by Friday, March 15th → Date limite',
          'starting next Monday → Date de début',
          'no later than 5 PM → Heure limite'
        ]
      }
    ],
    passages: [
      {
        id: 'comp1-p1',
        text: `From: Sarah Chen <s.chen@techcorp.com>
To: All Staff <staff@techcorp.com>
Subject: Office Renovation Schedule
Date: Monday, June 5, 2023

Dear Team,

I am writing to inform you that our office will undergo renovation starting June 12th. The work will take approximately three weeks to complete.

During this period, please note the following:
- Parking will be limited. Carpooling is encouraged.
- The cafeteria will remain open.
- Meeting rooms on the 2nd floor will be unavailable.
- Please remove personal items from your desks by June 9th.

If you have any questions, contact the facilities department.

Best regards,
Sarah Chen
Office Manager`,
        type: 'email'
      }
    ],
    exercises: [
      {
        id: 'comp1-ex1',
        type: 'multiple-choice',
        question: 'What is the main purpose of this email?',
        options: [
          'To announce parking changes',
          'To inform about office renovation',
          'To close the cafeteria',
          'To hire new staff'
        ],
        correctAnswer: 'To inform about office renovation',
        explanation: 'Le sujet "Office Renovation Schedule" et la première phrase indiquent clairement le but.'
      },
      {
        id: 'comp1-ex2',
        type: 'multiple-choice',
        question: 'When should employees remove personal items?',
        options: [
          'June 5th',
          'June 9th',
          'June 12th',
          'Three weeks later'
        ],
        correctAnswer: 'June 9th',
        explanation: 'Clairement indiqué : "Please remove personal items from your desks by June 9th."'
      },
      {
        id: 'comp1-ex3',
        type: 'multiple-choice',
        question: 'What will remain open during renovation?',
        options: [
          'Meeting rooms',
          'Parking lot',
          'Cafeteria',
          '2nd floor'
        ],
        correctAnswer: 'Cafeteria',
        explanation: 'Le texte dit : "The cafeteria will remain open."'
      },
      {
        id: 'comp1-ex4',
        type: 'multiple-choice',
        question: 'Who should employees contact for questions?',
        options: [
          'Sarah Chen',
          'All Staff',
          'Office Manager',
          'Facilities department'
        ],
        correctAnswer: 'Facilities department',
        explanation: 'Dernière instruction : "contact the facilities department."'
      },
      {
        id: 'comp1-ex5',
        type: 'multiple-choice',
        question: 'How long will the renovation take?',
        options: [
          'One week',
          'Two weeks',
          'Three weeks',
          'One month'
        ],
        correctAnswer: 'Three weeks',
        explanation: 'Le texte indique : "approximately three weeks to complete."'
      }
    ]
  },
  {
    id: 2,
    title: 'Comprendre des Annonces',
    description: 'Analyser les annonces et communications officielles',
    theme: 'Communication d\'entreprise',
    xp: 75,
    duration: 11,
    locked: false,
    completed: false,
    status: 'available',
    strategies: [
      {
        title: 'Identifier le type d\'annonce',
        explanation: 'Est-ce une offre d\'emploi, une promotion, un changement ?',
        tips: '🔍 Le titre et les premiers mots donnent le contexte',
        examples: [
          'JOB OPENING → Offre d\'emploi',
          'POLICY UPDATE → Changement de politique',
          'SPECIAL OFFER → Promotion commerciale'
        ]
      },
      {
        title: 'Repérer les qualifications requises',
        explanation: 'Pour les offres d\'emploi, notez les exigences',
        tips: '✓ Cherchez "Requirements:", "Qualifications:", "Must have"',
        examples: [
          'Minimum 3 years experience',
          'Bachelor\'s degree required',
          'Fluent in English and Spanish'
        ]
      },
      {
        title: 'Trouver les instructions d\'action',
        explanation: 'Comment postuler ou répondre ?',
        tips: '📝 Cherchez "To apply:", "Contact:", "Visit:"',
        examples: [
          'Send resume to hr@company.com',
          'Apply online at www.jobs.com',
          'Call (555) 123-4567 for details'
        ]
      }
    ],
    passages: [
      {
        id: 'comp2-p1',
        text: `MARKETING COORDINATOR POSITION AVAILABLE

GreenTech Solutions is seeking a Marketing Coordinator to join our dynamic team. This is a full-time position based in our downtown Seattle office.

Responsibilities:
• Develop marketing campaigns
• Manage social media accounts
• Coordinate promotional events
• Analyze market trends

Requirements:
• Bachelor's degree in Marketing or related field
• Minimum 2 years of marketing experience
• Excellent communication skills
• Proficiency in Adobe Creative Suite

We offer competitive salary, health benefits, and opportunities for professional development.

To apply: Send your resume and cover letter to careers@greentech.com by July 15th.`,
        type: 'announcement'
      }
    ],
    exercises: [
      {
        id: 'comp2-ex1',
        type: 'multiple-choice',
        question: 'What position is being advertised?',
        options: [
          'Marketing Manager',
          'Marketing Coordinator',
          'Social Media Manager',
          'Event Coordinator'
        ],
        correctAnswer: 'Marketing Coordinator',
        explanation: 'Le titre indique clairement "MARKETING COORDINATOR POSITION AVAILABLE".'
      },
      {
        id: 'comp2-ex2',
        type: 'multiple-choice',
        question: 'What is NOT listed as a responsibility?',
        options: [
          'Develop marketing campaigns',
          'Manage social media',
          'Hire new employees',
          'Analyze market trends'
        ],
        correctAnswer: 'Hire new employees',
        explanation: 'Cette tâche n\'est pas mentionnée dans les responsabilités.'
      },
      {
        id: 'comp2-ex3',
        type: 'multiple-choice',
        question: 'How much experience is required?',
        options: [
          '1 year',
          '2 years',
          '3 years',
          'No experience needed'
        ],
        correctAnswer: '2 years',
        explanation: 'Les exigences indiquent "Minimum 2 years of marketing experience".'
      },
      {
        id: 'comp2-ex4',
        type: 'multiple-choice',
        question: 'What is the application deadline?',
        options: [
          'July 1st',
          'July 10th',
          'July 15th',
          'July 31st'
        ],
        correctAnswer: 'July 15th',
        explanation: 'Dernière ligne : "by July 15th."'
      },
      {
        id: 'comp2-ex5',
        type: 'multiple-choice',
        question: 'Where should applications be sent?',
        options: [
          'greentech.com',
          'careers@greentech.com',
          'hr@greentech.com',
          'By mail to Seattle office'
        ],
        correctAnswer: 'careers@greentech.com',
        explanation: 'Instructions : "Send your resume and cover letter to careers@greentech.com".'
      }
    ]
  },
  {
    id: 3,
    title: 'Lire des Articles et Rapports',
    description: 'Extraire les informations clés des textes longs',
    theme: 'Lecture analytique',
    xp: 90,
    duration: 15,
    locked: false,
    completed: false,
    status: 'available',
    strategies: [
      {
        title: 'Lire le titre et l\'introduction',
        explanation: 'Le premier paragraphe résume souvent tout l\'article',
        tips: '📰 Technique journalistique : l\'essentiel est au début !',
        examples: [
          'Titre → Sujet principal',
          '1er paragraphe → Qui, Quoi, Quand, Où, Pourquoi',
          'Dernière phrase intro → Souvent la thèse'
        ]
      },
      {
        title: 'Identifier les mots de transition',
        explanation: 'Ils structurent le texte et annoncent les idées',
        tips: '🔗 However, Moreover, Therefore = changements d\'idée',
        examples: [
          'However → Contraste',
          'Moreover → Ajout d\'information',
          'Therefore → Conclusion logique'
        ]
      },
      {
        title: 'Repérer les chiffres et données',
        explanation: 'Les statistiques sont souvent testées',
        tips: '📊 Pourcentages, dates, montants = réponses potentielles',
        examples: [
          '25% increase → Hausse de 25%',
          '$2 million revenue → Revenu de 2M$',
          'Q3 2023 → Troisième trimestre 2023'
        ]
      },
      {
        title: 'Conclusion = Résumé',
        explanation: 'Le dernier paragraphe récapitule les points clés',
        tips: '🎯 Si le temps manque, lisez intro + conclusion !',
        examples: [
          'In conclusion → Résumé final',
          'To sum up → Pour résumer',
          'Overall → Dans l\'ensemble'
        ]
      }
    ],
    passages: [
      {
        id: 'comp3-p1',
        text: `TechStart Inc. Reports Record Growth in Q3

TechStart Inc., a leading software development company, announced impressive financial results for the third quarter of 2023. The company's revenue reached $5.2 million, representing a 35% increase compared to the same period last year.

CEO Jennifer Martinez attributed this success to the launch of their new cloud-based platform, CloudFlow, which has attracted over 10,000 users since its release in July. "Our investment in innovation is paying off," Martinez stated during the quarterly earnings call.

The company also expanded its workforce, hiring 50 new employees to meet growing demand. TechStart now employs 200 people across three offices in San Francisco, Austin, and Boston.

Looking ahead, the company plans to enter the European market in early 2024. "We see tremendous opportunities abroad," added Martinez. Analysts predict continued growth, with some forecasting revenues could reach $7 million by year-end.

Despite economic uncertainties, TechStart remains optimistic about its future prospects.`,
        type: 'article'
      }
    ],
    exercises: [
      {
        id: 'comp3-ex1',
        type: 'multiple-choice',
        question: 'What was TechStart\'s Q3 2023 revenue?',
        options: [
          '$3.5 million',
          '$5.2 million',
          '$7 million',
          '$10 million'
        ],
        correctAnswer: '$5.2 million',
        explanation: 'Paragraphe 1 : "The company\'s revenue reached $5.2 million".'
      },
      {
        id: 'comp3-ex2',
        type: 'multiple-choice',
        question: 'What contributed to the company\'s success?',
        options: [
          'Hiring more employees',
          'Opening new offices',
          'Launching CloudFlow platform',
          'Entering European market'
        ],
        correctAnswer: 'Launching CloudFlow platform',
        explanation: 'Le CEO attribue le succès au "launch of their new cloud-based platform, CloudFlow".'
      },
      {
        id: 'comp3-ex3',
        type: 'multiple-choice',
        question: 'How many users has CloudFlow attracted?',
        options: [
          '5,000',
          '10,000',
          '50,000',
          '200,000'
        ],
        correctAnswer: '10,000',
        explanation: 'Le texte indique "over 10,000 users since its release".'
      },
      {
        id: 'comp3-ex4',
        type: 'multiple-choice',
        question: 'When does TechStart plan to enter Europe?',
        options: [
          'Q3 2023',
          'End of 2023',
          'Early 2024',
          'July 2024'
        ],
        correctAnswer: 'Early 2024',
        explanation: 'Paragraphe 4 : "plans to enter the European market in early 2024".'
      },
      {
        id: 'comp3-ex5',
        type: 'multiple-choice',
        question: 'How many employees does TechStart have now?',
        options: [
          '50',
          '150',
          '200',
          '250'
        ],
        correctAnswer: '200',
        explanation: 'Après avoir embauché 50 personnes : "TechStart now employs 200 people".'
      }
    ]
  },
  {
    id: 4,
    title: 'Analyser des Mémos et Instructions',
    description: 'Comprendre les directives internes',
    theme: 'Communication interne',
    xp: 70,
    duration: 10,
    locked: false,
    completed: false,
    status: 'available',
    strategies: [
      {
        title: 'Identifier l\'en-tête du mémo',
        explanation: 'To, From, Date, Subject = informations essentielles',
        tips: '📋 Format standardisé = lecture rapide possible',
        examples: [
          'TO: → Destinataires',
          'FROM: → Expéditeur',
          'RE: → Objet/Sujet'
        ]
      },
      {
        title: 'Repérer les listes à puces',
        explanation: 'Les points énumèrent souvent des instructions',
        tips: '• Les listes = actions à retenir',
        examples: [
          '• First action → Première étape',
          '• Second action → Deuxième étape',
          '• Third action → Troisième étape'
        ]
      },
      {
        title: 'Identifier les mots d\'obligation',
        explanation: 'Must, should, required = niveau d\'importance',
        tips: '⚠️ MUST = obligatoire, SHOULD = recommandé',
        examples: [
          'Employees MUST attend → Obligatoire',
          'Staff SHOULD review → Recommandé',
          'Please consider → Suggestion'
        ]
      }
    ],
    passages: [
      {
        id: 'comp4-p1',
        text: `MEMORANDUM

TO: All Department Heads
FROM: Human Resources
DATE: October 3, 2023
RE: New Remote Work Policy

Effective November 1st, the company will implement a new remote work policy. Please review the following guidelines and share them with your teams:

Eligibility:
• Employees must have completed at least 6 months with the company
• Position must be suitable for remote work
• Manager approval required

Remote Work Schedule:
• Maximum 2 days per week working remotely
• Employees must be available during core hours (10 AM - 3 PM)
• All meetings must be attended in person or via video call

Requirements:
• Submit remote work request form at least one week in advance
• Maintain regular communication with team
• Ensure work quality and productivity standards are met

If you have questions, contact HR at extension 2500.

Thank you for your cooperation.`,
        type: 'memo'
      }
    ],
    exercises: [
      {
        id: 'comp4-ex1',
        type: 'multiple-choice',
        question: 'Who is this memo addressed to?',
        options: [
          'All employees',
          'Human Resources',
          'All Department Heads',
          'New employees'
        ],
        correctAnswer: 'All Department Heads',
        explanation: 'En-tête : "TO: All Department Heads".'
      },
      {
        id: 'comp4-ex2',
        type: 'multiple-choice',
        question: 'When does the new policy start?',
        options: [
          'October 3rd',
          'October 15th',
          'November 1st',
          'December 1st'
        ],
        correctAnswer: 'November 1st',
        explanation: 'Première phrase : "Effective November 1st".'
      },
      {
        id: 'comp4-ex3',
        type: 'multiple-choice',
        question: 'How long must employees work before being eligible?',
        options: [
          '3 months',
          '6 months',
          '1 year',
          '2 years'
        ],
        correctAnswer: '6 months',
        explanation: 'Eligibilité : "must have completed at least 6 months".'
      },
      {
        id: 'comp4-ex4',
        type: 'multiple-choice',
        question: 'What are the core hours employees must be available?',
        options: [
          '9 AM - 5 PM',
          '10 AM - 3 PM',
          '8 AM - 4 PM',
          '11 AM - 2 PM'
        ],
        correctAnswer: '10 AM - 3 PM',
        explanation: 'Schedule : "available during core hours (10 AM - 3 PM)".'
      },
      {
        id: 'comp4-ex5',
        type: 'multiple-choice',
        question: 'How many days per week can employees work remotely?',
        options: [
          '1 day',
          '2 days',
          '3 days',
          '5 days'
        ],
        correctAnswer: '2 days',
        explanation: 'Schedule : "Maximum 2 days per week working remotely".'
      }
    ]
  },
  {
    id: 5,
    title: 'Comprendre des Publicités',
    description: 'Analyser les offres promotionnelles',
    theme: 'Marketing et ventes',
    xp: 65,
    duration: 9,
    locked: false,
    completed: false,
    status: 'available',
    strategies: [
      {
        title: 'Identifier le produit/service',
        explanation: 'Qu\'est-ce qui est vendu ou promu ?',
        tips: '🛍️ Souvent en gros titre ou première ligne',
        examples: [
          'NEW SMARTPHONE LAUNCH',
          'SUMMER SALE EVENT',
          'PREMIUM MEMBERSHIP OFFER'
        ]
      },
      {
        title: 'Repérer les avantages (benefits)',
        explanation: 'Pourquoi acheter ? Quels sont les bénéfices ?',
        tips: '✨ Cherchez : "Features:", "Benefits:", "Why choose us?"',
        examples: [
          'Save up to 50%',
          'Free shipping',
          'Limited time offer'
        ]
      },
      {
        title: 'Trouver l\'appel à l\'action (CTA)',
        explanation: 'Comment acheter ou obtenir plus d\'infos ?',
        tips: '🎯 "Call now", "Visit", "Order today" = CTA',
        examples: [
          'Call 1-800-555-0123',
          'Visit www.shop.com',
          'Use code SAVE20'
        ]
      },
      {
        title: 'Vérifier les conditions',
        explanation: 'Y a-t-il des restrictions ou conditions ?',
        tips: '⚠️ Petits caractères : dates limites, exclusions',
        examples: [
          'Offer valid until Dec 31',
          'Not valid with other discounts',
          'Limited quantities available'
        ]
      }
    ],
    passages: [
      {
        id: 'comp5-p1',
        text: `GRAND OPENING SALE!

Wilson's Furniture Warehouse
123 Main Street, Portland

We're celebrating our grand opening with MASSIVE DISCOUNTS!

Special Offers:
✓ 40% OFF all sofas and chairs
✓ BUY ONE, GET ONE 50% OFF on dining sets
✓ FREE delivery on orders over $500
✓ 12-month interest-free financing available

Premium Quality at Unbeatable Prices!
• Wide selection of modern and classic styles
• Expert design consultation included
• Extended warranty options

SALE DATES: November 15-30
Store Hours: Mon-Sat 9AM-8PM, Sun 10AM-6PM

Don't miss out! Visit us today or shop online at www.wilsonsfurniture.com
Use promo code GRAND20 for an additional 10% off online orders.

*Some exclusions apply. Cannot be combined with other offers.`,
        type: 'advertisement'
      }
    ],
    exercises: [
      {
        id: 'comp5-ex1',
        type: 'multiple-choice',
        question: 'What is being advertised?',
        options: [
          'A furniture store opening',
          'A warehouse for rent',
          'A home improvement service',
          'An online shopping platform'
        ],
        correctAnswer: 'A furniture store opening',
        explanation: 'Titre : "GRAND OPENING SALE!" et "Wilson\'s Furniture Warehouse".'
      },
      {
        id: 'comp5-ex2',
        type: 'multiple-choice',
        question: 'What discount is offered on sofas?',
        options: [
          '20% off',
          '30% off',
          '40% off',
          '50% off'
        ],
        correctAnswer: '40% off',
        explanation: 'Offre spéciale : "40% OFF all sofas and chairs".'
      },
      {
        id: 'comp5-ex3',
        type: 'multiple-choice',
        question: 'What is the minimum purchase for free delivery?',
        options: [
          '$200',
          '$300',
          '$500',
          '$1000'
        ],
        correctAnswer: '$500',
        explanation: 'Offre : "FREE delivery on orders over $500".'
      },
      {
        id: 'comp5-ex4',
        type: 'multiple-choice',
        question: 'What promo code gives extra discount online?',
        options: [
          'SAVE20',
          'GRAND20',
          'WILSON20',
          'OPEN20'
        ],
        correctAnswer: 'GRAND20',
        explanation: 'Instruction : "Use promo code GRAND20 for an additional 10% off".'
      },
      {
        id: 'comp5-ex5',
        type: 'multiple-choice',
        question: 'When does the sale end?',
        options: [
          'November 15',
          'November 20',
          'November 30',
          'December 31'
        ],
        correctAnswer: 'November 30',
        explanation: 'Dates de vente : "November 15-30".'
      }
    ]
  }
];
