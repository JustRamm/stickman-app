import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Image, Dimensions, Vibration, Alert, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { OBSTACLES, PLAYER_CARDS } from '../data/resourceRelayData';
import Stickman from '../components/Stickman'; // Reuse existing component
import ASSETS from '../utils/assetMap';

const { width } = Dimensions.get('window');

const ResourceRelayScreen = ({ audioManager, onComplete, onExit }) => {
    // Game State
    const [level, setLevel] = useState(0);
    const [currentObstacle, setCurrentObstacle] = useState(null);
    const [playerHand, setPlayerHand] = useState([]);
    const [score, setScore] = useState(0);
    const [gameState, setGameState] = useState('INTRO'); // INTRO, PLAYING, RESOLVING, WIN
    const [feedback, setFeedback] = useState(null);
    const [samEmotion, setSamEmotion] = useState('anxious');
    const [inspectedCard, setInspectedCard] = useState(null);

    // Refs
    const resistanceMax = 5;
    const shuffledObstaclesRef = useRef([]);

    useEffect(() => {
        const shuffled = [...OBSTACLES].sort(() => Math.random() - 0.5);
        shuffledObstaclesRef.current = shuffled;
        startLevel(0, shuffled);
    }, []);

    const startLevel = (lvlIdx, obstaclesPool = shuffledObstaclesRef.current) => {
        if (lvlIdx >= resistanceMax) {
            setGameState('WIN');
            if (audioManager) audioManager.playVictory();
            return;
        }

        const obs = obstaclesPool[lvlIdx % obstaclesPool.length];
        setCurrentObstacle(obs);
        setSamEmotion(obs.stickman_emotion || 'anxious');

        // Logic to deal hand (simplified from web version)
        const possibleWinners = obs.weaknesses.map(id => PLAYER_CARDS.find(c => c.id === id)).filter(Boolean);
        let hand = [];
        const winnersToAdd = [...possibleWinners].sort(() => Math.random() - 0.5).slice(0, 2);
        hand.push(...winnersToAdd);

        const winnerIds = hand.map(w => w.id);
        const distractors = PLAYER_CARDS.filter(c => !winnerIds.includes(c.id));
        const shuffledDistractors = [...distractors].sort(() => Math.random() - 0.5);

        while (hand.length < 4 && shuffledDistractors.length > 0) {
            hand.push(shuffledDistractors.shift());
        }

        setPlayerHand(hand.sort(() => Math.random() - 0.5));
        setGameState('PLAYING');
    };

    const handleCardPlay = (card) => {
        if (gameState !== 'PLAYING') return;
        setInspectedCard(null);
        setGameState('RESOLVING');

        const isMatch = currentObstacle.weaknesses.includes(card.id);

        if (isMatch) {
            setFeedback({ type: 'success', msg: "Barrier Broken!" });
            setSamEmotion('relief');
            if (audioManager) audioManager.playDing();
            Vibration.vibrate(50);

            setTimeout(() => {
                setScore(s => s + 1);
                setFeedback(null);
                const next = level + 1;
                setLevel(next);
                startLevel(next);
            }, 1500);
        } else {
            setFeedback({ type: 'failure', msg: "That won't work..." });
            setSamEmotion('distressed');
            if (audioManager) audioManager.playSad();
            Vibration.vibrate([50, 50]);

            setTimeout(() => {
                setFeedback(null);
                setGameState('PLAYING');
            }, 1500);
        }
    };

    // Helper to get icon source from asset map or dynamic require
    // The data file likely has strings like "/icons/..." which won't work in RN.
    // We'll create a simple mapping or just use a generic icon for RN.
    const getCardIcon = (iconPath) => {
        // Fallback since we might not have specific icon assets mapped
        return ASSETS['scholar_stickman']; // Generic placeholder
    };

    return (
        <View className="flex-1 bg-slate-900">
            <LinearGradient
                colors={['#1e1b4b', '#0f172a', '#000000']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View className="flex-row justify-between items-center p-4 pt-10 bg-slate-800/50 border-b border-white/10">
                <TouchableOpacity onPress={onExit} className="px-3 py-1 bg-red-500/20 rounded border border-red-500/30">
                    <Text className="text-red-400 font-bold text-xs uppercase">Exit</Text>
                </TouchableOpacity>
                <View className="flex-col items-end">
                    <Text className="text-teal-400 font-black text-[10px] uppercase tracking-widest">Stage {level + 1}/{resistanceMax}</Text>
                    <View className="flex-row gap-1 mt-1">
                        {[...Array(resistanceMax)].map((_, i) => (
                            <View key={i} className={`h-1 rounded-full ${i < level ? 'w-4 bg-teal-400' : i === level ? 'w-6 bg-white' : 'w-2 bg-slate-600'}`} />
                        ))}
                    </View>
                </View>
            </View>

            {/* Main Area */}
            <View className="flex-1 items-center justify-center p-4">
                {/* Stickman / Opponent */}
                <View className="items-center mb-8">
                    <Stickman
                        emotion={samEmotion}
                        gender="guy"
                        theme="neutral"
                        scale={1.2}
                    />

                    {/* Obstacle Bubble */}
                    {currentObstacle && gameState !== 'WIN' && (
                        <View className="mt-4 bg-white/10 p-4 rounded-xl border border-white/20 max-w-xs shadow-xl backdrop-blur-md">
                            <View className="flex-row items-center gap-2 mb-1">
                                <Text className="text-lg">⚠️</Text>
                                <Text className="text-red-300 font-bold text-[10px] uppercase tracking-widest">Barrier Detected</Text>
                            </View>
                            <Text className="text-white font-black text-xl leading-tight">"{currentObstacle.text}"</Text>
                        </View>
                    )}
                </View>

                {/* Feedback */}
                {feedback && (
                    <View className={`absolute top-1/2 self-center px-6 py-3 rounded-xl border-2 shadow-2xl z-50 ${feedback.type === 'success' ? 'bg-teal-500 border-teal-300' : 'bg-red-500 border-red-300'}`}>
                        <Text className="text-white font-black text-lg uppercase tracking-widest">{feedback.msg}</Text>
                    </View>
                )}
            </View>

            {/* Hand */}
            {gameState !== 'WIN' && gameState !== 'INTRO' && (
                <View className="h-48 pb-4">
                    <ScrollView
                        horizontal
                        contentContainerStyle={{ paddingHorizontal: 20, alignItems: 'flex-end', gap: 10 }}
                        showsHorizontalScrollIndicator={false}
                    >
                        {playerHand.map((card, i) => (
                            <TouchableOpacity
                                key={card.id + i}
                                onPress={() => setInspectedCard(card)}
                                activeOpacity={0.9}
                                className="w-32 h-44 bg-white rounded-xl p-3 items-center justify-between border-b-4 border-slate-200 shadow-xl mb-4"
                            >
                                <View className="w-8 h-8 bg-indigo-100 rounded-lg items-center justify-center mb-2">
                                    <Text>📄</Text>
                                </View>
                                <View className="flex-1 items-center">
                                    <Text className="font-black text-slate-800 text-xs text-center leading-tight mb-1">{card.title}</Text>
                                    <View className="bg-indigo-50 px-2 py-0.5 rounded">
                                        <Text className="text-[8px] font-bold text-indigo-600 uppercase">{card.type}</Text>
                                    </View>
                                </View>
                                <Text className="text-[8px] text-slate-400 text-center line-clamp-2" numberOfLines={2}>{card.desc}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {/* Card Inspection Modal */}
            <Modal
                transparent
                visible={!!inspectedCard}
                animationType="slide"
                onRequestClose={() => setInspectedCard(null)}
            >
                <View className="flex-1 bg-black/80 justify-center items-center p-6">
                    {inspectedCard && (
                        <View className="w-full max-w-sm bg-white rounded-3xl p-6 items-center">
                            <TouchableOpacity onPress={() => setInspectedCard(null)} className="absolute top-4 right-4 p-2">
                                <Text className="text-slate-400 font-bold text-xl">✕</Text>
                            </TouchableOpacity>

                            <View className="w-16 h-16 bg-indigo-100 rounded-2xl items-center justify-center mb-4">
                                <Text className="text-3xl">📄</Text>
                            </View>

                            <Text className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2">Resource Profile</Text>
                            <Text className="text-2xl font-black text-slate-900 mb-4 text-center">{inspectedCard.title}</Text>

                            <View className="bg-slate-50 p-4 rounded-xl mb-6 w-full">
                                <Text className="text-slate-600 text-sm font-medium italic text-center">"{inspectedCard.learn_info}"</Text>
                            </View>

                            <TouchableOpacity
                                onPress={() => handleCardPlay(inspectedCard)}
                                className="w-full py-4 bg-indigo-600 rounded-xl items-center mb-3 shadow-lg"
                            >
                                <Text className="text-white font-black uppercase tracking-widest">Use Resource</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setInspectedCard(null)}
                                className="w-full py-3"
                            >
                                <Text className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest">Keep Browsing</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            </Modal>

            {/* Win Screen */}
            {gameState === 'WIN' && (
                <View className="absolute inset-0 bg-slate-900/95 justify-center items-center p-8 z-50">
                    <View className="w-24 h-24 bg-teal-500 rounded-full items-center justify-center mb-6 border-4 border-white shadow-xl">
                        <Text className="text-5xl">🏆</Text>
                    </View>
                    <Text className="text-3xl font-black text-white uppercase text-center mb-2">Master Referral!</Text>
                    <Text className="text-slate-400 text-center mb-8 max-w-xs">You've successfully matched barriers to support systems.</Text>

                    <TouchableOpacity onPress={onComplete} className="w-full py-4 bg-white rounded-xl items-center mb-4">
                        <Text className="text-slate-900 font-black uppercase tracking-widest">Continue</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onExit} className="w-full py-4 border border-white/20 rounded-xl items-center">
                        <Text className="text-slate-400 font-bold uppercase tracking-widest">Exit</Text>
                    </TouchableOpacity>
                </View>
            )}

        </View>
    );
};

export default ResourceRelayScreen;
