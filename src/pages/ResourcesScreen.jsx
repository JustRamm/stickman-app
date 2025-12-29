import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { REAL_RESOURCES } from '../data/resources';
import { LinearGradient } from 'expo-linear-gradient';

const ResourcesScreen = ({ onBack }) => {
    return (
        <View className="flex-1 bg-slate-900 p-4">
            {/* Background Accents (Simplified) */}
            <View className="absolute top-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full" style={{ opacity: 0.5 }} pointerEvents="none" />
            <View className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full" style={{ opacity: 0.5 }} pointerEvents="none" />

            {/* Header */}
            <View className="flex-row justify-between items-end mb-4 border-b border-white/10 pb-4">
                <View>
                    <Text className="text-2xl font-black text-white mb-1">Mental Health Resources</Text>
                    <Text className="text-teal-400 font-bold uppercase tracking-widest text-xs">Kochi, Kerala & Beyond</Text>
                </View>
                <TouchableOpacity
                    onPress={onBack}
                    className="px-5 py-2 bg-white/10 rounded-full border border-white/20"
                >
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">← Back</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ flexDirection: 'row', gap: 16 }}>

                {/* Col 1: Immediate Support */}
                <View className="flex-1 min-w-[300px]">
                    <Text className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Immediate Support</Text>
                    <View className="gap-3">
                        {REAL_RESOURCES.helplines.map((item, i) => (
                            <View key={i} className="p-4 bg-white/5 border border-white/10 rounded-2xl">
                                <View className="flex-row justify-between items-center mb-1">
                                    <Text className="text-base font-bold text-white flex-1 mr-2">{item.name}</Text>
                                    <View className="bg-teal-500/20 px-2 py-1 rounded-full">
                                        <Text className="text-[7px] font-black text-teal-400 uppercase">{item.hours}</Text>
                                    </View>
                                </View>
                                <Text className="text-slate-400 text-xs mb-2 leading-tight">{item.desc}</Text>
                                <View className="flex-row items-center gap-2">
                                    <View className="p-1 bg-teal-500 rounded-md">
                                        <Text className="text-white text-[10px]">📞</Text>
                                    </View>
                                    <Text className="text-sm font-black text-teal-500">{item.phone}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Col 2: Hospital Care */}
                <View className="flex-1 min-w-[250px]">
                    <Text className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Professional Care (Kochi)</Text>
                    <View className="gap-2">
                        {REAL_RESOURCES.hospitals.map((hosp, i) => (
                            <View key={i} className="p-3 bg-white/5 border border-white/10 rounded-xl">
                                <Text className="font-bold text-white text-sm mb-1">{hosp.name}</Text>
                                <Text className="text-[9px] text-slate-500 font-medium mb-1">{hosp.location} • {hosp.dept || hosp.type}</Text>
                                <Text className="text-xs font-black text-teal-500">{hosp.contact}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Col 3: Self Care */}
                <View className="flex-1 min-w-[250px]">
                    <Text className="text-xs font-black text-white/50 uppercase tracking-widest mb-2">Self-Care Toolkit</Text>
                    <View className="p-4 bg-teal-500/5 rounded-3xl border border-teal-500/20 gap-4">
                        {REAL_RESOURCES.selfcare.map((sc, i) => (
                            <View key={i} className="flex-row gap-2">
                                <View className="w-1.5 h-1.5 mt-1.5 bg-teal-400 rounded-full" />
                                <View className="flex-1">
                                    <Text className="font-bold text-teal-300 text-xs mb-0.5">{sc.title}</Text>
                                    <Text className="text-slate-300 text-[10px] leading-tight opacity-80">{sc.tip}</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </View>

            </ScrollView>

            <View className="mt-4 pt-4 border-t border-white/5 items-center">
                <Text className="text-slate-600 text-[9px] font-black uppercase tracking-[4px]">
                    You are never alone • Help is available 24/7
                </Text>
            </View>
        </View>
    );
};

export default ResourcesScreen;
