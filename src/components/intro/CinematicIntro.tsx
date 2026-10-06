"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

interface CinematicIntroProps {
  onComplete: () => void;
}

export function CinematicIntro({ onComplete }: CinematicIntroProps) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const wordmarkRef   = useRef<HTMLDivElement>(null);
  const shimmerRef    = useRef<HTMLDivElement>(null);
  const shutterTopRef = useRef<HTMLDivElement>(null);
  const shutterBotRef = useRef<HTMLDivElement>(null);
  const skipRef       = useRef<HTMLButtonElement>(null);
  const particlesRef  = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Check session storage — only play once per session
    if (sessionStorage.getItem("tv-intro-played")) {
      onComplete();
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          sessionStorage.setItem("tv-intro-played", "1");
          onComplete();
          setVisible(false);
        },
      });

      // ── Phase 0: Initial state
      gsap.set(wordmarkRef.current, {
        opacity: 0,
        scale: 0.6,
        rotateX: 30,
        y: 30,
        transformPerspective: 1000,
      });

      gsap.set(shimmerRef.current, { opacity: 0 });
      gsap.set([shutterTopRef.current, shutterBotRef.current], { scaleY: 0 });

      // Skip button fades in after 1s
      gsap.to(skipRef.current, {
        opacity: 1,
        duration: 0.4,
        delay: 1,
      });

      // ── Phase 1: Wordmark reveal (0s → 1.2s)
      tl.to(wordmarkRef.current, {
        opacity: 1,
        scale: 1,
        rotateX: 0,
        y: 0,
        duration: 1.2,
        ease: "power4.out",
      });

      // ── Phase 2: Light sweep shimmer (1.2s → 2.0s)
      tl.to(
        shimmerRef.current,
        {
          opacity: 1,
          backgroundPositionX: "200%",
          duration: 0.8,
          ease: "power2.inOut",
        },
        "-=0.2"
      );

      tl.to(shimmerRef.current, { opacity: 0, duration: 0.3 });

      // ── Phase 3: Hold (2.0s → 2.8s)
      tl.to({}, { duration: 0.8 });

      // ── Phase 4: Shutter wipe exit (2.8s → 3.8s)
      tl.to(
        shutterTopRef.current,
        {
          scaleY: 1,
          duration: 0.5,
          ease: "power3.inOut",
          transformOrigin: "top",
        },
        "<"
      );
      tl.to(
        shutterBotRef.current,
        {
          scaleY: 1,
          duration: 0.5,
          ease: "power3.inOut",
          transformOrigin: "bottom",
        },
        "<"
      );

      // Fade out wordmark during shutter
      tl.to(
        wordmarkRef.current,
        { opacity: 0, scale: 1.05, duration: 0.4, ease: "power2.in" },
        "<"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [onComplete]);

  const handleSkip = () => {
    gsap.killTweensOf("*");
    sessionStorage.setItem("tv-intro-played", "1");
    onComplete();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      ref={containerRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "#000000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
      aria-label="Trend Vogue intro animation"
      role="presentation"
    >
      {/* Subtle fabric texture particle layer */}
      <div
        ref={particlesRef}
        style={{
          position: "absolute",
          inset: 0,
          background: `
            radial-gradient(ellipse 80% 50% at 50% 50%, rgba(33,98,161,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 60% at 20% 80%, rgba(240,136,4,0.04) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(255,216,20,0.03) 0%, transparent 50%)
          `,
        }}
      />

      {/* Animated grain overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.03,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />

      {/* Wordmark */}
      <div
        ref={wordmarkRef}
        style={{
          textAlign: "center",
          position: "relative",
          zIndex: 2,
        }}
      >
        {/* Main logo text */}
        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            color: "#FFFFFF",
            lineHeight: 1,
            position: "relative",
          }}
        >
          {/* Shimmer overlay */}
          <div
            ref={shimmerRef}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.6) 50%, transparent 70%)",
              backgroundSize: "300% 100%",
              backgroundPositionX: "-100%",
              mixBlendMode: "overlay",
              pointerEvents: "none",
              zIndex: 3,
            }}
          />
          TREND
        </div>

        <div
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontSize: "clamp(2.5rem, 8vw, 6rem)",
            fontWeight: 800,
            letterSpacing: "-0.02em",
            background: "linear-gradient(135deg, #FFD814, #F08804)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            lineHeight: 1,
            marginTop: "0.1em",
          }}
        >
          VOGUE
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: "clamp(0.6rem, 1.5vw, 0.875rem)",
            letterSpacing: "0.4em",
            color: "rgba(255,255,255,0.4)",
            textTransform: "uppercase",
            marginTop: "1rem",
          }}
        >
          Premium Fashion
        </div>

        {/* Accent line */}
        <div
          style={{
            width: "60px",
            height: "2px",
            background: "linear-gradient(90deg, #FFD814, #F08804)",
            margin: "0.75rem auto 0",
            borderRadius: "999px",
          }}
        />
      </div>

      {/* Shutter panels */}
      <div
        ref={shutterTopRef}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000000",
          transformOrigin: "top",
          transform: "scaleY(0)",
          zIndex: 10,
        }}
      />
      <div
        ref={shutterBotRef}
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "#000000",
          transformOrigin: "bottom",
          transform: "scaleY(0)",
          zIndex: 10,
        }}
      />

      {/* Skip button */}
      <button
        ref={skipRef}
        onClick={handleSkip}
        style={{
          position: "absolute",
          bottom: "2rem",
          right: "2rem",
          opacity: 0,
          background: "rgba(255,255,255,0.1)",
          color: "rgba(255,255,255,0.6)",
          border: "1px solid rgba(255,255,255,0.15)",
          padding: "0.5rem 1.25rem",
          borderRadius: "999px",
          fontSize: "0.8rem",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          cursor: "pointer",
          fontFamily: "'Inter', sans-serif",
          fontWeight: 500,
          backdropFilter: "blur(8px)",
          transition: "all 0.2s ease",
          zIndex: 20,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.15)";
          e.currentTarget.style.color = "rgba(255,255,255,0.9)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.1)";
          e.currentTarget.style.color = "rgba(255,255,255,0.6)";
        }}
        aria-label="Skip intro"
      >
        Skip ✕
      </button>
    </div>
  );
}
