sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend("db.almdashboardapp.controller.AlmDashborad", {
        onInit: function () {
            var oVizFrame = this.getView().byId("yourChartId");
            var vizPopover = new sap.viz.ui5.controls.Popover({});
            vizPopover.connect(oVizFrame.getVizUid());

            this.fnCovidReport();
        },

        fnCovidReport: function () {
            
            var oThat = this;

            $.ajax({
                type: "GET",
                url: "https://prometheus-hackathon.cfapps.us10.hana.ondemand.com/api/v1/query_range?query=hm_value&start=2023-07-11T20:10:30.781Z&end=2023-07-11T23:10:30.781Z&step=90s",
                dataType: "json",
                success: function (result, response) {
                    var oData = result.data.result;
                    var Data = response;
                    var jsondata = JSON.stringify(Data);
                    console.log(jsondata);

                    var aTransformedData = [];

                    for (var i = 0; i < oData.length; i++) {
                        var oMetric = oData[i].metric;
                        var aValues = oData[i].values;

                        for (var j = 0; j < aValues.length; j++) {
                            var oValue = aValues[j];
                            var timestamp = new Date(oValue[0] * 1000);
                            var date = timestamp.toLocaleDateString();
                            var time = timestamp.toLocaleTimeString();
                            var oEntry = {
                                date: date,
                                time: time,
                                value: oValue[1],
                                metric: oMetric.metricName,
                                instance: oMetric.instance,
                                job: oMetric.job,
                                measure: oMetric.measure,
                                metricLabel: oMetric.metricLabel,
                                serviceId: oMetric.serviceId,
                                serviceName: oMetric.serviceName,
                                serviceType: oMetric.serviceType
                            };
                            aTransformedData.push(oEntry);
                        }
                    }

                    var oALMData = new JSONModel(aTransformedData);
                    oThat.getView().setModel(oALMData, "ALMData");

                    console.log(aTransformedData);

                    // Populate the dropdown with metric values
                    var aMetricValues = aTransformedData.map(function(entry) {
                        return entry.metric;
                    }).filter(function(value, index, self) {
                        return self.indexOf(value) === index;
                    });

                    var oDropdown = oThat.getView().byId("metricDropdown");
                    aMetricValues.forEach(function(metric) {
                        oDropdown.addItem(new sap.ui.core.Item({ key: metric, text: metric }));
                    });
                },
                error: function (error) {
                    MessageToast.show("Error retrieving data from the service");
                }
            });
        },

        onSettingsButtonPress: function () {
            var oChart = this.getView().byId("yourChartId");

            if (!this._oSettingsPopover) {
                this._oSettingsPopover = new sap.m.Popover({
                    showHeader: false,
                    placement: sap.m.PlacementType.Bottom,
                    contentWidth: "200px",
                    contentHeight: "300px",
                    content: [
                        new sap.m.Label({ text: "Filter By Metric:" }),
                        new sap.m.Select({
                            id: "metricFilterSelect",
                            items: {
                                path: "ALMData>/",
                                template: new sap.ui.core.Item({
                                    key: "{ALMData>metric}",
                                    text: "{ALMData>metric}"
                                })
                            },
                            change: this.onFilterChange.bind(this)
                        })
                    ]
                });

                this.getView().addDependent(this._oSettingsPopover);
            }

            this._oSettingsPopover.openBy(oChart);
        },

        onFilterChange: function (oEvent) {
            var sSelectedMetric = oEvent.getParameter("selectedItem").getKey();
            var oChart = this.getView().byId("yourChartId");
            var oDataset = oChart.getDataset();

            if (sSelectedMetric) {
                var oFilter = new sap.ui.model.Filter("metric", sap.ui.model.FilterOperator.EQ, sSelectedMetric);
                oDataset.getBinding("data").filter([oFilter]);
            } else {
                oDataset.getBinding("data").filter([]);
            }
        }
    });
});
