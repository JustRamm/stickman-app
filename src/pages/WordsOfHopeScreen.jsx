import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, PanResponder, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Svg, Path, Circle } from 'react-native-svg';
import { TERMINOLOGY_DATA } from '../data/terminologyData';
import ASSETS from '../utils/assetMap';

const { width, height } = Dimensions.get('window');
const PLAYER_Y_PCT = 85;
const PLAYER_Y_PX = height * (PLAYER_Y_PCT / 100);

const WordsOfHopeScreen = ({ audioManager, onExit }) => {
    // Game States
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, RESULTS, GAME_OVER
    const [score, setScore] = useState(0);
    const [mistakes, setMistakes] = useState(0);
    const [harmony, setHarmony] = useState(50);
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [fallingItems, setFallingItems] = useState([]);
    const [playerX, setPlayerX] = useState(width / 2);

    // Feedback
    const [sidebarData, setSidebarData] = useState(null);
    const [stigmaAlert, setStigmaAlert] = useState(null);

    // Refs
    const playerXRef = useRef(width / 2);
    const fallingItemsRef = useRef([]);
    const gameLoopRef = useRef(null);
    const shuffledQuestionsRef = useRef([]);
    const isProcessingSetRef = useRef(false);
    const hasInteractionRef = useRef(false);

    // Assets
    const HopeIcon = ASSETS['hope_stickman'] || View;
    const DistressedIcon = ASSETS['guy_distressed'] || View;

    useEffect(() => {
        // Init shuffle
        shuffledQuestionsRef.current = [...TERMINOLOGY_DATA.questions].sort(() => Math.random() - 0.5);
    }, []);

    const startGame = () => {
        // Reset
        shuffledQuestionsRef.current = [...TERMINOLOGY_DATA.questions].sort(() => Math.random() - 0.5);
        setScore(0);
        setMistakes(0);
        setHarmony(50);
        setCurrentQIndex(0);
        setFallingItems([]);
        fallingItemsRef.current = [];
        setSidebarData(null);
        setStigmaAlert(null);
        isProcessingSetRef.current = false;
        hasInteractionRef.current = false;

        setGameState('PLAYING');
        if (audioManager) audioManager.startAmbient('park');

        // Start Loop
        gameLoopRef.current = requestAnimationFrame(gameLoop);

        // Spawn first set after delay
        setTimeout(spawnSet, 1000);
    };

    const stopGame = () => {
        if (gameLoopRef.current) cancelAnimationFrame(gameLoopRef.current);
    };

    // Pan Responder for Player
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                // Map gesture to X position
                // We'll use absolute moveX if available or delta
                // Ideally, drag anywhere to move player
                const newX = Math.max(30, Math.min(width - 30, gestureState.moveX));
                setPlayerX(newX);
                playerXRef.current = newX;
            },
        })
    ).current;

    const spawnSet = () => {
        if (gameState !== 'PLAYING') return;
        const index = currentQIndex; // This might be stale in timeout closure? No, we use ref or derived? 
        // Actually, we need to track index in ref for the loop spawning
        // However, let's just use the current question based on game logic flow
    };

    // Because React state in requestAnimationFrame is tricky, we'll try a hybrid approach:
    // "Tick" every ~16ms, update ref positions, but only set state every frame for rendering if positions changed significantly? 
    // Or just use setState. In RN JS thread, it might be okay for few items.

    // Better: Logic runs in interval/loop, updates refs. 
    // 'fallingItems' state is used for Rendering.

    const gameLoop = () => {
        if (gameState !== 'PLAYING') return;

        // Update items
        const speed = height * 0.003; // Responsive speed
        let collision = false;

        const nextItems = fallingItemsRef.current.map(item => ({
            ...item,
            y: item.y + speed
        })).filter(item => {
            // Collision Check
            // Player is at playerXRef.current, PLAYER_Y_PX
            // Item is at item.x (which is % of width converted to px? No let's store px), item.y
            const pX = playerXRef.current;
            const pY = PLAYER_Y_PX;

            const dx = Math.abs(item.x - pX);
            const dy = Math.abs(item.y - pY);

            if (dy < 50 && dx < 50 && !hasInteractionRef.current && !collision) {
                collision = true;
                handleCollision(item);
                return false; // Remove item
            }

            // Check bounds
            return item.y < height;
        });

        // Check if set missed (all items gone/fallen past player without interaction)
        if (isProcessingSetRef.current && fallingItemsRef.current.length > 0 && nextItems.length === 0 && !hasInteractionRef.current && !collision) {
            // Missed both
            handleMiss();
        }

        fallingItemsRef.current = nextItems;
        setFallingItems(nextItems);

        // Schedule next spawn if needed
        if (!isProcessingSetRef.current && nextItems.length === 0) {
            // Spawn logic is triggered via state cleanup/effects usually, but we can do it here if careful
            // Check if we need to spawn next
            // We'll use a cooldown flag or externally triggered spawn
        }

        if (gameState === 'PLAYING') {
            gameLoopRef.current = requestAnimationFrame(gameLoop);
        }
    };

    // Spawn Logic Hook
    useEffect(() => {
        if (gameState !== 'PLAYING') return;

        if (!isProcessingSetRef.current && fallingItems.length === 0) {
            const q = shuffledQuestionsRef.current[currentQIndex];
            if (!q) {
                // End of list?
                return;
            }

            isProcessingSetRef.current = true;
            hasInteractionRef.current = false;

            // Create items (PX coordinates)
            const leftX = width * 0.25;
            const rightX = width * 0.75;

            const isCorrectLeft = Math.random() > 0.5;

            const newItem1 = {
                id: `opt1-${Date.now()}`,
                x: isCorrectLeft ? leftX : rightX,
                y: -100,
                text: q.correct,
                isCorrect: true,
                qData: q
            };
            const newItem2 = {
                id: `opt2-${Date.now()}`,
                x: isCorrectLeft ? rightX : leftX,
                y: -100,
                text: q.stigma,
                isCorrect: false,
                qData: q
            };

            // Delay slightly before adding to ref to "spawn"
            setTimeout(() => {
                fallingItemsRef.current = [newItem1, newItem2];
                setFallingItems([newItem1, newItem2]);
            }, 1000);
        }
    }, [fallingItems.length, currentQIndex, gameState]);

    const handleCollision = (item) => {
        hasInteractionRef.current = true;
        isProcessingSetRef.current = false; // Set done

        if (item.isCorrect) {
            setScore(s => s + 1);
            setHarmony(h => Math.min(100, h + 15));
            if (audioManager?.playDing) audioManager.playDing();
            setSidebarData(item.qData);
        } else {
            setMistakes(m => m + 1);
            setHarmony(h => Math.max(0, h - 25));
            if (audioManager?.playSad) audioManager.playSad();
            setStigmaAlert(item.qData);
        }

        // Remove visuals
        fallingItemsRef.current = [];
        setFallingItems([]);

        // Check End
        if (score + (item.isCorrect ? 1 : 0) >= 4) {
            stopGame();
            setGameState('RESULTS');
            return;
        }

        if (mistakes + (item.isCorrect ? 0 : 1) >= 3) {
            stopGame();
            setGameState('GAME_OVER');
            return;
        }

        // Next Question
        setCurrentQIndex(prev => {
            const next = prev + 1;
            if (next >= shuffledQuestionsRef.current.length) {
                // End of Qs
                stopGame();
                if (score >= 4) setGameState('RESULTS');
                else setGameState('GAME_OVER');
                return prev;
            }
            return next;
        });
    };

    const handleMiss = () => {
        isProcessingSetRef.current = false;
        setMistakes(m => {
            const newM = m + 1;
            if (newM >= 3) {
                stopGame();
                setGameState('GAME_OVER');
            }
            return newM;
        });
        setCurrentQIndex(prev => prev + 1);
    };

    // Background Color based on Harmony
    // Simple interpolation logic for color not easy in RN View style without Animated.
    // We'll just step it.
    const getBgColor = () => {
        if (harmony > 80) return ['#dcfce7', '#4ade80', '#166534']; // Green radiant
        if (harmony > 40) return ['#e0f2fe', '#60a5fa', '#1e3a8a']; // Blue calm
        return ['#1e1b4b', '#312e81', '#4c1d95']; // Dark gloomy
    };

    return (
        <View className="flex-1" {...panResponder.panHandlers}>
            <LinearGradient
                colors={getBgColor()}
                style={StyleSheet.absoluteFill}
            />

            {/* Scenery Layers */}
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
                {/* Sun/Moon */}
                <View style={{
                    position: 'absolute',
                    top: '10%', left: '15%',
                    width: 100, height: 100,
                    borderRadius: 50,
                    backgroundColor: harmony > 50 ? 'rgba(255, 230, 100, 0.4)' : 'rgba(150, 180, 255, 0.2)',
                    transform: [{ scale: 1 + harmony / 100 }]
                }} />

                {/* Mountains (SVG) */}
                <Svg height="40%" width="100%" style={{ position: 'absolute', bottom: 0 }} preserveAspectRatio="none">
                    <Path d="M0,400 L0,300 L150,150 L350,280 L550,100 L800,320 L1000,200 L1000,400 Z" fill={harmony > 50 ? "#14532d" : "#1e1b4b"} opacity={0.5} />
                    <Path d="M0,400 L0,350 L200,220 L450,340 L700,180 L1000,330 L1000,400 Z" fill={harmony > 50 ? "#166534" : "#312e81"} opacity={0.8} />
                </Svg>
            </View>

            {/* Header */}
            <View className="absolute top-10 left-0 right-0 px-6 flex-row justify-between items-center z-50" pointerEvents="none">
                <View>
                    <Text className="text-white font-black uppercase tracking-widest text-xs">{TERMINOLOGY_DATA.title}</Text>
                    <View className="h-1 w-20 bg-teal-400 rounded-full mt-1" />
                </View>
                <View className="items-end">
                    <Text className="text-teal-400 font-bold text-[10px] uppercase">Seeds</Text>
                    <Text className="text-white font-black text-xl">{score}/4</Text>
                </View>
            </View>

            <TouchableOpacity onPress={onExit} style={{ position: 'absolute', top: 50, right: width / 2 - 20, zIndex: 60, padding: 8, backgroundColor: 'rgba(0,0,0,0.3)', borderRadius: 20 }}>
                <Text className="text-white text-xs font-bold">Exit</Text>
            </TouchableOpacity>

            {/* Falling Items */}
            {fallingItems.map(item => (
                <View
                    key={item.id}
                    style={{
                        position: 'absolute',
                        left: item.x - 70, // centered
                        top: item.y,
                        width: 140,
                        padding: 12,
                        backgroundColor: 'rgba(255,255,255,0.9)',
                        borderRadius: 16,
                        borderWidth: 2,
                        borderColor: 'rgba(255,255,255,0.5)'
                    }}
                >
                    <Text className="text-xs font-bold text-center text-slate-800 uppercase tracking-wide">{item.text}</Text>
                </View>
            ))}

            {/* Player */}
            <View
                style={{
                    position: 'absolute',
                    top: PLAYER_Y_PX - 40,
                    left: playerX - 40,
                    width: 80,
                    height: 80,
                    justifyContent: 'center',
                    alignItems: 'center'
                }}
            >
                <View className={`absolute inset-0 bg-teal-400 rounded-full blur-xl opacity-30 ${harmony > 60 ? 'scale-150' : 'scale-75'}`} />
                {harmony > 30 ? <HopeIcon width={80} height={80} /> : <DistressedIcon width={80} height={80} />}
            </View>

            {/* Sidebar / Alert Overlays */}
            {sidebarData && (
                <View className="absolute top-32 right-4 w-48 bg-white/95 p-4 rounded-xl shadow-xl border-l-4 border-teal-500 z-50">
                    <Text className="text-[8px] font-black text-teal-600 uppercase">Better Choice</Text>
                    <Text className="text-xs font-bold my-1">"{sidebarData.correct}"</Text>
                    <Text className="text-[10px] text-slate-600 leading-tight">{sidebarData.why}</Text>
                    <TouchableOpacity onPress={() => setSidebarData(null)} className="mt-2"><Text className="text-[8px] text-slate-400 font-bold">DISMISS</Text></TouchableOpacity>
                </View>
            )}

            {stigmaAlert && (
                <View className="absolute top-32 left-4 w-48 bg-slate-900/95 p-4 rounded-xl shadow-xl border-l-4 border-red-500 z-50">
                    <Text className="text-[8px] font-black text-red-400 uppercase">Stigma Alert</Text>
                    <Text className="text-xs font-bold text-white my-1">"{stigmaAlert.stigma}"</Text>
                    <Text className="text-[10px] text-slate-400 leading-tight">Use: <Text className="text-teal-400 font-bold">"{stigmaAlert.correct}"</Text></Text>
                    <TouchableOpacity onPress={() => setStigmaAlert(null)} className="mt-2"><Text className="text-[8px] text-slate-500 font-bold">DISMISS</Text></TouchableOpacity>
                </View>
            )}

            {/* Intro Screen */}
            {gameState === 'INTRO' && (
                <View className="absolute inset-0 bg-slate-900/95 justify-center items-center p-8 z-[100]">
                    <HopeIcon width={100} height={100} />
                    <Text className="text-3xl font-black text-white uppercase mt-6 mb-2">Word Wisdom</Text>
                    <Text className="text-slate-300 text-center mb-8">Catch phrases of <Text className="text-teal-400 font-bold">Hope</Text>.{'\n'}Avoid the Stigma.</Text>
                    <TouchableOpacity onPress={startGame} className="bg-white px-8 py-4 rounded-full">
                        <Text className="font-black text-slate-900 uppercase tracking-widest">Begin</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* Results / Game Over */}
            {(gameState === 'RESULTS' || gameState === 'GAME_OVER') && (
                <View className="absolute inset-0 bg-slate-900/95 justify-center items-center p-8 z-[100]">
                    <Text className="text-4xl font-black text-white uppercase mb-4">
                        {gameState === 'RESULTS' ? 'Wisdom Gained' : "Don't Give Up"}
                    </Text>
                    <Text className="text-teal-400 font-bold text-2xl mb-8">Score: {score}/4</Text>
                    <TouchableOpacity onPress={startGame} className="bg-teal-500 px-8 py-4 rounded-full mb-4 w-full items-center">
                        <Text className="font-black text-white uppercase tracking-widest">Try Again</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onExit} className="bg-white/10 px-8 py-4 rounded-full w-full items-center">
                        <Text className="font-bold text-white uppercase tracking-widest">Exit</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

export default WordsOfHopeScreen;
