import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, Switch, ScrollView, Alert, StyleSheet } from 'react-native';
import ASSETS from '../utils/assetMap';

const SettingsOverlay = ({
    settings,
    setSettings,
    audioManager,
    onResetGame,
    isSettingsOpen,
    setIsSettingsOpen,
    onNavigate
}) => {

    const toggleSettings = () => {
        if (!isSettingsOpen) audioManager.init();
        setIsSettingsOpen(!isSettingsOpen);
    };

    return (
        <>
            {/* Top Right Action Bar */}
            <View className="absolute top-4 right-4 z-[400] flex-row items-center gap-3" pointerEvents="box-none">

                {/* Minimal Training Icons Row */}
                <View className="flex-row gap-2.5">
                    {['signal_scout', 'quiz_mode', 'resource_relay', 'words_of_hope'].map((mode, i) => {
                        let target = '';
                        switch (mode) {
                            case 'signal_scout': target = 'SIGNAL_SCOUT'; break;
                            case 'quiz_mode': target = 'QUIZ_MODE'; break;
                            case 'resource_relay': target = 'RESOURCE_RELAY'; break;
                            case 'words_of_hope': target = 'WORDS_OF_HOPE'; break;
                        }

                        return (
                            <TouchableOpacity
                                key={mode}
                                onPress={() => { onResetGame && onResetGame(); onNavigate(target); setIsSettingsOpen(false); }}
                                className="w-10 h-10 bg-white rounded-full items-center justify-center border border-white/50 shadow-sm"
                            >
                                {/* Placeholder Text/Icon if generic icon logic not robust yet */}
                                <View className="w-6 h-6 bg-slate-200 rounded-full" />
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Main Settings Button */}
                <TouchableOpacity
                    onPress={toggleSettings}
                    className="w-10 h-10 bg-white/90 rounded-full items-center justify-center shadow-xl border border-white/50"
                >
                    <Text>⚙️</Text>
                </TouchableOpacity>
            </View>

            {/* Enhanced Settings Modal */}
            <Modal transparent visible={isSettingsOpen} animationType="slide">
                <View className="flex-1 justify-center items-center bg-black/60">
                    <TouchableOpacity style={StyleSheet.absoluteFill} onPress={() => setIsSettingsOpen(false)} />

                    <View className="w-[90%] max-w-sm bg-white rounded-2xl shadow-2xl overflow-hidden">
                        {/* Compact Header */}
                        <View className="px-5 py-3 border-b border-slate-100 flex-row justify-between items-center bg-gray-50/50">
                            <Text className="text-lg font-black uppercase text-slate-800">Settings</Text>
                            <TouchableOpacity onPress={() => setIsSettingsOpen(false)} className="w-8 h-8 items-center justify-center bg-slate-100 rounded-full">
                                <Text className="font-bold text-slate-500">X</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="p-4 max-h-[60vh]">
                            {/* Section: Audio & Narration */}
                            <View className="mb-4">
                                <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Audio & Narration</Text>

                                <View className="flex-row gap-3">
                                    {/* Volume */}
                                    <View className="flex-1 bg-white border border-slate-100 p-3 rounded-lg">
                                        <View className="flex-row justify-between mb-2">
                                            <Text className="text-[9px] font-bold uppercase text-slate-600">Volume</Text>
                                            <Text className="text-[9px] font-bold text-teal-600">{Math.round(settings.audioVolume * 100)}%</Text>
                                        </View>
                                        <View className="flex-row gap-2">
                                            <TouchableOpacity className="flex-1 bg-slate-100 items-center py-1 rounded" onPress={() => setSettings(s => ({ ...s, audioVolume: Math.max(0, s.audioVolume - 0.1) }))}>
                                                <Text>-</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity className="flex-1 bg-slate-100 items-center py-1 rounded" onPress={() => setSettings(s => ({ ...s, audioVolume: Math.min(1, s.audioVolume + 0.1) }))}>
                                                <Text>+</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {/* TTS Toggle */}
                                    <View className="w-28 p-3 bg-white border border-slate-100 rounded-lg justify-between">
                                        <Text className="text-[9px] font-bold uppercase text-slate-600">Narrator</Text>
                                        <Switch
                                            value={settings.ttsEnabled}
                                            onValueChange={(v) => setSettings(s => ({ ...s, ttsEnabled: v }))}
                                            trackColor={{ false: '#e2e8f0', true: '#14b8a6' }}
                                            thumbColor={'#ffffff'}
                                            style={{ transform: [{ scale: 0.8 }] }}
                                        />
                                    </View>
                                </View>
                            </View>

                            {/* Section: Gameplay Flow */}
                            <View className="mb-4">
                                <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">Text Speed</Text>
                                <View className="p-3 bg-white border border-slate-100 rounded-lg">
                                    <View className="flex-row justify-between mb-2">
                                        <Text className="text-[9px] font-bold uppercase text-slate-600">Speed</Text>
                                        <Text className="text-[8px] font-bold text-indigo-600">{settings.textSpeed === 0 ? 'Instant' : settings.textSpeed > 75 ? 'Relaxed' : 'Normal'}</Text>
                                    </View>
                                    <View className="flex-row gap-2">
                                        <TouchableOpacity className="flex-1 bg-slate-100 items-center py-1 rounded" onPress={() => setSettings(s => ({ ...s, textSpeed: Math.min(100, s.textSpeed + 10) }))}>
                                            <Text>Slower</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity className="flex-1 bg-slate-100 items-center py-1 rounded" onPress={() => setSettings(s => ({ ...s, textSpeed: Math.max(0, s.textSpeed - 10) }))}>
                                            <Text>Faster</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            {/* Section: System */}
                            <View className="mb-4">
                                <Text className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 mb-2">System</Text>
                                <View className="flex-row gap-3">
                                    {/* Dev Mode */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (settings.devMode) {
                                                setSettings(s => ({ ...s, devMode: false }));
                                            } else {
                                                // Alert.prompt only works on iOS easily. Using simple logic for now.
                                                setSettings(s => ({ ...s, devMode: true }));
                                                Alert.alert("Dev Mode Enabled", "This is a placeholder for password entry.");
                                            }
                                        }}
                                        className={`flex-1 p-3 rounded-lg border ${settings.devMode ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50 border-slate-100'}`}
                                    >
                                        <Text className={`text-[9px] font-bold uppercase ${settings.devMode ? 'text-indigo-700' : 'text-slate-500'}`}>Dev Mode</Text>
                                        <Text className="text-[7px] text-slate-400 mt-1">Unlock Scenarios</Text>
                                    </TouchableOpacity>

                                    {/* Reset */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            Alert.alert("Reset Game", "Are you sure?", [
                                                { text: "Cancel", style: "cancel" },
                                                { text: "Reset", style: "destructive", onPress: () => { onResetGame && onResetGame(); setIsSettingsOpen(false); } }
                                            ]);
                                        }}
                                        className="flex-1 p-3 bg-red-50 border border-red-100 rounded-lg items-center justify-center"
                                    >
                                        <Text className="text-red-500 text-[9px] font-black uppercase">Reset Progress</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </ScrollView>

                        {/* Footer */}
                        <View className="p-3 bg-slate-50 border-t border-slate-100">
                            <TouchableOpacity
                                onPress={() => setIsSettingsOpen(false)}
                                className="w-full py-3 bg-teal-600 rounded-lg items-center"
                            >
                                <Text className="text-white font-black uppercase text-[10px] tracking-widest">Apply Changes</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </>
    );
};

export default SettingsOverlay;
