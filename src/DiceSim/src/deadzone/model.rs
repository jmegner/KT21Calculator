use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[allow(non_snake_case, dead_code)]
pub struct Model {
    pub hp: i32,
    #[wasm_bindgen(js_name = numDice)]
    pub numDice: i32,
    pub diceStat: i32,
    pub numRerolls: i32,
    pub ap: i32,
    pub armor: i32,
    pub numShieldDice: i32,
    pub toxicDmg: i32, // additional dmg if any dmg goes through; "Dismantle" is basically toxic 1 against vehicles
}

#[wasm_bindgen]
impl Model {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Model {
        Model {
            hp: 2,
            numDice: 3,
            diceStat: 5,
            numRerolls: 0,
            ap: 0,
            armor: 0,
            numShieldDice: 0,
            toxicDmg: 0,
        }
    }
}
