import React from 'react';
import TextField from '@material-ui/core/TextField';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog/Dialog';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';

import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

import { NetPyNEField, NetPyNETextField } from 'netpyne/components';
import Utils from '../../../Utils';
import Select from '../../general/Select';

const styles = ({ spacing }) => ({ selectField: { marginTop: spacing(3) } });
class NetPyNESynapse extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      currentName: props.name,
      synMechMod: 'Exp2Syn',
      errorMessage: undefined,
      errorDetails: undefined,
    };
    this.synMechModOptions = [{ mod: 'Exp2Syn' }, { mod: 'ExpSyn' }];
    this.handleSynMechModChange = this.handleSynMechModChange.bind(this);
  }

  UNSAFE_componentWillReceiveProps (nextProps) {
    if (this.state.currentName != nextProps.name) {
      this.setState({ currentName: nextProps.name, synMechMod: '' });
    }
  }

  handleRenameChange = (event) => {
    const storedValue = this.props.name;
    const newValue = Utils.nameValidation(event.target.value);
    const updateCondition = this.props.renameHandler(newValue);
    const triggerCondition = Utils.handleUpdate(
      updateCondition,
      newValue,
      event.target.value,
      this,
      'Synapses',
    );

    if (triggerCondition) {
      this.triggerUpdate(() => {
        // Rename the population in Python
        Utils.renameKey(
          'netParams.synMechParams',
          storedValue,
          newValue,
          (response, newValue) => {
            this.renaming = false;
            this.props.updateCards();
          },
        );
        this.renaming = true;
        /*
         * Update layout has been inserted in the triggerUpdate since this will have to query the backend
         * So we need to delay this along with the rename, differently we will face a key issue with netpyne
         */
        this.updateLayout();
      });
    }
  };

  triggerUpdate (updateMethod) {
    // common strategy when triggering processing of a value change, delay it, every time there is a change we reset
    if (this.updateTimer != undefined) {
      clearTimeout(this.updateTimer);
    }
    this.updateTimer = setTimeout(updateMethod, 1000);
  }

  componentDidMount () {
    this.__mounter = true;
    this.updateLayout();
  }

  componentWillUnmount () {
    this.__mounter = false;
  }

  updateLayout () {
    Utils.evalPythonMessage(
      `[value == netpyne_geppetto.netParams.synMechParams['${
        this.state.currentName
      }']['mod'] for value in ['ExpSyn', 'Exp2Syn']]`,
    ).then((response) => {
      if (this.__mounter) {
        if (response[0]) {
          this.setState({ synMechMod: 'ExpSyn' });
        } else if (response[1]) {
          this.setState({ synMechMod: 'Exp2Syn' });
        } else {
          this.setState({ synMechMod: 'Exp2Syn' });
        }
      }
    });
  }

  handleSynMechModChange (event) {
    const { value } = event.target;
    Utils.execPythonMessage(
      `netpyne_geppetto.netParams.synMechParams['${
        this.state.currentName
      }']['mod'] = '${
        value
      }'`,
    );
    this.setState({ synMechMod: value });
  }

  render () {
    const { classes } = this.props;
    const dialogPop = this.state.errorMessage != undefined ? (
      <Dialog open style={{ whiteSpace: 'pre-wrap' }}>
        <DialogTitle id="alert-dialog-title">
          {this.state.errorMessage}
        </DialogTitle>
        <DialogContent style={{ overflow: 'auto' }}>
          <DialogContentText id="alert-dialog-description">
            {this.state.errorDetails}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            onClick={() => this.setState({
              errorMessage: undefined,
              errorDetails: undefined,
            })}
          >
            BACK
          </Button>
        </DialogActions>
      </Dialog>
    ) : undefined;

    if (this.state.synMechMod == '' || this.state.synMechMod == undefined) {
      var content = <div />;
    } else {
      var content = (
        <div>
          <NetPyNEField id="netParams.synMechParams.tau1">
            <NetPyNETextField
              variant="filled"
              fullWidth
              model={
                `netParams.synMechParams['${this.props.name}']['tau1']`
              }
            />
          </NetPyNEField>

          {this.state.synMechMod == 'Exp2Syn' ? (
            <div>
              <NetPyNEField id="netParams.synMechParams.tau2">
                <NetPyNETextField
                  fullWidth
                  variant="filled"
                  model={
                    `netParams.synMechParams['${this.props.name}']['tau2']`
                  }
                />
              </NetPyNEField>
            </div>
          ) : null}

          <NetPyNEField id="netParams.synMechParams.e">
            <NetPyNETextField
              variant="filled"
              fullWidth
              model={`netParams.synMechParams['${this.props.name}']['e']`}
            />
          </NetPyNEField>
        </div>
      );
    }

    return (
      <Box className="scrollbar scrollchild" mt={1}>
        <Box mb={1}>
          <TextField
            fullWidth
            variant="filled"
            onChange={this.handleRenameChange}
            value={this.state.currentName}
            disabled={this.renaming}
            label="The name of the synapse"
          />
        </Box>

        <NetPyNEField
          id="netParams.synMechParams.mod"
          className={classes.selectField}
        >
          <Select
            id="synapseModSelect"
            value={this.state.synMechMod}
            onChange={this.handleSynMechModChange}
          />
        </NetPyNEField>
        {content}
        {dialogPop}
      </Box>
    );
  }
}

export default withStyles(styles)(NetPyNESynapse);
