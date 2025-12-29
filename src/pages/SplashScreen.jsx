import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Scenery from '../components/Scenery';
import { LinearGradient } from 'expo-linear-gradient';

const SplashScreen = ({ loadingProgress }) => {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center">
            <View style={StyleSheet.absoluteFill}>
                <Scenery theme="park" trust={50} />
                <View className="absolute inset-0 bg-slate-900/80" />
            </View>

            <View className="items-center z-20 p-4 w-full max-w-sm">
                <View className="mb-12 items-center justify-center relative">
                    <View className="w-32 h-32 bg-white rounded-full items-center justify-center shadow-2xl z-10">
                        {/* Placeholder for Logo - Using Text for reliability */}
                        <Text className="text-4xl">🏃</Text>
                    </View>
                    <View className="absolute inset-0 bg-teal-500/30 rounded-full scale-110" />
                </View>

                <Text className="text-4xl font-black text-white text-center mb-2 tracking-tighter">STICKMAN</Text>
                <Text className="text-teal-400 font-black uppercase tracking-[3px] text-[10px] mb-12">To The Rescue</Text>

                <View className="w-full px-4 text-center">
                    <View className="flex-row justify-between mb-2">
                        <Text className="text-[10px] uppercase font-black tracking-widest text-slate-500">{loadingProgress >= 100 ? 'Ready to Start' : 'Loading Experience'}</Text>
                        <Text className="text-[10px] uppercase font-black tracking-widest text-slate-500">{Math.round(loadingProgress)}%</Text>
                    </View>
                    <View className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                        <View
                            className="h-full bg-teal-500 shadow-sm"
                            style={{ width: `${loadingProgress}%` }}
                        />
                    </View>
                </View>

                <Text className="mt-12 text-[9px] font-black uppercase tracking-[4px] text-slate-600">
                    Connecting to Empathy...
                </Text>
            </View>
        </View>
    );
};

export default SplashScreen;
