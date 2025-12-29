import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Dimensions, Alert, Animated } from 'react-native';
import Scenery from '../components/Scenery';
import Stickman from '../components/Stickman';
import ASSETS from '../utils/assetMap';

const { width } = Dimensions.get('window');

const ResolutionScreen = ({
    resolutionPhase,
    setGameState,
    audioManager,
    playerGender,
    selectedLevel,
    playerName,
    playerPos,
    samPos
}) => {
    // Animation Values
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;

    // Helper Character Position (Medic)
    const medicParams = useRef(new Animated.Value(120)).current; // Start off screen (120%)

    useEffect(() => {
        // Phase 1: Medic enters
        if (resolutionPhase >= 1) {
            Animated.timing(medicParams, {
                toValue: width < 768 ? 60 : 70, // % position
                duration: 2000,
                useNativeDriver: false
            }).start();
        }

        // Phase 2: Zoom in
        if (resolutionPhase >= 2) {
            Animated.parallel([
                Animated.timing(scaleAnim, { toValue: 1.5, duration: 3000, useNativeDriver: true }),
                Animated.timing(translateYAnim, { toValue: 10, duration: 3000, useNativeDriver: true }) // 10% translation approx
            ]).start();
        }
    }, [resolutionPhase]);

    const GroupHug = ASSETS['group_hug'];

    return (
        <View className="flex-1 bg-slate-50 relative overflow-hidden">
            {/* Persistent Branding & Controls */}
            <View className="absolute top-4 left-4 z-50 flex-col gap-2 opacity-100" pointerEvents="box-none">
                {/* Placeholder for Logo */}
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

            {/* Camera/Zoom Container */}
            <Animated.View
                className="absolute inset-0 w-full h-full justify-center items-center"
                style={{
                    transform: [
                        { scale: scaleAnim },
                        { translateY: translateYAnim }
                    ]
                }}
            >
                <Scenery theme={selectedLevel.theme} trust={100} />

                {/* Helper Character (Medic/Pro) */}
                <Animated.View
                    className="absolute z-20 bottom-[25%]"
                    style={{
                        left: medicParams.interpolate({
                            inputRange: [0, 100],
                            outputRange: ['0%', '100%']
                        })
                    }}
                >
                    <Stickman gender="girl" emotion="happy" theme={selectedLevel.theme} />

                    {/* Speech Bubble */}
                    {resolutionPhase >= 3 && (
                        <View className="absolute -top-40 right-0 bg-white/90 border-2 border-teal-500 p-4 rounded-2xl w-48 shadow-2xl z-50">
                            <Text className="text-xs font-bold leading-relaxed text-slate-800">
                                {selectedLevel.id === 'tutorial'
                                    ? "Great job! You've mastered the basics. You're ready to help others now."
                                    : `"Thank you for being the bridge. We'll take care of ${selectedLevel.npc.name} now."`
                                }
                            </Text>
                        </View>
                    )}
                </Animated.View>

                {/* Main Characters */}
                <View className="absolute inset-0 z-10 w-full h-full">
                    {/* Note: Stickman components use absolute positioning inside them or we need to position them here. 
                    In App.jsx, Stickman takes a 'position' prop {x, y} which corresponds to %.
                    We should reuse that logic.
                */}
                    {resolutionPhase < 2 ? (
                        <>
                            <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} />
                            <Stickman speaker={selectedLevel.npc.name} position={samPos} gender={selectedLevel.npc.gender} emotion="relief" theme={selectedLevel.theme} />
                        </>
                    ) : (
                        <View className="absolute left-[45%] bottom-[25%] -ml-20 items-center">
                            {/* Hug Asset */}
                            {GroupHug && <GroupHug width={250} height={250} />}
                            <View className="absolute -top-10">
                                <Text className="text-6xl shadow-lg">❤️</Text>
                            </View>
                        </View>
                    )}
                </View>
            </Animated.View>
        </View>
    );
};

export default ResolutionScreen;
