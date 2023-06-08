import os
import iot_api_client as iot
from oauthlib.oauth2 import BackendApplicationClient
from requests_oauthlib import OAuth2Session
from flask import Flask, send_from_directory, request
import random #all imports for the site 
import requests
app = Flask(__name__)
# Path for our main Svelte page
@app.route("/")#connect front and backend so when you run server the entire application is ran
def client():
    return send_from_directory('public', 'index.html')

# Path for all the static files (compiled JS/CSS, etc.)
@app.route("/<path:path>")
def home(path):
    return send_from_directory('public', path)


CLIENT_ID = os.getenv("CLIENT_ID")  # get a valid one from your Arduino Create account
CLIENT_SECRET = os.getenv("CLIENT_SECRET")  # get a valid one from your Arduino Create account

# Setup the OAuth2 session that'll be used to request the server an access token
oauth_client = BackendApplicationClient(client_id='LLKshCTTfKtffDM8twWxY7D3vPrVD6rW')
token_url = "https://api2.arduino.cc/iot/v1/clients/token"
oauth = OAuth2Session(client=oauth_client)

# This will fire an actual HTTP call to the server to exchange client_id and
# client_secret with a fresh access token
token = oauth.fetch_token(
    token_url=token_url,
    client_id="LLKshCTTfKtffDM8twWxY7D3vPrVD6rW",
	client_secret="PtH4AsDJc1wZHEBcufGWWKMEvIuXM6UAoBbBI5INBdonDxuw8U2g1TcPJ1B8dqzt",
    include_client_id=True,
    audience="https://api2.arduino.cc/iot",
)

# If we get here we got the token, print its expiration time
print("Got a token, expires in {} seconds".format(token.get("expires_in")))

# Now we setup the iot-api Python client, first of all create a
# configuration object. The access token goes in the config object.
client_config = iot.Configuration(host="https://api2.arduino.cc/iot")
# client_config.debug = True
client_config.access_token = token.get("access_token")

# Create the iot-api Python client with the given configuration
client = iot.ApiClient(client_config)

# Each API model has its own wrapper, here we want to interact with
# devices, so we create a DevicesV2Api object
devices_api = iot.PropertiesV2Api(client)

@app.route("/lighton")
def lighton():
    try:
        propertyValue = {
            'deleted_at': None,
            'href': '/iot/v1/things/730743d7-ff12-4b9b-88cd-90e8116db4c8/properties/739d3479-81f1-44f7-969f-17bef1ce048e',
            'id': '739d3479-81f1-44f7-969f-17bef1ce048e',
            'last_value': True,
            'max_value': True,
            'min_value': True,
            'name': 'button1',
            "value": False,
            'permission': 'READ_WRITE',
            'persist': True,
            'thing_id': '730743d7-ff12-4b9b-88cd-90e8116db4c8',
            'type': 'HOME_SWITCH',
            'update_strategy': 'ON_CHANGE',
            'variable_name': 'button1'}
            #write to arduino api and turn on the lights
        resp = devices_api.properties_v2_publish('730743d7-ff12-4b9b-88cd-90e8116db4c8','739d3479-81f1-44f7-969f-17bef1ce048e',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))
    return "done"

