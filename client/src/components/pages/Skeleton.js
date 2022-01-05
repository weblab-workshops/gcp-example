import React, { useState, useEffect } from "react";
import GoogleLogin, { GoogleLogout } from "react-google-login";
import { get, post } from "../../utilities";

import "../../utilities.css";
import "./Skeleton.css";

//TODO: REPLACE WITH YOUR OWN CLIENT_ID
const GOOGLE_CLIENT_ID = "473137640397-n1ovkvs3i1bnmdsve8dkpdc8eah51bfp.apps.googleusercontent.com";

const readImage = (blob) => {
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

const Skeleton = (props) => {
  const [images, setImages] = useState([]);

  const loadImages = () => {
    get("/api/getImages").then(imgs => {
      setImages(imgs)
    });
  }

  const deleteImages = () => {
    post("/api/deleteImages").then(loadImages);
  }

  const uploadImage = (event) => {
    const fileInput = event.target;
    console.log(fileInput);
    readImage(fileInput.files[0]).then(image => {
      fileInput.value = null;
      return post("/api/uploadImage", { image: image }).then(loadImages);
    }).catch(err => {
      console.log(err);
    });
  };

  useEffect(() => {
    if (props.userId) {
      // we're logged in, so load our images
      loadImages();
    }
  }, [props.userId]);

  return (
    <div className="Skeleton-container">
      {props.userId ? (
        <GoogleLogout
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Logout"
          onLogoutSuccess={props.handleLogout}
          onFailure={(err) => console.log(err)}
        />
      ) : (
        <GoogleLogin
          clientId={GOOGLE_CLIENT_ID}
          buttonText="Login"
          onSuccess={props.handleLogin}
          onFailure={(err) => console.log(err)}
        />
      )}
      <div className="Skeleton-controls">
        <button type="button" onClick={deleteImages}>
          Delete All Images
        </button>
        <label htmlFor="fileInput">Click to add an image</label>
        <input id="fileInput" type="file" name="files[]" accept="image/*" onChange={uploadImage} />
      </div>
      <div className="Skeleton-images">
        {
          images.map((image, index) => (
            <img src={image} key={index} />
          ))
        }
      </div>
    </div>
  );
}

export default Skeleton;
