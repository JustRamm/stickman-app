import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import Scenery from '../components/Scenery';

const HandoffScreen = ({
    selectedLevel,
    trust,
    audioManager,
    setGameState,
    setResolutionPhase
}) => {
    const [dialedNumber, setDialedNumber] = useState([]);

    return (
        <View className="flex-1 bg-slate-900 justify-center items-center">
            {/* Persistent Branding & Controls */}
            <View className="absolute top-4 left-4 z-50 flex-col gap-2" pointerEvents="box-none">
                <View className="w-12 h-12 bg-slate-900 rounded-full border-2 border-white items-center justify-center shadow-xl">
                    <Text className="text-white font-black text-xs">ME</Text>
                </View>

                <TouchableOpacity
                    onPress={() => {
                        Alert.alert("Exit Mission", "Abandon current mission and return to menu?", [
                            { text: "Cancel", style: "cancel" },
                            {
                                text: "Exit", style: "destructive", onPress: () => {
                                    audioManager.stopMusic();
                                    setGameState('LEVEL_SELECT');
                                }
                            }
                        ]);
                    }}
                    className="px-4 py-2 bg-slate-900 border-2 border-white rounded-full items-center shadow-2xl"
                >
                    <Text className="text-white text-[10px] font-black uppercase tracking-widest">Exit</Text>
                </TouchableOpacity>
            </View>

            {/* Blurred Background */}
            <View style={StyleSheet.absoluteFill} className="opacity-20 scale-110">
                <Scenery theme={selectedLevel.theme} trust={trust} />
            </View>

            {/* Phone Container */}
            <View className="z-20 w-[90%] max-w-[320px] bg-black rounded-[3rem] border-[8px] border-slate-800 shadow-2xl overflow-hidden h-[80vh] flex-col">
                {/* Phone Top Bar */}
                <View className="bg-slate-900 p-4 flex-row justify-between items-center px-6 pt-5">
                    <Text className="text-white text-xs font-bold">9:41</Text>
                    <View className="flex-row gap-1">
                        <View className="w-3.5 h-2.5 bg-white rounded-sm" />
                        <View className="w-2.5 h-2.5 bg-white rounded-full" />
                    </View>
                </View>

                {/* Status Bar Mockup inside screen */}
                <View className="flex-1 bg-white items-center pt-8 pb-8 px-4 relative">
                    <View className="absolute top-3 right-6 flex-row gap-1.5 opacity-50">
                        <View className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                        <View className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                        <View className="w-[3px] h-2.5 bg-black rounded-[1px]" />
                    </View>

                    <View className="items-center mt-2 mb-auto w-full">
                        <View className="w-16 h-16 bg-slate-100 rounded-full items-center justify-center mb-2 shadow-inner">
                            <Text className="text-3xl">🆘</Text>
                        </View>
                        <Text className="text-lg font-bold text-slate-800">Emergency SOS</Text>

                        {/* Input Display */}
                        <View className="mt-4 mb-4 h-12 w-full items-center justify-center border-b-2 border-slate-100">
                            <Text className="text-3xl font-light tracking-widest text-slate-900">
                                {dialedNumber.length > 0 ? dialedNumber.join('') : '...'}
                            </Text>
                        </View>

                        <View className="bg-red-50 px-4 py-1.5 rounded-lg mb-4">
                            <Text className="text-red-600 text-[10px] font-bold uppercase tracking-wider">Helpline: 14416 / 112</Text>
                        </View>
                    </View>

                    {/* Keypad */}
                    <View className="flex-wrap flex-row justify-center gap-4 w-full max-w-[260px] mb-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                            <TouchableOpacity
                                key={num}
                                onPress={() => {
                                    if (dialedNumber.length < 10) {
                                        setDialedNumber([...dialedNumber, num]);
                                        audioManager.playDing();
                                    }
                                }}
                                className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center active:bg-slate-200"
                            >
                                <Text className="text-2xl font-medium text-slate-800">{num}</Text>
                            </TouchableOpacity>
                        ))}
                        <View className="w-16 h-16" />
                        <TouchableOpacity
                            onPress={() => {
                                if (dialedNumber.length < 10) {
                                    setDialedNumber([...dialedNumber, 0]);
                                    audioManager.playDing();
                                }
                            }}
                            className="w-16 h-16 rounded-full bg-slate-50 items-center justify-center active:bg-slate-200"
                        >
                            <Text className="text-2xl font-medium text-slate-800">0</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setDialedNumber(prev => prev.slice(0, -1))}
                            className="w-16 h-16 rounded-full items-center justify-center"
                        >
                            <Text className="text-xl text-slate-400 font-bold">⌫</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Call Button */}
                    <TouchableOpacity
                        onPress={() => {
                            const number = dialedNumber.join('');
                            if (number === '14416' || number === '112' || number === '988') {
                                audioManager.playPop();
                                setGameState('RESOLUTION');
                                setResolutionPhase(0);
                            } else {
                                audioManager.playSad();
                                Alert.alert("Call Failed", "Incorrect Number. Try the Mental Health Helpline: 14416");
                                setDialedNumber([]);
                            }
                        }}
                        className="w-20 h-20 rounded-full bg-green-500 items-center justify-center shadow-lg active:scale-95 border-4 border-green-100 mb-4"
                    >
                        <Text className="text-3xl text-white">📞</Text>
                    </TouchableOpacity>

                    {/* Emergency Override */}
                    <TouchableOpacity
                        onPress={() => {
                            setDialedNumber([1, 4, 4, 1, 6]);
                        }}
                    >
                        <Text className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Emergency Auto-Dial</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

export default HandoffScreen;
