export const VIEW_EXPERIMENT = 'VIEW_EXPERIMENT';
export const GET_EXPERIMENTS = 'GET_EXPERIMENTS';
export const SET_EXPERIMENTS = 'SET_EXPERIMENTS';

export const REMOVE_EXPERIMENT = 'REMOVE_EXPERIMENT';
export const RESET_EXPERIMENT = 'RESET_EXPERIMENT';
export const VIEW_TRIAL_AS_JSON = 'VIEW_AS_JSON';
export const FILTER_TRIALS = 'FILTER_TRIALS';

/**
 * Resets configuration of current Experiment.
 * User can start now with a new Experiment.
 */
export const resetCurrentExperiment = () => ({
  type: RESET_EXPERIMENT,
});

/**
 * Delete experiment with its content.
 */
export const removeExperiment = (name) => ({
  type: REMOVE_EXPERIMENT,
  payload: name,
});

export const getExperiments = () => ({ type: GET_EXPERIMENTS });

/**
 * Modify an existing experiment.
 */
export const editExperiment = () => {
};

/**
 * Set fetched experiments.
 */
export const setExperiments = (payload) => ({
  type: SET_EXPERIMENTS,
  payload,
});

/**
 * Opens detail view of selected Experiment.
 */
export const viewExperiment = (payload) => ({
  type: VIEW_EXPERIMENT,
  payload,
});

/**
 * Replaces current experiment with selected trial.
 */
export const loadTrial = () => {

};

/**
 * Opens Model>Explore view and loads results of selected trial.
 */
export const viewTrialResults = () => {

};

/**
 * Replaces current model specification with selected one.
 */
export const loadModelSpecification = () => {

};

export const viewAsJson = (payload) => ({
  type: VIEW_TRIAL_AS_JSON,
  payload,
});

export const filterTrials = (payload) => ({
  type: FILTER_TRIALS,
  payload,
});
