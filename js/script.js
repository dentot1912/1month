/* ========================================
   CONFIG
======================================== */

const COUNT = 400;
const hearts = [];
const heartContainer = document.getElementById("heart-container");
const openBtn = document.getElementById("openBtn");
const burstCenter = document.getElementById("burstCenter");

/*=========================================
MUSIC (YOUTUBE BACKGROUND MUSIC)
=========================================*/

// Masukkan YouTube Video ID di sini (contoh: dari https://www.youtube.com/watch?v=0zjf3BDlRLw -> ID adalah '0zjf3BDlRLw')
const YOUTUBE_VIDEO_ID = "pxis4fQVV-4"; // ID YouTube kamu

const musicControl = document.getElementById("musicControl");
const musicIcon = document.getElementById("musicIcon");

let ytPlayer = null;
let ytPlayerReady = false;
let isYtPlaying = false;
let pendingPlay = false;
let ytFadeTimer = null;

// Muat YouTube IFrame API
(function loadYouTubeAPI() {
    if (window.YT && window.YT.Player) {
        initYouTubePlayer();
    } else {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
})();

window.onYouTubeIframeAPIReady = function () {
    initYouTubePlayer();
};

function initYouTubePlayer() {
    if (ytPlayer) return;
    const playerDiv = document.getElementById("youtube-player");
    if (!playerDiv) return;

    ytPlayer = new YT.Player("youtube-player", {
        height: "200",
        width: "200",
        videoId: YOUTUBE_VIDEO_ID,
        playerVars: {
            autoplay: 0,
            controls: 0,
            disablekb: 1,
            fs: 0,
            loop: 1,
            playlist: YOUTUBE_VIDEO_ID,
            modestbranding: 1,
            rel: 0,
            playsinline: 1,
            enablejsapi: 1,
            origin: window.location.origin && window.location.origin !== "null" ? window.location.origin : "*"
        },
        events: {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange,
            onError: (e) => {
                console.warn("YouTube Player Error Code:", e.data);
            }
        }
    });
}

function onPlayerReady(event) {
    ytPlayerReady = true;
    try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
    } catch (e) { }

    if (pendingPlay) {
        pendingPlay = false;
        playMusic();
    }
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        isYtPlaying = true;
        updateMusicControl();
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        isYtPlaying = false;
        updateMusicControl();
        if (event.data === YT.PlayerState.ENDED) {
            try {
                ytPlayer.seekTo(0);
                ytPlayer.playVideo();
            } catch (e) { }
        }
    }
}

/*=========================================
PLAY MUSIC
=========================================*/

function playMusic() {
    if (!ytPlayerReady || !ytPlayer || typeof ytPlayer.playVideo !== "function") {
        pendingPlay = true;
        return;
    }

    try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
        ytPlayer.playVideo();
        isYtPlaying = true;
        updateMusicControl();
    } catch (err) {
        console.error("YouTube play error:", err);
    }
}

/*=========================================
PAUSE MUSIC
=========================================*/

function pauseMusic() {
    if (!ytPlayerReady || !ytPlayer || typeof ytPlayer.pauseVideo !== "function") return;

    try {
        ytPlayer.pauseVideo();
        isYtPlaying = false;
        updateMusicControl();
    } catch (e) { }
}

/*=========================================
RESUME MUSIC
=========================================*/

function resumeMusic() {
    if (!ytPlayerReady || !ytPlayer || typeof ytPlayer.playVideo !== "function") {
        pendingPlay = true;
        return;
    }

    try {
        ytPlayer.unMute();
        ytPlayer.setVolume(100);
        ytPlayer.playVideo();
        isYtPlaying = true;
        updateMusicControl();
    } catch (err) {
        console.error("YouTube resume error:", err);
    }
}

/*=========================================
TOGGLE MUSIC
=========================================*/

function toggleMusic() {
    if (!ytPlayerReady || !ytPlayer) return;

    if (!isYtPlaying) {
        resumeMusic();
    } else {
        pauseMusic();
    }
}

/*=========================================
FADE MUSIC
=========================================*/

