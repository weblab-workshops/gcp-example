# GCP Image Storage Example

This is a simple example of how you can upload, download, and delete images from a GCP bucket. It's still in progress. Make sure to look at the comments labeled TODO, NOTE, and WARNING to see some hints and requirements and dangers. This project is built off of the web.lab Skeleton code so it should look very familiar :)

Too see this code in action, click [here](https://gcp-example.herokuapp.com/)

## Setup
These steps approximately follow those given [here](https://www.npmjs.com/package/@google-cloud/storage); however, we diverge torwards the later steps as they don't give good examples (in my opinion). The steps in this readme should hopefully be sufficient
### Step 1: Set up a GCP Account

Google Cloud Platform accounts are simply linked to your gmail so they're easy to set up, but you should make sure to get the 1-year free $300 of credits they offer to new users. To get started, simply sign up [here](https://cloud.google.com/free). You may actually have made this account already for the Auth lecture.

### Step 2: Make your GCP Project

If you already have a project in GCP for your final web.lab project, simply use this project. Otherwise, create a new one named after your project.

### Step 3: Enable Billing

I'm not exactly sure if you need to do this step, since I've already enabled billiing and can't check. There's not really a harm in doing so though, since you'll have $300 of credits which GCP will use up before charging you. You can try the later steps, and if you get any errors, go back and enable billing.

To enable billing, go to the hamburger menu in the top left and select "Billing". The website should guide you from there.

### Step 4: Enable the Google Cloud Storage API
Go to [this link](https://console.cloud.google.com/flows/enableapi?apiid=storage-api.googleapis.com) which will let you enable the Google Cloud Storage (GCS) API. In the dropdown menu, select your project, and then click "continue", then "Go to credentials".

### Step 5: Get GCP Credentials

Continuing from the last step (or if you got lost, go to hamburger menu --> APIs & Services --> Credentials). Select "Google Cloud Storage JSON API" from the dropdown. If you plan to use Heroku to deploy, say "No" to the question about App Engine and Compute Engine. Then hit "What credentials do I need?".

Next, come up with a service account name (whatever you want) and set the Role to "Storage Object Admin" (this allows the account to create/delete/edit stored files). Make sure the "key type" is set to JSON, and click "continue".

This will start a download of your credentials file. Make sure to keep this secret! Save this file inside your project git repo.

### Step 6: Use Those Credentials

Now, open the credentials file and copy the "private_key" value, including the quotes at the beginning and end. The key should look like "-----BEGIN PRIVATE KEY ...". Paste this in your .env file in a variable named GCP_PRIVATE_KEY. Then copy over the "client_email" value, this time without the quotes, and paste it into .env as "GCP_CLIENT_EMAIL". You can now delete the credentials file, or keep it somewhere safe.

Make sure that your .gitignore includes both the credentials file and the .env file. This is EXTREMELY IMPORTANT here, as opposed to the MONGO_SRV. In this case, this key is connected to your credit card, so you CANNOT take any risks of exposing it.


### Step 7: Mongo & Google Auth

Simple step: Make sure you've updated you've set the MONGO_SRV in the .env file and updated the google auth client id in auth.js and in your React code.

### Step 8: Create a Bucket

Click on the hamburger menu in the top left on console.cloud.google.com again and click on "Storage". It should take you to a page with a button in the middle saying "Create Bucket". Click this button and enter a bucket name, which has to be globally unique across all the users in the world (I found that the page kept crashing if I put a name longer than 6 characters, so if you have this problem, you'll have to use fewer). Click continue.

Next, I recommend choosing the "Region" location type. Not many people will be using your apps from far away and this is the cheapest option. If you expect distant users, maybe you can say dual or multi-region. Click continue.

Make sure to choose the "Standard" storage class, since it's best for frequent (daily) updates like you'll be making. Click continue.

Next I recommend choosing "Uniform" control access for objects to avoid complexity. Click create. (if you get to Advanced Settings, just hit create; don't fiddle with them).

### Step 9: Final step!

Look inside storageTalk.js and see the TODOs to replace the project name and the bucket name. Make sure to replace these with the project you're using and the bucket you just created.

## Running this code

Go to your terminal and cd into this repo. Make sure you're running node 15.5.0 or similar (14.x.y is probably ok, but I haven't tested it). run "npm install" and "npm run hotloader" and "npm start". Then open localhost:5000 in your browser.

You should see a really ugly interface (sorry) with a login button, and a bunch of other inputs. Log in and then try clicking the file upload button and choosing an image file (Make sure it's something non-private. I don't plan on looking at your data, but I also don't guarantee that my code is safe). This file will get uploaded to the server using the /api/uploadImage route, and will be saved in your GCS Bucket! The page should auto-reload and now show your image. You can upload up to 3 images before the upload silently errors (I didn't have time to build an error popup). If you want to delete the stored images, you can press the "delete all" button. Note that these images are not shared with other users.

## Understanding this code

The main new part of this code is in Skeleton.js, storageTalk.js, and api.js

### Skeleton.js Changes
The first half of this file should look familiar. It's just a regular React component that loads a state called "images" in its componentDidMount, and updates it in componentDidUpdate. The first interesting parts are in uploadImage() and readImage(). These functions are responsible for taking the file you selected in the file input, converting it to a UTF-8 string so that it can be sent using a POST request, and posting it. You don't need to understand this code; you can just copy it. If you're interested you can ask me how it works, or I'll get around to updating this doc.

Next, in the render function there are a few intersting things. We include the `<input>` tag with the necessary attributes to make it an image file input. We also give it an id, which is bad React style. There are ways to avoid this, but for now I've left it in so it's more familiar to you.

The final important part of this file is where we render the images themselves:

    this.state.images.map((image, index) => (
      <img src={image} key={index} />
    ))

This code maps each of this.state.images (which are actually strings if you remember; sorry for the misnomer) to an `<img>` tag that we use to show the image. We can pass the image string (which contains all the image data) in as the src attribute, instead of how we'd normally put the file path to the image there. The browser is smart and figures out that we want to display this data.


### storageTalk.js
This file contains a lot of complexity, but the important things are the 3 exported functions. uploadImagePromise(imageString) takes in the UTF-8 string from Skeleton.js (passed through an API call) and uploads it to GCS Buckets with a random file name (to avoid name collisions, the namespace size is ~2^70), and returns a Promise that produces the filename, or throws an error if there's a problem. (Remember that because this function is async, it's really important to do .catch at some point after it to make sure the code doesn't crash).

downloadImagePromise(name) takes in the file name from uploadImagePromise and returns a promise to the UTF-8 string from before. This string is exactly what we plug into the `<img>` tag's src attribute. This function will also throw an error if it encounters a problem, so make sure to .catch.

deleteImagePromise(name) takes in the file name from before and deletes the file. It returns a promise that resolves to true if the image was deleted or false if it failed. This func should never error.

### Remembering image names

In order to remember the random file names we create, we save them in User.js (the Mongoose schema). We keep a list of the user's image file names so we can get to them later. One really important thing is that you need to make sure that you always call deleteImagePromise() successfully before removing the file name from the user object. The reason for this is that, if you delete the file name from MongoDB first, the deleteImagePromise() might fail and then we won't know what the file name is anymore. On the otherhand, if MongoDB still contains a deleted file's name, we just get one image that never loads.

In general for your projects this is a good pattern to follow. Store really big files like images in GCS Buckets and just store the filename that references them in MongoDB.

### api.js

The final place with big changes is api.js. Here we've simply created some routes to allow the user to load their images, upload a new image, and delete their images. See if you can understand how/why it's structured this way (and you can tell me if you find improvements). One important thing here is that we don't give the user a way to access an arbitrary file just based on its name (we just allow loading all the images that are in the User's MongoDB document). Users can easily figure out what someone else's file name is, so you shouldn't give them an API route to access it or your data will be *really* not private.

This API is silly and probably not useful, but it shows how to use the storageTalk functions.
## More help

If you need any help with this, we're always (during January) available on Piazza or at office hours. If you see any crucial info I missed or a mistake I made, please point it out!

## Upcoming Changes

At some point soon I'll add something about how to modify an existing GCS object. I'll also actually add pictures to this README (sorry).