

export type ctrlStages = { 'system', 'interaction', 'interpretation', 'complete'}
export type ctrlStage = keyof ctrlStages
export type systemStages = { 'cycle', 'production', 'mapping'}
export type systemStage = keyof systemStages
export type statuses = {'active', 'waiting', 'complete', 'error'}
export type status = keyof statuses
export type hookStages = { "pre", "post" /*, "per" */ }
export type hookStage = keyof hookStages 
// storeData means objects will store data in memory and streams will push data to the stream, then post the 'ready' message when done
// startNew means a new filepath and a new handler Object instance. objects with stored data will write it to the current filepath first
// allDone means that the thread will exit on completion, objects will write any stored data will write it to the current filepath,
// startAndFinish means that a new file is opened, AND it is the last file
export type InterpreterActions = {'startNew', 'storeData', 'allDone', 'startAndFinish'};
export type InterpreterAction = keyof InterpreterActions;