# Commercetools SheerID discount codes

This is a quick overview of how to integrate [SheerID verification](https://www.sheerid.com/) to your commercetools (https://www.commercetools.com/) site without automatic processes.

## Requirements
- a commercetools website, access to Merchant Center with a user that has access to the Settings > Developer settings > API keys
- a SheerID account
- computer with nodejs v16 or not much higher (should work from v10 and with recent versions but no guarantees)

## Installation 

Preparation, this process does not install anything outside of the cloned folder.

- clone the repository to your local machine
- run `yarn` or `npm install` to install the dependencies

## The process

How to use:
- Create a cart discount on your system (e.g. 20% off for students)
- Create a commercetools API client in Merchant Center > Settings > Developer settings > API clients
    - Scope can be "Admin client" (not recommended) or "Manage" Cart discounts and Discount codes
    - Download the created API client's "Environment variables (.env)" file before closing the popup
    - Add the .env file to the project root
- Log in to your SheerID Dashboard and
    - Create a SheerID program, that you will use e.g. "Student discount"
    - Configure your program with eligibility, theme etc
    - Set Codes section to "No Code"
    - In Program Settings 
        - set Webhook for eligible verification to `https://<your_server_address>/api/success-webhook`
        - add cartid as Campaign Metadata field
    - Copy access token from Settings > Access Tokens page
- Edit the downloaded .env file, add 
```
SHEERID_TOKEN=<your copied SheerID Access Token>
SHEERID_API_URL=https://services.sheerid.com/rest/v2/
URL=https://sheeriddemo.gpmd.net/
PORT=8080
```
- Run `node server.js` or `yarn server` to run the bridge application.
- Check that it's running by visiting the server URL indicated by the application.

## This repository

This is spike code. Feel free to copy-paste from it, if you like playing with razors blindfolded.
