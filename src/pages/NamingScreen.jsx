import React from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import Scenery from '../components/Scenery';

const NamingScreen = ({ trust, playerName, setPlayerName, onNext, onNavigate }) => {
    return (
        <View className="flex-1 bg-slate-50 justify-center items-center">
            {/* Back Button */}
            <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 24, zIndex: 50, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => onNavigate('START')}
            >
                <Text className="text-xl font-bold text-slate-600">{'<'}</Text>
            </TouchableOpacity>

            <View style={StyleSheet.absoluteFill}>
                <Scenery trust={trust} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="z-20 w-[95%] max-w-lg">
                <View className="bg-white/90 p-6 md:p-10 rounded-3xl shadow-xl border border-white/50 items-center">
                    <View className="mb-6 w-16 h-16 bg-teal-100 rounded-full items-center justify-center">
                        <Text className="text-3xl">👤</Text>
                    </View>
                    <Text className="text-2xl font-black uppercase text-teal-800 mb-1">Identify Yourself</Text>
                    <Text className="text-slate-500 text-sm mb-6 font-medium italic">What is your Name, Gatekeeper?</Text>

                    <TextInput
                        placeholder="Enter your name..."
                        placeholderTextColor="#94a3b8"
                        className="w-full px-4 py-3 bg-slate-100 border-2 border-slate-200 rounded-xl mb-2 text-center text-lg font-bold text-slate-800"
                        value={playerName === 'You' ? '' : playerName}
                        onChangeText={setPlayerName}
                        maxLength={15}
                        onSubmitEditing={() => playerName.trim().length >= 4 && onNext()}
                    />

                    <View className="h-4 mb-6">
                        {playerName && playerName.trim().length > 0 && playerName.trim().length < 4 && (
                            <Text className="text-xs font-bold text-red-500">
                                Name must be at least 4 characters
                            </Text>
                        )}
                    </View>

                    <TouchableOpacity
                        disabled={playerName.trim().length < 4}
                        onPress={onNext}
                        className={`w-full py-4 rounded-xl items-center shadow-lg ${playerName.trim().length < 4 ? 'bg-slate-300' : 'bg-teal-600'}`}
                    >
                        <Text className="text-white font-bold uppercase tracking-widest text-xs">Choose Gender</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default NamingScreen;
