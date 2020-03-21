define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojcollectiondataprovider', 'ojs/ojpagingdataproviderview', '../../appController',
  'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojcollectiontabledatasource'],
  function (oj, ko, $, CollectionDataProvider, PagingDataProvider, app) {

    function EmployeesViewModel(params) {
      var self = this;
      var userInfoSignal = params.userInfoSignal;

      self.serviceURL = app.getBaseURL() + 'Employees';
      var emplsFilter = '';

      self.columnArray = [{
        "headerText": "Employee ID",
        "field": "EmployeeId"
      },
      {
        "headerText": "First Name",
        "field": "FirstName"
      },
      {
        "headerText": "Last Name",
        "field": "LastName"
      },
      {
        "headerText": "Phone Number",
        "field": "PhoneNumber"
      },
      {
        "headerText": "Email",
        "field": "Email"
      },
      {
        "headerText": "Job ID",
        "field": "JobId"
      }];

      function getEmployeesURL(operation, collection, options) {
        var url = self.serviceURL;
        if (options.fetchSize !== undefined) {
          url += "?limit=" + options.fetchSize;
          sawOpt = true;
        }
        if (options.startIndex !== undefined) {
          url += "&offset=" + options.startIndex;
        }
        var q = constructFilterEmployees();
        if (q !== undefined && q !== "") {
          url += "&q=" + q;
        }
        url += "&totalResults=true";

        return url;
      };

      function constructFilterEmployees() {
        if (emplsFilter !== undefined && emplsFilter !== '') {
          return "JobId='" + emplsFilter + "'";
        }

        return "JobId='-1'";
      };

      self.createEmployeesModel = function () {
        var EmployeeModel = oj.Model.extend({
          urlRoot: self.serviceURL,
          idAttribute: "EmployeeId"
        });

        return new EmployeeModel();
      };

      self.createEmployeesCollection = function () {
        var EmployeesCollection = oj.Collection.extend({
          customURL: getEmployeesURL,
          fetchSize: 5,
          model: self.createEmployeesModel()
        });

        return new EmployeesCollection();
      };

      self.employeesList = self.createEmployeesCollection();
      self.datasource = new ko.observable(new PagingDataProvider(new CollectionDataProvider(self.employeesList)));

      userInfoSignal.add(function (jobId) {
        console.log('JOB ID received: ' + jobId);

        emplsFilter = jobId;
        self.employeesList.fetch({
          success: function (collection, response, options) {
            self.datasource(new PagingDataProvider(new CollectionDataProvider(self.employeesList)));
          }
        });
      });
    }

    return EmployeesViewModel;
  }
);