@app.route("/lightoff")
def lightoff():
    try:
        propertyValue = {
            'deleted_at': None,
            'href': '/iot/v1/things/730743d7-ff12-4b9b-88cd-90e8116db4c8/properties/739d3479-81f1-44f7-969f-17bef1ce048e',
            'id': '739d3479-81f1-44f7-969f-17bef1ce048e',
            'last_value': True,
            'max_value': True,
            'min_value': True,
            'name': 'button1',
            "value": True,
            'permission': 'READ_WRITE',
            'persist': True,
            'thing_id': '730743d7-ff12-4b9b-88cd-90e8116db4c8',
            'type': 'HOME_SWITCH',
            'update_strategy': 'ON_CHANGE',
            'variable_name': 'button1'}
             #write to arduino api and turn off the lights
        resp = devices_api.properties_v2_publish('730743d7-ff12-4b9b-88cd-90e8116db4c8','739d3479-81f1-44f7-969f-17bef1ce048e',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/openlock")
def openlock():
    try:
        propertyValue = {
            'deleted_at': None,
            'href': '/iot/v1/things/730743d7-ff12-4b9b-88cd-90e8116db4c8/properties/96054781-2d87-47f1-bccb-33c602c68232',
            'id': '96054781-2d87-47f1-bccb-33c602c68232',
            'last_value': False,
            'max_value': None,
            'min_value': None,
            'name': 'opendoor',
            'permission': 'READ_WRITE',
            'persist': True,
            'value': True,
            'thing_id': '730743d7-ff12-4b9b-88cd-90e8116db4c8',
            'type': 'STATUS',
            'update_parameter': 0.0,
            'update_strategy': 'ON_CHANGE',
            'variable_name': 'opendoor'
            }
         #write to arduino api and open the lock
        resp = devices_api.properties_v2_publish('730743d7-ff12-4b9b-88cd-90e8116db4c8','96054781-2d87-47f1-bccb-33c602c68232',propertyValue )
        print("Response from server:")
        print(resp)
        propertyValue = {
            'deleted_at': None,
            'href': '/iot/v1/things/730743d7-ff12-4b9b-88cd-90e8116db4c8/properties/96054781-2d87-47f1-bccb-33c602c68232',
            'id': '96054781-2d87-47f1-bccb-33c602c68232',
            'last_value': False,
            'max_value': None,
            'min_value': None,
            'name': 'opendoor',
            'permission': 'READ_WRITE',
            'persist': True,
            'value': False,
            'thing_id': '730743d7-ff12-4b9b-88cd-90e8116db4c8',
            'type': 'STATUS',
            'update_parameter': 0.0,
            'update_strategy': 'ON_CHANGE',
            'variable_name': 'opendoor'
            }
         #write to arduino api and close the lock
        resp = devices_api.properties_v2_publish('730743d7-ff12-4b9b-88cd-90e8116db4c8','96054781-2d87-47f1-bccb-33c602c68232',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/oncheck")
def oncheck():
    try:
        propertyValue = {
     
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/3874abc0-37c3-4a48-a68c-b2ab0458b23d',
             'id': '3874abc0-37c3-4a48-a68c-b2ab0458b23d',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'check',
             'value':True,
             'permission': 'READ_WRITE',
             'persist': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
           
             'variable_name': 'check'}
         #write to arduino api and display messages
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','3874abc0-37c3-4a48-a68c-b2ab0458b23d',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/offcheck")
def offcheck():
    try:
        propertyValue = {
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/3874abc0-37c3-4a48-a68c-b2ab0458b23d',
             'id': '3874abc0-37c3-4a48-a68c-b2ab0458b23d',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'check',
             'value':False,
             'permission': 'READ_WRITE',
             'persist': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'check'}

         #write to arduino api and stop displaying messages
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','3874abc0-37c3-4a48-a68c-b2ab0458b23d',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"
@app.route("/onnext")
def onnext():
    try:
        propertyValue = {
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/027f4827-c551-4531-bdd3-73dc4067ae82',
             'id': '027f4827-c551-4531-bdd3-73dc4067ae82',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'next',
             'value': True,
             'permission': 'READ_WRITE',
             'persist': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'next'}

         #write to arduino api and display next message
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','027f4827-c551-4531-bdd3-73dc4067ae82',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"
@app.route("/offnext")
def offnext():
    try:
        propertyValue = {
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/027f4827-c551-4531-bdd3-73dc4067ae82',
             'id': '027f4827-c551-4531-bdd3-73dc4067ae82',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'next',
             'value': False,
             'permission': 'READ_WRITE',
             'persist': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'next'}
         #write to arduino api and lock next message
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','027f4827-c551-4531-bdd3-73dc4067ae82',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/ondone")
def ondone():
    try:
        propertyValue = {            
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/398a4bb0-b0f6-432c-b8d0-4047b23dc06b',
             'id': '398a4bb0-b0f6-432c-b8d0-4047b23dc06b',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'done',
             'permission': 'READ_WRITE',
             'persist': True,
             'value': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'done'}
         #write to arduino api and clear all messages
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','398a4bb0-b0f6-432c-b8d0-4047b23dc06b',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/offdone")
def offdone():
    try:
        propertyValue = {            
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/398a4bb0-b0f6-432c-b8d0-4047b23dc06b',
             'id': '398a4bb0-b0f6-432c-b8d0-4047b23dc06b',
             'last_value': False,
             'max_value': None,
             'min_value': None,
             'name': 'done',
             'permission': 'READ_WRITE',
             'persist': True,
             'value': False,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'STATUS',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'done'}
         #write to arduino api and stop clearing messages
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','398a4bb0-b0f6-432c-b8d0-4047b23dc06b',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

@app.route("/message")
def message():
    args = request.args
    try:
        propertyValue = {
             'deleted_at': None,
             'href': '/iot/v1/things/2688a107-53f4-451f-9bcd-831f2f2d2f5b/properties/13f85cc2-fac7-4884-b3e3-addfcffe4c0d',
             'id': '13f85cc2-fac7-4884-b3e3-addfcffe4c0d',
             'last_value': 'Goodmorning sana i love gou ',
             'max_value': None,
             'min_value': None,
             'name': 'message',
             'value': args['messaage'],
             'permission': 'READ_WRITE',
             'persist': True,
             'thing_id': '2688a107-53f4-451f-9bcd-831f2f2d2f5b',
             'type': 'CHARSTRING',
             'update_parameter': 0.0,
             'update_strategy': 'ON_CHANGE',
             'variable_name': 'message'}
             #write to arduino api and give messenger new meesage
        resp = devices_api.properties_v2_publish('2688a107-53f4-451f-9bcd-831f2f2d2f5b','13f85cc2-fac7-4884-b3e3-addfcffe4c0d',propertyValue )
        print("Response from server:")
        print(resp)
    except iot.ApiException as e:
        print("An exception occurred: {}".format(e))

    return "done"

if __name__ == "__main__":
    app.run(debug=True)
#main function
