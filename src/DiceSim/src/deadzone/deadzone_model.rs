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
    #[wasm_bindgen(js_name = toxicDmg)]
    pub toxic_dmg: i32, // additional dmg if any dmg goes through; "Dismantle" is basically toxic 1 against vehicles
    #[wasm_bindgen(js_name = explodeStat)]
    pub explode_stat: i32, // explode on this value or higher
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
            toxic_dmg: 0,
        }
    }
}
