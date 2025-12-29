import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Scenery from '../components/Scenery';

const FinalSuccessScreen = ({ onRestart }) => {
    return (
        <View className="flex-1 bg-slate-900 justify-center items-center">
            {/* Background */}
            <View style={StyleSheet.absoluteFill}>
                <Scenery theme="rainy_street" trust={100} />
                <View className="absolute inset-0 bg-slate-900/80" />
            </View>

            <View className="z-10 w-full max-w-2xl px-4 items-center">
                <View className="w-20 h-20 bg-teal-500 rounded-full items-center justify-center shadow-2xl mb-6">
                    <Text className="text-4xl">🌟</Text>
                </View>

                <Text className="text-4xl font-black uppercase text-teal-300 text-center mb-4 tracking-tight">
                    Journey Complete
                </Text>

                <View className="mb-8 items-center">
                    <Text className="text-slate-200 text-base font-medium text-center mb-4 leading-relaxed">
                        Congratulations, Gatekeeper. You have walked through the rain and the storm.
                    </Text>
                    <Text className="text-slate-300 text-sm italic text-center mb-4 opacity-90 px-4">
                        "In the beginning, it's easy to judge or offer empty clichés. But through this journey, you learned the most powerful skill of all:
                        <Text className="text-teal-400 font-bold not-italic"> Deep Listening.</Text>"
                    </Text>
                    <Text className="text-slate-200 text-sm font-medium text-center">
                        You saved lives today—not by fixing problems, but by making others feel seen.
                    </Text>
                </View>

                <View className="p-6 bg-white/10 rounded-2xl border border-white/20 w-full max-w-md items-center mb-8">
                    <Text className="text-xs font-black uppercase tracking-widest text-teal-400 mb-4">Your Impact</Text>
                    <View className="flex-row justify-center gap-8 w-full">
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-white">5/5</Text>
                            <Text className="text-[10px] uppercase tracking-wider text-slate-400">Missions</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-white">100%</Text>
                            <Text className="text-[10px] uppercase tracking-wider text-slate-400">Empathy</Text>
                        </View>
                        <View className="items-center">
                            <Text className="text-2xl font-bold text-white">Guarded</Text>
                            <Text className="text-[10px] uppercase tracking-wider text-slate-400">Lives</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    onPress={onRestart}
                    className="px-10 py-4 bg-teal-500 rounded-full shadow-2xl active:scale-95"
                >
                    <Text className="text-white font-black text-sm uppercase tracking-widest">Become a Gatekeeper</Text>
                </TouchableOpacity>

            </View>
        </View>
    );
};

export default FinalSuccessScreen;
