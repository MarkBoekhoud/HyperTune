const connectButton = document.getElementById('connect-btn');
const statusText = document.getElementById('status');

let isConnected = false;
let pressCount = 0;
let isAnimatingBlock2 = false; 
let inputState = {
    slider1: 0,   
    slider2: 0,   
    rotary: 10    
};

let lastS1 = -999;
let lastS2 = -999;
let lastRot = -999;


let activeTimeouts = [];

function safeTimeout(fn, delay) {
    const id = setTimeout(fn, delay);
    activeTimeouts.push(id);
    return id;
}

function clearAllTimeouts() {
    activeTimeouts.forEach(clearTimeout);
    activeTimeouts = [];
}


function playSafeAnimation(el, keyframes, options, finalStyles, onFinishCallback) {
    if (!el) return null;
    if (el.getAnimations) el.getAnimations().forEach(a => a.cancel());
    
    const anim = el.animate(keyframes, options);
    anim.onfinish = () => {
        if (finalStyles) {
            Object.assign(el.style, finalStyles);
        }
        anim.cancel(); 
        if (onFinishCallback) onFinishCallback();
    };
    return anim;
}

let dotPositions = [];
for (let i = 0; i < 100; i++) {
    dotPositions.push({
        x: Math.random() * 90,
        y: Math.random() * 90
    });
}


const readyImage = document.getElementById('ready-image');
let readyBounceFrame = null;

const animateReadyBounce = () => {
    if (readyImage && pressCount === 0) {
        const time = (Date.now() % 3000) / 3000;
        const bounceOffset = Math.sin(time * Math.PI * 2) * 2; 
        readyImage.style.transform = `translateY(${bounceOffset}px)`;
    }
    readyBounceFrame = requestAnimationFrame(animateReadyBounce);
};
animateReadyBounce();


function globalPodHover() {
    const block2Image = document.getElementById('block-2-image');
    const levitationStatus = document.getElementById('levitation-status');

    if (block2Image && pressCount === 1 && !isAnimatingBlock2) {
        const currentVal = inputState.slider2;
        const sweetSpot = 504; 
        const maxVal = 1000; 
        
        const deviation = Math.abs(currentVal - sweetSpot);
        
        const time = (Date.now() % 3000) / 3000; 
        const bounceOffset = Math.sin(time * Math.PI * 2) * 2; 

        const verticalOffset = 30 - ((currentVal / maxVal) * 60); 

        let shakeX = 0;
        let shakeY = 0;

        if (deviation <= 100) { 
            if (levitationStatus) {
                levitationStatus.innerText = "OPTIMALE STABILITEIT";
                levitationStatus.style.color = "#2D7A3A"; // Success
            }
            
        } else {
            if (levitationStatus) {
                if (currentVal < sweetSpot) {
                    levitationStatus.innerText = "TE WEINIG KRACHT";
                } else {
                    levitationStatus.innerText = "TE VEEL KRACHT";
                }
                levitationStatus.style.color = "#F41616"; // Error
            }
            
            const shakeIntensity = Math.min(1, deviation / 60); 
            
            const t = Date.now();
            shakeX = (Math.sin(t / 40) + Math.cos(t / 70)) * shakeIntensity;
            shakeY = (Math.cos(t / 50) + Math.sin(t / 80)) * shakeIntensity;
        }

        block2Image.style.transform = `translate(${shakeX}px, ${verticalOffset + bounceOffset + shakeY}px)`;
    }
    requestAnimationFrame(globalPodHover);
}
globalPodHover(); 

function showScreen(screenId, bgColor = '#f0f0f0') {
    let overlay = document.querySelector('.screen-transition-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'screen-transition-overlay';
        document.body.appendChild(overlay);
    }

    overlay.style.opacity = '1';
    
    safeTimeout(() => {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.add('active');
            document.body.style.backgroundColor = bgColor;
        }
        
        overlay.style.opacity = '0';
    }, 200);
}

