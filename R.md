% ============================================================
%  RAPPORT DE STAGE DE FIN D'ÉTUDES — OpenClass
%  Brain Skills — Maroc
%  Format PFE marocain — Times New Roman, normes académiques
% ============================================================

\documentclass[12pt, a4paper, twoside]{report}

% ── Encodage et langue ──────────────────────────────────────
\usepackage[utf8]{inputenc}
\usepackage[T1]{fontenc}
\usepackage[french]{babel}
\usepackage{csquotes}

% ── Police Times New Roman ──────────────────────────────────
\usepackage{mathptmx}        % Times serif pour texte + math
\usepackage[scaled=0.90]{helvet}
\usepackage{courier}

% ── Mise en page ────────────────────────────────────────────
\usepackage[
  top=2.5cm, bottom=2.5cm,
  left=3cm,  right=2.5cm,
  headheight=15pt
]{geometry}
\usepackage{setspace}
\onehalfspacing              % interligne 1,5 (norme PFE marocain)

% ── En-têtes et pieds de page ───────────────────────────────
\usepackage{fancyhdr}
\pagestyle{fancy}
\fancyhf{}
\fancyhead[LE,RO]{\small\thepage}
\fancyhead[RE]{\small\leftmark}
\fancyhead[LO]{\small\rightmark}
\renewcommand{\headrulewidth}{0.4pt}

% ── Titres de chapitres (style académique sobre) ────────────
\usepackage{titlesec}
\titleformat{\chapter}[display]
  {\normalfont\Large\bfseries\centering}
  {\chaptertitlename\ \thechapter}{12pt}{\LARGE}
\titlespacing*{\chapter}{0pt}{30pt}{20pt}

\titleformat{\section}
  {\normalfont\large\bfseries}{\thesection}{1em}{}
\titleformat{\subsection}
  {\normalfont\normalsize\bfseries}{\thesubsection}{1em}{}
\titleformat{\subsubsection}
  {\normalfont\normalsize\itshape}{\thesubsubsection}{1em}{}

% ── Table des matières ──────────────────────────────────────
\usepackage{tocloft}
\setlength{\cftbeforechapskip}{6pt}

% ── Figures et tableaux ─────────────────────────────────────
\usepackage{graphicx}
\usepackage{float}
\usepackage{caption}
\usepackage{subcaption}
\captionsetup{font=small, labelfont=bf}
\usepackage{booktabs}
\usepackage{longtable}
\usepackage{tabularx}
\usepackage{multirow}
\usepackage{array}

% ── Code source ─────────────────────────────────────────────
\usepackage{listings}
\usepackage{xcolor}

\definecolor{codebg}{RGB}{248,248,248}
\definecolor{codeframe}{RGB}{200,200,200}
\definecolor{keyword}{RGB}{0,0,180}
\definecolor{comment}{RGB}{106,153,85}
\definecolor{string}{RGB}{163,21,21}

\lstset{
  backgroundcolor=\color{codebg},
  basicstyle=\ttfamily\footnotesize,
  keywordstyle=\color{keyword}\bfseries,
  commentstyle=\color{comment},
  stringstyle=\color{string},
  frame=single,
  rulecolor=\color{codeframe},
  breaklines=true,
  breakatwhitespace=true,
  numbers=left,
  numberstyle=\tiny\color{gray},
  numbersep=8pt,
  showstringspaces=false,
  tabsize=2,
  captionpos=b
}

