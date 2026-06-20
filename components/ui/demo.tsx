"use client"

import React, { useState, useRef, useEffect } from "react"
import { motion, useScroll, useTransform, useInView, AnimatePresence } from "framer-motion"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import astronautSuitUrl from "@/src/assets/astronaut-suit-cutout.png"
import felixFaceUrl from "@/src/assets/felix-face-cutout.png"
import capsuleUrl from "@/src/assets/capsule.png"

// -------------------------------------------------------------
// Animated Counter Component for Section 4
// -------------------------------------------------------------
function Counter({ value, suffix = "", delay = 0 }: { value: number; suffix?: string; delay?: number }) {
  const [displayValue, setDisplayValue] = useState("0")
  const ref = useRef(null)
  const isInView = useInView(ref, { once: false, amount: 0.5 })

  useEffect(() => {
    if (!isInView) {
      setDisplayValue("0")
      return
    }
    const timeout = setTimeout(() => {
      let start = 0
      const duration = 2000 // 2 seconds
      const startTime = performance.now()

      const updateNumber = (now: number) => {
        const elapsed = now - startTime
        const progress = Math.min(elapsed / duration, 1)
        
        // Ease out quadratic
        const easeProgress = progress * (2 - progress)
        const current = Math.floor(easeProgress * value)
        
        setDisplayValue(current.toLocaleString("en-US") + suffix)

        if (progress < 1) {
          requestAnimationFrame(updateNumber)
        }
      }
      requestAnimationFrame(updateNumber)
    }, delay * 1000)

    return () => clearTimeout(timeout)
  }, [value, isInView, suffix, delay])

  return <span ref={ref} className="tabular-nums">{displayValue}</span>
}

