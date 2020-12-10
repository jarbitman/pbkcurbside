import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Modal from 'react-bootstrap/Modal';
import * as utils from '../utils';
import { setLoginObject, setRestaurantObject } from '../redux/actions/actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button, Container } from 'react-bootstrap';
import '../fonts.css';
import Spinner from 'react-bootstrap/Spinner';

class RestaurantStatus extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.getRestaurantStatus = this.getRestaurantStatus.bind(this);
    this.refreshList = this.refreshList.bind(this);

    const Config = require('../config.json');

    this.state = {
      Config,
      API: Config.apiAddress,
      restaurantStatus: [],
      lastRefresh: ''
    };
  }

  componentDidMount() {
    this.getRestaurantStatus();
  }

  refreshList() {
    this.setState({
      restaurantStatus: [],
    });
    this.getRestaurantStatus();
  }

  getRestaurantStatus(){
    const confirm = {
      f: 'getRestaurantStatus'
    };

    utils.ApiPostRequest(this.state.API + 'link', confirm).then((data) => {
      if (data) {
        let date = new Date();
        if (data.status && data.status === 200) {
          this.setState({
            restaurantStatus: data.restaurants,
            lastRefresh: date.toLocaleTimeString('en-US'),
          });
        } else {
          alert('Request Failed');
        }
      } else {
        alert('Unexpected Error');
      }

    });

  }


  render() {
    return (
      <Modal show={this.props.show} onHide={this.props.handleClose}>
        <Modal.Header closeButton><h3 style={{ color: utils.pbkStyle.orange, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Trade Gothic LT Pro Bold' }} >Restaurant Online Status</h3></Modal.Header>
        <Modal.Body>
          <Container style={{ margin: 'auto', textAlign: 'center', paddingTop: '.5em' }} fluid>
            {this.state.restaurantStatus.length ? (
              <Container>
                {this.props.loggedIn.restaurants.map((entry, i) => {
                  if(entry.restaurantID !== -1) {
                    let restaurant = {};
                    this.state.restaurantStatus && this.state.restaurantStatus.map((r, ia) => {
                      if(r.restaurantID === entry.restaurantID){
                        restaurant = r;
                      }else{
                        restaurant = {};
                      }
                    })
                    let textVariant = 'text-success';
                    /*
                    if(restaurant.signOn) {
                      let dateDiff = (Date.now() - restaurant.signOn);
                      if (dateDiff >= 60 * 60 * 1000 ) {
                        textVariant = 'text-danger';
                      }else if(dateDiff >= 15 * 60 * 1000){
                        textVariant = 'text-warning';
                      }
                    }
                   */
                    return (
                      <Row key={'restaurant_' + i} style={{padding: '1em', textAlign: 'left'}}>
                        <Col>{entry.restaurantName}</Col>
                        {restaurant.signOn ? (
                          <Col><span className={textVariant}>{restaurant.latest}</span> </Col>):(
                          <Col><span className={'text-danger'}>Offline</span> </Col>)}
                      </Row>);
                  }
                  })
                }
              </Container>
              ):(
              <Spinner animation="border" variant="info"/>)
            }
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <span className={'text-muted'} style={{textAlign: 'left'}}><i>Last refreshed: {this.state.lastRefresh}</i></span>
          <Button onClick={this.refreshList} variant={'outline-primary'}>Refresh</Button>
          <Button onClick={this.props.handleClose} variant={'outline-secondary'}>Close</Button>
        </Modal.Footer>
      </Modal>
    )
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

RestaurantStatus.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(RestaurantStatus);
