import { motion, AnimatePresence } from "motion/react";
import React, { useRef, useState } from "react";
import { X, Play, Volume2, VolumeX } from "lucide-react";

const localVideoSrc = `${import.meta.env.BASE_URL}videos/Walking Girl.dca083e23d7a563ff57e.mp4`;

const videos = [
    {
        id: 1,
        title: "Walking Girl",
        series: "01",
        category: "Cinematic",
        duration: "0:42",
        year: "2025",
        description:
            "A quiet study in solitary motion — capturing stillness in movement through dusk-lit atmosphere.",
        src: localVideoSrc,
        thumb: null,
        local: true,
    },
    {
        id: 2,
        title: "Coastal Reverie",
        series: "02",
        category: "Landscape",
        duration: "1:12",
        year: "2025",
        description:
            "Waves meeting shore in slow time — an exploration of rhythm and light at the edge of the world.",
        src: "https://assets.mixkit.co/videos/preview/mixkit-waves-coming-to-the-beach-5016-large.mp4",
        thumb: null,
        local: false,
    },
    {
        id: 3,
        title: "Urban Pulse",
        series: "03",
        category: "Street",
        duration: "0:58",
        year: "2025",
        description:
            "City breath — the unrelenting energy of a metropolis distilled into motion and shadow.",
        src: "https://assets.mixkit.co/videos/preview/mixkit-city-traffic-on-a-busy-street-at-night-3443-large.mp4",
        thumb: null,
        local: false,
    },
    {
        id: 4,
        title: "Golden Hour",
        series: "04",
        category: "Nature",
        duration: "1:30",
        year: "2024",
        description:
            "The final minutes of light before dark — warmth bleeding across the landscape in slow dissolution.",
        src: "https://assets.mixkit.co/videos/preview/mixkit-tree-with-yellow-flowers-1173-large.mp4",
        thumb: null,
        local: false,
    },
    {
        id: 5,
        title: "Still Water",
        series: "05",
        category: "Cinematic",
        duration: "2:04",
        year: "2024",
        description:
            "Reflections on surface and depth — the world mirrored and distorted in quiet water.",
        src: "https://assets.mixkit.co/videos/preview/mixkit-lake-and-mountains-surrounded-by-fog-1852-large.mp4",
        thumb: null,
        local: false,
    },
    {
        id: 6,
        title: "Night Drive",
        series: "06",
        category: "Street",
        duration: "1:47",
        year: "2024",
        description:
            "Streaks of neon against wet asphalt — speed and solitude in the hours between midnight and dawn.",
        src: "https://assets.mixkit.co/videos/preview/mixkit-driving-on-a-highway-with-the-lights-of-a-car-at-night-2642-large.mp4",
        thumb: null,
        local: false,
    },
];

interface VideoCardProps {
    video: (typeof videos)[0];
    onClick: () => void;
    index: number;
}

const VideoCard: React.FC<VideoCardProps> = ({ video, onClick, index }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseEnter = () => {
        setIsHovered(true);
        if (videoRef.current) {
            videoRef.current.currentTime = 0;
            videoRef.current.play().catch(() => { });
        }
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        if (videoRef.current) {
            videoRef.current.pause();
            videoRef.current.currentTime = 0;
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="group cursor-pointer"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={onClick}
        >
            {/* Thumbnail / Video Preview */}
            <div className="relative overflow-hidden rounded-2xl bg-zinc-900 aspect-video mb-5">
                <video
                    ref={videoRef}
                    src={video.src}
                    muted
                    loop
                    playsInline
                    preload="none"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Dark overlay */}
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500" />

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <motion.div
                        animate={{ scale: isHovered ? 1.1 : 1, opacity: isHovered ? 1 : 0.7 }}
                        transition={{ duration: 0.3 }}
                        className="w-14 h-14 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:bg-white/20 transition-colors"
                    >
                        <Play size={20} className="text-white ml-1" fill="white" />
                    </motion.div>
                </div>

                {/* Duration badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1">
                    <span className="text-[10px] text-white/80 font-mono tracking-widest">{video.duration}</span>
                </div>

                {/* Series number */}
                <div className="absolute top-4 left-4">
                    <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{video.series}</span>
                </div>

                {/* Category pill */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] uppercase tracking-[0.2em] text-white/80 font-semibold">{video.category}</span>
                </div>
            </div>

            {/* Info */}
            <div className="flex justify-between items-start px-1">
                <div>
                    <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-semibold block mb-1">
                        {video.series} / {video.category}
                    </span>
                    <h3 className="text-white font-display uppercase tracking-tight text-xl group-hover:text-white/70 transition-colors duration-300">
                        {video.title}
                    </h3>
                </div>
                <span className="text-[10px] text-white/20 font-light mt-1">{video.year}</span>
            </div>
        </motion.div>
    );
}

