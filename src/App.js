import React from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Container from 'react-bootstrap/Container';
import Restaurant from './Components/Restaurant';
import Home from './Components/Home';
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Components/Common/Header';

class App extends React.Component {

  constructor(props, context) {
    super(props, context);

    this.state = {

    }
  }

  render() {
    return (
      <Container fluid>
        <Header />
        <Router>
          <Switch>
            <Route path={'/restaurant/'} >
              <Restaurant />
            </Route>
            <Route
              path={'/:linkHEX'} render={({ match }) => (
              <Home match={match} />
            )} />
            <Route path="/">
              <Home />
            </Route>
          </Switch>
        </Router>
      </Container>
    );
  }
}

export default App;
