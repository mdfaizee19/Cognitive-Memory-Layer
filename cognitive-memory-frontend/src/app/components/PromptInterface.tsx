import React, { useState, useEffect } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const StarField = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(150)].map((_, i) => {
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        const size = Math.random() * 2;
        const duration = 2 + Math.random() * 4;
        const delay = Math.random() * 5;

        return (
          <motion.div
            key={i}
            initial={{ opacity: 0.1 }}
            animate={{ opacity: [0.1, 0.8, 0.1] }}
            transition={{
              duration,
              repeat: Infinity,
              delay,
              ease: "easeInOut"
            }}
            className="absolute bg-white rounded-full"
            style={{
              top: `${top}%`,
              left: `${left}%`,
              width: `${size}px`,
              height: `${size}px`,
              boxShadow: size > 1 ? '0 0 5px rgba(255, 255, 255, 0.3)' : 'none'
            }}
          />
        );
      })}
    </div>
  );
};

export const PromptInterface = () => {
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'extracting' | 'mapping' | 'completed'>('idle');
  const [extractionData, setExtractionData] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [activatedBalls, setActivatedBalls] = useState<Set<string>>(new Set());
  const [ballPositions, setBallPositions] = useState<{ [key: string]: { ring: number, index: number, x?: number, y?: number } }>({});
  const [layersExpanded, setLayersExpanded] = useState(false);
  const [showHero, setShowHero] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || status !== 'idle') return;

    setStatus('processing');

    // Step 1: Input processing delay for UI effect
    setTimeout(async () => {
      setStatus('extracting');

      try {
        // Call the real backend API
        const response = await fetch('http://localhost:8000/api/memory/extract', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            user_id: 'demo_user'
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.statusText}`);
        }

        const memoryData = await response.json();

        // Transform API response to match the display format
        setExtractionData({
          memory_id: memoryData.memory_id,
          user_id: memoryData.user_id,
          memory_type: memoryData.memory_type,
          entity: memoryData.entity,
          attribute: memoryData.attribute,
          value: memoryData.value,
          location: memoryData.context?.location || 'null',
          time: memoryData.context?.time || 'null',
          related_entities: JSON.stringify(memoryData.context?.related_entities || []),
          trigger: memoryData.trigger,
          importance_score: memoryData.importance_score.toFixed(2),
          confidence_score: memoryData.confidence_score.toFixed(2),
          origin_turn: memoryData.origin_turn,
          last_activated_turn: memoryData.last_activated_turn,
          created_at: memoryData.created_at,
          expires_at: memoryData.expires_at || 'null'
        });

        // Step 2: Event Processing (Mapping) - keeping for UI animation
        setTimeout(async () => {
          setStatus('mapping');

          // Fetch all memories from the database
          try {
            const allMemoriesResponse = await fetch('http://localhost:8000/api/memory/?limit=100');
            if (!allMemoriesResponse.ok) {
              throw new Error('Failed to fetch all memories');
            }

            const allMemoriesData = await allMemoriesResponse.json();
            const allMemories = allMemoriesData.memories || [];

            // Sort by importance score (descending)
            const sortedMemories = allMemories.sort((a: any, b: any) =>
              b.importance_score - a.importance_score
            );

            // Step 3: Final Completion - Display memories in hierarchy
            setTimeout(() => {
              // Take top 10 memories for the pyramid
              const topMemories = sortedMemories.slice(0, 10);

              const hierarchyEvents = topMemories.map((mem: any, i: number) => ({
                id: i,
                label: `${mem.memory_type.charAt(0).toUpperCase() + mem.memory_type.slice(1)}: ${mem.attribute.replace(/_/g, ' ')}`,
                importance: mem.importance_score,
                details: {
                  memory_id: mem.memory_id,
                  user_id: mem.user_id,
                  memory_type: mem.memory_type,
                  entity: mem.entity,
                  attribute: mem.attribute,
                  value: mem.value,
                  location: mem.context?.location || 'null',
                  time: mem.context?.time || 'null',
                  related_entities: JSON.stringify(mem.context?.related_entities || []),
                  trigger: mem.trigger,
                  importance_score: mem.importance_score.toFixed(2),
                  confidence_score: mem.confidence_score.toFixed(2),
                  origin_turn: mem.origin_turn,
                  last_activated_turn: mem.last_activated_turn,
                  created_at: mem.created_at,
                  expires_at: mem.expires_at || 'null'
                }
              }));

              setEvents(hierarchyEvents);
              setStatus('completed');
            }, 2000);
          } catch (error) {
            console.error('Error fetching all memories:', error);
            // Fallback to showing just the current memory
            setEvents([{
              id: 0,
              label: `${memoryData.memory_type.charAt(0).toUpperCase() + memoryData.memory_type.slice(1)}`,
              importance: memoryData.importance_score,
              details: {
                memory_id: memoryData.memory_id,
                user_id: memoryData.user_id,
                memory_type: memoryData.memory_type,
                entity: memoryData.entity,
                attribute: memoryData.attribute,
                value: memoryData.value,
                location: memoryData.context?.location || 'null',
                time: memoryData.context?.time || 'null',
                related_entities: JSON.stringify(memoryData.context?.related_entities || []),
                trigger: memoryData.trigger,
                importance_score: memoryData.importance_score.toFixed(2),
                confidence_score: memoryData.confidence_score.toFixed(2),
                origin_turn: memoryData.origin_turn,
                last_activated_turn: memoryData.last_activated_turn,
                created_at: memoryData.created_at,
                expires_at: memoryData.expires_at || 'null'
              }
            }]);
            setStatus('completed');
          }
        }, 1500);

      } catch (error) {
        console.error('Error extracting memory:', error);
        // Show error in extraction data
        setExtractionData({
          error: 'Failed to extract memory',
          message: error instanceof Error ? error.message : 'Unknown error',
          details: 'Please check if the backend is running on port 8000'
        });
        setStatus('completed');
      }
    }, 2000);
  };

  const handleReset = () => {
    setPrompt('');
    setStatus('idle');
    setExtractionData(null);
    setActivatedBalls(new Set());
    setBallPositions({});
  };

  const handleWhiteBallClick = () => {
    if (status !== 'completed') return;

    // Ring configuration
    const rings = [
      { count: 6, radius: 110 },
      { count: 10, radius: 200 },
      { count: 14, radius: 310 },
      { count: 12, radius: 420 }
    ];

    // Select 5 random balls from rings 1, 2, and 3 (not ring 0)
    const availableBalls: { ring: number, index: number, id: string }[] = [];
    for (let ringIdx = 1; ringIdx < rings.length; ringIdx++) {
      for (let i = 0; i < rings[ringIdx].count; i++) {
        const id = `dot-${ringIdx}-${i}`;
        if (!activatedBalls.has(id)) {
          availableBalls.push({ ring: ringIdx, index: i, id });
        }
      }
    }

    // Shuffle and pick 5
    const shuffled = availableBalls.sort(() => Math.random() - 0.5);
    const selectedBalls = shuffled.slice(0, Math.min(5, availableBalls.length));

    if (selectedBalls.length === 0) return;

    // Update activated balls set
    const newActivated = new Set(activatedBalls);
    const newPositions = { ...ballPositions };

    // Expand layers outward
    setLayersExpanded(true);

    // Position red balls in the gap - evenly distributed in a circle
    selectedBalls.forEach((ball, idx) => {
      newActivated.add(ball.id);
      const gapRadius = 90; // Larger radius for better visibility and spacing
      const angle = (idx / selectedBalls.length) * 2 * Math.PI; // Even distribution
      newPositions[ball.id] = {
        ring: -1, // Special value for gap
        index: idx,
        x: Math.cos(angle) * gapRadius,
        y: Math.sin(angle) * gapRadius
      };
    });

    setActivatedBalls(newActivated);
    setBallPositions(newPositions);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f4f4f5] flex flex-col items-center justify-center p-6 font-['Inter'] relative overflow-hidden">
      <StarField />

      <AnimatePresence mode="wait">
        {showHero ? (
          <motion.div
            key="hero"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center space-y-12 z-10"
          >
            {/* Clickable Square Logo with Floating Effect */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                y: [0, -15, 0],
              }}
              transition={{
                y: {
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut"
                }
              }}
              onClick={() => setShowHero(false)}
              className="w-72 h-72 cursor-pointer relative group rounded-full overflow-hidden border-2 border-white/10"
            >
              <div className="absolute inset-0 bg-white/5 blur-3xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
              <img
                src="/logo.png"
                alt="COG-6 Logo"
                className="w-full h-full object-cover drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              />
            </motion.div>

            {/* Title */}
            <div className="text-center space-y-3">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-['Playfair_Display'] text-white tracking-tight">
                COG-6
              </h1>
              <p className="text-lg md:text-xl text-zinc-400 tracking-[0.2em] uppercase font-light">
                Universal Cognitive Memory Runtime
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="w-full max-w-3xl flex flex-col items-center space-y-8 z-10"
          >
            <div className="flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/5 text-xs font-medium tracking-wider text-zinc-400 uppercase">
              <Sparkles className="w-3 h-3 text-white/40" />
              <span>Next Generation Intelligence</span>
            </div>

            {/* MNEMOSYNE Header */}
            <div className="text-center space-y-2">
              <p className="text-sm tracking-[0.3em] text-zinc-500 uppercase font-light">
                COG-6 Universal Cognitive Memory Runtime
              </p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl text-center leading-tight font-['Playfair_Display'] text-zinc-100 tracking-tight">
                Experience <span className="italic">Specialized</span> Intelligence
              </h1>
            </div>

            <div className="w-full relative">
              {/* Loading Oval Overlay */}
              <AnimatePresence>
                {(status === 'processing' || status === 'mapping') && (
                  <motion.div
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none bg-black/80 rounded-2xl transition-all duration-500"
                  >
                    <div className="relative flex flex-col items-center justify-center gap-4">
                      <div className="relative flex items-center justify-center">
                        {/* Outer Soft Glow Ring - Amber */}
                        <motion.div
                          animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                          className="absolute w-24 h-24 rounded-full bg-amber-900/20 blur-3xl"
                        />

                        {/* Smooth Spinning Rings - Metallic Gold */}
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                          className="absolute w-16 h-16 rounded-full border border-amber-500/20 border-t-amber-100/60"
                        />
                        <motion.div
                          animate={{ rotate: -360 }}
                          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                          className="absolute w-12 h-12 rounded-full border border-amber-500/20 border-b-amber-100/60"
                        />

                        {/* Center Core - Gold */}
                        <motion.div
                          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                          className="w-1.5 h-1.5 rounded-full bg-amber-100 shadow-[0_0_15px_rgba(251,191,36,0.4)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form
                onSubmit={handleSubmit}
                className="w-full relative group"
              >
                <div className={`relative flex flex-col w-full bg-[#111111]/80 backdrop-blur-xl border transition-all duration-500 rounded-2xl overflow-hidden shadow-2xl ${status !== 'idle' && status !== 'completed'
                  ? 'border-white/40 ring-1 ring-white/10 shadow-[0_0_80px_rgba(255,255,255,0.1)]'
                  : 'border-white/10 hover:border-white/20'
                  }`}>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    disabled={status !== 'idle'}
                    placeholder=" CATCH  A  CHAT  WITH  COG-6  HERE !"
                    className={`w-full min-h-[160px] p-8 bg-transparent text-lg text-center resize-none outline-none placeholder:text-zinc-600/50 font-['Playfair_Display'] font-bold tracking-wide transition-opacity duration-500 ${status !== 'idle' && status !== 'completed' ? 'opacity-40' : 'opacity-100'
                      }`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSubmit(e);
                      }
                    }}
                  />

                  {/* Elegant Wide Send Panel */}
                  <div className="w-full border-t border-white/5 bg-white/[0.02]">
                    <button
                      type="submit"
                      disabled={!prompt.trim() || status !== 'idle'}
                      className={`w-full flex items-center justify-center py-4 transition-all duration-300 group/btn ${prompt.trim() && status === 'idle'
                        ? 'hover:bg-white/[0.05] cursor-pointer'
                        : 'cursor-not-allowed opacity-50'
                        }`}
                    >
                      <Send
                        className={`w-5 h-5 text-zinc-400 group-hover/btn:text-white transition-colors duration-300 ${status !== 'idle' && status !== 'completed' ? 'animate-pulse text-white' : ''
                          }`}
                      />
                    </button>
                  </div>
                </div>
              </form>

              {/* Extraction Result Box */}
              <AnimatePresence>
                {(status === 'extracting' || status === 'mapping' || status === 'completed') && extractionData && (
                  <motion.div
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: 20 }}
                    className="mt-6 w-full bg-[#161616] border border-white/10 rounded-xl p-6 font-mono text-sm overflow-hidden relative"
                  >
                    <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/5">
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Cognitive Event Extraction</span>
                      {status === 'completed' && (
                        <button
                          onClick={handleReset}
                          className="text-[10px] uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
                        >
                          Clear Results
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-2 gap-x-8">
                      {Object.entries(extractionData).map(([key, value]) => (
                        <div key={key} className="flex justify-between group">
                          <span className="text-zinc-500">{key}:</span>
                          <span className="text-zinc-200 group-hover:text-white transition-colors">{value as string}</span>
                        </div>
                      ))}
                    </div>

                    {/* Subtle scanning line effect */}
                    <motion.div
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-px bg-white/10 pointer-events-none"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Hierarchical Window Pyramid Display */}
              <AnimatePresence>
                {status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-20 relative w-full flex flex-col items-center justify-start gap-6 z-10"
                  >
                    {/* Dotted Green Pyramid Structure Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
                      <defs>
                        <linearGradient id="pyramid-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#10b981" stopOpacity="0.05" />
                        </linearGradient>
                      </defs>

                      {/* Left Pyramid Face */}
                      <line x1="50%" y1="0%" x2="10%" y2="100%" stroke="url(#pyramid-grad)" strokeDasharray="4 4" strokeWidth="1" />
                      {/* Right Pyramid Face */}
                      <line x1="50%" y1="0%" x2="90%" y2="100%" stroke="url(#pyramid-grad)" strokeDasharray="4 4" strokeWidth="1" />

                      {/* Horizontal Levels */}
                      <line x1="42%" y1="20%" x2="58%" y2="20%" stroke="url(#pyramid-grad)" strokeDasharray="2 2" strokeWidth="0.5" />
                      <line x1="34%" y1="45%" x2="66%" y2="45%" stroke="url(#pyramid-grad)" strokeDasharray="2 2" strokeWidth="0.5" />
                      <line x1="26%" y1="70%" x2="74%" y2="70%" stroke="url(#pyramid-grad)" strokeDasharray="2 2" strokeWidth="0.5" />
                    </svg>

                    {[
                      events.slice(0, 1), // Top Level - The Summit
                      events.slice(1, 3), // Second Level - The Pillars
                      events.slice(3, 6), // Third Level - The Foundation
                      events.slice(6, 10) // Base Level - The Context
                    ].map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center items-center gap-6 w-full z-10">
                        {row.map((event, eventIndex) => {
                          if (!event) return null;
                          return (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                delay: (rowIndex * 0.2) + (eventIndex * 0.1),
                                duration: 0.8,
                                ease: "easeOut"
                              }}
                              whileHover={{ scale: 1.05, y: -5 }}
                              onMouseEnter={() => setExtractionData(event.details)}
                              className="relative group cursor-pointer"
                            >
                              {/* Window Container - Green/Emerald Theme */}
                              <div className="w-56 h-28 relative border border-emerald-500/20 bg-[#0a0a0a]/90 backdrop-blur-xl overflow-hidden transition-all duration-500 group-hover:border-emerald-400/60 group-hover:bg-emerald-900/20 hover:shadow-[0_0_40px_rgba(16,185,129,0.2)]">

                                {/* Elegant Corner Accents */}
                                <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-emerald-500/40" />
                                <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-emerald-500/40" />
                                <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-emerald-500/40" />
                                <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-emerald-500/40" />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                                  <span className="text-[9px] uppercase tracking-[0.2em] text-emerald-500/60 mb-2 group-hover:text-emerald-300">
                                    {rowIndex === 0 ? 'Core Memory' :
                                      rowIndex === 1 ? 'Primary Context' :
                                        rowIndex === 2 ? 'Attributes' : 'Details'}
                                  </span>
                                  <span className="text-sm font-serif text-zinc-300 group-hover:text-white line-clamp-3 leading-relaxed">
                                    {event.label}
                                  </span>
                                </div>

                                {/* Glass reflection effect */}
                                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent skew-x-12 translate-x-[-100%] group-hover:animate-shine pointer-events-none" />
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}

                    <div className="absolute -bottom-12 text-[10px] uppercase tracking-[0.5em] text-emerald-900/40 font-serif">
                      Hierarchical Mnemonic Structure
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Concentric Neural Cluster */}
              <AnimatePresence>
                {status === 'completed' && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-20 relative w-full h-[850px] flex items-center justify-center pointer-events-none overflow-visible"
                  >
                    {/* Central White Point - Perfectly Centered */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <motion.div
                        animate={{
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            "0 0 50px rgba(255,255,255,0.4)",
                            "0 0 100px rgba(255,255,255,0.8)",
                            "0 0 50px rgba(255,255,255,0.4)"
                          ]
                        }}
                        transition={{ duration: 4, repeat: Infinity }}
                        onClick={handleWhiteBallClick}
                        className="w-16 h-16 bg-white rounded-full z-20 shadow-[0_0_60px_rgba(255,255,255,0.6)] cursor-pointer pointer-events-auto hover:scale-110 transition-transform relative"
                      />
                    </div>

                    {/* Dotted Orbit Path Lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                      {[110, 200, 310, 380].map((radius, i) => (
                        <circle
                          key={i}
                          cx="50%"
                          cy="50%"
                          r={layersExpanded ?
                            (i === 0 ? 170 : i === 1 ? 240 : i === 2 ? 360 : 420) :
                            radius}
                          fill="none"
                          stroke="white"
                          strokeWidth="1"
                          strokeDasharray="4 4"
                          className="transition-all duration-1000 ease-in-out"
                        />
                      ))}
                    </svg>

                    {/* Concentric Rings of Dots */}
                    {[
                      { count: 6, radius: 110, expandedRadius: 170, duration: 15, dir: 1, size: 24 },
                      { count: 10, radius: 200, expandedRadius: 240, duration: 25, dir: -1, size: 18 },
                      { count: 14, radius: 310, expandedRadius: 360, duration: 35, dir: 1, size: 14 },
                      { count: 12, radius: 380, expandedRadius: 420, duration: 45, dir: -1, size: 12 }
                    ].map((ring, ringIdx) => {
                      const activeRadius = layersExpanded ? ring.expandedRadius : ring.radius;

                      return (
                        <motion.div
                          key={`ring-${ringIdx}`}
                          animate={{
                            rotate: ring.dir * 360
                          }}
                          transition={{ duration: ring.duration, repeat: Infinity, ease: "linear" }}
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          {[...Array(ring.count)].map((_, i) => {
                            const ballId = `dot-${ringIdx}-${i}`;
                            const isActivated = activatedBalls.has(ballId);
                            const newPos = ballPositions[ballId];

                            // Skip rendering activated balls in their original positions
                            if (isActivated) return null;

                            // Calculate position with expansion
                            const currentAngle = (i / ring.count) * 2 * Math.PI;
                            const x = Math.cos(currentAngle) * activeRadius;
                            const y = Math.sin(currentAngle) * activeRadius;

                            return (
                              <motion.div
                                key={ballId}
                                className="absolute rounded-full bg-green-400 shadow-[0_0_25px_#4ade80]"
                                animate={{
                                  scale: [1, 1.2, 1],
                                  opacity: [0.5, 0.9, 0.5],
                                  left: `calc(50% + ${x}px)`,
                                  top: `calc(50% + ${y}px)`,
                                }}
                                transition={{
                                  scale: { duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 },
                                  opacity: { duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.2 },
                                  left: { duration: layersExpanded ? 0.8 : 0, ease: "easeOut" },
                                  top: { duration: layersExpanded ? 0.8 : 0, ease: "easeOut" }
                                }}
                                style={{
                                  width: `${ring.size}px`,
                                  height: `${ring.size}px`,
                                  transform: 'translate(-50%, -50%)'
                                }}
                              />
                            );
                          })}
                        </motion.div>
                      );
                    })}

                    {/* Red Balls in Gap - Stationary and Glowing */}
                    {Array.from(activatedBalls).map((ballId) => {
                      const pos = ballPositions[ballId];
                      if (!pos || pos.ring !== -1) return null;

                      return (
                        <motion.div
                          key={`gap-${ballId}`}
                          initial={{ scale: 0, opacity: 0, x: "-50%", y: "-50%" }}
                          animate={{
                            x: "-50%",
                            y: "-50%",
                            scale: [1, 1.15, 1],
                            opacity: [0.8, 1, 0.8],
                            boxShadow: [
                              "0 0 40px rgba(239, 68, 68, 0.9), 0 0 80px rgba(239, 68, 68, 0.6)",
                              "0 0 60px rgba(239, 68, 68, 1), 0 0 120px rgba(239, 68, 68, 0.8)",
                              "0 0 40px rgba(239, 68, 68, 0.9), 0 0 80px rgba(239, 68, 68, 0.6)"
                            ]
                          }}
                          transition={{
                            scale: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                            boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                          }}
                          className="absolute w-7 h-7 rounded-full bg-gradient-to-br from-red-500 via-red-600 to-rose-700 z-20"
                          style={{
                            left: `calc(50% + ${pos.x}px)`,
                            top: `calc(50% + ${pos.y}px)`,
                            filter: 'brightness(1.2) saturate(1.3)'
                          }}
                        />
                      );
                    })}

                    <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.8em] text-zinc-800 font-bold whitespace-nowrap">
                      Neural Sync Field Active
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <p className="text-zinc-500 text-sm text-center">
              Powered by specialized machine intelligence. Built for enterprise performance.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