function resetToReady() {
    pressCount = 0;
    isAnimatingBlock2 = false; 
    
    clearAllTimeouts(); 

    const titleElement = document.getElementById('end-title');
    const descElement = document.getElementById('end-description');
    if (titleElement) titleElement.innerText = 'Resultaat';
    if (descElement) descElement.innerText = '';

    const elementsToReset = [
        document.getElementById('ready-image'),
        document.getElementById('block-2-image'),
        document.getElementById('end-image')
    ];
    elementsToReset.forEach(el => {
        if (el && el.getAnimations) el.getAnimations().forEach(anim => anim.cancel());
    });

    const statIds = ['end-score', 'end-speed', 'end-energy', 'end-efficiency', 'end-safety'];
    statIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (el.getAnimations) el.getAnimations().forEach(anim => anim.cancel());
            el.style.opacity = '0'; 
            el.style.transform = 'translateY(30px)';
            el.classList.remove('level-good', 'level-neutral', 'level-bad'); 
            const valSpan = el.querySelector('.end-value');
            if (valSpan) valSpan.innerText = '0';
        }
    });

    const endImage = document.getElementById('end-image');
    if (endImage) {
        endImage.style.opacity = '0';
        endImage.style.transform = 'translateX(-150vw)';
    }

    const block2Image = document.getElementById('block-2-image');
    if (block2Image) {
        block2Image.style.opacity = '1';
        block2Image.style.transform = 'translateY(0px)';
        block2Image.style.filter = 'none'; // Reset de glow
    }

    if (readyImage) {
        readyImage.style.opacity = '1';
        readyImage.style.transform = 'translateY(0px)';
        if (readyBounceFrame) cancelAnimationFrame(readyBounceFrame);
        animateReadyBounce(); 
    }

    showScreen('ready', '#e9f7ff');
}

window.resetToReady = resetToReady;

function expandBlock(blockNumber) {
    const blocks = document.querySelectorAll('.block');
    blocks.forEach((block, index) => {
        if (index + 1 === blockNumber) {
            block.classList.add('expanded');
        } else {
            block.classList.remove('expanded');
        }
    });
    
    resetInactivityTimer();
}

let inactivityTimer = null;

function resetInactivityTimer() {
    if (inactivityTimer) {
        clearTimeout(inactivityTimer);
    }
    inactivityTimer = safeTimeout(() => {
        document.querySelectorAll('.block').forEach(block => {
            block.classList.remove('expanded');
        });
    }, 3000);
}

document.addEventListener('keydown', (e) => {
    if (e.key === '1') expandBlock(1);
    if (e.key === '2') expandBlock(2);
    if (e.key === '3') expandBlock(3);
    
    if (e.key === '9') {
        if (!isConnected) {
            isConnected = true;
            showScreen('ready', '#e9f7ff');
        } else {
            handleArduinoButtonPress();
        }
    }
});

window.expandBlock = expandBlock;