function fadeMusicVolume(target, duration) {
    if (!ytPlayerReady || !ytPlayer || typeof ytPlayer.getVolume !== "function") return;

    if (ytFadeTimer) {
        clearInterval(ytFadeTimer);
    }

    let start = 0;
    try {
        start = ytPlayer.getVolume() || 0;
    } catch (e) { }

    const fps = 30;
    const interval = 1000 / fps;
    const total = Math.max(1, Math.floor(duration / interval));
    let frame = 0;

    ytFadeTimer = setInterval(() => {
        frame++;
        const currentVol = Math.round(start + (target - start) * (frame / total));
        try {
            ytPlayer.setVolume(Math.min(100, Math.max(0, currentVol)));
        } catch (e) { }

        if (frame >= total) {
            try {
                ytPlayer.setVolume(target);
            } catch (e) { }
            clearInterval(ytFadeTimer);
            ytFadeTimer = null;
        }
    }, interval);
}

/*=========================================
MUSIC CONTROL
=========================================*/

function updateMusicControl() {
    if (!musicControl || !musicIcon) return;

    if (!isYtPlaying) {
        musicControl.classList.add("pause");
        musicIcon.textContent = "▶";
    } else {
        musicControl.classList.remove("pause");
        musicIcon.textContent = "❚❚";
    }
}

if (musicControl) {
    musicControl.addEventListener("click", toggleMusic);
}

updateMusicControl();

/* ========================================
   RANDOM
======================================== */

function rand(min, max) {
    return Math.random() * (max - min) + min;
}

/* ========================================
   FULLSCREEN
======================================== */

function openFullscreen() {

    const el = document.documentElement;

    if (el.requestFullscreen) {
        el.requestFullscreen().catch(() => { });
    } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
    }

}

/* ========================================
   HEART
======================================== */

function createHeart(x, y) {
    const heart = document.createElement("div");

    heart.className = "heart";
    heart.innerHTML = "❤";

    heart.style.left = x + "px";
    heart.style.top = y + "px";
    heart.style.fontSize = rand(16, 38) + "px";

    heartContainer.appendChild(heart);

    return heart;

}

/* ========================================
   BURST
======================================== */

function burst() {

    const targetEl = document.getElementById("giftBtn") || openBtn || document.body;
    const rect = targetEl.getBoundingClientRect();

    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    heartContainer.prepend(burstCenter);

    burstCenter.style.left = cx + "px";
    burstCenter.style.top = cy + "px";

    burstCenter.classList.remove("hide");
    burstCenter.classList.add("show");

    const gameCard = document.getElementById("gameCard") || document.querySelector(".section1-card");
    if (gameCard) {
        gameCard.classList.add("fade-out");
        gameCard.style.opacity = "0";
        gameCard.style.pointerEvents = "none";
        gameCard.style.transform = "scale(0.8) translateY(-20px)";
        setTimeout(() => {
            gameCard.style.display = "none";
        }, 400);
    }

    if (openBtn) openBtn.style.display = "none";
    if (targetEl) targetEl.style.pointerEvents = "none";

    setTimeout(() => {

        burstCenter.classList.remove("show");
        burstCenter.classList.add("hide");

    }, 2500);

    setTimeout(() => {

        for (let i = 0; i < COUNT; i++) {

            setTimeout(() => {

                const heart = createHeart(cx, cy);

                const angle = Math.random() * Math.PI * 2;
                const dist = rand(250, 450);

                heart.style.setProperty("--x", Math.cos(angle) * dist + "px");
                heart.style.setProperty("--y", Math.sin(angle) * dist + "px");

                heart.style.animation = `burst ${rand(2.2, 3.6)}s ease-out forwards`;

                hearts.push(heart);

            }, i * 5);

        }

    }, 550);

}

/* ========================================
   REMOVE BURST
======================================== */

function removeBurst() {

    hearts.forEach(heart => {

        heart.style.transition = "opacity 1.4s";
        heart.style.opacity = 0;

        setTimeout(() => {

            heart.remove();

        }, 1400);

    });

    hearts.length = 0;

}

/* ========================================
   FLOATING HEART
======================================== */

