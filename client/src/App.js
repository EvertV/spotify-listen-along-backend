import React, { Component } from 'react';
import './App.css';
import Account from './components/Account';
import NowPlaying from './components/NowPlaying';
import AllPlaying from './components/AllPlaying';
import { Container, Row, Col } from 'reactstrap';

import SpotifyWebApi from 'spotify-web-api-js';
const spotifyApi = new SpotifyWebApi();

class App extends Component {
  constructor() {
    super();
    this.state = {
      nowPlaying: {},
      user: {
        isLoggedIn: false,
      },
    }
  }

  handleUserData(userData) {
    this.setState({user: userData});
  }

  handleUpdateDb(nowPlaying) {
    this.setState({nowPlaying: nowPlaying});
    fetch('api/update/117280769', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        "_id": this.state.user.id,
        user: this.state.user,
        nowPlaying: nowPlaying
      })
    });
  }

  componentWillMount() {

  }

  render() {
    let userInterface;
    if (this.state.user.isLoggedIn) {
      userInterface = <NowPlaying spotifyApi={spotifyApi} onUpdateDatabaseData={this.handleUpdateDb.bind(this)}/>;
    }

    return (
      <Container>
        <Row>
          <Col sm={{ size: '6', offset: 3 }}>
            <Account spotifyApi={spotifyApi} onLogIn={this.handleUserData.bind(this)} />
          </Col>
        </Row>
        <Row>
          <Col sm={{ size: '4' }}>
            {userInterface}
          </Col>
            <Col sm={{ size: '8' }}>
              <AllPlaying spotifyApi={spotifyApi}/>
            </Col>
        </Row>
      </Container>
    );
  }
}

export default App;
