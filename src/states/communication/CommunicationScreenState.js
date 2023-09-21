import BaseState from '../BaseState.js';
import STATE_MACHINE from '../../index.js';
import Communication from './Communication.js';

export default class CommunicationScreenState extends BaseState {
  init(params) {
    this.comm = new Communication(this.connectionCallBack.bind(this));
    this.stateChangeTimer = null;
    this.lastStateParams = params;
    this.peerId = this.comm.inititialize();
    this.cs = 'Not connected';
    this.createProp('cs', 'connectionStatus');
    const userRoleTemplate = {
      main: `<div class="panel-block">
              <loader-container>
                <my-text class="block" slot="content" text="Comunicate this id to another player"></my-text>
                <my-text class="block" slot="content" text="peerId"></my-text>
              </loader-container>
            </div>`,
      second: `<div class="panel-block">
                <my-text text="Enter another player id"></my-text>
              </div>
              <div class="panel-block">
                <input-and-button click="connectHandler" title="Connect"></input-and-button>
              </div>`,
    };

    this.stateContainer = this.templateParser(`
    <div>
      <div class="hero is-link">
        <div class="hero-body title">
          <my-text text="Multiplayer game"></my-text>
          <div class="subtitle">
            <my-text text="${
              this.lastStateParams.userRole === 'main' ? 'Start' : 'Connect'
            }"></my-text>
          </div>
        </div>
      </div>
      <div class="container section">
        <div class="panel">
          <div class="panel-heading">
            Connection settings
          </div>
          
          ${userRoleTemplate[this.lastStateParams.userRole]}
        
        </div>
        <div class="panel">
          <div class="panel-heading">
            Connection status
          </div>
          <div class="panel-block">
            <my-text class="block" text="connectionStatus"></my-text>
          </div>
        </div>
          <my-list click="processUserSelect">
            <li slot="item"><my-button title="Cancel and return to Main Menu"></my-button></li>
          </my-list>
      </div>
    <div>`);
  }

  connectHandler(event) {
    if (event.composedPath()[0].localName === 'button') {
      this.comm.connect(this.input);
    }
  }

  processUserSelect() {
    clearTimeout(this.stateChangeTimer);
    this.comm.cancelConnection();
    STATE_MACHINE.change('menu');
  }

  connectionCallBack() {
    const CONNECTION_MESSAGE_DURATION = 1000;
    const GAMESTART_MESSAGE_DURATION = 3000;
    if (this.comm.connection) {
      this.connectionStatus = 'connection established';
      this.stateChangeTimer = setTimeout(() => {
        this.connectionStatus = 'Staring the game...';
        this.stateChangeTimer = setTimeout(() => {
          STATE_MACHINE.change('game', {
            commObj: this.comm,
            ...this.lastStateParams,
          });
        }, GAMESTART_MESSAGE_DURATION);
      }, CONNECTION_MESSAGE_DURATION);
    } else {
      this.connectionStatus = `Something went wrong. Please restart`;
    }
  }
}
