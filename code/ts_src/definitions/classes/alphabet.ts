export interface LetterCodes {
    display: number[],  // these are the codes used for display purposes (in a vscode text file)
    regex: number[] // these are the codes used in the regular expression 
    ascii: number [] // these are the codes used for spelled outputs in a max.text object (ASCII only) 
}
export type Codex = {
    core: number;
    ascii: string,
    grapheme?: number[]
}
export type wordTypes = { 
    letters?: string 
    codes?: number[] 
    indices?: number[] 
}