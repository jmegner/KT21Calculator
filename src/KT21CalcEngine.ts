import Die from "./Die";

export enum DieResult {
    Fail,
    Normal,
    Crit,
}

export enum Ability {
    None,
    Balanced, // reroll 1 die; also used for Extended Chitin during defense
    Ceaseless, // reroll all 1s
    Relentless, // reroll any of your choosing
    Rending, // if have crit, promote one normal hit to crit
    CritPromotesOneFailToNormal, // Necron 'starfire core' equipment
}

interface AttackOptions {
    numDice: number, // 'attacks'
    bs: number,
    normalDamage: number,
    critDamage: number,
    mwx: number,
    apx: number, // must be 0 if no APx
    px: number, // must be 0 if no Px
    lethalX: number,
    abilities: Ability[],
}

interface DefenderOptions {
    save: number, // like bs but for defense
    numDice: number, // 'defense'
    wounds: number,
    fnp: number,
    invulnSave: number,
    cover: boolean,
    abilities: Ability[],
}

export function analyzeScenario(attacker: AttackOptions, defender: DefenderOptions) {
    // phase1: loop over all possible outcomes of all die and print the propabilities
    // we are not looping over die roll of {1,3,3,4,6}; we are looping over {2 normal hits, 1 crit hit, 2 normal saves}
    // phase2: group results by final outcome {2 normal damaging hits}

    // "chit" is critical hit; "nhit" is normal hit; 'csave' is critical save, etc
    for(let chits = 0; chits <= attacker.numDice; chits++) {
        for (let nhits = 0; nhits <= attacker.numDice - chits; nhits++) {
            let numDefDice = defender.numDice;

            if(!Die.Valid(defender.invulnSave)) {
                const numDefDiceAfterAp = defender.numDice - attacker.apx;
                const numDefDiceAfterP = (chits > 0
                    ? defender.numDice - attacker.px
                    : defender.numDice);
                numDefDice = Math.min(numDefDiceAfterAp, numDefDiceAfterP);
            }

            for(let csaves = 0; csaves <= numDefDice; csaves++) {
                for (let nsaves = 0; nsaves <= numDefDice - csaves; nsaves++) {
                    calcOutcomeProbability(attacker, defender, chits, nhits, csaves, nsaves, numDefDice);
                }
            }

        }
    }
}

function calcOutcomeProbability(
    attacker: AttackOptions,
    defender: DefenderOptions,
    chits: number,
    nhits: number,
    csaves: number,
    nsaves: number,
    numDefDice: number
)
{
    // inputs are interpreted as BEFORE special rules like Balanced (complicated) or Rending (transforms one die outcome into another)
    // 
    // TODO: take into account ceaseless, relentless

}