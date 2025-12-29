const assets = {
    // Stickman Assets
    'guy_idle': require('../../public/stickman_assets/guy_idle.svg'),
    'guy_run': require('../../public/stickman_assets/guy_walk_right.svg'), // mapped run to walk for simplicity if run doesn't exist
    'guy_walk_right': require('../../public/stickman_assets/guy_walk_right.svg'),
    'guy_walk_left': require('../../public/stickman_assets/guy_walk_left.svg'),
    'guy_jump': require('../../public/stickman_assets/guy_jump.svg'),
    'guy_crouch': require('../../public/stickman_assets/guy_crouch.svg'),
    'guy_distressed': require('../../public/stickman_assets/guy_distressed.svg'),

    'girl_idle': require('../../public/stickman_assets/girl_idle.svg'),
    'girl_walk_right': require('../../public/stickman_assets/girl_walk_right.svg'),
    'girl_walk_left': require('../../public/stickman_assets/girl_walk_left.svg'),
    'girl_jump': require('../../public/stickman_assets/girl_jump.svg'),
    'girl_crouch': require('../../public/stickman_assets/girl_crouch.svg'),
    // 'girl_distressed': require('../../public/stickman_assets/girl_distressed.svg'), // Missing in dir list, using fallback or leaving out

    // NPCs
    'alex': require('../../public/npc/alex.svg'),
    'david': require('../../public/npc/david.svg'),
    'grace': require('../../public/npc/grace.svg'),
    'jessica': require('../../public/npc/jessica.svg'),
    'raj': require('../../public/npc/raj.svg'),
    'stranger': require('../../public/npc/stranger.svg'),

    // Misc
    'pointing_stickman': require('../../public/stickman_assets/pointing_stickman.svg'),
    'thinking_stickman': require('../../public/stickman_assets/thinking_stickman.svg'),
    'group_hug': require('../../public/stickman_assets/group_hug.svg'),

    // Settings / Mini-games Icons
    'scout_stickman': require('../../public/stickman_assets/scout_stickman.svg'),
    'scholar_stickman': require('../../public/stickman_assets/scholar_stickman.svg'),
    'shield_stickman': require('../../public/stickman_assets/shield_stickman.svg'),
    'hope_stickman': require('../../public/stickman_assets/hope_stickman.svg'),

    // Signal Scout Assets
    'stickman_laptop': require('../../public/stickman_assets/stickman_laptop.svg'),
    'stickman_phone': require('../../public/stickman_assets/stickman_phone.svg'),
    'sad_stickman': require('../../public/stickman_assets/sad_stickman.svg'),
    'happy_stickman': require('../../public/stickman_assets/happy_stickman.svg'), // Also useful
    'empty_stickman': require('../../public/stickman_assets/empty_stickman.svg'),
    'stickman_group': require('../../public/stickman_assets/stickman_group.svg'),
    'dog_walker': require('../../public/stickman_assets/dog_walker.svg'),
    'clock_stickman': require('../../public/stickman_assets/clock_stickman.svg'),
};

export default assets;
