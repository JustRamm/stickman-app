import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, Dimensions, StyleSheet } from 'react-native';
import { LucideClipboardList, LucideSiren, LucideShield, LucideHandshake } from 'lucide-react-native';

const ResourceWallet = ({ isOpen, resources, onSelectResource, selectedResource }) => {
    const slideAnim = React.useRef(new Animated.Value(Dimensions.get('window').width)).current;

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isOpen ? 0 : Dimensions.get('window').width,
            duration: 300,
            useNativeDriver: true,
        }).start();
    }, [isOpen]);

    return (
        <Animated.View
            style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                width: 320,
                backgroundColor: '#f8fafc', // slate-50
                shadowColor: "#000",
                shadowOffset: { width: -5, height: 0 },
                shadowOpacity: 0.1,
                shadowRadius: 10,
                elevation: 10,
                transform: [{ translateX: slideAnim }],
                zIndex: 100
            }}
        >
            {/* Header */}
            <View className="bg-slate-50 border-b border-slate-200 p-6 z-10">
                <View className="flex-row items-center justify-between mb-2">
                    <View className="flex-row items-center gap-2">
                        <LucideClipboardList size={20} color="#0d9488" />
                        <Text className="text-sm font-black uppercase text-slate-800 tracking-[2px]">Resource Toolkit</Text>
                    </View>
                    <View className="px-2 py-1 bg-teal-100 rounded">
                        <Text className="text-teal-800 text-[10px] font-bold uppercase">{resources?.length || 0} Available</Text>
                    </View>
                </View>
                <Text className="text-[10px] text-slate-500 font-medium">Select a resource to refer the person in crisis.</Text>
            </View>

            {/* Scrollable List */}
            <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
                <View className="gap-3 pb-10">
                    {(resources || []).map((resource) => {
                        let Icon = LucideClipboardList;
                        let badge = null;

                        if (resource.name.includes('Crisis') || resource.name.includes('988') || resource.name.includes('911')) {
                            Icon = LucideSiren;
                            badge = 'Emergency';
                        }
                        else if (resource.name.includes('Therapist') || resource.name.includes('Counselor')) Icon = LucideShield;
                        else if (resource.name.includes('Support')) Icon = LucideHandshake;

                        const isSelected = selectedResource === resource.id;

                        return (
                            <TouchableOpacity
                                key={resource.id}
                                onPress={() => onSelectResource(resource.id)}
                                activeOpacity={0.8}
                                className={`relative p-4 rounded-xl border-2 flex-row items-start gap-4 transition-all
                                    ${isSelected
                                        ? 'bg-white border-teal-500'
                                        : 'bg-white border-slate-100'}`}
                            >
                                <View className={`w-12 h-12 rounded-xl items-center justify-center shrink-0
                                    ${isSelected ? 'bg-teal-100' : 'bg-slate-100'}`}>
                                    <Icon size={24} color={isSelected ? '#0f766e' : '#64748b'} />
                                </View>

                                <View className="flex-1">
                                    <View className="flex-row justify-between items-start">
                                        <Text className={`text-sm font-black uppercase pr-2 flex-1 ${isSelected ? 'text-teal-900' : 'text-slate-800'}`}>
                                            {resource.name}
                                        </Text>
                                        {badge && (
                                            <View className="px-1.5 py-0.5 bg-red-100 rounded">
                                                <Text className="text-red-600 text-[9px] font-bold uppercase">{badge}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <Text className={`text-xs mt-1 font-medium ${isSelected ? 'text-teal-700' : 'text-slate-400'}`}>
                                        {resource.description}
                                    </Text>
                                </View>

                                {isSelected && (
                                    <View className="absolute top-0 bottom-0 right-0 w-1.5 bg-teal-500 rounded-r-xl" />
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Footer */}
            <View className="p-4 border-t border-slate-200 bg-white">
                <View className="bg-slate-50 border border-slate-100 rounded-lg p-3 items-center">
                    <Text className="text-[10px] text-slate-400 font-bold italic">"Connecting causes action."</Text>
                </View>
            </View>
        </Animated.View>
    );
};

export default ResourceWallet;
