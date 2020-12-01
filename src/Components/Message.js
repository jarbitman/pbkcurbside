import React from 'react';
import { Alert } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Fade from 'react-bootstrap/Fade';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
const ms = require('pretty-ms')

class Message extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.acknowledgeOrder = this.acknowledgeOrder.bind(this);
    this.clearOrder = this.clearOrder.bind(this);
    this.warnLateOrder = this.warnLateOrder.bind(this);

    const Config = require('../config.json');

    this.honktimeout = null;

    this.state = {
      Config,
      API: Config.apiAddress,
      show: true,
      variant: 'warning',
      message: {},
      time: 0,
      start: 0,
      isOn: false,
      arrived: '',
    };
  }


  componentDidMount() {
    this.warnLateOrder();
    if (this.props.msg) {
      console.log(this.props.msg)
      let milliseconds = Date.now();
      if(this.props.msg.ats){
        milliseconds = this.props.msg.ats * 1000;
      }
      const dateName = new Date().getTime() *1000;
      this.setState({

        message: this.props.msg,
        isOn: true,
        time: dateName,
        arrived: Date.now(),
        start: milliseconds - this.state.time
      });
      this.timer = setInterval(() => this.setState({
        time: Date.now() - this.state.start
      }), 1000);
    }

  }

  componentWillUnmount() {
    this.setState({
      time: 0,
      start: 0,
      isOn: false,
    })
    return () => clearTimeout(this.honktimeout);
  }

  warnLateOrder() {
    this.honktimeout = setTimeout(() => {
      this.setState({
        variant: 'danger'
      });

    }, 1000 * 90);
  }

  acknowledgeOrder() {
    this.props.removeMessage(this.state.message.linkID, 'acknowledgeGuest');
    const message = {
      status: 'acknowledged',
      car: this.state.message.car,
      guest: this.state.message.guest,
      check: this.state.message.check,
      linkID: this.state.message.linkID,
      arrived: this.state.message.arrived,
    }
    this.warnLateOrder();
    this.setState({
      variant: 'success',
      message
    });
  }

  clearOrder() {
    this.props.removeMessage(this.state.message.linkID, 'clearGuest');
  }

  render() {
    if (this.props.msg) {
      return (
        <Fade>
          <Alert variant={this.state.variant}>
            <Row>
              <Col sm={11}>
                  <Alert.Heading>
                    <strong>{this.state.message.guest} Order # {this.state.message.check}</strong>
                  </Alert.Heading>
                <p>Arrived: {this.state.message.arrived}</p>
                <h5><strong>Waiting: {ms(Math.round(this.state.time/1000)*1000)}</strong></h5>
                <hr />
                <p className="mb-0"><strong>Vehicle Information:</strong></p>
                {this.state.message.car && this.state.message.car.map((entry, i) => {
                  return (
                    <p key={'mod_' + i}>{entry}</p>
                  );
                })

                }
              </Col>
              <Col sm={1} style={{ position: 'absolute', right: '10px' }}>
                <ButtonGroup>
                  {this.state.message.status === 'arrived' ? (
                    <Button variant="link" onClick={this.acknowledgeOrder}><Check className={'text-success'} size={48}/></Button>
                  ) : (
                    <Button variant="link"><X className={'text-danger'} onClick={() => this.clearOrder()} size={48}/></Button>
                  )
                  }
                </ButtonGroup>
              </Col>
            </Row>
          </Alert>
        </Fade>
      );
    } else {
      return (<></>);
    }
  }
}

export default Message;