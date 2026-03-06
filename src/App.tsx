import { motion, AnimatePresence } from "motion/react";
import VideoPage from "./VideoPage";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { X, Bookmark, Share2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const [selectedImage, setSelectedImage] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'videos'>('home');
  const [collected, setCollected] = useState<Set<number>>(new Set());

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

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add({
      // Desktop
      isDesktop: "(min-width: 768px)",
      // Mobile
      isMobile: "(max-width: 767px)",
    }, (context) => {
      const { isDesktop } = context.conditions as { isDesktop: boolean };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: "main",
          start: "top top",
          end: isDesktop ? "+=250%" : "+=300%", // Much more scrolling for a slower feel
          scrub: 1.5, // Slightly more scrub for smoothness
          pin: true,
          anticipatePin: 1,
        }
      });

      // Responsive zoom parameters - Much slower zoom
      tl.to(textRef.current, {
        scale: isDesktop ? 65 : 400,
        x: isDesktop ? "18%" : "35%",
        y: isDesktop ? "8%" : "0%",
        ease: "power1.inOut",
        duration: 5, // Much longer duration
      }, 0);

      // Hold the video full screen for a while after the zoom
      tl.to({}, { duration: 3 });

      // Final reveal: Fade out the entire mask layer
      tl.to(textRef.current, {
        opacity: 0,
        duration: 1.5, // Slower fade
        ease: "power2.inOut"
      });

      // Shrink video at the end of the first section
      tl.to(videoRef.current, {
        scale: isDesktop ? 0.8 : 0.85,
        borderRadius: isDesktop ? "100px" : "50px",
        duration: 2, // Slower shrink
        ease: "power2.inOut"
      });

      tl.to(".portfolio-text", {
        opacity: 0,
        y: isDesktop ? -60 : -30,
        duration: 5, // Extremely slow fade
        ease: "power2.inOut"
      }, 0.2);

      tl.to(footerRef.current, {
        opacity: 0,
        duration: 1.2,
        ease: "power2.inOut"
      }, 0.2);

      // Horizontal Scroll Section - Circular Carousel Effect
      if (horizontalSectionRef.current && sliderRef.current) {
        const slider = sliderRef.current;
        const items = slider.querySelectorAll(".slider-item");

        const horizontalTl = gsap.timeline({
          scrollTrigger: {
            trigger: horizontalSectionRef.current,
            start: "top top",
            end: () => `+=${slider.scrollWidth + 200}`, // Even less extra scroll
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
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

        // 3D Carousel Effect for each item
        items.forEach((item) => {
          const img = item.querySelector("img");

          // Set initial 3D properties
          gsap.set(item, { transformPerspective: 1000 });

          // The 3D movement: Rotation Y and Z depth
          gsap.fromTo(item,
            {
              rotationY: 45,
              z: -200,
              scale: 0.8,
              opacity: 1, // Full opacity for maximum visibility
              x: 100
            },
            {
              rotationY: -45,
              z: -200,
              scale: 0.8,
              opacity: 1, // Full opacity for maximum visibility
              x: -100,
              scrollTrigger: {
                trigger: item,
                containerAnimation: horizontalTl,
                start: "left right",
                end: "right left",
                scrub: true,
              }
            }
          );

          // Peak state (Center of the screen) - Focus and bring forward
          gsap.to(item, {
            rotationY: 0,
            z: 100,
            scale: 1.15,
            opacity: 1,
            x: 0,
            scrollTrigger: {
              trigger: item,
              containerAnimation: horizontalTl,
              start: "left center+=35%",
              end: "center center",
              scrub: true,
            }
          });

          // Parallax on the image inside the frame
          gsap.fromTo(img,
            { scale: 1.5, x: "-20%" },
            {
              scale: 1.5,
              x: "20%",
              ease: "none",
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
            { label: 'About', page: 'home' as const },
            { label: 'Contact', page: 'home' as const },
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => {
                setCurrentPage(item.page);
                if (item.label === 'Works') {
                  setTimeout(() => {
                    const worksSection = document.getElementById('works');
                    if (worksSection) worksSection.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }
              }}
              className={`text-[11px] uppercase tracking-[0.2em] font-semibold transition-colors duration-300 ${currentPage === item.page && item.label !== 'About' && item.label !== 'Contact'
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
          <div ref={videoRef} className="absolute inset-0 w-full h-full z-0 overflow-hidden">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
            >
              <source src="videos/Walking Girl.dca083e23d7a563ff57e.mp4" type="video/mp4" />
              <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1525-large.mp4" type="video/mp4" />
            </video>
          </div>

          {/* 2. The Masking Layer */}
          <div
            ref={textRef}
            className="absolute inset-0 w-full h-full bg-black flex flex-col items-center justify-center pointer-events-none mix-blend-multiply z-10 origin-[38%_45%]"
          >
            <div className="w-full max-w-[1400px] flex flex-col items-center bg-black">
              <motion.h1
                initial={{ opacity: 0, scale: 1.1, skewX: -10 }}
                animate={{ opacity: 1, scale: 1, skewX: -10 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="font-display text-[18vw] leading-[0.8] uppercase tracking-tighter text-white text-center"
              >
                JackMiller
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
              className="flex gap-16 md:gap-32 px-[15vw] md:px-[20vw] items-center"
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
                  className="slider-item group relative overflow-hidden rounded-3xl bg-zinc-900 shrink-0 aspect-[4/5] h-full cursor-pointer"
                  style={{ pointerEvents: 'auto' }}
                >
                  <img
                    src={`https://picsum.photos/seed/${item.img}/1200/1500`}
                    alt={item.title}
                    className="w-full h-full object-cover scale-125 transition-transform duration-1000 group-hover:scale-[1.3] pointer-events-none"
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
