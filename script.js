document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const nameScreen = document.getElementById('name-screen');
    const proposalScreen = document.getElementById('proposal-screen');
    const successScreen = document.getElementById('success-screen');

    // Element Refs
    const nameInput = document.getElementById('name-input');
    const nextBtn = document.getElementById('next-btn');
    const proposalText = document.getElementById('proposal-text');
    const yesBtn = document.getElementById('yes-btn');
    const noBtn = document.getElementById('no-btn');
    const finalMessage = document.getElementById('final-message');
    const quotesContainer = document.getElementById('quotes-container');
    const restartBtn = document.getElementById('restart-btn');

    let userName = '';

    // Romantic Quotes
    const quotes = [
        "In all the world, there is no heart for me like yours.",
        "I love you right up to the moon—and back.",
        "You are my sun, my moon, and all my stars.",
        "I seem to have loved you in numberless forms, numberless times...",
        "Darkness cannot drive out darkness: only light can do that. Hate cannot drive out hate: only love can do that.",
        "To love and be loved is to feel the sun from both sides.",
        "I swear I couldn't love you more than I do right now, and yet I know I will tomorrow.",
    ];

    // Enable Next button when name is entered
    nameInput.addEventListener('input', () => {
        if (nameInput.value.trim().length > 0) {
            nextBtn.disabled = false;
        } else {
            nextBtn.disabled = true;
        }
    });

    // Go to Proposal Screen
    nextBtn.addEventListener('click', () => {
        userName = nameInput.value.trim();
        if (userName) {
            // Updated to innerHTML to support styling
            proposalText.innerHTML = `<span class="premium-name">${userName}</span>,<br>will you be my Valentine?`;
            switchScreen(nameScreen, proposalScreen);
        }
    });

    // Logic: Smart "No" Button Evasion
    let lastTextUpdate = 0;
    let interactionStart = 0;
    const moveNoButton = (e) => {
        const container = document.querySelector('.container');
        const containerRect = container.getBoundingClientRect();
        const btnRect = noBtn.getBoundingClientRect();

        // Pleading phrases
        const pleadings = [
            "Please 🥺",
            "Don't do this 💔",
            "Think again 💭",
            "I'll be sad 😿",
            "Give me a chance 💝",
            "Really? 😢",
            "Aw, come on! 🌹"
        ];

        // Change text to random pleading (Throttle: 1s, Delay: 1s)
        const now = Date.now();
        if (interactionStart === 0) interactionStart = now;

        if (now - interactionStart > 1000 && now - lastTextUpdate > 1000) {
            noBtn.innerText = pleadings[Math.floor(Math.random() * pleadings.length)];
            lastTextUpdate = now;
        }

        // Button center position relative to viewport
        const btnCenterX = btnRect.left + btnRect.width / 2;
        const btnCenterY = btnRect.top + btnRect.height / 2;

        // Cursor position
        let cursorX, cursorY;
        if (e.type.includes('touch')) {
            cursorX = e.touches[0].clientX;
            cursorY = e.touches[0].clientY;
        } else {
            cursorX = e.clientX;
            cursorY = e.clientY;
        }

        // Distance between cursor and button center
        const distX = cursorX - btnCenterX;
        const distY = cursorY - btnCenterY;
        const distance = Math.sqrt(distX * distX + distY * distY);

        // Proximity radius to trigger movement (Force Field)
        const proximity = 150;

        // If cursor is within range, move away
        if (distance < proximity) {
            // Calculate direction to move (away from cursor)
            const angle = Math.atan2(distY, distX);

            // Move distance based on how close the cursor is (closer = faster/further)
            const moveStep = 30 + (proximity - distance) * 0.5;

            // New position relative to current
            // We need current 'left' 'top' relative to container
            // Ensure button is absolute
            if (noBtn.style.position !== 'absolute') {
                noBtn.style.position = 'absolute';
                noBtn.style.left = (btnRect.left - containerRect.left) + 'px';
                noBtn.style.top = (btnRect.top - containerRect.top) + 'px';
            }

            let currentLeft = parseFloat(noBtn.style.left) || 0;
            let currentTop = parseFloat(noBtn.style.top) || 0;

            // Move AWAY: subtract cos/sin because angle is TO cursor
            let newLeft = currentLeft - Math.cos(angle) * moveStep;
            let newTop = currentTop - Math.sin(angle) * moveStep;

            // Boundary Check & Corner Escape
            const padding = 20;
            const maxLeft = container.clientWidth - noBtn.offsetWidth - padding;
            const maxTop = container.clientHeight - noBtn.offsetHeight - padding;

            // Clamp values
            if (newLeft < padding) newLeft = padding;
            if (newLeft > maxLeft) newLeft = maxLeft;
            if (newTop < padding) newTop = padding;
            if (newTop > maxTop) newTop = maxTop;

            // Corner / Wall Logic:
            // If we are pinned against a wall/corner AND cursor is still very close,
            // we need to strictly escape.
            if (distance < 50) {
                // Teleport to center logic if stuck? 
                // Or just random jump if really stuck
                if (
                    (newLeft <= padding || newLeft >= maxLeft) &&
                    (newTop <= padding || newTop >= maxTop)
                ) {
                    newLeft = Math.random() * (maxLeft - padding) + padding;
                    newTop = Math.random() * (maxTop - padding) + padding;
                }
            }

            // Apply smooth transition
            noBtn.style.transition = 'all 0.2s ease-out';
            noBtn.style.left = `${newLeft}px`;
            noBtn.style.top = `${newTop}px`;
            noBtn.style.zIndex = '100';
        }
    };

    // Global listener for proximity detection
    // Only active when proposal screen is visible
    document.addEventListener('mousemove', (e) => {
        if (!proposalScreen.classList.contains('hidden')) {
            moveNoButton(e);
        }
    });

    // Touch support
    document.addEventListener('touchmove', (e) => {
        if (!proposalScreen.classList.contains('hidden')) {
            moveNoButton(e);
        }
    });

    // Legacy/Fail-safe listeners on the button itself
    noBtn.addEventListener('mouseover', (e) => {
        // Force a move if mouseover happens (lag overlap)
        moveNoButton(e);
    });
    noBtn.addEventListener('click', (e) => {
        e.preventDefault();
        // Super jump if clicked
        const container = document.querySelector('.container');
        const maxLeft = container.clientWidth - noBtn.offsetWidth - 20;
        const maxTop = container.clientHeight - noBtn.offsetHeight - 20;
        noBtn.style.left = Math.random() * maxLeft + 'px';
        noBtn.style.top = Math.random() * maxTop + 'px';
    });

    // "Yes" Button Logic
    yesBtn.addEventListener('click', () => {
        finalMessage.innerText = `I knew you'd say yes, ${userName}! ❤️`;
        displayRandomQuote();
        switchScreen(proposalScreen, successScreen);
        createConfetti();
    });

    restartBtn.addEventListener('click', () => {
        // Reset state
        nameInput.value = '';
        nextBtn.disabled = true;
        userName = '';

        // Reset "No" button style to default CSS (static in flexbox)
        noBtn.style.position = 'static';
        noBtn.style.transition = 'none';

        switchScreen(successScreen, nameScreen);
    });

    // Helper: Switch Screens
    function switchScreen(from, to) {
        from.classList.remove('active');
        from.classList.add('hidden');

        setTimeout(() => {
            to.classList.remove('hidden');
            to.classList.add('active');
        }, 100);
    }

    // Helper: Random Quote
    function displayRandomQuote() {
        if (quotes.length > 0) {
            const randomIndex = Math.floor(Math.random() * quotes.length);
            quotesContainer.innerText = `"${quotes[randomIndex]}"`;
        }
    }

    // Helper: Background Showering Mini Hearts
    function createHeart() {
        const heart = document.createElement('div');
        heart.classList.add('heart');
        heart.style.left = Math.random() * 100 + 'vw';
        heart.style.animationDuration = Math.random() * 5 + 5 + 's'; // 5-10s fall duration
        document.body.appendChild(heart);

        setTimeout(() => {
            heart.remove();
        }, 12000);
    }

    setInterval(createHeart, 200); // More frequent (200ms) for 'showering' effect

    // Vintage Confetti Effect (Rose Petals)
    function createConfetti() {
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.classList.add('confetti'); // Add class for styling
            // Standard Valentine's Emojis
            confetti.innerText = ['🌹', '❤️', '💌', '✨'][Math.floor(Math.random() * 4)];
            confetti.style.position = 'fixed';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.top = '-10vh';
            confetti.style.fontSize = Math.random() * 20 + 20 + 'px';
            confetti.style.zIndex = '2000';
            confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
            document.body.appendChild(confetti);

            setTimeout(() => confetti.remove(), 5000);
        }
    }

    // Add confetti animation style dynamically if not already added in CSS
    // (We add it via JS to keep it self-contained if needed, or rely on CSS)
    const style = document.createElement('style');
    style.innerHTML = `
        @keyframes fall {
            to { transform: translateY(110vh) rotate(360deg); }
        }
    `;
    document.head.appendChild(style);
});
