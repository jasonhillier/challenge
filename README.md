# challenge
============

A node.js unit test generator with support for JSON case data

[![Code Climate](https://codeclimate.com/github/jasonhillier/challenge/badges/gpa.svg)](https://codeclimate.com/github/jasonhillier/challenge)
[![Coverage Status](https://codeclimate.com/github/jasonhillier/challenge/badges/coverage.svg)](https://codeclimate.com/github/jasonhillier/challenge)
[![Build Status](https://travis-ci.org/jasonhillier/challenge.svg?branch=master)](https://codeclimate.com/github/jasonhillier/challenge)
[![Dependency Status](https://david-dm.org/jasonhillier/challenge.svg)](https://david-dm.org/jasonhillier/challenge)
[![devDependency Status](https://david-dm.org/jasonhillier/challenge/dev-status.svg)](https://david-dm.org/jasonhillier/challenge#info=devDependencies)

### Examples:

Dynamically generate tests within a Mocha test suite using a JSON array:

    Challenge
		.cases(['first', 'second'])
		.test('should generate two tests',
		function(pCase, fDone)
		{
			Expect(pCase)
				.to.be.a('string');

			return fDone();
		});

Or, load JSON data from a file and generate tests for each selected element in an array:

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

See the unit test for more complex examples, including joining and grouping test case data to generate tests.