function createFloatingHeart() {

    const heart = document.createElement("div");

    heart.className = "heart";
    heart.innerHTML = "❤";

    heart.style.left = Math.random() * window.innerWidth + "px";
    heart.style.top = window.innerHeight + 40 + "px";
    heart.style.fontSize = rand(10, 24) + "px";

    heart.style.setProperty("--fx", rand(-120, 120) + "px");

    heart.style.animation =
        `float ${rand(8, 14)}s linear forwards`;

    heartContainer.appendChild(heart);

    heart.addEventListener("animationend", () => {

        heart.remove();

    });

}

/* ========================================
   START FLOAT
======================================== */

function startFloating() {

    for (let i = 0; i < 20; i++) {

        setTimeout(() => {

            createFloatingHeart();

        }, i * 400);

    }

    setInterval(() => {

        createFloatingHeart();

    }, 700);

}

/* ========================================
   LETTER ANIMATION
======================================== */

function prepareLetters() {

    document.querySelectorAll(".message-content h2").forEach(title => {

        const words = title.textContent.trim().split(" ");

        title.innerHTML = "";

        words.forEach((word, index) => {

            const wordSpan = document.createElement("span");

            wordSpan.className = "word";

            [...word].forEach(letter => {

                const span = document.createElement("span");

                span.textContent = letter;

                span.style.animationDelay =
                    prepareLetters.delay + "s";

                prepareLetters.delay += rand(.03, .08);

                wordSpan.appendChild(span);

            });

            title.appendChild(wordSpan);

            if (index < words.length - 1) {

                title.appendChild(document.createTextNode(" "));

                prepareLetters.delay += .08;

            }

        });

        prepareLetters.delay += .3;

    });

}

prepareLetters.delay = 0;


/* ========================================
   WRAP SCATTER LETTERS
======================================== */

function wrapScatterLetters() {

    document
        .querySelectorAll("#section2 .word span")
        .forEach(letter => {

            if (letter.parentElement.classList.contains("scatter")) return;

            const wrapper = document.createElement("span");

            wrapper.className = "scatter";

            letter.parentNode.insertBefore(wrapper, letter);

            wrapper.appendChild(letter);

        });

    document.querySelectorAll(".scatter").forEach((letter, index) => {

        if (index % 2 === 0) {

            letter.style.transform = "translateY(-20px) rotate(20deg)";

        }

    });

}

/* ========================================
   OPEN
======================================== */

function openInvitation() {

    playMusic();
    openFullscreen();
    burst();
    setTimeout(() => {

        document
            .getElementById("section1")
            .classList.remove("active");

        const story =
            document.getElementById("story");

        story.classList.add("active");

        currentSection = story;

        story.querySelector(".page-scroll").scrollTop = 0;

    }, 4150);

    startFloating();

}

/* ========================================
   MINI GAME GEMASH LOGIC
======================================== */

const giftBtn = document.getElementById("giftBtn");
const giftEmoji = document.getElementById("giftEmoji");
const gameBubble = document.getElementById("gameBubble");
const bubbleText = document.getElementById("bubbleText");
const gameProgressBar = document.getElementById("gameProgressBar");
const progressVal = document.getElementById("progressVal");
const milestones = document.querySelectorAll(".milestone");

let tapCount = 0;
const MAX_TAPS = 5;
let isGameCompleted = false;

const bubbleSteps = [
    "Ketuk kadonya dong, penasaran gak? 🥺",
    "Ehh kadonya mulai goyang! Ada apa ya? 🎁✨",
    "Denger suara musik gak di dalem? 👀💖",
    "Dikit lagiii, ayo ketuk terus! 😆🔥",
    "SIAP-SIAP... 3.. 2.. 1.. 🚀🎉",
    "YAAAY! SELAMAT ULANG TAHUN Sayang! 🎂🎉💖"
];

const emojiSteps = ["🎁", "🎁", "🎁", "🎁", "🎁", "🎉"];

let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx && audioCtx.state === "suspended") {
        audioCtx.resume();
    }
    return audioCtx;
}

function playCutePop(step) {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        const freqs = [523.25, 659.25, 783.99, 880.00, 1046.50];
        const baseFreq = freqs[Math.min(step - 1, freqs.length - 1)] || 520;

        osc.type = "sine";
        osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.12);

        gain.gain.setValueAtTime(0.28, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.13);
    } catch (e) { }
}

