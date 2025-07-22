'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Testimonial {
  id: string;
  route: string;
  reason: string;
  name: string;
  city?: string;
}

interface ScrollingTestimonialsProps {
  className?: string;
}

export default function ScrollingTestimonials({ className = '' }: ScrollingTestimonialsProps) {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  // Sample testimonials (would be fetched from API in real implementation)
  const sampleTestimonials: Testimonial[] = useMemo(() => [
    {
      id: '1',
      route: 'Amsterdam → Barcelona',
      reason: 'I want to wake up to the Mediterranean sunrise instead of taking a 2-hour flight that destroys our planet. Night trains make sustainable travel romantic again.',
      name: 'Emma',
      city: 'Amsterdam'
    },
    {
      id: '2',
      route: 'Berlin → Rome',
      reason: 'Imagine falling asleep in German forests and waking up to Italian hills. This route would cut aviation emissions by 85% while creating magical travel experiences.',
      name: 'Lars',
      city: 'Berlin'
    },
    {
      id: '3',
      route: 'Paris → Prague',
      reason: 'Night trains connect cultures, not just cities. I dream of crossing Europe slowly, sustainably, meeting fellow travelers who care about our climate future.',
      name: 'Marie',
      city: 'Paris'
    },
    {
      id: '4',
      route: 'Madrid → Munich',
      reason: 'Business travel doesn\'t have to mean more flights. This route would revolutionize European commerce while showing corporate responsibility for climate action.',
      name: 'Carlos',
      city: 'Madrid'
    },
    {
      id: '5',
      route: 'Copenhagen → Milan',
      reason: 'My children deserve to see the Alps from a train window, not from 35,000 feet. Sustainable travel is about creating memories, not carbon footprints.',
      name: 'Astrid',
      city: 'Copenhagen'
    },
    {
      id: '6',
      route: 'Lisbon → Vienna',
      reason: 'This route would connect the Atlantic to the Danube through sustainable rail. Europe needs bold vision - night trains are climate action with soul.',
      name: 'João',
      city: 'Lisbon'
    }
  ], []);

  useEffect(() => {
    // In real implementation, fetch from API
    setTestimonials(sampleTestimonials);
    setLoading(false);
  }, [sampleTestimonials]);

  useEffect(() => {
    if (testimonials.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (loading || testimonials.length === 0) {
    return (
      <div className={`scrolling-testimonials ${className}`}>
        <div className="bg-gradient-to-r from-bot-green/10 to-bot-blue/10 rounded-2xl p-6 border border-bot-green/20">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-20 bg-gray-200 rounded mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      </div>
    );
  }

  const currentTestimonial = testimonials[currentIndex];

  return (
    <div className={`scrolling-testimonials ${className}`}>
      <div className="bg-gradient-to-br from-bot-green/15 to-bot-blue/15 rounded-2xl p-6 sm:p-8 border border-bot-green/30 shadow-lg backdrop-blur-sm">
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-gray-900 mb-2">💭 Why This Route Matters</h3>
          <p className="text-sm text-gray-600">Real stories from our community</p>
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTestimonial.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="bg-white/70 rounded-xl p-6 shadow-md backdrop-blur-sm border border-white/50">
              <div className="text-bot-green font-bold text-lg mb-3">
                {currentTestimonial.route}
              </div>
              <blockquote className="text-gray-700 italic leading-relaxed mb-4">
                &ldquo;{currentTestimonial.reason}&rdquo;
              </blockquote>
              <div className="text-bot-blue font-semibold">
                — {currentTestimonial.name}
                {currentTestimonial.city && (
                  <span className="text-gray-500 font-normal"> from {currentTestimonial.city}</span>
                )}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
        
        {/* Progress indicators */}
        <div className="flex justify-center mt-6 space-x-2">
          {testimonials.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-bot-green w-6' 
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`View testimonial ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}