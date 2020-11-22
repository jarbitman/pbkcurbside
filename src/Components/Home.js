import React from 'react';
import { Redirect } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Container } from 'react-bootstrap';
import GoogleLogin from 'react-google-login';
import PropTypes from 'prop-types';
import { setLoginObject } from '../redux/actions/actions';
import { connect } from 'react-redux';
import * as utils from '../utils.js';
import Alert from 'react-bootstrap/Alert';
import Spinner from 'react-bootstrap/Spinner';

class Home extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.notifyArrival = this.notifyArrival.bind(this);

    const Config = require('../config.json');

    this.state = {
      Config,
      API: Config.apiAddress,
      redirect: false,
      error: [],
      spinner: false
    };
  }

  componentDidMount() {
    if (this.props.match && this.props.match.params.linkHEX) {
      this.setState({
        spinner: true
      });

      this.notifyArrival();
    }
  }

  responseGoogle(e) {
    const error = this.state.error;
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
            this.setState({
              redirect: true
            });
          } else {
            error.push({ msg: 'Login Failed.', variant: 'danger' });
          }
        } else {
          error.push({ msg: 'An unexpected error occurred.', variant: 'danger' });
        }

      });
    } else {
      error.push({ msg: 'Login Failed.', variant: 'danger' });
    }
    this.setState({
      error
    });
  }

  notifyArrival() {
    const error = this.state.error;

    const confirm = {
      f: 'arrive',
      linkHEX: this.props.match.params.linkHEX
    };


    utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
      if (data) {
        if (data.status && data.status === 200) {
          error.push({ msg: 'Thank you for confirming, the restaurant has been notified.', variant: 'success' });
        } else {
          error.push({ msg: data.message, variant: data.variant });
        }
      } else {
        error.push({ msg: 'An unexpected error occurred.', variant: 'danger' });
      }

      this.setState({
        spinner: false,
        error
      });
    });
  }

  render() {
    if (this.state.spinner) {
      return (
        <Container style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          <Spinner animation="border" variant="primary"/>
        </Container>
      );
    }
    if (this.state.error.length) {
      return (
        <Container style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          {
            this.state.error.map((entry, i) => {
              return (<Alert key={'message_' + i} variant={entry.variant}>{entry.msg}</Alert>);
            })
          }
        </Container>
      );
    }

    if (this.state.redirect) {
      return (
        <Redirect from="/" to="/restaurant"/>
      );
    }
    return (
      <Container>
        <Row style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          <Col>
            <a href={'https://proteinbar.thelevelup.com/'} target="_blank" rel="noreferrer"><Button variant={'outline-primary'}>Order PBK Curbside</Button></a>
          </Col>
        </Row>
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

Home.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