function playWinFanfare() {
    try {
        const ctx = getAudioContext();
        if (!ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
        notes.forEach((freq, idx) => {
            setTimeout(() => {
                try {
                    const osc = ctx.createOscillator();
                    const gain = ctx.createGain();
                    osc.type = "triangle";
                    osc.frequency.setValueAtTime(freq, ctx.currentTime);
                    gain.gain.setValueAtTime(0.3, ctx.currentTime);
                    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
                    osc.connect(gain);
                    gain.connect(ctx.destination);
                    osc.start();
                    osc.stop(ctx.currentTime + 0.3);
                } catch (e) { }
            }, idx * 95);
        });
    } catch (e) { }
}

function createTapParticle(x, y) {
    const particle = document.createElement("div");
    particle.className = "tap-particle";
    const icons = ["💖", "✨", "⭐", "🌸", "🎀", "🎉", "🍬", "🍰"];
    particle.textContent = icons[Math.floor(Math.random() * icons.length)];

    particle.style.left = (x - 12) + "px";
    particle.style.top = (y - 12) + "px";

    const px = (Math.random() - 0.5) * 90;
    const py = -rand(50, 110);
    const pr = (Math.random() - 0.5) * 80;

    particle.style.setProperty("--px", px + "px");
    particle.style.setProperty("--py", py + "px");
    particle.style.setProperty("--pr", pr + "deg");

    document.body.appendChild(particle);
    setTimeout(() => particle.remove(), 1000);
}

function handleGiftTap(e) {
    if (isGameCompleted) return;

    let clientX = window.innerWidth / 2;
    let clientY = window.innerHeight / 2;

    if (e) {
        if (e.touches && e.touches[0]) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else if (e.clientX && e.clientY) {
            clientX = e.clientX;
            clientY = e.clientY;
        }
    }

    // Aktifkan izin audio browser pada interaksi pertama user
    try {
        getAudioContext();
        if (ytPlayer && typeof ytPlayer.unMute === "function") {
            ytPlayer.unMute();
        }
    } catch (err) { }

    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            createTapParticle(clientX + (Math.random() - 0.5) * 30, clientY + (Math.random() - 0.5) * 30);
        }, i * 25);
    }

    tapCount++;
    playCutePop(tapCount);

    const progressPercent = (tapCount / MAX_TAPS) * 100;
    if (gameProgressBar) {
        gameProgressBar.style.width = progressPercent + "%";
    }
    if (progressVal) {
        progressVal.textContent = `${tapCount} / ${MAX_TAPS} 💖`;
    }

    milestones.forEach((m, idx) => {
        if (idx < tapCount) {
            m.classList.add("active");
            m.textContent = "🩷";
        }
    });

    if (bubbleText && bubbleSteps[tapCount]) {
        bubbleText.textContent = bubbleSteps[tapCount];
        if (gameBubble) {
            gameBubble.classList.remove("pop");
            void gameBubble.offsetWidth;
            gameBubble.classList.add("pop");
        }
    }

    if (giftBtn) {
        giftBtn.classList.remove("stage-1", "stage-2", "stage-3", "stage-4");
        if (tapCount < MAX_TAPS) {
            giftBtn.classList.add(`stage-${tapCount}`);
        }
    }

    if (giftEmoji && emojiSteps[tapCount]) {
        giftEmoji.textContent = emojiSteps[tapCount];
    }

    if (tapCount >= MAX_TAPS) {
        isGameCompleted = true;
        playWinFanfare();

        setTimeout(() => {
            openInvitation();
        }, 550);
    }
}

/* ========================================
   LOAD
======================================== */

window.addEventListener("load", () => {

    prepareLetters();

    if (giftBtn) {
        giftBtn.addEventListener("click", handleGiftTap);
    }

    if (openBtn) {
        openBtn.addEventListener("click", openInvitation);
    }

});

/* ========================================
   ACTIVE SECTION
======================================== */

let currentSection = document.querySelector(".page.active");
let isAnimating = false;

