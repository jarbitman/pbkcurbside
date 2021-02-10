import React from 'react';
import GoogleLogin from 'react-google-login';
import { setLoginObject, setRestaurantObject } from '../redux/actions/actions';
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
import Spinner from 'react-bootstrap/Spinner';

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
    this.parseMessage = this.parseMessage.bind(this);
    this.addMessage = this.addMessage.bind(this);
    this.setRestaurant = this.setRestaurant.bind(this);
    this.handlePending = this.handlePending.bind(this);
    this.getPending = this.getPending.bind(this);
    this.heartbeat = this.heartbeat.bind(this);

    const Config = require('../config.json');


    this.state = {
      Config,
      API: Config.apiAddress,
      messages: [],
      error: {},
      restaurantID: null,
      restaurantName: null,
      sentRestaurant: null,
      spinner: false,
      ws: null,
      heartbeat: false,
      ip: '',
    };
  }


  timeout = 250;

  componentDidMount() {
    utils.ApiRequest('https://api.ipify.org?format=json').then((data) => {
      if (data.ip) {
        this.setState({ip: data.ip})
      } else {
        console.log("ip request failed")
      }
    });
    this.connect();
  }

  componentDidUpdate(prevProps, prevState, snapshot) {

  }

  honkyHonk() {
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
    let heartbeet;

    // websocket onopen event listener
    ws.onopen = () => {
      this.setState({
        ws: ws,
        error: {}
      });

      if (this.props.restaurant.id) {
        const confirm = { function: 'setRestaurant', restaurantID: this.props.restaurant.id, "ip": this.state.ip};

        this.state.ws.send(JSON.stringify(confirm));
        this.getPending();
      }
      heartbeet = setInterval(() => {
        const confirm = {"function": "heartbeat", "restaurantID": this.props.restaurant.id, "ip": this.state.ip}
        ws.send(JSON.stringify(confirm));
        this.setState({heartbeat: true});
        setTimeout(() => {
          this.heartbeat();
        }, 30 * 1000);
      }, 5 * 60 * 1000);

      that.timeout = 250; // reset timer to 250 on open of websocket connection
      clearTimeout(connectInterval); // clear Interval on on open of websocket connection
    };

    // websocket onclose event listener
    ws.onclose = e => {
      this.setState({
        messages: [],
        error: { msg: 'Not connected to server. Attempting to reconnect.', variant: 'danger' }
      });
      clearInterval(heartbeet)

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
      this.parseMessage(data);
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

  parseMessage(data) {
    const parsed = JSON.parse(data.data);
    if (parsed.msg.function === 'addMessage') {
      this.addMessage(parsed);
      const confirm = {"function": "notifyRestaurant","linkHEX": parsed.msg.data.linkID}
      this.state.ws.send(JSON.stringify(confirm))
    } else if (parsed.msg.function === 'clearGuest') {

      if (parsed.msg.status && parsed.msg.status === 200) {
        const messages = this.state.messages.filter((item, index) => item.linkID !== parsed.msg.id);
        this.setState({
          messages
        });
      }
    } else if (parsed.msg.function === 'pending') {
      this.handlePending(parsed);
    } else if(parsed.msg.function === 'heartbeat'){
      this.setState({heartbeat: false});
    } else if(parsed.msg.function === 'refresh'){
      window.location.reload(false);
    } else if(parsed.msg.function === 'acknowledgeGuest') {
      let messages = this.state.messages;

      for (let i = 0; i < messages.length; i++) {
        if (parseInt(messages[i].linkID) === parseInt(parsed.msg.id)) {
          messages[i].status = 'acknowledged';
          break;
        }
      }

      this.setState({
        messages
      });
    }
  }

  addMessage(data) {

    const messages = this.state.messages;
    messages.push(JSON.parse(data.msg.data));
    this.setState({
      messages
    });
    this.honkyHonk();
  }

  check = () => {
    const { ws } = this.state;
    if (!ws || ws.readyState === WebSocket.CLOSED) {
      this.connect();
    } //check if websocket instance is closed, if so call `connect` function.
  };

  selectRestaurant(e) {
    this.setState({spinner: true});
    const data = e.target.dataset;

    if (data.res) {

      this.props.setRestaurantObject({
        name: data.name,
        id: data.res,
      });
        this.setRestaurant();
        const confirm = { function: 'setRestaurant', restaurantID: data.res, "ip": this.state.ip };

        this.state.ws.send(JSON.stringify(confirm));
      const pending = {
        function: 'pending',
        restaurantID: data.res
      };
      this.state.ws.send(JSON.stringify(pending));
    }
  }

  setRestaurant() {
    this.setState({
      spinner: false
    });
  }

  removeMessage(id, f) {
    if (id) {
      const confirm = {
        function: f,
        linkHEX: id,
        restaurantID: this.props.restaurant.id
      };
      this.state.ws.send(JSON.stringify(confirm));
    }
  }

  getPending() {
    if (this.props.restaurant.id) {
      const confirm = {
        function: 'pending',
        restaurantID: this.props.restaurant.id
      };
      this.state.ws.send(JSON.stringify(confirm));
    }
  }

  heartbeat(){
    if(this.state.heartbeat){
      this.setState({heartbeat: false});
      this.connect();
    }
  }

  handlePending(data) {
    if (data) {
      const messages = [];
      const orders = data.msg.orders;
      if (data.msg.status && data.msg.status === 200 && orders && orders.length) {
        orders.forEach((entry) => {
          messages.push({
            guest: entry.guest,
            linkID: entry.linkID,
            check: entry.check,
            status: entry.status,
            car: entry.car,
            arrived: entry.arrived,
            ats: entry.ats,
            restaurantName: entry.restaurantName,
            messageReceived: entry.messageReceived,
          });
        });
        this.setState({
          messages
        });
        this.honkyHonk();
      }
    }
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
    if (this.state.spinner) {
      return (
        <Container style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          <Spinner animation="border" variant="primary"/>
        </Container>
      );
    }

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

    if (!this.props.restaurant.id) {
      return (
        <Container style={{ paddingTop: '1em', paddingBottom: '1em' }}>
          <h2 style={{color: utils.pbkStyle.orange, fontFamily: 'Trade Gothic LT Pro Bold'}}>Please Select Your Restaurant</h2>
          {this.props.loggedIn.restaurants.map((entry, i) => {
            let variant = 'info';
            if(entry.restaurantID === -1){
              variant = 'dark';
            }
            return (
              <Row key={'button_' + i} style={{ paddingTop: '1em' }}>
                <Button style={{ width: '100%', textAlign: 'center', padding: '1em' }} variant={'outline-' + variant} onClick={this.selectRestaurant} data-res={entry.restaurantID} data-name={entry.restaurantName}>
                  <h4 data-res={entry.restaurantID} data-name={entry.restaurantName}>{entry.restaurantName}</h4>
                </Button>
              </Row>
            );
          })}
        </Container>
      );
    }

    return (
      <Container style={{ paddingTop: '1em' }}>
        {this.state.messages.length === 0 ? (
          <Alert variant={'primary'}>There are no guests waiting.</Alert>
        ) : (
          <>
            <h4 style={{ color: utils.pbkStyle.blue, fontWeight: 'bold', paddingBottom: '1em' }}>Waiting Guests: <strong>{this.state.messages.length}</strong></h4>
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
  return {
    loggedIn: state.loggedIn,
    restaurant: state.restaurant,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setLoginObject: (loggedIn) => {
      dispatch(setLoginObject(loggedIn));
    },
    setRestaurantObject: (restaurant) => {
      dispatch(setRestaurantObject(restaurant));
    }
  };
};

Restaurant.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Restaurant);
