define(['ojs/ojcore', 'knockout', 'jquery', 'ojs/ojcollectiondataprovider', 'ojs/ojpagingdataproviderview', '../../appController',
  'ojs/ojmodel', 'ojs/ojtable', 'ojs/ojpagingcontrol', 'ojs/ojbutton', 'ojs/ojtoolbar', 'ojs/ojdialog', 'ojs/ojinputtext', 'ojs/ojinputnumber',
  'ojs/ojformlayout', 'ojs/ojvalidation-number', 'ojs/ojvalidationgroup', 'jet-composites/redsam-toolbar/1.0.0/loader'],
  function (oj, ko, $, CollectionDataProvider, PagingDataProvider, app) {

    function JobsViewModel(params) {
      var self = this;
      var userInfoSignal = params.userInfoSignal;

      self.serviceURL = app.getBaseURL() + 'Jobs';
      self.pagingDatasource = ko.observable();
      let currentJobId = null;

      self.jobId = ko.observable();
      self.jobTitle = ko.observable();
      self.minSalary = ko.observable();
      self.maxSalary = ko.observable();
      self.editMode = ko.observable('Edit');

      self.columnArray = [{
        "headerText": "Job ID",
        "field": "JobId"
      },
      {
        "headerText": "Job Title",
        "field": "JobTitle"
      },
      {
        "headerText": "Minimum Salary",
        "field": "MinSalary"
      },
      {
        "headerText": "Maximum Salary",
        "field": "MaxSalary"
      }];

      self.createJobsModel = function () {
        var JobsModel = oj.Model.extend({
          urlRoot: self.serviceURL,
          idAttribute: "JobId"
        });

        return new JobsModel();
      };

      self.createJobsCollection = function () {
        var JobsCollection = oj.Collection.extend({
          url: self.serviceURL,
          fetchSize: 5,
          model: self.createJobsModel()
        });

        return new JobsCollection();
      };

      self.jobsList = self.createJobsCollection();
      self.datasource = new PagingDataProvider(new CollectionDataProvider(self.jobsList));

      self.createAction = function (event) {
        self.editMode('Create');

        self.jobId(null);
        self.jobTitle(null);
        self.minSalary(null);
        self.maxSalary(null);

        document.getElementById('editDialog').open();
      }

      self.editAction = function (event) {
        if (currentJobId !== null) {
          self.editMode('Edit');
          var jobModel = self.jobsList.get(currentJobId);
          jobModel.then(function (data) {
            self.jobId(data.attributes.JobId);
            self.jobTitle(data.attributes.JobTitle);
            self.minSalary(data.attributes.MinSalary);
            self.maxSalary(data.attributes.MaxSalary);
          })

          document.getElementById('editDialog').open();
        }
      }

      self.removeAction = function (event) {
        if (currentJobId !== null) {
          var jobModel = self.jobsList.get(currentJobId);
          jobModel.then(function (model) {
            model.destroy({
              success: function (model, response, options) {
                self.jobsList.remove(model);
              }
            });
          })
        }
      }

      self.saveAction = function (event) {
        document.getElementById("minSalary").validate();
        document.getElementById("maxSalary").validate();

        var tracker = document.getElementById("valGroup");

        if (tracker.valid === "valid") {
          console.log("VALIDATION => SUCCESSFUL");
        } else {
          tracker.showMessages();
          tracker.focusOn("@firstInvalidShown");
          return;
        }

        var jobUpdatePaylod = {
          'JobId': self.jobId(),
          'JobTitle': self.jobTitle(),
          'MinSalary': self.minSalary(),
          'MaxSalary': self.maxSalary()
        }

        if (self.editMode() === 'Edit') {
          var jobModel = self.jobsList.get(self.jobId());
          jobModel.then(function (model) {
            model.save(jobUpdatePaylod, {
              contentType: 'application/vnd.oracle.adf.resourceitem+json',
              patch: 'patch',
              success: function (model, response, options) {
                document.getElementById('editDialog').close();
              },
              error: function (jqXHR, textStatus, errorThrown) {
                alert('Save failed with: ' + textStatus);
                document.getElementById('editDialog').close();
              }
            })
          })
        } else {
          self.jobsList.create(jobUpdatePaylod, {
            wait: true,
            contentType: 'application/vnd.oracle.adf.resourceitem+json',
            success: function (model, response, options) {
              document.getElementById('editDialog').close();
            },
            error: function (jqXHR, textStatus, errorThrown) {
              alert('Create failed with: ' + textStatus);
              document.getElementById('editDialog').close();
            }
          })
        }
      }

      self.minSalaryCheck = {
        validate: function (value) {
          if (!value) {
            return true;
          }
          
          if (self.maxSalary() !== null && value > self.maxSalary()) {
            throw new Error('Minimum salary must be < Maximum salary');
          }

          return true;
        }
      };

      self.maxSalaryCheck = {
        validate: function (value) {
          if (!value) {
            return true;
          }

          if (self.minSalary() !== null && value < self.minSalary()) {
            throw new Error('Maximum salary must be > Minimum salary');
          }

          return true;
        }
      };

      self.jobIdDisabled = ko.computed(function (event) {
        var ret = self.editMode() === 'Edit' ? true : false;
        return ret;
      })

      self.selectedChangedListener = function (event, data) {
        var selectedKey = '';
        if (event.detail.value.row.values().size > 0) {
          event.detail.value.row.values().forEach(function (key) {
            selectedKey += (selectedKey.length == 0 ? key : ', ' + key);
          });

          console.log('JOB ID sent: ' + selectedKey);
          currentJobId = selectedKey;

          userInfoSignal.dispatch(selectedKey);
        }
      }
    }

    return JobsViewModel;
  }
);
