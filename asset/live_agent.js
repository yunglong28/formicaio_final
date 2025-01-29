document.addEventListener('DOMContentLoaded', function () {
    const startButton = document.querySelector('.start-btn');
    const tutorialButton = document.querySelector('.tutorial-btn');
    const soundButton = document.querySelector('.sound-btn');
    const volumeSlider = document.getElementById('volumeSlider');
    const chatBox = document.getElementById('chatBox');
    const chatBoxInner = chatBox.querySelector('.chat-box-inner');
    const cursor = document.getElementById('cursor');
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
    const skipButton = document.getElementById('skipButton');

    // For Responsiveness
    function setVH() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }
    
    window.addEventListener('load', setVH);
    window.addEventListener('resize', setVH);

    // Central image creation
    const centralImage = document.createElement('img');
    centralImage.src = 'asset/css/png/formiche-fighe.svg'; // Updated path
    centralImage.className = 'formiche-dodge';
    document.body.appendChild(centralImage);

    // Audio setup
    const menuAudio = new Audio('asset/css/kinked_menu_fancy.mp3'); // Updated path
    const gameAudio = new Audio('asset/css/kinked_game_(FANCY).mp3'); // Updated path
    let currentAudio = menuAudio;
    let isPlaying = false;

    menuAudio.loop = true;
    gameAudio.loop = true;

    // Optimized Particle System Implementation
    class ParticleSystem {
        constructor(canvas, options = {}) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d', { alpha: false });
            this.ctx.imageSmoothingEnabled = false;
            
            this.options = {
                particleCount: options.particleCount || 20,
                particleSize: options.particleSize || 2,
                connectionDistance: options.connectionDistance || 15,
                speed: options.speed || 0.2,
                colors: options.colors || ['#90D64B', '#52fc3b', '#8F292B']
            };
            
            this.particles = new Float32Array(this.options.particleCount * 4);
            this.particleColors = new Array(this.options.particleCount);
            this.frameCount = 0;
            
            this.resize();
            this.init();
        }

        init() {
            for (let i = 0; i < this.options.particleCount; i++) {
                const baseIndex = i * 4;
                this.particles[baseIndex] = Math.random() * this.canvas.width;
                this.particles[baseIndex + 1] = Math.random() * this.canvas.height;
                this.particles[baseIndex + 2] = (Math.random() > 0.5 ? 1 : -1) * this.options.speed;
                this.particles[baseIndex + 3] = (Math.random() > 0.5 ? 1 : -1) * this.options.speed;
                this.particleColors[i] = this.options.colors[Math.floor(Math.random() * this.options.colors.length)];
            }
        }

        resize() {
            this.canvas.width = window.innerWidth / 4;
            this.canvas.height = window.innerHeight / 4;
            this.canvas.style.width = `${window.innerWidth}px`;
            this.canvas.style.height = `${window.innerHeight}px`;
        }

        update() {
            const connDist = this.options.connectionDistance;
            const connDistSq = connDist * connDist;

            for (let i = 0; i < this.options.particleCount; i++) {
                const baseIndex = i * 4;
                this.particles[baseIndex] += this.particles[baseIndex + 2];
                this.particles[baseIndex + 1] += this.particles[baseIndex + 3];
                
                if (this.particles[baseIndex] < 0) this.particles[baseIndex] = this.canvas.width;
                else if (this.particles[baseIndex] > this.canvas.width) this.particles[baseIndex] = 0;
                
                if (this.particles[baseIndex + 1] < 0) this.particles[baseIndex + 1] = this.canvas.height;
                else if (this.particles[baseIndex + 1] > this.canvas.height) this.particles[baseIndex + 1] = 0;
            }

            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            for (let i = 0; i < this.options.particleCount; i++) {
                const baseIndex = i * 4;
                const x1 = this.particles[baseIndex];
                const y1 = this.particles[baseIndex + 1];

                if (this.frameCount % 30 !== i % 30) {
                    this.ctx.fillStyle = this.particleColors[i];
                    this.ctx.fillRect(
                        Math.floor(x1),
                        Math.floor(y1),
                        this.options.particleSize,
                        this.options.particleSize
                    );
                }

                for (let j = i + 1; j < this.options.particleCount; j++) {
                    const baseIndex2 = j * 4;
                    const dx = x1 - this.particles[baseIndex2];
                    const dy = y1 - this.particles[baseIndex2 + 1];
                    const distSq = dx * dx + dy * dy;

                    if (distSq < connDistSq) {
                        this.ctx.beginPath();
                        this.ctx.moveTo(Math.floor(x1), Math.floor(y1));
                        this.ctx.lineTo(
                            Math.floor(this.particles[baseIndex2]),
                            Math.floor(this.particles[baseIndex2 + 1])
                        );
                        this.ctx.strokeStyle = `${this.particleColors[i]}22`;
                        this.ctx.stroke();
                    }
                }
            }

            if (this.frameCount % 2 === 0) {
                this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
                for (let i = 0; i < this.canvas.height; i += 8) {
                    this.ctx.fillRect(0, i, this.canvas.width, 1);
                }
            }

            this.frameCount++;
        }

        animate() {
            this.update();
            requestAnimationFrame(() => this.animate());
        }
    }

    // Initialize particle system
    const canvas = document.createElement('canvas');
    canvas.id = 'particleCanvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1;
        opacity: 0.2;
        image-rendering: pixelated;
    `;
    document.body.insertBefore(canvas, document.body.firstChild);

    const particleSystem = new ParticleSystem(canvas, {
        particleCount: 20,
        particleSize: 2,
        connectionDistance: 15,
        speed: 0.2,
        colors: ['#90D64B', '#52fc3b', '#8F292B']
    });

    particleSystem.animate();

    window.addEventListener('resize', () => {
        particleSystem.resize();
    });

    // Transition Overlay
    function createTransitionOverlay() {
        const overlay = document.createElement('div');
        overlay.className = 'transition-overlay';
        document.body.appendChild(overlay);
        return overlay;
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
        gameAudio.volume = initialVolume;
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
                currentAudio = gameAudio;
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

    function switchAudio(newAudio) {
        if (!newAudio || newAudio === currentAudio) return;

        const wasPlaying = isPlaying;
        const currentVolume = currentAudio.volume;
        
        const fadeOut = setInterval(() => {
            if (currentAudio.volume > 0.1) {
                currentAudio.volume -= 0.1;
            } else {
                clearInterval(fadeOut);
                currentAudio.pause();
                currentAudio.volume = currentVolume;
                
                currentAudio = newAudio;
                currentAudio.volume = 0;
                
                if (wasPlaying) {
                    currentAudio.play().catch(e => console.error('Audio switch failed:', e));
                    
                    const fadeIn = setInterval(() => {
                        if (currentAudio.volume < currentVolume - 0.1) {
                            currentAudio.volume += 0.1;
                        } else {
                            currentAudio.volume = currentVolume;
                            clearInterval(fadeIn);
                        }
                    }, 50);
                }
            }
        }, 50);
    }

    function handleDialogueTransition(messageElement, text) {
        const tl = gsap.timeline();
        
        tl.from(messageElement, {
            opacity: 0,
            duration: 0.5,
            ease: "power2.inOut"
        });
        
        const chars = text.split("");
        let currentText = "";
        
        chars.forEach((char, index) => {
            tl.add(() => {
                currentText += char;
                messageElement.innerHTML = currentText + '<span class="cursor-blink">|</span>';
            }, index * 0.05);
        });
        
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

    function typeWriter(text, element, i, fnCallback) {
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

    // Use this URL based on the hostname:
    const backendURL = window.location.hostname === 'localhost'
        ? 'http://localhost:5038'
        : 'https://formicaio-99c83a293f10.herokuapp.com';

    // Use `backendURL` here in the fetch call
    async function sendMessageToBackend(message) {
        try {
            const response = await fetch(`${backendURL}/ask`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message: message }),
            });
            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error('Error communicating with backend:', error);
            return "Sorry, I couldn't process that.";
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
    
    function handleInteraction(event) {
        if (isAnimating || currentMessageIndex >= messages.length) return;
        if (event.target.closest('#userInputBox')) return;
        
        const currentTime = new Date().getTime();
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

                    if (currentMessageIndex === 1) {
                        imageBox.style.display = 'block';
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo0.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }
                    if (currentMessageIndex === 3) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo1.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }

                    if (currentMessageIndex === 7) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo2.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }

                    if (currentMessageIndex === 10) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo3.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }

                    if (currentMessageIndex === 12) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo4.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }

                    if (currentMessageIndex === 15) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo5.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
                    }

                    if (currentMessageIndex === 18) {
                        dialogImage.classList.add('fade-out');
                        setTimeout(() => {
                            dialogImage.src = 'asset/css/png/slide-dialogo6.png';
                            dialogImage.classList.remove('fade-out');
                            dialogImage.classList.add('fade-in');
                        }, 500);
                        setTimeout(() => {
                            dialogImage.classList.remove('fade-in');
                        }, 1000);
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

    document.addEventListener('click', function(event) {
        if (canClick) handleInteraction(event);
    });
});