function getEndScenario(state) {
    const rawVacuum = Number(state.slider1) || 0;    
    const rawLevitatie = Number(state.slider2) || 0; 
    const rawPropulsie = Number(state.rotary) || 0;  

    const normVacuum = Math.max(0, Math.min(100, 100 - (rawVacuum / 10)));
    const normLevitatie = Math.max(0, Math.min(100, rawLevitatie / 10));
    const p = Math.max(0, Math.min(100, rawPropulsie)); 
    const z = normLevitatie; 
    const v = normVacuum;    

    let scenario = { title: '', description: '', bgColor: '#ffffff' };
    let score = 0, topSpeed = '', energy = '', efficiency = '', safety = '';

    const setStats = (t, d, bg, sc, en, sa, ef, sp) => {
        scenario.title = t;
        scenario.description = d;
        scenario.bgColor = bg;
        score = sc;
        energy = en;
        safety = sa;
        efficiency = ef;
        topSpeed = sp;
    };

    if (p > 95 && z > 95 && v > 95) {
        setStats('Brute Kracht Inefficiënt', 'Alles op maximaal! Zonder balans. Dit kost astronomisch veel stroom.', '#ffb3b3', 55, 'Maximaal', 'Laag', 'Zeer Slecht', '1050 km/u');
        return { ...scenario, score, topSpeed, energy, efficiency, safety };
    }

    if (p >= 75 && p <= 85 && z >= 45 && z <= 55 && (rawVacuum >= 150 && rawVacuum <= 250 || rawVacuum >= 750 && rawVacuum <= 850)) {
        setStats('Ingenieurs Meesterwerk!', 'De perfecte balans gevonden! Je reist optimaal, veilig en bliksemsnel.', '#99ff99', 100, 'Optimaal', 'Optimaal', 'Maximaal', '1200 km/u');
        return { ...scenario, score, topSpeed, energy, efficiency, safety };
    }

    if (p === 0) {
        setStats('Stilstand', 'De motor staat uit. Zonder stuwkracht kom je niet vooruit.', '#d9d9d9', 0, 'Geen', 'Optimaal', 'Niet', '0 km/u');
    } 
    else if (z <= 25) {
        if (p >= 1 && p <= 35) {
            setStats('Schurende Start', 'Het systeem heeft te weinig lift. De pod raakt de baan.', '#ff9999', 15, 'Hoog', 'Matig', 'Zeer Slecht', '10 km/u');
        } else if (p >= 36 && p <= 74) {
            setStats('Zware Crash', 'Veel snelheid zonder zweving. De onderkant van de pod is zwaar beschadigd.', '#ff4d4d', 5, 'Extreem', 'Gevaarlijk', 'Slecht', '40 km/u');
        } else {
            setStats('Catastrofale Wrijving', 'Levensgevaarlijk! Vol gas zonder levitatie zorgt voor een verwoestende crash.', '#cc0000', 0, 'Maximaal', 'Fataal', 'Slecht', '80 km/u');
        }
    } 
    else if (z >= 75) {
        if (p >= 1 && p <= 35) {
            if (v < 80) setStats('Zware Kruipgang', 'Het systeem zweeft te hoog of instabiel, gecombineerd met veel luchtweerstand.', '#f2e6d9', 30, 'Middel', 'Matig', 'Laag', '50 km/u');
            else setStats('Trillende Sukkelaar', 'Instabiele zweving bij lage snelheid, ondanks relatief goed vacuüm.', '#e6e6e6', 25, 'Hoog', 'Laag', 'Laag', '30 km/u');
        } else if (p >= 36 && p <= 74) {
            if (v < 40) setStats('Gevaarlijke Luchtmuur', 'De pod vecht tegen zware luchtdruk met een instabiele zweving.', '#ffcc99', 40, 'Hoog', 'Gevaarlijk', 'Laag', '150 km/u');
            else if (v >= 40 && v <= 79) setStats('Suboptimale Balans', 'Matig vacuüm en instabiele zweving leiden tot een ongebalanceerde rit.', '#ffe6cc', 55, 'Middel', 'Matig', 'Matig', '300 km/u');
            else setStats('Hobbelige Cruise', 'Goed vacuüm, maar de te hoge zweving zorgt voor instabiliteit.', '#e6f2ff', 45, 'Hoog', 'Matig', 'Laag', '200 km/u');
        } else {
            if (v < 40) setStats('Kantrowitz Knal', 'Kritieke impact op de luchtmuur met hoge snelheid en instabiele zweving.', '#ff8000', 10, 'Extreem', 'Fataal', 'Slecht', '800 km/u');
            else if (v >= 40 && v <= 79) setStats('Overbelaste Motoren', 'Veel stuwkracht in matige omstandigheden leidt tot gevaarlijke overbelasting.', '#ffb366', 35, 'Extreem', 'Gevaarlijk', 'Slecht', '600 km/u');
            else setStats('Riskante Sprint', 'Hoge snelheid bereikt, maar de zweving is ongebalanceerd en onveilig.', '#fff0b3', 50, 'Hoog', 'Laag', 'Matig', '900 km/u');
        }
    } 
    else {
        if (p >= 1 && p <= 35) {
            if (v < 80) setStats('Veilige Sukkelaar', 'Stabiele en optimale zweefhoogte, maar de snelheid is veel te laag.', '#e6ffff', 60, 'Laag', 'Hoog', 'Matig', '100 km/u');
            else setStats('Zuinige Sukkelaar', 'Zeer zuinig, maar het lage motorvermogen remt de pod enorm af.', '#e6ffe6', 65, 'Zeer Laag', 'Hoog', 'Matig', '80 km/u');
        } else if (p >= 36 && p <= 74) {
            if (v < 40) setStats('Windtunnel Effect', 'Goede prestaties, maar de weerstand vereist nog veel energie.', '#ffcccc', 70, 'Middel', 'Goed', 'Goed', '400 km/u');
            else if (v >= 40 && v <= 79) setStats('Luchtweerstand', 'Matig vacuüm remt de pod af, wat zorgt voor een hoog energieverbruik.', '#ffedcc', 60, 'Hoog', 'Goed', 'Matig', '250 km/u');
            else setStats('Efficiënte Cruise', 'Een vlotte, comfortabele reis met een uitstekende balans.', '#ccffcc', 80, 'Laag', 'Hoog', 'Hoog', '600 km/u');
        } else {
            if (v < 40) setStats('Kantrowitz Muur', 'Verstikking! Door het slechte vacuüm bots je op een massieve onzichtbare muur van lucht.', '#ff9933', 30, 'Extreem', 'Gevaarlijk', 'Slecht', '950 km/u');
            else if (v >= 40 && v <= 79) setStats('Thermische Slijtage', 'Hoge luchtwrijving op deze snelheid zorgt voor gevaarlijke verhitting.', '#ff8533', 40, 'Hoog', 'Laag', 'Matig', '850 km/u');
            else setStats('Net Niet Perfect', 'Je zit enorm dicht bij de perfecte balans! Finetune je instellingen nog net iets verder.', '#ccffcc', 85, 'Middel', 'Hoog', 'Goed', '1000 km/u');
        }
    }

    return { ...scenario, score, topSpeed, energy, efficiency, safety };
}