/* ========================================
   SHOW SECTION
======================================== */

function showSection(id) {

    if (isAnimating) return;

    const next = document.getElementById(id);

    if (!next) return;

    isAnimating = true;

    currentSection.classList.add("fade-out");

    setTimeout(() => {

        currentSection.classList.remove("active");
        currentSection.classList.remove("fade-out");

        currentSection.querySelectorAll(".tap-next").forEach(el => {
            el.classList.remove("show");
        });

        next.classList.add("active");
        next.classList.add("fade-in");

        if (id === "story") {

            const scroll = next.querySelector(".page-scroll");

            if (scroll) {

                scroll.scrollTop = 0;

            }

        }

        setTimeout(() => {

            next.classList.remove("fade-in");

            const tap = next.querySelector(".tap-next");

            if (tap) {

                tap.classList.add("show");

            }

            currentSection = next;
            isAnimating = false;

        }, 900);

    }, 700);

}

/* ========================================
   GREETING ANIMATION
======================================== */

function playGreetingAnimation() {

    const section = document.getElementById("section3");

    const items = section.querySelectorAll(
        ".greeting-subtitle,.greeting-title,.greeting-text,.greeting-sign"
    );

    items.forEach(item => {

        item.style.animation = "none";

    });

    void section.offsetWidth;

    items.forEach(item => {

        item.style.animation = "";

    });

}


/* ========================================
   PREVENT TAP WHILE SCROLLING
======================================== */

document.querySelectorAll(".page-scroll").forEach(scroll => {

    let moved = false;

    scroll.addEventListener("touchmove", () => {

        moved = true;

    });

    scroll.addEventListener("touchend", () => {

        setTimeout(() => {

            moved = false;

        }, 100);

    });

    scroll.addEventListener("click", function (e) {

        if (moved) {

            e.stopPropagation();

        }

    });

});

/* ========================================
   RESET SCROLL
======================================== */

function resetScroll(section) {

    const box = section.querySelector(".page-scroll");

    if (box) {

        box.scrollTop = 0;

    }

}

/* ========================================
   UPDATE SHOW SECTION
======================================== */

const oldShowSection = showSection;

showSection = function (id) {

    const next = document.getElementById(id);

    if (next) {

        resetScroll(next);
        updateScrollProgress();
    }

    oldShowSection(id);

};


/*=========================================
AUTO SCROLL SECTION 2 -> SECTION 3
=========================================*/

const pageScroll = document.querySelector("#story .page-scroll");
const section3 = document.getElementById("section3");
const scrollHint = document.querySelector("#section2 .scroll-hint");
const scrollProgressBar = document.getElementById("scrollProgressBar");

let touchStartY = 0;

function goToSection3() {

    pageScroll.scrollTo({
        top: section3.offsetTop,
        behavior: "smooth"
    });

}

/*=========================================
SCROLL PROGRESS
=========================================*/

function updateScrollProgress() {

    const max =
        pageScroll.scrollHeight -
        pageScroll.clientHeight;

    const percent =
        Math.min(
            pageScroll.scrollTop / max,
            1
        );

    scrollProgressBar.style.width =
        percent * 100 + "%";

}

pageScroll.addEventListener(
    "scroll",
    updateScrollProgress
);

updateScrollProgress();

/*=========================================
SCROLL HINT CLICK
=========================================*/

scrollHint.style.pointerEvents = "auto";

scrollHint.addEventListener("click", () => {

    goToSection3();

});



/*=========================================
SCROLL HINT FADE
=========================================*/

pageScroll.addEventListener("scroll", () => {

    const progress = Math.min(pageScroll.scrollTop / 120, 1);

    scrollHint.style.animation = "none";
    scrollHint.style.opacity = 1 - progress;

});

/*=========================================
SCROLLING ANIMATION
=========================================*/

const sectionObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, {
    threshold: 0.05,
    rootMargin: "0px 0px -10% 0px"
});

document.querySelectorAll(".section-content").forEach(section => {

    sectionObserver.observe(section);

});


/*=========================================
 ANIMATION
=========================================*/

// Story Card
const storyCards = document.querySelectorAll(".story-card");

const storyObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: .15
});

storyCards.forEach(card => {

    storyObserver.observe(card);

});


// reveal animation

const revealObserver = new IntersectionObserver(entries => {

    entries.forEach(entry => {

        if (entry.isIntersecting) {

            entry.target.classList.add("show");

        }

    });

}, {
    threshold: 0,
    rootMargin: "0px 0px -150px 0px"
});

document.querySelectorAll(".reveal").forEach((el, index) => {

    el.style.transitionDelay = (index % 6) * 0.12 + "s";

    revealObserver.observe(el);

});


/*=========================================
LETTER OPEN + HUMAN TYPING
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    const envelope = document.querySelector(".letter-envelope");
    const nameBox = document.querySelector(".name-box");
    const typing = document.querySelector(".typing-text");

    if (!envelope || !nameBox || !typing) return;

    const text = typing.textContent.trim();

    typing.textContent = "";

    function randomDelay(index) {

        const char = text[index];
        const next = text[index + 1];

        // kecepatan dasar
        let delay = 15 + Math.random() * 20;

        // selama masih satu kata jangan berhenti
        if (next && next !== " " && next !== "\n") {
            return delay;
        }

        // selesai satu kata
        delay += 20 + Math.random() * 40;

        // koma
        if (char === ",") {
            delay += 120 + Math.random() * 80;
        }

        // titik
        if (char === "." || char === "!" || char === "?") {
            delay += 350 + Math.random() * 250;
        }

        // paragraf baru
        if (char === "\n") {
            delay += 800;
        }

        // sesekali seperti berpikir
        if (Math.random() < 0.03) {
            delay += 300 + Math.random() * 500;
        }

        return delay;

    }

    function typeWriter(index) {

        if (index >= text.length) {

            typing.classList.remove("typing");
            typing.classList.add("done");

            return;

        }

        typing.textContent += text[index];

        setTimeout(() => {

            typeWriter(index + 1);

        }, randomDelay(index));

    }

    envelope.addEventListener("click", () => {

        envelope.classList.add("hide");

        setTimeout(() => {

            envelope.style.display = "none";

            nameBox.classList.add("show");

            setTimeout(() => {

                typing.classList.add("typing");
                typeWriter(0);

            }, 600);

        }, 400);

    });

});


/*=========================================
SECTION 5 - GALLERY
=========================================*/

const lockScreen = document.getElementById("lockScreen");
const gallery = document.getElementById("gallery");
const unlockGalleryBtn = document.getElementById("unlockGalleryBtn");

const preview = document.getElementById("preview");
const previewImage = document.getElementById("previewImage");
const closePreview = document.getElementById("closePreview");
const galleryPhotos = document.querySelectorAll(".polaroid-card");

function unlockGallery() {
    if (!lockScreen || !gallery) return;

    lockScreen.classList.add("hide");

    // Play cute chime sound if available
    try {
        const ctx = getAudioContext();
        if (ctx) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(659.25, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1046.50, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.25, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        }
    } catch (e) { }

    setTimeout(() => {
        lockScreen.style.display = "none";
        gallery.classList.add("show");
    }, 450);
}

if (unlockGalleryBtn) {
    unlockGalleryBtn.addEventListener("click", unlockGallery);
} else if (lockScreen) {
    lockScreen.addEventListener("click", unlockGallery);
}

if (galleryPhotos) {
    galleryPhotos.forEach(card => {
        card.addEventListener("click", () => {
            const img = card.querySelector("img");
            if (img && previewImage && preview) {
                previewImage.src = img.src;
                preview.classList.add("show");
            }
        });
    });
}

function closeViewer() {
    if (preview) {
        preview.classList.remove("show");
    }
}

if (closePreview) {
    closePreview.addEventListener("click", closeViewer);
}

if (preview) {
    preview.addEventListener("click", e => {
        if (
            e.target === preview ||
            e.target.classList.contains("preview-bg")
        ) {
            closeViewer();
        }
    });
}

document.addEventListener("keydown", e => {
    if (
        e.key === "Escape" &&
        preview &&
        preview.classList.contains("show")
    ) {
        closeViewer();
    }
});

