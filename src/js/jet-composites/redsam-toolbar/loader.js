/**
  Copyright (c) 2015, 2020, Oracle and/or its affiliates.
  The Universal Permissive License (UPL), Version 1.0
*/
define(['ojs/ojcomposite', 'text!./redsam-toolbar-view.html', './redsam-toolbar-viewModel', 'text!./component.json', 'css!./redsam-toolbar-styles'],
  function(Composite, view, viewModel, metadata) {
    Composite.register('redsam-toolbar', {
      view: view,
      viewModel: viewModel,
      metadata: JSON.parse(metadata)
    });
  }
);