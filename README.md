*To Run this application you will need both Nodejs and FLask(python) and Requests(python) installed onto your device *

*To Install Nodejs please go to https://nodejs.org/en/download/ and to install Flask please go to https://flask.palletsprojects.com/en/2.0.x/installation/ and to install Requests please go to https://pypi.org/project/requests/ *

*To run code uncompress the node modules folder*

# Svelte Arduino Dashboard(Svelte + Flask)

---
This project is a web application using both Svelte(JS) and Flask(Python) to create my own customizable online dashboard GUI to control my Arduino and IOT projects. I created this project to be a central control system for all my current and future projects. Currently I have 3 projects being controlled thru this project, My RFID Door lock, my automated light project, and my arduino cloud messenger project.

<img width="1680" alt="Screenshot 2023-03-30 at 5 41 36 PM" src="https://user-images.githubusercontent.com/58381410/228971400-93d48943-a724-479c-a09c-73b022cb5ee5.png">
<img width="1680" alt="Screenshot 2023-03-30 at 5 41 44 PM" src="https://user-images.githubusercontent.com/58381410/228971404-e6137194-c49f-4776-a2cf-38a32aa4cba8.png">

*Note that you will need to have [Node.js], [Flask(Python)] and [Requests(Python)] installed. *


## How It Works
---
The user clicks on the buttons and switches, and each button and swithc is linked to an event. Whenever an event is triggered the corresponding function makes a call to the backend, based on the function that makes the call the backend will then send a publish request to arduino to then modify and update the new property values.

Main code is in src/App.svelte

The server/api are in server.py 


## Get started
---
These installation an Deployment Instructions are meant for MAC OS * Download the Project


```bash
git clone https://github.com/humzah-77/Arduino-Dashboard-Svelte-.git
cd Arduino-Dashboard-Svelte
```

# How to Run
---
## To run with development server
---
first set up the environment
```bash
 export FLASK_APP=server.py
 export FLASK_ENV=development
 flask run
```
then start the server

```bash
python server.py
```
in a new terminal tab navigate to the public folder
```bash
cd public
```
next install dependencies
```bash
npm install
```
and finally deploy the front end
```bash
npm run build 
```
The application is now running...

Navigate to localhost:5000.

<img width="580" alt="137675173-494d0bf9-eb99-4ca1-836e-4debf244a69a" src="https://user-images.githubusercontent.com/58381410/228972496-1c98c49c-e259-4cba-9dca-c05d19a5f97b.png">


## To run with production server
---
first set up the environment
```bash
 export FLASK_APP=server.py
 export FLASK_ENV=production
 flask run
```
then start the server

```bash
python server.py
```
in a new terminal tab navigate to the public folder
```bash
cd public
```
next install dependencies
```bash
npm install
```
and finally deploy the front end
```bash
npm run build 
```
The application is now running...

The application is now running...

Navigate to localhost:8080.

or

Navigate to 0.0.0.0:8080.

<img width="333" alt="137677670-0385d41f-1c31-42b0-aa62-d538d2197bca" src="https://user-images.githubusercontent.com/58381410/228972698-58698335-31ee-4227-be47-5b247d629778.png">







