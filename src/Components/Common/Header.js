import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import * as utils from '../../utils';
import { setLoginObject, setRestaurantObject } from '../../redux/actions/actions';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import '../../fonts.css';

class Header extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.resetRestaurant = this.resetRestaurant.bind(this);

    this.state = {
      restaurantName: ''
    };
  }

  resetRestaurant(){
    this.props.setRestaurantObject({
      name: '',
      id: '',
    });
  }

  render() {
    return (
      <Row style={{ padding: '1em', backgroundColor: '#f7f7f7' }}>
        <Col sm={2}>
          <h3><img src={'pbklogo.svg'} alt={'Protein Bar & Kitchen'} style={{ width: '300px', height: '50px' }}/></h3>
        </Col>
        {this.props.restaurant.name ? (<>
          <Col sm={8}>
            <h3 style={{ color: utils.pbkStyle.orange, fontWeight: 'bold', textAlign: 'center', fontFamily: 'Trade Gothic LT Pro Bold' }}>{this.props.restaurant.name} Curbside Orders</h3>
          </Col>
          <Col sm={2}>
            <Button variant={'outline-info'} onClick={this.resetRestaurant} >Switch Restaurant</Button>
          </Col></>):(<></>)
        }
      </Row>
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

Header.propTypes = {
  loggedIn: PropTypes.object,
  setLoginObject: PropTypes.func.isRequired
};

export default connect(mapStateToProps, mapDispatchToProps)(Header);
