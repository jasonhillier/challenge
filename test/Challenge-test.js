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

		Challenge
			.cases(
			{
				joins: [
				{
					name: 'left',
					loadFrom:'case-data.json', range: [0,1]
				},
				{
					name: 'right',
					loadFrom:'case-data.json', range: [1,2]
				}]
			})
			.test('should generate joined tests from json data',
			function(pCase, fDone)
			{
				Expect(pCase)
					.to.have.property('left');
				Expect(pCase)
					.to.have.property('right');
				Expect(pCase.left.id)
					.to.equal(pCase.right.id-1); //id in right set should be shifted by one

				return fDone();
			});
	}
);