/*=========================================
SECTION 6
=========================================*/

const s6Title = document.getElementById("s6Title");
const s6Divider = document.querySelector("#section6 .story-divider");
const s6Subtitle = document.getElementById("s6Subtitle");
const s6StartBtn = document.getElementById("s6StartBtn");
const s6Loading = document.getElementById("s6Loading");
const s6CandleArea = document.getElementById("s6CandleArea");
const s6Candle = document.getElementById("s6Candle");
const s6TapText = document.getElementById("s6TapText");
const s6Flame = document.getElementById("s6Flame");
const s6Overlay = document.getElementById("s6Overlay");
const s6Flash = document.getElementById("s6Flash");
const s6Ending = document.getElementById("s6Ending");
const s6Music = document.getElementById("music");
const s6Canvas = document.getElementById("s6ConfettiCanvas");
const s6Ctx = s6Canvas.getContext("2d");

let s6Dpr = Math.min(window.devicePixelRatio || 1, 2);
let s6Confetti;
let s6Blown = false;

/*=========================================
CONFETTI ENGINE
=========================================*/

class Section6ConfettiEngine {

    constructor(canvas) {

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.width = 0;
        this.height = 0;
        this.particles = [];
        this.running = false;
        this.lastTime = 0;
        this.gravity = .08;
        this.drag = .998;
        this.wind = .003;
        this.maxParticles =
            window.innerWidth < 768
                ? 400
                : 720;

        this.resize();

        window.addEventListener(
            "resize",
            () => this.resize()
        );

    }

    resize() {

        s6Dpr = Math.min(
            window.devicePixelRatio || 1,
            2
        );

        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        this.canvas.width = this.width * s6Dpr;
        this.canvas.height = this.height * s6Dpr;

        this.ctx.setTransform(
            s6Dpr,
            0,
            0,
            s6Dpr,
            0,
            0
        );

    }

    launch() {

        this.createBurst(
            this.width * .25,
            this.height
        );

        setTimeout(() => {

            this.createBurst(
                this.width * .5,
                this.height
            );

        }, 150);

        setTimeout(() => {

            this.createBurst(
                this.width * .75,
                this.height
            );

        }, 300);

        if (!this.running) {

            this.running = true;
            this.lastTime = performance.now();

            requestAnimationFrame(
                this.animate.bind(this)
            );

        }

    }

    createBurst(originX, originY) {

        const total = Math.floor(
            this.maxParticles / 3
        );

        for (let i = 0; i < total; i++) {

            this.particles.push(
                this.createParticle(
                    originX,
                    originY
                )
            );

        }

    }

    createParticle(x, y) {

        const colors = [
            "#ff4d6d",
            "#ff8fab",
            "#ffd54f",
            "#ffffff",
            "#80d8ff",
            "#7cff9d",
            "#ffa010",
            "#b388ff"
        ];

        const shapes = [
            "circle",
            "star",
            "heart"
        ];

        const angle =
            (-115 + Math.random() * 60)
            * Math.PI / 180;

        const speed =
            8 + Math.random() * 10;

        return {

            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            size: 3 + Math.random() * 4,
            color: colors[
                Math.floor(
                    Math.random() * colors.length
                )
            ],
            shape: shapes[
                Math.floor(
                    Math.random() * shapes.length
                )
            ],
            rotation:
                Math.random() * 360,
            rotationSpeed:
                (Math.random() - .5) * 13,
            opacity: 1,
            life: 0,
            maxLife:
                360 +
                Math.random() * 180

        };

    }

    animate(time) {

        const delta =
            (time - this.lastTime)
            / 16.666;

        this.lastTime = time;

        this.update(delta);
        this.draw();

        if (this.running) {

            requestAnimationFrame(
                this.animate.bind(this)
            );

        }

    }

