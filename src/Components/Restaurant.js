import React from 'react';
import GoogleLogin from 'react-google-login';
import { setLoginObject } from '../redux/actions/actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Message from './Message';
import Alert from 'react-bootstrap/Alert';
import UIfx from 'uifx';
import honk from './Audio/horn.wav';
import * as utils from '../utils';
import Button from 'react-bootstrap/Button';

class Restaurant extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.handleData = this.handleData.bind(this);
    this.removeMessage = this.removeMessage.bind(this);
    this.handleDisconnect = this.handleDisconnect.bind(this);
    this.handleConnect = this.handleConnect.bind(this);
    this.selectRestaurant = this.selectRestaurant.bind(this);
    this.honkyHonk = this.honkyHonk.bind(this);

    const Config = require('../config.json');


    this.state = {
      Config,
      API: Config.apiAddress,
      messages: [],
      error: {},
      restaurantID: null,
      restaurantName: null,
      sentRestaurant: null,
      ws: null
    };
  }


  timeout = 250;

  componentDidMount() {
    this.connect();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (this.state.ws && prevState.restaurantID !== this.state.restaurantID) {
      const data = { function: "setRestaurant", restaurantID: this.state.restaurantID };
      this.state.ws.send(JSON.stringify(data));
      this.getPending();
    }
  }

  honkyHonk(){
    const bell = new UIfx(
      honk,
      {
        volume: 0.4, // number between 0.0 ~ 1.0
        throttleMs: 100
      }
    );
    bell.play();
  }

  connect = () => {
    let ws = new WebSocket(this.state.Config.websocket);
    let that = this; // cache the this
    let connectInterval;

    // websocket onopen event listener
    ws.onopen = () => {
      this.setState({
        ws: ws,
        error: {}
      });
      if(this.state.restaurantID){
        this.getPending();
      }

      that.timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    // websocket onclose event listener
    ws.onclose = e => {
      this.setState({
        messages: [],
        error: { msg: 'Not connected to server. Attempting to reconnect.', variant: 'danger' },
      });

        console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second.`,
        e.reason
      );

      that.timeout = that.timeout + that.timeout; //increment retry interval
      connectInterval = setTimeout(this.check, Math.min(10000, that.timeout)); //call check function after timeout
    };

    ws.onmessage = data => {

      const messages = this.state.messages;
      const parsed = JSON.parse(data.data);
      messages.push(JSON.parse(parsed.msg));
      this.setState({
        messages
      });
      this.honkyHonk();
    };

    // websocket onerror event listener
    ws.onerror = err => {
      console.error(
        'Socket encountered error: ',
        err.message,
        'Closing socket'
      );

      ws.close();
    };
  };

  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      this.connect();
    } //check if websocket instance is closed, if so call `connect` function.
  };

  selectRestaurant(e) {
    this.setState({
      restaurantName: e.target.dataset.name,
      restaurantID: e.target.dataset.res
    });
  }

  removeMessage(id) {
    if (id) {

      const confirm = {
        f: 'clearGuest',
        linkHEX: id,
      };

      utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
        if (data) {
          if (data.status && data.status === 200) {
            const messages = this.state.messages.filter((item, index) => item.linkID !== id);
            this.setState({
              messages
            });
          }
        }
      });
    }
  }

  getPending() {
      const confirm = {
        f: 'pending',
        restaurantID: this.state.restaurantID,
      };

      utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
        if (data) {
          if (data.status && data.status === 200 && data.orders.length) {
            const messages = this.state.messages;
            data.orders.map((entry, i) => {
              messages.push({
                guest: entry.guest,
                linkID: entry.linkID,
                check: entry.check,
                status: entry.status,
                car: entry.car,
              });
            })

            this.setState({
              messages
            });
            this.honkyHonk();
          }
        }
      });
  }

  handleDisconnect() {
    this.setState({
      error: { msg: 'Not connected to server. Contact PBK Support if this message does not go away.', variant: 'danger' },
      connected: 0
    });
  }

  handleConnect() {
    this.setState({
      error: {},
      connected: 1
    });
  }

  handleData(data) {
    const bell = new UIfx(
      honk,
      {
        volume: 0.4, // number between 0.0 ~ 1.0
        throttleMs: 100
      }
    );
    const messages = this.state.messages;
    const parsed = JSON.parse(data);

    messages.push(JSON.parse(parsed.msg));
    this.setState({
      messages
    });
    bell.play();
  }

  responseGoogle(e) {
    if (e.accessToken) {
      const confirm = {
        f: 'validate',
        id_token: e.tokenId,
        email: e.profileObj.email
      };

      utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
        if (data) {
          if (data.status && data.status === 200) {
            this.props.setLoginObject({
              id_token: e.tokenId,
              profile: e.profileObj,
              restaurants: data.restaurants
            });
          } else {
            alert('Login Failed');
          }
        } else {
          alert('Unexpected Error');
        }

      });
    } else {
      alert('Login Failed');
    }
  }

  render() {
    console.log(this.state.messages);
    if (this.props.loggedIn && this.props.loggedIn.id_token === '') {
      return (
        <Row style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          <Col>
            <GoogleLogin
              clientId="255943703747-1kpbblqtock5dgubuai04s2fr56vi0iu.apps.googleusercontent.com"
              buttonText="Restaurant Login"
              onSuccess={this.responseGoogle}
              onFailure={this.responseGoogle}
              cookiePolicy={'single_host_origin'}
            />
          </Col>
        </Row>
      );
    }

    if (this.state.error && this.state.error.variant === 'danger') {
      return (
        <Container style={{ paddingTop: '1em' }}>
          <Alert variant={this.state.error.variant}>{this.state.error.msg}</Alert>
        </Container>
      );
    }

    if (!this.state.restaurantID) {
      return (
        <Container style={{ paddingTop: '1em' }}>
          <h2>Please Select Your Restaurant</h2>
          {this.props.loggedIn.restaurants.map((entry, i) => {
            return (
              <Row style={{ paddingTop: '1em' }}>
                <Button style={{ width: '100%', textAlign: 'center',padding: '1em' }} variant={'outline-info'} onClick={this.selectRestaurant} data-res={entry.restaurantID} data-name={entry.restaurantName}><h4>{entry.restaurantName}</h4></Button>
              </Row>
            );
          })}
        </Container>
      );
    }

    return (
      <Container style={{ paddingTop: '1em' }}>
        <h3 style={{color: utils.pbkStyle.orange, fontWeight: 'bold'}}>{this.state.restaurantName} Curbside Orders</h3>
        {this.state.messages.length === 0 ? (
          <Alert variant={'primary'}>There are no guests waiting.</Alert>
        ) : (
          <>
            <h4  style={{color: utils.pbkStyle.blue, fontWeight: 'bold', paddingBottom: '1em'}}>Waiting Guests: <strong>{this.state.messages.length}</strong></h4>
            <div style={{ height: '75vh', overflowY: 'auto' }}>
              {
                this.state.messages.map((entry, i) => {
                  //   let parsed = JSON.parse(entry.msg)
                  return (
                    <Message key={'message_' + i} honkyHonk={this.honkyHonk} removeMessage={this.removeMessage} count={this.state.count} msg={entry}/>
                  );
                })
              }
            </div>
          </>
        )}
      </Container>
    );
  }

}


const mapStateToProps = (state) => {
  return { loggedIn: state.loggedIn };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLoginObject: (loggedIn) => {
      dispatch(setLoginObject(loggedIn));
    }
  };
};

Restaurant.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Restaurant);