function getPerformanceLevel(value, type) {
    if (type === 'score') {
        if (value >= 70) return 'good'; 
        if (value >= 40) return 'neutral'; 
        return 'bad'; 
    }

    const valStr = String(value).toLowerCase();

    if (type === 'energy') {
        if (valStr.includes('optimaal') || valStr.includes('zeer laag') || valStr.includes('laag') || valStr.includes('geen')) return 'good';
        if (valStr.includes('middel') || valStr.includes('matig')) return 'neutral';
        return 'bad'; 
    }

    if (type === 'efficiency' || type === 'safety') {
        if (valStr.includes('optimaal') || valStr.includes('maximaal') || valStr.includes('hoog') || valStr.includes('goed')) return 'good';
        if (valStr.includes('middel') || valStr.includes('matig')) return 'neutral';
        return 'bad'; 
    }

    if (type === 'speed') {
        const match = valStr.match(/\d+/);
        if (match) {
            const speed = parseInt(match[0], 10);
            if (speed >= 700) return 'good';
            if (speed >= 350) return 'neutral';
            return 'bad';
        }
        return 'neutral';
    }

    return 'neutral';
}

function playScenarioSound(title, numericSpeed) {
    let soundFile = 'audio/normal.mp3'; 

    if (numericSpeed === 0) {
        soundFile = 'audio/power-off.mp3'; 
    } else if (title.includes('Schurende') || title.includes('Crash') || title.includes('Wrijving')) {
        soundFile = 'audio/slow.mp3'; 
    } else if (title.includes('Knal') || title.includes('Muur') || title.includes('Verstikking')) {
        soundFile = 'audio/slow.mp3'; 
    } else if (numericSpeed >= 900) {
        soundFile = 'audio/perfect.mp3'; 
    } else if (numericSpeed < 200) {
        soundFile = 'audio/slow.mp3'; 
    }

    const audio = new Audio(soundFile);
    audio.volume = 1;
    audio.play().catch(e => console.log('Audio afspelen mislukt.', e));
    
    safeTimeout(() => {
        const fadeOutDuration = 1000;
        const fadeOutSteps = 50;
        const stepDuration = fadeOutDuration / fadeOutSteps;
        const volumeDecrement = 1 / fadeOutSteps;
        
        let currentStep = 0;
        const fadeOutInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(0, 1 - (volumeDecrement * currentStep));
            
            if (currentStep >= fadeOutSteps) {
                clearInterval(fadeOutInterval);
                audio.pause();
                audio.currentTime = 0;
            }
        }, stepDuration);
    }, 5500);
}


