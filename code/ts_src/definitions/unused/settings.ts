
interface ProcessProtocol {
    threadSystems?: boolean // default false
    threadInteractions?: boolean // default false
    maxInterpreterThreads?: number // default 4 
    
    systemDataFiles?: boolean // default false -> writes and reads system data from disk instead of memory 
    auto?: boolean // default true -> generate steps automatically until generations reached - false means ("step", number) messages must be sent to progress the system
    // abort process, delete erring system and its linked interactions/interpretations, or ignore
    errorhandling?: 'abort'|'delete'|'ignore'   
}