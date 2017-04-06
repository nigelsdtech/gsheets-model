'use strict';

var doGoogleAuth = require('do-google-auth'),
    fs           = require('fs'),
    google       = require('googleapis');


/**
 * A module for interacting with Google Sheets' APIs
 * @module gsheetsModel
 */

// Some object variables
var
    _sheets,
    _googleAuth;



/**
 * Gsheets Model constructor.
 * @param {object}   params - Params to be passed in
 * @param {string}   params.clientSecretFile - full path to the client secret file to be used by google if an access token doesn't yet exist
 * @param {string[]} params.googleScopes - Google sheets scopes for which this object instance will have permissions
 * @param {string}   params.tokenDir - directory on the local machine in which the google access token lives
 * @param {string}   params.tokenFile - name of file on the local machine that contains the google access token
 * @param {string}   params.userId - id of the sheet to be accessed (defaults to 'me' if the argument isn't passed in
 * @constructor
 */
function GsheetsModel(params) {

  this.userId = (params.userId === undefined)? 'me' : params.userId;


  // Some parameters are mandatory
  var requiredParams = ['googleScopes', 'tokenFile', 'tokenDir', 'clientSecretFile']
  for (var i = 0; i < requiredParams.length; i++) {
    if (params[requiredParams[i]] === undefined) throw new Error('Gsheets Model - required parameter not set: ' + requiredParams[i]);
  }

  this._googleAuth = new doGoogleAuth(
    params.googleScopes.join(" "),
    params.tokenFile,
    params.tokenDir,
    params.clientSecretFile
  );

  this._sheets = google.sheets('v4');

}


var method = GsheetsModel.prototype;


/**
 * gsheetsModel.appendValue
 *
 * @desc Appends a value to a google sheet
 *
 * @alias gsheetsModel.appendValue
 * @memberOf! gsheetsModel(v1)
 *
 * @param  {object}   params - Parameters for request
 * @param  {string}   params.id - ID of the spreadsheet
 * @param  {boolean}  params.includeValuesInResponse - Include values of new rows added?
 * @param  {string}   params.range - Mandatory. The range of the spreadsheet in which the new content will be appended.
 * @param  {string}   params.resource - 
 * @param  {string=}  params.resource.majorDimension - Mandatory. If passed in, either ROWS or COLS. Defaults to nothing.
 * @param  {string=}  params.resource.values - Values to be inserted
 * @param  {string[]} params.retFields - Optional. The specific resource fields to return in the response.
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,response)
 * @return {object} response - The google resource returned
 */
method.appendValue = function (params,callback) {

  var self = this;


  // Authorize a client with the loaded credentials, then call the
  // Google API.
  self._googleAuth.authorize(function (err, auth) {

    if (err) { callback(err); return null}

    var gParams = {
      auth: auth,
      range: params.range,
      resource: params.resource,
      spreadsheetId: params.id,
      valueInputOption: "USER_ENTERED"
    }

    // Optional params to send to google
    if (params.includeValuesInResponse)  gParams.includeValuesInResponse = params.includeValuesInResponse
    if (params.retFields)                gParams.fields = params.retFields.join(',')

    // Make the request to google
    self._sheets.spreadsheets.values.append(gParams, function (err, response) {
      callback(err,response)
    })
  });
}



/**
 * gsheetsModel.batchGetValues
 *
 * @desc Gets contents of a spreadsheet
 *
 * @alias gsheetsModel.batchGetValues
 * @memberOf! gsheetsModel(v1)
 *
 * @param  {object} params - Parameters for request
 * @param  {string} params.id - ID of the spreadsheet
 * @param  {string=} params.majorDimension - Optional. If passed in, either ROWS or COLS. Defaults to nothing.
 * @param  {string} params.ranges - Optional. The range of the spreadsheet to be returned (in A1 notation)
 * @param  {string[]} params.retFields - Optional. The specific resource fields to return in the response.
 * @param  {callback} callback - The callback that handles the response. Returns callback(error,response)
 * @return {object} response - The google resource returned
 */
method.batchGetValues = function (params,callback) {

  var self = this;


  // Authorize a client with the loaded credentials, then call the
  // Google API.
  self._googleAuth.authorize(function (err, auth) {

    if (err) { callback(err); return null}

    var gParams = {
      auth: auth,
      spreadsheetId: params.id,
    }

    // Optional params to send to google
    if (params.majorDimension)  gParams.majorDimension = params.majorDimension
    if (params.ranges)          gParams.ranges = params.ranges;
    if (params.retFields)       gParams.fields = params.retFields.join(',')

    // Make the request to google
    self._sheets.spreadsheets.values.batchGet(gParams, function (err, response) {
      callback(err,response)
    })
  });
}


module.exports = GsheetsModel
