/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"db/alm_dashboardapp/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
