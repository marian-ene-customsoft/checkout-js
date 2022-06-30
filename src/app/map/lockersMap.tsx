import React, { Component } from "react";
import { Map, GoogleApiWrapper } from "google-maps-react";

export interface LockersMapProps {
    api_key: string;
    lockers?: object;
}

const mapStyles = {
  width: '100%',
  height: '100%'
};

export class LockersMap extends Component {
  render() {
    return (
      <Map
        google={this.props.google}
        zoom={14}
        style={mapStyles}
        initialCenter={
          {
            lat: -1.2884,
            lng: 36.8233
          }
        }
      />
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'YOUR_GOOGLE_MAPS_API_KEY_GOES_HERE'
})(LockersMap);