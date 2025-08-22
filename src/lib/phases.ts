/**
 * 6-Phase User Journey System
 * 
 * Defines the complete user journey from dream to action:
 * dream → participate → connect → organize → community → pyjama-party
 */

export interface Phase {
  id: string;
  name: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
  order: number;
  category: 'explore' | 'engage' | 'activate';
}

export const PHASES: Phase[] = [
  {
    id: 'dream',
    name: 'Dream',
    title: 'Dream Your Route',
    description: 'Explore destinations and share your ideal night train journey',
    icon: '✨',
    href: '/dream',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    order: 1,
    category: 'explore'
  },
  {
    id: 'participate',
    name: 'Participate',
    title: 'Join the Event',
    description: 'Sign up for the Europe-wide pajama party and silent disco',
    icon: '🎉',
    href: '/participate',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    order: 2,
    category: 'engage'
  },
  {
    id: 'connect',
    name: 'Connect',
    title: 'Plan Your Journey',
    description: 'Find routes and connections to your chosen destination',
    icon: '🚂',
    href: '/connect',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    order: 3,
    category: 'engage'
  },
  {
    id: 'organize',
    name: 'Organize',
    title: 'Lead Your Station',
    description: 'Coordinate local events and build community at your station',
    icon: '📋',
    href: '/organize',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    order: 4,
    category: 'activate'
  },
  {
    id: 'community',
    name: 'Community',
    title: 'Join the Movement',
    description: 'Connect with activists and track movement growth',
    icon: '🌍',
    href: '/community',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    order: 5,
    category: 'activate'
  },
  {
    id: 'pyjama-party',
    name: 'Pajama Party',
    title: 'The Big Event',
    description: 'Experience the Europe-wide synchronized celebration',
    icon: '🎪',
    href: '/pyjama-party',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    order: 6,
    category: 'activate'
  }
];

export const PHASE_CATEGORIES = {
  explore: {
    name: 'Explore',
    description: 'Discover possibilities',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50'
  },
  engage: {
    name: 'Engage', 
    description: 'Take first steps',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  activate: {
    name: 'Activate',
    description: 'Lead and organize',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50'
  }
} as const;

/**
 * Get phase by ID
 */
export function getPhase(phaseId: string): Phase | undefined {
  return PHASES.find(phase => phase.id === phaseId);
}

/**
 * Get next phase in the journey
 */
export function getNextPhase(currentPhaseId: string): Phase | undefined {
  const currentPhase = getPhase(currentPhaseId);
  if (!currentPhase) return PHASES[0]; // Default to first phase
  
  const nextOrder = currentPhase.order + 1;
  return PHASES.find(phase => phase.order === nextOrder);
}

/**
 * Get previous phase in the journey
 */
export function getPreviousPhase(currentPhaseId: string): Phase | undefined {
  const currentPhase = getPhase(currentPhaseId);
  if (!currentPhase) return undefined;
  
  const previousOrder = currentPhase.order - 1;
  return PHASES.find(phase => phase.order === previousOrder);
}

/**
 * Get completed phases based on user progress
 */
export function getCompletedPhases(completedPhaseIds: string[]): Phase[] {
  return PHASES.filter(phase => completedPhaseIds.includes(phase.id));
}

/**
 * Calculate journey completion percentage
 */
export function getJourneyCompletionPercentage(completedPhaseIds: string[]): number {
  return Math.round((completedPhaseIds.length / PHASES.length) * 100);
}

/**
 * Get phases by category
 */
export function getPhasesByCategory(category: 'explore' | 'engage' | 'activate'): Phase[] {
  return PHASES.filter(phase => phase.category === category);
}

/**
 * Determine current phase based on URL pathname
 */
export function getCurrentPhaseFromPath(pathname: string): Phase | undefined {
  // Handle dynamic routes like /dream/[placeId] and /connect/[placeId]
  const segments = pathname.split('/').filter(Boolean);
  const basePath = segments[0];
  
  // Special case for homepage - consider it as pre-dream
  if (pathname === '/' || pathname === '') {
    return undefined; // No current phase on homepage
  }
  
  return getPhase(basePath);
}

/**
 * Universal messaging variations
 */
export const UNIVERSAL_MESSAGES = [
  "Where would you like to wake up tomorrow?",
  "Where will your next adventure begin?",
  "Which European city calls to you?",
  "Where does your dream route lead?"
] as const;

/**
 * Get contextual universal message based on current phase
 */
export function getContextualMessage(currentPhase?: Phase): string {
  if (!currentPhase) {
    return UNIVERSAL_MESSAGES[0]; // Default message
  }
  
  switch (currentPhase.id) {
    case 'dream':
      return "Where would you like to wake up tomorrow?";
    case 'participate':
      return "Ready to join the movement?";
    case 'connect':
      return "How will you get there?";
    case 'organize':
      return "Ready to lead your station?";
    case 'community':
      return "Join the growing movement";
    case 'pyjama-party':
      return "The big night is coming!";
    default:
      return UNIVERSAL_MESSAGES[0];
  }
}