import React from 'react';
import GoogleLogin from 'react-google-login';
import { setLoginObject } from '../redux/actions/actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Container from 'react-bootstrap/Container';
import Websocket from 'react-websocket';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import Message from './Message';
import Alert from 'react-bootstrap/cjs/Alert';

class Restaurant extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.handleData = this.handleData.bind(this);
    this.removeMessage = this.removeMessage.bind(this);

    this.state = {
      messages: []
    };
  }

  componentDidMount() {

  }

  removeMessage(id) {
    if (id) {
      const messages = this.state.messages.filter((item, index) => index !== id);
      this.setState({
        messages
      });
    }
  }

  handleData(data) {
    const messages = this.state.messages;
    messages.push(JSON.parse(data));
    this.setState({
      messages
    });
  }

  responseGoogle(e) {
    if (e.accessToken) {
      this.props.setLoginObject({
        accessToken: e.accessToken,
        profile: e.profileObj
      });
    } else {
      alert('Login Failed');
    }
  }

  render() {
    console.log(this.state.messages);
    if (this.props.loggedIn && this.props.loggedIn.accessToken === '') {
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

    return (
      <Container style={{ paddingTop: '1em' }}>
        {this.state.messages.length === 0 ? (
          <Alert variant={'primary'}>There are no guests waiting.</Alert>
        ) : (
          <>
            <div style={{ height: '75vh', overflowY: 'auto' }}>
              {
                this.state.messages.map((entry, i) => {
                  return (
                    <Message key={'message_' + entry.msg} id={i} removeMessage={this.removeMessage} count={this.state.count} msg={entry.msg}/>
                  );
                })
              }
            </div>
            Waiting Guests: <strong>{this.state.messages.length}</strong>
          </>
        )}


        <Websocket url='ws://localhost:8080/'
                   onMessage={this.handleData}/>
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
