import React from "react";
import IconButton from "@geppettoengine/geppetto-client/js/components/controls/iconButton/IconButton";
import { Tooltip } from "netpyne/components";

import { MODEL_STATE } from "../../constants";
import { withStyles } from "@material-ui/core/styles";

const styles = ({ spacing }) => ({
  container: {
    position: "absolute",
    top: spacing(35.5),
    left: '45px',
  },
  innerContainer: { position: "relative" },
  buttons: {
    width: "24px !important",
    height: "24px !important",
    position: "absolute",
    minWidth: "24px !important",
    padding: "3px 8px"
  },
});

class NetWorkControlButtons extends React.Component {
  render () {
    const { classes, modelState, canvasBtnCls } = this.props
    const disableSimulate = modelState === MODEL_STATE.SIMULATED
    const disableRefreshInstance = modelState === MODEL_STATE.INSTANTIATED || modelState === MODEL_STATE.SIMULATED

    return (
      <div className={classes.container}>
        <div style={{ position: 'relative' }}>

          <Tooltip
            title={"Control panel"}
            placement="left"
            className={canvasBtnCls}
          >
            <div>
              <IconButton
                className={classes.buttons}
                onClick={() => $("#controlpanel").show()}
                icon={"fa-list"}
                id="ControlPanelButton"
              />
            </div>
          </Tooltip>
          {/*
          <Tooltip
            title={disableRefreshInstance ? "Your network is in sync" : "Synchronise network"}
            placement="left"
          >
            <div>
              <IconButton
                color={disableRefreshInstance ? 'default' : 'secondary'}
                id={"refreshInstanciatedNetworkButton"}
                key={"refreshInstanceButton"}
                icon="fa-refresh"
                className={classes.buttons}
                onClick={() => this.props.createNetwork()}
                disabled={disableRefreshInstance}
              />
            </div>

          </Tooltip>


          <Tooltip
            title={disableSimulate ? "You have already simulated the network" : "Simulate the network"}
            placement="left"
          >
            <div>
              <IconButton
                color={disableSimulate ? 'default' : 'secondary'}
                id={"launchSimulationButton"}
                icon="fa-rocket"
                className={classes.buttons}
                onClick={() => disableRefreshInstance ? this.props.simulateNetwork() : this.props.createAndSimulateNetwork()}
                disabled={disableSimulate}
              />
            </div>

          </Tooltip>
           */}
        </div>
      </div>
    );
  }
}

export default withStyles(styles)(NetWorkControlButtons);