export default function DemoOne() {
  const pageRef = useRef<HTMLDivElement>(null)
  
  // Hero reveal states
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const [isHovered, setIsHovered] = useState(false)
  const heroRef = useRef<HTMLDivElement>(null)

  // Track global scroll progress for scroll animations
  const { scrollYProgress } = useScroll({
    target: pageRef,
    offset: ["start start", "end end"]
  })

  // Scroll animations for Section 1 (Hero)
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9])

  // Scroll animations for Section 2 (Capsule Descent)
  const capsuleY = useTransform(scrollYProgress, [0.18, 0.42], [-100, 350])
  const capsuleScale = useTransform(scrollYProgress, [0.18, 0.25, 0.38, 0.45], [0.3, 0.6, 0.6, 0.3])
  const capsuleOpacity = useTransform(scrollYProgress, [0.16, 0.22, 0.38, 0.44], [0, 1, 1, 0])

  // Scroll animations for Section 5 (Conclusion: Capsule shrinking and floating away)
  const conclusionCapsuleScale = useTransform(scrollYProgress, [0.8, 0.98], [0.35, 0.01])
  const conclusionCapsuleY = useTransform(scrollYProgress, [0.8, 0.98], [150, -350])
  const conclusionCapsuleOpacity = useTransform(scrollYProgress, [0.78, 0.84, 0.95, 0.99], [0, 1, 1, 0])

  const handleHeroMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return
    const rect = heroRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    setCoords({ x, y })
  }

  return (
    <div ref={pageRef} className="relative w-full bg-black text-white selection:bg-red-500/30 overflow-x-hidden">
      
      {/* -------------------------------------------------------------
         GLOBAL SPACE BACKGROUND
         Twinkling stars, slow moving nebula clouds, and wavy RGB lines 
         are combined into a single unified high-performance shader.
         ------------------------------------------------------------- */}
      <WebGLShader />

      {/* -------------------------------------------------------------
         SECTION 1 - HERO (Introduce Felix Baumgartner with Mask Reveal)
         ------------------------------------------------------------- */}
      <motion.section 
        ref={heroRef}
        onMouseMove={handleHeroMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative w-full h-screen flex flex-col justify-between items-center z-10 overflow-hidden cursor-crosshair"
      >
        {/* Top Header */}
        <div className="w-full max-w-7xl px-8 pt-8 flex justify-between items-center z-30">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-[#ff002b] animate-pulse shadow-[0_0_8px_#ff002b]"></div>
            <div className="font-sans font-black tracking-widest text-sm leading-none">
              RED BULL <br/>
              <span className="text-[#ff002b] font-extrabold text-[9px] tracking-[0.25em] block mt-0.5">STRATOS</span>
            </div>
          </div>
          <div className="font-mono text-[9px] text-white/40 tracking-[0.2em] uppercase border border-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
            MISSION LAUNCH HUB
          </div>
        </div>

        {/* Center: Hero Layout */}
        <div className="relative w-full h-[60vh] flex items-center justify-center">
          
          {/* Background Typography (Behind the Astronaut Cutouts) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none select-none font-sans font-black text-center">
            <h1 className="text-[clamp(4rem,15vw,12rem)] leading-none text-white/5 tracking-tighter uppercase">
              RED BULL
            </h1>
            <h2 className="font-brush text-[clamp(5rem,18vw,14rem)] text-[#ff002b]/15 leading-none -mt-4 md:-mt-10 tracking-wide rotate-[-3deg]">
              Stratos
            </h2>
          </div>

          {/* Foreground Cutout Layer 1: Astronaut Suit (Standing Still) */}
          <div className="absolute inset-0 w-full h-full z-20 flex justify-center items-center pointer-events-none">
            <img 
              src={astronautSuitUrl} 
              alt="Astronaut Suit Cutout"
              className="w-full h-full max-h-[85vh] object-contain drop-shadow-[0_10px_30px_rgba(255,255,255,0.05)]"
            />
          </div>

          {/* Foreground Cutout Layer 2: Felix Portrait (Visor Mask Reveal) */}
          {/* Using CSS Mask with radial gradient to create a flashlight reveal */}
          <div 
            className="absolute inset-0 w-full h-full z-22 flex justify-center items-center pointer-events-none transition-opacity duration-300"
            style={{
              opacity: isHovered ? 1 : 0,
              maskImage: isHovered 
                ? `radial-gradient(circle 90px at ${coords.x}px ${coords.y}px, black 0%, black 75%, transparent 100%)`
                : `radial-gradient(circle 0px at 0px 0px, black 100%, transparent 100%)`,
              WebkitMaskImage: isHovered 
                ? `radial-gradient(circle 90px at ${coords.x}px ${coords.y}px, black 0%, black 75%, transparent 100%)`
                : `radial-gradient(circle 0px at 0px 0px, black 100%, transparent 100%)`,
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat"
            }}
          >
            <img 
              src={felixFaceUrl} 
              alt="Felix Portrait Cutout"
              className="w-full h-full max-h-[85vh] object-contain"
            />
          </div>

          {/* Flashlight HUD Ring overlay */}
          {isHovered && (
            <div 
              className="absolute pointer-events-none rounded-full border border-red-500/40 bg-red-500/[0.03] shadow-[0_0_25px_rgba(255,0,43,0.3)] z-30 mix-blend-screen"
              style={{
                width: '180px',
                height: '180px',
                left: `${coords.x - 90}px`,
                top: `${coords.y - 90}px`,
                transition: 'none'
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-5 h-[1px] bg-red-500/40"></div>
                <div className="h-5 w-[1px] bg-red-500/40"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-red-500/60 animate-pulse"></div>
              </div>
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 font-mono text-[8px] text-red-500 tracking-widest whitespace-nowrap bg-black/80 border border-red-500/20 px-1.5 py-0.5 rounded shadow-[0_0_10px_rgba(255,0,43,0.15)]">
                VISOR UNLOCKED
              </span>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="w-full flex flex-col items-center gap-4 pb-8 z-30 pointer-events-auto">
          <div className="font-sans font-bold text-sm tracking-[0.4em] text-white/50 uppercase">
            RED BULL GIVES YOU <span className="text-[#ff002b] font-black drop-shadow-[0_0_10px_rgba(255,0,43,0.4)]">WINGS</span>
          </div>
          <div className="flex flex-col items-center gap-1 font-mono text-[9px] text-white/30 tracking-[0.25em]">
            <span>SCROLL TO DESCEND</span>
            <div className="w-[1px] h-6 bg-white/20 animate-bounce mt-1"></div>
          </div>
        </div>

        {/* Cinematic HUD Instructions (Overlay) */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-red-950/40 backdrop-blur-md border border-red-500/20 px-4 py-1 rounded-full text-[9px] text-[#ff002b] font-mono tracking-widest pointer-events-none shadow-[0_0_10px_rgba(255,0,43,0.1)]">
          HOVER VISOR TO SCAN PILOT LOGS
        </div>
      </motion.section>


      {/* -------------------------------------------------------------
         SECTION 2 - THE MISSION (Telemetry cards & Descending Capsule)
         ------------------------------------------------------------- */}
      <section className="relative w-full h-screen flex items-center justify-center z-20">
        
        {/* Descending & Rotating Capsule Container */}
        {/* Animated via Framer Motion useTransform (capsuleY and capsuleScale mapped to scroll) */}
        <motion.div 
          style={{ 
            y: capsuleY, 
            scale: capsuleScale, 
            opacity: capsuleOpacity,
          }}
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 90, ease: "linear" }}
          className="absolute z-20 w-[450px] h-[450px] pointer-events-none flex items-center justify-center"
        >
          <img 
            src={capsuleUrl} 
            alt="Rotating Stratos Capsule"
            className="w-full h-full object-contain filter drop-shadow-[0_15px_50px_rgba(6,182,212,0.15)]"
          />
        </motion.div>

        {/* Floating Telemetry Cards (Grid surrounding capsule) */}
        <div className="relative w-full max-w-6xl px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 z-30 pointer-events-none">
          
          {/* Card 1: Altitude */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between h-40 transform hover:border-cyan-500/50 transition-all pointer-events-auto">
            <span className="font-mono text-[9px] text-cyan-400 tracking-widest">// ALTITUDE</span>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white tracking-tight">38,969 M</span>
              <span className="text-xs text-white/50 mt-1">Maximum Ascent Peak</span>
            </div>
          </div>

          {/* Spacer for center capsule */}
          <div className="hidden lg:block h-40"></div>

          {/* Card 2: Speed */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between h-40 transform hover:border-[#ff002b]/50 transition-all pointer-events-auto">
            <span className="font-mono text-[9px] text-[#ff002b] tracking-widest">// VELOCITY</span>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white tracking-tight">1,357 KM/H</span>
              <span className="text-xs text-white/50 mt-1">Maximum Speed // Mach 1.25</span>
            </div>
          </div>

          {/* Card 3: Freefall */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between h-40 transform hover:border-white/20 transition-all pointer-events-auto">
            <span className="font-mono text-[9px] text-white/40 tracking-widest">// FREEFALL ELAPSED</span>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white tracking-tight">4M 20S</span>
              <span className="text-xs text-white/50 mt-1">Total Freefall Time</span>
            </div>
          </div>

          {/* Spacer for center capsule */}
          <div className="hidden lg:block h-40"></div>

          {/* Card 4: Chute Deployment */}
          <div className="bg-black/60 border border-white/10 backdrop-blur-md p-6 rounded-xl flex flex-col justify-between h-40 transform hover:border-white/20 transition-all pointer-events-auto">
            <span className="font-mono text-[9px] text-white/40 tracking-widest">// PARACHUTE DEPLOY</span>
            <div className="flex flex-col">
              <span className="text-4xl font-extrabold text-white tracking-tight">1,585 M</span>
              <span className="text-xs text-white/50 mt-1">Deployment Altitude</span>
            </div>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------------------
         SECTION 3 - THE JUMP (YouTube Embed & Historic Video)
         ------------------------------------------------------------- */}
      <section className="relative w-full min-h-screen py-20 flex flex-col justify-center items-center gap-12 z-20 px-8">
        
        {/* Section Heading */}
        <div className="text-center">
          <span className="font-mono text-[10px] text-[#ff002b] tracking-[0.3em]">// LIVE TELEMETRY STREAM</span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
            THE HISTORIC JUMP
          </h2>
        </div>

        {/* Center: Large YouTube Embed */}
        <div className="w-full max-w-5xl aspect-video rounded-2xl border border-white/15 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.8)] bg-black">
          <iframe 
            src="https://www.youtube.com/embed/dYw4meRWGd4?si=y3yyFef96oM&autoplay=0" 
            title="Red Bull Stratos Jump"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowFullScreen
            className="w-full h-full border-0"
          ></iframe>
        </div>

        {/* Bottom Quote & Stats */}
        <div className="w-full max-w-4xl flex flex-col md:flex-row justify-between items-center gap-8 border-t border-white/10 pt-8">
          {/* Quote */}
          <div className="max-w-md flex flex-col gap-2">
            <p className="text-lg italic text-white/80 leading-relaxed font-sans">
              "I know the whole world is watching now. I wish you could see what I see. Sometimes you have to go up really high to understand how small you are."
            </p>
            <span className="font-mono text-xs text-[#ff002b] tracking-wider">— FELIX BAUMGARTNER</span>
          </div>

          {/* Stats Grid */}
          <div className="flex gap-8 md:gap-12">
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">8M+</span>
              <span className="text-[10px] font-mono text-white/40 tracking-wider">LIVE VIEWERS</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">50+</span>
              <span className="text-[10px] font-mono text-white/40 tracking-wider">COUNTRIES</span>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-black text-white">80+</span>
              <span className="text-[10px] font-mono text-white/40 tracking-wider">TV CHANNELS</span>
            </div>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------------------
         SECTION 4 - IMPACT (Large scroll-triggered number counters)
         ------------------------------------------------------------- */}
      <section className="relative w-full min-h-screen py-24 flex flex-col justify-center items-center gap-16 z-20 px-8">
        
        {/* Section Heading */}
        <div className="text-center">
          <span className="font-mono text-[10px] text-[#ff002b] tracking-[0.3em]">// MEASURED REACH</span>
          <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-tight mt-1">
            CAMPAIGN IMPACT
          </h2>
        </div>

        {/* Sequential KPI Cards */}
        <div className="w-full max-w-4xl flex flex-col gap-12">
          
          {/* KPI 1 */}
          <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between border-b border-white/10 pb-6">
            <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
              <Counter value={8000000} />
            </span>
            <span className="font-mono text-xs text-white/50 tracking-widest mt-2 md:mt-0">
              PEAK CONCURRENT VIEWERS
            </span>
          </div>

          {/* KPI 2 */}
          <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between border-b border-white/10 pb-6">
            <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
              <Counter value={3000000000} suffix="+" />
            </span>
            <span className="font-mono text-xs text-white/50 tracking-widest mt-2 md:mt-0">
              MEDIA IMPRESSIONS
            </span>
          </div>

          {/* KPI 3 */}
          <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between border-b border-white/10 pb-6">
            <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
              <Counter value={1000000000} suffix="+" />
            </span>
            <span className="font-mono text-xs text-white/50 tracking-widest mt-2 md:mt-0">
              VIDEO VIEWS
            </span>
          </div>

          {/* KPI 4 */}
          <div className="flex flex-col md:flex-row items-baseline md:items-center justify-between border-b border-white/10 pb-6">
            <span className="text-5xl md:text-7xl font-extrabold text-white tracking-tighter">
              <Counter value={80} suffix="+" />
            </span>
            <span className="font-mono text-xs text-white/50 tracking-widest mt-2 md:mt-0">
              TV CHANNELS RE-BROADCASTING
            </span>
          </div>
        </div>
      </section>


      {/* -------------------------------------------------------------
         SECTION 5 - CONCLUSION (Shrinking capsule & Emotional Ending)
         ------------------------------------------------------------- */}
      <section className="relative w-full h-screen flex flex-col justify-between items-center z-20 py-16 px-8 overflow-hidden">
        
        {/* Capsule shrinking and fading away into space */}
        <motion.div 
          style={{ 
            scale: conclusionCapsuleScale, 
            y: conclusionCapsuleY,
            opacity: conclusionCapsuleOpacity,
          }}
          className="absolute z-10 w-[450px] h-[450px] pointer-events-none flex items-center justify-center"
        >
          <img 
            src={capsuleUrl} 
            alt="Capsule moving away"
            className="w-full h-full object-contain filter brightness-50"
          />
        </motion.div>

        {/* Empty spacer for space effect */}
        <div></div>

        {/* Center: Emotional Headline */}
        <div className="text-center z-20 max-w-4xl px-4 flex flex-col items-center gap-6">
          <div className="font-mono text-[10px] text-[#ff002b] tracking-[0.3em]">// PR CONCLUSION</div>
          <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase leading-none">
            RED BULL DID NOT BUY ATTENTION. <br/>
            <span className="text-[#ff002b] drop-shadow-[0_0_15px_rgba(255,0,43,0.3)]">IT EARNED IT.</span>
          </h2>
          
          <div className="mt-4">
            <LiquidButton 
              className="text-white border border-white/20 hover:border-cyan-500/50 bg-black/40 backdrop-blur-md font-mono tracking-widest text-[10px] py-3.5 px-10 rounded-full transition-all" 
              size="lg"
            >
              LAUNCH COMPLETE
            </LiquidButton>
          </div>
        </div>

        {/* Footer: Group Info & Metadata */}
        <div className="w-full max-w-7xl border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 z-20 text-white/40 font-mono text-[9px] tracking-wider">
          <div className="flex flex-col gap-1">
            <span className="text-white/60 font-bold">RED BULL STRATOS // CASE STUDY</span>
            <span>PR & CREATIVE COMMUNICATION METHODS</span>
          </div>
          
          <div className="text-center flex flex-col gap-1">
            <span className="text-white/60 font-bold">GROUP 10 PRESENTATION</span>
            <span>University PR Seminar Group</span>
          </div>

          <div className="text-right flex flex-col gap-1">
            <span>BLUEPRINT BY ANTIGRAVITY</span>
            <span>COPYRIGHT © 2026 // ALL RIGHTS RESERVED</span>
          </div>
        </div>
      </section>

    </div>
  )
}
