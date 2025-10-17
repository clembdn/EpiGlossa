# 🧭 EpiGlossa – Roadmap de Développement

## 👥 Équipe
- **Dev A** : Frontend, intégration Supabase, UI/UX
- **Dev B** : Base de données, backend logic, contenu TOEIC (questions, audios, images)

Durée totale estimée : **10 à 12 semaines (≈ 3 mois à deux)**  
Méthodologie : **Agile – sprints de 2 semaines**

---

## 🏁 Milestone 1 : Initialisation & Structure du Projet
**Durée : 1 semaine**  
**Objectif :** Mettre en place la base technique et la structure du projet.

### Tâches
- [ ] **Dev A :**
  - [ ] Créer le repo GitHub et initialiser le projet Next.js.
  - [ ] Configurer TailwindCSS + shadcn/ui.
  - [ ] Créer la structure du layout (Navbar, Sidebar, Footer).

- [ ] **Dev B :**
  - [ ] Créer le projet Supabase.
  - [ ] Mettre en place la base de données (`questions`).
  - [ ] Créer les buckets `question-audio` et `question-images`.
  - [ ] Connecter Supabase au projet Next.js via `.env.local`.

---

## 🧩 Milestone 2 : Espace d’Entraînement (MVP)
**Durée : 2 à 3 semaines**  
**Objectif :** Afficher et valider des questions TOEIC (QCM, audio, image).

### Tâches
- [ ] **Dev A :**
  - [ ] Créer la page “Entraînement”.
  - [ ] Mettre en place le composant QCM (question, choix A–D, bouton “Valider”).
  - [ ] Afficher feedback (✅/❌ + explication).
  - [ ] Gérer l’audio et les images dans l’interface.

- [ ] **Dev B :**
  - [ ] Ajouter des exemples de questions dans Supabase.
  - [ ] Écrire la logique de récupération (fetch Supabase).
  - [ ] Tester la base de données et corriger les erreurs.
  - [ ] Vérifier la cohérence des URLs audio/image.

---

## 📚 Milestone 3 : Espace d’Apprentissage (Cours Interactifs)
**Durée : 2 à 3 semaines**  
**Objectif :** Créer un espace dédié à la grammaire, conjugaison et vocabulaire TOEIC.

### Tâches
- [ ] **Dev A :**
  - [ ] Créer les pages “Grammaire”, “Conjugaison”, “Vocabulaire”.
  - [ ] Intégrer un affichage de leçons + mini quiz.
  - [ ] Ajouter un design responsive et clair.

- [ ] **Dev B :**
  - [ ] Créer la table `lessons` (type, contenu, quiz lié).
  - [ ] Ajouter des leçons de test.
  - [ ] Gérer la récupération et l’affichage dynamique via Supabase.

---

## 👤 Milestone 4 : Espace Utilisateur & Authentification
**Durée : 2 semaines**  
**Objectif :** Permettre la connexion, le suivi et la sauvegarde des progrès utilisateurs.

### Tâches
- [ ] **Dev A :**
  - [ ] Créer pages Login / Signup / Profil.
  - [ ] Intégrer Supabase Auth (email, Google).
  - [ ] Afficher la progression utilisateur (score, questions réussies).

- [ ] **Dev B :**
  - [ ] Créer les tables `users`, `user_answers`, `leaderboard`.
  - [ ] Gérer la sauvegarde des réponses et le calcul de score.
  - [ ] Générer le classement global.

---

## 🧠 Milestone 5 : Mode TOEIC Blanc & Statistiques
**Durée : 2 à 3 semaines**  
**Objectif :** Créer un mode de test complet avec score et analyse des résultats.

### Tâches
- [ ] **Dev A :**
  - [ ] Créer interface TOEIC blanc (chronomètre, navigation par section).
  - [ ] Afficher résultats + score final.
  - [ ] Intégrer graphiques de progression (Recharts / Chart.js).

- [ ] **Dev B :**
  - [ ] Créer la logique serveur de scoring.
  - [ ] Sauvegarder historique de chaque test.
  - [ ] Optimiser les requête
