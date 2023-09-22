

export type coll_data = Map<number|string, (string|number)[]>
export type assoc_data = {
    associations: Map<number, string> // using associated symbols requires tracking which symbols are associated
    symbols: Set<string>
    data: coll_data // associated symbols are added when formatting
} 

// data is an array of maps, one for each sequence, with keys as phases and values as a max message
// each map is written to a line as `${linecount: number} "id ${index}"`
export type seq_data = Map<number, string|number>[] 