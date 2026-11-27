import painted from '../data/paintedTextures.json' with {type:'json'};
import { sharedBootPhysics } from '@wildshard/dev/bootInventory';

const PINE_BOOT_ASSET_1="/assets/pine-hollow/baked/sky.json";
const PINE_BOOT_ASSET_2="/assets/pine-hollow/baked/tex/";
const PINE_BOOT_ASSET_3="/assets/pine-hollow/models/Lantern_01/Lantern_01_lod.glb";
const PINE_BOOT_ASSET_4="/assets/pine-hollow/models/rock_moss_set_01/rock_moss_set_01_lod.glb";
const PINE_BOOT_ASSET_5="/assets/pine-hollow/models/tree_stump_01/tree_stump_01_lod.glb";
const PINE_BOOT_ASSET_6="/assets/pine-hollow/models/dead_tree_trunk/dead_tree_trunk_lod.glb";
const PINE_BOOT_ASSET_7="/assets/pine-hollow/weapons/lever-rifle.glb";
const PINE_BOOT_ASSET_8="/assets/pine-hollow/weapons/skinning-knife.glb";
const PINE_BOOT_ASSET_12="/assets/pine-hollow/baked/navmesh.bin";
const PINE_BOOT_ASSET_13: ReturnType<typeof sharedBootPhysics>[0]=sharedBootPhysics()[0];

