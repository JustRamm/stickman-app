import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Animated, PanResponder, StyleSheet, Vibration, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { QUIZ_QUESTIONS } from '../data/quizData';
import ASSETS from '../utils/assetMap';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 120;

const QuizGameScreen = ({ audioManager, onExit }) => {
    const [quizTimer, setQuizTimer] = useState(60);
    const [deck, setDeck] = useState([]);
    const [mythCount, setMythCount] = useState(0);
    const [factCount, setFactCount] = useState(0);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);

    // Animation for top card
    const position = useRef(new Animated.ValueXY()).current;

    // Icons
    const ClockIcon = ASSETS['clock_stickman'] || View; // Fallback
    const SadIcon = ASSETS['sad_stickman'] || View;
    const HappyIcon = ASSETS['happy_stickman'] || View;
    const ThinkingIcon = ASSETS['thinking_stickman'] || View;
    const EmptyIcon = ASSETS['empty_stickman'] || View;

    useEffect(() => {
        // Shuffle deck
        const shuffled = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5);
        setDeck(shuffled);
    }, []);

    useEffect(() => {
        if (showResults) return;
        const timer = setInterval(() => {
            setQuizTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setShowResults(true);
                    return 0;
                }
                // if (audioManager?.playTick) audioManager.playTick(); // Optional tick
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [showResults]);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderMove: (evt, gestureState) => {
                position.setValue({ x: gestureState.dx, y: gestureState.dy });
            },
            onPanResponderRelease: (evt, gestureState) => {
                if (gestureState.dx > SWIPE_THRESHOLD) {
                    forceSwipe('right');
                } else if (gestureState.dx < -SWIPE_THRESHOLD) {
                    forceSwipe('left');
                } else {
                    resetPosition();
                }
            }
        })
    ).current;

    const forceSwipe = (direction) => {
        const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
        Animated.timing(position, {
            toValue: { x, y: 0 },
            duration: 250,
            useNativeDriver: false
        }).start(() => onSwipeComplete(direction));
    };

    const onSwipeComplete = (direction) => {
        const item = deck[0];
        const answer = direction === 'right' ? 'Fact' : 'Myth';
        const isCorrect = item.answer === answer;

        if (isCorrect) {
            setScore(prev => prev + 1);
            if (audioManager?.playDing) audioManager.playDing();
            Vibration.vibrate(50);
        } else {
            if (audioManager?.playSad) audioManager.playSad();
            Vibration.vibrate([50, 50, 50]);
        }

        if (direction === 'right') setFactCount(prev => prev + 1);
        else setMythCount(prev => prev + 1);

        position.setValue({ x: 0, y: 0 });
        setDeck(prev => prev.slice(1));
    };

    const resetPosition = () => {
        Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            friction: 4,
            useNativeDriver: false
        }).start();
    };

    const restartQuiz = () => {
        setScore(0);
        setMythCount(0);
        setFactCount(0);
        setQuizTimer(60);
        setShowResults(false);
        setDeck([...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5));
    };

    const Card = ({ item, isTop }) => {
        const rotate = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: ['-10deg', '0deg', '10deg'],
            extrapolate: 'clamp'
        });

        const rotateAndTranslate = {
            transform: [{ rotate }, ...position.getTranslateTransform()]
        };

        const opacity = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
            outputRange: [0.5, 1, 0.5],
            extrapolate: 'clamp'
        });

        // Overlay Opacities
        const likeOpacity = position.x.interpolate({
            inputRange: [0, SCREEN_WIDTH / 4],
            outputRange: [0, 1],
            extrapolate: 'clamp'
        });
        const nopeOpacity = position.x.interpolate({
            inputRange: [-SCREEN_WIDTH / 4, 0],
            outputRange: [1, 0],
            extrapolate: 'clamp'
        });

        if (!isTop) {
            return (
                <View className="absolute w-[300px] h-[450px] bg-white rounded-3xl shadow-xl justify-center items-center p-6 border-4 border-slate-100 top-4 scale-95 opacity-50 z-0">
                    <ThinkingIcon width={80} height={80} style={{ opacity: 0.5 }} />
                </View>
            );
        }

        return (
            <Animated.View
                {...panResponder.panHandlers}
                style={[rotateAndTranslate, { zIndex: 10 }]}
                className="absolute w-[300px] h-[450px] bg-white rounded-3xl shadow-2xl border-4 border-white justify-center items-center p-6"
            >
                {/* Labels */}
                <Animated.View style={{ opacity: likeOpacity, position: 'absolute', top: 50, left: 40, transform: [{ rotate: '-30deg' }], zIndex: 20 }}>
                    <Text className="border-4 border-teal-500 text-teal-500 text-3xl font-black px-4 py-1 rounded-xl uppercase">FACT</Text>
                </Animated.View>
                <Animated.View style={{ opacity: nopeOpacity, position: 'absolute', top: 50, right: 40, transform: [{ rotate: '30deg' }], zIndex: 20 }}>
                    <Text className="border-4 border-orange-500 text-orange-500 text-3xl font-black px-4 py-1 rounded-xl uppercase">MYTH</Text>
                </Animated.View>

                <View className="w-24 h-24 bg-indigo-50 rounded-full items-center justify-center mb-6">
                    <ThinkingIcon width={60} height={60} />
                </View>
                <Text className="text-xl font-bold text-slate-800 text-center leading-tight mb-8">
                    {item.question}
                </Text>
                <View className="flex-row justify-between w-full px-8 absolute bottom-8 opacity-50">
                    <Text className="text-orange-400 font-bold uppercase text-xs">← Myth</Text>
                    <Text className="text-teal-400 font-bold uppercase text-xs">Fact →</Text>
                </View>
            </Animated.View>
        );
    };

    if (showResults || deck.length === 0) {
        return (
            <View className="flex-1 bg-white items-center justify-center p-8">
                <View className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 items-center">
                    <Text className="text-3xl font-black text-slate-800 mb-2">
                        {score === QUIZ_QUESTIONS.length ? "Perfect Score!" : "Quiz Complete!"}
                    </Text>
                    <Text className="text-slate-600 mb-8 font-medium">
                        You scored <Text className="text-teal-600 font-black">{score}</Text> / {QUIZ_QUESTIONS.length}
                    </Text>

                    <View className="flex-row gap-4 mb-8">
                        <View className="items-center bg-orange-50 p-4 rounded-2xl w-28">
                            <SadIcon width={30} height={30} />
                            <Text className="font-black text-orange-500 mt-2">{mythCount}</Text>
                            <Text className="text-[10px] uppercase text-slate-400">Myths</Text>
                        </View>
                        <View className="items-center bg-teal-50 p-4 rounded-2xl w-28">
                            <HappyIcon width={30} height={30} />
                            <Text className="font-black text-teal-500 mt-2">{factCount}</Text>
                            <Text className="text-[10px] uppercase text-slate-400">Facts</Text>
                        </View>
                    </View>

                    <TouchableOpacity onPress={restartQuiz} className="w-full py-4 bg-teal-500 rounded-xl items-center mb-3">
                        <Text className="text-white font-black uppercase tracking-widest">Restart</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={onExit} className="w-full py-4 bg-slate-900 rounded-xl items-center">
                        <Text className="text-white font-black uppercase tracking-widest">Exit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-indigo-900">
            <LinearGradient
                colors={['#4f46e5', '#7e22ce', '#312e81']}
                style={StyleSheet.absoluteFill}
            />

            {/* Header */}
            <View className="flex-row justify-between items-center p-6 pt-12">
                <TouchableOpacity onPress={onExit} className="w-10 h-10 bg-black/20 rounded-full items-center justify-center border border-white/20">
                    <Text className="text-white font-bold">X</Text>
                </TouchableOpacity>
                <View className="flex-row items-center gap-2 bg-black/20 px-4 py-2 rounded-full border border-white/10">
                    <ClockIcon width={20} height={20} fill="#fff" />
                    <Text className={`font-mono text-xl font-black ${quizTimer < 10 ? 'text-red-400' : 'text-white'}`}>
                        {quizTimer}
                    </Text>
                </View>
            </View>

            <View className="flex-1 items-center justify-center mb-20 relative">
                {/* Empty State / Bottom Card Placeholder */}
                {deck.length > 1 && (
                    <View className="absolute z-0">
                        <Card item={deck[1]} isTop={false} />
                    </View>
                )}
                {/* Top Card */}
                {deck.length > 0 && (
                    <Card item={deck[0]} isTop={true} />
                )}
            </View>
        </View>
    );
};

export default QuizGameScreen;
