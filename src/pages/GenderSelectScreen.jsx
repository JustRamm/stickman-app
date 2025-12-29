import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Scenery from '../components/Scenery';
import ASSETS from '../utils/assetMap';

const GenderSelectScreen = ({ trust, playerGender, setPlayerGender, audioManager, onNext, onBack }) => {
    const GuyIcon = ASSETS['guy_idle'];
    const GirlIcon = ASSETS['girl_idle'];

    return (
        <View className="flex-1 bg-slate-50 justify-center items-center">
            {/* Back Button */}
            <TouchableOpacity
                style={{ position: 'absolute', top: 40, left: 24, zIndex: 50, width: 40, height: 40, backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 20, justifyContent: 'center', alignItems: 'center' }}
                onPress={onBack}
            >
                <Text className="text-xl font-bold text-slate-600">{'<'}</Text>
            </TouchableOpacity>

            <View style={StyleSheet.absoluteFill}>
                <Scenery trust={trust} />
            </View>

            <View className="z-20 w-[95%] max-w-xl bg-white/90 p-8 rounded-3xl shadow-2xl border border-white/50 items-center">
                <Text className="text-2xl font-black uppercase text-teal-800 mb-6">Character Voice</Text>

                <View className="flex-row gap-6 mb-8 w-full justify-center">
                    <TouchableOpacity
                        onPress={() => { setPlayerGender('guy'); audioManager.speak("Testing, testing. This is the guy voice.", false, 'guy'); }}
                        className={`flex-1 p-6 rounded-2xl border-2 items-center justify-center gap-3 h-40 ${playerGender === 'guy' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50'}`}
                    >
                        {GuyIcon && <GuyIcon width={60} height={60} />}
                        <Text className="font-bold uppercase text-xs tracking-widest text-slate-700">Guy Voice</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => { setPlayerGender('girl'); audioManager.speak("Testing, testing. This is the girl voice.", false, 'girl'); }}
                        className={`flex-1 p-6 rounded-2xl border-2 items-center justify-center gap-3 h-40 ${playerGender === 'girl' ? 'border-teal-600 bg-teal-50 shadow-lg scale-105' : 'border-slate-100 bg-white/50'}`}
                    >
                        {GirlIcon && <GirlIcon width={60} height={60} />}
                        <Text className="font-bold uppercase text-xs tracking-widest text-slate-700">Girl Voice</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        audioManager.stopSpeaking();
                        onNext();
                    }}
                    className="w-full py-4 bg-teal-600 rounded-xl items-center shadow-lg active:scale-95"
                >
                    <Text className="text-white font-bold uppercase tracking-widest text-xs">Confirm & Continue</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default GenderSelectScreen;
