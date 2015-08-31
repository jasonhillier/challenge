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

var Challenge = require('../source/Challenge');


suite
(
	'Challenge',
	function()
	{
		Challenge
			.cases(['first', 'second'])
			.test('should generate two tests',
			function(pCase, fDone)
			{
				Expect(pCase)
					.to.be.a('string');

				return fDone();
			});

		Challenge
			.cases({loadFrom:'case-data.json', range: [0,1]})
			.test('should generate tests from json data',
			function(pCase, fDone)
			{
				Expect(pCase)
					.to.have.property('name');
				Expect(pCase.id.toString())
					.to.equal(pCase.name[pCase.name.length-1]); //id should match last letter of 'name'

				return fDone();
			});

		Challenge
			.cases(
			{
				groups: [
				{
					name: 'first',
					loadFrom:'case-data.json', range: [0,1]
				},
				{
					name: 'second',
					loadFrom:'case-data.json', range: [2,4]
				},
				{
					name: 'third',
					loadFrom:'case-data.json'
				}]
			})
			.test('should generate tests in groups from json data',
			function(pCase, fDone)
			{
				Expect(pCase)
					.to.have.property('groupName');
				Expect(pCase)
					.to.have.property('data');
				Expect(pCase.data.id.toString())
					.to.equal(pCase.data.name[pCase.data.name.length-1]); //id should match last letter of 'name'

				return fDone();
			});
	}
);

suite
(
	'Challenge with REST',
	function()
	{
		test
		(
			'Challenge should initialize with support for REST request test generation',
			function()
			{
				Challenge.initialize({ServerURL:'https://www.google.com/'});
			}
		);

		Challenge
			.cases(['first', 'second'])
			.testApi('should generate two RESTful tests',
			function requestOptions(pCase)
			{
				return {url: '/#q=' + pCase, method: 'GET'};
			},
			function validateResponse(pError, pResponse, pCase, fDone)
			{
				Expect(pError)
					.to.not.be.true;

				Expect(pResponse.text)
					.to.contain("Search the world's information");

				return fDone();
			});
	}
);
