import React, { Component } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities";

import "../../utilities.css";
import "./Skeleton.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "473137640397-n1ovkvs3i1bnmdsve8dkpdc8eah51bfp.apps.googleusercontent.com";

class Skeleton extends Component {
  constructor(props) {
    super(props);
    // Initialize Default State
    this.state = {
      images: [],
    };
  }

  componentDidMount() {
    // remember -- api calls go here!
    if (this.props.userId) {
      this.loadImages();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.userId !== this.props.userId && this.props.userId) {
      // just logged in. reload images
      this.loadImages();
    }
  }

  loadImages = () => {
    get("/api/getImages").then(images => {
      this.setState({ images: images });
    });
  }

  deleteImages = () => {
    post("/api/deleteImages").then(this.loadImages);
  }

  uploadImage = (event) => {
    const fileInput = event.target;
    console.log(fileInput);
    this.readImage(fileInput.files[0]).then(image => {
      fileInput.value = null;
      return post("/api/uploadImage", { image: image }).then(this.loadImages);
    }).catch(err => {
      console.log(err);
    });
  };

  readImage = (blob) => {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onloadend = () => {
        if (r.error) {
          reject(r.error.message);
          return;
        } else if (r.result.length < 50) {
          // too short. probably just failed to read, or ridiculously small image
          reject("small image? or truncated response");
          return;
        } else if (!r.result.startsWith("data:image/")) {
          reject("not an image!");
          return;
        } else {
          resolve(r.result);
        }
      };
      r.readAsDataURL(blob);
    });
  };

  render() {
    return (
      <div className="Skeleton-container">
        {this.props.userId ? (
          <GoogleLogout
            clientId={GOOGLE_CLIENT_ID}
            buttonText="Logout"
            onLogoutSuccess={this.props.handleLogout}
            onFailure={(err) => console.log(err)}
          />
        ) : (
            <GoogleLogin
              clientId={GOOGLE_CLIENT_ID}
              buttonText="Login"
              onSuccess={this.props.handleLogin}
              onFailure={(err) => console.log(err)}
            />
          )}
        <div className="Skeleton-controls">
          <button type="button" onClick={this.deleteImages}>
            Delete All Images
        </button>
          <label htmlFor="fileInput">Click to add an image</label>
          <input id="fileInput" type="file" name="files[]" accept="image/*" onChange={this.uploadImage} />
        </div>
        <div className="Skeleton-images">
          {
            this.state.images.map((image, index) => (
              <img src={image} key={index} />
            ))
          }
        </div>
      </div>
    );
  }
}

export default Skeleton;
