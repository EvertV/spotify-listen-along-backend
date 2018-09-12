import React, { Component } from 'react';
import AccountGreeting from './AccountGreeting';
import {  } from 'reactstrap';

class Account extends Component {
  constructor() {
    super();
    this.state = {
      access_token: this.getHashParams().access_token,
      refresh_token: this.getHashParams().refresh_token,
      isLoggedIn: false,
      id: '',
      name: '',
      email: '',
      country: '',
      product: '',
      image_url: ''
    }
  }
  getHashParams() {
    var hashParams = {};
    var e, r = /([^&;=]+)=?([^&;]*)/g,
        q = window.location.hash.substring(1);
    e = r.exec(q)
    while (e) {
       hashParams[e[1]] = decodeURIComponent(e[2]);
       e = r.exec(q);
    }
    return hashParams;
  }
  handleLoggedInStatus() {
    const token = this.state.access_token;
    const isLoggedIn = token ? true : false;
    if (token) {
      this.props.spotifyApi.setAccessToken(token);
    }

    this.setState({isLoggedIn: isLoggedIn});
    return isLoggedIn;
  }
  handleAccountInfo() {
    this.props.spotifyApi.getMe().then(function(data) {
      const username = data.display_name !== null ? data.display_name : data.id;
        this.setState({
          id: data.id,
          name: username,
          country:data.country,
          product:data.premium,
          image_url:data.images[0].url,
        });
        this.props.onLogIn({
          id: data.id,
          name: username,
          isLoggedIn: this.state.isLoggedIn,
          image_url: data.images[0].url
        });
        console.log(this.state);
      }.bind(this));

  }

  componentWillMount() {
    if(this.handleLoggedInStatus()) {
      this.handleAccountInfo();
    }

  }
  render() {
    const isLoggedIn = this.state.isLoggedIn;
    let greeting;

    if (isLoggedIn) {
      greeting = <AccountGreeting isLoggedIn={true} accountInfo={this.state} />;
    } else {
      greeting = <AccountGreeting isLoggedIn={false} />;
    }

    return (
      <div>
        {greeting}
      </div>
    );
  }
}

export default Account;
