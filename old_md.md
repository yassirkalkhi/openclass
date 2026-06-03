# OpenClass - Plateforme Collaborative d'Apprentissage en Ligne

## Table des Matières

1. [Vue d'Ensemble du Projet](#vue-densemble-du-projet)
2. [Contexte et Problématique](#contexte-et-problématique)
3. [Objectifs du Projet](#objectifs-du-projet)
4. [Personas Utilisateurs](#personas-utilisateurs)
5. [Architecture Technique](#architecture-technique)
6. [Fonctionnalités Principales](#fonctionnalités-principales)
7. [Modèle de Données](#modèle-de-données)
8. [Stack Technologique](#stack-technologique)
9. [Patterns de Conception](#patterns-de-conception)
10. [Couches Applicatives](#couches-applicatives)
11. [Description des Pages](#description-des-pages)
12. [Intégrations IA](#intégrations-ia)
13. [Sécurité et Permissions](#sécurité-et-permissions)
14. [User Stories](#user-stories)
15. [État d'Avancement](#état-davancement)
16. [Perspectives d'Évolution](#perspectives-dévolution)

---

## 1. Vue d'Ensemble du Projet

### 1.1 Présentation

**OpenClass** est une plateforme SaaS (Software as a Service) moderne conçue pour faciliter l'apprentissage collaboratif en ligne entre étudiants et enseignants. Elle combine les fonctionnalités d'un système de gestion de l'apprentissage (LMS) avec des outils de communication en temps réel et des capacités d'intelligence artificielle avancées.

### 1.2 Vision

Créer un environnement d'apprentissage numérique unifié où :
- Les enseignants peuvent organiser et gérer leurs cours efficacement
- Les étudiants peuvent collaborer, apprendre et interagir en temps réel
- L'intelligence artificielle assiste l'apprentissage personnalisé
- Les ressources pédagogiques sont centralisées et accessibles

### 1.3 Proposition de Valeur

OpenClass se distingue par :
- **Intégration IA avancée** : Chatbots personnalisés par étudiant avec RAG (Retrieval-Augmented Generation)
- **Communication en temps réel** : Salles de chat textuelles et vidéo intégrées
- **Gestion intelligente des ressources** : Indexation automatique des documents pour recherche sémantique
- **Devoirs personnalisés** : Système d'assignation avec correction et feedback
- **Architecture multi-tenant** : Support d'organisations multiples (écoles, universités, entreprises)

---

## 2. Contexte et Problématique

### 2.1 Contexte

L'enseignement à distance et hybride est devenu une nécessité dans le paysage éducatif moderne. Les institutions éducatives font face à plusieurs défis :

- **Fragmentation des outils** : Utilisation de multiples plateformes (Zoom, Slack, Google Classroom, etc.)
- **Manque de personnalisation** : Approche "one-size-fits-all" qui ne s'adapte pas aux besoins individuels
- **Difficulté d'accès aux ressources** : Documents dispersés, recherche inefficace
- **Engagement limité** : Manque d'interactivité et de collaboration en temps réel
- **Surcharge cognitive** : Trop d'interfaces différentes à maîtriser

### 2.2 Problématique

**Comment créer une plateforme unifiée qui combine communication en temps réel, gestion de contenu pédagogique et assistance par IA pour améliorer l'expérience d'apprentissage collaboratif ?**

### 2.3 Besoins Identifiés

#### Pour les Enseignants :
- Centraliser la gestion de cours
- Communiquer efficacement avec les étudiants
- Distribuer et corriger des devoirs
- Partager des ressources pédagogiques
- Suivre la progression des étudiants

#### Pour les Étudiants :
- Accéder facilement aux ressources de cours
- Collaborer avec leurs pairs
- Poser des questions et obtenir de l'aide
- Soumettre des devoirs
- Participer à des discussions en temps réel
- Bénéficier d'un assistant IA personnalisé

#### Pour les Institutions :
- Gérer plusieurs classes et enseignants
- Maintenir la sécurité et la confidentialité des données
- Contrôler les permissions et accès
- Suivre l'utilisation de la plateforme

---

## 3. Objectifs du Projet

### 3.1 Objectifs Principaux

1. **Unification** : Créer une plateforme tout-en-un pour l'apprentissage collaboratif
2. **Personnalisation** : Offrir une expérience d'apprentissage adaptée à chaque étudiant via l'IA
3. **Collaboration** : Faciliter l'interaction en temps réel entre tous les acteurs
4. **Accessibilité** : Rendre les ressources pédagogiques facilement recherchables et accessibles
5. **Scalabilité** : Supporter plusieurs organisations avec des milliers d'utilisateurs

### 3.2 Objectifs Techniques

- Architecture moderne basée sur Next.js 16 avec App Router
- Système de permissions granulaire et sécurisé
- Intégration d'IA avec RAG pour réponses contextuelles
- Communication temps réel avec LiveKit
- Indexation vectorielle pour recherche sémantique
- Architecture multi-tenant avec isolation des données

### 3.3 Objectifs Fonctionnels

- Gestion complète des organisations et classes
- Système de chat textuel et vidéo
- Gestion des devoirs avec soumission et correction
- Bibliothèque de ressources avec indexation IA
- Assistant IA personnalisé par étudiant
- Système de notifications en temps réel
- Gestion des invitations et permissions

---

## 4. Personas Utilisateurs

### 4.1 Persona 1 : L'Enseignant

**Nom** : Dr. Sarah Martin
**Âge** : 42 ans  
**Rôle** : Professeure de mathématiques à l'université  
**Objectifs** :
- Organiser ses cours de manière structurée
- Communiquer efficacement avec 150+ étudiants
- Distribuer et corriger des devoirs rapidement
- Partager des ressources pédagogiques (PDF, vidéos)
- Suivre la progression de ses étudiants

**Frustrations** :
- Jongler entre plusieurs plateformes (email, Zoom, Google Drive)
- Difficulté à répondre aux questions individuelles de tous les étudiants
- Temps perdu à organiser et retrouver des documents

**Besoins** :
- Interface intuitive pour créer et gérer des classes
- Système de devoirs avec correction intégrée
- Canaux de communication organisés (annonces, discussions)
- Statistiques sur l'engagement des étudiants

### 4.2 Persona 2 : L'Étudiant

**Nom** : Ahmed Benali  
**Âge** : 21 ans  
**Rôle** : Étudiant en licence informatique  
**Objectifs** :
- Accéder facilement aux cours et ressources
- Collaborer avec ses camarades sur des projets
- Poser des questions et obtenir de l'aide rapidement
- Soumettre ses devoirs à temps
- Réviser efficacement avec l'aide de l'IA

**Frustrations** :
- Ressources dispersées sur plusieurs plateformes
- Difficulté à obtenir des réponses rapides aux questions
- Manque de feedback personnalisé
- Interface complexe de certaines plateformes

**Besoins** :
- Assistant IA pour répondre aux questions 24/7
- Recherche intelligente dans les ressources de cours
- Notifications pour les nouveaux devoirs et annonces
- Interface simple et moderne

### 4.3 Persona 3 : L'Administrateur d'Institution

**Nom** : Marie Dubois  
**Âge** : 38 ans  
**Rôle** : Directrice des systèmes d'information, Université Paris-Tech  
**Objectifs** :
- Gérer plusieurs départements et centaines de classes
- Contrôler les accès et permissions
- Assurer la sécurité des données
- Suivre l'utilisation de la plateforme
- Gérer les invitations et membres

**Frustrations** :
- Manque de contrôle granulaire sur les permissions
- Difficulté à gérer plusieurs organisations
- Préoccupations sur la sécurité des données étudiantes

**Besoins** :
- Tableau de bord d'administration complet
- Système de permissions flexible
- Isolation des données par organisation
- Outils de gestion des utilisateurs et invitations

---

## 5. Architecture Technique

### 5.1 Architecture Globale

OpenClass suit une architecture **monolithique modulaire** basée sur Next.js avec une séparation claire des responsabilités :

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         React Components (UI Layer)                   │   │
│  │  - Workspace Components                               │   │
│  │  - Forms & UI Components                              │   │
│  │  - Real-time Chat & Video                             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                  NEXT.JS SERVER (App Router)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              API Routes & Server Actions              │   │
│  │  - /api/auth/*  - /api/ai/stream                      │   │
│  │  - /api/upload  - Server Actions (actions/*.ts)       │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Service Layer (Business Logic)           │   │
│  │  - AuthService, ClassService, AIService              │   │
│  │  - AssignmentService, ChatService                     │   │
│  │  - PermissionService, NotificationService             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Repository Layer (Data Access)                │   │
│  │  - BaseRepository pattern                             │   │
│  │  - Specific repositories for each entity              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Firebase   │  │   LiveKit    │  │    Groq AI   │      │
│  │  (Database)  │  │   (Video)    │  │    (LLM)     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│  ┌──────────────┐  ┌──────────────┐                         │
│  │   Upstash    │  │ UploadThing  │                         │
│  │  (Vectors)   │  │  (Storage)   │                         │
│  └──────────────┘  └──────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

### 5.2 Architecture en Couches

#### 5.2.1 Couche Présentation (UI Layer)
- **Localisation** : `/src/components`, `/src/app`
- **Responsabilités** :
  - Rendu des interfaces utilisateur
  - Gestion des interactions utilisateur
  - Affichage des données
  - Gestion de l'état local (React hooks)

#### 5.2.2 Couche API (API Layer)
- **Localisation** : `/src/app/api`, `/src/app/actions`
- **Responsabilités** :
  - Exposition des endpoints HTTP
  - Server Actions pour mutations
  - Validation des requêtes
  - Gestion des sessions et authentification

#### 5.2.3 Couche Service (Business Logic Layer)
- **Localisation** : `/src/lib/services`
- **Responsabilités** :
  - Logique métier de l'application
  - Orchestration des opérations complexes
  - Validation des règles métier
  - Gestion des permissions
  - Coordination entre repositories

**Services principaux** :
- `AuthService` : Authentification et gestion des sessions
- `OrganizationService` : Gestion des organisations
- `ClassService` : Gestion des classes
- `AssignmentService` : Gestion des devoirs
- `ChatService` : Messagerie en temps réel
- `AIService` : Intelligence artificielle et RAG
- `DocumentIndexingService` : Indexation des documents
- `PermissionService` : Contrôle d'accès
- `NotificationService` : Notifications

#### 5.2.4 Couche Repository (Data Access Layer)
- **Localisation** : `/src/lib/repositories`
- **Responsabilités** :
  - Accès aux données Firebase
  - Opérations CRUD
  - Requêtes complexes
  - Abstraction de la base de données

**Pattern utilisé** : Repository Pattern avec `BaseRepository`

#### 5.2.5 Couche Données (Data Layer)
- **Firebase Firestore** : Base de données NoSQL principale
- **Upstash Vector** : Base de données vectorielle pour RAG
- **UploadThing** : Stockage de fichiers

### 5.3 Architecture Multi-Tenant

OpenClass implémente une architecture multi-tenant avec isolation des données :

```
Organization 1 (Université Paris-Tech)
├── Class 1 (Mathématiques L1)
│   ├── Channels
│   ├── Members (Teachers + Students)
│   ├── Resources
│   ├── Assignments
│   └── AI Conversations (isolated per student)
├── Class 2 (Informatique L2)
└── Class 3 (Physique L1)

Organization 2 (École Centrale)
├── Class 1 (Mécanique)
└── Class 2 (Électronique)
```

**Isolation des données** :
- Chaque organisation a ses propres classes
- Les vecteurs IA sont isolés par namespace (`class-{classId}`)
- Les permissions sont vérifiées à chaque niveau
- Les utilisateurs peuvent appartenir à plusieurs organisations

---

## 6. Fonctionnalités Principales

### 6.1 Gestion des Organisations

**Description** : Système multi-tenant permettant à plusieurs institutions d'utiliser la plateforme.

**Fonctionnalités** :
- ✅ Création d'organisations (école, université, académie, entreprise)
- ✅ Gestion des membres (owner, member)
- ✅ Codes d'invitation pour rejoindre une organisation
- ✅ Visibilité (privée/publique)
- ✅ Gestion des permissions au niveau organisation

**Cas d'usage** :
- Une université crée une organisation "Université Paris-Tech"
- Le directeur invite les enseignants via un code d'invitation
- Les enseignants peuvent créer des classes dans l'organisation

### 6.2 Gestion des Classes

**Description** : Espaces de travail pour organiser les cours et les étudiants.

**Fonctionnalités** :
- ✅ Création de classes avec slug unique
- ✅ Rôles : Teacher (enseignant) et Student (étudiant)
- ✅ Codes d'invitation pour rejoindre une classe
- ✅ Canaux par défaut (#general, #announcements)
- ✅ Paramètres de classe (uploads étudiants, accès IA)
- ✅ Archivage de classes
- ✅ Gestion des membres et permissions

**Cas d'usage** :
- Un professeur crée une classe "Mathématiques L1"
- Il partage le code d'invitation avec ses étudiants
- Les étudiants rejoignent la classe et accèdent aux ressources

### 6.3 Système de Chat en Temps Réel

**Description** : Communication textuelle organisée par canaux.

**Fonctionnalités** :
- ✅ Canaux textuels (text, announcement, video)
- ✅ Messages avec réponses en fil (threads)
- ✅ Réactions emoji
- ✅ Épinglage de messages
- ✅ Pièces jointes
- ✅ Édition et suppression de messages
- ✅ Notifications pour les annonces

**Types de canaux** :
- **Text** : Discussion générale
- **Announcement** : Annonces (seuls les enseignants peuvent poster)
- **Video** : Canaux avec conférence vidéo intégrée

**Cas d'usage** :
- Un étudiant pose une question dans #general
- Un enseignant fait une annonce dans #announcements
- Les étudiants réagissent avec des emojis et répondent en fil

### 6.4 Conférences Vidéo (LiveKit)

**Description** : Salles de vidéoconférence intégrées dans les canaux.

**Fonctionnalités** :
- ✅ Création de rooms LiveKit
- ✅ Tokens d'accès sécurisés
- ✅ Permissions host/participant
- ✅ Support jusqu'à 50 participants
- ✅ Timeout automatique (10 minutes d'inactivité)
- ✅ Interface moderne avec @livekit/components-react

**Cas d'usage** :
- Un enseignant démarre une session vidéo dans un canal
- Les étudiants rejoignent avec audio/vidéo
- Partage d'écran pour présenter des slides

### 6.5 Gestion des Devoirs (Assignments)

**Description** : Système complet de création, soumission et correction de devoirs.

**Fonctionnalités** :
- ✅ Création de devoirs par les enseignants
- ✅ Date limite (due date)
- ✅ Score maximum configurable
- ✅ Autorisation de soumissions tardives
- ✅ Pièces jointes (énoncés, ressources)
- ✅ Soumission par les étudiants
- ✅ Brouillons de soumission
- ✅ Statuts : draft, submitted, late, graded
- ✅ Correction avec score et feedback
- ✅ Historique des soumissions

**Workflow** :
1. Enseignant crée un devoir avec date limite
2. Étudiant rédige sa réponse (brouillon)
3. Étudiant soumet le devoir
4. Enseignant corrige et attribue un score
5. Étudiant reçoit le feedback

### 6.6 Bibliothèque de Ressources

**Description** : Gestion centralisée des documents pédagogiques avec indexation IA.

**Fonctionnalités** :
- ✅ Upload de fichiers (PDF, texte, images)
- ✅ Métadonnées (titre, description, tags)
- ✅ Indexation automatique pour RAG (PDF et texte)
- ✅ Chunking intelligent des documents
- ✅ Stockage vectoriel dans Upstash
- ✅ Liaison avec des devoirs
- ✅ Contrôle d'accès (permissions upload)

**Processus d'indexation** :
1. Enseignant upload un PDF de cours
2. Le système extrait le texte (unpdf)
3. Le texte est découpé en chunks (1200 caractères)
4. Chaque chunk est vectorisé et stocké dans Upstash
5. Les étudiants peuvent interroger le document via l'IA

### 6.7 Assistant IA Personnalisé (RAG)

**Description** : Chatbot intelligent par étudiant avec accès aux ressources de la classe.

**Fonctionnalités** :
- ✅ Conversations IA isolées par étudiant
- ✅ RAG (Retrieval-Augmented Generation)
- ✅ Recherche sémantique dans les ressources indexées
- ✅ Réponses contextuelles basées sur les cours
- ✅ Citations des sources utilisées
- ✅ Streaming des réponses (temps réel)
- ✅ Historique des conversations
- ✅ Modèle LLM : Groq (llama-3.1-8b-instant)

**Architecture RAG** :
```
Question étudiant
    ↓
Vectorisation de la question (Upstash)
    ↓
Recherche des 5 chunks les plus pertinents
    ↓
Construction du contexte avec les chunks
    ↓
Envoi au LLM (Groq) avec contexte + historique
    ↓
Génération de la réponse (streaming)
    ↓
Affichage avec sources citées
```

**Cas d'usage** :
- Étudiant : "Explique-moi le théorème de Pythagore"
- IA : Recherche dans les PDF de cours indexés
- IA : Génère une réponse basée sur le contenu du cours
- IA : Cite les sources (PDF page X)

### 6.8 Système de Notifications

**Description** : Notifications en temps réel pour les événements importants.

**Fonctionnalités** :
- ✅ Types : message, mention, invite, announcement
- ✅ Notifications pour les annonces de classe
- ✅ Invitations à rejoindre des classes
- ✅ Statut lu/non lu
- ✅ Liens vers les ressources concernées

### 6.9 Système d'Invitations

**Description** : Gestion des invitations pour rejoindre classes et organisations.

**Fonctionnalités** :
- ✅ Invitations par code (8 caractères)
- ✅ Invitations directes par email
- ✅ Statuts : pending, accepted, rejected, cancelled
- ✅ Rôle assigné lors de l'invitation
- ✅ Régénération des codes d'invitation
- ✅ Notifications d'invitation

### 6.10 Gestion des Permissions

**Description** : Système granulaire de contrôle d'accès.

**Permissions disponibles** :
- `manage_organization` : Gérer l'organisation
- `manage_class` : Gérer la classe
- `manage_roles` : Gérer les rôles des membres
- `manage_channels` : Créer/modifier des canaux
- `manage_messages` : Modérer les messages
- `send_messages` : Envoyer des messages
- `upload_files` : Uploader des fichiers
- `join_voice` : Rejoindre l'audio
- `join_video` : Rejoindre la vidéo
- `use_ai` : Utiliser l'assistant IA
- `kick_members` : Expulser des membres
- `ban_members` : Bannir des membres

**Overrides par rôle** :
- Les permissions peuvent être personnalisées par classe
- Différentes pour teachers et students
- Stockées dans `ClassSettings.permissionOverrides`

---

## 7. Modèle de Données

### 7.1 Entités Principales

#### Organization
```typescript
{
  id: string
  name: string
  slug: string
  description?: string
  ownerId: string
  type: "school" | "university" | "academy" | "company"
  visibility: "private" | "public"
  inviteCode?: string
  createdAt: string
  updatedAt: string
}
```

#### Class
```typescript
{
  id: string
  organizationId: string
  name: string
  slug: string
  description?: string
  imageUrl?: string
  inviteCode: string
  ownerId: string
  visibility: "private" | "public"
  archived?: boolean
  createdAt: string
  updatedAt: string
}
```

#### Profile (User)
```typescript
{
  id: string
  email: string
  fullName?: string
  avatarUrl?: string
  bio?: string
  status?: string
  passwordHash?: string
  platformAdmin?: boolean
  organizationIds?: string[]
  createdAt: string
  updatedAt: string
}
```

#### Channel
```typescript
{
  id: string
  classId: string
  categoryId?: string
  name: string
  description?: string
  type: "text" | "video" | "announcement"
  position: number
  createdBy: string
  createdAt: string
}
```

#### Message
```typescript
{
  id: string
  channelId: string
  senderId: string
  content: string
  replyToId?: string
  edited: boolean
  pinned?: boolean
  attachments?: MessageAttachment[]
  reactions?: MessageReaction[]
  createdAt: string
  updatedAt?: string
}
```

#### Assignment
```typescript
{
  id: string
  classId: string
  channelId?: string
  createdBy: string
  title: string
  description?: string
  attachments?: string[]
  dueDate?: string
  maxScore?: number
  allowLateSubmission: boolean
  createdAt: string
  updatedAt?: string
}
```

#### AssignmentSubmission
```typescript
{
  id: string
  assignmentId: string
  classId: string
  studentId: string
  content?: string
  attachments?: MessageAttachment[]
  status: "draft" | "submitted" | "late" | "graded"
  score?: number
  feedback?: string
  submittedAt?: string
  gradedAt?: string
  createdAt: string
}
```

#### ClassResource
```typescript
{
  id: string
  classId: string
  uploadedBy: string
  title: string
  description?: string
  fileUrl: string
  fileType: string
  fileSize: number
  tags?: string[]
  linkedAssignmentId?: string
  aiIndexed: boolean
  createdAt: string
}
```

#### AIConversation
```typescript
{
  id: string
  classId: string
  userId: string
  title?: string
  createdAt: string
}
```

#### AIMessage
```typescript
{
  id: string
  conversationId: string
  role: "user" | "assistant" | "system"
  content: string
  sources?: AISource[]
  createdAt: string
}
```

### 7.2 Relations entre Entités

```
Organization (1) ──── (N) Class
     │                     │
     │                     ├── (N) Channel
     │                     ├── (N) ClassMember
     │                     ├── (N) Assignment
     │                     ├── (N) ClassResource
     │                     └── (N) AIConversation
     │
     └── (N) OrganizationMember

Profile (1) ──── (N) OrganizationMember
    │
    ├── (N) ClassMember
    ├── (N) Message
    ├── (N) AssignmentSubmission
    └── (N) AIConversation

Channel (1) ──── (N) Message
    │
    └── (1) VideoRoom

Assignment (1) ──── (N) AssignmentSubmission

AIConversation (1) ──── (N) AIMessage

ClassResource (1) ──── (N) EmbeddingChunk
```

---

## 8. Stack Technologique

### 8.1 Frontend

| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js** | 16.2.3 | Framework React avec App Router |
| **React** | 19.2.4 | Bibliothèque UI |
| **TypeScript** | 5.x | Typage statique |
| **Tailwind CSS** | 4.x | Styling utilitaire |
| **Radix UI** | 1.4.3 | Composants accessibles |
| **Framer Motion** | 12.38.0 | Animations |
| **Lucide React** | 1.14.0 | Icônes |
| **LiveKit Components** | 2.9.21 | UI pour vidéoconférence |
| **Recharts** | 3.8.1 | Graphiques et visualisations |
| **CMDK** | 1.1.1 | Command palette |
| **date-fns** | 4.1.0 | Manipulation de dates |

### 8.2 Backend & Services

| Technologie | Version | Usage |
|------------|---------|-------|
| **Next.js API Routes** | 16.2.3 | Endpoints HTTP |
| **Server Actions** | - | Mutations côté serveur |
| **Firebase Admin** | 13.8.0 | Base de données Firestore |
| **LiveKit Server SDK** | 2.15.3 | Gestion des rooms vidéo |
| **Groq SDK** | 1.2.0 | LLM pour l'IA |
| **Upstash Vector** | 1.2.3 | Base vectorielle pour RAG |
| **UploadThing** | 7.3.0 | Stockage de fichiers |
| **Argon2** | 0.44.0 | Hashing de mots de passe |
| **Jose** | 6.2.2 | JWT tokens |
| **Zod** | 4.3.6 | Validation de schémas |
| **unpdf** | 1.6.2 | Extraction de texte PDF |

### 8.3 Infrastructure & Déploiement

| Service | Usage |
|---------|-------|
| **Vercel** | Hébergement et déploiement |
| **Firebase Firestore** | Base de données NoSQL |
| **Upstash** | Base de données vectorielle |
| **LiveKit Cloud** | Infrastructure vidéo |
| **UploadThing** | CDN pour fichiers |
| **Groq** | API LLM |

### 8.4 Outils de Développement

| Outil | Usage |
|-------|-------|
| **ESLint** | Linting JavaScript/TypeScript |
| **TypeScript** | Vérification de types |
| **pnpm** | Gestionnaire de paquets |
| **Git** | Contrôle de version |

---

## 9. Patterns de Conception

### 9.1 Repository Pattern

**Objectif** : Abstraire l'accès aux données et centraliser les requêtes.

**Implémentation** :
```typescript
// BaseRepository avec méthodes CRUD génériques
class BaseRepository<T> {
  protected collection: CollectionReference
  
  async getById(id: string): Promise<T | null>
  async create(data: T): Promise<void>
  async update(id: string, data: Partial<T>): Promise<void>
  async delete(id: string): Promise<void>
}

// Repositories spécifiques héritent de BaseRepository
class ClassRepository extends BaseRepository<Class> {
  async getByOrganization(orgId: string): Promise<Class[]>
  async getBySlug(orgId: string, slug: string): Promise<Class | null>
}
```

**Avantages** :
- Séparation des préoccupations
- Facilite les tests unitaires
- Changement de base de données simplifié
- Réutilisation du code

### 9.2 Service Layer Pattern

**Objectif** : Encapsuler la logique métier et orchestrer les opérations.

**Implémentation** :
```typescript
class AssignmentService {
  private assignmentRepo = new AssignmentRepository()
  private submissionRepo = new SubmissionRepository()
  private permissionService = new PermissionService()
  
  async createAssignment(data, userId) {
    // 1. Vérifier les permissions
    await this.permissionService.requireRole(data.classId, userId, "teacher")
    
    // 2. Créer l'assignment
    const assignment = await this.assignmentRepo.create(data)
    
    // 3. Logique métier supplémentaire
    return assignment
  }
}
```

**Avantages** :
- Logique métier centralisée
- Réutilisable par API Routes et Server Actions
- Facilite les tests
- Gestion transactionnelle

### 9.3 Provider Pattern (React Context)

**Objectif** : Partager l'état global dans l'arbre de composants.

**Implémentation** :
```typescript
// AuthProvider pour l'authentification
export function AuthProvider({ children }) {
  const [user, setUser] = useState<Profile | null>(null)
  
  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Utilisation dans les composants
const { user } = useAuth()
```

**Contexts utilisés** :
- `AuthContext` : État d'authentification
- `OrganizationContext` : Organisation active
- `WorkspaceUIContext` : État de l'interface workspace
- `ThemeContext` : Thème clair/sombre

### 9.4 Server Actions Pattern

**Objectif** : Mutations côté serveur avec validation et sécurité.

**Implémentation** :
```typescript
// Server Action dans /src/app/actions/assignment.ts
"use server"

export async function createAssignment(data: CreateAssignmentInput) {
  // 1. Récupérer la session
  const session = await getSession()
  if (!session) throw new Error("Unauthorized")
  
  // 2. Valider les données
  const validated = createAssignmentSchema.parse(data)
  
  // 3. Appeler le service
  const service = new AssignmentService()
  return service.createAssignment(validated, session.userId)
}
```

**Avantages** :
- Sécurité (exécution côté serveur)
- Validation centralisée
- Pas besoin d'API Routes pour chaque mutation
- Intégration native avec React

### 9.5 Streaming Pattern (AI Responses)

**Objectif** : Envoyer les réponses IA en temps réel (token par token).

**Implémentation** :
```typescript
// API Route avec streaming
export async function POST(req: Request) {
  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of aiService.generateStreamingResponse(...)) {
        controller.enqueue(encoder.encode(JSON.stringify(chunk)))
      }
      controller.close()
    }
  })
  
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" }
  })
}
```

**Avantages** :
- Expérience utilisateur améliorée
- Réponses progressives
- Réduction de la latence perçue

### 9.6 RAG (Retrieval-Augmented Generation) Pattern

**Objectif** : Améliorer les réponses IA avec du contexte pertinent.

**Architecture** :
```
1. Indexation (offline)
   Document → Chunking → Vectorisation → Upstash Vector DB

2. Requête (runtime)
   Question → Vectorisation → Recherche similarité → Top K chunks
   
3. Génération
   Chunks + Question + Historique → LLM → Réponse contextuelle
```

**Avantages** :
- Réponses basées sur les documents de cours
- Réduction des hallucinations
- Citations des sources
- Personnalisation par classe

---

## 10. Couches Applicatives

### 10.1 Couche Présentation

**Localisation** : `/src/components`, `/src/app`

**Composants principaux** :

#### Workspace Components (`/src/components/workspace`)
- `GlobalHeader` : En-tête avec navigation et profil
- `ClassRail` : Barre latérale avec liste des classes
- `ChatView` : Interface de chat textuel
- `VideoChannelView` : Interface de vidéoconférence
- `AIAssistantView` : Interface chatbot IA
- `ResourcesView` : Bibliothèque de ressources
- `AssignmentsView` : Liste et détails des devoirs
- `RightPanel` : Panneau latéral contextuel

#### Forms Components (`/src/components/forms`)
- `CreateClassForm` : Création de classe
- `CreateAssignmentForm` : Création de devoir
- `JoinOrgForm` : Rejoindre une organisation
- `UploadResourceForm` : Upload de ressources

#### UI Components (`/src/components/ui`)
- Composants Radix UI stylisés avec Tailwind
- Button, Input, Dialog, Dropdown, Tooltip, etc.
- Design system cohérent

### 10.2 Couche Routing

**Localisation** : `/src/app`

**Structure des routes** :
```
/
├── /login                    # Authentification
├── /register                 # Inscription
├── /organizations            # Sélection/création d'organisation
├── /app                      # Workspace principal
│   ├── /invitations          # Invitations en attente
│   └── /[classSlug]          # Classe spécifique
│       ├── /                 # Vue d'ensemble de la classe
│       ├── /channels/[id]    # Canal textuel/vidéo
│       ├── /ai-assistant     # Assistant IA
│       ├── /assignments      # Liste des devoirs
│       │   └── /[id]         # Détail d'un devoir
│       ├── /resources        # Bibliothèque de ressources
│       └── /settings         # Paramètres de classe
│           ├── /members      # Gestion des membres
│           └── /permissions  # Gestion des permissions
└── /api                      # API Routes
    ├── /auth/google          # OAuth Google
    ├── /ai/stream            # Streaming IA
    ├── /upload               # Upload de fichiers
    └── /uploadthing          # UploadThing webhook
```

### 10.3 Couche API

**Localisation** : `/src/app/api`, `/src/app/actions`

#### API Routes
- `POST /api/auth/google` : Initier OAuth Google
- `GET /api/auth/google/callback` : Callback OAuth
- `POST /api/ai/stream` : Streaming des réponses IA
- `POST /api/upload` : Upload de fichiers
- `POST /api/uploadthing` : Webhook UploadThing

#### Server Actions (`/src/app/actions`)
- `auth.ts` : Actions d'authentification
- `class.ts` : Actions de gestion de classes
- `assignment.ts` : Actions de devoirs
- `chat.ts` : Actions de messagerie
- `channel.ts` : Actions de canaux
- `resource.ts` : Actions de ressources
- `ai.ts` : Actions IA
- `notification.ts` : Actions de notifications
- `invitation.ts` : Actions d'invitations
- `organization.ts` : Actions d'organisations
- `video-room.ts` : Actions de vidéoconférence

### 10.4 Couche Service

**Localisation** : `/src/lib/services`

**Services implémentés** :

1. **AuthService** : Authentification, sessions, OAuth
2. **OrganizationService** : CRUD organisations, membres, invitations
3. **ClassService** : CRUD classes, membres, paramètres
4. **ChannelService** : CRUD canaux, catégories
5. **ChatService** : Messages, réactions, threads, épinglage
6. **AssignmentService** : CRUD devoirs, soumissions, corrections
7. **ResourceService** : CRUD ressources, uploads
8. **AIService** : Conversations IA, RAG, embeddings
9. **DocumentIndexingService** : Extraction texte, chunking, indexation
10. **PermissionService** : Vérification permissions, rôles
11. **NotificationService** : Création et gestion notifications
12. **ClassInvitationService** : Invitations directes
13. **VideoRoomService** : Gestion rooms LiveKit

### 10.5 Couche Repository

**Localisation** : `/src/lib/repositories`

**Repositories implémentés** :
- `BaseRepository` : Classe abstraite avec CRUD générique
- `ProfileRepository` : Gestion des profils utilisateurs
- `OrganizationRepository` : Gestion des organisations
- `OrganizationMemberRepository` : Membres d'organisations
- `ClassRepository` : Gestion des classes
- `ClassMemberRepository` : Membres de classes
- `ClassSettingsRepository` : Paramètres de classes
- `ChannelRepository` : Gestion des canaux
- `ChannelCategoryRepository` : Catégories de canaux
- `MessageRepository` : Messages de chat
- `MessageAttachmentRepository` : Pièces jointes
- `MessageReactionRepository` : Réactions emoji
- `AssignmentRepository` : Devoirs
- `SubmissionRepository` : Soumissions de devoirs
- `ResourceRepository` : Ressources pédagogiques
- `AIConversationRepository` : Conversations IA
- `AIMessageRepository` : Messages IA
- `EmbeddingChunkRepository` : Chunks vectorisés
- `NotificationRepository` : Notifications
- `ClassInvitationRepository` : Invitations
- `VideoRoomRepository` : Rooms vidéo
- `PresenceRepository` : Présence utilisateurs

### 10.6 Couche Données

**Firebase Firestore** :
- Collections : `organizations`, `profiles`, `classes`, `channels`, `messages`, etc.
- Indexes composites pour requêtes complexes
- Règles de sécurité Firestore

**Upstash Vector** :
- Namespaces par classe : `class-{classId}`
- Embeddings des chunks de documents
- Recherche par similarité cosinus

**UploadThing** :
- Stockage de fichiers (images, PDF, documents)
- CDN pour distribution rapide
- URLs signées pour sécurité

---

## 11. Description des Pages

### 11.1 Page d'Authentification (`/login`)

**Objectif** : Connexion des utilisateurs.

**Fonctionnalités** :
- Formulaire email/mot de passe
- OAuth Google
- Lien vers inscription
- Validation côté client et serveur

**Composants** :
- `LoginForm` : Formulaire de connexion
- `GoogleAuthButton` : Bouton OAuth Google

**Flux** :
1. Utilisateur entre email/mot de passe
2. Validation avec Zod
3. Appel à `AuthService.login()`
4. Création de JWT et cookie de session
5. Redirection vers `/organizations`

### 11.2 Page Organisations (`/organizations`)

**Objectif** : Sélectionner ou créer une organisation.

**Fonctionnalités** :
- Liste des organisations de l'utilisateur
- Création de nouvelle organisation
- Rejoindre par code d'invitation
- Sélection de l'organisation active

**Composants** :
- `OrganizationList` : Liste des organisations
- `CreateOrgForm` : Formulaire de création
- `JoinOrgForm` : Rejoindre par code

**Flux** :
1. Affichage des organisations de l'utilisateur
2. Sélection d'une organisation
3. Mise à jour du JWT avec `activeOrganizationId`
4. Redirection vers `/app`

### 11.3 Page Workspace (`/app`)

**Objectif** : Interface principale de travail.

**Layout** :
```
┌─────────────────────────────────────────────────────────┐
│  GlobalHeader (Logo, Org Selector, Notifications, User) │
├──────┬──────────────────────────────────────────────────┤
│      │                                                   │
│ Class│              Main Content Area                    │
│ Rail │  (Chat, Video, AI, Resources, Assignments)       │
│      │                                                   │
│      │                                                   │
└──────┴──────────────────────────────────────────────────┘
```

**Composants** :
- `GlobalHeader` : En-tête avec navigation
- `ClassRail` : Barre latérale des classes
- Contenu dynamique selon la route

**Fonctionnalités** :
- Navigation entre classes
- Accès rapide aux fonctionnalités
- Notifications en temps réel
- Changement d'organisation

### 11.4 Page Classe (`/app/[classSlug]`)

**Objectif** : Vue d'ensemble d'une classe.

**Sections** :
- Informations de la classe
- Statistiques (membres, devoirs, ressources)
- Activité récente
- Canaux disponibles
- Devoirs à venir

**Composants** :
- `ClassOverview` : Vue d'ensemble
- `ClassStats` : Statistiques
- `RecentActivity` : Activité récente
- `UpcomingAssignments` : Devoirs à venir

### 11.5 Page Canal (`/app/[classSlug]/channels/[channelId]`)

**Objectif** : Communication dans un canal.

**Types de canaux** :

#### Canal Textuel
- Liste des messages (pagination infinie)
- Formulaire d'envoi de message
- Réponses en fil (threads)
- Réactions emoji
- Pièces jointes
- Messages épinglés

**Composants** :
- `ChatView` : Interface de chat
- `MessageList` : Liste des messages
- `MessageInput` : Formulaire d'envoi
- `MessageItem` : Affichage d'un message
- `ThreadView` : Vue des réponses

#### Canal Vidéo
- Interface LiveKit intégrée
- Contrôles audio/vidéo
- Partage d'écran
- Liste des participants
- Chat textuel parallèle

**Composants** :
- `VideoChannelView` : Interface vidéo
- `LiveKitConference` : Composant LiveKit
- `ParticipantList` : Liste des participants

### 11.6 Page Assistant IA (`/app/[classSlug]/ai-assistant`)

**Objectif** : Chatbot IA personnalisé avec RAG.

**Fonctionnalités** :
- Liste des conversations
- Création de nouvelle conversation
- Chat avec streaming des réponses
- Affichage des sources citées
- Historique des conversations
- Suppression de conversations

**Composants** :
- `AIAssistantView` : Interface principale
- `ConversationList` : Liste des conversations
- `ChatInterface` : Interface de chat
- `MessageBubble` : Bulle de message
- `SourcesList` : Liste des sources citées
- `StreamingIndicator` : Indicateur de génération

**Flux** :
1. Étudiant sélectionne ou crée une conversation
2. Pose une question
3. Système vectorise la question
4. Recherche des chunks pertinents dans Upstash
5. Envoi au LLM avec contexte
6. Streaming de la réponse token par token
7. Affichage des sources utilisées

### 11.7 Page Devoirs (`/app/[classSlug]/assignments`)

**Objectif** : Gestion des devoirs.

**Vue Enseignant** :
- Liste de tous les devoirs
- Création de nouveau devoir
- Statistiques de soumission
- Accès aux soumissions pour correction

**Vue Étudiant** :
- Liste des devoirs assignés
- Statut (à faire, soumis, corrigé)
- Dates limites
- Scores obtenus

**Composants** :
- `AssignmentsList` : Liste des devoirs
- `CreateAssignmentButton` : Bouton de création
- `AssignmentCard` : Carte de devoir
- `AssignmentStats` : Statistiques

### 11.8 Page Détail Devoir (`/app/[classSlug]/assignments/[assignmentId]`)

**Objectif** : Détails et soumission d'un devoir.

**Vue Enseignant** :
- Détails du devoir
- Liste des soumissions
- Correction avec score et feedback
- Statistiques (soumis, en retard, non soumis)

**Vue Étudiant** :
- Énoncé du devoir
- Pièces jointes
- Formulaire de soumission
- Brouillon automatique
- Feedback reçu (si corrigé)

**Composants** :
- `AssignmentDetail` : Détails du devoir
- `SubmissionForm` : Formulaire de soumission
- `SubmissionsList` : Liste des soumissions (enseignant)
- `GradingInterface` : Interface de correction
- `FeedbackDisplay` : Affichage du feedback

### 11.9 Page Ressources (`/app/[classSlug]/resources`)

**Objectif** : Bibliothèque de ressources pédagogiques.

**Fonctionnalités** :
- Liste des ressources (grille ou liste)
- Upload de nouvelles ressources
- Recherche et filtrage
- Prévisualisation
- Téléchargement
- Indexation IA (PDF et texte)
- Tags et catégories

**Composants** :
- `ResourcesView` : Vue principale
- `ResourceGrid` : Grille de ressources
- `ResourceCard` : Carte de ressource
- `UploadResourceButton` : Bouton d'upload
- `ResourcePreview` : Prévisualisation
- `IndexingStatus` : Statut d'indexation

### 11.10 Page Paramètres Classe (`/app/[classSlug]/settings`)

**Objectif** : Configuration de la classe (enseignants uniquement).

**Sections** :

#### Général (`/settings`)
- Nom et description de la classe
- Image de la classe
- Visibilité (privée/publique)
- Code d'invitation
- Archivage de la classe

#### Membres (`/settings/members`)
- Liste des membres
- Rôles (teacher/student)
- Invitation de nouveaux membres
- Suppression de membres
- Changement de rôles

#### Permissions (`/settings/permissions`)
- Configuration des permissions par rôle
- Overrides personnalisés
- Permissions pour teachers
- Permissions pour students
- Paramètres globaux (uploads, IA)

**Composants** :
- `ClassSettingsLayout` : Layout des paramètres
- `GeneralSettings` : Paramètres généraux
- `MembersList` : Liste des membres
- `InviteMemberForm` : Formulaire d'invitation
- `PermissionsMatrix` : Matrice de permissions

### 11.11 Page Invitations (`/app/invitations`)

**Objectif** : Gérer les invitations en attente.

**Fonctionnalités** :
- Liste des invitations reçues
- Accepter une invitation
- Refuser une invitation
- Détails de l'invitation (classe, inviteur, rôle)

**Composants** :
- `InvitationsList` : Liste des invitations
- `InvitationCard` : Carte d'invitation
- `AcceptButton` : Bouton d'acceptation
- `RejectButton` : Bouton de refus

---

## 12. Intégrations IA

### 12.1 Architecture RAG (Retrieval-Augmented Generation)

**Objectif** : Fournir des réponses IA basées sur les documents de cours.

**Composants** :

#### 12.1.1 Indexation des Documents

**Processus** :
```
1. Upload de document (PDF ou texte)
   ↓
2. Extraction du texte
   - PDF : unpdf library
   - Texte : lecture directe
   ↓
3. Chunking intelligent
   - Taille max : 1200 caractères
   - Overlap : 150 caractères
   - Respect des paragraphes
   ↓
4. Vectorisation
   - Upstash génère les embeddings
   - Modèle : text-embedding-ada-002 (OpenAI)
   ↓
5. Stockage dans Upstash Vector
   - Namespace : class-{classId}
   - Métadonnées : mediaId, chunkText
   ↓
6. Marquage de la ressource comme indexée
```

**Code** :
```typescript
// DocumentIndexingService
async indexResource(classId, resourceId, fileUrl, fileType) {
  // 1. Charger le fichier
  const bytes = await loadFileBytes(fileUrl)
  
  // 2. Extraire le texte
  const text = isPdf ? await extractPdfText(bytes) : extractPlainText(bytes)
  
  // 3. Chunker le texte
  const chunks = chunkDocumentText(text, resourceId)
  
  // 4. Stocker dans Upstash
  await vectorIndex.upsert(chunks, { namespace: `class-${classId}` })
  
  // 5. Marquer comme indexé
  await resourceRepository.markAsIndexed(resourceId)
}
```

#### 12.1.2 Recherche Sémantique

**Processus** :
```
1. Question de l'étudiant
   ↓
2. Vectorisation de la question (Upstash)
   ↓
3. Recherche par similarité cosinus
   - Top K = 5 chunks les plus pertinents
   - Namespace : class-{classId}
   ↓
4. Récupération des chunks et métadonnées
   ↓
5. Construction du contexte pour le LLM
```

**Code** :
```typescript
// AIService.retrieveContext()
async retrieveContext(classId, query) {
  // Recherche vectorielle
  const matches = await vectorIndex.query({
    data: query,  // Upstash vectorise automatiquement
    topK: 5,
    includeMetadata: true
  }, { namespace: `class-${classId}` })
  
  // Extraction des chunks
  const chunks = matches.map(m => ({
    id: m.id,
    mediaId: m.metadata.mediaId,
    chunkText: m.metadata.chunkText
  }))
  
  // Récupération des ressources sources
  const sources = await getSourcesFromChunks(chunks)
  
  return { chunks, sources }
}
```

#### 12.1.3 Génération de Réponses

**Processus** :
```
1. Contexte (chunks) + Question + Historique
   ↓
2. Construction du prompt système
   ↓
3. Envoi au LLM (Groq - llama-3.1-8b-instant)
   ↓
4. Streaming de la réponse
   ↓
5. Stockage de la réponse avec sources
```

**Prompt système** :
```
You are an expert academic assistant inside a virtual classroom platform. 
Use the verified source context fragments below to answer the user's 
questions accurately. If the context does not provide enough data to answer, 
rely gracefully on your internal knowledge base while mentioning that the 
course documents didn't explicitly address the topic.

---
COURSE DOCUMENT CONTEXT MAP:
{contextText}
---
```

**Code** :
```typescript
// AIService.generateStreamingResponse()
async *generateStreamingResponse(conversationId, userMessage, userId) {
  // 1. Récupérer le contexte
  const context = await this.retrieveContext(classId, userMessage)
  
  // 2. Construire le prompt
  const messages = [
    { role: "system", content: systemPrompt + context },
    ...conversationHistory,
    { role: "user", content: userMessage }
  ]
  
  // 3. Streamer la réponse
  const stream = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages,
    stream: true
  })
  
  for await (const chunk of stream) {
    yield { type: "token", content: chunk.choices[0]?.delta?.content }
  }
  
  // 4. Envoyer les sources
  yield { type: "sources", sources: context.sources }
}
```

### 12.2 Modèle LLM : Groq

**Choix** : Groq avec llama-3.1-8b-instant

**Raisons** :
- **Vitesse** : Inférence ultra-rapide (jusqu'à 500 tokens/s)
- **Coût** : Gratuit pour usage modéré
- **Qualité** : Llama 3.1 8B performant pour tâches académiques
- **Streaming** : Support natif du streaming
- **API simple** : Compatible OpenAI SDK

**Configuration** :
```typescript
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

await groq.chat.completions.create({
  model: "llama-3.1-8b-instant",
  messages: [...],
  temperature: 0.3,  // Réponses plus déterministes
  max_completion_tokens: 1024,
  stream: true
})
```

### 12.3 Base Vectorielle : Upstash Vector

**Choix** : Upstash Vector Database

**Raisons** :
- **Serverless** : Pas de gestion d'infrastructure
- **Embeddings automatiques** : Génération native des vecteurs
- **Namespaces** : Isolation par classe
- **Scalabilité** : Auto-scaling
- **Latence faible** : Recherche rapide

**Configuration** :
```typescript
import { Index } from "@upstash/vector"

export const vectorIndex = new Index({
  url: process.env.UPSTASH_VECTOR_URL,
  token: process.env.UPSTASH_VECTOR_TOKEN
})

// Upsert avec génération automatique d'embeddings
await vectorIndex.upsert([
  {
    id: "chunk-1",
    data: "Le théorème de Pythagore...",  // Texte brut
    metadata: { mediaId: "resource-123", chunkText: "..." }
  }
], { namespace: "class-abc" })

// Query avec génération automatique d'embedding
const results = await vectorIndex.query({
  data: "Qu'est-ce que le théorème de Pythagore?",
  topK: 5
}, { namespace: "class-abc" })
```

---

## 13. Sécurité et Permissions

### 13.1 Authentification

**Méthodes** :
- **Email/Password** : Hashing avec Argon2
- **OAuth Google** : Flux OAuth 2.0

**Sessions** :
- JWT tokens stockés dans cookies HTTP-only
- Expiration : 7 jours
- Refresh automatique

**Code** :
```typescript
// Création de session
const payload = {
  userId: user.id,
  activeOrganizationId: orgId,
  iat: now,
  exp: now + 7 * 24 * 60 * 60  // 7 jours
}
const token = await signToken(payload)
await setAuthCookie(token)  // HTTP-only, Secure, SameSite
```

### 13.2 Autorisation

**Niveaux de contrôle** :
1. **Organisation** : owner, member
2. **Classe** : teacher, student
3. **Permissions granulaires** : 12 permissions spécifiques

**Vérifications** :
```typescript
// PermissionService
async requirePermission(classId, userId, permission) {
  const member = await classMemberRepo.getByClassAndUser(classId, userId)
  if (!member) throw new Error("Not a member")
  
  const settings = await classSettingsRepo.getByClass(classId)
  const permissions = getPermissionsForRole(member.role, settings)
  
  if (!permissions[permission]) {
    throw new Error(`Permission denied: ${permission}`)
  }
}
```

### 13.3 Isolation des Données

**Multi-tenancy** :
- Chaque organisation est isolée
- Les classes appartiennent à une organisation
- Les vecteurs IA sont isolés par namespace

**Vérifications systématiques** :
- Membership vérifié à chaque requête
- Permissions vérifiées avant chaque action
- Données filtrées par organisation/classe

### 13.4 Sécurité des Fichiers

**Upload** :
- Validation du type de fichier
- Limite de taille
- Scan antivirus (UploadThing)
- URLs signées pour accès

**Stockage** :
- CDN sécurisé (UploadThing)
- Accès contrôlé par permissions
- Pas d'accès direct aux fichiers

---

## 14. User Stories

### 14.1 Enseignant

**US-T1** : En tant qu'enseignant, je veux créer une classe pour organiser mon cours.
- **Critères** : Nom, slug, description, visibilité
- **Résultat** : Classe créée avec canaux par défaut

**US-T2** : En tant qu'enseignant, je veux inviter des étudiants à ma classe.
- **Critères** : Code d'invitation ou invitation directe
- **Résultat** : Étudiants peuvent rejoindre la classe

**US-T3** : En tant qu'enseignant, je veux créer un devoir avec date limite.
- **Critères** : Titre, description, date limite, score max
- **Résultat** : Devoir visible par les étudiants

**US-T4** : En tant qu'enseignant, je veux corriger les soumissions de devoirs.
- **Critères** : Score, feedback textuel
- **Résultat** : Étudiant reçoit sa note et feedback

**US-T5** : En tant qu'enseignant, je veux uploader des ressources pédagogiques.
- **Critères** : PDF, texte, images
- **Résultat** : Ressource accessible et indexée pour l'IA

**US-T6** : En tant qu'enseignant, je veux faire des annonces à toute la classe.
- **Critères** : Message dans canal #announcements
- **Résultat** : Tous les étudiants reçoivent une notification

**US-T7** : En tant qu'enseignant, je veux démarrer une vidéoconférence.
- **Critères** : Canal vidéo, room LiveKit
- **Résultat** : Étudiants peuvent rejoindre la vidéo

**US-T8** : En tant qu'enseignant, je veux gérer les permissions de la classe.
- **Critères** : Overrides par rôle
- **Résultat** : Permissions personnalisées appliquées

### 14.2 Étudiant

**US-S1** : En tant qu'étudiant, je veux rejoindre une classe avec un code.
- **Critères** : Code d'invitation valide
- **Résultat** : Accès à la classe et ses ressources

**US-S2** : En tant qu'étudiant, je veux poser une question dans le chat.
- **Critères** : Message dans canal textuel
- **Résultat** : Message visible par tous les membres

**US-S3** : En tant qu'étudiant, je veux soumettre un devoir.
- **Critères** : Contenu, pièces jointes, avant date limite
- **Résultat** : Soumission enregistrée, statut "submitted"

**US-S4** : En tant qu'étudiant, je veux consulter mes notes.
- **Critères** : Devoirs corrigés
- **Résultat** : Affichage score et feedback

**US-S5** : En tant qu'étudiant, je veux accéder aux ressources de cours.
- **Critères** : Bibliothèque de ressources
- **Résultat** : Téléchargement et consultation des documents

**US-S6** : En tant qu'étudiant, je veux poser une question à l'assistant IA.
- **Critères** : Question en langage naturel
- **Résultat** : Réponse basée sur les cours avec sources

**US-S7** : En tant qu'étudiant, je veux participer à une vidéoconférence.
- **Critères** : Rejoindre un canal vidéo actif
- **Résultat** : Audio/vidéo fonctionnel, partage d'écran

**US-S8** : En tant qu'étudiant, je veux recevoir des notifications pour les nouveaux devoirs.
- **Critères** : Nouveau devoir créé
- **Résultat** : Notification en temps réel

### 14.3 Administrateur

**US-A1** : En tant qu'admin, je veux créer une organisation.
- **Critères** : Nom, type, visibilité
- **Résultat** : Organisation créée, admin devient owner

**US-A2** : En tant qu'admin, je veux inviter des enseignants.
- **Critères** : Code d'invitation ou invitation directe
- **Résultat** : Enseignants rejoignent l'organisation

**US-A3** : En tant qu'admin, je veux voir toutes les classes de l'organisation.
- **Critères** : Vue d'ensemble
- **Résultat** : Liste complète des classes

**US-A4** : En tant qu'admin, je veux gérer les membres de l'organisation.
- **Critères** : Ajouter, supprimer, changer rôles
- **Résultat** : Membres gérés efficacement

---

## 15. État d'Avancement

### 15.1 Fonctionnalités Complètes ✅

- ✅ Authentification (email/password, OAuth Google)
- ✅ Gestion des organisations (CRUD, membres, invitations)
- ✅ Gestion des classes (CRUD, membres, paramètres)
- ✅ Système de chat textuel (messages, threads, réactions)
- ✅ Canaux (text, announcement, video)
- ✅ Vidéoconférence LiveKit (rooms, tokens, interface)
- ✅ Gestion des devoirs (création, soumission, correction)
- ✅ Bibliothèque de ressources (upload, métadonnées)
- ✅ Indexation IA (PDF, texte, chunking, vectorisation)
- ✅ Assistant IA avec RAG (conversations, streaming, sources)
- ✅ Système de notifications
- ✅ Invitations directes
- ✅ Système de permissions granulaire
- ✅ Interface utilisateur moderne et responsive

### 15.2 Fonctionnalités en Cours 🚧

- 🚧 Statistiques et analytics
- 🚧 Recherche globale dans les messages
- 🚧 Catégories de canaux
- 🚧 Présence utilisateurs en temps réel
- 🚧 Enregistrement des vidéoconférences

### 15.3 Fonctionnalités Prévues 📋

- 📋 Quiz et évaluations automatisées
- 📋 Calendrier de classe
- 📋 Intégration calendrier externe (Google Calendar)
- 📋 Badges et gamification
- 📋 Rapports de progression
- 📋 Export de données
- 📋 API publique
- 📋 Application mobile
- 📋 Mode hors ligne
- 📋 Traduction multilingue

---

## 16. Perspectives d'Évolution

### 16.1 Court Terme (3-6 mois)

**Améliorations UX** :
- Recherche globale dans tous les contenus
- Raccourcis clavier
- Mode sombre amélioré
- Notifications push (PWA)

**Fonctionnalités** :
- Quiz interactifs avec correction automatique
- Calendrier intégré
- Présence en temps réel
- Enregistrement des vidéos

**Performance** :
- Optimisation des requêtes Firestore
- Mise en cache côté client
- Lazy loading des composants
- Compression des images

### 16.2 Moyen Terme (6-12 mois)

**IA Avancée** :
- Génération automatique de quiz depuis les cours
- Résumés automatiques de documents
- Détection de plagiat
- Recommandations personnalisées de ressources
- Analyse de sentiment dans les discussions

**Collaboration** :
- Édition collaborative de documents
- Tableaux blancs partagés
- Breakout rooms dans les vidéos
- Projets de groupe avec suivi

**Analytics** :
- Tableaux de bord pour enseignants
- Suivi de progression des étudiants
- Rapports d'engagement
- Prédiction de réussite

### 16.3 Long Terme (12+ mois)

**Scalabilité** :
- Migration vers architecture microservices
- Mise en place de Kubernetes
- CDN global
- Réplication multi-région

**Intégrations** :
- LMS externes (Moodle, Canvas)
- Outils de productivité (Notion, Trello)
- Systèmes de paiement (abonnements)
- SSO entreprise (SAML, LDAP)

**Monétisation** :
- Plan gratuit (limité)
- Plans payants (Pro, Enterprise)
- Marketplace de contenus
- API payante

**Mobile** :
- Application native iOS
- Application native Android
- Synchronisation offline
- Notifications push natives

---

## Conclusion

OpenClass représente une solution moderne et complète pour l'apprentissage collaboratif en ligne. En combinant communication en temps réel, gestion de contenu pédagogique et intelligence artificielle, la plateforme répond aux besoins des enseignants, étudiants et institutions éducatives.

L'architecture technique solide, basée sur Next.js et des services cloud performants, garantit scalabilité et fiabilité. L'intégration de l'IA avec RAG offre une expérience d'apprentissage personnalisée et contextuelle.

Le projet est en développement actif avec une base fonctionnelle solide et de nombreuses perspectives d'évolution pour devenir une référence dans le domaine de l'EdTech.

---

**Document généré pour le Projet de Fin d'Études (PFE)**  
**Date** : 2026  
**Plateforme** : OpenClass  
**Version** : 1.0
