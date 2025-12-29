import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

class SoundEngine {
    constructor() {
        this.sounds = {};
        this.initialized = false;
        this.ttsEnabled = true;
        this.currentTrack = null;
        this.currentSoundInstance = null;
    }

    async init() {
        if (this.initialized) return;
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });
        this.initialized = true;
    }

    setVolume(value) {
        // Implementation for master volume in Expo usually requires setting it on each instance
        this.volume = value;
        if (this.currentSoundInstance) {
            this.currentSoundInstance.setVolumeAsync(value);
        }
    }

    toggleTTS(enabled) {
        this.ttsEnabled = enabled;
        if (!enabled) {
            Speech.stop();
        }
    }

    stopSpeaking() {
        Speech.stop();
    }

    async playPop() {
        // Simple pop sound or use a local asset
        // For now, we'll placeholder this or use a system sound if available
    }

    async playDing() {
        // Placeholder
    }

    async playSad() {
        // Placeholder
    }

    async playInvestigate() {
        // Placeholder
    }

    async playVictory() {
        this.stopMusic();
        const { sound } = await Audio.Sound.createAsync(require('../../public/ThemeAudio/victory.mp3'));
        this.currentSoundInstance = sound;
        await sound.setVolumeAsync(this.volume || 0.5);
        await sound.playAsync();
    }

    async playMenuMusic() {
        if (this.currentTrack === 'menu') return;
        this.stopMusic();
        const { sound } = await Audio.Sound.createAsync(
            require('../../public/ThemeAudio/bc.mp3'),
            { isLooping: true }
        );
        this.currentSoundInstance = sound;
        await sound.setVolumeAsync(this.volume || 0.3);
        await sound.playAsync();
        this.currentTrack = 'menu';
    }

    async startAmbient(theme, trust = 50) {
        if (this.currentTrack === theme) return;
        this.stopMusic();
        this.currentTrack = theme;

        let asset;
        if (theme === 'park') asset = require('../../public/ThemeAudio/park.mp3');
        else if (theme === 'campus') asset = require('../../public/ThemeAudio/campus.mp3');
        else if (theme === 'rainy_street') asset = require('../../public/ThemeAudio/rain.mp3');
        else if (theme === 'bridge_night' || theme === 'office') asset = require('../../public/ThemeAudio/owl.mp3'); // Fallback ambience
        else asset = require('../../public/ThemeAudio/bc.mp3'); // Default

        if (asset) {
            const { sound } = await Audio.Sound.createAsync(
                asset,
                { isLooping: true }
            );
            this.currentSoundInstance = sound;
            await sound.setVolumeAsync(this.volume || 0.2);
            await sound.playAsync();
        }
    }

    async stopMusic() {
        if (this.currentSoundInstance) {
            await this.currentSoundInstance.stopAsync();
            await this.currentSoundInstance.unloadAsync();
            this.currentSoundInstance = null;
        }
        this.currentTrack = null;
    }

    speak(text, isNpc = true, gender = 'guy', voiceParams = null, onEnd = null) {
        if (!this.ttsEnabled) {
            if (onEnd) onEnd();
            return;
        }

        Speech.speak(text, {
            pitch: voiceParams?.pitch || (gender === 'girl' ? 1.2 : 0.8),
            rate: voiceParams?.rate || 0.8,
            onDone: onEnd,
            onError: onEnd,
        });
    }
}

export const audioManager = new SoundEngine();
