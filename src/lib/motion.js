// ============================================================
// frontend/src/lib/motion.js — vocabulaire de motion partagé (fondation
// "Apple fluid interfaces" : WWDC 2018 "Designing Fluid Interfaces").
//
// Le principe : une interface a l'air vivante quand le mouvement part de
// la valeur actuelle à l'écran, hérite de la vitesse du geste, et peut être
// repris/inversé à tout instant — un spring fait ça nativement (il est
// interruptible et sensible à la vélocité), une easing à durée fixe non.
// On centralise ici les presets au lieu de réécrire `type: 'spring', ...`
// à chaque composant, pour que tout le site partage le même "toucher".
//
// Le reduced-motion global est géré une fois pour toutes via
// <MotionConfig reducedMotion="user"> dans main.jsx — pas besoin d'y
// repenser dans chaque page qui utilise ces presets.
// ============================================================

// Petits éléments interactifs (bouton, icône, badge) — réactif, presque
// pas d'overshoot, pour rester précis au doigt/à la souris.
export const springSnappy = { type: 'spring', stiffness: 500, damping: 32, mass: 0.7 }

// Entrée d'une carte, d'un panneau, d'une page — un seul mouvement
// orchestré, avec un petit rebond perceptible mais pas enfantin.
export const springSmooth = { type: 'spring', stiffness: 300, damping: 28, mass: 0.9 }

// Feuilles/panneaux qui glissent depuis un bord (menu mobile, modale) —
// plus de masse, plus lent à s'arrêter, pour un geste "lourd" et physique.
export const springSheet = { type: 'spring', stiffness: 280, damping: 32, mass: 1 }

// Variants prêts à l'emploi pour une entrée de carte/page unique (à ne pas
// répéter sur chaque enfant d'une liste — un seul moment orchestré, pas un
// fade-slide-up sur chaque tuile).
export const enterVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, y: 8, transition: { duration: 0.15 } },
}

// Feedback de pression — à utiliser avec whileTap sur les éléments custom
// (pas les .btn-* qui ont déjà leur propre relâchement élastique en CSS).
export const tapScale = { scale: 0.96 }
export const tapTransition = springSnappy
