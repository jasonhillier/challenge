/**
* Unit tests for the Challenge test object
*
* @license     MIT
*
* @author      Jason Hillier <jason@hillier.us>
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var _TestWebServerPort = 8080;

suite
(
	'Challenge with REST requests to an Orator web server',
	function()
	{
		test
		(
			'Initialize Orator',
			function()
			{
				_Orator = require('orator').new({APIServerPort: _TestWebServerPort});

				//setup a routes to use for testing
				_Orator.webServer.get(
					'/TEST',
					function (pRequest, pResponse, fNext)
					{
						pResponse.send({id: parseFloat(pRequest.params.id)});
						fNext();
					}
				);
				_Orator.webServer.post(
					'/TEST',
					function (pRequest, pResponse, fNext)
					{
						pResponse.send(pRequest.body);
						fNext();
					}
				);
				_Orator.webServer.put(
					'/TEST',
					function (pRequest, pResponse, fNext)
					{
						pResponse.send(pRequest.body);
						fNext();
					}
				);
				_Orator.webServer.del(
					'/TEST/:ID',
					function (pRequest, pResponse, fNext)
					{
						pResponse.send({Success: true});
						fNext();
					}
				);

				_Orator.startWebServer();
			}
		);

		generateApiTests('http://localhost:' + _TestWebServerPort + '/TEST', false);
		generateApiTests('http://invalid.address/TEST', true); //should look for a REST error for each
	}
);

function generateApiTests(pBaseUrl, pFailTest)
{
	Challenge = require('../source/Challenge').new({ServerURL: pBaseUrl});
	

	//Utilize chaining feature, run two tests on each endpoint (GET,POST,PUT,DEL)
	Challenge
		.cases({loadFrom:'case-data.json', range: [1,2]})
		.testApi('should generate two GET requests',
			function requestOptions(pCase)
			{
				return {url: '?id=' + pCase.id, method: 'GET', preValidate: true};
			},
			function validateResponse(pError, pResponse, pCase, fDone)
			{
				Assert.equal(!!pError, pFailTest);

				if (!pFailTest)
				{
					Expect(pResponse.body.id)
						.to.equal(pCase.id);
				}

				return fDone();
			})
		.testApi('should generate two POST requests',
			function requestOptions(pCase)
			{
				return {method: 'POST', preValidate: true};
			},
			function validateResponse(pError, pResponse, pCase, fDone)
			{
				Assert.equal(!!pError, pFailTest);

				if (!pFailTest)
				{
					Expect(pResponse.body.id)
						.to.equal(pCase.id);
				}

				return fDone();
			})
		.testApi('should generate two PUT requests',
			function requestOptions(pCase)
			{
				return {method: 'PUT', preValidate: true};
			},
			function validateResponse(pError, pResponse, pCase, fDone)
			{
				Assert.equal(!!pError, pFailTest);

				if (!pFailTest)
				{
					Expect(pResponse.body.id)
						.to.equal(pCase.id);
				}

				return fDone();
			})
		.testApi('should generate two DELETE requests',
			function requestOptions(pCase)
			{
				return {url: '/' + pCase.id, method: 'DELETE', preValidate: true};
			},
			function validateResponse(pError, pResponse, pCase, fDone)
			{
				Assert.equal(!!pError, pFailTest);

				return fDone();
			});
}