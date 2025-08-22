'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, Play, Pause, RotateCcw, Info } from 'lucide-react';

export interface StoryStep {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  content?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
  }[];
}

export interface VisualStoryProps {
  steps: StoryStep[];
  title: string;
  className?: string;
  autoPlay?: boolean;
  showProgress?: boolean;
}

/**
 * InteractiveStoryFlow - Visual storytelling with progressive disclosure
 */
export function InteractiveStoryFlow({
  steps,
  title,
  className = '',
  autoPlay = false,
  showProgress = true
}: VisualStoryProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [expandedStep, setExpandedStep] = useState<string | null>(null);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentStep((prev) => (prev + 1) % steps.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isPlaying, steps.length]);

  const handleStepClick = (index: number) => {
    setCurrentStep(index);
    setIsPlaying(false);
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const resetStory = () => {
    setCurrentStep(0);
    setIsPlaying(false);
  };

  const toggleExpansion = (stepId: string) => {
    setExpandedStep(expandedStep === stepId ? null : stepId);
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-bot-green to-bot-blue text-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold">{title}</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={togglePlayback}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title={isPlaying ? 'Pause story' : 'Play story'}
            >
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button
              onClick={resetStory}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              title="Restart story"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {showProgress && (
          <div className="mt-4">
            <div className="flex justify-between text-sm text-white/80 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <motion.div
                className="bg-white h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Story Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className={`w-16 h-16 ${steps[currentStep].bgColor} rounded-full flex items-center justify-center mx-auto mb-6`}>
              <span className="text-3xl">{steps[currentStep].icon}</span>
            </div>
            
            <h4 className={`text-2xl font-bold mb-4 ${steps[currentStep].color}`}>
              {steps[currentStep].title}
            </h4>
            
            <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto leading-relaxed">
              {steps[currentStep].description}
            </p>

            {/* Stats */}
            {steps[currentStep].stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {steps[currentStep].stats!.map((stat, index) => (
                  <motion.div
                    key={index}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="text-center p-4 bg-gray-50 rounded-lg"
                  >
                    <div className={`text-2xl font-bold ${steps[currentStep].color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* Additional Content */}
            {steps[currentStep].content && (
              <div className="mt-6">
                {steps[currentStep].content}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step Navigation */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <button
              key={index}
              onClick={() => handleStepClick(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStep
                  ? 'bg-bot-green'
                  : index < currentStep
                  ? 'bg-bot-green/50'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              title={`Go to step ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ProgressiveDisclosure - Expandable content sections
 */
export function ProgressiveDisclosure({
  title,
  summary,
  children,
  icon,
  defaultOpen = false,
  className = ''
}: {
  title: string;
  summary: string;
  children: React.ReactNode;
  icon?: string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          {icon && (
            <div className="w-10 h-10 bg-bot-green/10 rounded-lg flex items-center justify-center">
              <span className="text-lg">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">{summary}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Info className="h-4 w-4 text-gray-400" />
          {isOpen ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t border-gray-200"
          >
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * ImpactVisualization - Visual representation of climate impact
 */
export function ImpactVisualization({
  title,
  comparison,
  className = ''
}: {
  title: string;
  comparison: {
    train: { value: number; label: string; color: string };
    flight: { value: number; label: string; color: string };
    unit: string;
  };
  className?: string;
}) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const maxValue = Math.max(comparison.train.value, comparison.flight.value);
  const trainWidth = (comparison.train.value / maxValue) * 100;
  const flightWidth = (comparison.flight.value / maxValue) * 100;

  return (
    <div className={`bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">{title}</h3>
      
      <div className="space-y-6">
        {/* Train */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">🚂</span>
              <span className="font-semibold text-gray-700">{comparison.train.label}</span>
            </div>
            <span className="font-bold text-green-700">
              {comparison.train.value} {comparison.unit}
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${comparison.train.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: animated ? `${trainWidth}%` : 0 }}
              transition={{ duration: 1, delay: 0.2 }}
            />
          </div>
        </div>

        {/* Flight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">✈️</span>
              <span className="font-semibold text-gray-700">{comparison.flight.label}</span>
            </div>
            <span className="font-bold text-red-700">
              {comparison.flight.value} {comparison.unit}
            </span>
          </div>
          <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className={`h-full ${comparison.flight.color} rounded-full`}
              initial={{ width: 0 }}
              animate={{ width: animated ? `${flightWidth}%` : 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 p-4 bg-white/60 rounded-lg border border-green-200">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-700 mb-1">
            {Math.round(((comparison.flight.value - comparison.train.value) / comparison.flight.value) * 100)}%
          </div>
          <div className="text-sm text-gray-600">
            Lower emissions with night trains
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * IconGrid - Visual representation with icons and minimal text
 */
export function IconGrid({
  items,
  columns = 3,
  className = ''
}: {
  items: {
    icon: string;
    title: string;
    description?: string;
    color?: string;
    bgColor?: string;
  }[];
  columns?: number;
  className?: string;
}) {
  return (
    <div 
      className={`grid gap-6 ${
        columns === 2 ? 'grid-cols-1 md:grid-cols-2' :
        columns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        columns === 4 ? 'grid-cols-2 md:grid-cols-4' :
        'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
      } ${className}`}
    >
      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className={`text-center p-6 rounded-xl border-2 hover:shadow-lg transition-all duration-300 ${
            item.bgColor || 'bg-white'
          } ${item.color ? `border-${item.color}-200` : 'border-gray-200'} hover:border-bot-green/30`}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-bot-green/10 to-bot-blue/10 rounded-full flex items-center justify-center">
            <span className="text-3xl">{item.icon}</span>
          </div>
          <h3 className={`font-bold text-lg mb-2 ${item.color || 'text-gray-900'}`}>
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 leading-relaxed">
              {item.description}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default {
  InteractiveStoryFlow,
  ProgressiveDisclosure,
  ImpactVisualization,
  IconGrid
};