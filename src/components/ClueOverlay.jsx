import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { CLUE_DETAILS } from '../data/gameData';
import { LinearGradient } from 'expo-linear-gradient';

const ClueOverlay = ({ viewedClue, onClose }) => {
    if (!viewedClue) return null;

    const data = CLUE_DETAILS[viewedClue.id];
    const { visualType, title, description } = data;

    const renderClueContent = () => {
        switch (visualType) {
            case 'photo':
                return (
                    <View className="items-center">
                        <View className="bg-white p-4 pb-12 shadow-xl transform rotate-1 border-8 border-white w-80">
                            <View className="bg-slate-200 overflow-hidden mb-4 relative h-48 w-full">
                                {/* Stylized Photo Image */}
                                <LinearGradient colors={['rgba(99,102,241,0.2)', 'rgba(245,158,11,0.2)']} style={StyleSheet.absoluteFill} />
                                <View className="absolute bottom-4 left-1/2 -ml-10 flex-row items-end gap-2">
                                    <View className="w-12 h-20 bg-slate-400/40 rounded-t-full" />
                                    <View className="w-8 h-12 bg-slate-400/30 rounded-t-full" />
                                    <View className="w-8 h-12 bg-slate-400/30 rounded-t-full" />
                                </View>
                            </View>
                            <Text className="text-slate-700 text-lg text-center italic rotate-[-1deg] font-bold">
                                "We love you Mom!"
                            </Text>
                        </View>
                        <View className="mt-8 bg-slate-900/80 p-4 rounded-xl max-w-sm border border-white/10">
                            <Text className="text-sm italic font-medium text-white/90 text-center">{description}</Text>
                        </View>
                    </View>
                );

            case 'official_letter':
                return (
                    <View className="bg-white w-80 shadow-2xl p-8 border-t-[12px] border-slate-900">
                        <View className="flex-row justify-between items-start mb-8 border-b border-slate-100 pb-4">
                            <View>
                                <Text className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Human Resources</Text>
                                <View className="w-16 h-4 bg-slate-100 mt-1" />
                            </View>
                        </View>
                        <Text className="text-xl font-black text-slate-900 mb-6 uppercase">Termination Notice</Text>
                        <Text className="text-slate-700 text-sm leading-6 mb-12">
                            {description}
                        </Text>
                        <View className="flex-row justify-between items-end border-t border-slate-100 pt-8 opacity-40">
                            <View className="w-24 h-8 bg-slate-100" />
                        </View>
                        <View className="absolute top-24 right-8 w-24 h-24 border-4 border-red-500/20 rounded-full items-center justify-center transform -rotate-12">
                            <Text className="text-[10px] text-red-500/20 font-black uppercase text-center">VOID{'\n'}REF: 88-V</Text>
                        </View>
                    </View>
                );

            case 'grade_report':
                return (
                    <View className="bg-sky-50 w-80 shadow-2xl p-6 border-4 border-sky-200">
                        <View className="bg-indigo-900 -mx-6 -mt-6 p-4 mb-8 flex-row justify-between items-center">
                            <Text className="text-[10px] font-black uppercase tracking-widest text-white">University Registrar</Text>
                            <Text className="text-[10px] font-black uppercase tracking-widest text-white">Spring 2025</Text>
                        </View>
                        <View className="border-b-2 border-slate-200 pb-2 mb-6">
                            <Text className="text-xl font-black text-slate-800">Academic Probation</Text>
                        </View>
                        <View className="bg-white p-4 rounded-lg border border-sky-100 mb-8">
                            <Text className="text-slate-700 text-sm italic leading-relaxed">"{description}"</Text>
                            <View className="mt-6 flex-row items-center gap-4">
                                <View className="w-12 h-12 bg-red-100 rounded-full items-center justify-center border-4 border-red-200">
                                    <Text className="text-red-600 text-2xl font-black">F</Text>
                                </View>
                                <Text className="text-slate-400 text-[10px] font-bold uppercase">GPA: 1.2</Text>
                            </View>
                        </View>
                    </View>
                );

            case 'envelope':
                return (
                    <View className="bg-[#fefce8] w-80 shadow-2xl p-6 border border-amber-200 rounded-lg overflow-hidden">
                        <View className="flex-row justify-between items-start mb-10">
                            <View className="w-20 h-12 border-2 border-amber-900/20 items-center justify-center opacity-30">
                                <Text className="text-[8px] font-black text-amber-900/50 uppercase">POSTAGE PAID</Text>
                            </View>
                            <View className="bg-red-600 px-3 py-1 rounded-sm shadow-sm">
                                <Text className="text-white text-[10px] font-black uppercase tracking-widest">Final Notice</Text>
                            </View>
                        </View>

                        <View className="gap-2 mb-10 opacity-10">
                            <View className="w-32 h-3 bg-amber-900 rounded-full" />
                            <View className="w-48 h-3 bg-amber-900 rounded-full" />
                        </View>

                        <View className="bg-white/60 p-4 rounded-sm border border-red-200">
                            <Text className="text-red-900 text-sm font-bold leading-6 decoration-red-900 underline">
                                {description}
                            </Text>
                        </View>
                    </View>
                );

            case 'tutorial':
            default:
                return (
                    <View className="bg-teal-600 w-80 shadow-2xl p-8 rounded-3xl border-4 border-white/20 relative mt-4">
                        <View className="absolute -top-6 -left-6 w-16 h-16 bg-white rounded-full items-center justify-center border-4 border-teal-500 shadow-xl z-20">
                            <Text className="text-3xl text-teal-600">🔍</Text>
                        </View>
                        <Text className="text-2xl font-black uppercase tracking-widest mb-4 text-white">{title}</Text>
                        <Text className="text-teal-50 text-base font-medium leading-relaxed">
                            {description}
                        </Text>
                        <View className="mt-8 pt-6 border-t border-white/20">
                            <Text className="text-[10px] font-black uppercase tracking-[2px] opacity-60 text-white">Objective: Gather Context</Text>
                        </View>
                    </View>
                );
        }
    };

    return (
        <Modal transparent visible={!!viewedClue} animationType="fade">
            <View className="flex-1 bg-black/80 justify-center items-center p-4">
                <TouchableOpacity activeOpacity={1} style={StyleSheet.absoluteFill} onPress={onClose} />

                <View pointerEvents="box-none" className="items-center w-full">
                    {renderClueContent()}

                    <TouchableOpacity
                        onPress={onClose}
                        className="w-full max-w-sm mt-8 py-5 bg-white rounded-2xl shadow-2xl items-center flex-row justify-center gap-3 active:scale-95"
                    >
                        <Text className="text-xl">✅</Text>
                        <Text className="font-black uppercase tracking-[3px] text-xs text-slate-900">Add to Case File</Text>
                    </TouchableOpacity>

                    <Text className="text-center text-white/40 text-[9px] font-black uppercase tracking-widest mt-4">Tap background to discard</Text>
                </View>
            </View>
        </Modal>
    );
};

export default ClueOverlay;