/** Ordered boot selections; GPU inventory and admitted prop/coat aliases are borrowed at resolution. */
export const PINE_BOOT_FILES: {
    readonly skyHdr: {
        readonly source: {
            readonly available: readonly [
                "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.sky.jpg",
                "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.gain.png"
            ];
            readonly fallback: readonly [
                "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.hdr"
            ];
        };
    };
    readonly skyBake: {
        readonly source: {
            readonly urls: readonly [
                typeof PINE_BOOT_ASSET_1
            ];
        };
        readonly present: true;
    };
    readonly skyKeys: {
        readonly source: {
            readonly urls: readonly [
                "/assets/pine-hollow/hdri/qwantani_dawn_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_dawn_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_sunrise_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_sunrise_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_mid_morning_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_mid_morning_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_late_afternoon_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_late_afternoon_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_dusk_2_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_dusk_2_puresky_2k.key.gain.png",
                "/assets/pine-hollow/hdri/qwantani_moon_noon_puresky_2k.key.jpg",
                "/assets/pine-hollow/hdri/qwantani_moon_noon_puresky_2k.key.gain.png"
            ];
        };
        readonly present: true;
    };
    readonly empty: {
        readonly source: {
            readonly urls: readonly [
            ];
        };
    };
    readonly sky: {
        readonly source: {
            readonly concat: readonly [
                "skyHdr",
                "skyBake"
            ];
        };
        readonly map: readonly [
            "gpu"
        ];
    };
    readonly baked: {
        readonly source: {
            readonly publicPrefix: typeof PINE_BOOT_ASSET_2;
        };
        readonly excludeParts: readonly [
            ".phone."
        ];
        readonly excludeBasenamePrefix: "fur-";
        readonly map: readonly [
            "gpu"
        ];
    };
    readonly terrainLayers: {
        readonly source: {
            readonly pbr: readonly [
                "/assets/pine-hollow/tex/forrest_ground_03",
                "/assets/pine-hollow/tex/leafy_grass",
                "/assets/pine-hollow/tex/rock_ground",
                "/assets/pine-hollow/tex/stony_dirt_path"
            ];
        };
        readonly map: readonly [
            "layer"
        ];
    };
    readonly terrainRock: {
        readonly source: {
            readonly pbr: readonly [
                "/assets/pine-hollow/tex/rock_ground"
            ];
        };
    };
    readonly terrain: {
        readonly source: {
            readonly concat: readonly [
                "terrainLayers",
                "terrainRock"
            ];
        };
        readonly unique: true;
        readonly map: readonly [
            "gpu"
        ];
    };
    readonly treeMeshes: {
        readonly source: {
            readonly urls: readonly [
                "/assets/pine-hollow/models/pine-hollow-trees/cards-albedo.png",
                "/assets/pine-hollow/models/pine-hollow-trees/cards-normal.jpg",
                "/assets/pine-hollow/models/pine-hollow-trees/cards-arm.jpg",
                "/assets/pine-hollow/models/pine-hollow-trees/impostor-albedo.png",
                "/assets/pine-hollow/models/pine-hollow-trees/impostor-normal.jpg"
            ];
        };
    };
    readonly treeBark: {
        readonly source: {
            readonly pbr: readonly [
                "/assets/pine-hollow/tex/pine_bark",
                "/assets/pine-hollow/tex/fir_bark",
                "/assets/pine-hollow/tex/metasequoia_bark",
                "/assets/pine-hollow/tex/birch_bark",
                "/assets/pine-hollow/tex/bark_willow_02"
            ];
        };
        readonly map: readonly [
            "layer"
        ];
    };
    readonly trees: {
        readonly source: {
            readonly concat: readonly [
                "treeMeshes",
                "treeBark"
            ];
        };
        readonly unique: true;
        readonly map: readonly [
            "gpu"
        ];
    };
    readonly layered: {
        readonly source: {
            readonly concat: readonly [
                "terrain",
                "trees"
            ];
        };
        readonly unique: true;
    };
    readonly cabinPbr: {
        readonly source: {
            readonly pbr: readonly [
                "/assets/pine-hollow/tex/wood_trunk_wall",
                "/assets/pine-hollow/tex/wood_planks_grey",
                "/assets/pine-hollow/tex/wood_planks_dirt",
                "/assets/pine-hollow/tex/rough_pine_door",
                "/assets/pine-hollow/tex/stone_wall",
                "/assets/pine-hollow/tex/pine_bark"
            ];
        };
    };
    readonly cabinGltf: {
        readonly source: {
            readonly urls: readonly [
                "/assets/pine-hollow/models/stone_fire_pit/stone_fire_pit.gltf",
                "/assets/pine-hollow/models/stone_fire_pit/stone_fire_pit.bin",
                "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_diff_1k.jpg",
                "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_nor_gl_1k.jpg",
                "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_arm_1k.jpg",
                "/assets/pine-hollow/models/wooden_crate_02/wooden_crate_02.gltf",
                "/assets/pine-hollow/models/wooden_crate_02/wooden_crate_02.bin",
                "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_diff_1k.jpg",
                "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_nor_gl_1k.jpg",
                "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_arm_1k.jpg",
                "/assets/pine-hollow/models/wine_barrel_01/wine_barrel_01.gltf",
                "/assets/pine-hollow/models/wine_barrel_01/wine_barrel_01.bin",
                "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_diff_1k.jpg",
                "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_nor_gl_1k.jpg",
                "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_arm_1k.jpg",
                "/assets/pine-hollow/models/wooden_bucket_01/wooden_bucket_01.gltf",
                "/assets/pine-hollow/models/wooden_bucket_01/wooden_bucket_01.bin",
                "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_diff_1k.jpg",
                "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_nor_gl_1k.jpg",
                "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_arm_1k.jpg",
                "/assets/pine-hollow/models/hatchet/hatchet.gltf",
                "/assets/pine-hollow/models/hatchet/hatchet.bin",
                "/assets/pine-hollow/models/hatchet/textures/hatchet_diff_1k.jpg",
                "/assets/pine-hollow/models/hatchet/textures/hatchet_nor_gl_1k.jpg",
                "/assets/pine-hollow/models/hatchet/textures/hatchet_arm_1k.jpg"
            ];
        };
    };
    readonly lantern: {
        readonly source: {
            readonly urls: readonly [
                typeof PINE_BOOT_ASSET_3
            ];
        };
    };
    readonly cabins: {
        readonly source: {
            readonly concat: readonly [
                "cabinPbr",
                "cabinGltf",
                "lantern"
            ];
        };
        readonly unique: true;
        readonly map: readonly [
            "gpu"
        ];
        readonly except: "layered";
    };
    readonly rocks: {
        readonly source: {
            readonly urls: readonly [
                typeof PINE_BOOT_ASSET_4,
                typeof PINE_BOOT_ASSET_5,
                typeof PINE_BOOT_ASSET_6
            ];
        };
        readonly unique: true;
    };
    readonly world: {
        readonly source: {
            readonly urls: {
                readonly phone: readonly [
                    "/assets/pine-hollow/horizon/pine-hollow-day-phone.webp",
                    "/assets/pine-hollow/horizon/pine-hollow-night-phone.webp",
                    typeof PINE_BOOT_ASSET_7,
                    typeof PINE_BOOT_ASSET_8,
                    ...string[],
                    "/assets/pine-hollow/baked/rain.phone.bin"
                ];
                readonly desktop: readonly [
                    "/assets/pine-hollow/horizon/pine-hollow-day-phone.webp",
                    "/assets/pine-hollow/horizon/pine-hollow-night-phone.webp",
                    typeof PINE_BOOT_ASSET_7,
                    typeof PINE_BOOT_ASSET_8,
                    ...string[],
                    "/assets/pine-hollow/baked/rain.bin"
                ];
            };
        };
        readonly map: readonly [
            "gpu"
        ];
        readonly present: true;
    };
    readonly heroes: {
        readonly source: {
            readonly urls: readonly [
                "/assets/pine-hollow/models/pine-hollow-hero/stone-a/stone-a.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/stone-a-lod1/stone-a-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/stone-b/stone-b.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/stone-b-lod1/stone-b-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/stone-c/stone-c.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/stone-c-lod1/stone-c-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/waystone/waystone.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/waystone-lod1/waystone-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/contract-board/contract-board.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/contract-board-lod1/contract-board-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/cave-arch/cave-arch.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/cave-arch-lod1/cave-arch-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/beaver-dam/beaver-dam.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/beaver-dam-lod1/beaver-dam-lod1.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/canoe/canoe.glb",
                "/assets/pine-hollow/models/pine-hollow-hero/canoe-lod1/canoe-lod1.glb",
                "/assets/pine-hollow/tex/mossy_rock/diffuse.jpg",
                "/assets/pine-hollow/tex/mossy_rock/nor_gl.jpg",
                "/assets/pine-hollow/tex/mossy_rock/arm.jpg"
            ];
        };
        readonly present: true;
    };
    readonly propBase: {
        readonly source: {
            readonly concat: readonly [
                "world",
                "rocks",
                "heroes"
            ];
        };
        readonly map: readonly [
            "gpu"
        ];
        readonly aliases: "props";
    };
    readonly coats: {
        readonly source: {
            readonly tablePrefix: "procedural:/assets/pine-hollow/creatures/";
        };
    };
    readonly viewmodels: {
        readonly source: {
            readonly tablePrefix: "procedural:/assets/pine-hollow/baked/viewmodel/";
        };
    };
    readonly props: {
        readonly source: {
            readonly concat: readonly [
                "propBase",
                "coats",
                "viewmodels"
            ];
        };
    };
    readonly nav: {
        readonly source: {
            readonly urls: readonly [
                typeof PINE_BOOT_ASSET_12
            ];
        };
        readonly present: true;
    };
    readonly rapier: {
        readonly source: {
            readonly urls: readonly [
                typeof PINE_BOOT_ASSET_13
            ];
        };
    };
    readonly physics: {
        readonly source: {
            readonly concat: readonly [
                "rapier",
                "nav"
            ];
        };
    };
} = {
  "skyHdr": {
    "source": {
      "available": [
        "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.sky.jpg",
        "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.gain.png"
      ],
      "fallback": [
        "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.hdr"
      ]
    }
  },
  "skyBake": {
    "source": {
      "urls": [
        PINE_BOOT_ASSET_1
      ]
    },
    "present": true
  },
  "skyKeys": {
    "source": {
      "urls": [
        "/assets/pine-hollow/hdri/qwantani_dawn_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_dawn_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_sunrise_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_sunrise_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_mid_morning_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_mid_morning_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_late_afternoon_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_late_afternoon_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_sunset_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_dusk_2_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_dusk_2_puresky_2k.key.gain.png",
        "/assets/pine-hollow/hdri/qwantani_moon_noon_puresky_2k.key.jpg",
        "/assets/pine-hollow/hdri/qwantani_moon_noon_puresky_2k.key.gain.png"
      ]
    },
    "present": true
  },
  "empty": {
    "source": {
      "urls": []
    }
  },
  "sky": {
    "source": {
      "concat": [
        "skyHdr",
        "skyBake"
      ]
    },
    "map": [
      "gpu"
    ]
  },
  "baked": {
    "source": {
      "publicPrefix": PINE_BOOT_ASSET_2
    },
    "excludeParts": [
      ".phone."
    ],
    "excludeBasenamePrefix": "fur-",
    "map": [
      "gpu"
    ]
  },
  "terrainLayers": {
    "source": {
      "pbr": [
        "/assets/pine-hollow/tex/forrest_ground_03",
        "/assets/pine-hollow/tex/leafy_grass",
        "/assets/pine-hollow/tex/rock_ground",
        "/assets/pine-hollow/tex/stony_dirt_path"
      ]
    },
    "map": [
      "layer"
    ]
  },
  "terrainRock": {
    "source": {
      "pbr": [
        "/assets/pine-hollow/tex/rock_ground"
      ]
    }
  },
  "terrain": {
    "source": {
      "concat": [
        "terrainLayers",
        "terrainRock"
      ]
    },
    "unique": true,
    "map": [
      "gpu"
    ]
  },
  "treeMeshes": {
    "source": {
      "urls": [
        "/assets/pine-hollow/models/pine-hollow-trees/cards-albedo.png",
        "/assets/pine-hollow/models/pine-hollow-trees/cards-normal.jpg",
        "/assets/pine-hollow/models/pine-hollow-trees/cards-arm.jpg",
        "/assets/pine-hollow/models/pine-hollow-trees/impostor-albedo.png",
        "/assets/pine-hollow/models/pine-hollow-trees/impostor-normal.jpg"
      ]
    }
  },
  "treeBark": {
    "source": {
      "pbr": [
        "/assets/pine-hollow/tex/pine_bark",
        "/assets/pine-hollow/tex/fir_bark",
        "/assets/pine-hollow/tex/metasequoia_bark",
        "/assets/pine-hollow/tex/birch_bark",
        "/assets/pine-hollow/tex/bark_willow_02"
      ]
    },
    "map": [
      "layer"
    ]
  },
  "trees": {
    "source": {
      "concat": [
        "treeMeshes",
        "treeBark"
      ]
    },
    "unique": true,
    "map": [
      "gpu"
    ]
  },
  "layered": {
    "source": {
      "concat": [
        "terrain",
        "trees"
      ]
    },
    "unique": true
  },
  "cabinPbr": {
    "source": {
      "pbr": [
        "/assets/pine-hollow/tex/wood_trunk_wall",
        "/assets/pine-hollow/tex/wood_planks_grey",
        "/assets/pine-hollow/tex/wood_planks_dirt",
        "/assets/pine-hollow/tex/rough_pine_door",
        "/assets/pine-hollow/tex/stone_wall",
        "/assets/pine-hollow/tex/pine_bark"
      ]
    }
  },
  "cabinGltf": {
    "source": {
      "urls": [
        "/assets/pine-hollow/models/stone_fire_pit/stone_fire_pit.gltf",
        "/assets/pine-hollow/models/stone_fire_pit/stone_fire_pit.bin",
        "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_diff_1k.jpg",
        "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_nor_gl_1k.jpg",
        "/assets/pine-hollow/models/stone_fire_pit/textures/stone_fire_pit_arm_1k.jpg",
        "/assets/pine-hollow/models/wooden_crate_02/wooden_crate_02.gltf",
        "/assets/pine-hollow/models/wooden_crate_02/wooden_crate_02.bin",
        "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_diff_1k.jpg",
        "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_nor_gl_1k.jpg",
        "/assets/pine-hollow/models/wooden_crate_02/textures/wooden_crate_02_arm_1k.jpg",
        "/assets/pine-hollow/models/wine_barrel_01/wine_barrel_01.gltf",
        "/assets/pine-hollow/models/wine_barrel_01/wine_barrel_01.bin",
        "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_diff_1k.jpg",
        "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_nor_gl_1k.jpg",
        "/assets/pine-hollow/models/wine_barrel_01/textures/wine_barrel_01_arm_1k.jpg",
        "/assets/pine-hollow/models/wooden_bucket_01/wooden_bucket_01.gltf",
        "/assets/pine-hollow/models/wooden_bucket_01/wooden_bucket_01.bin",
        "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_diff_1k.jpg",
        "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_nor_gl_1k.jpg",
        "/assets/pine-hollow/models/wooden_bucket_01/textures/wooden_bucket_01_arm_1k.jpg",
        "/assets/pine-hollow/models/hatchet/hatchet.gltf",
        "/assets/pine-hollow/models/hatchet/hatchet.bin",
        "/assets/pine-hollow/models/hatchet/textures/hatchet_diff_1k.jpg",
        "/assets/pine-hollow/models/hatchet/textures/hatchet_nor_gl_1k.jpg",
        "/assets/pine-hollow/models/hatchet/textures/hatchet_arm_1k.jpg"
      ]
    }
  },
  "lantern": {
    "source": {
      "urls": [
        PINE_BOOT_ASSET_3
      ]
    }
  },
  "cabins": {
    "source": {
      "concat": [
        "cabinPbr",
        "cabinGltf",
        "lantern"
      ]
    },
    "unique": true,
    "map": [
      "gpu"
    ],
    "except": "layered"
  },
  "rocks": {
    "source": {
      "urls": [
        PINE_BOOT_ASSET_4,
        PINE_BOOT_ASSET_5,
        PINE_BOOT_ASSET_6
      ]
    },
    "unique": true
  },
  // Quest NPC appearances are demand-loaded by their figure: near figures before control, off-view figures afterward.
  "world": {
    "source": {
      "urls": {
        "phone": [
          "/assets/pine-hollow/horizon/pine-hollow-day-phone.webp",
          "/assets/pine-hollow/horizon/pine-hollow-night-phone.webp",
          PINE_BOOT_ASSET_7,
          PINE_BOOT_ASSET_8,
          ...painted.urls,
          "/assets/pine-hollow/baked/rain.phone.bin"
        ],
        "desktop": [
          "/assets/pine-hollow/horizon/pine-hollow-day-phone.webp",
          "/assets/pine-hollow/horizon/pine-hollow-night-phone.webp",
          PINE_BOOT_ASSET_7,
          PINE_BOOT_ASSET_8,
          ...painted.urls,
          "/assets/pine-hollow/baked/rain.bin"
        ]
      }
    },
    "map": [
      "gpu"
    ],
    "present": true
  },
  "heroes": {
    "source": {
      "urls": [
        "/assets/pine-hollow/models/pine-hollow-hero/stone-a/stone-a.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/stone-a-lod1/stone-a-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/stone-b/stone-b.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/stone-b-lod1/stone-b-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/stone-c/stone-c.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/stone-c-lod1/stone-c-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/waystone/waystone.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/waystone-lod1/waystone-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/contract-board/contract-board.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/contract-board-lod1/contract-board-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/cave-arch/cave-arch.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/cave-arch-lod1/cave-arch-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/beaver-dam/beaver-dam.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/beaver-dam-lod1/beaver-dam-lod1.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/canoe/canoe.glb",
        "/assets/pine-hollow/models/pine-hollow-hero/canoe-lod1/canoe-lod1.glb",
        "/assets/pine-hollow/tex/mossy_rock/diffuse.jpg",
        "/assets/pine-hollow/tex/mossy_rock/nor_gl.jpg",
        "/assets/pine-hollow/tex/mossy_rock/arm.jpg"
      ]
    },
    "present": true
  },
  "propBase": {
    "source": {
      "concat": [
        "world",
        "rocks",
        "heroes"
      ]
    },
    "map": [
      "gpu"
    ],
    "aliases": "props"
  },
  "coats": {
    "source": {
      "tablePrefix": "procedural:/assets/pine-hollow/creatures/"
    }
  },
  "viewmodels": {
    "source": {
      "tablePrefix": "procedural:/assets/pine-hollow/baked/viewmodel/"
    }
  },
  "props": {
    "source": {
      "concat": [
        "propBase",
        "coats",
        "viewmodels"
      ]
    }
  },
  "nav": {
    "source": {
      "urls": [
        PINE_BOOT_ASSET_12
      ]
    },
    "present": true
  },
  "rapier": {
    "source": {
      "urls": [
        PINE_BOOT_ASSET_13
      ]
    }
  },
  "physics": {
    "source": {
      "concat": [
        "rapier",
        "nav"
      ]
    }
  }
} as const;
export const PINE_BOOT_SOURCES = {
  "sky": "sky",
  "baked": "baked",
  "terrain": "terrain",
  "trees": "trees",
  "physics": "physics",
  "cabins": "cabins",
  "props": "props",
  "art": "empty",
  "music": "empty",
  "sfx": "empty"
} as const;
