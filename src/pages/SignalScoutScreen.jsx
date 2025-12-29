import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, StyleSheet, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SCENARIOS } from '../data/signalScoutData';
import ASSETS from '../utils/assetMap';

const { width, height } = Dimensions.get('window');

const SignalScoutScreen = ({ audioManager, onExit }) => {
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, END
    const [score, setScore] = useState(0);
    const [timeLeft, setTimeLeft] = useState(60);
    const [people, setPeople] = useState([]);
    const [feedback, setFeedback] = useState(null);
    const usedScenarioIdsRef = useRef(new Set());
    const spawnTimerRef = useRef(null);

    // --- Asset Mapping ---
    const getStickmanAssetKey = (category) => {
        const assets = {
            'Youth': ['stickman_laptop', 'stickman_phone', 'thinking_stickman', 'girl_idle'],
            'Elderly': ['sad_stickman', 'empty_stickman', 'stickman_group'],
            'Men': ['guy_distressed', 'guy_idle', 'guy_walk_right', 'stickman_phone'],
            'Women': ['girl_walk_right', 'girl_idle', 'thinking_stickman', 'dog_walker']
        };
        const categoryAssets = assets[category] || assets['Youth'];
        return categoryAssets[Math.floor(Math.random() * categoryAssets.length)];
    };

    const startGame = () => {
        setGameState('PLAYING');
        setScore(0);
        setTimeLeft(60);
        setPeople([]);
        setFeedback(null);
        usedScenarioIdsRef.current = new Set();
        if (audioManager) audioManager.startAmbient('park');
    };

    // Timer
    useEffect(() => {
        if (gameState !== 'PLAYING') return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    setGameState('END');
                    if (audioManager) audioManager.playVictory();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [gameState]);

    // Spawning System
    useEffect(() => {
        if (gameState !== 'PLAYING') {
            if (spawnTimerRef.current) clearInterval(spawnTimerRef.current);
            return;
        }

        const spawnPerson = () => {
            setPeople(currentPeople => {
                if (currentPeople.length >= 8) return currentPeople;

                const availableScenarios = SCENARIOS.filter(s => !usedScenarioIdsRef.current.has(s.id));
                if (availableScenarios.length === 0) {
                    if (usedScenarioIdsRef.current.size >= SCENARIOS.length) {
                        usedScenarioIdsRef.current = new Set();
                        return currentPeople;
                    }
                    return currentPeople;
                }

                const scenario = availableScenarios[Math.floor(Math.random() * availableScenarios.length)];
                usedScenarioIdsRef.current.add(scenario.id);

                const isLeftStart = Math.random() > 0.5;
                const startX = isLeftStart ? -100 : width + 100;
                const endX = isLeftStart ? width + 100 : -100;

                return [...currentPeople, {
                    uid: Date.now() + Math.random(),
                    data: scenario,
                    startX,
                    endX,
                    y: 100 + Math.random() * (height - 250), // Keep within middle band
                    duration: 8000 + Math.random() * 4000, // 8-12s crossing
                    assetKey: getStickmanAssetKey(scenario.category),
                    isClicked: false,
                    direction: isLeftStart ? 1 : -1
                }];
            });
        };

        spawnPerson(); // Immediate
        spawnTimerRef.current = setInterval(spawnPerson, 2000);

        return () => clearInterval(spawnTimerRef.current);
    }, [gameState, width, height]);


    const handlePersonClick = (person, x, y) => {
        if (person.isClicked || gameState !== 'PLAYING') return;

        // Mark local (in state) as clicked to prevent re-clicks? 
        // Actually, we can just remove them or update state. 
        setPeople(prev => prev.map(p => p.uid === person.uid ? { ...p, isClicked: true } : p));

        const isRisk = person.data.type === 'risk';

        if (isRisk) {
            if (audioManager?.playDing) audioManager.playDing();
            setScore(prev => prev + 100);
            setFeedback({ text: `Correct! ${person.data.clue}`, type: 'good', x, y });
        } else {
            if (audioManager?.playSad) audioManager.playSad();
            setScore(prev => Math.max(0, prev - 50));
            setFeedback({ text: "Just normal stress.", type: 'bad', x, y });
        }

        setTimeout(() => setFeedback(null), 2000);
    };

    const cleanupPerson = (uid) => {
        setPeople(prev => prev.filter(p => p.uid !== uid));
    };

    return (
        <View className="flex-1 bg-slate-900 overflow-hidden">
            {/* Binocular Effect */}
            <LinearGradient
                colors={['rgba(0,0,0,0.8)', 'transparent', 'transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />

            {/* Header */}
            <View className="absolute top-0 left-0 right-0 p-4 pt-10 flex-row justify-between items-start z-50" pointerEvents="box-none">
                <View className="flex-col gap-2">
                    <TouchableOpacity onPress={onExit} className="w-10 h-10 bg-black/40 rounded-full items-center justify-center border border-white/20">
                        <Text className="text-white font-bold">X</Text>
                    </TouchableOpacity>

                    <View className="bg-slate-900/80 px-4 py-2 rounded-xl border-l-4 border-teal-500 shadow-lg">
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Score</Text>
                        <Text className="text-2xl font-black text-white">{score}</Text>
                    </View>
                </View>

                <View className="bg-black/30 px-4 py-2 rounded-full border border-white/10 items-center">
                    <Text className={`text-2xl font-black ${timeLeft < 10 ? 'text-red-400' : 'text-white'}`}>
                        00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}
                    </Text>
                    <Text className="text-[8px] text-white/50 font-bold uppercase tracking-widest">Time Left</Text>
                </View>
            </View>

            {/* Game World */}
            <View className="flex-1 relative">
                {/* Environment Grid */}
                <View style={[StyleSheet.absoluteFill, { opacity: 0.1, backgroundColor: '#334155' }]} />

                {people.map(person => (
                    <PersonItem
                        key={person.uid}
                        person={person}
                        onPress={handlePersonClick}
                        onFinish={cleanupPerson}
                    />
                ))}

                {feedback && (
                    <View
                        className={`absolute px-4 py-3 rounded-xl border-2 z-50 self-center items-center shadow-xl ${feedback.type === 'good' ? 'bg-teal-500/90 border-teal-300' : 'bg-slate-800/90 border-red-500'}`}
                        style={{ top: feedback.y - 80, left: feedback.x - 100, width: 200 }}
                    >
                        <Text className="text-2xl mb-1">{feedback.type === 'good' ? '✅' : '⚠️'}</Text>
                        <Text className={`text-xs font-bold text-center ${feedback.type === 'good' ? 'text-white' : 'text-red-300'}`}>
                            {feedback.text}
                        </Text>
                    </View>
                )}
            </View>

            {/* Intro Modal */}
            {gameState === 'INTRO' && (
                <View className="absolute inset-0 bg-slate-900/95 justify-center items-center p-6 z-50">
                    <View className="w-full max-w-md bg-white rounded-3xl p-8 items-center shadow-2xl">
                        <View className="w-20 h-20 bg-slate-100 rounded-full items-center justify-center mb-6 border-4 border-white shadow-sm">
                            <Text className="text-4xl">🔭</Text>
                        </View>
                        <Text className="text-3xl font-black uppercase text-slate-800 mb-2 text-center">Signal Scout</Text>
                        <Text className="text-slate-500 font-medium text-sm mb-8 text-center leading-relaxed">
                            Identify people showing <Text className="font-bold text-red-500">Warning Signs</Text>.
                            {'\n'}Tap their speech bubbles.
                        </Text>

                        <TouchableOpacity onPress={startGame} className="w-full py-4 bg-slate-900 rounded-xl items-center shadow-xl">
                            <Text className="text-white font-black uppercase tracking-widest">Start Patrol ➔</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* End Modal */}
            {gameState === 'END' && (
                <View className="absolute inset-0 bg-slate-900/95 justify-center items-center p-6 z-50">
                    <View className="w-full max-w-md bg-white rounded-3xl p-8 items-center shadow-2xl">
                        <Text className="text-2xl font-black uppercase text-slate-400 mb-6 tracking-widest">Patrol Ended</Text>
                        <View className="items-center mb-8">
                            <Text className="text-xs font-bold text-teal-600 uppercase tracking-widest bg-teal-50 px-3 py-1 rounded-full mb-2">Final Score</Text>
                            <Text className="text-7xl font-black text-slate-800">{score}</Text>
                        </View>

                        <View className="w-full gap-3">
                            <TouchableOpacity onPress={startGame} className="w-full py-4 bg-teal-500 rounded-xl items-center shadow-lg">
                                <Text className="text-white font-black uppercase tracking-widest">Play Again ↺</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={onExit} className="w-full py-4 bg-white border-2 border-slate-100 rounded-xl items-center">
                                <Text className="text-slate-400 font-bold uppercase tracking-widest">Return to Menu</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )}
        </View>
    );
};

// Sub-component for individual person animation
const PersonItem = ({ person, onPress, onFinish }) => {
    const translateX = useRef(new Animated.Value(person.startX)).current;
    const AssetIcon = ASSETS[person.assetKey] || View;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: person.endX,
            duration: person.duration,
            easing: Easing.linear,
            useNativeDriver: true // Use native driver for performance
        }).start(({ finished }) => {
            if (finished) onFinish(person.uid);
        });
    }, []);

    // We can't easily get the *animated* value for the feedback popup position synchronously
    // without a listener or assumption.
    // Simplifying: Feedback appears fixed center or approximate tap location?
    // Passed 'starting' X/Y isn't enough as they move.
    // For now, we'll pass the *current visual* X/Y if possible, or just center the feedback.
    // Limitation: Native Driver Animation values are hard to read back synchronously. 
    // Workaround: We'll just display feedback at fixed screen center or approximate, 
    // OR we won't use position-based feedback and just use a toaster. 
    // Let's use a simpler approach: feedback centers on screen or top.

    // BUT! We can just pass the "tap" event coordinates!
    // TouchableOpacity onPress passes an event.

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: person.y,
                left: 0,
                transform: [{ translateX }],
                zIndex: Math.floor(person.y),
                width: 100
            }}
        >
            <TouchableOpacity
                activeOpacity={0.8}
                onPress={(e) => {
                    // Get touch coordinates if possible, or just center.
                    // React Native web/mobile event differences? 
                    // e.nativeEvent.pageX/pageY works usually.
                    const { pageX, pageY } = e.nativeEvent;
                    onPress(person, pageX, pageY);
                }}
                disabled={person.isClicked}
                style={{ opacity: person.isClicked ? 0.5 : 1 }}
            >
                {/* Speech Bubble */}
                <View className={`bg-white p-2 rounded-xl border-2 mb-2 ${person.data.type === 'risk' ? 'border-red-100' : 'border-blue-50'} shadow-sm`}>
                    <Text className="text-[10px] font-bold leading-tight text-center text-slate-800">{person.data.text}</Text>
                    <View className="absolute -bottom-1 left-1/2 -ml-1 w-2 h-2 bg-white border-b-2 border-r-2 border-inherit rotate-45" />
                </View>

                {/* Stickman */}
                <View className={`h-24 w-full items-center ${person.direction === -1 ? 'scale-x-[-1]' : ''}`}>
                    <AssetIcon width={80} height={80} fill="#fff" style={{ opacity: 0.8 }} />
                    {/* Note: Invert/Brightness filters from web aren't straightforward in RN without extra libs. 
                        We assume SVG color props or just simple rendering. 
                        If the asset renders black, fill='#fff' helps on dark bg if supported.
                     */}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
};


export default SignalScoutScreen;
