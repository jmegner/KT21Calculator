use wasm_bindgen::prelude::*;

#[wasm_bindgen]
#[allow(non_snake_case, dead_code)]
pub struct Options {
    pub numSimulations: i32,
    pub numRounds: i32,
    pub attackerCanBeDamaged: bool,
}

#[wasm_bindgen]
impl Options {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Options {
        Options {
            numSimulations: 100,
            numRounds: 1,
            attackerCanBeDamaged: false,
        }
    }
}
