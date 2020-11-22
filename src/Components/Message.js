import React from 'react';
import { Alert } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Fade from 'react-bootstrap/Fade';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as utils from '../utils';

class Message extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.acknowledgeOrder = this.acknowledgeOrder.bind(this);
    this.clearOrder = this.clearOrder.bind(this);
    this.warnLateOrder = this.warnLateOrder.bind(this);

    const Config = require('../config.json');

    this.state = {
      Config,
      API: Config.apiAddress,
      show: true,
      variant: 'warning',
      message: {}
    };
  }

  componentDidMount() {
    this.warnLateOrder();
    if (this.props.msg) {
      this.setState({
        message: this.props.msg
      });
    }

  }

  warnLateOrder() {
    this.interval = setTimeout(() => {
      this.setState({
        variant: 'danger'
      });
      this.props.honkyHonk();
    }, 1000 * 90);
  }

  acknowledgeOrder() {

    const confirm = {
      f: 'acknowledgeGuest',
      linkHEX: this.state.message.linkID
    };
    const message = {
      status: 'acknowledged',
      car: this.state.message.car,
      guest: this.state.message.guest,
      check: this.state.message.check,
      linkID: this.state.message.linkID,
    }
    utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
      if (data) {
        if (data.status && data.status === 200) {
          this.warnLateOrder();
          this.setState({
            variant: 'success',
            message
          });
        }
      }
    });
  }

  clearOrder() {
    if (this.interval) {
      clearTimeout(this.interval);
    }
    this.props.removeMessage(this.state.message.linkID);
  }

  render() {
    if (this.props.msg) {
      return (
        <Fade>
          <Alert variant={this.state.variant}>
            <Row>
              <Col md={11}>
                <Row style={{ padding: '1em' }}>
                  <Alert.Heading>
                    <strong>{this.state.message.guest} Order # {this.state.message.check}</strong>
                  </Alert.Heading>
                </Row>
                <Row style={{ paddingLeft: '1em' }}><strong>Vehicle Information</strong></Row>
                {this.state.message.car && this.state.message.car.map((entry, i) => {
                  return (
                    <div>{entry}</div>
                  );
                })

                }
              </Col>
              <Col md={1} style={{ position: 'absolute', right: '10px' }}>
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