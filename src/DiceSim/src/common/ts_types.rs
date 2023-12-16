#[allow(non_snake_case)]
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tsify::Tsify;
use wasm_bindgen::JsValue;

// unfortunately, the following shows up in the generated dice_sim.d.ts as `Record<number, number>`
// and we need https://github.com/madonoharu/tsify/pull/31 to get merged to get Map<number, number> instead
#[derive(Tsify, Serialize, Deserialize)]
#[tsify(into_wasm_abi, from_wasm_abi)]
pub struct ProbMap(pub HashMap<i32, f64>);

pub trait ToJsMap {
    fn to_js_map(&self) -> js_sys::Map;
}

impl<KeyType, ValType> ToJsMap for HashMap<KeyType, ValType>
where
    JsValue: From<KeyType> + From<ValType>,
    KeyType: Copy,
    ValType: Copy,
{
    fn to_js_map(&self) -> js_sys::Map {
        let js_map = js_sys::Map::new();
        for (key, val) in self.iter() {
            js_map.set(&JsValue::from(*key), &JsValue::from(*val));
        }
        js_map
    }
}