function renderEndScreenFromInputs() {
    const scenario = getEndScenario(inputState);
    expandBlock(2);

    const speedMatch = scenario.topSpeed.match(/\d+/);
    const numericSpeed = speedMatch ? parseInt(speedMatch[0], 10) : 0;

    isAnimatingBlock2 = true; 

    safeTimeout(() => {
        playScenarioSound(scenario.title, numericSpeed);
        
        const block2Image = document.getElementById('block-2-image');
        let animDuration = 0;
        let animType = 'VLOEIEND';

        if (numericSpeed === 0) {
            animType = 'STILSTAND';
        } else if (scenario.title.includes('Knal') || scenario.title.includes('Muur') || scenario.title.includes('Verstikking') || scenario.title.includes('Fataal')) {
            animType = 'CRASH';
        } else if (scenario.title.includes('Crash') || scenario.title.includes('Schurend') || scenario.title.includes('Wrijving') || scenario.title.includes('Kruipgang') || scenario.title.includes('Sukkelaar')) {
            animType = 'SCHUREND';
        }

        if (block2Image) {
            const verticalOffset = 30 - ((inputState.slider2 / 1000) * 60);

            if (animType === 'STILSTAND') {
                animDuration = 1.5;
                playSafeAnimation(block2Image, [
                    { transform: `translate(0vw, ${verticalOffset}px)`, offset: 0 },
                    { transform: `translate(1vw, ${verticalOffset}px)`, offset: 0.1 },
                    { transform: `translate(0vw, ${verticalOffset}px)`, offset: 0.2 },
                    { transform: `translate(0vw, ${verticalOffset}px)`, offset: 1 }
                ], { duration: animDuration * 1000, fill: 'forwards' }, {
                    transform: `translate(0vw, ${verticalOffset}px)`, opacity: '0'
                });
            } 
            else if (animType === 'CRASH') {
                animDuration = 2.5; 
                playSafeAnimation(block2Image, [
                    { transform: `translate(0vw, ${verticalOffset}px)`, offset: 0 },
                    { transform: `translate(40vw, ${verticalOffset}px)`, offset: 0.3 }, 
                    { transform: `translate(42vw, calc(${verticalOffset}px + 10px)) rotate(5deg)`, offset: 0.35 },
                    { transform: `translate(38vw, calc(${verticalOffset}px - 5px)) rotate(-4deg)`, offset: 0.4 },
                    { transform: `translate(41vw, calc(${verticalOffset}px + 5px)) rotate(2deg)`, offset: 0.45 },
                    { transform: `translate(39vw, calc(${verticalOffset}px - 2px)) rotate(-1deg)`, offset: 0.5 },
                    { transform: `translate(40vw, ${verticalOffset}px) rotate(0deg)`, offset: 0.6 },
                    { transform: `translate(40vw, ${verticalOffset}px) rotate(0deg)`, offset: 1 } 
                ], { duration: animDuration * 1000, easing: 'linear', fill: 'forwards' }, {
                    transform: `translate(40vw, ${verticalOffset}px)`, opacity: '0'
                });
            }
            else if (animType === 'SCHUREND') {
                animDuration = 4.0; 
                let scrapeKeyframes = [];
                for(let i=0; i<=20; i++) {
                    let prog = i/20;
                    let shake = (i % 2 === 0) ? 4 : -2; 
                    if(i === 0 || i === 20) shake = 0;
                    scrapeKeyframes.push({ transform: `translate(${prog * 150}vw, calc(${verticalOffset}px + ${shake}px))`, offset: prog });
                }
                playSafeAnimation(block2Image, scrapeKeyframes, { duration: animDuration * 1000, easing: 'linear', fill: 'forwards' }, {
                    transform: `translate(150vw, ${verticalOffset}px)`, opacity: '0'
                });
            }
            else { // VLOEIEND
                animDuration = 3.5 - (numericSpeed / 1200) * 2.5; 
                animDuration = Math.max(1.0, Math.min(4.0, animDuration));
                
                playSafeAnimation(block2Image, [
                    { transform: `translate(0vw, ${verticalOffset}px)`, opacity: 1 },
                    { transform: `translate(150vw, ${verticalOffset}px)`, opacity: 1 }
                ], { duration: animDuration * 1000, easing: 'ease-in', fill: 'forwards' }, {
                    transform: `translate(150vw, ${verticalOffset}px)`, opacity: '0'
                });
            }
        }
        
        let delayForEndScreen = (animDuration * 1000) + 200;

        safeTimeout(() => {
            const titleElement = document.getElementById('end-title');
            const descElement = document.getElementById('end-description');
            const scoreElement = document.getElementById('end-score');
            const speedElement = document.getElementById('end-speed');
            const energyElement = document.getElementById('end-energy');
            const efficiencyElement = document.getElementById('end-efficiency');
            const safetyElement = document.getElementById('end-safety');

            if (titleElement) titleElement.innerText = scenario.title;
            if (descElement) descElement.innerText = scenario.description;
            
            if (scoreElement) {
                scoreElement.querySelector('.end-value').innerText = scenario.score;
                scoreElement.className = 'end-data-item large';
                scoreElement.classList.add(`level-${getPerformanceLevel(scenario.score, 'score')}`);
                scoreElement.style.opacity = '0';
                scoreElement.style.transform = 'translateY(30px)';
            }
            if (speedElement) {
                speedElement.querySelector('.end-value').innerText = scenario.topSpeed;
                speedElement.className = 'end-data-item';
                speedElement.classList.add(`level-${getPerformanceLevel(scenario.topSpeed, 'speed')}`);
                speedElement.style.opacity = '0';
                speedElement.style.transform = 'translateY(30px)';
            }
            if (energyElement) {
                energyElement.querySelector('.end-value').innerText = scenario.energy;
                energyElement.className = 'end-data-item';
                energyElement.classList.add(`level-${getPerformanceLevel(scenario.energy, 'energy')}`);
                energyElement.style.opacity = '0';
                energyElement.style.transform = 'translateY(30px)';
            }
            if (efficiencyElement) {
                efficiencyElement.querySelector('.end-value').innerText = scenario.efficiency;
                efficiencyElement.className = 'end-data-item';
                efficiencyElement.classList.add(`level-${getPerformanceLevel(scenario.efficiency, 'efficiency')}`);
                efficiencyElement.style.opacity = '0';
                efficiencyElement.style.transform = 'translateY(30px)';
            }
            if (safetyElement) {
                safetyElement.querySelector('.end-value').innerText = scenario.safety;
                safetyElement.className = 'end-data-item';
                safetyElement.classList.add(`level-${getPerformanceLevel(scenario.safety, 'safety')}`);
                safetyElement.style.opacity = '0';
                safetyElement.style.transform = 'translateY(30px)';
            }

            const endImage = document.getElementById('end-image');
            
            if (animType === 'STILSTAND') {
                playSafeAnimation(endImage, [
                    { transform: 'translateX(0vw) scale(0.9)', opacity: 0 },
                    { transform: 'translateX(0vw) scale(1)', opacity: 1 }
                ], { duration: 800, easing: 'ease-out', fill: 'forwards' }, {
                    transform: 'translateX(0vw)', opacity: '1'
                });
            } else if (animType === 'CRASH') {
                playSafeAnimation(endImage, [
                    { transform: 'translateX(-150vw)', opacity: 0 },
                    { transform: 'translateX(0)', opacity: 1, offset: 0.7 },
                    { transform: 'translateX(20px) rotate(2deg)', offset: 0.75 },
                    { transform: 'translateX(-10px) rotate(-1deg)', offset: 0.85 },
                    { transform: 'translateX(0) rotate(0deg)', offset: 1 }
                ], { duration: 1200, easing: 'ease-out', fill: 'forwards' }, {
                    transform: 'translateX(0)', opacity: '1'
                });
            } else if (animType === 'SCHUREND') {
                playSafeAnimation(endImage, [
                    { transform: 'translateX(-50vw) translateY(5px)', opacity: 0 },
                    { transform: 'translateX(-25vw) translateY(-2px)', opacity: 0.5 },
                    { transform: 'translateX(0) translateY(0)', opacity: 1 }
                ], { duration: 2000, easing: 'linear', fill: 'forwards' }, {
                    transform: 'translateX(0)', opacity: '1'
                });
            } else {
                playSafeAnimation(endImage, [
                    { transform: 'translateX(-150vw)', opacity: 0 },
                    { transform: 'translateX(0)', opacity: 1 }
                ], { duration: 1000, easing: 'ease-out', fill: 'forwards' }, {
                    transform: 'translateX(0)', opacity: '1'
                });
            }

            showScreen('end', scenario.bgColor);
            
            const podLandingTime = (animType === 'SCHUREND' ? 2000 : (animType === 'CRASH' ? 1200 : 1000)) + 100;
            const statsOrderToPop = [speedElement, energyElement, efficiencyElement, safetyElement, scoreElement];

            statsOrderToPop.forEach((el, index) => {
                if (el) {
                    safeTimeout(() => {
                        const popSounds = ['audio/pop1.mp3', 'audio/pop2.mp3', 'audio/pop3.mp3'];
                        const randomPopSound = popSounds[Math.floor(Math.random() * popSounds.length)];
                        const popAudio = new Audio(randomPopSound);
                        popAudio.volume = 0.3;
                        popAudio.play().catch(e => console.log('Pop audio afspelen mislukt.', e));
                        
                        playSafeAnimation(el, [
                            { transform: 'translateY(30px)', opacity: 0 },
                            { transform: 'translateY(0)', opacity: 1 }
                        ], { duration: 400, easing: 'ease-out', fill: 'forwards' }, {
                            transform: 'translateY(0)', opacity: '1'
                        });
                    }, podLandingTime + (index * 300)); 
                }
            });

        }, delayForEndScreen);
        
    }, 400); 
}

