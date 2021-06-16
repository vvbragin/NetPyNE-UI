import copy
import dataclasses
import datetime
import json
import logging
import shutil
import pathlib
import os

import numpy as np
from typing import List
from dacite import from_dict
from netpyne.batch import Batch

from netpyne_ui import utils
from netpyne_ui import constants
from netpyne_ui import model

SIM_CONFIG_FILE = "simConfig.json"
NET_PARAMS_FILE = "netParams.json"
BATCH_CONFIG_FILE = "batchConfig.json"


class ExperimentsError(Exception):
    pass


def get_experiments() -> List[dict]:
    # Only update Experiments stored on filesystem
    stored_experiments = _scan_experiments_directory()
    model.experiments = [
        e for e in model.experiments if
        e.state in model.ExperimentState.DESIGN
    ]
    model.experiments.extend(stored_experiments)

    return [dataclasses.asdict(e) for e in model.experiments]


def add_experiment(experiment: dict):
    exp = from_dict(model.Experiment, experiment)
    _add_experiment(exp)


def get_experiment(name: str) -> dict:
    exp = _get_by_name(name)
    return dataclasses.asdict(exp) if exp else None


def remove_experiment(name: str):
    experiment = _get_by_name(name)
    if experiment:
        _delete_experiment_folder(experiment)
        model.experiments.remove(experiment)


def edit_experiment(name: str, experiment: dict):
    exp = _get_by_name(name)
    if exp.state != model.ExperimentState.DESIGN:
        raise ExperimentsError(f"Can only edit experiment in f{model.ExperimentState.DESIGN} state")
    if not exp:
        raise ExperimentsError(f"Experiment with name {name} does not exist")

    updated_exp = from_dict(model.Experiment, experiment)
    model.experiments.remove(exp)
    _add_experiment(updated_exp)


def replace_current_with(name: str):
    exp = _get_by_name(name)
    if not exp:
        raise ExperimentsError(f"Experiment with name {name} does not exist")

    next_name = utils.get_next_file_name(constants.EXPERIMENTS_FOLDER_PATH, name)
    new_exp = model.Experiment(
        name=next_name,
        state=model.ExperimentState.DESIGN,
        params=exp.params,
        seed=exp.seed,
        initConfig=exp.initConfig,
        method=exp.method
    )

    current = get_current()
    if current:
        remove_experiment(current.name)

    _add_experiment(new_exp)
    return


def get_current() -> model.Experiment:
    return next(
        (exp for exp in model.experiments if exp.state == model.ExperimentState.DESIGN),
        None
    )


def get_model_specification(name: str, trial: str) -> dict:
    """ Returns JSON representation of the netParams & simConfig of the requested trial.

    :param name: the experiment name.
    :param trial: the trial identifier.
    :return: dict
    """
    file = get_trial_output_file(name, trial)
    if not os.path.exists(file):
        raise ExperimentsError(f"Trial specification file {file} not found")

    with open(file, 'r') as f:
        trial_output = json.load(f)
        return {
            'net': {
                'params': trial_output['net']['params']
            },
            'simConfig': trial_output['simConfig']
        }


def get_trial_output_file(experiment_name: str, trial: str):
    path = os.path.join(constants.EXPERIMENTS_FOLDER_PATH, experiment_name)
    # TODO: find output filename for trial based on parameter idx combination

    # pattern: expName_(idx_)*idx.json
    output_file = f"{experiment_name}_0.json"
    output_file_path = os.path.join(path, output_file)
    return output_file_path


def _add_experiment(experiment: model.Experiment):
    if _get_by_name(experiment.name):
        raise ExperimentsError(f"Experiment {experiment.name} already exists")

    experiment.trials = _create_trials(experiment)
    model.experiments.append(experiment)


def _get_by_name(name: str) -> model.Experiment:
    experiment = next((e for e in model.experiments if e.name == name), None)
    return experiment


def _scan_experiments_directory() -> List[model.Experiment]:
    if not pathlib.Path(constants.EXPERIMENTS_FOLDER_PATH).exists():
        return []

    dirs = list([
        f for f in os.listdir(constants.EXPERIMENTS_FOLDER_PATH)
        if os.path.isdir(os.path.join(constants.EXPERIMENTS_FOLDER_PATH, f))
    ])

    experiments = []
    for directory in dirs:
        try:
            experiment = _parse_experiment(directory)
        except ExperimentsError:
            logging.exception(f"Failed to parse experiment {directory}")
        else:
            experiments.append(experiment)

    return experiments


def _parse_experiment(directory: str) -> model.Experiment:
    """ Finds and parses Experiments stored in `directory` on the disk.

    We expect the following files to be present:
        * batchConfig.json (Experiment model and run config)
        * netParams.json
        * simConfig.json
        * json file for each trial in case of batch
        * output files for each trial (if available)

    :raises ExperimentsError
    """
    path = os.path.join(constants.NETPYNE_WORKDIR_PATH, constants.EXPERIMENTS_FOLDER, directory)

    try:
        with open(os.path.join(path, BATCH_CONFIG_FILE), 'r') as f:
            batch_config = json.load(f)
    except IOError:
        raise ExperimentsError("Could not find batchConfig.json")

    with open(os.path.join(path, NET_PARAMS_FILE), 'r') as f:
        net_params = json.load(f)

    with open(os.path.join(path, SIM_CONFIG_FILE), 'r') as f:
        sim_config = json.load(f)

    run_cfg = batch_config['runCfg']
    del batch_config['runCfg']

    # Convert timestamp to datetime
    batch_config['timestamp'] = datetime.datetime.fromisoformat(batch_config['timestamp'])

    experiment = from_dict(model.Experiment, batch_config)
    experiment.folder = directory
    return experiment


def _delete_experiment_folder(experiment: model.Experiment):
    """ Recursively deletes the associated experiment folder. """

    def onerror(func, path, exc_info):
        # TODO: error handling
        pass

    if experiment.folder:
        path = os.path.join(constants.NETPYNE_WORKDIR_PATH, constants.EXPERIMENTS_FOLDER, experiment.folder)
        shutil.rmtree(path, onerror=onerror)
    
def _create_trials(experiment: model.Experiment) -> List[model.Trial]:
    # TODO: generalize logic! Similar to _prepare_batch_files
    params = copy.deepcopy(experiment.params)
    params = [p for p in params if p.mapsTo != '']
    for param in params:
        if param.type == "range":
            param.values = list(np.arange(param.min, param.max, param.step))
        elif param.type == "list":
            # TODO: need to enforce correct type for each parameter
            #   e.g. numCells with 10.0 fails because it requires int not float
            param.values = [int(e) for e in param.values]

    params_dict = {}
    grouped_params = []
    for p in params:
        params_dict[p.mapsTo] = p.values
        if param.inGroup:
            grouped_params.append(param.mapsTo)

    batch = Batch(params=params_dict, groupedParams=grouped_params)
    batch.method = 'grid'
    # TODO: set batchLabel, saveFolder

    # { indices, values, labels, filenames}
    # values are the combinations!
    combinations = batch.getParamCombinations()
    
    trials = []
    for idx, value in enumerate(combinations['values']):
        # idx is used to access 'indices' entry
        params = [{ combinations['labels'][idx]: v for idx, v in enumerate(value)}]
        # TODO: store indices and filename pattern!
        trials.append(model.Trial(params=params))

    return trials