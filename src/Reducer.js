import {PRENOTA,SELEZIONADATA} from "./Actions";

export const initialState = {
    dataselezionata : null,
    stanza1: {prenotazioni: []},
    stanza2: {prenotazioni: []},
    stanza3: {prenotazioni: []},
    stanza4: {prenotazioni: []},
    stanza5: {prenotazioni: []}
}

export function reducer(state,action){
    switch(action.type){
        case SELEZIONADATA:
            return {
                ...state, dataselezionata : action.data
            };

        case PRENOTA: 
        let newPrenotazioni = state['stanza'+action.data.sala].prenotazioni;
        newPrenotazioni.push(action.data);
        return{
            ...state,
            ['stanza'+action.data.sala] : {
                prenotazioni: newPrenotazioni
            }
        }
        default: return state;
    }
}

