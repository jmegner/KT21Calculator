use wasm_bindgen::prelude::*;

#[wasm_bindgen]
extern "C" {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello from DiceSim.");
}

#[wasm_bindgen]
pub fn get_a_number() -> i32 {
    3
}

#[wasm_bindgen]
pub struct WasmFiddleStruct {
    pub x: i32,
}

#[wasm_bindgen]
pub struct DeadzoneModel {
    hp: i32,
    numDice: i32,
    diceStat: i32,
    numRerolls: i32,
    ap: i32,
    armor: i32,
    numShieldDice: i32,
    toxicDmg: i32, // additional dmg if any dmg goes through; "Dismantle" is basically toxic 1 against vehicles
}
