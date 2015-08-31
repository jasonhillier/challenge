/**
* The Challenge Module
*
* @author Jason Hillier <jason@paviasystems.com>
* @class Challenge
* @constructor
*/

var Chai = require("chai");
var Expect = Chai.expect;
var Assert = Chai.assert;

var util = require('util');
var path = require('path');
var argv = require('yargs');
var libAsync = require('async');
var libSuperTest = null;
var _BaseJsonPath = argv.jsonPath || path.dirname(module.parent.filename) + '/';

var Challenge = (
{
	//(Optional) configure test runner, include a Rest client
	// @ServerURL
	// @BaseJsonPath
	initialize: function(pOptions)
	{
		for(var key in pOptions)
		{
			switch(key)
			{
				case 'ServerURL':
					libSuperTest = require('supertest').agent(pOptions.ServerURL);
					break;
				case 'BaseJsonPath':
					_BaseJsonPath = pOptions.BaseJsonPath;
					break;
				default:
					throw Error('Invalid initialize option: ' + key);
			}
		}
	},
	//main function used to define tests
	cases: function(pOptions)
	{
		var tmpCaseData = pOptions;

		if (pOptions.constructor !== Array)
		{
			tmpCaseData = [];

			//load test case data according to options
			if (pOptions.groups)
			{
				pOptions.groups.forEach(function(group)
				{
					var tmpGroupCases = Challenge.loadTestCases(group);
					for(var x=0; x<tmpGroupCases.length; x++)
					{
						var tmpCase = {};

						tmpCase.groupIndex = x;
						tmpCase.groupName = group.name;
						tmpCase.data = tmpGroupCases[x];

						tmpCaseData.push(tmpCase);
					}
				});
			}
			else
			{
				tmpCaseData = Challenge.loadTestCases(pOptions);
			}
		}

		var testDefinition = (
		{
			run: function(fTest, fDone)
			{
				libAsync.eachSeries(tmpCaseData, fTest, fDone);
			},
			test: function(pName, fTest)
			{
				for (var i=0; i<tmpCaseData.length; i++)
				{
					//keep test case data contextualized with the test function definition
					var testClosure = function(testCase)
					{
						return function(fDone)
						{
							return fTest(testCase, fDone);
						}
					}

					//define name for test
					var tmpTestName = pName + ' case ';
					if (tmpCaseData[i].groupName)
					{
						tmpTestName += util.format('\'%s %s\'', tmpCaseData[i].groupName, tmpCaseData[i].groupIndex);
					}
					else
					{
						if (typeof(tmpCaseData[i]) === 'string')
						{
							tmpTestName += util.format('\'%s\'', tmpCaseData[i]);
						}
						else
						{
							//number each test
							tmpTestName += i;
						}
					}
					
					//generate a test around the case data
					test
					(
						tmpTestName,
						testClosure(tmpCaseData[i])
					);
				}

				//make this chainable
				return testDefinition;
			},
			testApi: function(pName, pOptions, fValidation)
			{
				return testDefinition.test(pName, function(pCase, fDone)
					{
						var tmpOptions = (typeof(pOptions) === 'function') ? pOptions(pCase) : pOptions;
						if (!tmpOptions)
							throw Error('No request options defined for testApi() method!');

						var postBody = tmpOptions.postBody;
						if (!postBody)
						{
							if (pCase.data)
							{
								postBody = pCase.data;
							}
							else
							{
								postBody = pCase;
							}
						}

						tmpOptions.url = tmpOptions.url || '';

						var tmpRequest = null;
						var tmpfPrevalidator = null; //function to perform simple (pre)validation for convenience, or in case no validator is specified

						switch(tmpOptions.method)
						{
							case 'GET': //Read
								tmpRequest = libSuperTest
									.get(tmpOptions.url);
								tmpfPrevalidator = function(pError, pResponse, pCase, fNext)
								{
									if (pError)
										return fNext(pError);

									Expect(pResponse.statusCode)
										.to.equal(200); //expect 200 OK
									Expect(typeof(pResponse.body))
										.to.equal('object'); //TODO: this is pretty generic. Maybe work off single vs. Array

									return fNext();
								}
								break;
							case 'PUT': //Update
								tmpRequest = libSuperTest
									.put(tmpOptions.url)
									.send(postBody);
								tmpfPrevalidator = function(pError, pResponse, pCase, fNext)
								{
									if (pError)
										return fNext(pError);

									Expect(pResponse.statusCode)
										.to.equal(200); //expect 200 OK
									Expect(pResponse.body)
										.to.be.an('object');
									Expect(pResponse.body.id)
										.to.equal(pCase.id || pCase.data.id);

									return fNext();
								}
								break;
							case 'POST': //Create
								tmpRequest = libSuperTest
									.post(tmpOptions.url)
									.send(postBody);
								tmpfPrevalidator = function(pError, pResponse, pCase, fNext)
								{
									if (pError)
										return fNext(pError);

									Expect(pResponse.statusCode)
										.to.equal(200); //expect 200 OK
									Expect(pResponse.body)
										.to.be.an('object');
									Expect(pResponse.body.id)
										.to.not.equal(0);

									return fNext();
								}
								break;
							case 'DEL':
							case 'DELETE': //Delete
								tmpRequest = libSuperTest
									.del(tmpOptions.url);
								tmpfPrevalidator = function(pError, pResponse, pCase, fNext)
								{
									if (pError)
										return fNext(pError);

									Expect(pResponse.statusCode)
										.to.equal(200); //expect 200 OK
									Expect(pResponse.body)
										.to.be.an('object');
									Expect(pResponse.body.Success)
										.to.equal(true);

									return fNext();
								}
								break;
							default:
								throw Error(util.format('Request method \'%s\' not supported!', tmpOptions.method));
						}

						//Send the request, run the specified validation method
						tmpRequest.end(
							function (pError, pResponse)
							{
								if (!fValidation)
								{
									return tmpfPrevalidator(pError, pResponse, pCase, fDone);
								}
								else
								{
									if (tmpOptions.preValidate)
									{
										tmpfPrevalidator(pError, pResponse, pCase, function(err)
										{
											return fValidation(err, pResponse, pCase, fDone);
										});
									}
									else
									{
										return fValidation(pError, pResponse, pCase, fDone);
									}
								}
							}
						);
					});
			}
		});

		return testDefinition;
	},

	//Load JSON data as test cases, filter according to options
	loadTestCases: function(pOptions)
	{
		if (!pOptions.loadFrom)
			throw Error('No path specified to load test JSON!');

		var pJsonPath = pOptions.loadFrom;

		if (pJsonPath && pJsonPath[0] !== '/')
			pJsonPath = _BaseJsonPath + pJsonPath;
		//use require to load and cache json files
		var tmpTestJson = require(pJsonPath);

		if (tmpTestJson.constructor !== Array)
			throw Error('JSON data for test cases is not valid! ' + pJsonPath);

		//make a copy of it, so that any modifications don't change the original
		tmpTestJson = JSON.parse(JSON.stringify(tmpTestJson)); //TODO: optimize this

		if (pOptions.index)
		{
			tmpTestJson = tmpTestJson.splice(pOptions.index, 1);
		}
		if (pOptions.max)
		{
			tmpTestJson = tmpTestJson.splice(0, pOptions.max);
		}
		if (pOptions.range)
		{
			tmpTestJson = tmpTestJson.splice(pOptions.range[0], pOptions.range[1]-pOptions.range[0]+1);
		}

		return tmpTestJson;
	}
});

module.exports = Challenge;
