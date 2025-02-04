import React from 'react';
import TextField from '@material-ui/core/TextField';

import Icon from '@material-ui/core/Icon';
import { withStyles } from '@material-ui/core/styles';
import { ActionDialog, Tooltip } from 'netpyne/components';
import Box from '@material-ui/core/Box';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import NetPyNEField from '../../general/NetPyNEField';
import FileBrowser from '../../general/FileBrowser';
import ListComponent from '../../general/List';
import Checkbox from '../../general/Checkbox';

const styles = ({
  spacing,
  typography,
  zIndex,
}) => ({
  container: {
    marginTop: spacing(2),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'flex-end',
    width: '103%',
  },
  icon: {
    '&:hover': { backgroundColor: 'inherit' },
    flex: '0 0 4%',
    marginRight: spacing(2),
    width: typography.h3.fontSize,
    height: typography.h3.fontSize,
    padding: '0px!important',
    zIndex: zIndex.modal,
  },
  textField: { alignItems: 'center' },
  root: { overflow: 'hidden' },
});

class ImportCellParams extends React.Component {
  constructor (props) {
    super(props);
    this.state = {
      label: props.cellRuleName,
      fileName: '',
      cellName: '',
      modFolder: '',
      compileMod: false,
      importSynMechs: false,
      explorerDialogOpen: false,
      exploreOnlyDirs: false,
    };
  }

  updateCheck (name) {
    this.setState(({ [name]: pv }) => ({ [name]: !pv }));
  }

  showExplorerDialog (explorerParameter, exploreOnlyDirs) {
    this.setState({
      explorerDialogOpen: true,
      explorerParameter,
      exploreOnlyDirs,
    });
  }

  closeExplorerDialog (fieldValue) {
    const newState = { explorerDialogOpen: false };
    if (fieldValue) {
      switch (this.state.explorerParameter) {
        case 'fileName':
          newState.fileName = fieldValue.path;
          break;
        case 'modFolder':
          newState.modFolder = fieldValue.path;
          break;
        default:
          throw Error('Not a valid parameter!');
      }
    }
    this.setState(newState);
  }

  render () {
    const { classes } = this.props;
    const cellArgs = this.refs.cellArgs ? this.refs.cellArgs.state.children : {};
    const {
      label,
      fileName,
      cellName,
      modFolder,
      importSynMechs,
      compileMod,
      explorerDialogOpen,
      exploreOnlyDirs,
    } = this.state;

    return (
      <ActionDialog
        buttonLabel="Import"
        message="LOADING TEMPLATE"
        title="Import cell template (.py or .hoc)"
        command="netpyne_geppetto.importCellTemplate"
        args={{
          cellArgs,
          fileName,
          cellName,
          label,
          modFolder,
          importSynMechs,
          compileMod,
        }}
        {...this.props}
      >
        <Box mb={1}>
          <TextField
            variant="filled"
            value={label}
            fullWidth
            label="Cell rule label"
            onChange={(event) => this.setState({ label: event.target.value })}
          />
        </Box>

        <NetPyNEField id="netParams.importCellParams.cellName" className={classes.textField}>
          <TextField
            variant="filled"
            fullWidth
            value={cellName}
            onChange={(event) => this.setState({ cellName: event.target.value })}
          />
        </NetPyNEField>

        <NetPyNEField id="netParams.importCellParams.fileName">
          <TextField
            variant="filled"
            fullWidth
            value={fileName}
            onChange={(event) => this.setState({ fileName: event.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="File explorer" placement="top">
                    <Icon
                      className="fa fa-folder hovered"
                      onClick={() => this.showExplorerDialog('fileName', false)}
                      style={{ cursor: 'pointer' }}
                    />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </NetPyNEField>

        <NetPyNEField id="netParams.importCellParams.modFolder">
          <TextField
            fullWidth
            variant="filled"
            value={modFolder}
            onChange={(event) => this.setState({ modFolder: event.target.value })}
            helperText="Important: if external mod files are required please select the mod folder path"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Tooltip title="File explorer" placement="top">
                    <Icon
                      className="fa fa-folder hovered"
                      onClick={() => this.showExplorerDialog('modFolder', true)}
                      style={{ cursor: 'pointer' }}
                    />
                  </Tooltip>
                </InputAdornment>
              ),
            }}
          />
        </NetPyNEField>

        <ListComponent
          id="cellArgs"
          realType="dict"
          label="argument as key:value"
          floatingLabelText="Cell Template Parameters (key:value pair)"
          ref="cellArgs"
        />

        <Grid container spacing={1}>
          <Grid item>
            <NetPyNEField id="netParams.importCellParams.importSynMechs">
              <Checkbox
                fullWidth
                noBackground
                checked={importSynMechs}
                onChange={() => this.updateCheck('importSynMechs')}
              />
            </NetPyNEField>
          </Grid>
          <Grid item>
            <NetPyNEField id="netParams.importCellParams.compileMod">
              <Checkbox
                fullWidth
                noBackground
                checked={compileMod}
                onChange={() => this.updateCheck('compileMod')}
              />
            </NetPyNEField>
          </Grid>
        </Grid>

        <FileBrowser
          open={explorerDialogOpen}
          exploreOnlyDirs={exploreOnlyDirs}
          onRequestClose={(selection) => this.closeExplorerDialog(selection)}
        />

      </ActionDialog>
    );
  }
}

export default withStyles(styles)(ImportCellParams);
