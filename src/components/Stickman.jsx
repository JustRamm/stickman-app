import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withTiming, withSequence, useSharedValue, withSpring } from 'react-native-reanimated';
import ASSETS from '../utils/assetMap';

const Stickman = ({
    emotion,
    speaker,
    position = { x: 50, y: 70 },
    isWalking = false,
    isJumping = false,
    isCrouching = false,
    isSitting = false,
    isPhoneChecking = false,
    currentMessage = null,
    textEffect = null,
    gender = 'guy',
    moveDir = 0,
    theme = 'park',
    trust = 50,
    action = 'idle',
    textSpeed = 50,
    scale = 1,
    noWrapper = false
}) => {
    const isNPC = ['Alex', 'Grace', 'David', 'Jessica', 'Raj', 'Stranger'].includes(speaker);
    const isIdle = !isWalking && !isJumping && !isCrouching && !isSitting && !isPhoneChecking && (action === 'idle' || action === 'phone' || action === 'sitting');
    const isLowTrust = trust < 30;
    const [displayedText, setDisplayedText] = React.useState('');

    // Typewriter effect
    React.useEffect(() => {
        if (!currentMessage) {
            setDisplayedText('');
            return;
        }

        if (textSpeed === 0) {
            setDisplayedText(currentMessage);
            return;
        }

        let i = 0;
        setDisplayedText('');
        const timer = setInterval(() => {
            setDisplayedText(currentMessage.substring(0, i + 1));
            i++;
            if (i >= currentMessage.length) clearInterval(timer);
        }, textSpeed);

        return () => clearInterval(timer);
    }, [currentMessage, textSpeed]);

    // Determine which Asset key to use
    const getAssetKey = () => {
        if (isNPC) return speaker.toLowerCase();

        const g = gender;
        if (isJumping) return `${g}_jump`;
        if (isCrouching) return `${g}_crouch`;
        if (isSitting) return `${g}_crouch`;
        if (isWalking) {
            if (moveDir === -1) return `${g}_walk_left`; // Assuming assets exist
            return `${g}_walk_right`;
        }
        if (emotion === 'distressed' || emotion === 'sad') return `${g}_distressed`;
        return `${g}_idle`;
    };

    const assetKey = getAssetKey();
    const SvgComponent = ASSETS[assetKey] || ASSETS[`${gender}_idle`] || ASSETS['guy_idle'];

    // Visual styles for different states (using Reanimated if we want advanced animations, but simple styles for now)

    // Determine if we should use light or dark theme for the stickman silhouette
    const isDarkTheme = ['office', 'rainy_street', 'bridge_night'].includes(theme) ||
        (theme === 'park' && isLowTrust);

    // Filter simulation using tintColor or style opacity/color overlay is tricky in RN SVG without direct prop.
    // However, react-native-svg components accept `fill` props if the SVG uses currentColor.
    // If SVGs are fixed colors, we might need an overlay. For silhouettes (black stickmen), `fill="white"` or "black" works.
    const fill = isDarkTheme ? "white" : "black";

    return (
        <View
            className={`${noWrapper ? 'relative' : 'absolute'} transition-all`}
            style={{
                left: noWrapper ? undefined : `${position.x}%`,
                top: noWrapper ? undefined : `${position.y}%`,
                zIndex: isJumping ? 100 : 20,
                transform: [{ scale: scale }],
            }}
        >
            {/* Distress Visual Cues (Pulse) - Simplified as View circle */}
            {(emotion === 'sad' || emotion === 'distressed' || emotion === 'vulnerable') && isIdle && !isJumping && (
                <View className={`absolute top-1/2 left-1/2 -ml-24 -mt-24 w-48 h-48 rounded-full opacity-30 ${isDarkTheme ? 'bg-white' : 'bg-orange-400'}`} />
            )}

            {/* Dialogue Bubble */}
            {currentMessage && (
                <View
                    className={`absolute bottom-[160px] w-52 bg-white p-4 rounded-2xl border-2 border-slate-100 z-50
                    ${position.x < 50 ? 'left-0 rounded-bl-none' : 'right-0 rounded-br-none'}
                    `}
                >
                    <Text className={`text-sm font-bold text-slate-800 leading-snug ${textEffect === 'shake' ? 'text-orange-600' : ''}`}>
                        {displayedText}
                    </Text>
                    {/* Tail */}
                    <View className={`absolute -bottom-2 w-4 h-4 bg-white border-b border-r border-slate-100
                        ${position.x < 50 ? 'left-0 border-l border-t-0 border-b-2 border-r-0' : 'right-0 border-r-2 border-b-2'}
                        `}
                        style={{ transform: [{ rotate: '45deg' }] }}
                    />
                </View>
            )}

            {/* The Character Rendered as SVG Component */}
            <View className="w-[100px] h-[125px]">
                {SvgComponent && <SvgComponent width="100%" height="100%" fill={fill} />}
            </View>

            {!isJumping && !isCrouching && (
                <View className="items-center mt-2">
                    <Text className="text-[10px] font-black uppercase tracking-widest text-slate-400">{speaker}</Text>
                </View>
            )}
        </View>
    );
};

export default Stickman;
