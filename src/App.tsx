import { motion, AnimatePresence } from "motion/react";
import VideoPage from "./VideoPage";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Bookmark, Share2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const localVideoSrc = `${import.meta.env.BASE_URL}videos/Walking Girl.dca083e23d7a563ff57e.mp4`;
  const fallbackVideoSrc = "https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1525-large.mp4";
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'videos'>('home');
  const [collected, setCollected] = useState<Set<number>>(new Set());
  const [heroVideoSrc, setHeroVideoSrc] = useState(localVideoSrc);

  const toggleCollect = (id: number) => {
    setCollected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const horizontalSectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const mm = gsap.matchMedia();
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    mm.add({
      // Desktop
      isDesktop: "(min-width: 768px)",
      // Mobile
      isMobile: "(max-width: 767px)",
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean };

      gsap.set([textRef.current, videoRef.current, sliderRef.current], { force3D: true });

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: isDesktop ? "+=340%" : "+=380%",
          scrub: 2.4,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          fastScrollEnd: false,
        }
      });

      // Responsive zoom parameters tuned for smoother compositing.
      tl.to(textRef.current, {
        scale: isDesktop ? 40 : 240,
        x: isDesktop ? "18%" : "35%",
        y: isDesktop ? "8%" : "0%",
        duration: 5,
      }, 0);

      // Hold the video full screen briefly after the zoom.
      tl.to({}, { duration: 1.2 });

      // Dissolve the text layer progressively so letters do not linger before disappearing.
      tl.to(textRef.current, {
        opacity: 0,
        filter: "blur(10px)",
        duration: 2.2,
      }, 1.8);

      // Shrink video at the end of the first section
      tl.to(videoRef.current, {
        scale: isDesktop ? 0.8 : 0.85,
        borderRadius: isDesktop ? "100px" : "50px",
        duration: 1.8,
      });

      tl.to(".portfolio-text", {
        opacity: 0,
        y: isDesktop ? -60 : -30,
        duration: 3.5,
      }, 0.2);

      tl.to(footerRef.current, {
        opacity: 0,
        duration: 1.2,
      }, 0.2);

      // Horizontal Scroll Section - Circular Carousel Effect
      if (horizontalSectionRef.current && sliderRef.current) {
        const slider = sliderRef.current;
        const items = slider.querySelectorAll(".slider-item");

        const horizontalTl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: horizontalSectionRef.current,
            start: "top top",
            end: () => `+=${slider.scrollWidth + 120}`,
            pin: true,
            scrub: true,
            invalidateOnRefresh: true,
            fastScrollEnd: true,
          }
        });

        // Initial delay for the header
        horizontalTl.to({}, { duration: 0.5 });

        // Horizontal movement of the slider
        horizontalTl.to(slider, {
          x: () => {
            const totalWidth = slider.scrollWidth;
            const windowWidth = window.innerWidth;
            return -(totalWidth - windowWidth + (windowWidth * 0.2));
          },
          ease: "none",
        });

        // 3D carousel effect tuned to reduce per-frame transform cost.
        items.forEach((item) => {
          gsap.set(item, { transformPerspective: 800, force3D: true });
          gsap.fromTo(item,
            {
              rotationY: 24,
              z: -100,
              scale: 0.92,
              x: 60
            },
            {
              rotationY: -24,
              z: -100,
              scale: 0.92,
              x: -60,
              scrollTrigger: {
                trigger: item,
                containerAnimation: horizontalTl,
                start: "left right",
                end: "right left",
                scrub: true,
              }
            }
          );
        });

        // Header reveal
        gsap.from(".reveal-text", {
          opacity: 0,
          y: 40,
          duration: 1.2,
          scrollTrigger: {
            trigger: horizontalSectionRef.current,
            start: "top 80%",
            toggleActions: "play none none reverse"
          }
        });
      }

      return () => { };
    });

    return () => mm.revert();
  }, []);

  useEffect(() => {
    // Refresh ScrollTrigger after a short delay to ensure all elements are rendered
    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentPage === "videos") {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
    return;
  }, [currentPage]);

  useEffect(() => {
    if (currentPage !== "home") return;

    // Ensure hero state is consistent when returning from overlays/pages.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    gsap.set(textRef.current, { clearProps: "transform,opacity,filter" });
    gsap.set(videoRef.current, { clearProps: "transform,borderRadius" });
    gsap.set(".portfolio-text", { clearProps: "transform,opacity" });
    gsap.set(footerRef.current, { clearProps: "opacity" });
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, [currentPage]);

  useEffect(() => {
    const MAX_STEP = 46;
    const SPEED_MULTIPLIER = 0.85;

    const canScrollElement = (el: HTMLElement, deltaY: number) => {
      const canScroll = el.scrollHeight > el.clientHeight;
      if (!canScroll) return false;
      if (deltaY > 0) return el.scrollTop + el.clientHeight < el.scrollHeight - 1;
      if (deltaY < 0) return el.scrollTop > 0;
      return false;
    };

    const findScrollableAncestor = (target: EventTarget | null, deltaY: number) => {
      let node = target instanceof HTMLElement ? target : null;
      while (node && node !== document.body) {
        const style = window.getComputedStyle(node);
        const overflowY = style.overflowY;
        const isScrollable = overflowY === "auto" || overflowY === "scroll";
        if (isScrollable && canScrollElement(node, deltaY)) return node;
        node = node.parentElement;
      }
      return null;
    };

    const normalizeDelta = (event: WheelEvent) => {
      // deltaMode: 0=pixel, 1=line, 2=page
      if (event.deltaMode === 1) return event.deltaY * 16;
      if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
      return event.deltaY;
    };

    const onWheel = (event: WheelEvent) => {
      if (currentPage !== "home") return;
      if (event.ctrlKey || event.metaKey) return;

      const rawDelta = normalizeDelta(event);
      const scrollableAncestor = findScrollableAncestor(event.target, rawDelta);
      if (scrollableAncestor) return;

      event.preventDefault();
      const capped = Math.max(-MAX_STEP, Math.min(MAX_STEP, rawDelta * SPEED_MULTIPLIER));
      window.scrollBy({ top: capped, left: 0, behavior: "auto" });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, [currentPage]);

  return (
    <div className="relative w-full bg-black min-h-screen">
      {/* Navigation Menu - Fixed and Topmost */}
      <nav className="fixed top-12 left-12 right-12 flex justify-between items-start z-[200] pointer-events-none">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex gap-8 md:gap-12 pointer-events-auto"
        >
          {[
            { label: 'Home', page: 'home' as const },
            { label: 'Videos', page: 'videos' as const },
            { label: 'Photos', page: 'home' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setCurrentPage(item.page);
                if (item.label === 'Photos') {
                  setTimeout(() => {
                    const worksSection = document.getElementById('works');
                    if (worksSection) worksSection.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-300 ${currentPage === item.page && item.label !== 'Photos'
                ? 'text-white'
                : 'text-white/50 hover:text-white'
                }`}
            >
              {item.label}
            </button>
          ))}
        </motion.div>
      </nav>

      {/* Video Page Overlay */}
      <AnimatePresence>
        {currentPage === 'videos' && (
          <motion.div
            key="videos-overlay"
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="fixed inset-0 z-[150] overflow-y-auto bg-black"
          >
            <VideoPage />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Home page — always mounted to keep GSAP state intact */}
      <motion.div
        key="home-view"
        initial={{ opacity: 0 }}
        animate={{
          opacity: currentPage === 'home' ? 1 : 0,
          pointerEvents: currentPage === 'home' ? 'auto' : 'none',
          visibility: currentPage === 'home' ? 'visible' : 'hidden'
        }}
        transition={{ duration: 0.5 }}
        className="relative z-0"
      >
        <main className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden">
          {/* 1. The Video Layer */}
          <div ref={videoRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden will-change-transform">
            <video
              src={heroVideoSrc}
              autoPlay
              muted
              loop
              playsInline
              onError={() => {
                if (heroVideoSrc !== fallbackVideoSrc) setHeroVideoSrc(fallbackVideoSrc);
              }}
              className="w-full h-full object-cover"
            />
          </div>

          {/* 2. The Masking Layer */}
          <div
            ref={textRef}
            className="absolute inset-0 w-full h-full bg-black/20 flex flex-col items-center justify-center pointer-events-none z-10 origin-[38%_45%] will-change-transform"
          >
            <div className="w-full max-w-[1400px] flex flex-col items-center bg-black">
              <motion.h1
                initial={{ opacity: 0, scale: 1.1, skewX: -10 }}
                animate={{ opacity: 1, scale: 1, skewX: -10 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-[18vw] leading-[0.8] uppercase tracking-tighter text-white text-center"
              >
                Jack Miller
              </motion.h1>

              <div className="portfolio-text mt-[10px]">
                <motion.h2
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-[12vw] leading-[0.8] uppercase tracking-tighter text-white text-center"
                >
                  Portfolio
                </motion.h2>
              </div>
            </div>
          </div>

          {/* 3. The UI Layer */}
          <div className="absolute inset-0 pointer-events-none z-20">
            <motion.div
              ref={footerRef}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1 }}
              className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row justify-between items-center gap-8 pointer-events-auto"
            >
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-[0.3em] text-white/40 font-semibold">Available for</span>
                <span className="text-xs font-light text-white/80">Select Projects 2026</span>
              </div>

              <motion.div
                className="flex flex-col items-center gap-2 pointer-events-none"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="text-[10px] uppercase tracking-[0.4em] text-white/50 font-semibold">Scroll Down</span>
                <svg width="20" height="28" viewBox="0 0 20 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="1" y="1" width="18" height="26" rx="9" stroke="white" strokeOpacity="0.3" strokeWidth="1.5" />
                  <motion.rect
                    x="8.5" y="5" width="3" height="7" rx="1.5" fill="white" fillOpacity="0.6"
                    animate={{ y: [0, 8, 0], opacity: [0.6, 0.1, 0.6] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                  />
                </svg>
              </motion.div>
            </motion.div>
          </div>
        </main>

        {/* Gallery Section */}
        <section ref={horizontalSectionRef} id="works" className="relative z-[50] h-screen bg-black overflow-hidden flex flex-col">
          <div className="pt-24 pb-12 px-6 md:px-12 relative z-30 bg-black">
            <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-end gap-8">
              <div className="reveal-text">
                <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold mb-4 block">
                  Selected Works
                </span>
                <h2 className="font-display text-5xl md:text-7xl text-white uppercase tracking-tighter leading-[0.9]">
                  Visual <br /> Narrative
                </h2>
              </div>
              <div className="max-w-xs text-right hidden md:block">
                <p className="text-white/50 text-sm font-light leading-relaxed mb-4">
                  A curated selection of photography exploring the intersection of light, form, and human emotion.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <div className="w-8 h-[1px] bg-white/20"></div>
                  <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-semibold italic">01 — 06</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 relative flex items-center overflow-visible perspective-1000">
            <div
              ref={sliderRef}
              className="flex gap-16 md:gap-32 px-[15vw] md:px-[20vw] items-center will-change-transform"
              style={{ width: "max-content", height: "65vh", transformStyle: "preserve-3d" }}
            >
              {[
                { id: 1, title: "Urban Geometry", series: "01", img: "arch1" },
                { id: 2, title: "Silent Portraits", series: "02", img: "portrait1" },
                { id: 3, title: "Organic Forms", series: "03", img: "nature1" },
                { id: 4, title: "Ethereal Horizons", series: "04", img: "landscape1" },
                { id: 5, title: "Night Shadows", series: "05", img: "city1" },
                { id: 6, title: "Minimalist Lines", series: "06", img: "arch2" },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImage(item);
                  }}
                  className="slider-item group relative overflow-hidden rounded-3xl bg-zinc-900 shrink-0 aspect-[4/5] h-full cursor-pointer will-change-transform"
                  style={{ pointerEvents: 'auto' }}
                >
                  <img
                    src={`https://picsum.photos/seed/${item.img}/1200/1500`}
                    alt={item.title}
                    className="w-full h-full object-cover scale-125 transition-transform duration-1000 group-hover:scale-[1.3] pointer-events-none will-change-transform"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/60 mb-2">{item.series} / Series</span>
                    <h3 className="text-xl text-white uppercase tracking-tight font-medium">{item.title}</h3>
                  </div>
                  <div className="absolute top-6 left-6 mix-blend-difference">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{item.series}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pb-12 px-6 md:px-12 bg-black">
            <div className="max-w-[1400px] mx-auto flex justify-between items-center">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 text-[10px] font-mono">
                  ↓
                </div>
              </div>
              <div className="w-48 md:w-64 h-[1px] bg-white/10 relative overflow-hidden">
                <div className="absolute top-0 left-0 h-full bg-white/60 w-1/3" />
              </div>
            </div>
          </div>
        </section>
      </motion.div>

      {/* Lightbox - Topmost Layer */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            key="lightbox-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-12"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-[90vw] h-[85vh] flex flex-col md:flex-row gap-12 items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-20 right-0 md:-top-12 md:-right-12 z-10 flex flex-col items-center gap-2 group"
              >
                <div className="w-16 h-16 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-2xl">
                  <X size={32} className="group-hover:rotate-90 transition-transform duration-300" />
                </div>
                <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold group-hover:text-white transition-colors">Close</span>
              </button>

              <div className="w-full h-full md:flex-[2] rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5">
                <img
                  src={`https://picsum.photos/seed/${selectedImage.img}/2000/2500`}
                  alt={selectedImage.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="w-full md:w-[400px] flex flex-col gap-10 md:h-full justify-center">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.5em] text-white/40 font-bold mb-4 block">
                    Series {selectedImage.series}
                  </span>
                  <h2 className="text-4xl md:text-5xl font-display text-white uppercase tracking-tighter leading-none mb-6">
                    {selectedImage.title}
                  </h2>
                  <p className="text-white/60 text-sm font-light leading-relaxed">
                    Captured during the peak of the golden hour, this series explores the relationship between architectural geometry and the softening effect of natural light.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <button
                    onClick={() => toggleCollect(selectedImage.id)}
                    className={`w-full py-4 rounded-full flex items-center justify-center gap-3 transition-all duration-500 border ${collected.has(selectedImage.id)
                      ? 'bg-white text-black border-white'
                      : 'bg-transparent text-white border-white/20 hover:border-white'
                      }`}
                  >
                    <Bookmark size={18} fill={collected.has(selectedImage.id) ? "currentColor" : "none"} />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">
                      {collected.has(selectedImage.id) ? 'Collected' : 'Collect this Piece'}
                    </span>
                  </button>

                  <button className="w-full py-4 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-transparent transition-all flex items-center justify-center gap-3">
                    <Share2 size={18} />
                    <span className="text-[11px] uppercase tracking-[0.2em] font-bold">Share Work</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
