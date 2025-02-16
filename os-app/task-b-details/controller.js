const { JSDOM } = require('jsdom');
const OLSKLink = require('OLSKLink');
const OLSKCache = require('OLSKCache');

const mod = {

	OLSKControllerTasks () {
		return [{
			OLSKTaskName: 'EASDetailsStartFetch',
			OLSKTaskFireTimeInterval: 5,
			OLSKTaskShouldBePerformed () {
				return true;
			},
			OLSKTaskCallback: (function () {
				require('OLSKModule').OLSKModuleLifecycleSetup(mod);
			}),
			OLSKTaskFireLimit: 1,
		}, {
			OLSKTaskName: 'EASDetailsCheckNewBankListings',
			OLSKTaskFireTimeInterval: 60 * 60 * 24,
			OLSKTaskShouldBePerformed () {
				return true;
			},
			OLSKTaskCallback: mod._SetupDetailsIncoming,
		}];
	},

	// VALUE

	_ValueCandidatesCache: {},

	ValueCandidatesCache () {
		return mod._ValueCandidatesCache;
	},

	// DATA

	_DataFoilOLSKCache: require('OLSKCache'),
	_DataFoilOLSKQueue: require('OLSKQueue'),
	_DataFoilOLSKDisk: require('OLSKDisk'),
	_DataFoilBanks: require('../task-a-banks/controller.js'),

	async _DataContentString (inputData) {
		try {
			return (await require('node-fetch')(inputData)).text();
		} catch (e) {
			console.error(e);
			return '';
		}
	},

	DataCacheAggregateBasename() {
		return '_aggregate';
	},

	DataCacheImageAttributeCandidates () {
		return [
			'apple-touch-icon',
			'apple-touch-icon-precomposed',
			'mask-icon',
		];
	},

	_DataDOMPropertyCandidates (params) {
		if (typeof params !== 'object' || params === null) {
			throw new Error('ZDRErrorInputNotValid');
		}

		if (typeof params.ParamURL !== 'string') {
			throw new Error('ZDRErrorInputNotValid');
		}

		if (typeof params.ParamMetadata !== 'object' || params.ParamMetadata === null) {
			throw new Error('ZDRErrorInputNotValid');
		}

		if (typeof params.ParamManifest !== 'undefined') {
			if (typeof params.ParamManifest !== 'object' || params.ParamManifest === null) {
				throw new Error('ZDRErrorInputNotValid');
			}
		}

		return [
			['EASProjectIconURL', (function(href) {
				if (!href) {
					return;
				}

				return !href ? null : OLSKLink.OLSKLinkRelativeURL(params.ParamURL, href);
			})((((params.ParamManifest || {}).icons || []).pop() || {}).src || mod.DataCacheImageAttributeCandidates().reduce(function (coll, item) {
				if (params.ParamMetadata[item]) {
					coll.push(params.ParamMetadata[item]);
				}

				return coll;
			}, []).shift())],
			['_EASProjectIconURL', (function(href) {
				if (!href) {
					return;
				}

				return !href ? null : OLSKLink.OLSKLinkRelativeURL(params.ParamURL, href);
			})(params.ParamMetadata['og:image'])],
			['_EASProjectBlurb', params.ParamMetadata.description],
			['_EASProjectBlurb', params.ParamMetadata.title],
			['EASProjectHasManifest', !!params.ParamManifest],
			['EASProjectFunding', params.ParamMetadata._OLSKDOMMetadataFunding],
		].filter(function ([key, value]) {
			return !!value;
		});
	},

	// SETUP

	SetupFetchQueue () {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;
		
		_mod._ValueFetchQueue = _mod._DataFoilOLSKQueue.OLSKQueueAPI();
	},

	SetupCacheObject () {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;
		
		Object.assign(mod, Object.assign(_mod, {
			_ValueCandidatesCache: _mod._DataFoilOLSKCache.OLSKCacheReadFile(mod.DataCacheAggregateBasename(), require('path').join(__dirname, '__cached')) || {},
		}));
	},

	async _SetupCandidates (inputData) {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;

		let cached = '';
		// cached = _mod._DataFoilOLSKDisk.OLSKDiskRead(OLSKCache.OLSKCachePath(__dirname, OLSKCache.OLSKCacheURLBasename(inputData)));
		const ParamMetadata = require('OLSKDOM').OLSKDOMMetadata(_mod._DataFoilOLSKDisk.OLSKDiskWrite(OLSKCache.OLSKCachePath(__dirname, OLSKCache.OLSKCacheURLBasename(inputData)), cached || await _mod._DataContentString(inputData)), {
			JSDOM: JSDOM.fragment,
		});

		return Object.fromEntries(_mod._DataDOMPropertyCandidates({
			ParamURL: inputData,
			ParamMetadata,
			ParamManifest: !ParamMetadata.manifest ? undefined : (function(body) {
				try {
					const manifestLink = OLSKLink.OLSKLinkRelativeURL(inputData, ParamMetadata.manifest);

					const outputData = JSON.parse(_mod._DataFoilOLSKDisk.OLSKDiskWrite(OLSKCache.OLSKCachePath(__dirname, OLSKCache.OLSKCacheURLBasename(manifestLink)), body));

					(outputData.icons || []).forEach(function (e) {
						e.src = OLSKLink.OLSKLinkRelativeURL(manifestLink, e);
					});
					
					return outputData;
				} catch (error) {
					return;
				}
			})(await _mod._DataContentString(OLSKLink.OLSKLinkRelativeURL(inputData, ParamMetadata.manifest))),
		}));
	},

	_SetupDetail (inputData) {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;

		return _mod._DataFoilOLSKCache.OLSKCacheResultFetchRenew({
			ParamMap: _mod._ValueCandidatesCache,
			ParamKey: inputData,
			ParamCallback: (function () {
				return _mod._ValueFetchQueue.OLSKQueueAdd(function () {
					return _mod._SetupCandidates(inputData);
				});
			}),
			ParamInterval: 1000 * 60 * 60 * 24,
			_ParamCallbackDidFinish: (function () {
				return _mod._DataFoilOLSKCache.OLSKCacheWriteFile(_mod._ValueCandidatesCache, mod.DataCacheAggregateBasename(), require('path').join(__dirname, '__cached'));
			}),
		});
	},

	_SetupDetailsIncoming () {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;

		return _mod._DataFoilBanks.DataBankProjects().filter(function (e) {
			return !_mod._ValueCandidatesCache[e.EASProjectURL];
		}).map(function (e) {
			return _mod._SetupDetail(e.EASProjectURL);
		});
	},

	SetupDetails () {
		const _mod = process.env.npm_lifecycle_script === 'olsk-spec' ? this : mod;

		return _mod._DataFoilBanks.DataBankProjects().map(function (e) {
			return _mod._SetupDetail(e.EASProjectURL);
		});
	},

};

Object.assign(exports, mod);
