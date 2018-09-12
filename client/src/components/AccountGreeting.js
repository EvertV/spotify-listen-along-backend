import React, { Component } from 'react';
import {Media, Card, CardTitle, CardText} from 'reactstrap';
import Login from './Login';

class AccountGreeting extends Component {
  constructor(props){
    super(props);
    this.state = {}
  }
  greeting() {
    const isLoggedIn = this.props.isLoggedIn;

    if (isLoggedIn) {
      const accountInfo = this.props.accountInfo;
      let username = accountInfo.name;
      return (
        <Media>
          <Media left href="#">
            <Media object src={accountInfo.image_url} alt={username} width="65"/>
          </Media>
          <Media body>
            <Media heading>
              {username}
            </Media>
              You{'\''}re listening to
          </Media>
        </Media>
        );
    }
    // if not logged in
    return (
        <div className="AccountGreetingLogin">
          <Card body>
            <CardTitle>Log in to Spotify</CardTitle>
            <CardText>You''ll be redirected to Spotify, to authorize this application.</CardText>
            <Login />
          </Card>
        </div>
      );
    }

  render() {
    return (
      <div className="AccountGreeting">
        {this.greeting()}
      </div>
    );
  }
}

export default AccountGreeting;
