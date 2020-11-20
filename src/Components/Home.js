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

class Home extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.responseGoogle = this.responseGoogle.bind(this);

    this.state = {
      redirect: false
    };
  }

  responseGoogle(e) {
    console.log(e);
    if (e.accessToken) {
      this.props.setLoginObject({
        accessToken: e.accessToken,
        profile: e.profileObj
      });
      this.setState({
        redirect: true,
      });

    } else {
      alert('Login Failed');
    }
  }

  render() {
    if (this.state.redirect) {
      return (
        <Redirect from="/" to="/restaurant"/>
      );
    }
    return (
      <Container>
        <Row style={{ margin: 'auto', textAlign: 'center', paddingTop: '1em' }}>
          <Col>
            <a href={'https://proteinbar.thelevelup.com/'} target={'_blank'}><Button variant={'outline-primary'}>Order PBK Curbside</Button></a>
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