function refreshBlockDisplays() {
    const slider1Display = document.getElementById('slider1-display');
    if (slider1Display) {
        slider1Display.innerText = inputState.slider1;
    }

    const slider3Display = document.getElementById('slider3-display');
    if (slider3Display) {
        slider3Display.innerText = `${inputState.rotary}%`;
    }

    const gaugeValue = (inputState.rotary / 100) * 200;
    const angle = ((gaugeValue / 200) * 180) - 90;
    const gaugeNeedle = document.getElementById('gauge-needle');
    if (gaugeNeedle) {
        gaugeNeedle.setAttribute('transform', `rotate(${angle} 150 150)`);
    }
}

function handleArduinoButtonPress() {
    if (!isConnected) return;

    if (pressCount === 2) {
        resetToReady();
        return;
    }

    pressCount++;

    if (pressCount === 1) {
        isAnimatingBlock2 = true; 

        if (readyBounceFrame) cancelAnimationFrame(readyBounceFrame);
        
        playSafeAnimation(document.getElementById('ready-image'), [
            { transform: 'translateX(0)', opacity: 1 },
            { transform: 'translateX(150vw)', opacity: 0 }
        ], { duration: 800, easing: 'ease-in', fill: 'forwards' }, {
            transform: 'translateX(150vw)', opacity: '0'
        });
        
        const audio = new Audio('Audio/normal.mp3');
        audio.volume = 1;
        audio.play().catch(e => console.log('Audio afspelen mislukt.', e));
        
        safeTimeout(() => {
            const fadeOutDuration = 1000;
            const fadeOutSteps = 50;
            const stepDuration = fadeOutDuration / fadeOutSteps;
            const volumeDecrement = 1 / fadeOutSteps;
            
            let currentStep = 0;
            const fadeOutInterval = setInterval(() => {
                currentStep++;
                audio.volume = Math.max(0, 1 - (volumeDecrement * currentStep));
                
                if (currentStep >= fadeOutSteps) {
                    clearInterval(fadeOutInterval);
                    audio.pause();
                    audio.currentTime = 0;
                }
            }, stepDuration);
        }, 5500);
        
        safeTimeout(() => {
            showScreen('next', '#eaf9ef');
            
            updateSlider1Value(inputState.slider1, true);
            updateSlider2Value(inputState.slider2, true);
            updateRotaryValue(inputState.rotary, true);

            const block2Image = document.getElementById('block-2-image');
            const verticalOffset = 30 - ((inputState.slider2 / 1000) * 60);
            
            playSafeAnimation(block2Image, [
                { transform: `translate(-150vw, ${verticalOffset}px)`, opacity: 0 },
                { transform: `translate(0vw, ${verticalOffset}px)`, opacity: 1 }
            ], { duration: 800, easing: 'ease-out', fill: 'forwards' }, {
                transform: `translate(0vw, ${verticalOffset}px)`, opacity: '1'
            }, () => {
                isAnimatingBlock2 = false; 
            });

        }, 800);
    } else if (pressCount === 2) {
        renderEndScreenFromInputs();
    }
}

