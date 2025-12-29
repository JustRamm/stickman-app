import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withSpring, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { audioManager } from '../utils/audio';

const HeartbeatMonitor = ({ trust, isActive = true }) => {
    // BPM Calculation
    const bpm = Math.max(60, 140 - (trust * 0.8));
    const intervalMs = (60 / bpm) * 1000;

    const scale = useSharedValue(1);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            // Pulse Animation
            scale.value = withSequence(
                withTiming(1.2, { duration: 100 }),
                withTiming(1, { duration: 100 })
            );

            if (audioManager.initialized) {
                // audioManager.playHeartbeat();
            }
        }, intervalMs);

        return () => clearInterval(interval);
    }, [bpm, isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scaleY: scale.value }]
    }));

    return (
        <View className="flex-col gap-1 p-3 bg-white/90 rounded-xl border-2 border-slate-200 shadow-xl w-40">
            <View className="flex-row items-center gap-3">
                {/* EKG Visualizer */}
                <View className="relative w-28 h-10 overflow-hidden bg-slate-900 rounded-lg border border-slate-700 justify-center items-center">
                    <Animated.View style={[{ width: '100%', height: '100%' }, animatedStyle]}>
                        <Svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none">
                            <Path
                                d="M0 20 L20 20 L25 10 L30 30 L35 5 L40 35 L45 20 L100 20"
                                fill="none"
                                stroke={trust < 40 ? '#ef4444' : '#2dd4bf'}
                                strokeWidth="2"
                                strokeLinejoin="round"
                            />
                        </Svg>
                    </Animated.View>
                </View>

                <View className="flex-col">
                    <Text className="text-[9px] font-black uppercase tracking-widest text-slate-400">Rate</Text>
                    <Text className={`text-lg font-bold font-mono leading-none ${trust < 40 ? 'text-red-500' : 'text-slate-700'}`}>
                        {Math.round(bpm)}
                    </Text>
                </View>
            </View>

            {/* Explicit Empathy Bar */}
            <View className="w-full space-y-1 mt-1">
                <View className="flex-row justify-between items-end px-0.5">
                    <Text className="text-[8px] font-black uppercase tracking-widest text-teal-600">Empathy</Text>
                    <Text className="text-[8px] font-bold text-slate-400">{Math.round(trust)}%</Text>
                </View>
                <View className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <View
                        className={`h-full rounded-full ${trust < 30 ? 'bg-red-500' : trust < 60 ? 'bg-orange-400' : 'bg-teal-500'}`}
                        style={{ width: `${trust}%` }}
                    />
                </View>
            </View>
        </View>
    );
};

export default HeartbeatMonitor;
