import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Modal, Dimensions, StyleSheet, SafeAreaView, Platform } from 'react-native';
import Stickman from './components/Stickman';
import DialogueBox from './components/DialogueBox';
import ResourceWallet from './components/ResourceWallet';
import Scenery from './components/Scenery';
import HeartbeatMonitor from './components/HeartbeatMonitor';
import SettingsOverlay from './components/SettingsOverlay';
import ClueOverlay from './components/ClueOverlay';

// Pages
import SplashScreen from './pages/SplashScreen';
import StartScreen from './pages/StartScreen';
import NamingScreen from './pages/NamingScreen';
import GenderSelectScreen from './pages/GenderSelectScreen';
import LevelSelectScreen from './pages/LevelSelectScreen';
import QuizGameScreen from './pages/QuizGameScreen';
import ResourcesScreen from './pages/ResourcesScreen';
import FinalSuccessScreen from './pages/FinalSuccessScreen';
import ResolutionScreen from './pages/ResolutionScreen';
import HandoffScreen from './pages/HandoffScreen';
import ResourceRelayScreen from './pages/ResourceRelayScreen';

import SignalScoutScreen from './pages/SignalScoutScreen'; // New Game
import WordsOfHopeScreen from './pages/WordsOfHopeScreen'; // New Game
import TutorialOverlay from './pages/TutorialOverlay';

// Data
import dialogueData from './dialogue.json';
import { MISSIONS } from './data/missions';
import { INNER_THOUGHTS, CLUE_POSITIONS, CLUE_DETAILS, BACKGROUND_NPCS } from './data/gameData';
import { audioManager } from './utils/audio';
import { REAL_RESOURCES } from './data/resources';
import { PLAYER_CARDS } from './data/resourceRelayData';

