import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

const DialogueBox = ({ node, onSelectOption, foundClues = [], requiredResource = null, requiredResourceName = null, selectedResource = null, isWalletOpen = false }) => {
    const options = node?.options || [];

    // Filter and Shuffle options based on found clues
    const visibleOptions = React.useMemo(() => {
        if (!options || options.length === 0) return [];
        const filtered = options.filter(option =>
            !option.required_clue || foundClues.includes(option.required_clue)
        );
        // Fisher-Yates Shuffle
        for (let i = filtered.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
        }
        return filtered;
    }, [options, foundClues]);

    if (!options || options.length === 0 || (visibleOptions.length === 0 && !requiredResource)) return null;

    const isCorrectResource = selectedResource === requiredResource;

    return (
        <View
            className={`absolute bottom-2 left-0 right-0 items-center z-50`}
            pointerEvents="box-none"
        >
            <View className={`w-[96%] max-w-2xl bg-white/90 rounded-3xl p-4 shadow-xl border ${requiredResource ? 'border-orange-400' : 'border-white/50'}`}>
                <View className="items-center mb-2">
                    {requiredResource ? (
                        <Text className="text-[10px] font-black uppercase text-orange-600 tracking-[3px]">
                            🔒 MISSION FINAL STEP: PROFESSIONAL REFERRAL
                        </Text>
                    ) : (
                        <Text className="text-[10px] font-black uppercase text-teal-600 tracking-[3px]">
                            Your Response {foundClues.length > 0 && <Text className="text-orange-500">(+ {foundClues.length} CLUES)</Text>}
                        </Text>
                    )}
                </View>

                <ScrollView className="max-h-64" showsVerticalScrollIndicator={true}>
                    <View className="gap-2 pb-2">
                        {requiredResource ? (
                            /* Unified Single Referral Button */
                            <TouchableOpacity
                                onPress={() => {
                                    if (isCorrectResource) {
                                        const successOption = options.find(o => o.next?.includes('success')) || options[0];
                                        onSelectOption(successOption);
                                    }
                                }}
                                disabled={!isCorrectResource}
                                className={`w-full p-4 rounded-2xl border-2 items-center space-y-2
                                    ${isCorrectResource
                                        ? 'bg-teal-500 border-teal-400 shadow-lg'
                                        : 'bg-slate-100 border-slate-200'}`}
                            >
                                <Text className="text-3xl">{isCorrectResource ? '✅' : '🛡️'}</Text>
                                <Text className={`text-sm font-black uppercase tracking-widest text-center ${isCorrectResource ? 'text-white' : 'text-slate-400'}`}>
                                    {isCorrectResource
                                        ? `Authorize Referral to ${requiredResourceName}`
                                        : `Select ${requiredResourceName} from Toolkit`}
                                </Text>

                                {!isCorrectResource && (
                                    <Text className="text-[9px] font-bold opacity-60 italic text-slate-500">
                                        (Open toolkit drawer on the right)
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ) : (
                            /* Standard Multiple Response Options */
                            visibleOptions.map((option, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => onSelectOption(option)}
                                    className={`w-full p-3 bg-white border border-slate-200 rounded-xl flex-row items-center gap-3 active:bg-teal-50 active:border-teal-400 ${option.required_clue ? 'border-teal-200 bg-teal-50/30' : ''}`}
                                >
                                    <Text className="text-[10px] font-black text-slate-300">
                                        {index + 1}
                                    </Text>
                                    <View className="flex-1">
                                        <Text className="text-sm font-bold text-slate-700 leading-tight">
                                            {option.required_clue && "🔍 "}
                                            {option.text}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                </ScrollView>
            </View>
        </View>
    );
};

export default DialogueBox;
