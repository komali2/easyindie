const kDefaultRoutePath = require('./controller.js').OLSKControllerRoutes().shift().OLSKRoutePath;

Object.entries({
	EASVitrine: '.EASVitrine',
	
	EASVitrineInformationHeading: '.EASVitrineInformationHeading',
	EASVitrineRepoLink: '.EASVitrineRepoLink',

	EASVitrineGazetteHeading: '.EASVitrineGazetteHeading',

	EASVitrineProjectsSourcesHeading: '.EASVitrineProjectsSourcesHeading',
	EASVitrineProjectsSourcesBlurb: '.EASVitrineProjectsSourcesBlurb',
}).map(function (e) {
	return global[e.shift()]  = e.pop();
});

describe('EASVitrine_Access', function () {

	before(function() {
		return browser.visit(kDefaultRoutePath);
	});
	
	it('shows EASVitrine', function() {
		browser.assert.elements(EASVitrine, 1);
	});
	
	it('shows OLSKCrown', function() {
		browser.assert.elements('.OLSKCrown', 1);
	});
	
	it('shows OLSKLanding', function() {
		browser.assert.elements('.OLSKLanding', 1);
	});

	it('shows EASVitrineInformationHeading', function () {
		browser.assert.elements(EASVitrineInformationHeading, 1);
	});

	it('shows EASVitrineRepoLink', function () {
		browser.assert.elements(EASVitrineRepoLink, 1);
	});

	it('shows EASVitrineGazetteHeading', function () {
		browser.assert.elements(EASVitrineGazetteHeading, 1);
	});

	it('shows OLSKFollow', function () {
		browser.assert.elements('.OLSKFollow', 1);
	});

	it('shows OLSKGazette', function () {
		browser.assert.elements('.OLSKGazette', 1);
	});

	it('shows EASVitrineProjectsSourcesHeading', function () {
		browser.assert.elements(EASVitrineProjectsSourcesHeading, 1);
	});

	it('shows EASVitrineProjectsSourcesBlurb', function () {
		browser.assert.elements(EASVitrineProjectsSourcesBlurb, 1);
	});

	it('shows ROCOEphemerataLink', function () {
		browser.assert.elements('.ROCOEphemerataLink', 1);
	});

	it('shows SWARLink', function() {
		browser.assert.elements('.SWARLink', 1);
	});

	it('shows ROCORootLink', function() {
		browser.assert.elements('.ROCORootLink', 1);
	});

});
