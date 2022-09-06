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
- Run `node get-cart-discounts.js`, copy the desired ID (UUID format, like `f9c4718e-0792-4f08-a802-70f81ef9d46d`)
- Run `node generate-discount-codes.js STUD20- f9c4718e-0792-4f08-a802-70f81ef9d46d 20 > newcodes.csv`
- Check `newcodes.csv` for the generated discount codes
- Sanity check the generated discount codes in Merchant Center > Discounts > Discount code list
- Test code behaviours in the cart without using them, or by removing the used up codes from the csv
- On https://my.sheerid.com/ 
    - Create a SheerID program, e.g. "Student discount"
    - Upload `newcodes.csv` to the Codes step "Single-Use Codes" card
    - Copy the Web URL from Publish step "New Page"

- Add the copied Web URL to your website as a banner link or button
- Test linked banner on your website, fill the form, copy the code and test cart and checkout (the code will be invalidated in SheerID system immediately after successful verification)
- Don't forget to switch the program to Live mode on https://my.sheerid.com/ 

## Server for SheerID webhook

As an example for running a server providing a webhook endpoint for [SheerID Settings](https://my.sheerid.com/settings) Webhook (coming), see `server.js`.

To avoid the need of changing `.env` file `server.js` has several hardcoded entries that should be part of configuration,
like port.
The created cart rules are not "empty", but they need setting up in Merchant Center after the webhook.

## This repository

This is spike code. Feel free to copy-paste from it, if you like playing with razors blindfolded.
