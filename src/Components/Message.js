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
    if (this.props.msg) {
      this.setState({
        message: this.props.msg
      });
    }

  }

  acknowledgeOrder() {

    const confirm = {
      f: 'acknowledgeGuest',
      linkHEX: this.state.message.link
    };

    utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
      if (data) {
        if (data.status && data.status === 200) {
          this.setState({
            variant: 'success'
          });
        }
      }
    });
  }

  clearOrder() {
    this.setState({
      show: false
    });
  }

  render() {
    if (this.props.msg) {
      return (
        <Fade>
          <Alert variant={this.state.variant}>
            <Row>
              <Col md={9}>
                <Row><strong>{this.state.message.guest}</strong></Row>
                <Row><strong>Order # {this.state.message.check}</strong></Row>
                <Row><strong>Vehicle Information</strong></Row>
                {this.state.message.car && this.state.message.car.map((entry, i) => {
                  return (
                    <div>{entry}</div>
                  );
                })

                }
              </Col>
              <Col md={3}>
                <ButtonGroup>
                  {this.state.variant === 'warning' || this.state.variant === 'danger' ? (
                    <Button variant="link" onClick={this.acknowledgeOrder}><Check className={'text-success'} size={32}/></Button>
                  ) : (
                    <Button variant="link"><X className={'text-danger'} onClick={() => this.props.removeMessage(this.state.message.link)} size={32}/></Button>
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