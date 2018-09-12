import React, { Component } from 'react';
import { Progress, Button, Card,
  CardImg, CardText, CardBody,
  CardTitle, CardSubtitle, CardFooter,
  Alert } from 'reactstrap';

class NowPlaying extends Component {
  constructor(){
    super();
    this.state = {
      id: '',
      name: '',
      albumArt: '',
      duration_ms: 0,
      progress_ms: 0,
      timestamp: "",
      release_date: "",
      artists: [],
      nowPlayingUpdater: "",
      timestampUpdater: "",
      databaseDataUpdater: "",
      is_playing: false,
      client_open: false,
      uri: "",
      device: ''
    }
  }
  getNowPlaying(){
    this.props.spotifyApi.getMyCurrentPlaybackState()
      .then((response) => {
        clearInterval(this.state.timestampUpdater);
        if(!response) {
          this.setState({
            client_open: false,
            is_playing: false,
          });
        } else {
          this.setState({
              client_open: true,
              id: response.item.id,
              name: response.item.name,
              albumArt: response.item.album.images[0].url,
              duration_ms: Number(response.item.duration_ms),
              progress_ms: Number(response.progress_ms),
              device: response.device.name,
              artists: response.item.artists,
              is_playing: response.is_playing,
              uri: response.item.uri
          });
          if(response.is_playing) {
            this.startUpdater();
          } else {
            this.setState({timestamp:this.milliesToMinutesAndSeconds(Number(response.progress_ms))});
          }
        }
      }, function(err) {
        console.error(err);
      });

  }
  startUpdater() {
    this.setState({timestampUpdater: setInterval(() => {
       let progress = this.state.progress_ms + 100;
       if(!(progress > this.state.duration_ms)) {
         let timestamp = this.milliesToMinutesAndSeconds(progress);

         this.setState({
           timestamp:timestamp,
           progress_ms:progress
         });
       } else {
         this.getNowPlaying();
       }
     }, 100)});
  }
  milliesToMinutesAndSeconds(millis) {
    var minutes = Math.floor(millis / 60000);
    var seconds = ((millis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
  }
  showArtists() {
    let artists = this.state.artists;
    let artistsInString = "";
    if (artists) {
      let names = artists.map((artist) => {
        return artist.name;
      });
      artistsInString = names.join();
    }
    return artistsInString;
  }
  showDescription() {
    if(this.state.uri) {
      return <span>Open in your Spotify client: <a href={this.state.uri}>{this.state.uri}</a></span>
    }
  }
  showPlayingOn() {
    if(this.state.device) {
      return <span>Playing on {this.state.device}</span>
    }
  }

  updateDatabaseData() {
    this.props.onUpdateDatabaseData({
        id: this.state.id,
        name: this.state.name,
        artists: this.showArtists(),
        progress_ms: this.state.progress_ms,
        is_playing: this.state.is_playing,
        time: new Date().getTime() // to calculate progress_ms: timeNow - timeOnDb + progress_ms
      });
  }

  componentWillMount() {
    this.getNowPlaying();
    this.setState({nowPlayingUpdater: setInterval(() => { this.getNowPlaying(); }, 2000)});
    this.setState({databaseDataUpdater: setInterval(() => { this.updateDatabaseData(); }, 5000)});
  }

  render() {
    let clientNotOpen = "";
    if(!this.state.client_open) {
      clientNotOpen = <Alert color="danger">Lost connection with Spotify (if Spotify is open try to <a href='localhost:8888'rel="noopener noreferrer" target="_blank" className="alert-link">log in</a> again).</Alert>;
    }
    return (
      <div>
        {clientNotOpen}
        <Card>
          <CardImg top width="100%" src={this.state.albumArt} alt={this.state.name} />
          <CardBody>
            <CardTitle>{ this.state.name }</CardTitle>
            <CardSubtitle>{this.showArtists()}</CardSubtitle>
            <CardText>{this.showDescription()}</CardText>
            <CardText>
              <small className="text-muted">{this.showPlayingOn()}</small>
            </CardText>
          </CardBody>
          <CardFooter>
            <Progress animated={this.state.is_playing} color="info"
            value={this.state.progress_ms}
            max={this.state.duration_ms}>
              {this.state.timestamp}
            </Progress>
          </CardFooter>
        </Card>
        <hr />
        <Button color="default" size="lg" block onClick={this.updateDatabaseData.bind(this)}>
          Update database
        </Button>
      </div>
    );
  }
}

export default NowPlaying;
