// Action Types
export const UPDATE_CARDS = 'UPDATE_CARDS';
export const MODEL_LOADED = 'MODEL_LOADED';
export const SHOW_NETWORK = 'SHOW_NETWORK';
export const CREATE_NETWORK = 'CREATE_NETWORK';
export const CREATE_SIMULATE_NETWORK = 'CREATE_SIMULATE_NETWORK';
export const SIMULATE_NETWORK = 'SIMULATE_NETWORK';
export const EDIT_MODEL = 'EDIT_MODEL';
export const PYTHON_CALL = 'PYTHON_CALL'
export const DELETE_NETPARAMS_OBJ = 'DELETE_NETPARAMS_OBJ'
// Actions
export const updateCards = { type: UPDATE_CARDS };

export const modelLoaded = { type: MODEL_LOADED };

export const createNetwork = { type: CREATE_NETWORK };
export const createAndSimulateNetwork = { type: CREATE_SIMULATE_NETWORK };
export const simulateNetwork = { type: SIMULATE_NETWORK };
export const showNetwork = { type: SHOW_NETWORK };

export const editModel = { type: EDIT_MODEL };

export const pythonCall = (cmd, args) => ({ type: PYTHON_CALL, cmd, args })

export const deleteNetParamsObj = payload => ({ type: DELETE_NETPARAMS_OBJ, payload })