import React, { Component } from 'react';
import { Button } from 'reactstrap';

class Login extends Component {
  constructor() {
    super();
    this.state = {
      quotes: [],
      url: ""
    };
  }
  componentWillMount() {
    fetch('/login')
      .then(response => {
        if (response.ok) {
          response.text().then((text)=>{ this.setState({url:text}, () => console.log("Got the URL!", text)) });
          /* return this.setState({url:response.text().then((text)=>{ return text })}); */
        } else {
          console.log("Couldn't get login URL", response);
        }
      });
  }

  render() {
    return (
      <Button color="primary" size="lg" block href={this.state.url}>
        Log in
      </Button>
    );
  }
}

export default Login;
