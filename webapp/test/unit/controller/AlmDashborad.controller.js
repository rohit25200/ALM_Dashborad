/*global QUnit*/

sap.ui.define([
	"db/alm_dashboardapp/controller/AlmDashborad.controller"
], function (Controller) {
	"use strict";

	QUnit.module("AlmDashborad Controller");

	QUnit.test("I should test the AlmDashborad controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
