import React from 'react';
import { Alert } from 'react-bootstrap';
import { Check, X } from 'react-bootstrap-icons';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import Button from 'react-bootstrap/Button';
import Fade from 'react-bootstrap/Fade';

class Message extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.acknowledgeOrder = this.acknowledgeOrder.bind(this);
    this.clearOrder = this.clearOrder.bind(this);

    this.state = {
      show: true,
      variant: 'warning'
    };
  }

  acknowledgeOrder() {
    this.setState({
      variant: 'success'
    });
  }

  clearOrder() {
    this.setState({
      show: false
    });
  }

  render() {
    console.log(this.props);
    if (this.props.msg) {
      return (
        <Fade>
          <Alert variant={this.state.variant}>
            {this.props.msg}
            <span style={{ position: 'absolute', bottom: '5px', right: '10px' }}>
              <ButtonGroup>
                {this.state.variant === 'warning' || this.state.variant === 'danger' ? (
                  <Button variant="link" onClick={this.acknowledgeOrder}><Check className={'text-success'} size={32}/></Button>
                ) : (
                  <Button variant="link"><X className={'text-danger'} onClick={() => this.props.removeMessage(this.props.id)} size={32}/></Button>
                )
                }
              </ButtonGroup>
            </span>
          </Alert>
        </Fade>
      );
    } else {
      return (<></>);
    }
  }
}

export default Message;