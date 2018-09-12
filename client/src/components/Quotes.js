import React, { Component } from 'react';

class Quotes extends Component {
  constructor() {
    super();
    this.state = {
      quotes: []
    };
  }
  login() {
    fetch('/login', {mode: 'no-cors'});
    console.log("Logged in");
  }

  componentDidMount() {
    fetch('/api/quotes')
      .then(res => {
        if (res.ok) {
          return res.json().then(quotes => this.setState({quotes}, () => console.log('Quotes fetched...', quotes)));
        } else {
          console.log("something went wrong with", res);
        }
      })
  }

  render() {
    return (
      <div>
        <h2>Customers</h2>
        <ul>
        {this.state.quotes.map(quote =>
          <li key={quote._id}>{quote.name} {quote.quote}</li>
        )}
        </ul>
      </div>
    );
  }
}

export default Quotes;
