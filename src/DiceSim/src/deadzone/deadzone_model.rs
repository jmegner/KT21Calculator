use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DeadzoneModel {
    pub hp: i32,
    #[wasm_bindgen(js_name = numDice)]
    pub num_dice: i32,
    #[wasm_bindgen(js_name = diceStat)]
    pub dice_stat: i32,
    #[wasm_bindgen(js_name = numRerolls)]
    pub num_rerolls: i32,
    pub ap: i32,
    pub armor: i32,
    #[wasm_bindgen(js_name = numShieldDice)]
    pub num_shield_dice: i32,
    // Halo Flashpoint only: charged shields absorb hits automatically and deplete.
    #[wasm_bindgen(js_name = energyShields)]
    pub energy_shields: i32,
    // Halo Flashpoint only: ESD depletes shields before the incoming hits are blocked.
    #[wasm_bindgen(js_name = shieldDepleter)]
    pub shield_depleter: i32,
    #[wasm_bindgen(js_name = toxicDmg)]
    pub toxic_dmg: i32, // additional dmg if any dmg goes through; also Halo Flashpoint's Lethal (n)
    #[wasm_bindgen(js_name = explodeStat)]
    pub explode_stat: i32, // explode on this value or higher
    // Halo Flashpoint only: enabled modifiers applied without changing base stats.
    pub optics: bool,
    #[wasm_bindgen(js_name = sniperScope)]
    pub sniper_scope: bool,
    pub guarded: bool,
}

#[wasm_bindgen]
impl DeadzoneModel {
    #[wasm_bindgen(constructor)]
    pub fn new() -> DeadzoneModel {
        DeadzoneModel {
            hp: 2,
            num_dice: 3,
            dice_stat: 5,
            explode_stat: 8,
            num_rerolls: 0,
            ap: 0,
            armor: 0,
            num_shield_dice: 0,
            energy_shields: 0,
            shield_depleter: 0,
            toxic_dmg: 0,
            optics: false,
            sniper_scope: false,
            guarded: false,
        }
    }
}