function updateSlider1Value(waarde, force = false) {
    const numericValue = Number(waarde);
    if (Number.isNaN(numericValue)) return;
    
    if (pressCount !== 1) return;

    if (!force && Math.abs(numericValue - lastS1) <= 4) return;
    
    lastS1 = numericValue;
    inputState.slider1 = numericValue;

    const drukPercentage = Math.max(0, Math.min(100, numericValue / 10));
    const pascalValue = Math.pow(drukPercentage / 100, 3.87) * 101325;

    const block1Text = document.getElementById('slider1-display');
    if (block1Text) {
        block1Text.innerText = Math.round(pascalValue).toLocaleString('nl-NL'); 
    }

    const densityElement = document.getElementById('density-value');
    if (densityElement) {
        const density = (pascalValue / 101325) * 1.225;
        densityElement.innerText = `${density.toFixed(4)} kg/m3`;
    }

    const dragValue = document.getElementById('drag-value');
    if (dragValue) {
        const newtons = (pascalValue / 101325) * 55500;
        dragValue.innerText = `${Math.round(newtons).toLocaleString('nl-NL')} N`;
    }

    const dotsContainer = document.getElementById('dots-container');
    if (dotsContainer) {
        const numDots = Math.round(drukPercentage);
        dotsContainer.innerHTML = '';
        for (let i = 0; i < numDots; i++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            dot.style.left = `${dotPositions[i].x}%`;
            dot.style.top = `${dotPositions[i].y}%`;
            dot.style.animationDelay = `${(i * 0.06) % 6}s`;
            dotsContainer.appendChild(dot);
        }
    }

    expandBlock(1);
}