interface VideoLightboxProps {
    video: (typeof videos)[0];
    onClose: () => void;
}

function VideoLightbox({ video, onClose }: VideoLightboxProps) {
    const [muted, setMuted] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-16"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, y: 24 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.92, y: 24 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-5xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close */}
                <button
                    onClick={onClose}
                    className="absolute -top-14 right-0 flex flex-col items-center gap-1 group z-10"
                >
                    <div className="w-12 h-12 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center transition-all shadow-2xl">
                        <X size={22} className="group-hover:rotate-90 transition-transform duration-300" />
                    </div>
                    <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold group-hover:text-white transition-colors">
                        Close
                    </span>
                </button>

                {/* Video */}
                <div className="rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl border border-white/5 aspect-video">
                    <video
                        ref={videoRef}
                        src={video.src}
                        autoPlay
                        muted={muted}
                        loop
                        playsInline
                        controls={false}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Controls bar */}
                <div className="mt-6 flex justify-between items-center px-2">
                    <div>
                        <span className="text-[9px] uppercase tracking-[0.5em] text-white/30 font-bold block mb-1">
                            Series {video.series} · {video.category} · {video.year}
                        </span>
                        <h2 className="text-white font-display uppercase tracking-tight text-3xl md:text-4xl">
                            {video.title}
                        </h2>
                        <p className="text-white/40 text-sm font-light mt-2 max-w-lg leading-relaxed">
                            {video.description}
                        </p>
                    </div>

                    {/* Mute toggle */}
                    <button
                        onClick={() => setMuted((m) => !m)}
                        className="w-12 h-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all text-white/60 hover:text-white shrink-0"
                    >
                        {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}

export default function VideoPage() {
    const [selectedVideo, setSelectedVideo] = useState<(typeof videos)[0] | null>(null);

    return (
        <div className="min-h-screen bg-black">
            {/* Hero strip */}
            <div className="relative h-[38vh] overflow-hidden flex items-end pb-16 px-6 md:px-12">
                {/* Background video (looping, muted) */}
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                >
                    <source src={localVideoSrc} type="video/mp4" />
                    <source src="https://assets.mixkit.co/videos/preview/mixkit-girl-walking-on-the-beach-at-sunset-1525-large.mp4" type="video/mp4" />
                </video>
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black" />

                <div className="relative z-10 max-w-[1400px] mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <span className="text-[10px] uppercase tracking-[0.6em] text-white/40 font-bold mb-4 block">
                            Moving Image
                        </span>
                        <h1 className="font-display text-6xl md:text-8xl text-white uppercase tracking-tighter leading-[0.9]">
                            Video <br /> Works
                        </h1>
                    </motion.div>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-white/5 mx-6 md:mx-12 mb-16" />

            {/* Stats row */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="px-6 md:px-12 mb-16"
            >
                <div className="max-w-[1400px] mx-auto flex gap-12 md:gap-24">
                    {[
                        { label: "Films", value: `${videos.length.toString().padStart(2, "0")}` },
                        { label: "Hours", value: "14+" },
                        { label: "Awards", value: "03" },
                    ].map((s) => (
                        <div key={s.label}>
                            <span className="font-display text-5xl md:text-6xl text-white tracking-tighter">{s.value}</span>
                            <span className="text-[9px] uppercase tracking-[0.4em] text-white/30 font-semibold block mt-1">
                                {s.label}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Video Grid */}
            <div className="px-6 md:px-12 pb-32">
                <div className="max-w-[1400px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-14">
                    {videos.map((video, i) => (
                        <VideoCard
                            key={video.id}
                            video={video}
                            index={i}
                            onClick={() => setSelectedVideo(video)}
                        />
                    ))}
                </div>
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {selectedVideo && (
                    <VideoLightbox video={selectedVideo} onClose={() => setSelectedVideo(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}
