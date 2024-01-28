use wasm_bindgen::prelude::*;

#[wasm_bindgen]
pub struct DeadzoneOptions {
    #[wasm_bindgen(js_name = numSimulations)]
    pub num_simulations: i32,
    #[wasm_bindgen(js_name = numRounds)]
    pub num_rounds: i32,
    #[wasm_bindgen(js_name = attackerCanBeDamaged)]
    pub attacker_can_be_damaged: bool,
    #[wasm_bindgen(js_name = explodingDiceMaxLevels)]
    pub exploding_dice_max_levels: i32,
}

#[wasm_bindgen]
impl DeadzoneOptions {
    #[wasm_bindgen(constructor)]
    pub fn new() -> DeadzoneOptions {
        DeadzoneOptions {
            num_simulations: 100,
            num_rounds: 1,
            attacker_can_be_damaged: false,
            exploding_dice_max_levels: i32::MAX,
        }
    }
}
