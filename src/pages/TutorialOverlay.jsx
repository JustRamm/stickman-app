import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TutorialOverlay = ({ gameState, playerPos, foundClues }) => {
    const [step, setStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    // Hooks must be called unconditionally
    useEffect(() => {
        // Reset tutorial step when entering tutorial
        setStep(0);
        setIsVisible(true);
    }, []);

    // Step Logic
    useEffect(() => {
        if (step === 0 && playerPos.x > 15) setStep(1); // Moved right
        if (step === 1 && playerPos.x < 15) setStep(2); // Moved back
        if (step === 2 && foundClues.length > 0) setStep(3); // Found clue
        if (step === 3 && playerPos.x > 60) setIsVisible(false); // Almost at NPC
    }, [playerPos, foundClues, step]);

    if (!isVisible || gameState !== 'APPROACH') return null;

    return (
        <View className="absolute top-20 left-0 right-0 z-50 pointer-events-none items-center px-4">
            <View className="bg-white/90 px-6 py-4 rounded-2xl shadow-xl border-2 border-teal-400 flex-row items-center gap-4 w-full max-w-lg">
                <View className="w-10 h-10 bg-teal-500 rounded-full items-center justify-center shrink-0">
                    <Text className="text-xl font-bold text-white">
                        {step === 0 && '👉'}
                        {step === 1 && '👈'}
                        {step === 2 && '🧐'}
                        {step === 3 && '💬'}
                    </Text>
                </View>
                <View className="flex-1">
                    <Text className="font-black text-slate-800 uppercase tracking-wider text-xs mb-1">Training Mission</Text>
                    <Text className="text-slate-600 font-medium text-sm leading-tight">
                        {step === 0 && "Use Joystick or Touch to move right."}
                        {step === 1 && "Move back left. Give them space."}
                        {step === 2 && "Tap the floating note to inspect clues."}
                        {step === 3 && "Walk close to Alex to start your training conversation."}
                    </Text>
                </View>

                {/* Key Hint (Simplified for Mobile) */}
                <View className="ml-auto flex-row gap-1">
                    {step === 0 && <View className="px-2 py-1 bg-slate-200 rounded"><Text className="text-[10px] font-black font-mono">→</Text></View>}
                    {step === 1 && <View className="px-2 py-1 bg-slate-200 rounded"><Text className="text-[10px] font-black font-mono">←</Text></View>}
                    {step === 2 && <View className="px-2 py-1 bg-slate-200 rounded"><Text className="text-[10px] font-black font-mono">Tap</Text></View>}
                </View>
            </View>
        </View>
    );
};

export default TutorialOverlay;
