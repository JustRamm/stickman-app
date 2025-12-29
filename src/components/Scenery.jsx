import React, { useMemo } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const Scenery = ({ theme = 'park', trust = 50 }) => {
    const isHighTrust = trust >= 70;
    const isLowTrust = trust < 30;
    const { width, height } = Dimensions.get('window');

    // Simulate brightness with an overlay since RN doesn't support CSS filters on Views
    const brightnessOverlayOpacity = isLowTrust ? 0.4 : 0;

    // Dynamic Sky Colors
    const skyTop = isHighTrust ? '#bfdbfe' : (isLowTrust ? '#1e293b' : '#e0f2fe'); // Blue sky vs Dark Grey
    const skyBottom = isHighTrust ? '#eff6ff' : (isLowTrust ? '#0f172a' : '#f0f9ff');

    // MEMOIZE BUILDINGS for rainy theme
    const buildings = useMemo(() => {
        return [...Array(10)].map(() => ({
            width: 5 + Math.random() * 10,
            height: 10 + Math.random() * 40,
            windows: [...Array(Math.floor(Math.random() * 6))].map(() => Math.random() > 0.7)
        }));
    }, []);

    const GodRays = () => (
        isHighTrust && (
            <View className="absolute inset-0 z-20 opacity-40">
                {/* Simplified God Rays using Gradient */}
                <LinearGradient
                    colors={['rgba(255,255,255,0)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0)']}
                    style={{ width: '200%', height: '200%', transform: [{ rotate: '45deg' }] }}
                />
            </View>
        )
    );

    const LowTrustVignette = () => (
        isLowTrust && (
            <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.8)']}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
            />
        )
    );

    if (theme === 'bridge_night') {
        return (
            <View className="absolute inset-0 bg-[#020617]">
                <LinearGradient
                    colors={['#082f49', '#020617']}
                    style={{ position: 'absolute', top: '60%', left: 0, right: 0, bottom: 0 }}
                />

                {/* Bridge Structure - Simplified */}
                <View className="absolute top-0 bottom-[40%] text-slate-800 border-b-4 border-slate-700 w-full" />

                {/* Deck */}
                <View className="absolute top-[60%] w-full h-4 bg-[#0f172a]" />

                {/* Rain (Static lines for now, animation needs Reanimated later) */}
                <View className="absolute inset-0 z-[100] overflow-hidden" pointerEvents="none">
                    {[...Array(20)].map((_, i) => (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 80}%`,
                                width: 1,
                                height: 40,
                                backgroundColor: 'rgba(200,230,255,0.3)'
                            }}
                        />
                    ))}
                </View>

                <LowTrustVignette />
                {brightnessOverlayOpacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: brightnessOverlayOpacity }]} pointerEvents="none" />}
            </View>
        );
    }

    if (theme === 'office') {
        return (
            <View className="absolute inset-0 bg-[#0f172a] border-b-[20%] border-slate-900">
                {/* Windows */}
                <View className="absolute top-10 w-full flex-row justify-between px-10 h-64">
                    {[1, 2].map(windowId => (
                        <View key={windowId} className="w-[45%] h-full bg-slate-950 border-4 border-slate-800 overflow-hidden">
                            <LinearGradient colors={['#020617', '#1e1b4b']} style={StyleSheet.absoluteFill} />
                        </View>
                    ))}
                </View>

                {/* Ceiling Lights */}
                <View className="absolute top-0 w-full flex-row justify-around px-20">
                    {[1, 2, 3].map(i => (
                        <View key={i} className={`w-32 h-1 bg-white/40 ${isLowTrust ? 'opacity-50' : 'opacity-80'}`} />
                    ))}
                </View>

                <LowTrustVignette />
                {brightnessOverlayOpacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: brightnessOverlayOpacity }]} pointerEvents="none" />}
            </View>
        );
    }

    if (theme === 'campus') {
        return (
            <LinearGradient
                colors={[isHighTrust ? '#bae6fd' : '#cbd5e1', isHighTrust ? '#e0f2fe' : '#f1f5f9']}
                style={StyleSheet.absoluteFill}
            >
                <View className="absolute bottom-[25%] w-full items-center">
                    {/* Campus Building simplified */}
                    <View className="w-64 h-48 bg-red-900 border-r-4 border-red-950" />
                    <View className="w-32 h-80 bg-red-950 absolute bottom-0" />
                </View>

                <View className="absolute bottom-0 w-full h-[30%] bg-green-900" />
                <GodRays />
                <LowTrustVignette />
                {brightnessOverlayOpacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: brightnessOverlayOpacity }]} pointerEvents="none" />}
            </LinearGradient>
        );
    }

    if (theme === 'rainy_street') {
        const skyColorTop = trust < 30 ? '#0f172a' : (trust > 70 ? '#64748b' : '#334155');
        const skyColorBottom = trust < 30 ? '#1e293b' : (trust > 70 ? '#94a3b8' : '#475569');

        return (
            <LinearGradient colors={[skyColorTop, skyColorBottom]} style={StyleSheet.absoluteFill}>
                <View className="absolute bottom-[25%] w-full flex-row items-end opacity-60">
                    {buildings.map((building, i) => (
                        <View
                            key={i}
                            className="bg-slate-800 mr-[2px]"
                            style={{ width: `${building.width}%`, height: `${building.height}%` }}
                        />
                    ))}
                </View>

                <View className="absolute bottom-0 w-full h-[30%] bg-slate-900" />

                {/* Rain */}
                <View className="absolute inset-0 z-[100] overflow-hidden" pointerEvents="none">
                    {[...Array(50)].map((_, i) => (
                        <View
                            key={i}
                            style={{
                                position: 'absolute',
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                width: 2,
                                height: 60,
                                backgroundColor: 'rgba(200,230,255,0.4)'
                            }}
                        />
                    ))}
                </View>

                <LowTrustVignette />
                {brightnessOverlayOpacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: brightnessOverlayOpacity }]} pointerEvents="none" />}
            </LinearGradient>
        );
    }

    // Default Park
    return (
        <LinearGradient colors={[skyTop, skyBottom]} style={StyleSheet.absoluteFill}>
            {/* Hills */}
            <View className="absolute bottom-[20%] w-full h-32 bg-emerald-700 opacity-60 rounded-t-[50px] scale-150" />

            {/* Trees */}
            <View className="absolute bottom-[25%] w-full flex-row justify-between px-20">
                {[1, 2, 3, 4].map(i => (
                    <View key={i} className="items-center">
                        <View className="w-3 h-32 bg-amber-900" />
                        <View className="absolute -top-10 w-24 h-24 bg-emerald-500 rounded-full" />
                    </View>
                ))}
            </View>

            <View className="absolute bottom-0 w-full h-[30%] bg-emerald-900" />
            <GodRays />
            <LowTrustVignette />
            {brightnessOverlayOpacity > 0 && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black', opacity: brightnessOverlayOpacity }]} pointerEvents="none" />}
        </LinearGradient>
    );
};

export default Scenery;