    update(delta) {

        for (
            let i = this.particles.length - 1;
            i >= 0;
            i--
        ) {

            const p = this.particles[i];

            p.life += delta;

            p.vx *= Math.pow(
                this.drag,
                delta
            );

            p.vy *= Math.pow(
                this.drag,
                delta
            );

            p.vx += this.wind * delta;
            p.vy += this.gravity * delta;

            p.x += p.vx * delta;
            p.y += p.vy * delta;

            p.rotation +=
                p.rotationSpeed * delta;

            if (
                p.life >
                p.maxLife * .75
            ) {

                p.opacity =
                    1 -
                    (
                        (p.life - p.maxLife * .75)
                        /
                        (p.maxLife * .25)
                    );

            } else {

                p.opacity = 1;

            }

            if (
                p.life >= p.maxLife ||
                p.y > this.height + 80
            ) {

                this.particles.splice(
                    i,
                    1
                );

            }

        }

        if (
            this.particles.length === 0 &&
            this.running
        ) {

            this.running = false;

        }

    }

    draw() {

        this.ctx.clearRect(
            0,
            0,
            this.width,
            this.height
        );

        for (
            const p of this.particles
        ) {

            this.ctx.save();

            this.ctx.globalAlpha =
                p.opacity;

            this.ctx.translate(
                p.x,
                p.y
            );

            this.ctx.rotate(
                p.rotation *
                Math.PI /
                180
            );

            this.ctx.fillStyle =
                p.color;

            switch (p.shape) {

                case "circle":
                    this.drawCircle(
                        p.size
                    );
                    break;

                case "star":
                    this.drawStar(
                        p.size
                    );
                    break;

                case "heart":
                    this.drawHeart(
                        p.size
                    );
                    break;

            }

            this.ctx.restore();

        }

    }

    drawCircle(size) {

        this.ctx.beginPath();

        this.ctx.arc(
            0,
            0,
            size * .5,
            0,
            Math.PI * 2
        );

        this.ctx.fill();

    }

    drawStar(size) {

        const spikes = 5;
        const outer = size;
        const inner = size * .45;

        this.ctx.beginPath();

        for (
            let i = 0;
            i < spikes * 2;
            i++
        ) {

            const r =
                i % 2 === 0
                    ? outer
                    : inner;

            const a =
                Math.PI /
                spikes *
                i;

            const x =
                Math.cos(a) * r;

            const y =
                Math.sin(a) * r;

            if (i === 0) {

                this.ctx.moveTo(
                    x,
                    y
                );

            } else {

                this.ctx.lineTo(
                    x,
                    y
                );

            }

        }

        this.ctx.closePath();
        this.ctx.fill();

    }

    drawHeart(size) {

        this.ctx.beginPath();

        this.ctx.moveTo(
            0,
            size * .3
        );

        this.ctx.bezierCurveTo(
            size,
            -size * .7,
            size * 1.7,
            size * .5,
            0,
            size * 1.5
        );

        this.ctx.bezierCurveTo(
            -size * 1.7,
            size * .5,
            -size,
            -size * .7,
            0,
            size * .3
        );

        this.ctx.fill();

    }

}

s6Confetti =
    new Section6ConfettiEngine(
        s6Canvas
    );


/*=========================================
TIUP LILIN
=========================================*/

if (s6Candle) {
    s6Candle.addEventListener("click", blowSection6Candle);
}

if (s6TapText) {
    s6TapText.addEventListener("click", blowSection6Candle);
}

function blowSection6Candle() {

    if (s6Blown) return;

    s6Blown = true;

    if (s6Flame) s6Flame.classList.add("out");

    fadeMusicVolume(0.15, 1800);

    if (s6Overlay) s6Overlay.classList.add("show");

    setTimeout(() => {
        if (s6CandleArea) s6CandleArea.classList.add("s6-fade-out");
    }, 4000);

    setTimeout(() => {
        if (s6CandleArea) s6CandleArea.style.display = "none";
    }, 4500);

    setTimeout(() => {
        if (s6Overlay) s6Overlay.classList.remove("show");
        if (s6Flash) s6Flash.classList.add("show");

        fadeMusicVolume(1, 1800);

        if (s6Confetti) {
            s6Confetti.resize();
            s6Confetti.launch();
        }
    }, 4800);

    setTimeout(() => {
        if (s6Flash) s6Flash.classList.remove("show");
    }, 5200);

    setTimeout(() => {
        if (s6Ending) s6Ending.classList.add("show");
    }, 5300);

}