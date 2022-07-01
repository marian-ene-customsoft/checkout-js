import React, { FunctionComponent, useEffect, useState } from "react";
import { Map, Marker, GoogleApiWrapper, IProvidedProps, IGoogleApiOptions } from "google-maps-react";

export interface LockersMapProps extends IGoogleApiOptions, IProvidedProps  {
    apiKey: string;
    lockers?: [];
    google: any;
    address: any;
    closeModal(): void;
}

const LockersMap: FunctionComponent<LockersMapProps> = (props) => {
    const [center, setCenter] = useState();
 
    useEffect(()=> {
        let geocoder = new google.maps.Geocoder();
        let location = `${props.address.country} ${props.address.city} ${props.address.address1} ${props.address.address2} ${props.address.stateOrProvince} ${props.address.postalCode}`;
        geocoder.geocode({ 'address': location }, function(results, status){
            if (status == google.maps.GeocoderStatus.OK) {
                setCenter(results[0].geometry.location as any);
            } else {
                alert("Could not find location: " + location);
            }
        });
    },[])

    const onMarkerClick = (location: any) => {
        localStorage.setItem('lockerData', JSON.stringify(location));
        props.closeModal();
    }

    return (
        <Map google={props.google} zoom={14} center={center} style={{top: 20, left: 20, right: 20, bottom: 20}}
            containerStyle={{
                position: 'static',  
                width: '100%',
                height: '100%'
              }}>
          {props.lockers?.map((location: any) => {
              return <Marker key={location.id}
              title={location.addressText}
              position={{lat: location.lat, lng: location.long}} 
              onClick={() => onMarkerClick(location)} />
          })

          }
        </Map>
      );
}

export default GoogleApiWrapper(
    (props) => ({
      apiKey: props.apiKey,
      lockers: props.lockers
    }
  ))(LockersMap);