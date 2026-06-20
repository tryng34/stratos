import React, { useState, useEffect, useRef } from 'react';
import { useTypewriter } from './hooks/useTypewriter';

// Import local assets
import redbullLogo from '@/src/assets/redbull-logo-new.png';
import arQrCode from '@/src/assets/ar-qr-code.png';

export default function StratosLanding() {
  const [activeSection, setActiveSection] = useState<string>('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showButtons, setShowButtons] = useState(false);
  const [copied, setCopied] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Typewriter setup for Red Bull Stratos campaign intro (Page 1)
  const typewriterText = "Rất vui vì bạn đã ghé thăm. Năm 2012, Felix Baumgartner đã nhảy từ rìa vũ trụ để phá vỡ tốc độ âm thanh. Chúng ta cùng khám phá sự kiện này nhé!";
  const { displayed, done } = useTypewriter(typewriterText, 38, 600);

  const videoRef = useRef<HTMLVideoElement>(null);
  const targetTimeRef = useRef<number>(0);
  const [isQrOpen, setIsQrOpen] = useState(false);

  const handleArClick = () => {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
    if (isMobile) {
      window.open("https://player.onirix.com/exp/lNgXVJ?&background=alpha&preview=false&hide_controls=false&ar_button=false", "_blank");
    } else {
      setIsQrOpen(true);
    }
  };

  // Track mouse movement for Page 1 background video scrubbing target
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight) return;
      const video = videoRef.current;
      if (video && !isNaN(video.duration) && video.duration > 0) {
        const percent = e.clientX / window.innerWidth;
        targetTimeRef.current = percent * video.duration;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Smooth video scrubbing loop using requestAnimationFrame and Lerp
  useEffect(() => {
    let animationFrameId: number;

    const updateVideoTime = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && !isNaN(video.duration) && video.duration > 0) {
        const diff = targetTimeRef.current - video.currentTime;
        if (Math.abs(diff) > 0.005) {
          video.currentTime += diff * 0.08;
        }
      }
      animationFrameId = requestAnimationFrame(updateVideoTime);
    };

    animationFrameId = requestAnimationFrame(updateVideoTime);
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Button entrance delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowButtons(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // Track window scroll for fade-out effect on Page 1
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Smooth scroll helper
  const handleScrollTo = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setIsMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText('hello@redbullstratos.com')
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      })
      .catch((err) => {
        console.error('Failed to copy email:', err);
      });
  };

  // Section Observer to track scrolling active page
  useEffect(() => {
    const sections = ['hero', 'labs', 'studio', 'openings'];
    const observers = sections.map((id) => {
      const el = document.getElementById(id);
      if (!el) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        {
          rootMargin: '-20% 0px -60% 0px',
        }
      );

      observer.observe(el);
      return { observer, el };
    });

    return () => {
      observers.forEach((obs) => {
        if (obs) obs.observer.unobserve(obs.el);
      });
    };
  }, []);

  // Calculate Hero opacity based on scroll position
  const heroOpacity = Math.max(0, 1 - scrollY / 500);

  return (
    <div className="relative min-h-screen w-full font-body select-none">
      {/* Background Video */}
      <video
        ref={videoRef}
        className="fixed inset-0 w-full h-full z-0 object-cover object-[70%_center]"
        src="https://res.cloudinary.com/dn3eitc0b/video/upload/q_auto/f_auto/v1781974596/hf_20260530_042513_df96a13b-6155-4f6e-8b93-c9dee66fba08_202606202354_b6mgnu.mp4"
        muted
        playsInline
        preload="auto"
      />

      {/* Navbar (Black text, transparent background, Red Bull Logo on Left) */}
      <nav className="fixed top-0 left-0 w-full z-20 flex justify-between items-center px-5 sm:px-8 py-4 sm:py-5 bg-gradient-to-b from-white/10 to-transparent backdrop-blur-[1px]">
        {/* Red Bull Logo (left) */}
        <button
          onClick={(e) => handleScrollTo(e, 'hero')}
          className="flex items-center cursor-pointer text-left focus:outline-none"
        >
          <img
            src={redbullLogo}
            alt="Red Bull Logo"
            className="h-10 sm:h-12 w-auto object-contain"
          />
        </button>

        {/* Desktop Nav Links (center) */}
        <div className="hidden md:flex items-center text-[23px] text-black font-normal gap-1">
          <button
            onClick={(e) => handleScrollTo(e, 'labs')}
            className={`hover:opacity-100 transition-all cursor-pointer ${activeSection === 'labs' ? 'opacity-100 font-semibold underline underline-offset-4' : 'opacity-40'}`}
          >
            Chỉ số
          </button>
          <span>, </span>
          <button
            onClick={(e) => handleScrollTo(e, 'studio')}
            className={`hover:opacity-100 transition-all cursor-pointer ${activeSection === 'studio' ? 'opacity-100 font-semibold underline underline-offset-4' : 'opacity-40'}`}
          >
            Video
          </button>
          <span>, </span>
          <button
            onClick={(e) => handleScrollTo(e, 'openings')}
            className={`hover:opacity-100 transition-all cursor-pointer ${activeSection === 'openings' ? 'opacity-100 font-semibold underline underline-offset-4' : 'opacity-40'}`}
          >
            KPI
          </button>
        </div>

        {/* Desktop CTA (right) - Removed email button */}
        <div className="hidden md:block w-32" />

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden flex flex-col justify-center items-center gap-[5px] z-20 relative w-8 h-8 focus:outline-none cursor-pointer"
          aria-label="Toggle navigation menu"
        >
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
          <span className={`w-6 h-[2px] bg-black transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
        </button>
      </nav>

      {/* Mobile Overlay Menu */}
      <div
        className={`fixed inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center items-start px-8 gap-8 transition-all duration-300 md:hidden z-10 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={(e) => handleScrollTo(e, 'labs')}
          className={`text-[32px] text-left font-medium text-black hover:opacity-60 transition-opacity cursor-pointer ${activeSection === 'labs' ? 'underline underline-offset-4' : ''}`}
        >
          Chỉ số
        </button>
        <button
          onClick={(e) => handleScrollTo(e, 'studio')}
          className={`text-[32px] text-left font-medium text-black hover:opacity-60 transition-opacity cursor-pointer ${activeSection === 'studio' ? 'underline underline-offset-4' : ''}`}
        >
          Video
        </button>
        <button
          onClick={(e) => handleScrollTo(e, 'openings')}
          className={`text-[32px] text-left font-medium text-black hover:opacity-60 transition-opacity cursor-pointer ${activeSection === 'openings' ? 'underline underline-offset-4' : ''}`}
        >
          KPI
        </button>
      </div>

      {/* Page 1: Hero Section (with Scroll-driven Opacity Fade) */}
      <section
        id="hero"
        className="relative w-full h-screen flex flex-col justify-end pb-12 md:justify-center md:pb-0 px-5 sm:px-8 md:px-10 overflow-hidden z-10 pointer-events-none"
      >
        <div
          className="max-w-xl w-full relative z-10 pointer-events-auto transition-opacity duration-75 ease-out"
          style={{ opacity: heroOpacity }}
        >
          {/* Blurred intro label */}
          <div
            className="pointer-events-none select-none mb-5 sm:mb-6 text-black font-normal"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.3,
              filter: 'blur(4px)',
            }}
          >
            Chào bạn, hãy cùng tìm hiểu về Red Bull Stratos,<br />Một sứ mệnh lịch sử chạm đến rìa không gian đã định nghĩa lại ngành PR.
          </div>

          {/* Typewriter text */}
          <p
            className="text-black font-normal mb-5 sm:mb-6"
            style={{
              fontSize: 'clamp(18px, 4vw, 26px)',
              lineHeight: 1.35,
              minHeight: '54px',
            }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-[2px] h-[1.1em] bg-black align-middle ml-[2px] animate-blink" />
            )}
          </p>

          {/* Campaign slogan */}
          <div
            className={`text-white font-extrabold mb-6 text-[20px] sm:text-[25px] tracking-wide uppercase transition-all duration-700 ${
              done ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            Chiến dịch Redbull Stratos
          </div>

          {/* Action pill buttons */}
          <div
            className={`flex flex-wrap gap-y-1 transition-all duration-400 ease-out ${
              showButtons ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-[8px]'
            }`}
          >
            <button
              onClick={(e) => handleScrollTo(e, 'labs')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Khám phá các số liệu
            </button>
            <button
              onClick={(e) => handleScrollTo(e, 'studio')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Xem video cú nhảy
            </button>
            <button
              onClick={(e) => handleScrollTo(e, 'openings')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Xem báo cáo KPI
            </button>
            <button
              onClick={(e) => handleScrollTo(e, 'labs')}
              className="inline-flex items-center justify-center bg-white text-black border border-black/10 rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-black hover:text-white transition-colors duration-200 cursor-pointer focus:outline-none"
            >
              Xem cách vận hành
            </button>
            
            <button
              onClick={handleArClick}
              className="inline-flex items-center justify-center bg-[#ef4444] text-white border border-[#ef4444] rounded-full text-[13px] sm:text-[15px] px-4 sm:px-5 py-[0.3em] mx-[0.2em] mb-[0.4em] whitespace-nowrap hover:bg-[#dc2626] transition-colors duration-200 cursor-pointer focus:outline-none gap-2 font-semibold"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="mt-[1px]">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <rect x="7" y="7" width="3" height="3"></rect>
                <rect x="14" y="7" width="3" height="3"></rect>
                <rect x="7" y="14" width="3" height="3"></rect>
                <rect x="14" y="14" width="3" height="3"></rect>
              </svg>
              Trải nghiệm AR
            </button>
          </div>
        </div>
      </section>

      {/* Page 2: Labs - Stratos Stats (NHỮNG CON SỐ KHÔNG TƯỞNG) - Transparent & Black text */}
      <section
        id="labs"
        className="relative z-10 w-full min-h-screen bg-white/30 backdrop-blur-md border-t border-black/10 py-24 md:py-32 flex flex-col justify-center text-black shadow-sm"
      >
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center md:text-left">
            <h3 className="font-heading text-[#ff002b] text-[18px] sm:text-[22px] tracking-[0.2em] uppercase font-bold mb-3">
              CHỈ SỐ SỨ MỆNH
            </h3>
            <h2 className="font-heading text-4xl sm:text-5xl tracking-tight text-black mb-4">
              NHỮNG CON SỐ KHÔNG TƯỞNG
            </h2>
            <p className="text-[15px] sm:text-[17px] text-black/75 max-w-2xl font-normal leading-relaxed">
              Một cú nhảy từ rìa không gian. Một hành trình phá vỡ mọi giới hạn của con người.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 items-center gap-12">
            {/* Left Column Stats */}
            <div className="flex flex-col gap-8 order-2 lg:order-1">
              {/* Stat 1: Độ cao tối đa */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">ĐỘ CAO TỐI ĐA</span>
                  <span className="font-heading text-3xl font-extrabold text-black block mt-1">38.969 m</span>
                </div>
              </div>

              {/* Stat 2: Tốc độ tối đa */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 6v6l4 2"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">TỐC ĐỘ TỐI ĐA</span>
                  <span className="font-heading text-3xl font-extrabold text-black block mt-1">1.357 km/h</span>
                </div>
              </div>

              {/* Stat 3: Vị trí */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path>
                    <path d="M2 12h20"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">VỊ TRÍ</span>
                  <span className="font-heading text-[18px] sm:text-[20px] font-bold text-black block mt-1">TẦNG BÌNH LƯU</span>
                  <span className="font-mono text-[10px] text-black/50 block">(STRATOSPHERE)</span>
                </div>
              </div>
            </div>

            {/* Center Capsule 3D Model (Onirix WebAR) */}
            <div className="flex justify-center items-center order-1 lg:order-2 w-full">
              <div className="relative w-full aspect-square flex items-center justify-center max-w-[480px] h-[480px] md:h-[480px] px-4 border border-black/10 rounded-2xl bg-white/20 backdrop-blur-md shadow-lg overflow-hidden">
                <iframe
                  id="visor"
                  src="https://player.onirix.com/exp/lNgXVJ?&background=alpha&preview=false&hide_controls=false&ar_button=false"
                  title="Red Bull Stratos Capsule 3D Model"
                  allow="web-share;camera;gyroscope;accelerometer;magnetometer;autoplay;fullscreen;xr-spatial-tracking;geolocation;"
                  className="w-full h-full bg-transparent"
                  style={{ border: 'none' }}
                ></iframe>
              </div>
            </div>

            {/* Right Column Stats */}
            <div className="flex flex-col gap-8 order-3">
              {/* Stat 4: Vận tốc Mach */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m5 3 4 4-4 4"></path>
                    <path d="m19 17-4-4 4-4"></path>
                    <path d="m12 5 4 4-4 4"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">VẬN TỐC CHI TIẾT</span>
                  <span className="font-heading text-3xl font-extrabold text-black block mt-1">Mach 1.25</span>
                </div>
              </div>

              {/* Stat 5: Thời gian rơi tự do */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0"></path>
                    <path d="M12 7v5l3 3"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">THỜI GIAN RƠI TỰ DO</span>
                  <span className="font-heading text-3xl font-extrabold text-black block mt-1">4 phút 20 giây</span>
                </div>
              </div>

              {/* Stat 6: Độ cao mở dù */}
              <div className="bg-white/45 border border-black/10 p-6 rounded-2xl flex items-start gap-4 hover:bg-white/70 transition-all shadow-sm">
                <div className="p-3 bg-red-600/5 text-red-600 rounded-lg mt-1">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20"></path>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </div>
                <div>
                  <span className="font-mono text-xs text-black/40 uppercase tracking-widest font-semibold">ĐỘ CAO MỞ DÙ</span>
                  <span className="font-heading text-3xl font-extrabold text-black block mt-1">1.585 m</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 3: Studio - YouTube Video Section - Transparent & Black text */}
      <section
        id="studio"
        className="relative z-10 w-full min-h-screen bg-white/30 backdrop-blur-md border-t border-black/10 py-24 md:py-32 flex flex-col justify-center text-black shadow-sm"
      >
        <div className="w-full max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-red-500 font-semibold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
              VIDEO SỰ KIỆN
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-tight text-black mt-4 mb-4">
              Cú Nhảy Từ Rìa Vũ Trụ
            </h2>
            <p className="text-[16px] sm:text-[18px] text-black/70 max-w-xl mx-auto font-normal">
              Xem lại khoảnh khắc lịch sử khi Felix Baumgartner lao mình từ cabin capsule và vượt qua bức tường âm thanh.
            </p>
          </div>

          <div className="w-full aspect-video bg-black/5 border border-black/10 rounded-3xl overflow-hidden shadow-2xl shadow-black/5 relative">
            <iframe
              width="100%"
              height="100%"
              src="https://www.youtube.com/embed/Hz2F_S3Tl0Y"
              title="Red Bull Stratos Official Jump Video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            ></iframe>
          </div>
        </div>
      </section>

      {/* Page 4: Openings - KPI Dashboard Section - Transparent & Black text */}
      <section
        id="openings"
        className="relative z-10 w-full min-h-screen bg-white/35 backdrop-blur-md border-t border-black/10 py-24 md:py-32 flex flex-col justify-center text-black shadow-sm"
      >
        <div className="w-full max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="font-mono text-xs text-red-500 font-semibold uppercase tracking-widest bg-red-500/10 px-3 py-1 rounded-full">
              BÁO CÁO KẾT QUẢ CHIẾN DỊCH (2012)
            </span>
            <h2 className="font-heading text-3xl sm:text-5xl tracking-tight text-black mt-4 mb-4">
              Tóm Tắt Chỉ Số KPI Đạt Được
            </h2>
            <p className="text-[16px] sm:text-[18px] text-black/70 max-w-xl mx-auto font-normal">
              Báo cáo chi tiết về hiệu quả truyền thông tích hợp PR và kết quả kinh doanh của Red Bull Stratos.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* PR Efficiency Column */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <h3 className="font-heading text-xl sm:text-2xl text-black font-semibold flex items-center gap-3 border-b border-black/10 pb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5">
                  <path d="M2 16.1A5 5 0 0 1 5.9 20M2 12.05A9 9 0 0 1 9.95 20M2 8V2M2 2h6M2 2l7.5 7.5"></path>
                </svg>
                HIỆU QUẢ TRUYỀN THÔNG
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">8M+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Xem đồng thời trên YouTube</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Kỷ lục phát trực tuyến đồng thời cao nhất lúc bấy giờ.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">52M+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Lượt xem ngày diễn ra sự kiện</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Tổng lượt xem livestream cú nhảy ngày 14/10/2012.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">50+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Quốc gia tiếp sóng trực tiếp</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Phát sóng truyền hình trực tiếp trên TV & digital toàn cầu.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">3B+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Lượt hiển thị truyền thông toàn cầu</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Tin tức lan tỏa rộng khắp hàng nghìn kênh báo chí.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">61.6M</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Trusted Impressions (Earned Media)</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Hiển thị từ các nguồn báo chí uy tín theo báo cáo của Red Bull.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">2M+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Hành động tương tác</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Bao gồm like, share, comment, retweet trên các nền tảng.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">~1M</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Người tham gia thảo luận MXH</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Trao đổi thảo luận sôi nổi trên Facebook, Twitter, Reddit, YouTube.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                  <span className="text-red-500 font-mono font-bold text-2xl">2M+</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Người theo dõi mới</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Tăng thêm trên các kênh của Red Bull trong 15 ngày sau sự kiện.</p>
                </div>
                <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm sm:col-span-2">
                  <span className="text-red-500 font-mono font-bold text-2xl">82%</span>
                  <p className="text-sm font-semibold text-black/90 mt-1">Nội dung mang sắc thái tích cực</p>
                  <p className="text-xs text-black/50 mt-1 leading-relaxed">Phân tích sắc thái cho thấy 82% bình luận, bài đăng mang tính tích cực và ủng hộ chiến dịch.</p>
                </div>
              </div>
            </div>

            {/* Business Efficiency Column */}
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-6">
                <h3 className="font-heading text-xl sm:text-2xl text-black font-semibold flex items-center gap-3 border-b border-black/10 pb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  HIỆU QUẢ KINH DOANH
                </h3>

                <div className="flex flex-col gap-4">
                  <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                    <span className="text-emerald-600 font-mono font-bold text-2xl">5.2B lon</span>
                    <p className="text-sm font-semibold text-black/90 mt-1">Bán ra toàn cầu (năm 2012)</p>
                    <p className="text-xs text-black/50 mt-1 leading-relaxed">Red Bull đã cán mốc bán ra khoảng 5.2 tỷ lon trên toàn thế giới.</p>
                  </div>
                  <div className="bg-white/45 border border-black/10 p-5 rounded-2xl shadow-sm">
                    <span className="text-emerald-600 font-mono font-bold text-2xl">+13%</span>
                    <p className="text-sm font-semibold text-black/90 mt-1">Tăng trưởng doanh số toàn cầu</p>
                    <p className="text-xs text-black/50 mt-1 leading-relaxed">So với năm 2011. Riêng tại thị trường Mỹ, doanh số tăng khoảng 7% sau sự kiện.</p>
                  </div>
                </div>
              </div>

              {/* Overall Significance */}
              <div className="bg-red-600/5 border border-red-500/10 p-6 rounded-2xl mt-auto">
                <h4 className="font-heading text-red-600 font-bold text-sm tracking-widest uppercase mb-2">
                  Ý NGHĨA TỔNG THỂ
                </h4>
                <p className="text-xs sm:text-sm text-black/80 leading-relaxed font-normal">
                  Red Bull Stratos không chỉ tạo ra một sự kiện lịch sử mà còn là một chiến dịch truyền thông tích hợp (PESO) xuất sắc, mang lại hiệu quả vượt trội trên tất cả các phương diện: truyền thông, thương hiệu và kinh doanh.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* QR Code Modal for AR Experience */}
      {isQrOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4">
          <div className="bg-white/80 border border-white/20 backdrop-blur-2xl rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl flex flex-col items-center gap-6 animate-in fade-in zoom-in duration-200">
            <h3 className="font-heading text-xl font-bold text-black">
              Trải nghiệm Tương tác AR
            </h3>
            
            <div className="bg-white p-4 rounded-2xl border border-black/5 shadow-inner">
              <img
                src={arQrCode}
                alt="AR QR Code"
                className="w-48 h-48 object-contain"
              />
            </div>
            
            <p className="text-sm text-black/75 font-normal leading-relaxed">
              QR dẫn đến trải nghiệm tương tác AR
            </p>
            
            <button
              onClick={() => setIsQrOpen(false)}
              className="mt-2 bg-red-600 text-white hover:bg-red-700 font-medium text-sm py-2.5 px-8 rounded-full transition-colors focus:outline-none cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
