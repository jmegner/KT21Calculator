use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[allow(/*non_snake_case,*/ dead_code,)]
pub struct Model {
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
}

#[wasm_bindgen]
impl Model {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Model {
        Model {
            hp: 2,
            num_dice: 3,
            dice_stat: 5,
            num_rerolls: 0,
            ap: 0,
            armor: 0,
            num_shield_dice: 0,
            toxic_dmg: 0,
        }
    }
}
