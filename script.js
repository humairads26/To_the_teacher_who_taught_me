/**
 * A LETTER I OWE YOU - PHASE 1 ENGINE
 * Simple, clean, lightweight JavaScript logic.
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM References
  const loadingScreen = document.getElementById('loading-screen');
  const appContainer = document.getElementById('app-container');
  const envelope = document.getElementById('envelope');
  const waxSeal = document.getElementById('wax-seal');
  const openBtn = document.getElementById('open-letter-btn');
  const canvas = document.getElementById('ambient-canvas');

  // Application State
  const state = {
    isLoading: true,
    isEnvelopeOpen: false,
    currentPhase: 1
  };

  /* ==========================================
     1. SHORT LOADING SCREEN (2 SECONDS) & OPENING SEQUENTIAL REVEAL
     ========================================== */
  const initLoadingSequence = () => {
    setTimeout(() => {
      // Begin fade out of loading screen
      loadingScreen.classList.add('fade-out');

      // Make app container visible
      setTimeout(() => {
        state.isLoading = false;
        appContainer.classList.remove('hidden-initially');
        appContainer.classList.add('visible');

        // Opening sequential reveal sequence
        const seqItems = document.querySelectorAll('.opening-section .seq-item');
        const seqDelays = [250, 700, 1200];
        seqItems.forEach((item, index) => {
          const d = seqDelays[index] !== undefined ? seqDelays[index] : 450 * index;
          setTimeout(() => item.classList.add('revealed'), d);
        });

      }, 400);

    }, 2000);
  };

  /* ==========================================
     2. RICH, HIGH-DENSITY ATMOSPHERIC PARTICLE & LIGHT CANVAS
     Full-screen 3D-depth atmospheric background experience:
     - 100-140 Floating blue particles & glowing orbs (3px - 14px)
     - 50-70 Twinkling blue & gold stars (4px - 14px)
     - 25-35 Floating blue & gold hearts (10px - 24px)
     - 3 Visual Depth Layers (Background, Midground, Foreground)
     ========================================== */
  let triggerEnvelopeBurst = null;

  const initAmbientCanvas = () => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    window.addEventListener('mousemove', (e) => {
      targetMouseX = (e.clientX - width / 2) * 0.04;
      targetMouseY = (e.clientY - height / 2) * 0.04;
    }, { passive: true });

    let particles = [];
    // High-density count: 120-220 items depending on screen width
    const totalCount = Math.min(Math.max(Math.floor(width * 0.16), 110), 220);

    // Draw Heart on Canvas (Clear Midnight Blue / Gold vector heart)
    const drawHeart = (ctx, x, y, size, rotation, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      if (rotation) ctx.rotate(rotation);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      const topCurve = size * 0.32;
      ctx.moveTo(0, topCurve);
      ctx.bezierCurveTo(0, 0, -size / 2, 0, -size / 2, topCurve);
      ctx.bezierCurveTo(-size / 2, (size + topCurve) / 2, 0, size, 0, size);
      ctx.bezierCurveTo(0, size, size / 2, (size + topCurve) / 2, size / 2, topCurve);
      ctx.bezierCurveTo(size / 2, 0, 0, 0, 0, topCurve);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    // Draw 4-point Sparkle Star on Canvas
    const drawStar = (ctx, x, y, size, color, opacity) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.beginPath();
      ctx.fillStyle = color;
      ctx.globalAlpha = Math.max(0, Math.min(1, opacity));
      const inner = size * 0.28;
      for (let i = 0; i < 4; i++) {
        const angle = (i * Math.PI) / 2;
        const halfAngle = angle + Math.PI / 4;
        if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
        else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
        ctx.lineTo(Math.cos(halfAngle) * inner, Math.sin(halfAngle) * inner);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    class Particle {
      constructor(isBurst = false, burstX = 0, burstY = 0) {
        this.isBurst = isBurst;
        this.reset(true, burstX, burstY);
      }

      reset(initial = false, burstX = 0, burstY = 0) {
        if (this.isBurst) {
          this.x = burstX + (Math.random() - 0.5) * 50;
          this.y = burstY + (Math.random() - 0.5) * 50;
          const angle = Math.random() * Math.PI * 2;
          const force = Math.random() * 4.5 + 1.8;
          this.speedX = Math.cos(angle) * force;
          this.speedY = Math.sin(angle) * force - 1.2;
          this.baseOpacity = Math.random() * 0.5 + 0.45;
          this.opacity = this.baseOpacity;
          this.life = 1.0;
          this.decay = Math.random() * 0.014 + 0.009;
          this.type = Math.random() > 0.35 ? 'star' : (Math.random() > 0.5 ? 'heart' : 'dot');
          this.size = Math.random() * 10 + 6;
          this.color = Math.random() > 0.4 ? 'rgba(16, 27, 54, ' : 'rgba(198, 161, 91, ';
          this.rotation = Math.random() * Math.PI * 2;
          this.rotationSpeed = (Math.random() - 0.5) * 0.06;
          this.depthMult = 1.2;
          return;
        }

        // Distributed across whole viewport
        this.x = Math.random() * width;
        this.y = initial ? Math.random() * height : height + Math.random() * 80;

        // 3 Visual Depth Levels
        const depthRand = Math.random();
        if (depthRand < 0.35) {
          // BACKGROUND LAYER
          this.depthMult = 0.58;
          this.parallax = 0.22;
          this.alphaMult = 0.78;
        } else if (depthRand < 0.8) {
          // MIDGROUND LAYER
          this.depthMult = 0.88;
          this.parallax = 0.50;
          this.alphaMult = 0.90;
        } else {
          // FOREGROUND LAYER (visible, crisp Midnight Blue #101B36)
          this.depthMult = 1.2;
          this.parallax = 0.88;
          this.alphaMult = 1.0;
        }

        const typeRand = Math.random();
        if (typeRand < 0.52) {
          // TYPE 1: MIDNIGHT BLUE PARTICLES & ORBS (#101B36)
          this.type = 'dot';
          const sizeTier = Math.random();
          if (sizeTier < 0.5) {
            this.size = (Math.random() * 1.5 + 2.5) * this.depthMult;
          } else if (sizeTier < 0.85) {
            this.size = (Math.random() * 2.0 + 5.0) * this.depthMult;
          } else {
            this.size = (Math.random() * 3.0 + 8.0) * this.depthMult;
            this.hasGlow = true;
          }

          // Exact Midnight Navy #101B36
          this.color = 'rgba(16, 27, 54, ';
          this.baseOpacity = (Math.random() * 0.25 + 0.65) * this.alphaMult;

        } else if (typeRand < 0.80) {
          // TYPE 2: TWINKLING STARS (#101B36)
          this.type = 'star';
          this.size = (Math.random() * 5.2 + 3.8) * this.depthMult; // ~4-9.5px star radius
          this.color = 'rgba(16, 27, 54, '; // Exact Midnight Navy #101B36
          this.baseOpacity = (Math.random() * 0.25 + 0.70) * this.alphaMult;
          this.twinkleSpeed = Math.random() * 0.045 + 0.018;
          this.twinkleAngle = Math.random() * Math.PI * 2;

        } else {
          // TYPE 3: FLOATING HEARTS (#101B36)
          this.type = 'heart';
          const isLarge = Math.random() > 0.75;
          this.size = (isLarge ? Math.random() * 4.0 + 15.0 : Math.random() * 6.0 + 8.0) * this.depthMult;
          this.color = 'rgba(16, 27, 54, '; // Exact Midnight Navy #101B36
          this.baseOpacity = (Math.random() * 0.22 + 0.72) * this.alphaMult;
          this.rotation = (Math.random() - 0.5) * 0.6;
          this.rotationSpeed = (Math.random() - 0.5) * 0.012;
        }

        this.opacity = this.baseOpacity;
        this.speedY = (Math.random() * 0.35 + 0.12) * this.depthMult;
        this.sinAngle = Math.random() * Math.PI * 2;
        this.sinSpeed = Math.random() * 0.022 + 0.008;
        this.sinAmp = (Math.random() * 0.6 + 0.2) * this.depthMult;
        this.renderX = this.x;
        this.renderY = this.y;
      }

      update(mX = 0, mY = 0) {
        if (this.isBurst) {
          this.x += this.speedX;
          this.y += this.speedY;
          this.speedX *= 0.95;
          this.speedY *= 0.95;
          this.speedY -= 0.025; // float upward
          this.life -= this.decay;
          this.opacity = this.baseOpacity * Math.max(0, this.life);
          if (this.rotation !== undefined) this.rotation += this.rotationSpeed;
          this.renderX = this.x;
          this.renderY = this.y;
          return;
        }

        this.y -= this.speedY;
        this.sinAngle += this.sinSpeed;
        this.x += Math.sin(this.sinAngle) * this.sinAmp * 0.35;

        const pX = (this.parallax || 0.5);
        this.renderX = this.x + mX * pX;
        this.renderY = this.y + mY * pX;

        if (this.type === 'star') {
          this.twinkleAngle += this.twinkleSpeed;
          this.opacity = Math.max(0.12, this.baseOpacity + Math.sin(this.twinkleAngle) * 0.24);
        }

        if (this.type === 'heart' && this.rotation !== undefined) {
          this.rotation += this.rotationSpeed;
        }

        // Fade out smoothly near upper screen edge
        if (this.y < height * 0.08) {
          this.opacity -= 0.008;
        }

        if (this.y < -30 || this.opacity <= 0) {
          this.reset(false);
        }
      }

      draw() {
        if (this.opacity <= 0) return;
        const fillStyle = `${this.color}${Math.max(0, Math.min(1, this.opacity))})`;

        if (this.type === 'heart') {
          drawHeart(ctx, this.renderX, this.renderY, this.size, this.rotation || 0, fillStyle, this.opacity);
        } else if (this.type === 'star') {
          drawStar(ctx, this.renderX, this.renderY, this.size, fillStyle, this.opacity);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(this.renderX, this.renderY, this.size, 0, Math.PI * 2);
          ctx.fillStyle = fillStyle;
          ctx.globalAlpha = Math.max(0, Math.min(1, this.opacity));
          if (this.hasGlow) {
            ctx.shadowBlur = 14;
            ctx.shadowColor = fillStyle;
          } else if (this.type === 'gold') {
            ctx.shadowBlur = 6;
            ctx.shadowColor = 'rgba(198, 161, 91, 0.4)';
          }
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Populate ambient particles
    for (let i = 0; i < totalCount; i++) {
      particles.push(new Particle(false));
    }

    // Expose envelope burst creator
    triggerEnvelopeBurst = (centerX, centerY) => {
      for (let i = 0; i < 45; i++) {
        particles.push(new Particle(true, centerX, centerY));
      }
    };

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      time += 0.005;

      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;

      // Layer 2: Shifting soft blue & gold ambient radial glows
      const glow1X = width * 0.25 + Math.sin(time * 0.9) * 60 + mouseX;
      const glow1Y = height * 0.2 + Math.cos(time * 0.7) * 40 + mouseY;
      const rad1 = ctx.createRadialGradient(glow1X, glow1Y, 10, glow1X, glow1Y, width * 0.5);
      rad1.addColorStop(0, 'rgba(16, 27, 54, 0.09)');
      rad1.addColorStop(0.5, 'rgba(16, 27, 54, 0.04)');
      rad1.addColorStop(1, 'rgba(247, 243, 234, 0)');
      ctx.fillStyle = rad1;
      ctx.fillRect(0, 0, width, height);

      const glow2X = width * 0.75 - Math.cos(time * 0.8) * 50 + mouseX;
      const glow2Y = height * 0.75 + Math.sin(time * 1.1) * 50 + mouseY;
      const rad2 = ctx.createRadialGradient(glow2X, glow2Y, 10, glow2X, glow2Y, width * 0.55);
      rad2.addColorStop(0, 'rgba(16, 27, 54, 0.08)');
      rad2.addColorStop(0.6, 'rgba(198, 161, 91, 0.04)');
      rad2.addColorStop(1, 'rgba(247, 243, 234, 0)');
      ctx.fillStyle = rad2;
      ctx.fillRect(0, 0, width, height);

      // Filter out finished burst particles
      particles = particles.filter(p => !p.isBurst || p.life > 0);

      // Render all particles across 3D depth layers
      particles.forEach((p) => {
        p.update(mouseX, mouseY);
        p.draw();
      });

      requestAnimationFrame(animate);
    };

    animate();

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });
  };



  /* ==========================================
     3. ENVELOPE OPENING ANIMATION & TRANSITION
     ========================================== */
  const handleOpenEnvelope = () => {
    if (state.isEnvelopeOpen) return;
    state.isEnvelopeOpen = true;

    document.body.classList.add('envelope-opened');

    const openingScreen = document.getElementById('opening-screen');
    if (openingScreen) openingScreen.classList.add('transition-to-ivory');

    const wrapper = document.getElementById('envelope-wrapper');
    if (wrapper) wrapper.classList.add('is-opening');

    // Subtle button click feedback & gentle fade away
    if (openBtn) {
      openBtn.disabled = true;
      openBtn.classList.add('btn-faded');
    }

    // 1. Trigger realistic flap opening animation
    if (envelope) {
      envelope.classList.add('is-open');
      if (typeof triggerEnvelopeBurst === 'function') {
        const rect = envelope.getBoundingClientRect();
        triggerEnvelopeBurst(rect.left + rect.width / 2, rect.top + rect.height / 2);
      }
    }

    // 2. Unhide all letter sections in layout so document is scrollable
    const letterSection = document.getElementById('letter-intro-section');
    const lessonsSection = document.getElementById('lessons-stay-section');
    const journeySection = document.getElementById('journey-section');

    [letterSection, lessonsSection, journeySection].forEach(sec => {
      if (sec) sec.classList.remove('hidden-letter', 'hidden-section');
    });

    // Prepare observers for sections
    initLessonsStayObserver();
    initJourneyObserver();
    initAndNowObserver();
    initRealizationObserver();
    initYouMayNotKnowObserver();
    initImpactObserver();
    initQuietMomentObserver();
    initThankYouObserver();
    initOneLastThoughtObserver();
    initFinalMessageObserver();
    initSignOffObserver();

    // 3. Smoothly scroll into the first letter section after envelope flap opens
    setTimeout(() => {
      revealLetterIntroSection();
    }, 1100);
  };

  /**
   * Phase 2: Reveal & Staggered Text Line Sequence
   * Calm, cinematic, quiet presentation of the letter intro
   */
  const revealLetterIntroSection = () => {
    const letterSection = document.getElementById('letter-intro-section');
    if (!letterSection) return;

    letterSection.classList.remove('hidden-letter');

    // Trigger smooth fade & translateY on container
    requestAnimationFrame(() => {
      letterSection.classList.add('visible-letter');
      
      // Smoothly scroll down to the letter
      setTimeout(() => {
        letterSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    });

    // Staggered reveal of each line with thoughtful pauses
    const lines = letterSection.querySelectorAll('.letter-line');
    
    const delays = [
      400,   // 1. "Dear Teacher,"
      1200,  // 2. "If you're reading this, I hope you take a few moments to stay."
      2200,  // 3. Pause dot
      3000,  // 4. "I could have simply said..."
      4200,  // 5. "Happy Teacher’s Day."
      5200,  // 6. Pause dot
      6000   // 7. "But somehow, that didn't feel enough."
    ];

    lines.forEach((line, index) => {
      const stepDelay = delays[index] || (700 * index + 600);
      setTimeout(() => {
        line.classList.add('revealed');
      }, stepDelay);
    });

    state.currentPhase = 2;
  };

  /* ==========================================
     4. PHASE 3: "SOME LESSONS STAY" SEQUENCE
     ========================================== */
  let lessonsStayTriggered = false;

  const initLessonsStayObserver = () => {
    const lessonsSection = document.getElementById('lessons-stay-section');
    if (!lessonsSection) return;

    const triggerSequence = () => {
      if (lessonsStayTriggered) return;
      lessonsStayTriggered = true;

      lessonsSection.classList.remove('hidden-section');
      lessonsSection.classList.add('visible-section');

      const wordCards = lessonsSection.querySelectorAll('.word-card');
      const wordsGrid = document.getElementById('words-grid');
      const focusBlock = document.getElementById('lessons-focus-block');

      // Slower, more cinematic spacing — each word is its own moment
      const wordDelays = [400, 1100, 1900, 2750, 3650, 4600];

      wordCards.forEach((card, index) => {
        const delay = wordDelays[index] || (700 * index + 400);
        setTimeout(() => {
          card.classList.add('revealed');

          if (index === wordCards.length - 1) {
            // All words shown — wait, let them breathe, then recede + focus
            setTimeout(() => {
              if (wordsGrid) wordsGrid.classList.add('receded');
              setTimeout(() => {
                if (focusBlock) focusBlock.classList.add('revealed');
                state.currentPhase = 3;
              }, 600);
            }, 1800);
          }
        }, delay);
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerSequence();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(lessonsSection);
    } else {
      triggerSequence();
    }
  };

  /* ==========================================
     5. PHASE 4: MY JOURNEY SEQUENCE
     Active tracking: as each stage reveals, it becomes
     is-active; previous stages become is-past.
     After full reveal, individual item observers keep
     active/past states correct on scroll.
     ========================================== */
  let journeyTriggered = false;

  const initJourneyObserver = () => {
    const journeySection = document.getElementById('journey-section');
    if (!journeySection) return;

    const triggerSequence = () => {
      if (journeyTriggered) return;
      journeyTriggered = true;

      journeySection.classList.remove('hidden-section');
      journeySection.classList.add('visible-section');

      const timelineItems = journeySection.querySelectorAll('.timeline-item');
      const progressBar = document.getElementById('timeline-progress');
      const summaryBlock = document.getElementById('journey-summary-block');
      const totalItems = timelineItems.length;

      timelineItems.forEach((item, index) => {
        const delay = 520 * index + 300;
        setTimeout(() => {
          // Mark previous as past
          if (index > 0) {
            timelineItems[index - 1].classList.remove('is-active');
            timelineItems[index - 1].classList.add('is-past');
          }
          // Mark current as active
          item.classList.add('revealed', 'is-active');

          // Grow the gold progress bar
          if (progressBar) {
            const progressPercent = Math.round(((index + 1) / totalItems) * 100);
            progressBar.style.height = `${progressPercent}%`;
          }

          if (index === totalItems - 1) {
            // All revealed — set up scroll-based active tracking
            setTimeout(() => {
              if (summaryBlock) summaryBlock.classList.add('revealed');
              state.currentPhase = 4;
              initTimelineScrollTracking(timelineItems);
            }, 800);
          }
        }, delay);
      });
    };

    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              triggerSequence();
              observer.disconnect();
            }
          });
        },
        { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
      );
      observer.observe(journeySection);
    } else {
      triggerSequence();
    }
  };

  /**
   * After all stages reveal, watch each item individually.
   * The one most visible in the viewport becomes is-active.
   */
  const initTimelineScrollTracking = (items) => {
    const spark = document.getElementById('timeline-spark');
    const progressBar = document.getElementById('timeline-progress');
    const wrapper = document.querySelector('.timeline-wrapper');

    const updateSparkAndProgress = () => {
      if (!wrapper || !progressBar) return;
      const rect = wrapper.getBoundingClientRect();
      const winHeight = window.innerHeight;
      const start = winHeight * 0.75;
      const total = rect.height;
      const current = start - rect.top;
      let pct = Math.max(0, Math.min(100, (current / total) * 100));

      progressBar.style.height = `${pct}%`;
      if (spark) {
        spark.style.top = `${pct}%`;
        if (pct > 0 && pct < 100) {
          wrapper.classList.add('active-scrolling');
        } else {
          wrapper.classList.remove('active-scrolling');
        }
      }
    };

    window.addEventListener('scroll', updateSparkAndProgress, { passive: true });
    updateSparkAndProgress();

    if (!('IntersectionObserver' in window)) return;

    const activate = (activeItem) => {
      items.forEach((item) => {
        item.classList.remove('is-active');
        if (item.classList.contains('revealed')) {
          item.classList.add('is-past');
        }
      });
      activeItem.classList.remove('is-past');
      activeItem.classList.add('is-active');
    };

    const obs = new IntersectionObserver(
      (entries) => {
        let best = null;
        entries.forEach((e) => {
          if (e.isIntersecting) {
            if (!best || e.intersectionRatio > best.intersectionRatio) best = e;
          }
        });
        if (best) activate(best.target);
      },
      { threshold: [0.3, 0.6, 0.9], rootMargin: '-10% 0px -30% 0px' }
    );

    items.forEach((item) => obs.observe(item));
  };

  /* ==========================================
     6. PHASE 5: AND NOW... SECTION
     ========================================== */
  let andNowTriggered = false;

  const initAndNowObserver = () => {
    const section = document.getElementById('and-now-section');
    if (!section) return;

    const trigger = () => {
      if (andNowTriggered) return;
      andNowTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.section-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 200 + i * 450);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     7. PHASE 5: THE REALIZATION SECTION
     ========================================== */
  let realizationTriggered = false;

  const initRealizationObserver = () => {
    const section = document.getElementById('realization-section');
    if (!section) return;

    const trigger = () => {
      if (realizationTriggered) return;
      realizationTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.section-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 200 + i * 550);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     8. PHASE 5: YOU MAY NOT KNOW SECTION
     ========================================== */
  let youMayNotKnowTriggered = false;

  const initYouMayNotKnowObserver = () => {
    const section = document.getElementById('you-may-not-know-section');
    if (!section) return;

    const trigger = () => {
      if (youMayNotKnowTriggered) return;
      youMayNotKnowTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.section-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 150 + i * 500);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     9. PHASE 5: THE IMPACT SECTION
     ========================================== */
  let impactTriggered = false;

  const initImpactObserver = () => {
    const section = document.getElementById('impact-section');
    if (!section) return;

    const trigger = () => {
      if (impactTriggered) return;
      impactTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.section-line');
      lines.forEach((line, i) => {
        setTimeout(() => line.classList.add('revealed'), 200 + i * 520);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.05, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     10. PHASE 6: THE QUIET MOMENT
     ========================================== */
  let quietMomentTriggered = false;

  const initQuietMomentObserver = () => {
    const section = document.getElementById('quiet-moment-section');
    if (!section) return;

    const trigger = () => {
      if (quietMomentTriggered) return;
      quietMomentTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.p6-line');
      // Very slow stagger — let silence do the work
      const delays = [300, 1200, 2400, 3600, 5000];
      lines.forEach((line, i) => {
        const d = delays[i] !== undefined ? delays[i] : 700 * i + 300;
        setTimeout(() => line.classList.add('revealed'), d);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     11. PHASE 6: THANK YOU
     ========================================== */
  let thankYouTriggered = false;

  const initThankYouObserver = () => {
    const section = document.getElementById('thank-you-section');
    if (!section) return;

    const trigger = () => {
      if (thankYouTriggered) return;
      thankYouTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.p6-line');
      // Measured stagger — each line is a breath
      const delays = [200, 1100, 2000, 3000, 4200, 5200, 6400];
      lines.forEach((line, i) => {
        const d = delays[i] !== undefined ? delays[i] : 700 * i + 200;
        setTimeout(() => line.classList.add('revealed'), d);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.06, rootMargin: '0px 0px -50px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     12. PHASE 6: ONE LAST THOUGHT
     ========================================== */
  let oneLastThoughtTriggered = false;

  const initOneLastThoughtObserver = () => {
    const section = document.getElementById('one-last-thought-section');
    if (!section) return;

    const trigger = () => {
      if (oneLastThoughtTriggered) return;
      oneLastThoughtTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.p6-line');
      // Slow, reflective pace for the closing thought
      const delays = [400, 1600, 3200];
      lines.forEach((line, i) => {
        const d = delays[i] !== undefined ? delays[i] : 900 * i + 400;
        setTimeout(() => line.classList.add('revealed'), d);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.08, rootMargin: '0px 0px -60px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     13. PHASE 7: FINAL MESSAGE SECTION
     ========================================== */
  let finalMessageTriggered = false;

  const initEndingCanvas = () => {
    const canvas = document.getElementById('ending-canvas');
    if (!canvas) return;
    const section = document.getElementById('final-message-section');
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = section.offsetWidth;
      canvas.height = section.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Reveal the canvas with a slow fade
    setTimeout(() => canvas.classList.add('glow-active'), 600);

    const particles = [];
    const count = Math.min(40, Math.floor(canvas.width * 0.045));

    class EndParticle {
      constructor() { this.reset(true); }
      reset(initial = false) {
        this.x       = Math.random() * canvas.width;
        this.y       = initial ? Math.random() * canvas.height : canvas.height + 10;
        this.r       = Math.random() * 1.8 + 0.5;
        this.opacity = Math.random() * 0.5 + 0.15;
        this.speedY  = Math.random() * 0.25 + 0.08;
        this.speedX  = (Math.random() - 0.5) * 0.18;
        this.fade    = Math.random() * 0.004 + 0.002;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        if (this.y < canvas.height * 0.12) this.opacity -= this.fade;
        if (this.y < 0 || this.opacity <= 0) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(198, 161, 91, ${this.opacity})`;
        ctx.shadowBlur  = 6;
        ctx.shadowColor = 'rgba(198, 161, 91, 0.35)';
        ctx.fill();
      }
    }

    for (let i = 0; i < count; i++) particles.push(new EndParticle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Soft radial warm glow in centre
      const grd = ctx.createRadialGradient(
        canvas.width / 2, canvas.height * 0.5, 20,
        canvas.width / 2, canvas.height * 0.5, canvas.width * 0.55
      );
      grd.addColorStop(0, 'rgba(198, 161, 91, 0.06)');
      grd.addColorStop(1, 'rgba(247, 243, 234, 0)');
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => { p.update(); p.draw(); });
      requestAnimationFrame(animate);
    };
    animate();
  };

  const initFinalMessageObserver = () => {
    const section = document.getElementById('final-message-section');
    if (!section) return;

    const trigger = () => {
      if (finalMessageTriggered) return;
      finalMessageTriggered = true;

      // Start the ending canvas
      initEndingCanvas();

      const lines = section.querySelectorAll('.p7-line');
      // Very measured — rose first, then greeting, divider, subline
      const delays = [300, 1400, 2800, 3800];
      lines.forEach((line, i) => {
        const d = delays[i] !== undefined ? delays[i] : 900 * i + 300;
        setTimeout(() => line.classList.add('revealed'), d);
      });
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.08, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  /* ==========================================
     14. PHASE 7: SIGN-OFF SECTION
     ========================================== */
  let signOffTriggered = false;

  const initSignOffObserver = () => {
    const section = document.getElementById('signoff-section');
    if (!section) return;

    const trigger = () => {
      if (signOffTriggered) return;
      signOffTriggered = true;
      section.classList.add('visible-section');

      const lines = section.querySelectorAll('.p7-line');
      // "With respect" → "Your student" → NAME (big pause before) → rule → footer
      const delays = [400, 1300, 2600, 4000, 5200];
      lines.forEach((line, i) => {
        const d = delays[i] !== undefined ? delays[i] : 900 * i + 400;
        setTimeout(() => line.classList.add('revealed'), d);
      });

      // Peaceful exit feeling — slowly settle the canvas particles into a tranquil ambient shimmer
      setTimeout(() => {
        document.body.classList.add('ending-settled');
      }, 6200);
    };

    if ('IntersectionObserver' in window) {
      const obs = new IntersectionObserver(
        (entries) => { entries.forEach(e => { if (e.isIntersecting) { trigger(); obs.disconnect(); } }); },
        { threshold: 0.06, rootMargin: '0px 0px -40px 0px' }
      );
      obs.observe(section);
    } else { trigger(); }
  };

  // Event Listeners
  if (openBtn) {
    openBtn.addEventListener('click', handleOpenEnvelope);
  }

  if (waxSeal) {
    waxSeal.addEventListener('click', handleOpenEnvelope);
  }

  // Initialize Phase 1 & Ambient Canvas
  initAmbientCanvas();
  initLoadingSequence();
});
