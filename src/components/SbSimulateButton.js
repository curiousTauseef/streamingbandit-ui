import React from "react";
import RaisedButton from "material-ui/RaisedButton";
import NumberInput from "material-ui-number-input";
import Toggle from "material-ui/Toggle";
import { easyComp } from "react-easy-state";
import store from "../stores/store";

const styles = {
  input: { marginLeft: "16px", marginBottom: "50px" },
  toggleTop: { marginBottom: 16, marginTop: 16 },
  toggleBottom: { marginBottom: 0 },
  button: { margin: "1em", marginLeft: "0" },
  pre: {
    marginLeft: "18px",
    whiteSpace: "pre-wrap",
    wordWrap: "break-word",
    fontSize: 16
  }
};

class SimulateButton extends React.Component {
  constructor(props) {
    super(props);
    this.props = props;
    this.handleClick = this.handleClick.bind(this);
    this.state = {
      numValue: 100,
      doShowResult: false,
      doLog: false,
      seed: null,
      simResult: { __html: "<p id='result'></p>" }
    };
  }

  static ucFirst(string) {
    // noinspection JSUnresolvedFunction
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  fetchAndShow(url, id) {
    fetch(url, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "include"
    })
      .then(response =>
        response.text().then(text => ({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: text
        }))
      )
      .then(({ status, statusText, body }) => {
        let json;
        try {
          json = JSON.parse(body);
          // this.setState({currentThetaString: str})
          document.getElementById(id).innerHTML = JSON.stringify(
            json,
            undefined,
            4
          );
        } catch (e) {
          //
        }
        if (status < 200 || status >= 300) {
          return Promise.reject(statusText);
        }
      });
  }

  handleClick(e) {
    this.setState({
      simResult: { __html: "<p class='loading'>Running simulation </p>" }
    });
    document.getElementById("result").innerHTML =
      "<p class='loading'>Running simulation </p>";
    let connectionString =
      store.serverurl +
      "/eval/" +
      this.props.record.id +
      "/simulate?N=" +
      parseInt(this.state.numValue, 10) +
      "&log_stats=" +
      SimulateButton.ucFirst(this.state.doLog.toString()) +
      "&verbose=" +
      SimulateButton.ucFirst(this.state.doShowResult.toString());
    if (this.state.seed !== null)
      connectionString = connectionString + "&seed=" + this.state.seed;
    fetch(connectionString, {
      method: "GET",
      headers: new Headers({ "Content-Type": "application/json" }),
      credentials: "include"
    })
      .then(response =>
        response.text().then(text => ({
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
          body: text
        }))
      )
      .then(({ status, statusText, body }) => {
        let json;
        let str = "";
        try {
          json = JSON.parse(body);
          str = JSON.stringify(json, null, 4);
          this.setState({
            simResult: { __html: "<p id='result'>" + str + "</p>" }
          });
          document.getElementById("result").innerHTML = str;
          this.fetchAndShow(
            store.serverurl +
              "/stats/" +
              this.props.record.id +
              "/currenttheta",
            "currentThetaString"
          );
          this.fetchAndShow(
            store.serverurl + "/stats/" + this.props.record.id + "/hourlytheta",
            "hourlyThetaString"
          );
          this.fetchAndShow(
            store.serverurl + "/stats/" + this.props.record.id + "/summary",
            "summary"
          );
        } catch (e) {
          json = JSON.parse(body);
          str = JSON.stringify(json, null, 4);
          this.setState({
            simResult: { __html: "<p id='result'>" + str + "</p>" }
          });
          document.getElementById("result").innerHTML = str;
        }
        if (status < 200 || status >= 300) {
          return Promise.reject(statusText);
        }
      });
  }

  handleToggleDoShowResult() {
    this.setState({ doShowResult: !this.state.doShowResult });
  }

  handleToggleDoLog() {
    this.setState({ doLog: !this.state.doLog });
  }

  render() {
    const { simResult } = this.state;
    return (
      <div>
        <Toggle
          label="Verbose"
          labelPosition="right"
          defaultToggled={this.state.doShowResult}
          onToggle={this.handleToggleDoShowResult.bind(this)}
          style={styles.toggleTop}
        />
        <Toggle
          label="Log results to database"
          labelPosition="right"
          defaultToggled={this.state.doLog}
          onToggle={this.handleToggleDoLog.bind(this)}
          style={styles.toggleBottom}
        />
        <br />
        <NumberInput
          id="num"
          defaultValue={parseInt(this.state.numValue, 10)}
          required
          min={1}
          max={10000}
          floatingLabelText="Number of iterations *"
          strategy="warn"
          onValid={e => {
            this.setState({ numValue: e.toString() });
          }}
        />
        <br />
        <NumberInput
          id="seed"
          defaultValue={parseInt(this.state.seed, 10)}
          min={1}
          max={10000000000}
          floatingLabelText="Set Numpy seed"
          strategy="warn"
          onValid={e => {
            this.setState({ seed: e.toString() });
          }}
          onError={e => {
            this.setState({ seed: null });
          }}
        />
        <br />
        <RaisedButton
          name="sim"
          onClick={this.handleClick}
          label="Run a simulation of the experiment"
          value="set"
          primary={true}
          style={styles.button}
        />
        <pre dangerouslySetInnerHTML={simResult} style={styles.pre} />
      </div>
    );
  }
}

export default easyComp(SimulateButton);
