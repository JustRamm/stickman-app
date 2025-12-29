import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Animated } from 'react-native';
import Scenery from '../components/Scenery';
import { LinearGradient } from 'expo-linear-gradient';
import ASSETS from '../utils/assetMap';

const StartScreen = ({ trust, onStart, onResources }) => {
    // Basic animation for float effect
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(floatAnim, { toValue: -10, duration: 2000, useNativeDriver: true }),
                Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true })
            ])
        ).start();
    }, []);

    const SvgGuy = ASSETS['guy_idle'];
    const SvgGroup = ASSETS['group_hug'];

    return (
        <View className="flex-1 bg-slate-900 justify-center items-center overflow-hidden">
            {/* Immersive Background */}
            <View style={StyleSheet.absoluteFill}>
                <Scenery trust={trust} />
                <LinearGradient
                    colors={['rgba(15,23,42,1)', 'rgba(15,23,42,0.8)', 'rgba(15,23,42,0.6)']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 0, y: 0 }}
                    style={StyleSheet.absoluteFill}
                />
            </View>

            {/* Floating Content */}
            <View className="z-20 items-center w-full px-4">

                {/* Top Badge: Mind Empowered Logo */}
                <View className="mb-8 items-center gap-4">
                    <View className="w-24 h-24 rounded-full overflow-hidden shadow-2xl border-4 border-slate-800 bg-white items-center justify-center">
                        {/* Placeholder for ME.jpeg if not available via require, assuming standard Image works if bundled */}
                        <Text className="text-3xl">🧠</Text>
                    </View>
                    <Text className="text-[10px] font-black uppercase tracking-[4px] text-teal-400/80">Presented By Mind Empowered</Text>
                </View>

                {/* Main Title Group */}
                <View className="mb-12 items-center relative w-full">
                    <Text className="text-6xl font-black text-white text-center mb-2 tracking-tighter shadow-black drop-shadow-lg">
                        STICKMAN
                    </Text>
                    <Text className="text-xl font-black uppercase tracking-widest text-teal-300 text-center">
                        TO THE RESCUE
                    </Text>

                    {/* Decorative Elements (Animated) */}
                    <Animated.View style={{ position: 'absolute', right: '10%', top: -20, transform: [{ translateY: floatAnim }, { rotate: '12deg' }] }}>
                        {SvgGuy && <SvgGuy width={80} height={80} fill="#fff" opacity={0.9} />}
                    </Animated.View>
                    <Animated.View style={{ position: 'absolute', left: '10%', bottom: -20, transform: [{ translateY: floatAnim }, { rotate: '-12deg' }] }}>
                        {SvgGroup && <SvgGroup width={100} height={80} fill="#14b8a6" opacity={0.6} />}
                    </Animated.View>
                </View>

                {/* Start Button */}
                <TouchableOpacity
                    onPress={onStart}
                    className="px-10 py-5 bg-white rounded-full flex-row items-center gap-3 shadow-xl active:scale-95 transition-transform"
                >
                    <Text className="text-slate-900 font-black text-xl tracking-widest uppercase">Start Simulation</Text>
                    <Text className="text-teal-600 font-bold text-xl">→</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={onResources}
                    className="mt-8 flex-row items-center gap-2"
                >
                    <Text className="text-teal-400 text-[10px] font-black uppercase tracking-[3px]">Mental Health Resources</Text>
                    <View className="w-4 h-px bg-teal-500/50" />
                    <Text className="text-teal-400 text-xs shadow-sm">✚</Text>
                </TouchableOpacity>

                <Text className="mt-8 text-slate-400 text-[10px] font-medium uppercase tracking-widest opacity-60 text-center">
                    A QPR Suicide Prevention Training Module
                </Text>

            </View>
        </View>
    );
};

export default StartScreen;