import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  // Game State
  const [gameState, setGameState] = useState('SPLASH'); // SPLASH, START, NAMING, GENDER_SELECT, LEVEL_SELECT, APPROACH, DIALOGUE, RESOLUTION, HANDOFF, FINAL_SUCCESS, QUIZ_MODE, RESOURCES, VALIDATION_CATCH, RESOURCE_RELAY, WORDS_OF_HOPE

  // Settings
  const [settings, setSettings] = useState({
    audioVolume: 0.5,
    ttsEnabled: true,
    textSpeed: 50,
    devMode: false
  });
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Player State
  const [playerName, setPlayerName] = useState('You');
  const [playerGender, setPlayerGender] = useState('guy');
  const [selectedLevel, setSelectedLevel] = useState(MISSIONS[0]);
  const [completedLevels, setCompletedLevels] = useState([]);

  // Load Persisted Data
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedSettings = await AsyncStorage.getItem('qpr_settings');
        if (savedSettings) {
          setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
        }

        const savedLevels = await AsyncStorage.getItem('qpr_completed_missions_v4');
        if (savedLevels) {
          setCompletedLevels(JSON.parse(savedLevels));
        }
      } catch (e) {
        console.warn('Failed to load data', e);
      }
    };
    loadData();
  }, []);

  // Gameplay State
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [trust, setTrust] = useState(25);
  const [currentNodeId, setCurrentNodeId] = useState('beginning');
  const [history, setHistory] = useState([]);
  const [playerPos, setPlayerPos] = useState({ x: 5, y: 70 });
  const [samPos, setSamPos] = useState({ x: 75, y: 70 });

  // Interaction State
  const [foundClues, setFoundClues] = useState([]);
  const [viewedClue, setViewedClue] = useState(null);
  const [isWalletOpen, setIsWalletOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState(null);
  const [playerLastSaid, setPlayerLastSaid] = useState(null);
  const [npcLastSaid, setNpcLastSaid] = useState(null); // New state for NPC bubbles
  const [coachFeedback, setCoachFeedback] = useState(null);
  const [resolutionPhase, setResolutionPhase] = useState(0);
  const [camera, setCamera] = useState({ scale: 1.1, x: 0, y: 0 });
  const [isNpcSpeaking, setIsNpcSpeaking] = useState(false);
  const [showDiscoveryPopup, setShowDiscoveryPopup] = useState(false);

  // Movement State
  const [isWalking, setIsWalking] = useState(false);
  const [isJumping, setIsJumping] = useState(false);
  const [isCrouching, setIsCrouching] = useState(false);
  const [moveDir, setMoveDir] = useState(0);

  // NPC Behavior
  const [npcAction, setNpcAction] = useState('idle');

  // Misc
  const [activeThought, setActiveThought] = useState(null);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isFeedbackFocused, setIsFeedbackFocused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Derived
  const currentScenario = dialogueData[selectedLevel.id] || dialogueData[selectedLevel.theme] || dialogueData['park'];
  const currentClue = CLUE_POSITIONS[selectedLevel.id] || CLUE_POSITIONS[selectedLevel.theme];
  const resetCardGame = () => setGameState('LEVEL_SELECT'); // Used in some callbacks

  const walletResources = [
    // Standard Cards Only (Generic)
    ...(PLAYER_CARDS || []).map(c => ({ id: c.id, name: c.title, description: c.desc }))
  ];

  // Clean bubbles on exit
  useEffect(() => {
    setPlayerLastSaid(null);
    setNpcLastSaid(null);
  }, [gameState, currentNodeId]);

  // --- Effects ---

  // Loading Progress
  useEffect(() => {
    if (gameState !== 'SPLASH') return;
    const timer = setInterval(() => {
      setLoadingProgress(prev => (prev >= 100 ? 100 : prev + Math.random() * 5));
    }, 150);
    return () => clearInterval(timer);
  }, [gameState]);

  // Handle auto-transition from splash
  useEffect(() => {
    if (gameState === 'SPLASH' && loadingProgress >= 100) {
      const timer = setTimeout(() => {
        setGameState('START');
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [loadingProgress, gameState]);

  // Save Progress
  useEffect(() => {
    const saveData = async () => {
      try {
        await AsyncStorage.setItem('qpr_completed_missions_v4', JSON.stringify(completedLevels));
      } catch (e) { console.warn('Failed to save levels', e); }
    };
    saveData();
  }, [completedLevels]);

  // Save Settings
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('qpr_settings', JSON.stringify(settings));
      } catch (e) { console.warn('Failed to save settings', e); }
    };
    saveSettings();
  }, [settings]);

  // Clean Legacy Data
  useEffect(() => {
    AsyncStorage.removeItem('qpr_completed_missions');
    AsyncStorage.removeItem('qpr_completed_missions_v2');
  }, []);

  // Audio & Settings
  useEffect(() => {
    localStorage.setItem('qpr_settings', JSON.stringify(settings));
    if (audioManager.initialized) {
      audioManager.setVolume(settings.audioVolume);
      audioManager.toggleTTS(settings.ttsEnabled);
    }
  }, [settings]);

  // Orientation Check
  useEffect(() => {
    const check = () => {
      const { width, height } = Dimensions.get('window');
      setIsPortrait(height > width && width < 1024);
    };
    check();
    const subscription = Dimensions.addEventListener('change', check);
    return () => subscription?.remove();
  }, []);

  // Music Management
  useEffect(() => {
    const isMenu = ['START', 'NAMING', 'GENDER_SELECT', 'LEVEL_SELECT', 'SPLASH'].includes(gameState);
    const sceneNodes = dialogueData[selectedLevel?.id]?.nodes;
    const isAtEnd = sceneNodes && sceneNodes[currentNodeId]?.isEnd;

    if (isMenu) {
      audioManager.playMenuMusic();
    } else if (['APPROACH', 'DIALOGUE'].includes(gameState) && !isAtEnd) {
      audioManager.init();
      audioManager.startAmbient(trust, selectedLevel.theme);
    } else if (gameState === 'RESOLUTION' && resolutionPhase >= 2) {
      // Specifically stop at the "hug" screen as requested
      audioManager.stopMusic();
    } else if (gameState !== 'APPROACH' && gameState !== 'DIALOGUE' && gameState !== 'RESOLUTION') {
      audioManager.stopMusic();
    }
  }, [gameState, selectedLevel, trust, currentNodeId, resolutionPhase]);

  // Camera Logic
  useEffect(() => {
    if (isWalletOpen) setCamera({ scale: 1.15, x: -25, y: -5 });
    else if (gameState === 'DIALOGUE') setCamera({ scale: 1.15, x: -10, y: -5 });
    else if (gameState === 'APPROACH') setCamera({ scale: 1, x: 0, y: 0 });
  }, [gameState, isWalletOpen]);

  // --- Game Loop Logic (Approach/Movement) ---

  // NPC Behavior Pacing
  useEffect(() => {
    if (gameState !== 'APPROACH') { setNpcAction('idle'); return; }
    const interval = setInterval(() => {
      if (Math.abs(playerPos.x - samPos.x) < 20) return;
      const actions = ['idle', 'phone', 'pacing', 'sitting'];
      setNpcAction(actions[Math.floor(Math.random() * actions.length)]);
    }, 5000 + Math.random() * 5000);
    return () => clearInterval(interval);
  }, [gameState, playerPos.x, samPos.x]);

  // Keyboard Controls
  useEffect(() => {
    if (gameState !== 'APPROACH') return;
    const handleKeyDown = (e) => {
      audioManager.init();
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') setMoveDir(1);
      else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') setMoveDir(-1);
      else if (e.key === 'ArrowUp' || e.key.toLowerCase() === 'w') {
        setIsJumping(true); setTimeout(() => setIsJumping(false), 500);
      } else if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setIsCrouching(true);
      else if (e.key.toLowerCase() === 'z') handleInvestigate();
    };
    const handleKeyUp = (e) => {
      if ((e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') && moveDir === 1) setMoveDir(0);
      if ((e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') && moveDir === -1) setMoveDir(0);
      if (e.key === 'ArrowDown' || e.key.toLowerCase() === 's') setIsCrouching(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => { window.removeEventListener('keydown', handleKeyDown); window.removeEventListener('keyup', handleKeyUp); };
  }, [gameState, moveDir]);

  // Movement Engine (Loop)
  useEffect(() => {
    if (gameState !== 'APPROACH' || moveDir === 0) { setIsWalking(false); return; }
    setIsWalking(true);
    const interval = setInterval(() => {
      setPlayerPos(p => {
        let newX = p.x + (moveDir * 1.5);
        if (newX < 5) newX = 5;
        if (newX > 85) newX = 85;
        return { ...p, x: newX };
      });
    }, 30); // ~30fps
    return () => clearInterval(interval);
  }, [gameState, moveDir]);

  // NPC Movement Engine (Pacing)
  useEffect(() => {
    if (gameState !== 'APPROACH' || npcAction !== 'pacing') return;

    // NPC Pacing Range around initial spot
    const baseStopX = 75;
    const paceWidth = 10;

    const interval = setInterval(() => {
      setSamPos(p => {
        // Move towards target or pace around
        const distToPlayer = Math.abs(playerPos.x - p.x);
        if (distToPlayer < 20) return p; // Stop if player is close

        // Pacing logic
        let direction = Math.sin(Date.now() / 2000) > 0 ? 1 : -1;
        let newX = p.x + (direction * 0.3);

        // Boundaries
        if (newX < baseStopX - paceWidth) newX = baseStopX - paceWidth;
        if (newX > baseStopX + paceWidth) newX = baseStopX + paceWidth;

        return { ...p, x: newX };
      });
    }, 30);
    return () => clearInterval(interval);
  }, [gameState, npcAction, playerPos.x]);

  // Proximity Check
  useEffect(() => {
    if (gameState !== 'APPROACH') return;

    if (Math.abs(playerPos.x - samPos.x) < 15) {
      // Force NPC to stop movement when triggered
      setNpcAction('idle');

      // Enforce clue collection
      if (currentClue && !foundClues.includes(currentClue.id)) return;

      setIsNpcSpeaking(true);
      setGameState('DIALOGUE');
      audioManager.playDing();
    }
  }, [gameState, playerPos.x, samPos.x, currentClue, foundClues]);

  // Inner Thoughts generation removed as requested

  // Resolution Cutscene
  useEffect(() => {
    if (gameState !== 'RESOLUTION') return;
    const t1 = setTimeout(() => setResolutionPhase(1), 2000);
    const t2 = setTimeout(() => { setResolutionPhase(2); audioManager.playPop(); }, 4500);
    const t3 = setTimeout(() => {
      setResolutionPhase(3);
      const msg = selectedLevel.id === 'tutorial'
        ? `Great job! You've mastered the basics. You're ready to help others now.`
        : `Thank you for being the bridge. We'll take care of ${selectedLevel.npc.name} now.`;
      audioManager.speak(msg, false, 'girl');
    }, 6500);
    const t4 = setTimeout(() => {
      setCurrentNodeId(selectedLevel.id === 'tutorial' ? 'success_tutorial' : 'success_end');
      setGameState('DIALOGUE');
    }, 15000); // Increased from 12s to 15s to allow speech to finish
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      // Removed audioManager.stopSpeaking() to prevent cutting off the closing line
    };
  }, [gameState]);

  // Dialogue & Trust Logic
  const handleSelectOption = (selectedOption) => {
    const nextNodeId = selectedOption.next;
    const trustImpact = selectedOption.trust_impact;

    if (trustImpact > 0) audioManager.playDing();
    else if (trustImpact < 0) audioManager.playSad();

    if (currentNode.required_resource) {
      if (selectedResource === currentNode.required_resource) {
        setTrust(100);
        setGameState('HANDOFF');
        setHistory(prev => [...prev, { nodeId: currentNodeId, choiceText: selectedOption.text, trustChange: trustImpact, npcEmotion: currentNode.npc_emotion }]);
        return;
      } else {
        setTrust(prev => Math.max(0, prev - 10));
        setCoachFeedback({ msg: "Incorrect resource. Check your toolkit.", type: 'negative' });
        audioManager.playSad();
        setIsWalletOpen(true);
        return;
      }
    }

    setTrust(prev => Math.min(100, Math.max(0, prev + (trustImpact || 0))));
    setHistory(prev => [...prev, { nodeId: currentNodeId, choiceText: selectedOption.text, trustChange: trustImpact, npcEmotion: currentNode.npc_emotion }]);
    setPlayerLastSaid(selectedOption.text);

    // Set Coach Feedback Tip
    if (selectedOption.inner_thought) {
      setCoachFeedback({
        msg: selectedOption.inner_thought,
        impact: trustImpact,
        type: trustImpact > 0 ? 'positive' : trustImpact < 0 ? 'negative' : 'neutral'
      });
      // Clear tip after a delay
      setTimeout(() => setCoachFeedback(null), 5000);
    }

    audioManager.speak(selectedOption.text, false, playerGender, null, () => {
      // Short pause after player speaks before NPC starts (Snappy response)
      setTimeout(() => {
        setPlayerLastSaid(null);
        // Pre-emptively set speaking state to prevent DialogueBox flicker
        setIsNpcSpeaking(true);
        setCurrentNodeId(nextNodeId);
      }, 300);
    });
  };

  const handleInvestigate = () => {
    if (currentClue && !foundClues.includes(currentClue.id)) {
      setViewedClue(currentClue);
      audioManager.playInvestigate();
    }
  };

  const handleEndGameContinue = () => {
    audioManager.stopMusic();
    audioManager.stopSpeaking();
    if (currentNode.result === 'success' && !completedLevels.includes(selectedLevel.id)) {
      setCompletedLevels(prev => [...prev, selectedLevel.id]);
    }
    setTrust(25);
    setPlayerPos({ x: 5, y: 70 });
    setHistory([]);
    setResolutionPhase(0);
    if (selectedLevel.id === 'bridge' && currentNode.result === 'success') setGameState('FINAL_SUCCESS');
    else setGameState('LEVEL_SELECT');
  };



  // NPC Speech Effect
  useEffect(() => {
    if (gameState === 'DIALOGUE' && currentNode && (currentNode.npc_text || currentNode.message)) {
      const text = currentNode.npc_text || currentNode.message;
      const isEnd = currentNode.isEnd;
      const npcGender = selectedLevel.npc.gender;
      const npcVoice = selectedLevel.npc.voice;

      setIsNpcSpeaking(true);
      setNpcLastSaid(text);

      const timer = setTimeout(() => {
        audioManager.speak(text, true, npcGender, npcVoice, () => {
          // Reduced buffer time for snappier responses
          const bufferTime = Math.max(500, text.length * 5);
          setTimeout(() => {
            setIsNpcSpeaking(false);
            if (!isEnd) setNpcLastSaid(null);
          }, bufferTime);
        });
      }, 500);

      return () => {
        clearTimeout(timer);
        // Removed audioManager.stopSpeaking() to prevent cutting off transitions
      };
    }
  }, [currentNodeId, gameState]);

  // Wallet Toggle (Only pop up when it's the player's turn to respond)
  useEffect(() => {
    if (gameState === 'DIALOGUE' && !isNpcSpeaking && !playerLastSaid && currentNode?.required_resource) {
      setIsWalletOpen(true);
    } else if (isNpcSpeaking || playerLastSaid || !currentNode?.required_resource) {
      setIsWalletOpen(false);
    }
  }, [currentNode, isNpcSpeaking, gameState, playerLastSaid]);

  const launchMission = (mission) => {
    setIsTransitioning(true);
    audioManager.stopMusic();
    audioManager.stopSpeaking();

    setTimeout(() => {
      setSelectedLevel(mission);
      setCurrentNodeId(dialogueData[mission.id]?.startNode || 'beginning');
      setFoundClues([]);
      setSelectedResource(null);
      setTrust(25);
      setPlayerPos({ x: 5, y: 70 });
      setMoveDir(0); // Ensure FORCE RESET of movement to prevent auto-walk

      setCamera({ scale: 1, x: 0, y: 0 });
      setGameState('APPROACH');
      audioManager.startAmbient(mission.theme);

      setTimeout(() => {
        setIsTransitioning(false);
      }, 800);
    }, 500);
  };

  // --- RENDER ---

  if (isPortrait) return (
    <View className="flex-1 bg-slate-900 justify-center items-center p-8">
      <View className="absolute inset-0 opacity-10">
        <View className="absolute top-10 left-10 w-32 h-32 bg-indigo-500 rounded-full" />
        <View className="absolute bottom-10 right-10 w-40 h-40 bg-teal-500 rounded-full" />
      </View>
      <View className="z-10 items-center">
        <View className="w-24 h-24 mb-8">
          <View className="w-full h-full bg-white/20 rounded-full items-center justify-center border border-white/30">
            <Text className="text-white text-4xl">🔄</Text>
          </View>
        </View>
        <Text className="text-2xl font-black uppercase tracking-widest mb-3 text-teal-200">Mobile View</Text>
        <Text className="text-slate-300 font-medium text-sm text-center leading-relaxed">
          For the best experience, please rotate your device to <Text className="text-white font-bold">Landscape Mode</Text>.
        </Text>
      </View>
    </View>
  );

  if (gameState === 'SPLASH') return <SplashScreen loadingProgress={loadingProgress} />;
  if (gameState === 'START') return <StartScreen trust={trust} onStart={() => { audioManager.init(); setGameState('NAMING'); }} onResources={() => { audioManager.init(); setGameState('RESOURCES'); }} />;
  if (gameState === 'NAMING') return <NamingScreen trust={trust} playerName={playerName} setPlayerName={setPlayerName} onNext={() => setGameState('GENDER_SELECT')} onNavigate={setGameState} />;
  if (gameState === 'GENDER_SELECT') return <GenderSelectScreen trust={trust} playerGender={playerGender} setPlayerGender={setPlayerGender} audioManager={audioManager} onNext={() => setGameState('LEVEL_SELECT')} onBack={() => setGameState('NAMING')} />;
  if (gameState === 'LEVEL_SELECT') return (
    <LevelSelectScreen
      completedLevels={completedLevels}
      selectedLevel={selectedLevel}
      onSelectLevel={setSelectedLevel}
      onLaunchMission={launchMission}
      onNavigate={setGameState}
      trust={trust}
      settings={settings}
      setSettings={setSettings}
      audioManager={audioManager}
      isSettingsOpen={isSettingsOpen}
      setIsSettingsOpen={setIsSettingsOpen}
    />
  );
  if (gameState === 'QUIZ_MODE') return <QuizGameScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;
  if (gameState === 'RESOURCES') return <ResourcesScreen onBack={() => setGameState(prev => ['START', 'LEVEL_SELECT'].includes(prev) ? prev : 'START')} />;
  if (gameState === 'FINAL_SUCCESS') return <FinalSuccessScreen onRestart={() => { setGameState('START'); setCompletedLevels([]); audioManager.playVictory(); }} />;
  if (gameState === 'RESOLUTION') return <ResolutionScreen resolutionPhase={resolutionPhase} setGameState={setGameState} audioManager={audioManager} playerGender={playerGender} selectedLevel={selectedLevel} playerName={playerName} playerPos={playerPos} samPos={samPos} />;
  if (gameState === 'HANDOFF') return <HandoffScreen selectedLevel={selectedLevel} trust={trust} audioManager={audioManager} setGameState={setGameState} setResolutionPhase={setResolutionPhase} />;
  if (gameState === 'RESOURCE_RELAY') return <ResourceRelayScreen audioManager={audioManager} onComplete={() => setGameState('LEVEL_SELECT')} onExit={() => setGameState('LEVEL_SELECT')} />;

  if (gameState === 'SIGNAL_SCOUT') return <SignalScoutScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;
  if (gameState === 'WORDS_OF_HOPE') return <WordsOfHopeScreen audioManager={audioManager} onExit={() => setGameState('LEVEL_SELECT')} />;

  return (
    <View className="flex-1 bg-slate-100 relative" onLayout={() => { if (!audioManager.initialized) audioManager.init(); }}>

      <SettingsOverlay
        settings={settings} setSettings={setSettings}
        audioManager={audioManager}
        onResetGame={() => {
          Alert.alert('Reset Game', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Reset', style: 'destructive', onPress: () => {
                setCompletedLevels([]);
                setGameState('LEVEL_SELECT');
              }
            }
          ]);
        }}
        isSettingsOpen={isSettingsOpen} setIsSettingsOpen={setIsSettingsOpen} onNavigate={setGameState}
      />

      {/* Transition Overlay */}
      {isTransitioning && (
        <View className="absolute inset-0 bg-black z-[999]" pointerEvents="none" />
      )}

      {/* Stress Vignette */}
      {trust < 40 && (
        <View className="absolute inset-0 z-[45] bg-black opacity-30 pointer-events-none" />
      )}

      {/* Camera Container */}
      <View
        className="absolute inset-0 w-full h-full justify-center items-center overflow-hidden bg-sky-200"
      >
        <View
          style={{
            width: '120%',
            height: '120%',
            position: 'absolute',
            transform: [
              { scale: camera.scale },
              { translateX: camera.x * 5 }, // heuristic scale for % movement
              { translateY: camera.y * 5 }
            ]
          }}
        >
          <Scenery theme={selectedLevel.theme} trust={trust} />

          {/* Clues */}
          {currentClue && !foundClues.includes(currentClue.id) && (
            <TouchableOpacity
              activeOpacity={0.9}
              className="absolute z-20 items-center justify-center p-4 hover:scale-110"
              style={{
                left: `${currentClue.x}%`,
                bottom: '20%',
                transform: [{ scale: Math.abs(playerPos.x - currentClue.x) < 15 ? 1.2 : 0.9 }]
              }}
              onPress={handleInvestigate}
            >
              {/* Folded Paper Visual */}
              <View className={`w-10 h-12 bg-white rounded-sm shadow-xl border border-teal-500/30 overflow-hidden ${Math.abs(playerPos.x - currentClue.x) < 20 ? 'animate-bounce' : ''}`}>
                <View className="absolute top-0 right-0 w-4 h-4 bg-teal-100 border-l border-b border-teal-500/20 rounded-bl-lg" />
                <View className="p-2 space-y-1">
                  <View className="w-full h-1 bg-slate-200 rounded-full" />
                  <View className="w-4/5 h-1 bg-slate-200 rounded-full" />
                  <View className="w-full h-1 bg-slate-200 rounded-full" />
                </View>
              </View>

              {/* Proximity Prompt */}
              {Math.abs(playerPos.x - currentClue.x) < 15 && (
                <View className="absolute -top-10 bg-teal-600/90 px-2 py-1 rounded-full shadow-xl border border-white/20">
                  <Text className="text-white text-[9px] font-black uppercase tracking-widest whitespace-nowrap">Examine</Text>
                </View>
              )}
            </TouchableOpacity>
          )}

          <Stickman speaker={playerName} position={playerPos} gender={playerGender} theme={selectedLevel.theme} trust={trust} isWalking={isWalking} isJumping={isJumping} isCrouching={isCrouching} currentMessage={playerLastSaid} textSpeed={settings.textSpeed} />
          <Stickman speaker={selectedLevel.npc.name} position={samPos} gender={selectedLevel.npc.gender} emotion={currentNode.npc_emotion} theme={selectedLevel.theme} trust={trust} action={npcAction} currentMessage={npcLastSaid} textSpeed={settings.textSpeed / (selectedLevel.npc.voice?.rate || 1)} />

        </View>
      </View>


      {/* Controls Overlay */}
      {gameState === 'APPROACH' && (
        <View className="absolute bottom-8 left-8 w-36 h-36 z-50 rounded-full bg-white/10 border-2 border-white/20 items-center justify-center">
          {/* Virtual Joystick Visual */}
          <View className="w-12 h-12 bg-teal-500/80 rounded-full shadow-xl border border-white/30"
            style={{ transform: [{ translateX: moveDir * 20 }, { translateY: isJumping ? -20 : isCrouching ? 20 : 0 }] }}
          />

          {/* Touch Zones */}
          <TouchableOpacity
            className="absolute left-0 w-1/3 h-full z-20"
            onPressIn={() => setMoveDir(-1)} onPressOut={() => setMoveDir(0)}
          />
          <TouchableOpacity
            className="absolute right-0 w-1/3 h-full z-20"
            onPressIn={() => setMoveDir(1)} onPressOut={() => setMoveDir(0)}
          />
          <TouchableOpacity
            className="absolute top-0 w-full h-1/3 z-20"
            onPressIn={() => { setIsJumping(true); setTimeout(() => setIsJumping(false), 500); }}
          />
          <TouchableOpacity
            className="absolute bottom-0 w-full h-1/3 z-20"
            onPressIn={() => setIsCrouching(true)} onPressOut={() => setIsCrouching(false)}
          />

          <View className="absolute -bottom-6 w-48 items-center">
            <Text className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Move / Jump / Crouch</Text>
          </View>
        </View>
      )}

      {/* Interact Prompt Popup */}
      {gameState === 'APPROACH' && Math.abs(playerPos.x - samPos.x) < 20 && (
        <View className="absolute top-[20%] left-1/2 -ml-20 bg-white/90 px-4 py-2 rounded-full shadow-xl z-40">
          <Text className="text-xs font-bold text-slate-900">
            {currentClue && !foundClues.includes(currentClue.id) ? "Find Clue First 🔍" : "Approach & Listen"}
          </Text>
        </View>
      )}

      {selectedLevel.id === 'tutorial' && <TutorialOverlay gameState={gameState} playerPos={playerPos} foundClues={foundClues} />}

      {/* HUD Layer */}
      <View className="absolute top-4 left-4 z-40 flex-col gap-2" pointerEvents="box-none">
        <HeartbeatMonitor trust={trust} />

        <View className="bg-black/30 p-3 rounded-xl border border-white/10 shadow-lg mt-2 self-start flex-col">
          <Text className="text-xs font-black uppercase text-white tracking-widest">{selectedLevel.name}</Text>
          <Text className="text-[10px] font-bold text-teal-300 uppercase tracking-wider">{gameState === 'APPROACH' ? 'Explore Mode' : 'Conversation Mode'}</Text>
        </View>

        <TouchableOpacity
          onPress={() => { audioManager.stopMusic(); audioManager.stopSpeaking(); setGameState('LEVEL_SELECT'); }}
          className="px-3 py-1.5 bg-red-500/90 rounded-lg shadow-md border border-red-400/50 self-start mt-2"
        >
          <Text className="text-white text-[10px] font-black uppercase tracking-widest">Exit Mission</Text>
        </TouchableOpacity>

        {/* Coach Tip */}
        {coachFeedback && (
          <View className="mt-4 w-64">
            <View className={`p-4 rounded-2xl border-l-4 shadow-2xl ${coachFeedback.type === 'positive' ? 'bg-teal-500/80 border-teal-400' :
              coachFeedback.type === 'negative' ? 'bg-red-500/80 border-red-400' : 'bg-slate-500/80 border-slate-400'
              }`}>
              <View className="flex-row items-center gap-2 mb-1">
                <Text className="text-[10px] font-black uppercase tracking-widest text-white/50">Coach Tip</Text>
                <View className={`px-1.5 py-0.5 rounded ${coachFeedback.type === 'positive' ? 'bg-teal-500' :
                  coachFeedback.type === 'negative' ? 'bg-red-500' : 'bg-slate-500'
                  }`}>
                  <Text className="text-white text-[8px] font-black">{coachFeedback.impact > 0 ? `+${coachFeedback.impact}` : coachFeedback.impact} Empathy</Text>
                </View>
              </View>
              <Text className="text-white text-xs font-semibold leading-relaxed shadow-sm">
                {coachFeedback.msg}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Notifications */}
      {showDiscoveryPopup && (
        <View className="absolute top-20 left-0 right-0 items-center z-[100]">
          <View className="bg-teal-500 px-6 py-3 rounded-full shadow-2xl flex-row items-center gap-3">
            <Text className="text-xl">✅</Text>
            <Text className="font-bold uppercase tracking-widest text-xs text-white">Clue Added to Journal</Text>
          </View>
        </View>
      )}

      <ClueOverlay
        viewedClue={viewedClue}
        onClose={() => {
          setFoundClues(p => [...p, viewedClue.id]);
          setViewedClue(null);
          setShowDiscoveryPopup(true);
          setTimeout(() => setShowDiscoveryPopup(false), 2000);
        }}
      />

      {/* Dialogue and Wallet */}
      {gameState === 'DIALOGUE' && currentNode && !isNpcSpeaking && !playerLastSaid && (
        <DialogueBox
          node={currentNode}
          onSelectOption={handleSelectOption}
          foundClues={foundClues}
          requiredResource={currentNode?.required_resource}
          requiredResourceName={walletResources.find(r => r.id === currentNode?.required_resource)?.name || currentNode?.required_resource}
          selectedResource={selectedResource}
          isWalletOpen={isWalletOpen}
        />
      )}

      {/* Critical Choice Banner */}
      {gameState === 'DIALOGUE' && !isNpcSpeaking && !playerLastSaid && currentNode?.required_resource && (
        <View className="absolute top-[15%] w-full items-center z-[100]" pointerEvents="none">
          <View className="bg-indigo-600 px-8 py-4 rounded-2xl border-4 border-white items-center gap-1 shadow-2xl">
            <Text className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 text-indigo-100">Critical Choice</Text>
            <Text className="text-xl font-black uppercase tracking-widest text-white text-center">Open Toolkit & Select Resource</Text>
            <View className="flex-row items-center gap-2 mt-2">
              <Text className="text-2xl">👉</Text>
              <View className="bg-white/20 px-3 py-1 rounded-full">
                <Text className="text-[10px] font-bold uppercase tracking-widest text-white">
                  {walletResources.find(r => r.id === currentNode.required_resource)?.name || currentNode.required_resource} Needed
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* End Game Modular */}
      {currentNode?.isEnd && (
        <Modal transparent animationType="fade">
          <View className="flex-1 bg-slate-900/90 justify-center items-center p-6">
            <View className="w-full max-w-xl bg-white rounded-3xl p-8 items-center shadow-2xl border-4 border-teal-500">
              <View className={`w-20 h-20 rounded-full items-center justify-center mb-6 shadow-xl ${currentNode.result === 'success' ? 'bg-green-100' : 'bg-red-100'}`}>
                <Text className="text-5xl">{currentNode.result === 'success' ? '🌟' : '💔'}</Text>
              </View>
              <Text className="text-3xl font-black uppercase text-slate-800 mb-4 text-center">
                {selectedLevel.id === 'tutorial' && currentNode.result === 'success' ? 'Training Complete' : currentNode.result === 'success' ? 'Mission Complete' : 'Mission Failed'}
              </Text>
              <Text className="text-slate-600 text-lg font-medium leading-relaxed mb-8 text-center">{currentNode.message}</Text>

              {currentNode.result === 'failure' && (
                <View className="bg-orange-50 p-3 rounded-xl border border-orange-100 mb-8">
                  <Text className="text-xs text-orange-500 font-bold uppercase tracking-widest">Tip: Try Validation First. Listen more.</Text>
                </View>
              )}

              <TouchableOpacity
                onPress={() => { if (isFeedbackFocused) return; handleEndGameContinue(); }}
                className="w-full py-4 bg-slate-900 rounded-2xl items-center shadow-xl active:scale-95"
              >
                <Text className="text-white font-black uppercase tracking-widest text-lg">Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      <ResourceWallet isOpen={isWalletOpen} setIsOpen={setIsWalletOpen} selectedResource={selectedResource} onSelectResource={setSelectedResource} trust={trust} resources={walletResources} />

    </View>
  );
};

export default App;