\lstdefinelanguage{TypeScript}{
  keywords={const,let,var,function,async,await,return,import,export,
            from,interface,type,class,extends,implements,new,this,
            throw,try,catch,finally,if,else,for,while,of,in,default,
            true,false,null,undefined,string,number,boolean,void,
            Promise,Record,Partial,Required,Readonly,Array,object},
  morecomment=[l]{//},
  morecomment=[s]{/*}{*/},
  morestring=[b]",
  morestring=[b]',
  morestring=[b]`
}

\lstdefinelanguage{bash}{
  keywords={npx,pnpm,npm,cd,echo,export,git},
  morecomment=[l]{\#},
  morestring=[b]"
}

% ── Hyperliens ──────────────────────────────────────────────
\usepackage[
  colorlinks=true,
  linkcolor=black,
  citecolor=black,
  urlcolor=blue,
  bookmarks=true,
  pdftitle={Rapport PFE — OpenClass},
  pdfauthor={Stagiaire Brain Skills}
]{hyperref}

% ── Listes et puces ─────────────────────────────────────────
\usepackage{enumitem}
\setlist[itemize]{noitemsep, topsep=4pt}
\setlist[enumerate]{noitemsep, topsep=4pt}

% ── Divers ──────────────────────────────────────────────────
\usepackage{amsmath}
\usepackage{amssymb}
\usepackage{pifont}          % symboles ✓ ✗
\newcommand{\cmark}{\ding{51}}
\newcommand{\xmark}{\ding{55}}
\usepackage{lscape}          % tableaux en paysage
\usepackage{pdflscape}
\usepackage{microtype}       % justification améliorée
\usepackage{parskip}
\setlength{\parskip}{6pt}
\setlength{\parindent}{0pt}

% ── Boîtes colorées ─────────────────────────────────────────
\usepackage{tcolorbox}
\tcbuselibrary{breakable, skins}

\newtcolorbox{notebox}[1][]{
  colback=blue!5!white, colframe=blue!60!black,
  fonttitle=\bfseries, title=Note, #1
}
\newtcolorbox{warningbox}[1][]{
  colback=orange!5!white, colframe=orange!80!black,
  fonttitle=\bfseries, title=Avertissement, #1
}

% ── Commande figure vide (captures d'écran) ─────────────────
\newcommand{\screenshottbd}[2][0.85\textwidth]{%
  \begin{figure}[H]
    \centering
    \fbox{\parbox{#1}{\centering\vspace{2cm}
      \textit{\textbf{[Capture d'écran à insérer]}\\[4pt]#2}
      \vspace{2cm}}}
    \caption{#2}
    \label{fig:#2}
  \end{figure}
}

\newcommand{\diagramtbd}[2][0.85\textwidth]{%
  \begin{figure}[H]
    \centering
    \fbox{\parbox{#1}{\centering\vspace{2cm}
      \textit{\textbf{[Diagramme à insérer]}\\[4pt]#2}
      \vspace{2cm}}}
    \caption{#2}
    \label{fig:diag:#2}
  \end{figure}
}

% ── Numérotation continue des figures/tableaux ──────────────
\usepackage{chngcntr}
\counterwithin{figure}{chapter}
\counterwithin{table}{chapter}

% ============================================================
\begin{document}

% ── Pages préliminaires (numérotation romaine) ───────────────
\pagenumbering{roman}
\setcounter{page}{1}

% ─── TABLE DES MATIÈRES ────────────────────────────────────
\tableofcontents
\clearpage

% ─── LISTE DES FIGURES ─────────────────────────────────────
\listoffigures
\addcontentsline{toc}{chapter}{Liste des figures}
\clearpage

% ─── LISTE DES TABLEAUX ────────────────────────────────────
\listoftables
\addcontentsline{toc}{chapter}{Liste des tableaux}
\clearpage

% ── Corps du document (numérotation arabe) ───────────────────
\pagenumbering{arabic}
\setcounter{page}{1}

% ============================================================
%  CHAPITRE 1 — INTRODUCTION GÉNÉRALE
% ============================================================
\chapter{Introduction Générale}

\section{Contexte du Projet}

L'enseignement à distance et hybride est devenu une nécessité dans le paysage
éducatif moderne, particulièrement depuis la pandémie de COVID-19. Les institutions
éducatives font face à plusieurs défis majeurs dans la mise en place de solutions
d'apprentissage en ligne efficaces.

Le secteur de l'éducation numérique (EdTech) connaît une croissance exponentielle.
Selon les estimations du cabinet HolonIQ, le marché mondial est évalué à plus de
250 milliards de dollars en 2025, avec un taux de croissance annuel de l'ordre de
16 à 20\,\%. Les solutions existantes présentent cependant des limitations
importantes :

\begin{itemize}
  \item \textbf{Fragmentation des outils} : les enseignants et les étudiants doivent
        jongler entre plusieurs plateformes (Zoom pour la vidéo, Slack pour la
        communication, Google Classroom pour les devoirs, etc.) ;
  \item \textbf{Manque de personnalisation} : les plateformes actuelles adoptent une
        approche \textit{one-size-fits-all} qui ne s'adapte pas aux besoins
        individuels des apprenants ;
  \item \textbf{Absence d'intelligence artificielle} : peu de solutions intègrent
        l'IA pour assister l'apprentissage de manière contextuelle ;
  \item \textbf{Difficulté d'accès aux ressources} : les documents pédagogiques sont
        souvent dispersés et difficiles à retrouver.
\end{itemize}

C'est dans ce contexte que s'inscrit le projet \textbf{OpenClass}, développé au
sein de l'entreprise \textbf{Brain Skills}, spécialisée dans l'éducation et la
formation.

\section{Problématique}

\begin{tcolorbox}[colback=gray!8, colframe=gray!50, fonttitle=\bfseries,
  title=Question de recherche]
Comment créer une plateforme unifiée qui combine communication en temps réel,
gestion de contenu pédagogique et assistance par intelligence artificielle pour
améliorer l'expérience d'apprentissage collaboratif~?
\end{tcolorbox}

Cette problématique soulève plusieurs sous-questions :
\begin{itemize}
  \item Comment centraliser tous les outils nécessaires à l'apprentissage en ligne
        dans une seule plateforme ?
  \item Comment utiliser l'IA pour personnaliser l'expérience d'apprentissage de
        chaque étudiant ?
  \item Comment rendre les ressources pédagogiques facilement accessibles et
        recherchables ?
  \item Comment faciliter la collaboration en temps réel entre enseignants et
        étudiants ?
  \item Comment assurer la sécurité et la confidentialité des données éducatives ?
\end{itemize}

\section{Objectifs du Projet}

\subsection{Objectifs Principaux}

\begin{enumerate}
  \item \textbf{Unification} : créer une plateforme tout-en-un pour l'apprentissage
        collaboratif, éliminant le besoin de jongler entre plusieurs outils ;
  \item \textbf{Personnalisation} : offrir une expérience d'apprentissage adaptée à
        chaque étudiant grâce à l'intelligence artificielle ;
  \item \textbf{Collaboration} : faciliter l'interaction en temps réel entre tous
        les acteurs (enseignants, étudiants, administrateurs) ;
  \item \textbf{Accessibilité} : rendre les ressources pédagogiques facilement
        recherchables grâce à l'indexation sémantique ;
  \item \textbf{Scalabilité} : supporter plusieurs organisations avec des milliers
        d'utilisateurs simultanés.
\end{enumerate}

\subsection{Objectifs Techniques}

\begin{itemize}
  \item Développer une architecture moderne basée sur Next.js~16 avec App Router ;
  \item Implémenter un système de permissions granulaire et sécurisé ;
  \item Intégrer l'intelligence artificielle avec RAG
        (\textit{Retrieval-Augmented Generation}) ;
  \item Mettre en place la communication temps réel avec LiveKit pour la
        vidéoconférence ;
  \item Utiliser l'indexation vectorielle pour la recherche sémantique dans les
        documents ;
  \item Créer une architecture multi-tenant avec isolation complète des données.
\end{itemize}

\subsection{Objectifs Fonctionnels}

\begin{itemize}
  \item Gestion complète des organisations et classes ;
  \item Système de chat textuel avec canaux organisés ;
  \item Vidéoconférence intégrée dans les canaux ;
  \item Gestion des devoirs (création, soumission, correction) ;
  \item Bibliothèque de ressources avec indexation automatique ;
  \item Assistant IA personnalisé par étudiant avec accès aux cours ;
  \item Système de notifications en temps réel ;
  \item Gestion des invitations et permissions.
\end{itemize}

\section{Périmètre de l'Application}

\subsection{Utilisateurs Cibles}

\textbf{Enseignants} : professeurs d'université, enseignants de lycée et collège,
formateurs en entreprise, tuteurs privés.

\textbf{Étudiants} : étudiants universitaires, élèves de lycée et collège,
apprenants en formation continue, participants à des cours en ligne.

\textbf{Administrateurs} : directeurs d'établissements, responsables pédagogiques,
administrateurs système, gestionnaires de formation.

\subsection{Fonctionnalités Couvertes}

\begin{table}[H]
  \centering
  \caption{Fonctionnalités couvertes par OpenClass}
  \begin{tabular}{lc}
    \toprule
    \textbf{Fonctionnalité} & \textbf{Statut} \\
    \midrule
    Authentification et gestion des utilisateurs & \cmark \\
    Gestion multi-tenant (organisations)         & \cmark \\
    Création et gestion de classes               & \cmark \\
    Communication textuelle (chat)               & \cmark \\
    Vidéoconférence (LiveKit)                    & \cmark \\
    Gestion des devoirs et soumissions           & \cmark \\
    Bibliothèque de ressources                   & \cmark \\
    Assistant IA avec RAG                        & \cmark \\
    Notifications en temps réel                  & \cmark \\
    Système de permissions                       & \cmark \\
    Monétisation et abonnements (Polar)          & \cmark \\
    \bottomrule
  \end{tabular}
  \label{tab:features}
\end{table}

\section{Méthodologie Utilisée}

\subsection{Approche de Développement}

Le projet a été développé en suivant une \textbf{méthodologie Agile} avec des
sprints de deux semaines. Cette approche itérative a permis des livraisons
fréquentes de fonctionnalités, une adaptation rapide aux changements de besoins,
des tests continus tout au long du développement et une collaboration étroite avec
l'encadrant.

\subsection{Phases du Projet}

\begin{description}
  \item[Phase 1 — Analyse et Conception (2 semaines)]
        Étude de l'existant, définition des besoins, conception de l'architecture,
        modélisation de la base de données.
  \item[Phase 2 — Développement du Core (3 semaines)]
        Authentification email/mot de passe et Google OAuth, gestion des
        organisations et classes, système de permissions, interface utilisateur.
  \item[Phase 3 — Fonctionnalités de Communication (2 semaines)]
        Chat textuel avec canaux, vidéoconférence, notifications.
  \item[Phase 4 — Gestion Pédagogique (2 semaines)]
        Système de devoirs, bibliothèque de ressources, invitations.
  \item[Phase 5 — Intelligence Artificielle (2 semaines)]
        Indexation automatique des documents, intégration Upstash Vector, assistant
        IA avec streaming (Groq/Llama~3.1~8B).
  \item[Phase 6 — Monétisation et Facturation (1 semaine)]
        Intégration Polar, abonnements, contrôle d'accès aux fonctionnalités
        premium.
  \item[Phase 7 — Tests et Déploiement (2 semaines)]
        Tests manuels et via Postman, déploiement sur Vercel, documentation.
\end{description}

\subsection{Outils de Gestion de Projet}

\begin{table}[H]
  \centering
  \caption{Outils de gestion de projet}
  \begin{tabular}{ll}
    \toprule
    \textbf{Outil} & \textbf{Usage} \\
    \midrule
    Git / GitHub      & Contrôle de version et collaboration \\
    Excalidraw        & Maquettes et design \\
    Postman           & Tests des API \\
    VS Code           & Environnement de développement \\
    \bottomrule
  \end{tabular}
  \label{tab:tools-intro}
\end{table}

% ============================================================
%  CHAPITRE 2 — L'ENTREPRISE ET SON SECTEUR D'ACTIVITÉ
% ============================================================
\chapter{L'Entreprise et son Secteur d'Activité}

\section{Présentation de Brain Skills}

\subsection{Informations Générales}

\begin{table}[H]
  \centering
  \caption{Fiche d'identité de Brain Skills}
  \begin{tabular}{ll}
    \toprule
    \textbf{Rubrique} & \textbf{Information} \\
    \midrule
    Raison sociale    & Brain Skills \\
    Forme juridique   & SARL à Associé Unique (SARL~AU) \\
    Capital social    & 100\,000 DHS \\
    Date de création  & 18 avril 2016 \\
    Siège social      & Bd Moulay Idriss~1\ier, Imm.~Chaiba, Appt.~n°1, Safi \\
    Téléphone         & +212~696-098343 \\
    Email             & brainskills.abc@gmail.com \\
    \bottomrule
  \end{tabular}
  \label{tab:brainskills}
\end{table}

\subsection{Domaines d'Activité}

Brain Skills est une entreprise marocaine spécialisée dans l'éducation et la
formation, avec plusieurs axes d'activité :

\begin{itemize}
  \item Robotique et informatique ;
  \item Événements scolaires ;
  \item Enseignement des langues ;
  \item Cours particuliers (toutes matières) ;
  \item Aide aux devoirs ;
  \item Méthodologie et organisation.
\end{itemize}

\section{Secteur d'Activité : l'EdTech au Maroc}

\subsection{Le Marché de l'EdTech}

Le secteur de la technologie éducative (EdTech) connaît une croissance rapide au
Maroc et dans le monde. Les principaux indicateurs de marché, issus des rapports
HolonIQ et de l'OCDE (2024), sont présentés dans le tableau suivant.

\begin{table}[H]
  \centering
  \caption{Chiffres clés du marché EdTech}
  \begin{tabular}{ll}
    \toprule
    \textbf{Indicateur} & \textbf{Valeur} \\
    \midrule
    Marché mondial EdTech (2025)        & $>$ 250 milliards USD \\
    Taux de croissance annuel           & 16--20\,\% \\
    Marché africain                     & $>$ 3 milliards USD \\
    Taux de pénétration internet — Maroc & 88\,\% \\
    \bottomrule
  \end{tabular}
  \label{tab:edtech-market}
\end{table}

\textit{Sources : HolonIQ EdTech Intelligence Report 2024~; OCDE, Regards sur
l'éducation 2024.}

Les principaux facteurs de croissance sont la digitalisation accélérée
post-COVID, les investissements gouvernementaux dans l'éducation numérique, la
démocratisation des smartphones et d'internet, et le besoin croissant de
formation continue.

\subsection{Positionnement de Brain Skills}

Brain Skills se positionne comme un acteur innovant dans l'écosystème EdTech
marocain, avec les forces suivantes :

\begin{itemize}
  \item Expertise locale et connaissance du marché marocain ;
  \item Approche multimodale (présentiel + distanciel) ;
  \item Focus sur les compétences du 21\ieme{} siècle (coding, robotique) ;
  \item Équipe pédagogique qualifiée.
\end{itemize}

Les principales opportunités identifiées sont l'expansion vers d'autres villes
marocaines, les partenariats avec établissements scolaires et le développement de
contenus numériques certifiants.

\section{Motivation du Projet OpenClass}

Brain Skills a identifié plusieurs besoins non satisfaits dans son activité :

\begin{enumerate}
  \item \textbf{Besoin d'une plateforme unifiée} : les cours en ligne utilisaient
        plusieurs outils dispersés ;
  \item \textbf{Suivi personnalisé} : difficulté à suivre la progression individuelle
        de chaque apprenant ;
  \item \textbf{Accessibilité des ressources} : documents pédagogiques difficiles à
        organiser et retrouver ;
  \item \textbf{Interaction limitée} : manque d'outils de collaboration en temps
        réel ;
  \item \textbf{Assistance 24/7} : impossibilité de répondre aux questions des
        étudiants en dehors des heures de cours.
\end{enumerate}

Le projet OpenClass répond directement à ces besoins en proposant une solution
complète et intégrée.

% ============================================================
%  CHAPITRE 3 — CAHIER DES CHARGES
% ============================================================
\chapter{Cahier des Charges}

\section{Exigences Fonctionnelles}

\subsection{Gestion des Utilisateurs et Authentification}

\textbf{Inscription et connexion}
\begin{itemize}
  \item L'utilisateur peut s'inscrire avec un email et un mot de passe.
  \item L'utilisateur peut se connecter via Google OAuth.
  \item Le système valide l'unicité de l'email.
  \item Le mot de passe est haché à l'aide d'Argon2id.
\end{itemize}

\textbf{Gestion du profil}
\begin{itemize}
  \item L'utilisateur peut modifier son profil (nom, avatar, bio).
  \item L'utilisateur peut changer son mot de passe.
  \item L'utilisateur peut consulter son historique d'activité.
\end{itemize}

\subsection{Gestion des Organisations}

\textbf{Création d'organisation}
\begin{itemize}
  \item Un utilisateur peut créer une organisation ; il en devient automatiquement
        propriétaire (\textit{owner}).
  \item L'organisation possède un \textit{slug} unique.
  \item Types supportés : école, université, académie, entreprise.
\end{itemize}

\textbf{Gestion des membres d'organisation}
\begin{itemize}
  \item Le propriétaire invite des membres via un code à 8~caractères.
  \item Rôles au niveau organisation : \texttt{owner} et \texttt{member}.
  \item Le propriétaire peut promouvoir ou rétrograder des membres.
\end{itemize}

\subsection{Gestion des Classes}

\textbf{Création de classes}
\begin{itemize}
  \item Les propriétaires d'organisation créent des classes avec un slug unique.
  \item Création automatique de canaux par défaut
        (\texttt{\#general}, \texttt{\#announcements}).
\end{itemize}

\textbf{Gestion des membres de classe}
\begin{itemize}
  \item Invitation par code ou directement.
  \item Rôles : \texttt{teacher} (enseignant) et \texttt{student} (étudiant).
  \item Les enseignants peuvent gérer la classe ; les étudiants ont des permissions
        limitées.
\end{itemize}

\subsection{Communication}

\textbf{Chat textuel}
\begin{itemize}
  \item Envoi de messages dans les canaux avec pièces jointes.
  \item Édition et suppression de messages.
\end{itemize}

\textbf{Vidéoconférence}
\begin{itemize}
  \item Création de rooms vidéo dans les canaux.
  \item Audio/vidéo en temps réel, partage d'écran.
  \item Support jusqu'à 50~participants.
\end{itemize}

\textbf{Notifications}
\begin{itemize}
  \item Notifications pour nouveaux messages, annonces, invitations et devoirs.
\end{itemize}

\subsection{Gestion Pédagogique}

\textbf{Devoirs}
\begin{itemize}
  \item Les enseignants créent des devoirs avec date limite et score maximum.
  \item Les étudiants soumettent leurs devoirs avec support des brouillons.
  \item Gestion des soumissions tardives ; correction avec score.
\end{itemize}

\textbf{Ressources}
\begin{itemize}
  \item Upload de fichiers (PDF, images, documents).
  \item Organisation par chapitres ; téléchargement disponible.
\end{itemize}

\textbf{Indexation IA}
\begin{itemize}
  \item Indexation des PDF et fichiers texte pour recherche sémantique.
\end{itemize}

\subsection{Monétisation et Facturation}

La plateforme intègre un système complet de monétisation par abonnements.
Les exigences détaillées (abonnements, contrôle d'accès par fonctionnalité) sont
présentées dans la section~\ref{sec:monetisation}, consacrée aux fonctionnalités
de facturation.

\subsection{Assistant IA}

\textbf{Chatbot personnalisé}
\begin{itemize}
  \item Conversation IA par étudiant avec accès aux ressources de la classe (RAG).
  \item Réponses contextuelles basées sur les cours, avec citation des sources.
  \item Streaming des réponses via Server-Sent Events.
  \item Historique des conversations sauvegardé en base.
\end{itemize}

\section{Exigences Non-Fonctionnelles}

\subsection{Performance}

\begin{table}[H]
  \centering
  \caption{Objectifs de performance}
  \begin{tabular}{lll}
    \toprule
    \textbf{Indicateur} & \textbf{Cible} & \textbf{Périmètre} \\
    \midrule
    Chargement des pages          & $<$ 2 s      & Toutes les pages \\
    Réponse API                   & $<$ 500 ms   & Routes REST \\
    Première réponse IA           & $<$ 1 s      & Streaming \\
    Utilisateurs simultanés       & 10\,000+     & Scalabilité \\
    Uptime                        & 99,9\,\%     & Disponibilité \\
    \bottomrule
  \end{tabular}
  \label{tab:perf}
\end{table}

\subsection{Sécurité}

\begin{itemize}
  \item Hachage des mots de passe avec Argon2id.
  \item JWT tokens avec expiration ; cookies HTTP-only et Secure.
  \item Support OAuth~2.0.
  \item Vérification des permissions à chaque requête.
  \item Isolation des données par organisation (RBAC).
  \item Chiffrement en transit (HTTPS) et au repos.
  \item Conformité RGPD.
\end{itemize}

\subsection{Utilisabilité}

\begin{itemize}
  \item Design responsive (mobile, tablette, bureau).
  \item Accessibilité WCAG~2.1 niveau~AA.
  \item Support multilingue (français, anglais, arabe).
  \item Navigation fluide avec \textit{feedback} visuel immédiat.
\end{itemize}

\subsection{Maintenabilité}

\begin{itemize}
  \item Code TypeScript entièrement typé.
  \item Documentation du code.
  \item Déploiement sans interruption avec \textit{rollback} rapide.
  \item Monitoring en temps réel.
\end{itemize}

\section{Rôles Utilisateurs}

\subsection{Administrateur Plateforme}

L'administrateur plateforme dispose d'un accès à toutes les organisations, à la
gestion des utilisateurs, au monitoring système et à la configuration globale.

\subsection{Propriétaire d'Organisation (Owner)}

\textbf{Permissions exclusives} :
\begin{itemize}
  \item \texttt{manage\_organization} : configurer l'organisation ;
  \item \texttt{manage\_class} : créer, modifier et archiver des classes ;
  \item \texttt{manage\_roles} : assigner des rôles aux membres.
\end{itemize}

Le propriétaire dispose également de toutes les permissions des enseignants et
étudiants, gère l'abonnement et la facturation, et peut modifier les
\textit{overrides} de permissions par classe.

\subsection{Membre d'Organisation}

Un membre peut consulter les classes auxquelles il appartient, rejoindre des
classes par invitation ou code, et se voir attribuer un rôle dans chaque classe
(\texttt{teacher} ou \texttt{student}).

\subsection{Enseignant (Teacher)}

\textbf{Permissions par défaut} :

\begin{table}[H]
  \centering
  \caption{Permissions des enseignants et étudiants}
  \begin{tabular}{lcc}
    \toprule
    \textbf{Permission} & \textbf{Teacher} & \textbf{Student} \\
    \midrule
    \texttt{manage\_organization} & \xmark & \xmark \\
    \texttt{manage\_class}        & \xmark & \xmark \\
    \texttt{manage\_roles}        & \xmark & \xmark \\
    \texttt{send\_messages}       & \cmark & \cmark \\
    \texttt{upload\_files}        & \cmark & \cmark \\
    \texttt{join\_voice}          & \cmark & \cmark \\
    \texttt{join\_video}          & \cmark & \cmark \\
    \texttt{use\_ai}              & \cmark & \cmark \\
    \bottomrule
  \end{tabular}
  \label{tab:permissions}
\end{table}

\begin{notebox}
Les enseignants et les étudiants partagent les mêmes permissions par défaut. La
différenciation des rôles s'opère au niveau applicatif (création de devoirs,
correction, gestion des canaux). Le propriétaire peut modifier ces permissions par
classe via le système d'overrides.
\end{notebox}

\section{Cas d'Utilisation}

\subsection{Diagramme de Cas d'Utilisation Global}

\diagramtbd{Diagramme de cas d'utilisation global — OpenClass}

\subsection{Cas d'Utilisation Détaillés}

\textbf{CU-01 : Créer un Devoir}

\begin{table}[H]
  \centering
  \caption{CU-01 — Créer un devoir}
  \begin{tabularx}{\textwidth}{lX}
    \toprule
    \textbf{Rubrique} & \textbf{Description} \\
    \midrule
    Acteur principal  & Enseignant \\
    Préconditions     & L'enseignant est membre de la classe avec le rôle \texttt{teacher} \\
    Scénario nominal  &
      1.~Accéder à la section «~Devoirs~» de la classe. \newline
      2.~Cliquer sur «~Créer un devoir~». \newline
      3.~Remplir le formulaire (titre, description, date limite, score max). \newline
      4.~Ajouter des pièces jointes si nécessaire. \newline
      5.~Configurer les options (soumissions tardives autorisées). \newline
      6.~Valider ; le système crée le devoir et notifie les étudiants. \\
    Scénarios alt.    &
      3a.~Données invalides → message d'erreur. \newline
      6a.~Erreur serveur → invitation à réessayer. \\
    Postconditions    & Le devoir est visible par tous les étudiants de la classe. \\
    \bottomrule
  \end{tabularx}
  \label{tab:cu01}
\end{table}

\textbf{CU-02 : Utiliser l'Assistant IA}

\begin{table}[H]
  \centering
  \caption{CU-02 — Utiliser l'assistant IA}
  \begin{tabularx}{\textwidth}{lX}
    \toprule
    \textbf{Rubrique} & \textbf{Description} \\
    \midrule
    Acteur principal  & Étudiant \\
    Préconditions     &
      L'étudiant est membre de la classe avec la permission \texttt{use\_ai} ; \newline
      le module IA est activé sur l'abonnement de l'organisation ; \newline
      \texttt{allowAIAccess = true} dans les paramètres de la classe. \\
    Scénario nominal  &
      1.~Accéder à l'assistant IA de la classe. \newline
      2.~Sélectionner ou créer une conversation. \newline
      3.~Poser une question en langage naturel. \newline
      4.~Le système vectorise la requête et interroge Upstash Vector. \newline
      5.~Le contexte est construit et envoyé à Groq. \newline
      6.~La réponse est diffusée token par token via Server-Sent Events. \newline
      7.~Les sources citées sont envoyées en fin de stream. \newline
      8.~Le message est sauvegardé en base avec les sources. \\
    Scénarios alt.    &
      2a.~Module IA non activé → écran d'upgrade. \newline
      5a.~Aucun document indexé → réponse basée sur les connaissances générales du LLM. \newline
      6a.~Erreur API Groq → message d'erreur. \\
    Postconditions    & La conversation est sauvegardée ; messages et sources sont consultables ultérieurement. \\
    \bottomrule
  \end{tabularx}
  \label{tab:cu02}
\end{table}

% ============================================================
%  CHAPITRE 4 — GESTION DE PROJET
% ============================================================
\chapter{Gestion de Projet}

\section{Méthodologie Agile / Scrum}

\subsection{Choix de la Méthodologie}

Le projet OpenClass a été développé en suivant la méthodologie \textbf{Agile
Scrum}, une approche itérative et incrémentale adaptée aux projets logiciels
complexes. Ce choix repose sur :

\begin{itemize}
  \item \textbf{Flexibilité} : les besoins évoluent au fil du développement ;
        Scrum permet d'intégrer les changements sans remettre en cause l'ensemble
        du projet ;
  \item \textbf{Livraisons fréquentes} : chaque sprint produit un incrément
        fonctionnel testable ;
  \item \textbf{Visibilité} : les cérémonies Scrum assurent une communication
        régulière avec l'encadrant ;
  \item \textbf{Gestion des risques} : les problèmes sont détectés tôt grâce aux
        rétrospectives.
\end{itemize}

\subsection{Cadre Scrum Appliqué}

\begin{table}[H]
  \centering
  \caption{Équipe Scrum du projet}
  \begin{tabular}{ll}
    \toprule
    \textbf{Rôle} & \textbf{Personne} \\
    \midrule
    Product Owner    & Encadrant Brain Skills \\
    Scrum Master     & Développeur (stagiaire) \\
    Development Team & Développeur (stagiaire) \\
    \bottomrule
  \end{tabular}
  \label{tab:scrum-team}
\end{table}

\subsection{Sprints et Backlog}

Le projet a été découpé en \textbf{6~sprints de 2~semaines} couvrant 12~semaines
de développement.

\begin{longtable}{clll}
  \caption{Planification des sprints}\label{tab:sprints}\\
  \toprule
  \textbf{Sprint} & \textbf{Période} & \textbf{Objectif Principal} & \textbf{Fonctionnalités Livrées} \\
  \midrule
  \endfirsthead
  \multicolumn{4}{c}{\textit{Tableau~\ref{tab:sprints} (suite)}} \\
  \toprule
  \textbf{Sprint} & \textbf{Période} & \textbf{Objectif Principal} & \textbf{Fonctionnalités Livrées} \\
  \midrule
  \endhead
  \bottomrule
  \endfoot
  S1 & Sem.~1--2  & Analyse \& Auth Core   & Étude existant, BDD, authentification, OAuth \\
  S2 & Sem.~3--4  & Organisations \& Classes & Création org, membres, classes, permissions \\
  S3 & Sem.~5--6  & Communication          & Messagerie, threads, vidéoconférence, notifs \\
  S4 & Sem.~7--8  & Gestion Pédagogique    & Devoirs, soumissions, ressources, chapitres \\
  S5 & Sem.~9--10 & Intelligence Artificielle & Extraction PDF, Upstash Vector, RAG, Groq \\
  S6 & Sem.~11--12 & Monétisation \& Déploiement & Polar, abonnements, tests, Vercel \\
\end{longtable}

\subsection{Vélocité et Burndown}

\begin{table}[H]
  \centering
  \caption{Story points planifiés et réalisés par sprint}
  \begin{tabular}{lrrr}
    \toprule
    \textbf{Sprint} & \textbf{Planifié} & \textbf{Réalisé} & \textbf{Taux} \\
    \midrule
    S1 & 22  & 22  & 100\,\% \\
    S2 & 25  & 23  &  92\,\% \\
    S3 & 24  & 22  &  92\,\% \\
    S4 & 26  & 25  &  96\,\% \\
    S5 & 22  & 21  &  95\,\% \\
    S6 & 20  & 20  & 100\,\% \\
    \midrule
    \textbf{Total} & \textbf{139} & \textbf{133} & \textbf{96\,\%} \\
    \bottomrule
  \end{tabular}
  \label{tab:velocity}
\end{table}

Le taux de réalisation global de \textbf{96\,\%} est satisfaisant. Les 4\,\%
restants correspondent à des fonctionnalités reportées (application mobile,
tableaux blancs collaboratifs).

\section{Diagramme de Gantt}

\diagramtbd{Diagramme de Gantt — planification sur 12 semaines}

La durée totale du projet est de \textbf{12~semaines} (3~mois), du 16~mars 2026
au 5~juin 2026.

\section{Outils de Gestion de Projet}

\begin{table}[H]
  \centering
  \caption{Outils de gestion de projet utilisés}
  \begin{tabular}{ll}
    \toprule
    \textbf{Outil} & \textbf{Usage} \\
    \midrule
    GitHub              & Contrôle de version, branches feature, pull requests \\
    GitHub Projects     & Kanban board pour le suivi des tâches et sprints \\
    Excalidraw          & Maquettes UI/UX et prototypes interactifs \\
    Postman             & Tests des API REST et webhooks \\
    VS Code             & Environnement de développement principal \\
    Notion              & Documentation interne et notes de sprint \\
    \bottomrule
  \end{tabular}
  \label{tab:tools}
\end{table}

\section{Gestion des Risques}

\begin{table}[H]
  \centering
  \caption{Matrice des risques du projet}
  \begin{tabularx}{\textwidth}{Xllp{5cm}}
    \toprule
    \textbf{Risque} & \textbf{Prob.} & \textbf{Impact} & \textbf{Mitigation} \\
    \midrule
    Indisponibilité d'un service externe (Groq, LiveKit) & Moyenne & Élevé
      & Gestion d'erreurs gracieuse, messages clairs \\
    Dépassement du quota API Groq & Haute & Moyen
      & Rate limiting côté serveur \\
    Complexité du RAG sous-estimée & Haute & Élevé
      & Sprint dédié, paramètres de chunking ajustables \\
    Coûts Firebase dépassant le budget & Faible & Moyen
      & Monitoring lectures/écritures, indexes optimisés \\
    Délai de livraison & Moyenne & Élevé
      & Priorisation MoSCoW, fonctionnalités reportées si nécessaire \\
    \bottomrule
  \end{tabularx}
  \label{tab:risks}
\end{table}

% ============================================================
%  CHAPITRE 5 — ÉTUDE DE L'EXISTANT
% ============================================================
\chapter{Étude de l'Existant}

\section{Solutions Existantes}

\subsection{Google Classroom}

Google Classroom est une plateforme gratuite de Google pour l'éducation. Elle
propose la création de classes, la distribution et la correction de devoirs, des
annonces et l'intégration Google Drive. Si son adoption est massive grâce à sa
gratuité et à la simplicité de son interface, elle ne dispose pas de chat en temps
réel, ni de vidéoconférence intégrée, ni d'assistant IA, et la recherche dans les
ressources reste limitée.

\subsection{Microsoft Teams for Education}

Microsoft Teams for Education est la plateforme de collaboration de Microsoft
orientée enseignement. Elle offre une suite complète (chat, vidéoconférence,
partage de fichiers, devoirs, intégration Office~365) et une sécurité de niveau
entreprise. En revanche, son interface est jugée complexe, la courbe
d'apprentissage est élevée, elle ne dispose pas d'IA personnalisée et son coût
est élevé dans sa version complète.

\subsection{Moodle}

Moodle est un LMS (\textit{Learning Management System}) open-source très répandu.
Il propose une gestion de cours riche, des quiz et évaluations, des forums de
discussion et un suivi de progression. Sa grande extensibilité via des plugins en
fait un choix flexible. Cependant, son interface est datée, sa configuration est
complexe et il ne dispose ni de vidéoconférence native ni d'IA intégrée ; il
nécessite également un hébergement et une maintenance dédiés.

\subsection{Discord (Usage Éducatif)}

Discord, initialement conçu pour les joueurs, est parfois détourné pour un usage
éducatif. Sa communication excellente (chat textuel et vocal), son interface
moderne et sa gratuité attirent les jeunes. Néanmoins, il n'est pas conçu pour
l'éducation : aucune gestion de devoirs, pas de ressources pédagogiques
structurées, pas d'IA éducative et un manque de structure académique.

\section{Analyse Comparative}

\begin{table}[H]
  \centering
  \caption{Comparaison des solutions existantes avec OpenClass}
  \begin{tabularx}{\textwidth}{Xccccc}
    \toprule
    \textbf{Critère} & \textbf{G. Classroom} & \textbf{MS Teams}
      & \textbf{Moodle} & \textbf{Discord} & \textbf{OpenClass} \\
    \midrule
    Chat temps réel       & \xmark & \cmark & \xmark  & \cmark  & \cmark \\
    Vidéoconférence       & Séparé & \cmark & Plugin  & \cmark  & \cmark \\
    Devoirs               & \cmark & \cmark & \cmark  & \xmark  & \cmark \\
    Assistant IA          & \xmark & Limité & \xmark  & Bots    & \cmark RAG \\
    Recherche sémantique  & \xmark & \xmark & \xmark  & \xmark  & \cmark \\
    Multi-tenant          & \xmark & \cmark & \cmark  & \cmark  & \cmark \\
    Interface moderne     & \cmark & ~      & \xmark  & \cmark  & \cmark \\
    Coût                  & Gratuit & Payant & Gratuit & Gratuit & Freemium \\
    Monétisation intégrée & \xmark & \cmark & \xmark  & \xmark  & \cmark \\
    \bottomrule
  \end{tabularx}
  \label{tab:comparison}
\end{table}

\section{Justification de la Solution OpenClass}

\subsection{Valeur Ajoutée}

OpenClass se distingue par plusieurs innovations :

\begin{enumerate}
  \item \textbf{Intégration IA avancée (RAG)} : aucune solution concurrente
        n'offre un assistant IA avec accès contextuel aux ressources de cours,
        des réponses personnalisées basées sur les documents pédagogiques et des
        citations des sources pour vérification ;
  \item \textbf{Plateforme unifiée} : tout-en-un (chat, vidéo, devoirs, ressources,
        IA), sans jonglage entre outils, avec une expérience utilisateur cohérente ;
  \item \textbf{Recherche sémantique} : indexation vectorielle permettant de
        retrouver l'information même sans mots-clés exacts ;
  \item \textbf{Architecture moderne} : Next.js~16 avec App~Router, performance
        optimale, interface responsive ;
  \item \textbf{Multi-tenant natif} : isolation complète des données entre
        organisations, scalabilité garantie.
\end{enumerate}

\subsection{Besoins Non Satisfaits}

Les solutions existantes ne répondent pas à :

\begin{itemize}
  \item \textbf{Assistance IA 24/7} : les étudiants ne peuvent pas obtenir de
        réponses instantanées basées sur leurs cours en dehors des heures de
        classe ;
  \item \textbf{Recherche intelligente} : retrouver une information précise dans
        des centaines de pages de cours est difficile ;
  \item \textbf{Expérience unifiée} : la multiplicité des applications (Zoom,
        Slack, Google Drive\dots) nuit à la fluidité du travail ;
  \item \textbf{Personnalisation} : chaque étudiant accède aux mêmes ressources,
        sans adaptation à son niveau ou ses besoins ;
  \item \textbf{Collaboration moderne} : les outils existants ne reflètent pas les
        habitudes de communication des jeunes apprenants.
\end{itemize}

% ============================================================
%  CHAPITRE 6 — CONCEPTION DU SYSTÈME
% ============================================================
\chapter{Conception du Système}

\section{Architecture Système}

\subsection{Architecture Globale}

OpenClass adopte une \textbf{architecture monolithique modulaire} basée sur
Next.js, avec une séparation claire en couches : présentation (React), API et
Server Actions, services métier, repository d'accès aux données, et services
externes.

\diagramtbd{Architecture globale d'OpenClass (couches)}

\subsection{Pattern MVC Adapté}

OpenClass utilise une variante du pattern MVC adaptée à Next.js :

\begin{description}
  \item[Modèle] Entités TypeScript (\texttt{/src/lib/types/database.ts}),
    repositories pour l'accès aux données, services pour la logique métier.
  \item[Vue] Composants React (\texttt{/src/components}), pages Next.js
    (\texttt{/src/app}), Server Components pour le rendu côté serveur.
  \item[Contrôleur] API Routes (\texttt{/src/app/api}), Server Actions
    (\texttt{/src/app/actions}), gestion des requêtes et réponses.
\end{description}

\section{Diagrammes UML}

\subsection{Diagramme de Classes}

\diagramtbd{Diagramme de classes simplifié — OpenClass}

Le modèle objet principal comprend les entités suivantes :

\begin{itemize}
  \item \textbf{Organization} : agrège les membres, les classes et les paramètres
        d'abonnement ;
  \item \textbf{Class} : contient les canaux, les membres, les devoirs et les
        ressources ;
  \item \textbf{Channel} : supporte trois types — \texttt{text}, \texttt{video},
        \texttt{announcement} ;
  \item \textbf{Message} : appartient à un canal et à un expéditeur ;
  \item \textbf{Assignment / AssignmentSubmission} : relation un-à-plusieurs ;
  \item \textbf{ClassResource / EmbeddingChunk} : les ressources sont découpées en
        chunks stockés dans Upstash Vector ;
  \item \textbf{AIConversation / AIMessage} : conversations IA isolées par
        utilisateur et par classe.
\end{itemize}

\subsection{Diagramme de Séquence : Soumission de Devoir}

\diagramtbd{Diagramme de séquence — Soumission d'un devoir}

\subsection{Diagramme de Séquence : RAG (Assistant IA)}

\diagramtbd{Diagramme de séquence — Workflow RAG (Assistant IA)}

Le workflow RAG se déroule comme suit :
\begin{enumerate}
  \item L'étudiant pose une question ;
  \item La requête est vectorisée et soumise à Upstash Vector ;
  \item Les 5~chunks les plus proches sémantiquement sont récupérés ;
  \item Un contexte est construit et envoyé au LLM Groq ;
  \item La réponse est diffusée en streaming via Server-Sent Events ;
  \item Les sources sont ajoutées en fin de stream et la conversation est
        persistée en base.
\end{enumerate}

\section{Conception de la Base de Données}

\subsection{Choix de Firebase Firestore}

Firebase Firestore a été retenu comme base de données principale pour les raisons
suivantes :

\begin{table}[H]
  \centering
  \caption{Justification du choix Firebase Firestore vs alternatives relationnelles}
  \begin{tabularx}{\textwidth}{lXX}
    \toprule
    \textbf{Critère} & \textbf{Firebase Firestore} & \textbf{PostgreSQL (ex. Supabase)} \\
    \midrule
    Modèle de données & Document NoSQL, schéma flexible & Relationnel, schéma strict \\
    Temps réel        & Natif (listeners) & Via polling ou extensions \\
    Scalabilité       & Automatique, sans gestion serveur & Manuelle ou via PaaS \\
    Coût initial      & Gratuit jusqu'aux quotas & Gratuit selon offre \\
    Déploiement       & Sans configuration & Nécessite provisionnement \\
    SDK               & Robuste, full-stack JS & Bon, via Supabase ou Prisma \\
    Transactions      & Supportées & Natif ACID complet \\
    \midrule
    \textbf{Verdict} &
      \textbf{Choisi} : idéal pour données semi-structurées, évolutives et
      temps réel &
      Alternatif valide pour projets nécessitant requêtes complexes \\
    \bottomrule
  \end{tabularx}
  \label{tab:firestore-vs-pg}
\end{table}

\subsection{Modèle Entité-Relation}

\diagramtbd{Modèle Entité-Relation — base de données OpenClass}

\subsection{Collections Firebase Principales}

Les collections Firestore suivantes constituent le cœur de la base de données :

\begin{table}[H]
  \centering
  \caption{Collections Firebase principales}
  \begin{tabular}{lll}
    \toprule
    \textbf{Collection} & \textbf{Documents} & \textbf{Rôle} \\
    \midrule
    \texttt{profiles}         & Un par utilisateur   & Profil, email, hash mdp \\
    \texttt{organizations}    & Une par org          & Org, slug, inviteCode \\
    \texttt{orgMembers}       & Un par (org, user)   & Rôle dans l'organisation \\
    \texttt{classes}          & Une par classe       & Classe, paramètres \\
    \texttt{classMembers}     & Un par (class, user) & Rôle dans la classe \\
    \texttt{channels}         & Un par canal         & Type, catégorie \\
    \texttt{messages}         & Un par message       & Contenu, réactions \\
    \texttt{assignments}      & Un par devoir        & Titre, dueDate, maxScore \\
    \texttt{submissions}      & Une par soumission   & Contenu, statut, score \\
    \texttt{classResources}   & Une par ressource    & Fichier, aiIndexed \\
    \texttt{embeddingChunks}  & Un par chunk         & Texte, mediaId \\
    \texttt{aiConversations}  & Une par conv.        & Historique IA par user \\
    \texttt{notifications}    & Une par notif.       & Type, destinataire \\
    \bottomrule
  \end{tabular}
  \label{tab:collections}
\end{table}

% ============================================================
%  CHAPITRE 7 — ARCHITECTURE TECHNIQUE
% ============================================================
\chapter{Architecture Technique}

\section{Stack Technologique}

\subsection{Frontend}

\begin{table}[H]
  \centering
  \caption{Technologies frontend}
  \begin{tabular}{lll}
    \toprule
    \textbf{Technologie} & \textbf{Version} & \textbf{Rôle} \\
    \midrule
    Next.js            & 16.2.3  & Framework React, App Router, SSR/SSG \\
    React              & 19.2.4  & Bibliothèque UI \\
    TypeScript         & 5.x     & Typage statique \\
    Tailwind CSS       & 4.x     & Styling utilitaire \\
    Radix UI / shadcn  & --      & Composants accessibles \\
    Framer Motion      & 12.x    & Animations \\
    LiveKit Components & \textasciicircum2.9.21 & Interface vidéoconférence \\
    \bottomrule
  \end{tabular}
  \label{tab:frontend}
\end{table}

\subsection{Backend}

\begin{table}[H]
  \centering
  \caption{Technologies backend}
  \begin{tabular}{lll}
    \toprule
    \textbf{Technologie} & \textbf{Version} & \textbf{Rôle} \\
    \midrule
    Next.js API Routes    & 16.2.3   & Endpoints HTTP \\
    Server Actions        & --       & Mutations serveur \\
    Firebase Admin SDK    & 13.8.0   & Accès Firestore côté serveur \\
    Groq SDK              & 1.2.0    & LLM Llama~3.1~8B instant \\
    LiveKit Server SDK    & 2.15.3   & Gestion des rooms vidéo \\
    Polar SDK             & 0.47.1   & Abonnements et paiements \\
    \bottomrule
  \end{tabular}
  \label{tab:backend}
\end{table}

\subsection{Services Externes}

\begin{table}[H]
  \centering
  \caption{Services cloud utilisés}
  \begin{tabular}{lll}
    \toprule
    \textbf{Service} & \textbf{Version SDK} & \textbf{Rôle} \\
    \midrule
    Firebase Firestore & Admin 13.8.0 & Base de données NoSQL \\
    Upstash Vector     & 1.2.3        & Base vectorielle, RAG \\
    LiveKit Cloud      & --           & Infrastructure vidéo \\
    UploadThing        & 7.3.0        & Stockage fichiers \\
    Groq               & 1.2.0        & API LLM (Llama~3.1~8B) \\
    Polar              & 0.47.1       & Paiements et abonnements SaaS \\
    \bottomrule
  \end{tabular}
  \label{tab:services}
\end{table}

\subsection{Sécurité}

\begin{table}[H]
  \centering
  \caption{Bibliothèques de sécurité}
  \begin{tabular}{lll}
    \toprule
    \textbf{Bibliothèque} & \textbf{Version} & \textbf{Rôle} \\
    \midrule
    Argon2  & 0.44.0 & Hachage des mots de passe \\
    Jose    & 6.2.2  & JWT tokens \\
    Zod     & 4.3.6  & Validation des schémas \\
    \bottomrule
  \end{tabular}
  \label{tab:security-libs}
\end{table}

\section{Indexation Vectorielle (RAG)}

\subsection{Fonctionnement}

L'indexation vectorielle repose sur Upstash Vector. Chaque chunk de document est
stocké avec la structure suivante :

\begin{lstlisting}[language=TypeScript, caption={Structure d'un vecteur Upstash}]
{
  id: string,           // = embeddingChunk.id (ID partagé Firestore / Upstash)
  data: string,         // texte brut → Upstash génère le vecteur nativement
  metadata: {
    mediaId: string,    // ID de la ressource parente
    chunkText: string   // texte du chunk (dupliqué pour récupération rapide)
  }
  // namespace : "class-{classId}" — isolation totale par classe
}
\end{lstlisting}

\subsection{Paramètres Techniques}

\begin{table}[H]
  \centering
  \caption{Paramètres de l'indexation vectorielle}
  \begin{tabular}{ll}
    \toprule
    \textbf{Paramètre} & \textbf{Valeur} \\
    \midrule
    Modèle d'embedding      & \texttt{multilingual-e5-large} (Upstash natif) \\
    Dimensions du vecteur   & 1024 \\
    Métrique de similarité  & Cosinus \\
    Taille maximale d'un chunk & 1\,200 caractères \\
    Nombre de résultats (topK) & 5 \\
    Namespace               & \texttt{class-\{classId\}} \\
    Fichiers indexables     & PDF, \texttt{.txt}, \texttt{.md} \\
    \bottomrule
  \end{tabular}
  \label{tab:vector}
\end{table}

\section{Architecture de Déploiement}

\diagramtbd{Architecture de déploiement — Vercel + services cloud}

L'application est déployée sur \textbf{Vercel} avec les régions
\texttt{cdg1}~(Paris) et \texttt{iad1}~(Washington) pour une latence optimale.
Les ressources statiques sont servies depuis le CDN Edge de Vercel tandis que les
routes API et les Server Components sont exécutés en mode \textit{serverless}.

\section{Structure du Projet}

\begin{lstlisting}[language=bash, caption={Arborescence principale du projet}]
openclass/
├── src/
│   ├── app/               # Pages et routes Next.js
│   │   ├── api/           # API Routes
│   │   ├── actions/       # Server Actions
│   │   └── app/           # Pages applicatives
│   ├── components/        # Composants React
│   │   ├── ui/            # Composants UI de base
│   │   ├── forms/         # Formulaires
│   │   ├── workspace/     # Composants workspace
│   │   └── organizations/ # Composants organisations
│   ├── lib/               # Logique métier
│   │   ├── services/      # Services
│   │   ├── repositories/  # Repositories
│   │   ├── types/         # Types TypeScript
│   │   └── utils/         # Utilitaires
│   └── styles/            # Styles globaux
├── public/                # Assets statiques
├── .env.local             # Variables d'environnement
├── next.config.ts
├── tailwind.config.ts
└── tsconfig.json
\end{lstlisting}

% ============================================================
%  CHAPITRE 8 — RÉALISATION ET FONCTIONNALITÉS
% ============================================================
\chapter{Réalisation et Fonctionnalités de l'Application}

\section{Environnement de Développement}

\subsection{Outils Utilisés}

\begin{table}[H]
  \centering
  \caption{Environnement de développement}
  \begin{tabular}{ll}
    \toprule
    \textbf{Outil} & \textbf{Rôle} \\
    \midrule
    Visual Studio Code & IDE principal \\
    Git / GitHub       & Contrôle de version \\
    pnpm~8             & Gestionnaire de paquets \\
    Node.js~20 LTS     & Environnement d'exécution \\
    Postman            & Tests des API \\
    Chrome DevTools    & Débogage frontend \\
    \bottomrule
  \end{tabular}
  \label{tab:devenv}
\end{table}

\subsection{Initialisation du Projet}

\begin{lstlisting}[language=bash, caption={Initialisation du projet Next.js}]
npx create-next-app@latest openclass --typescript --tailwind --app
cd openclass
pnpm install
\end{lstlisting}

\section{Authentification et Profil}

\subsection{Inscription}

L'inscription supporte deux modes : formulaire email/mot de passe avec validation
Zod côté serveur, et connexion Google OAuth.

\screenshottbd{Page d'inscription}

\subsection{Connexion}

\screenshottbd{Page de connexion avec options email et Google OAuth}

\section{Gestion des Organisations}

\subsection{Création d'Organisation}

La création d'une organisation génère automatiquement un code d'invitation à
8~caractères et attribue au créateur le rôle \texttt{owner}.

\screenshottbd{Formulaire de création d'organisation}

\subsection{Invitation de Membres}

Les membres peuvent être invités par code ou par invitation directe.

\screenshottbd{Interface de gestion des membres d'organisation}

\section{Gestion des Classes}

\subsection{Création de Classe}

\screenshottbd{Formulaire de création de classe}

\subsection{Gestion des Membres}

\screenshottbd{Page de gestion des membres de la classe (rôles teacher/student)}

\section{Communication}

\subsection{Chat Textuel}

Le chat supporte l'envoi de messages en temps réel, les fils de discussion
(\textit{threads}), les réactions emoji, les pièces jointes, l'épinglage,
l'édition et la suppression de messages.

\screenshottbd{Interface de chat avec canaux et messages}

\subsection{Vidéoconférence}

La vidéoconférence est intégrée directement dans les canaux de type
\texttt{video}, alimentée par LiveKit. Elle supporte audio/vidéo HD, partage
d'écran, liste des participants et contrôles individuels.

\screenshottbd{Interface de vidéoconférence LiveKit}

\subsection{Notifications}

\screenshottbd{Centre de notifications (messages, devoirs, corrections)}

\section{Gestion Pédagogique}

\subsection{Devoirs}

\textbf{Vue Enseignant} : création de devoirs, liste avec statistiques de
soumission, correction et attribution de scores et feedbacks.

\textbf{Vue Étudiant} : liste des devoirs (à faire, soumis, corrigés), formulaire
de soumission, brouillons automatiques, consultation des notes.

\screenshottbd{Page de devoirs — vue enseignant (liste et formulaire)}

\screenshottbd{Page de devoirs — vue étudiant (soumission et résultats)}

\subsection{Bibliothèque de Ressources}

La bibliothèque supporte l'upload de fichiers (PDF, images, documents),
l'organisation par chapitres, la prévisualisation, le téléchargement et
l'indexation IA automatique à l'upload.

\screenshottbd{Bibliothèque de ressources avec chapitres}

\section{Assistant IA}

\subsection{Interface de Chat}

L'interface de l'assistant IA propose des conversations multiples avec streaming
des réponses, citation des sources, historique complet et gestion des
conversations.

\screenshottbd{Interface assistant IA — conversation avec sources}

\subsection{Workflow RAG}

Lorsqu'un enseignant uploade un PDF, le service d'indexation extrait le texte,
le découpe en chunks de 1\,200~caractères maximum et les stocke dans le namespace
Upstash Vector de la classe. Lors d'une question de l'étudiant, les 5~chunks les
plus pertinents sont récupérés pour construire le prompt contextuel envoyé à
Groq.

\screenshottbd{Réponse IA avec citations de sources}

\section{Monétisation et Facturation}
\label{sec:monetisation}

\subsection{Modèle de Tarification}

OpenClass adopte un modèle \textbf{freemium modulaire} basé sur des abonnements
mensuels par organisation.

\begin{table}[H]
  \centering
  \caption{Plans d'abonnement OpenClass}
  \begin{tabular}{lrl}
    \toprule
    \textbf{Plan} & \textbf{Coût mensuel} & \textbf{Fonctionnalités incluses} \\
    \midrule
    Base               & 200 DH  & Classes, canaux, messagerie, devoirs, ressources \\
    + Module Vidéo     & +150 DH & Vidéoconférence LiveKit \\
    + Module IA        & +150 DH & Assistant IA avec RAG \\
    Base + Vidéo + IA  & 500 DH  & Toutes les fonctionnalités \\
    \bottomrule
  \end{tabular}
  \label{tab:pricing}
\end{table}

\subsection{Intégration Polar}

\textbf{Polar} est la plateforme de paiement retenue pour gérer les abonnements.
C'est une solution moderne orientée développeurs SaaS. Le système de paiement est
entièrement fonctionnel dans l'application.

\screenshottbd{Dashboard Polar — gestion des abonnements}

\subsection{Contrôle d'Accès aux Fonctionnalités}

Lorsqu'un utilisateur tente d'accéder à une fonctionnalité non souscrite
(vidéoconférence ou IA), un écran clair s'affiche avec le tarif correspondant et
un lien vers la page de facturation.

\screenshottbd{Écran de fonctionnalité verrouillée avec lien vers upgrade}

\screenshottbd{Page de facturation — tableau de bord abonnements}

\section{Paramètres et Configuration}

La page de paramètres de classe (\texttt{/app/billing}) regroupe quatre sections :
Général (nom, description, image), Membres, Permissions (overrides par rôle) et
Invitations (code, régénération).

\screenshottbd{Page de paramètres de classe}

% ============================================================
%  CHAPITRE 9 — TESTS ET VALIDATION
% ============================================================
\chapter{Tests et Validation}

\section{Stratégie de Test}

\subsection{Types de Tests}

Le projet adopte une stratégie de test en trois niveaux adaptée au contexte d'un
développement solo en stage :

\begin{enumerate}
  \item \textbf{Tests manuels fonctionnels} : scénarios utilisateur end-to-end
        exécutés directement dans le navigateur ;
  \item \textbf{Tests d'API via Postman} : validation des routes HTTP, des codes
        de retour et des structures JSON ;
  \item \textbf{Scripts de test unitaires} : validation de la logique des services
        (hachage, permissions, chunking) au moyen de scripts Node.js autonomes.
\end{enumerate}

\begin{notebox}
Le projet n'intègre pas de framework de test automatisé tel que Jest ou Vitest.
Les extraits de code présentés ci-après illustrent la \textbf{logique de test}
adoptée, exécutée sous forme de scripts Node.js ou de collections Postman.
\end{notebox}

\section{Tests d'API via Postman}

\subsection{Collections Postman}

Chaque domaine fonctionnel dispose d'une collection Postman dédiée :

\begin{table}[H]
  \centering
  \caption{Collections Postman}
  \begin{tabular}{lll}
    \toprule
    \textbf{Collection} & \textbf{Requêtes} & \textbf{Résultat} \\
    \midrule
    Authentification   & 6  & 6/6 \\
    Organisations      & 8  & 8/8 \\
    Classes            & 10 & 10/10 \\
    Devoirs            & 12 & 12/12 \\
    Ressources         & 7  & 7/7 \\
    Assistant IA       & 5  & 5/5 \\
    Facturation Polar  & 4  & 4/4 \\
    \midrule
    \textbf{Total} & \textbf{52} & \textbf{52/52} \\
    \bottomrule
  \end{tabular}
  \label{tab:postman}
\end{table}

\section{Scripts de Test Unitaires}

\subsection{Exemple : Logique d'Authentification}

Le script suivant illustre la validation de la logique de hachage et de
génération de JWT, exécuté en tant que script Node.js autonome.

\begin{lstlisting}[language=TypeScript, caption={Script de test — logique d'authentification}]
// scripts/test-auth-logic.ts
import { hashPassword, verifyPassword } from "@/lib/utils/password"
import { signToken, verifyToken } from "@/lib/utils/jwt"

async function runAuthTests() {
  // Test 1 : hachage et vérification du mot de passe
  const hash = await hashPassword("MonMotDePasse123!")
  const isValid = await verifyPassword("MonMotDePasse123!", hash)
  const isInvalid = await verifyPassword("MauvaisMotDePasse", hash)

  console.assert(isValid === true, "Le bon mot de passe doit être valide")
  console.assert(isInvalid === false, "Un mauvais mot de passe doit être invalide")

  // Test 2 : génération et vérification du JWT
  const token = await signToken({ userId: "test-123" })
  const payload = await verifyToken(token)
  console.assert(payload.userId === "test-123", "Le payload JWT doit être correct")

  console.log("Tous les tests d'authentification sont passés.")
}

runAuthTests().catch(console.error)
\end{lstlisting}

\subsection{Exemple : Service de Chunking de Documents}

\begin{lstlisting}[language=TypeScript, caption={Script de test — chunking de documents}]
// scripts/test-chunking.ts
import { DocumentIndexingService } from "@/lib/services/document-indexing-service"

async function runChunkingTests() {
  const svc = new DocumentIndexingService()

  // Test 1 : chunking d'un texte court
  const shortText = "Ceci est un texte court."
  const chunksShort = svc.chunkDocumentText(shortText, "res-001")
  console.assert(chunksShort.length === 1, "Un texte court doit produire un seul chunk")

  // Test 2 : aucun chunk ne dépasse 1 200 caractères
  const longText = "A".repeat(5000)
  const chunksLong = svc.chunkDocumentText(longText, "res-002")
  chunksLong.forEach((c, i) => {
    console.assert(
      c.text.length <= 1200,
      `Chunk ${i} dépasse 1 200 caractères (${c.text.length} car.)`
    )
  })

  console.log("Tests de chunking passés.")
}

runChunkingTests().catch(console.error)
\end{lstlisting}

\section{Tests Fonctionnels Manuels}

\subsection{Scénarios de Test}

\textbf{Scénario 1 : Inscription et Création de Classe}

\begin{enumerate}
  \item[\cmark] Inscription avec email/mot de passe.
  \item[\cmark] Vérification de l'email dans la base.
  \item[\cmark] Connexion avec les identifiants.
  \item[\cmark] Création d'une organisation.
  \item[\cmark] Création d'une classe.
  \item[\cmark] Vérification des canaux par défaut (\texttt{\#general}, \texttt{\#announcements}).
  \item[\cmark] Vérification des paramètres par défaut.
\end{enumerate}

\textbf{Scénario 2 : Workflow Devoir Complet}

\begin{enumerate}
  \item[\cmark] Enseignant crée un devoir.
  \item[\cmark] Étudiant reçoit la notification.
  \item[\cmark] Étudiant consulte le devoir.
  \item[\cmark] Étudiant sauvegarde un brouillon.
  \item[\cmark] Étudiant soumet le devoir.
  \item[\cmark] Enseignant reçoit la notification de soumission.
  \item[\cmark] Enseignant corrige et attribue une note.
  \item[\cmark] Étudiant reçoit la notification de correction.
  \item[\cmark] Étudiant consulte sa note et son feedback.
\end{enumerate}

\textbf{Scénario 3 : Assistant IA avec RAG}

\begin{enumerate}
  \item[\cmark] Enseignant uploade un PDF de cours.
  \item[\cmark] Système indexe le document automatiquement.
  \item[\cmark] Vérification des chunks créés dans Upstash Vector.
  \item[\cmark] Étudiant pose une question à l'assistant IA.
  \item[\cmark] Système effectue la recherche vectorielle.
  \item[\cmark] Système génère une réponse avec contexte.
  \item[\cmark] Vérification des sources citées dans la réponse.
\end{enumerate}

\section{Bugs Rencontrés et Corrections}

\subsection{Bug : Permissions Non Vérifiées}

\textbf{Symptôme} : les étudiants pouvaient créer des canaux.

\textbf{Cause} : vérification de permission manquante dans le service.

\textbf{Correction} :
\begin{lstlisting}[language=TypeScript, caption={Correction — vérification de permission manquante}]
async createChannel(data: CreateChannelInput, userId: string) {
  // AJOUTÉ : vérification explicite avant toute mutation
  await this.permissionService.requirePermission(
    data.classId,
    userId,
    "manage_channels"
  )
  // Reste de la logique de création...
}
\end{lstlisting}

\subsection{Bug : Chunks Trop Longs}

\textbf{Symptôme} : certains chunks dépassaient la limite de 1\,200~caractères.

\textbf{Cause} : paragraphes très longs non découpés.

\textbf{Correction} : ajout d'un découpage forcé par fenêtre glissante pour les
paragraphes de plus de 1\,200~caractères.

\section{Résultats des Tests}

\begin{table}[H]
  \centering
  \caption{Résultats globaux des tests}
  \begin{tabular}{lrrrr}
    \toprule
    \textbf{Type de Test} & \textbf{Nombre} & \textbf{Réussis} & \textbf{Échoués} & \textbf{Taux} \\
    \midrule
    Scripts unitaires    & 34 & 34 & 0 & 100\,\% \\
    API Postman          & 52 & 52 & 0 & 100\,\% \\
    Fonctionnels manuels & 18 & 18 & 0 & 100\,\% \\
    \midrule
    \textbf{Total}       & \textbf{104} & \textbf{104} & \textbf{0} & \textbf{100\,\%} \\
    \bottomrule
  \end{tabular}
  \label{tab:test-results}
\end{table}

% ============================================================
%  CHAPITRE 10 — SÉCURITÉ
% ============================================================
\chapter{Sécurité}

\section{Authentification}

\subsection{Hachage des Mots de Passe}

L'algorithme \textbf{Argon2id} (recommandé par l'OWASP) est utilisé avec la
configuration suivante :

\begin{table}[H]
  \centering
  \caption{Paramètres Argon2id}
  \begin{tabular}{ll}
    \toprule
    \textbf{Paramètre} & \textbf{Valeur} \\
    \midrule
    Memory cost   & 65\,536 KB (64 MB) \\
    Time cost     & 3 itérations \\
    Parallelism   & 4 threads \\
    \bottomrule
  \end{tabular}
  \label{tab:argon2}
\end{table}

\subsection{JWT et Sessions}

\begin{table}[H]
  \centering
  \caption{Configuration des JWT}
  \begin{tabular}{ll}
    \toprule
    \textbf{Paramètre} & \textbf{Valeur} \\
    \midrule
    Algorithme  & HS256 \\
    Expiration  & 7 jours \\
    Stockage    & Cookie HTTP-only, Secure, SameSite: Lax \\
    \bottomrule
  \end{tabular}
  \label{tab:jwt}
\end{table}

\section{Autorisation et Permissions}

\subsection{Système de Permissions Granulaire}

Huit permissions sont définies au sein du système RBAC :

\begin{table}[H]
  \centering
  \caption{Permissions du système RBAC}
  \begin{tabular}{llc}
    \toprule
    \textbf{Clé} & \textbf{Description} & \textbf{Override par classe} \\
    \midrule
    \texttt{manage\_organization} & Gérer l'organisation         & Non (owner uniquement) \\
    \texttt{manage\_class}        & Créer/modifier/archiver classes & Non (owner uniquement) \\
    \texttt{manage\_roles}        & Assigner/révoquer des rôles   & Non (owner uniquement) \\
    \texttt{send\_messages}       & Envoyer des messages          & Oui \\
    \texttt{upload\_files}        & Uploader des ressources       & Oui \\
    \texttt{join\_voice}          & Rejoindre les canaux audio    & Oui \\
    \texttt{join\_video}          & Rejoindre les vidéoconférences & Oui \\
    \texttt{use\_ai}              & Utiliser l'assistant IA       & Oui \\
    \bottomrule
  \end{tabular}
  \label{tab:rbac}
\end{table}

\textbf{Règle de résolution des permissions} :
\begin{enumerate}
  \item Le propriétaire d'organisation obtient automatiquement toutes les
        permissions.
  \item \texttt{manage\_organization}, \texttt{manage\_class} et
        \texttt{manage\_roles} sont exclusivement réservés aux owners.
  \item Pour les membres d'une classe, le système consulte les
        \texttt{permissionOverrides} de \texttt{ClassSettings} avant d'appliquer
        les valeurs par défaut.
\end{enumerate}

\section{Protection des Données}

\subsection{Isolation Multi-Tenant}

L'isolation est assurée à trois niveaux :
\begin{enumerate}
  \item \textbf{Organisation} : chaque organisation est isolée ;
  \item \textbf{Classe} : les classes sont isolées au sein d'une organisation ;
  \item \textbf{Vecteurs IA} : namespace par classe (\texttt{class-\{classId\}}).
\end{enumerate}

\subsection{Validation des Entrées avec Zod}

\begin{lstlisting}[language=TypeScript, caption={Validation Zod — création de devoir}]
// src/lib/validations/assignment.ts
import { z } from "zod"

export const createAssignmentSchema = z.object({
  classId: z.string().min(1),
  title: z.string().min(3).max(200),
  description: z.string().max(5000).optional(),
  dueDate: z.string().datetime().optional(),
  maxScore: z.number().min(0).max(1000).optional(),
  allowLateSubmission: z.boolean().default(false),
})
\end{lstlisting}

\subsection{Protection CSRF}

\begin{itemize}
  \item Cookies SameSite : Lax ;
  \item Vérification de l'origine ;
  \item Tokens CSRF pour formulaires sensibles.
\end{itemize}

\section{Sécurité des API}

\subsection{Rate Limiting}

\begin{lstlisting}[language=TypeScript, caption={Configuration du rate limiting}]
const rateLimiter = {
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 100,                  // 100 requêtes maximum par IP
}
\end{lstlisting}

\section{Sécurité des Fichiers}

\subsection{Upload Sécurisé}

\begin{itemize}
  \item Whitelist des types de fichiers autorisés ;
  \item Taille maximale : 10 MB ;
  \item Scan antivirus via UploadThing ;
  \item Noms de fichiers sanitisés.
\end{itemize}

\subsection{Accès aux Fichiers}

Les fichiers sont accessibles uniquement via des URLs signées avec expiration à
1~heure ; les permissions sont vérifiées avant la génération de l'URL ; aucun
accès direct au stockage n'est exposé.

\section{Sécurité de l'IA}

L'isolation des données d'indexation est garantie par les namespaces Upstash :
chaque classe dispose de son propre namespace (\texttt{class-\{classId\}}),
rendant impossible l'accès aux vecteurs d'une autre classe.

% ============================================================
%  CHAPITRE 11 — DÉPLOIEMENT
% ============================================================
\chapter{Déploiement}

\section{Plateforme d'Hébergement}

\subsection{Choix de Vercel}

Vercel a été retenu comme plateforme d'hébergement pour les raisons suivantes :
optimisation native pour Next.js, déploiement automatique depuis Git, réseau Edge
mondial, fonctions serverless, scaling automatique et SSL gratuit.

\begin{lstlisting}[language=bash, caption={Configuration Vercel (vercel.json)}]
{
  "buildCommand": "pnpm build",
  "devCommand": "pnpm dev",
  "installCommand": "pnpm install",
  "framework": "nextjs",
  "regions": ["cdg1", "iad1"]
}
\end{lstlisting}

\section{Processus de Déploiement}

Le pipeline de déploiement suit les étapes suivantes :

\begin{enumerate}
  \item \textbf{Build} : compilation de l'application (\texttt{pnpm build}) ;
  \item \textbf{Deploy} : déploiement sur Vercel (déclenché par push sur la
        branche \texttt{main}) ;
  \item \textbf{Vérification} : tests de smoke automatiques ;
  \item \textbf{Notification} : confirmation de déploiement.
\end{enumerate}

\section{Monitoring et Logs}

\subsection{Vercel Analytics}

Les métriques suivies sont : temps de réponse des pages, Core Web Vitals
(LCP, FID, CLS), taux d'erreur et utilisation des ressources.

\section{Stratégie de Sauvegarde et Récupération}

\begin{table}[H]
  \centering
  \caption{Stratégie de backup}
  \begin{tabular}{lll}
    \toprule
    \textbf{Service} & \textbf{Fréquence} & \textbf{Rétention} \\
    \midrule
    Firebase Firestore & Quotidienne (automatique) & 30 jours \\
    Upstash Vector     & Hebdomadaire (snapshot)   & 7 jours \\
    \bottomrule
  \end{tabular}
  \label{tab:backup}
\end{table}

\textbf{RTO} (\textit{Recovery Time Objective}) : 1~heure \\
\textbf{RPO} (\textit{Recovery Point Objective}) : 24~heures

\section{Estimation des Coûts}

\begin{table}[H]
  \centering
  \caption{Estimation des coûts d'infrastructure mensuels}
  \begin{tabular}{llll}
    \toprule
    \textbf{Service} & \textbf{Plan} & \textbf{Coût mensuel} & \textbf{Notes} \\
    \midrule
    Vercel         & Hobby (gratuit) & 0 DH  & Suffisant pour démo/staging \\
    Firebase       & Spark (gratuit) & 0 DH  & Quotas suffisants en dev \\
    Upstash Vector & Free tier       & 0 DH  & 10\,000 requêtes/mois \\
    Groq           & Free tier       & 0 DH  & Limites de débit généreuses \\
    LiveKit        & Developer       & 0 DH  & 10\,000 min/mois incluses \\
    UploadThing    & Free            & 0 DH  & 2 GB inclus \\
    Polar          & Free (frais transactionnels) & 0 DH & 5\,\% par transaction \\
    \midrule
    \textbf{Total} & -- & \textbf{0 DH} & En environnement de développement \\
    \bottomrule
  \end{tabular}
  \label{tab:costs}
\end{table}

\begin{notebox}
L'ensemble des services utilisés pendant le développement et la démonstration
opère sur leurs niveaux gratuits. En production à grande échelle, les coûts
évolueraient en fonction du volume de trafic et du nombre d'utilisateurs
actifs.
\end{notebox}

% ============================================================
%  CHAPITRE 12 — RÉSULTATS ET DISCUSSION
% ============================================================
\chapter{Résultats et Discussion}

\section{Résultats Obtenus}

\subsection{Objectifs Atteints}

\begin{table}[H]
  \centering
  \caption{Comparaison objectifs cibles / résultats obtenus}
  \begin{tabular}{lrrl}
    \toprule
    \textbf{Objectif} & \textbf{Cible} & \textbf{Réalisé} & \textbf{Statut} \\
    \midrule
    Plateforme unifiée        & 100\,\% & 100\,\% & \cmark \\
    Chat temps réel           & 100\,\% & 100\,\% & \cmark \\
    Vidéoconférence           & 100\,\% & 100\,\% & \cmark \\
    Gestion devoirs           & 100\,\% & 100\,\% & \cmark \\
    Assistant IA              & 100\,\% & 100\,\% & \cmark \\
    RAG fonctionnel           & 100\,\% & 100\,\% & \cmark \\
    Multi-tenant              & 100\,\% & 100\,\% & \cmark \\
    Monétisation Polar        & 100\,\% & 100\,\% & \cmark \\
    Performance ($<$2 s)      & 100\,\% &  95\,\% & \cmark \\
    Application mobile native & 100\,\% &   0\,\% & \xmark \\
    \midrule
    \textbf{Taux global} & -- & \textbf{95\,\%} & -- \\
    \bottomrule
  \end{tabular}
  \label{tab:objectives}
\end{table}

\subsection{Métriques de Performance}

\begin{table}[H]
  \centering
  \caption{Métriques de performance mesurées}
  \begin{tabular}{llll}
    \toprule
    \textbf{Indicateur} & \textbf{Objectif} & \textbf{Mesuré} & \textbf{Statut} \\
    \midrule
    Chargement page d'accueil  & $<$ 2 s    & 1,2 s  & \cmark \\
    Chargement workspace       & $<$ 2 s    & 1,8 s  & \cmark \\
    Chargement chat            & $<$ 1 s    & 0,8 s  & \cmark \\
    Réponse API — Auth         & $<$ 500 ms & 250 ms & \cmark \\
    Réponse API — Création class & $<$ 500 ms & 380 ms & \cmark \\
    Envoi de message           & $<$ 200 ms & 120 ms & \cmark \\
    Première réponse IA        & $<$ 1 s    & 850 ms & \cmark \\
    LCP                        & $<$ 2,5 s  & 1,8 s  & \cmark \\
    FID                        & $<$ 100 ms & 45 ms  & \cmark \\
    CLS                        & $<$ 0,1    & 0,05   & \cmark \\
    \bottomrule
  \end{tabular}
  \label{tab:perf-results}
\end{table}

\section{Fonctionnalités Non Implémentées}

Les fonctionnalités suivantes ont été reportées en raison de contraintes de
temps (12 semaines de développement) et de complexité technique :

\begin{itemize}
  \item \xmark\ Application mobile native (React Native) ;
  \item \xmark\ Mode hors ligne (\textit{offline-first}) ;
  \item \xmark\ Tableaux blancs collaboratifs ;
  \item \xmark\ Intégration avec les LMS existants (Moodle, Canvas).
\end{itemize}

\section{Évaluation Critique}

\subsection{Points Forts}

\begin{itemize}
  \item Architecture modulaire, maintenable et scalable ;
  \item Intégration RAG performante avec temps de réponse sous 1~seconde ;
  \item Interface moderne et intuitive (retours encadrant positifs) ;
  \item Tous les objectifs de performance mesurés atteints ;
  \item Bonnes pratiques de sécurité appliquées (Argon2id, RBAC, isolation) ;
  \item Système de monétisation entièrement fonctionnel.
\end{itemize}

\subsection{Points d'Amélioration}

\begin{itemize}
  \item Pas d'application mobile native ;
  \item Statistiques d'apprentissage et tableaux de bord analytiques limités ;
  \item Pas de connexion avec les LMS existants ;
  \item Dépendance à plusieurs services tiers payants à l'échelle.
\end{itemize}

\section{Limitations Identifiées}

\subsection{Limitations Techniques}

\begin{itemize}
  \item Limite actuelle estimée à environ 1\,000~utilisateurs simultanés (hors
        montée en charge Cloud) ;
  \item Coût de l'API Groq croissant proportionnellement à l'usage ;
  \item Indexation de documents volumineux ($>$10 MB) peu performante ;
  \item Recherche vectorielle limitée à 5~résultats par requête.
\end{itemize}

\subsection{Limitations Fonctionnelles}

\begin{itemize}
  \item Pas d'édition collaborative de documents ;
  \item Pas de breakout rooms dans la vidéoconférence ;
  \item Pas d'API publique exposée aux développeurs tiers.
\end{itemize}

\section{Leçons Apprises}

\subsection{Succès}

\begin{itemize}
  \item Next.js~16 s'avère un excellent choix pour les performances et l'expérience
        développeur ;
  \item Le pattern Repository/Service améliore significativement la maintenabilité ;
  \item TypeScript réduit le nombre de bugs à l'exécution ;
  \item Le RAG améliore la pertinence des réponses IA de manière mesurable ;
  \item Upstash Vector est simple à intégrer et efficace.
\end{itemize}

\subsection{Défis Rencontrés}

\begin{itemize}
  \item La gestion des permissions RBAC avec overrides par classe a présenté de
        nombreux cas limites ;
  \item L'optimisation du chargement initial du workspace a nécessité plusieurs
        itérations de refactoring ;
  \item Le débogage du streaming IA (gestion des erreurs mid-stream) s'est révélé
        complexe.
\end{itemize}

% ============================================================
%  CHAPITRE 13 — PERSPECTIVES D'ÉVOLUTION
% ============================================================
\chapter{Perspectives d'Évolution}

\section{Améliorations Fonctionnelles à Court Terme}

\subsection{Nouvelles Fonctionnalités Pédagogiques}

Les améliorations prioritaires à horizon 3~mois incluent :

\begin{description}
  \item[Notifications push (PWA)] améliorer l'engagement des utilisateurs sur
    mobile sans application native ;
  \item[Recherche globale] permettre la recherche dans les messages, ressources
    et devoirs depuis une barre unifiée ;
  \item[Statistiques enseignants] tableaux de bord de suivi de progression par
    étudiant et par classe ;
  \item[Mode sombre complet] achever la thématisation sombre de tous les
    composants.
\end{description}

\section{Améliorations Techniques}

\subsection{Performance et Scalabilité}

\begin{itemize}
  \item Cache Redis pour les requêtes Firestore fréquentes ;
  \item Lazy loading agressif des composants ;
  \item Compression des images (formats AVIF, WebP) ;
  \item Prefetching intelligent des routes fréquentes.
\end{itemize}

\subsection{Sécurité Renforcée}

\begin{itemize}
  \item Authentification multi-facteurs (MFA) ;
  \item Audit logs pour traçabilité RGPD ;
  \item Chiffrement end-to-end pour les messages sensibles.
\end{itemize}

\section{Nouvelles Fonctionnalités à Moyen Terme}

\subsection{Application Mobile}

Une application React Native est envisagée à horizon 6~mois, offrant
synchronisation offline, notifications push natives et partage de fichiers
optimisé.

\subsection{Génération Automatique de Quiz}

L'extraction automatique de questions depuis les ressources de cours (QCM, vrai/
faux, réponses courtes), avec correction automatique et adaptation au niveau de
l'étudiant, constitue une extension naturelle du module IA.

\subsection{Intégrations Externes}

\begin{itemize}
  \item Intégrations LMS : Moodle, Canvas, Blackboard ;
  \item Outils de productivité : Google Workspace, Microsoft~365 ;
  \item Calendrier : Google Calendar, Outlook.
\end{itemize}

\subsection{Gamification}

Un système de points, badges et défis entre classes visant à renforcer la
motivation des apprenants est identifié comme levier d'engagement à moyen terme.

\section{Vision Long Terme}

À horizon 12~mois, OpenClass a pour ambition de :

\begin{enumerate}
  \item Exposer une API publique pour les développeurs tiers ;
  \item Créer un marketplace de contenus pédagogiques ;
  \item Intégrer des modèles IA plus avancés (génération de vidéo pédagogique,
        synthèse vocale) ;
  \item Proposer une architecture microservices pour un scaling indépendant de
        chaque domaine.
\end{enumerate}

% ============================================================
%  CHAPITRE 14 — CONCLUSION GÉNÉRALE
% ============================================================
\chapter{Conclusion Générale}

\section{Synthèse du Projet}

OpenClass est une plateforme d'apprentissage collaboratif développée dans le cadre
d'un stage de fin d'études chez Brain Skills. Le projet répond à un besoin concret
identifié dans le secteur de l'éducation numérique : la fragmentation des outils
et le manque de personnalisation des solutions existantes.

\subsection{Réalisations Principales}

\textbf{Sur le plan technique} :
\begin{itemize}
  \item Architecture moderne basée sur Next.js~16 avec App Router ;
  \item Intégration du pattern RAG avec Upstash Vector et Groq ;
  \item Système de permissions RBAC granulaire et sécurisé ;
  \item Communication temps réel (chat Firestore et vidéoconférence LiveKit) ;
  \item Déploiement automatisé sur Vercel.
\end{itemize}

\textbf{Sur le plan fonctionnel} :
\begin{itemize}
  \item Plateforme unifiée regroupant chat, vidéo, devoirs, ressources et IA ;
  \item Assistant IA personnalisé avec accès contextuel aux cours ;
  \item Architecture multi-tenant avec isolation complète des données ;
  \item Système de monétisation opérationnel via Polar.
\end{itemize}

\textbf{Sur le plan méthodologique} :
\begin{itemize}
  \item Application de la méthodologie Agile/Scrum sur 6~sprints ;
  \item Taux de réalisation du backlog de 96\,\% ;
  \item Tests manuels et via Postman avec 100\,\% de réussite.
\end{itemize}

\subsection{Valeur Ajoutée par Rapport à l'Existant}

OpenClass se distingue des solutions concurrentes (Google Classroom, MS Teams,
Moodle) principalement par son assistant IA contextuel basé sur le RAG, qui
permet aux étudiants d'interroger leurs propres cours en langage naturel, et par
son approche \textit{tout-en-un} qui supprime la nécessité de combiner plusieurs
outils.

\section{Compétences Acquises}

\subsection{Compétences Techniques}

Ce projet a permis d'acquérir une maîtrise pratique des domaines suivants :

\begin{description}
  \item[Développement full-stack] Next.js~16, React~19, TypeScript, architecture
    en couches (Repository, Service, API) ;
  \item[Intelligence artificielle] implémentation du pattern RAG, bases de données
    vectorielles, chunking et indexation de documents ;
  \item[DevOps] déploiement Vercel, monitoring, gestion des environnements ;
  \item[Sécurité] Argon2id, JWT, RBAC, protection CSRF/XSS.
\end{description}

\subsection{Compétences Méthodologiques}

\begin{description}
  \item[Gestion de projet] planification Agile, estimation en story points,
    gestion des risques, priorisation MoSCoW ;
  \item[Conception] analyse des besoins, modélisation UML, design patterns ;
  \item[Qualité] tests fonctionnels, revue de code, documentation technique.
\end{description}

\section{Évaluation Critique du Projet}

Sans minimiser les résultats obtenus, plusieurs points de vigilance méritent
d'être soulignés honnêtement :

\begin{itemize}
  \item Le taux de réalisation de 96\,\% reste à nuancer : les fonctionnalités
        reportées (application mobile, tableaux blancs) représentent des besoins
        utilisateurs identifiés, non des éléments secondaires ;
  \item Les tests reposent exclusivement sur des tests manuels et Postman. En
        production, une suite de tests automatisés (Jest/Vitest) serait nécessaire
        pour garantir la non-régression ;
  \item La scalabilité déclarée (10\,000~utilisateurs) n'a pas été validée par
        des tests de charge formels ;
  \item La dépendance à de nombreux services tiers gratuits constitue un risque
        commercial en cas de passage à l'échelle.
\end{itemize}

\section{Mot de la Fin}

OpenClass démontre qu'il est possible de réaliser, dans un délai de 12~semaines,
une plateforme éducative fonctionnelle combinant technologies web modernes et
intelligence artificielle. Le projet constitue une base solide pour Brain Skills,
avec un potentiel d'évolution vers une offre SaaS EdTech au Maroc et à
l'international.

Au-delà du livrable technique, ce stage a été une expérience formatrice sur le
cycle complet du développement logiciel : de la conception à la mise en
production, en passant par la gestion de projet et la communication avec les
parties prenantes.

% ============================================================
%  BIBLIOGRAPHIE
% ============================================================
\addcontentsline{toc}{chapter}{Bibliographie}
\chapter*{Bibliographie}

\begin{enumerate}
  \item HolonIQ, \textit{EdTech Intelligence Report 2024}, HolonIQ Research, 2024.
  \item Organisation de Coopération et de Développement Économiques (OCDE),
        \textit{Regards sur l'éducation 2024 : Les indicateurs de l'OCDE}, Éditions
        OCDE, Paris, 2024.
  \item Lewis, C. et al., \textit{Retrieval-Augmented Generation for
        Knowledge-Intensive NLP Tasks}, NeurIPS, 2020.
  \item Vercel Inc., \textit{Next.js Documentation} [en ligne], disponible sur
        \url{https://nextjs.org/docs}, consulté en mars-juin 2026.
  \item Google Firebase, \textit{Cloud Firestore Documentation} [en ligne],
        disponible sur \url{https://firebase.google.com/docs/firestore}, consulté
        en mars-juin 2026.
  \item Upstash, \textit{Upstash Vector Documentation} [en ligne], disponible sur
        \url{https://upstash.com/docs/vector/overall/whatisvector}, consulté en
        avril 2026.
  \item LiveKit, \textit{LiveKit Open Source Documentation} [en ligne], disponible
        sur \url{https://docs.livekit.io}, consulté en avril 2026.
  \item Groq, \textit{Groq API Documentation} [en ligne], disponible sur
        \url{https://console.groq.com/docs}, consulté en avril 2026.
  \item OWASP, \textit{Password Storage Cheat Sheet} [en ligne], disponible sur
        \url{https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html},
        consulté en mai 2026.
  \item Polar, \textit{Polar Developer Documentation} [en ligne], disponible sur
        \url{https://docs.polar.sh}, consulté en mai 2026.
\end{enumerate}

% ============================================================
%  ANNEXES
% ============================================================
\appendix

% ============================================================
%  ANNEXE A — EXTRAITS DE CODE CLÉS
% ============================================================
\chapter{Extraits de Code Clés}

\section{Inscription et Authentification}

\begin{lstlisting}[language=TypeScript, caption={AuthService — inscription (simplifié)}]
async register(email: string, password: string, fullName: string) {
  const existing = await this.profileRepo.getByEmail(email)
  if (existing) throw new Error("Email déjà utilisé")

  const passwordHash = await hashPassword(password)   // Argon2id
  const profile = { id: generateId(), email, fullName, passwordHash, ... }
  await this.profileRepo.create(profile)

  const token = await signToken(await buildJWTPayload(profile.id))
  await setAuthCookie(token)
  return { profile, token }
}
\end{lstlisting}

\section{Indexation Vectorielle (RAG)}

\begin{lstlisting}[language=TypeScript, caption={DocumentIndexingService — indexation d'une ressource (simplifié)}]
async indexResource(classId: string, resourceId: string, fileUrl: string) {
  const bytes = await this.loadFileBytes(fileUrl)
  const text  = await this.extractText(bytes)          // PDF ou texte brut
  const chunks = this.chunkDocumentText(text)           // <= 1 200 car. par chunk
  await this.aiService.storeEmbeddingChunks(classId, resourceId, chunks)
  await this.resourceRepo.markAsIndexed(resourceId)
  return { chunkCount: chunks.length }
}
\end{lstlisting}

\section{Streaming IA (Server-Sent Events)}

\begin{lstlisting}[language=TypeScript, caption={API Route — streaming SSE (simplifié)}]
// src/app/api/ai/stream/route.ts
export async function POST(req: NextRequest) {
  const { conversationId, message } = await req.json()
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      for await (const chunk of aiService.generateStreamingResponse(
        conversationId, message, (await getSession()).userId
      )) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  })
}
\end{lstlisting}

% ============================================================
%  ANNEXE B — SCHÉMA DE BASE DE DONNÉES
% ============================================================
\chapter{Schéma de Base de Données (Firebase Firestore)}

Les trois collections les plus importantes sont présentées ci-dessous.
L'ensemble des collections est décrit dans le tableau~\ref{tab:collections}.

\begin{lstlisting}[caption={Collections principales — champs essentiels}]
organizations/{id}   id · name · slug(unique) · type · ownerId
                     inviteCode(8 car.) · createdAt

classes/{id}         id · organizationId · name · slug · ownerId
                     inviteCode · archived · createdAt

messages/{id}        id · channelId · senderId · content
                     replyToId · edited · pinned · attachments · createdAt
\end{lstlisting}

% ============================================================
%  ANNEXE C — VARIABLES D'ENVIRONNEMENT
% ============================================================
\chapter{Variables d'Environnement}

\begin{lstlisting}[caption={.env.local — clés requises par service}]
# Firebase
FIREBASE_PROJECT_ID=          FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# LiveKit
LIVEKIT_URL=                  LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=

# Upstash Vector
UPSTASH_VECTOR_URL=           UPSTASH_VECTOR_TOKEN=

# Groq / UploadThing / Polar
GROQ_API_KEY=                 UPLOADTHING_SECRET=
POLAR_ACCESS_TOKEN=           POLAR_WEBHOOK_SECRET=

# Authentification
JWT_SECRET=                   # minimum 256 bits
\end{lstlisting}

% ============================================================
%  ANNEXE D — GUIDE UTILISATEUR SYNTHÉTIQUE
% ============================================================
\chapter{Guide Utilisateur Synthétique}

\section{Enseignant}

\begin{enumerate}
  \item \textbf{Créer une classe} : workspace → «~Créer une classe~» →
        remplir le formulaire → partager le code d'invitation.
  \item \textbf{Créer un devoir} : classe → Devoirs → «~Créer un devoir~» →
        titre, description, date limite → Publier.
  \item \textbf{Corriger} : devoir → liste des soumissions → attribuer score
        et feedback → Enregistrer.
\end{enumerate}

\section{Étudiant}

\begin{enumerate}
  \item \textbf{Rejoindre une classe} : «~Rejoindre une classe~» → saisir le
        code d'invitation.
  \item \textbf{Soumettre un devoir} : devoir → rédiger (brouillon auto.) →
        pièces jointes éventuelles → «~Soumettre~».
  \item \textbf{Assistant IA} : IA de la classe → nouvelle conversation →
        poser une question → lire la réponse avec sources citées.
\end{enumerate}

% ============================================================
%  ANNEXE E — GLOSSAIRE
% ============================================================
\chapter{Glossaire}

\begin{description}
  \item[API] \textit{Application Programming Interface} — interface permettant à
    deux logiciels de communiquer.
  \item[CDN] \textit{Content Delivery Network} — réseau de distribution de contenu.
  \item[CI/CD] \textit{Continuous Integration / Deployment} — automatisation des
    tests et du déploiement.
  \item[CRUD] \textit{Create, Read, Update, Delete} — opérations de base sur les
    données.
  \item[EdTech] \textit{Educational Technology} — technologie éducative.
  \item[JWT] \textit{JSON Web Token} — standard d'authentification sans état
    (RFC~7519).
  \item[LLM] \textit{Large Language Model} — grand modèle de langage (ex.
    Llama~3.1).
  \item[MVC] \textit{Model-View-Controller} — patron d'architecture logicielle.
  \item[PFE] Projet de Fin d'Études.
  \item[RAG] \textit{Retrieval-Augmented Generation} — IA combinant recherche
    vectorielle et génération de texte.
  \item[RBAC] \textit{Role-Based Access Control} — contrôle d'accès par rôles.
  \item[RGPD] Règlement Général sur la Protection des Données.
  \item[SaaS] \textit{Software as a Service} — logiciel livré en tant que service
    cloud.
  \item[SSE] \textit{Server-Sent Events} — streaming unidirectionnel serveur →
    client.
  \item[SSR] \textit{Server-Side Rendering} — rendu des pages côté serveur.
\end{description}

\end{document}