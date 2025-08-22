// Journey System Components
export { default as UniversalMessage, UniversalMessageBanner, UniversalMessageFloating } from './UniversalMessage';
export { default as PhaseProgress } from './PhaseProgress';
export { default as PhaseNavigation } from './PhaseNavigation';
export { 
  default as RecentActivity,
  DreamsTicker,
  ParticipationCounters,
  CommunityGrowth
} from './RecentActivity';

// Visual Storytelling Components
export {
  InteractiveStoryFlow,
  ProgressiveDisclosure,
  ImpactVisualization,
  IconGrid
} from './VisualStorytellingElements';

// Types
export type { UniversalMessageProps } from './UniversalMessage';
export type { PhaseProgressProps } from './PhaseProgress';
export type { PhaseNavigationProps } from './PhaseNavigation';
export type { RecentActivityProps, DreamActivity, ParticipationStats } from './RecentActivity';
export type { VisualStoryProps, StoryStep } from './VisualStorytellingElements';