function updateSlider2Value(waarde, force = false) {
    const numericValue = Number(waarde);
    if (Number.isNaN(numericValue)) return;

    if (pressCount !== 1 || isAnimatingBlock2) return;

    if (!force && Math.abs(numericValue - lastS2) <= 4) return;
    
    lastS2 = numericValue;
    inputState.slider2 = numericValue;

    expandBlock(2);
}

function updateRotaryValue(waarde, force = false) {
    const numericValue = Number(waarde);
    if (Number.isNaN(numericValue)) return;

    if (pressCount !== 1) return;

    if (!force && Math.abs(numericValue - lastRot) <= 2) return;

    lastRot = numericValue;
    inputState.rotary = numericValue;

    const slider3Display = document.getElementById('slider3-display');
    if (slider3Display) {
        slider3Display.innerText = `${numericValue}%`;
    }

    const propulsionBar = document.getElementById('propulsion-bar');
    if (propulsionBar) {
        propulsionBar.style.width = `${numericValue}%`;
    }

    const gaugeValue = (numericValue / 100) * 200; 
    const angle = ((gaugeValue / 200) * 180) - 90; 
    
    const gaugeNeedle = document.getElementById('gauge-needle');
    if (gaugeNeedle) {
        gaugeNeedle.setAttribute('transform', `rotate(${angle} 150 150)`);
    }

    const gaugeFill = document.getElementById('gauge-fill');
    if (gaugeFill) {
        const maxArcLength = Math.PI * 100; 
        const filledLength = (Math.abs(angle + 90) / 180) * maxArcLength;
        gaugeFill.style.strokeDasharray = `${filledLength} ${maxArcLength}`;
    }

    expandBlock(3);
}

async function connectToArduino() {
    try {
        const port = await navigator.serial.requestPort();
        await port.open({ baudRate: 9600 });

        isConnected = true;
        showScreen('ready', '#e9f7ff');

        const textDecoder = new TextDecoderStream();
        port.readable.pipeTo(textDecoder.writable);
        const reader = textDecoder.readable.getReader();

        let buffer = '';
        while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            
            buffer += value;
            const lines = buffer.split(/\r?\n/);
            buffer = lines.pop();

            for (const line of lines) {
                let cleanLine = line.trim();

                if (cleanLine === 'PRESSED') {
                    handleArduinoButtonPress();
                } 
                else if (cleanLine.startsWith('S1:')) {
                    let sliderValue = cleanLine.replace('S1:', ''); 
                    updateSlider1Value(sliderValue);
                }
                else if (cleanLine.startsWith('S2:')) {
                    let sliderValue = cleanLine.replace('S2:', ''); 
                    updateSlider2Value(sliderValue);
                }
                else if (cleanLine !== '' && !isNaN(cleanLine)) {
                    updateRotaryValue(cleanLine);
                }
            }
        }
    } catch (error) {
        console.error(error);
        statusText.innerText = 'Verbinding mislukt. Probeer opnieuw.';
    }
}

connectButton.addEventListener('click', connectToArduino);