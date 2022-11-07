export const PRENOTA = 'prenota'
export const SELEZIONADATA = 'selezionadata'

export function prenota(data){
    return{type: PRENOTA,data}
}

export function selezionadata(data){
    return{type: SELEZIONADATA, data}
}