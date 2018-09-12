import React, { Component } from 'react';
import { Table } from 'reactstrap';

class AllPlaying extends Component {
  constructor() {
    super();
    this.state = {
      users: [],
      url: "",
      timestampUpdater: ""
    };
  }
  milliesToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }

  renderUsers() {
    this.state.users.map(user => {
        user.nowPlaying.timestamp = this.milliesToMinutesAndSeconds(new Date().getTime() - user.nowPlaying.time + user.nowPlaying.progress_ms);
      });
    return this.state.users.map(userNowPlaying =>
      <tr key={userNowPlaying._id}>
        <td><img src={userNowPlaying.user.image_url} alt={userNowPlaying.user.name} width="25"/>&nbsp;
        {userNowPlaying.user.name}</td>
        <td>{userNowPlaying.nowPlaying.name}</td>
        <td>{userNowPlaying.nowPlaying.artists}</td>
        <td>{userNowPlaying.nowPlaying.timestamp}</td>
      </tr>
    )
  }

  componentWillMount() {
    fetch('/api/allplaying')
      .then(res => {
        if (res.ok) {
          res.json()
          .then(users=> {
            this.setState({users});
          }); //users => this.setState({users}, () => console.log('All playing users fetched...', users))

        } else {
          console.log("something went wrong with", res);
        }
      });
    //   setInterval(() => {
    //     this.setState({
    //       user.nowPlaying.timestamp:this.milliesToMinutesAndSeconds(new Date().getTime() - user.nowPlaying.time + user.nowPlaying.progress_ms)
    //     });
    //   console.log(user.nowPlaying.timestamp);
    // }, 1000);
  }

  render() {
    let users = this.renderUsers();
    return (
      <div>
        <h2>All Playing</h2>
        <Table>
          <thead>
            <tr>
              <th>User</th>
              <th>Song</th>
              <th>Artists</th>
              <th>Progress</th>
            </tr>
          </thead>
          <tbody>
            {users}
          </tbody>
        </Table>
      </div>
    );
  }
}

export default AllPlaying;
