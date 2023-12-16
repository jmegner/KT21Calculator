use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[allow(non_snake_case, dead_code)]
pub struct Options {
    #[wasm_bindgen(js_name = numSimulations)]
    pub num_simulations: i32,
    #[wasm_bindgen(js_name = numRounds)]
    pub num_rounds: i32,
    #[wasm_bindgen(js_name = attackerCanBeDamaged)]
    pub attacker_can_be_damaged: bool,
}

#[wasm_bindgen]
impl Options {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Options {
        Options {
            num_simulations: 100,
            num_rounds: 1,
            attacker_can_be_damaged: false,
        }
    }
}
