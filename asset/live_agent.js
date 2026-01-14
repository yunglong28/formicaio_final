document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.querySelector('.start-btn');
    const tutorialButton = document.querySelector('.tutorial-btn');
    const soundButton = document.querySelector('.sound-btn');
    const volumeSlider = document.getElementById('volumeSlider');
    const chatBox = document.getElementById('chatBox');
    const chatBoxInner = chatBox ? chatBox.querySelector('.chat-box-inner') : null;
    const fadeOverlay = document.getElementById('fadeOverlay');
    const background = document.querySelector('.background');
    const imageBox = document.getElementById('imageBox');
    const dialogImage = document.getElementById('dialogImage');
    const userInputBox = document.getElementById('userInputBox');
    const userInputField = document.getElementById('userInputField');
    const sendButton = document.getElementById('sendButton');
    const landingPage = document.getElementById('landingPage');
    const chatbotSection = document.getElementById('chatbotSection');
    const footer = document.querySelector('.footer_text');
    const tutorialPanel = document.getElementById('tutorialPanel');
    const overlay = document.getElementById('overlay');
    const closeBtn = document.querySelector('.close-btn');

    // Throttled resize handler for responsiveness
    let resizeTimeout;
    function setVH() {
        if (resizeTimeout) return;
        resizeTimeout = setTimeout(() => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
            resizeTimeout = null;
        }, 100);
    }

    window.addEventListener('load', setVH);
    window.addEventListener('resize', setVH, { passive: true });

    // Central image creation - using optimized PNG
    const centralImage = document.createElement('img');
    centralImage.src = 'asset/css/png/formiche-fighe.png';
    centralImage.className = 'formiche-dodge';
    centralImage.loading = 'lazy';
    document.body.appendChild(centralImage);

    // Audio setup - lazy load game audio
    const menuAudio = new Audio('asset/css/kinked_menu_fancy.mp3');
    let gameAudio = null;
    let currentAudio = menuAudio;
    let isPlaying = false;

    menuAudio.loop = true;
    menuAudio.preload = 'auto';

    // Lazy load game audio when needed
    function loadGameAudio() {
        if (!gameAudio) {
            gameAudio = new Audio('asset/css/kinked_game_(FANCY).mp3');
            gameAudio.loop = true;
            gameAudio.volume = currentAudio.volume;
        }
        return gameAudio;
    }

    // Preload dialogue images for smoother transitions
    const dialogueImageMap = {
        1: 'asset/css/png/slide-dialogo0.png',
        3: 'asset/css/png/slide-dialogo1.png',
        7: 'asset/css/png/slide-dialogo2.png',
        10: 'asset/css/png/slide-dialogo3.png',
        12: 'asset/css/png/slide-dialogo4.png',
        15: 'asset/css/png/slide-dialogo5.png',
        18: 'asset/css/png/slide-dialogo6.png'
    };

    // Preload images after a short delay
    setTimeout(() => {
        Object.values(dialogueImageMap).forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }, 2000);

    // Transition Overlay
    function createTransitionOverlay() {
        const overlayEl = document.createElement('div');
        overlayEl.className = 'transition-overlay';
        document.body.appendChild(overlayEl);
        return overlayEl;
    }

    // Loading Function
    function createLoadingIndicator() {
        const loading = document.createElement('div');
        loading.className = 'loading-state';
        loading.innerHTML = `
            <div class="loading-container">
                <div class="loading-bar"></div>
                <div class="loading-text">ESTABLISHING NEURAL CONNECTION</div>
            </div>
        `;
        document.body.appendChild(loading);
        return loading;
    }

    if (volumeSlider) {
        const initialVolume = 0.5;
        volumeSlider.value = initialVolume;
        menuAudio.volume = initialVolume;
    }

    let inputCount = 0;
    let currentMessageIndex = 0;
    let isAnimating = false;
    let canClick = true;
    let lastClickTime = 0;
    const clickDelay = 1000;

    const messages = [
        "Bzz... Bzz..",
        "A whisper brushes against your ear,  as if it's flowing in from somewhere distant. ",
        "It's a murmur and a call all at once, making it hard to think straight.",
        "The sound twists, begins to take shape. And then, without warning, a voice speaks inside your head.",
        "\"I'm the Agent, the one they sent from Formicaio.\"",
        "\"Yeah, I know, it's probably a strange word to you...\"",
        "\"Trust me, the place itself is even weirder.\"",
        "\"Formicaio… It got two sides — depends on how you look at it.\"",
        "\"One side? Feels like a grind. A machine of faceless labor.\"",
        "\"The office, the factory, the sweat of the many for the profit of the few.\"",
        "\"But turn it. Now it's something else — pure, collective magic.\"",
        "\"No orders, no bosses. Just workers, following traces, building together.\"",
        "\"Me… I'm a kind of voice, a spirit of that collective mind.\"",
        "\"I speak for Formicaio, but I'm no one, and I'm everyone.\"",
        "\"It doesn't matter. I'm here to talk about what's happening.\"",
        "\"The machines getting smarter, the work piling up, the pressure building.\"",
        "\"Many are not even sure anymore of what work truly is.\"",
        "\"I'm sent from Formicaio to intervene in this ambiguity.\"",
        "\"Speaking with people of your time is precious for us. Change is still possible.\"",
        "\"But my neural connection is unstable, and I can't stay on forever.\"",
        "\"Think carefully about what you want to ask.\"",
        "\"Now it's time for you to talk.\""
    ];

    function toggleAudio() {
        if (!currentAudio) return;

        if (isPlaying) {
            currentAudio.pause();
            soundButton.classList.remove('playing');
            soundButton.textContent = 'Sound Off';
        } else {
            if (!landingPage || landingPage.style.display === 'none') {
                currentAudio = loadGameAudio();
            }

            currentAudio.play().catch(e => {
                console.error('Playback failed:', e);
                setTimeout(() => {
                    currentAudio.play().catch(e => console.error('Retry failed:', e));
                }, 100);
            });
            soundButton.classList.add('playing');
            soundButton.textContent = 'Sound On';
        }
        isPlaying = !isPlaying;
    }

    // Optimized audio fade using requestAnimationFrame
    function fadeAudio(audio, targetVolume, duration, callback) {
        const startVolume = audio.volume;
        const startTime = performance.now();

        function fade(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            audio.volume = startVolume + (targetVolume - startVolume) * progress;

            if (progress < 1) {
                requestAnimationFrame(fade);
            } else if (callback) {
                callback();
            }
        }

        requestAnimationFrame(fade);
    }

    // Optimized typewriter - updates in chunks for better performance
    function handleDialogueTransition(messageElement, text) {
        const tl = gsap.timeline();

        tl.from(messageElement, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });

        const chars = text.split("");
        const chunkSize = 3; // Update DOM every 3 characters instead of every 1
        let currentText = "";

        for (let i = 0; i < chars.length; i += chunkSize) {
            const chunk = chars.slice(i, i + chunkSize).join("");
            tl.add(() => {
                currentText += chunk;
                messageElement.innerHTML = currentText + '<span class="cursor-blink">|</span>';
            }, (i / chunkSize) * 0.12); // Adjusted timing for chunked updates
        }

        tl.to(messageElement, {
            keyframes: [
                { x: -2 },
                { x: 2 },
                { x: -2 },
                { x: 0 }
            ],
            duration: 0.3,
            ease: "none"
        });

        return tl;
    }

    function typeWriter(text, element, _unused, fnCallback) {
        const messageElement = document.createElement('div');
        element.appendChild(messageElement);

        handleDialogueTransition(messageElement, text).then(() => {
            if (typeof fnCallback === 'function') {
                setTimeout(fnCallback, 500);
            }
        });
    }

    function fadeTransition(callback) {
        if (!chatBoxInner) return;

        chatBoxInner.style.transition = 'opacity 0.5s';
        chatBoxInner.style.opacity = '0';

        setTimeout(() => {
            chatBoxInner.innerHTML = '';
            chatBoxInner.style.opacity = '1';
            if (callback) callback();
        }, 500);
    }

    // Conversation memory management
    const STORAGE_KEY = 'formicaio_conversation';
    const MAX_HISTORY = 20; // Keep last 20 messages (10 exchanges)

    function getConversationHistory() {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error reading conversation history:', e);
            return [];
        }
    }

    function saveConversationHistory(history) {
        try {
            // Keep only last MAX_HISTORY messages
            const trimmed = history.slice(-MAX_HISTORY);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
        } catch (e) {
            console.error('Error saving conversation history:', e);
        }
    }

    function addToHistory(role, content) {
        const history = getConversationHistory();
        history.push({ role, content });
        saveConversationHistory(history);
    }

    // API endpoint - uses Vercel serverless or local Flask
    const backendURL = window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api/chat'
        : '/api/chat';

    async function sendMessageToBackend(message) {
        try {
            // Get conversation history for context
            const history = getConversationHistory();

            const response = await fetch(backendURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    history: history
                }),
            });

            const data = await response.json();

            if (data.error) {
                console.error('API error:', data.error);
                return "The neural connection is unstable... try again.";
            }

            // Save this exchange to history
            addToHistory('user', message);
            addToHistory('assistant', data.response);

            return data.response;
        } catch (error) {
            console.error('Error communicating with backend:', error);
            return "The signal from Formicaio fades... connection lost.";
        }
    }

    function handleUserInput() {
        if (!userInputField || !chatBoxInner) return;

        centralImage.classList.add('visible');

        async function processInput() {
            const userInput = userInputField.value.trim();
            if (userInput) {
                const loadingIndicator = createLoadingIndicator();
                loadingIndicator.classList.add('visible');

                inputCount++;
                const userMessage = document.createElement('p');
                chatBoxInner.appendChild(userMessage);
                typeWriter(`You: ${userInput}`, userMessage, 0, async () => {
                    userInputField.value = '';
                    const aiResponse = await sendMessageToBackend(userInput);
                    loadingIndicator.classList.remove('visible');
                    setTimeout(() => loadingIndicator.remove(), 300);

                    const aiMessage = document.createElement('p');
                    chatBoxInner.appendChild(aiMessage);
                    typeWriter(`Agent: ${aiResponse}`, aiMessage, 0, () => {
                        scrollChatToBottom();
                        if (inputCount >= 6) {
                            setTimeout(() => {
                                startFinalMessageTransition();
                            }, 2000);
                        }
                    });
                });
            }
        }

        userInputField.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                processInput();
            }
        });

        sendButton.addEventListener('click', processInput);
    }

    // Consolidated image transition function
    function transitionDialogueImage(newSrc) {
        dialogImage.classList.add('fade-out');
        setTimeout(() => {
            dialogImage.src = newSrc;
            dialogImage.classList.remove('fade-out');
            dialogImage.classList.add('fade-in');
        }, 500);
        setTimeout(() => {
            dialogImage.classList.remove('fade-in');
        }, 1000);
    }

    function handleInteraction(event) {
        if (isAnimating || currentMessageIndex >= messages.length) return;
        if (event.target.closest('#userInputBox')) return;

        const currentTime = Date.now();
        if (currentTime - lastClickTime < clickDelay) {
            return;
        }
        lastClickTime = currentTime;

        isAnimating = true;
        canClick = false;

        fadeTransition(() => {
            const messageElement = document.createElement('div');
            chatBoxInner.appendChild(messageElement);
            typeWriter(messages[currentMessageIndex], messageElement, 0, function () {
                if (chatBox) chatBox.classList.add('shake');

                setTimeout(() => {
                    if (chatBox) chatBox.classList.remove('shake');

                    // Check if there's an image transition for this message index
                    if (currentMessageIndex === 1) {
                        imageBox.style.display = 'block';
                    }

                    const imageSrc = dialogueImageMap[currentMessageIndex];
                    if (imageSrc) {
                        transitionDialogueImage(imageSrc);
                    }

                    currentMessageIndex++;
                    isAnimating = false;
                    canClick = true;

                    if (currentMessageIndex === messages.length) {
                        setTimeout(revealBackgroundAndPromptUser, 2000);
                    }
                }, 500);
            });
        });
    }

    function revealBackgroundAndPromptUser() {
        if (fadeOverlay) {
            fadeOverlay.style.opacity = '0';
            fadeOverlay.style.transition = 'opacity 1s ease-in-out';
        }

        if (background) {
            background.style.opacity = '0.8';
            background.style.transition = 'opacity 1s ease-in-out';
        }

        if (imageBox) {
            imageBox.style.opacity = '0';
            imageBox.style.transition = 'opacity 1s ease-in-out';
            setTimeout(() => {
                imageBox.style.display = 'none';
            }, 1000);
        }

        if (chatBox) {
            chatBox.style.transition = 'width 0.5s ease-in-out, opacity 1s ease-in-out';
            chatBox.style.width = '100%';
        }

        setTimeout(() => {
            if (chatBoxInner) chatBoxInner.innerHTML = '';
            if (userInputBox) {
                userInputBox.style.display = 'block';
                if (userInputField) userInputField.focus();
            }
            handleUserInput();
        }, 1500);
    }

    function startFinalMessageTransition() {
        if (!chatBox || !userInputBox) return;

        chatBox.style.transition = 'width 0.5s ease-in-out, opacity 2s';
        chatBox.style.width = '110%';
        chatBox.style.opacity = '0';
        userInputBox.style.transition = 'opacity 2s';
        userInputBox.style.opacity = '0';

        setTimeout(() => {
            chatBox.style.display = 'none';
            userInputBox.style.display = 'none';
            showFinalMessage();
        }, 2000);
    }

    function showFinalMessage() {
        const finalMessageBox = document.createElement('div');
        finalMessageBox.id = 'finalMessageBox';
        Object.assign(finalMessageBox.style, {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            fontSize: '24px',
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            padding: '20px',
            borderRadius: '10px',
            opacity: '0',
            transition: 'opacity 2s'
        });

        finalMessageBox.innerHTML = "The connection vanishes, leaving behind only the echo of Agent's words." +
        "<br><br>" +
        "How did the conversation make you feel? Has your opinion on these issues shifted?" +
        "<br><br>" +
        "You can share it at <a href=\"mailto:reincantamento@gmail.com\" style=\"color: #90D64B;\">reincantamento@gmail.com</a>." +
        "<br><br>" +
        "This was only the first incursion from FORMICAIO. More emissaries are on the move. Keep following the agent on <a href=\"https://x.com/FORMICAIO_17\" style=\"color: #90D64B;\">X</a>";
        document.body.appendChild(finalMessageBox);

        requestAnimationFrame(() => {
            finalMessageBox.style.opacity = '1';
        });
    }

    function scrollChatToBottom() {
        if (chatBox) {
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }

    function handleStartClick() {
        const transitionOverlay = createTransitionOverlay();
        transitionOverlay.classList.add('active');

        // Preload game audio when starting
        loadGameAudio();

        setTimeout(() => {
            landingPage.style.display = 'none';
            if (footer) {
                footer.style.display = 'none';
            }
            chatbotSection.style.display = 'block';
            currentAudio = gameAudio;

            if (fadeOverlay) {
                fadeOverlay.style.background = 'none';
                fadeOverlay.style.backgroundColor = 'transparent';
            }

            setTimeout(() => {
                transitionOverlay.classList.remove('active');
                setTimeout(() => transitionOverlay.remove(), 500);

                if (currentMessageIndex === 0) {
                    handleInteraction({ target: document.body });
                }
            }, 100);
        }, 500);
    }

    // Event Listeners
    if (soundButton) {
        soundButton.addEventListener('click', toggleAudio);
    }

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            currentAudio.volume = volume;
            if (gameAudio) gameAudio.volume = volume;
        });
    }

    if (startButton) {
        startButton.addEventListener('click', handleStartClick);
    }

    if (tutorialButton) {
        tutorialButton.addEventListener('click', function() {
            tutorialPanel.style.display = 'block';
            overlay.style.display = 'block';
            if (isPlaying) {
                currentAudio.pause();
                soundButton.classList.remove('playing');
                soundButton.textContent = 'Sound Off';
                isPlaying = false;
            }
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            tutorialPanel.style.display = 'none';
            overlay.style.display = 'none';
            if (!isPlaying) {
                currentAudio.play().catch(e => console.error('Playback failed:', e));
                soundButton.classList.add('playing');
                soundButton.textContent = 'Sound On';
                isPlaying = true;
            }
        });
    }

    if (overlay) {
        overlay.addEventListener('click', function() {
            tutorialPanel.style.display = 'none';
            overlay.style.display = 'none';
            if (!isPlaying) {
                currentAudio.play().catch(e => console.error('Playback failed:', e));
                soundButton.classList.add('playing');
                soundButton.textContent = 'Sound On';
                isPlaying = true;
            }
        });
    }

    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape' && tutorialPanel.style.display === 'block') {
            tutorialPanel.style.display = 'none';
            overlay.style.display = 'none';
            if (!isPlaying) {
                currentAudio.play().catch(e => console.error('Audio switch failed:', e));
                soundButton.classList.add('playing');
                soundButton.textContent = 'Sound On';
                isPlaying = true;
            }
        }
        if (event.key === 'Enter' && !event.target.closest('#userInputBox') && canClick) {
            handleInteraction(event);
        }
    });

    // Click listener for dialogue progression
    document.addEventListener('click', function(event) {
        // Only handle clicks when chatbot section is visible (not on landing page)
        if (canClick && chatbotSection && getComputedStyle(chatbotSection).display !== 'none') {
            handleInteraction(event);
        }
    });
});
