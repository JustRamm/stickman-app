import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Scenery from '../components/Scenery';
import SettingsOverlay from '../components/SettingsOverlay';
import { MISSIONS } from '../data/missions';
import ASSETS from '../utils/assetMap';

const LevelSelectScreen = ({
    completedLevels = [],
    selectedLevel,
    onSelectLevel,
    onLaunchMission,
    onNavigate,
    trust,
    settings,
    setSettings,
    audioManager,
    isSettingsOpen,
    setIsSettingsOpen
}) => {

    // Check if mission locked
    const isMissionLocked = (missionId) => {
        if (settings?.devMode) return false;
        const missionIndex = MISSIONS.findIndex(m => m.id === missionId);
        if (missionIndex === 0) return false;
        if (missionIndex === -1) return true;
        const previousMission = MISSIONS[missionIndex - 1];
        return !completedLevels.includes(previousMission.id);
    };

    return (
        <View className="flex-1 bg-slate-50">
            {/* Settings Overlay */}
            <SettingsOverlay
                settings={settings} setSettings={setSettings}
                audioManager={audioManager}
                isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onNavigate={onNavigate}
            />

            {/* Back to Title */}
            <TouchableOpacity
                onPress={() => onNavigate('START')}
                className="absolute top-6 left-6 z-50 px-4 py-2 bg-white/50 rounded-full items-center justify-center shadow-sm"
            >
                <Text className="text-xs font-bold uppercase tracking-widest text-slate-600">← Exit to Title</Text>
            </TouchableOpacity>

            <View style={StyleSheet.absoluteFill}>
                <Scenery theme={selectedLevel.theme} trust={trust} />
            </View>

            <View className="flex-1 justify-center">
                {/* Header */}
                <View className="z-20 items-center mb-6 px-4">
                    <Text className="text-3xl font-black uppercase text-white shadow-lg mb-1 tracking-tight text-center">
                        Select Your Mission
                    </Text>
                    <Text className="text-white/80 font-bold text-xs shadow-md text-center">
                        Choose a scenario to practice your QPR skills
                    </Text>
                </View>

                {/* Scrollable Container */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24, alignItems: 'center' }}
                    className="z-20 max-h-[60vh]"
                >
                    {(MISSIONS || []).map((mission) => {
                        const isLocked = isMissionLocked(mission.id);
                        const isCompleted = completedLevels.includes(mission.id);
                        const isSelected = selectedLevel.id === mission.id;
                        const NpcIcon = ASSETS[mission.npc.name.toLowerCase()];

                        return (
                            <TouchableOpacity
                                key={mission.id}
                                disabled={isLocked}
                                onPress={() => {
                                    onSelectLevel(mission);
                                    if (!isLocked) onLaunchMission(mission);
                                }}
                                activeOpacity={0.9}
                                className={`
                                    w-72 h-80 mx-3 p-6 
                                    bg-white rounded-3xl border-2
                                    justify-between
                                    ${isLocked
                                        ? 'opacity-60 border-slate-200 bg-slate-100'
                                        : isSelected
                                            ? 'border-teal-500 shadow-2xl bg-white scale-105'
                                            : 'border-white/40 opacity-90 scale-100'
                                    }
                                `}
                            >
                                {/* Lock Overlay */}
                                {isLocked && (
                                    <View className="absolute inset-0 z-30 justify-center items-center bg-slate-900/10 rounded-3xl">
                                        <View className="w-12 h-12 bg-white rounded-full items-center justify-center shadow-lg mb-2">
                                            <Text className="text-slate-400">🔒</Text>
                                        </View>
                                        <View className="bg-white/80 px-3 py-1 rounded-full">
                                            <Text className="text-[10px] font-black uppercase tracking-widest text-slate-600">Locked</Text>
                                        </View>
                                    </View>
                                )}

                                <View className="z-10">
                                    <View className="flex-row justify-between items-start mb-4">
                                        <View className={`px-3 py-1 rounded-full border ${mission.difficulty === 'Easy' ? 'bg-green-100 border-green-200' : mission.difficulty === 'Medium' ? 'bg-orange-100 border-orange-200' : 'bg-red-100 border-red-200'}`}>
                                            <Text className={`text-[10px] font-black uppercase tracking-widest ${mission.difficulty === 'Easy' ? 'text-green-700' : mission.difficulty === 'Medium' ? 'text-orange-700' : 'text-red-700'}`}>
                                                {mission.difficulty}
                                            </Text>
                                        </View>

                                        {!isLocked && (
                                            <View className={`w-6 h-6 rounded-full border-2 items-center justify-center ${isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'}`}>
                                                {isSelected && <Text className="text-white text-[10px] font-bold">✓</Text>}
                                            </View>
                                        )}
                                    </View>

                                    <Text className="text-xl font-black text-slate-800 mb-2 leading-tight">
                                        {mission.name}
                                    </Text>
                                    <Text className="text-xs text-slate-600 leading-snug font-medium" numberOfLines={3}>
                                        {mission.desc}
                                    </Text>
                                </View>

                                {/* NPC Icon */}
                                {!isLocked && NpcIcon && (
                                    <View className="absolute bottom-12 right-4 opacity-20" pointerEvents="none">
                                        <NpcIcon width={60} height={80} fill="#000" />
                                    </View>
                                )}

                                <View className={`pt-4 mt-auto border-t border-slate-200 flex-row items-center justify-between ${isLocked ? 'opacity-50' : ''}`}>
                                    <Text className="text-[9px] font-black uppercase tracking-[2px] text-slate-400">
                                        {isLocked ? 'Mission Locked' : isCompleted ? 'Replay Simulation' : 'Start Simulation'}
                                    </Text>
                                    <Text className="text-lg text-slate-400">{isLocked ? '🔒' : '➔'}</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            </View>
        </View>
    );
};

export default LevelSelectScreen;
