/**
 * @license Licensed under the Apache License, Version 2.0 (the "License"):
 *          http://www.apache.org/licenses/LICENSE-2.0
 *
 * @fileoverview General javaScript for Arduino app with material design.
 */
'use strict';

/** Create a namespace for the application. */
var Ardublockly = Ardublockly || {};

/** Lookup for names of supported languages. Keys in ISO 639 format. */
Ardublockly.LANGUAGE_NAME = {
  'en': 'English',
  'es': 'Español'
};

/**
 * Selected language, default English.
 * @type {string}
 */
Ardublockly.LANG = 'en';

/** Initialize function for Ardublockly, to be called on page load. */
Ardublockly.init = function() {
  // Lang init must run first for the rest of the page to pick the right msgs
  Ardublockly.initLanguage();

  // Inject Blockly into content_blocks and fetch additional blocks
  Ardublockly.injectBlockly(document.getElementById('content_blocks'),
      Ardublockly.TOOLBOX_XML, '../blockly/');
  Ardublockly.importExtraBlocks();

  Ardublockly.designJsInit();
  Ardublockly.initialiseIdeButtons();

  Ardublockly.bindDesignEventListeners();
  Ardublockly.bindActionFunctions();
  Ardublockly.bindBlocklyEventListeners();

  // Check if not running locally
  if (document.location.hostname != 'localhost') {
    Ardublockly.openNotConnectedModal();
  }
};

/** Binds functions to each of the buttons, nav links, and related. */
Ardublockly.bindActionFunctions = function() {
  // Navigation buttons
  Ardublockly.bindClick_('button_load', Ardublockly.loadUserXmlFile);
  Ardublockly.bindClick_('button_save', Ardublockly.saveXmlFile);
  Ardublockly.bindClick_('button_delete', Ardublockly.discardAllBlocks);

  // Side menu buttons, they also close the side menu
  Ardublockly.bindClick_('menu_load', function() {
    Ardublockly.loadUserXmlFile();
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_save', function() {
    Ardublockly.saveXmlFile();
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_delete', function() {
    Ardublockly.discardAllBlocks();
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_settings', function() {
    Ardublockly.openSettings();
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_example_1', function() {
    Ardublockly.loadServerXmlFile('../examples/blink.xml');
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_example_2', function() {
    Ardublockly.loadServerXmlFile('../examples/serial_print_ascii_.xml');
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_example_3', function() {
    Ardublockly.loadServerXmlFile('../examples/serial_repeat_game.xml');
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_example_4', function() {
    Ardublockly.loadServerXmlFile('../examples/servo_knob.xml');
    $('.button-collapse').sideNav('hide');
  });
  Ardublockly.bindClick_('menu_example_5', function() {
    Ardublockly.loadServerXmlFile('../examples/stepper_knob.xml');
    $('.button-collapse').sideNav('hide');
  });

  // Floating buttons
  Ardublockly.bindClick_('button_ide_large', function() {
    Ardublockly.ideButtonLargeAction();
  });
  Ardublockly.bindClick_('button_ide_middle', function() {
      Ardublockly.ideButtonMiddleAction();
  });
  Ardublockly.bindClick_('button_ide_left', function() {
    Ardublockly.ideButtonLeftAction();
  });
  Ardublockly.bindClick_('button_load_xml', Ardublockly.XmlTextareaToBlocks);
  Ardublockly.bindClick_('button_toggle_toolbox', Ardublockly.toogleToolbox);

  // Settings modal input field listeners
  Ardublockly.bindClick_('settings_compiler_location', function() {
    ArdublocklyServer.requestNewCompilerLocation(
        Ardublockly.setCompilerLocationHtml);
  });
  Ardublockly.bindClick_('settings_sketch_location', function() {
    ArdublocklyServer.requestNewSketchLocation(
        Ardublockly.setSketchLocationHtml);
  });
};

/** Initialize the page language. */
Ardublockly.initLanguage = function() {
  // Save the current default state
  var defaultLang = Ardublockly.LANG;

  // Check server settings and url language, url gets priority
  Ardublockly.LANG = Ardublockly.getUrlLanguage() ||
      Ardublockly.getLanguageSetting() || Ardublockly.LANG;

  Ardublockly.populateLanguageMenu(Ardublockly.LANG);

  if (defaultLang !== Ardublockly.LANG) {
      Ardublockly.injectLanguageJsSources();
      Ardublockly.updateLanguageText();
  }
};

/**
 * Get the language previously set by the user from the server settings.
 * @return {string} Language saved in the server settings.
 */
Ardublockly.getLanguageSetting = function() {
  //TODO: Server feature still to be implemented, for now return default
  return null;
};

/**
 * Get the language selected from the URL, format '?lang=en'.
 * @return {string} Selected language.
 */
Ardublockly.getUrlLanguage = function() {
  var langKey = 'lang';
  var val = location.search.match(new RegExp('[?&]' + langKey + '=([^&]+)'));
  var language = val ? decodeURIComponent(val[1].replace(/\+/g, '%20')) : '';
  if (Ardublockly.LANGUAGE_NAME[language] === undefined) {
    language = null;
  }
  return language;
};

/**
 * Populates the settings language selection menu.
 * @param {!string} selectedLang Language to be marked as selected.
 */
Ardublockly.populateLanguageMenu = function(selectedLang) {
  var languageMenu = document.getElementById('language');
  languageMenu.options.length = 0;

  for (var lang in Ardublockly.LANGUAGE_NAME) {
    var option = new Option(Ardublockly.LANGUAGE_NAME[lang], lang);
    if (lang == selectedLang) {
      option.selected = true;
    }
    languageMenu.options.add(option);
  }
  languageMenu.onchange = Ardublockly.changeLanguage;
};

/** Updates the page displayed text with the new language. */
Ardublockly.updateLanguageText = function() {
  //TODO: The page strings still need to be moved into language files
  //document.getElementById('xxx').textContent = MSG['xxx'];
  //document.getElementById('xxxButton').title = MSG['xxx'];
};

/** Injects the language JavaScript files into the html head element. */
Ardublockly.injectLanguageJsSources = function() {
  var head = document.getElementsByTagName('head')[0];
  var appLangJsLoad = document.createElement('script');
  appLangJsLoad.src = 'msg/' + Ardublockly.LANG + '.js';
  head.appendChild(appLangJsLoad);
  var blocklyLangJsLoad = document.createElement('script');
  blocklyLangJsLoad.src = '../blockly/msg/js/' + Ardublockly.LANG + '.js';
  head.appendChild(blocklyLangJsLoad);
};

/** Saves the blocks and reloads with a different language. */
Ardublockly.changeLanguage = function() {
  // Store the blocks for the duration of the reload only
  Ardublockly.saveSessionStorageBlocks();

  var languageMenu = document.getElementById('language');
  var newLang = encodeURIComponent(
      languageMenu.options[languageMenu.selectedIndex].value);
  var search = window.location.search;
  if (search.length <= 1) {
    search = '?lang=' + newLang;
  } else if (search.match(/[?&]lang=[^&]*/)) {
    search = search.replace(/([?&]lang=)[^&]*/, '$1' + newLang);
  } else {
    search = search.replace(/\?/, '?lang=' + newLang + '&');
  }

  window.location = window.location.protocol + '//' +
      window.location.host + window.location.pathname + search;
};

/** Sets the Ardublockly server IDE setting to upload and sends the code. */
Ardublockly.ideSendUpload = function() {
  // Check if this is the currently selected option before edit sever setting
  if (Ardublockly.ideButtonLargeAction !== Ardublockly.ideSendUpload) {
    Ardublockly.showExtraIdeButtons(false);
    Ardublockly.setIdeSettings(null, 'upload');
  }
  Ardublockly.shortMessage('Uploading sketch into Arduino...');
  Ardublockly.resetIdeOutputContent();
  Ardublockly.sendCode();
};

/** Sets the Ardublockly server IDE setting to verify and sends the code. */
Ardublockly.ideSendVerify = function() {
  // Check if this is the currently selected option before edit sever setting
  if (Ardublockly.ideButtonLargeAction !== Ardublockly.ideSendVerify) {
    Ardublockly.showExtraIdeButtons(false);
    Ardublockly.setIdeSettings(null, 'verify');
  }
  Ardublockly.shortMessage('Verifying sketch...');
  Ardublockly.resetIdeOutputContent();
  Ardublockly.sendCode();
};

/** Sets the Ardublockly server IDE setting to open and sends the code. */
Ardublockly.ideSendOpen = function() {
  // Check if this is the currently selected option before edit sever setting
  if (Ardublockly.ideButtonLargeAction !== Ardublockly.ideSendOpen) {
    Ardublockly.showExtraIdeButtons(false);
    Ardublockly.setIdeSettings(null, 'open');
  }
  Ardublockly.shortMessage('Opening sketch in the Arduino IDE...');
  Ardublockly.resetIdeOutputContent();
  Ardublockly.sendCode();
};

/** Function bound to the left IDE button, to be changed based on settings. */
Ardublockly.ideButtonLargeAction = Ardublockly.ideSendUpload;

/** Function bound to the middle IDE button, to be changed based on settings. */
Ardublockly.ideButtonMiddleAction = Ardublockly.ideSendVerify;

/** Function bound to the large IDE button, to be changed based on settings. */
Ardublockly.ideButtonLeftAction = Ardublockly.ideSendOpen;

/** Initialises the IDE buttons with the default option from the server. */
Ardublockly.initialiseIdeButtons = function() {
  document.getElementById('button_ide_left').title = 'Open Sketch in IDE';
  document.getElementById('button_ide_middle').title = 'Verify the Sketch';
  document.getElementById('button_ide_large').title =
      'Upload Sketch to the Arduino';
  ArdublocklyServer.requestIdeOptions(function(jsonResponse) {
    if (jsonResponse != null) {
      var parsedJson = JSON.parse(jsonResponse);
      // "response_type" : "settings_board",
      //   "element" : "dropdown",
      //   "options" : [ {"value" : "XXX", "text" : "XXX"}, ...]
      //   "selected": "selected key"}
      Ardublockly.changeIdeButtons(parsedJson.selected);
    } // else Null: Ardublockly server is not running, do nothing
  });
};

/**
 * Changes the IDE launch buttons based on the option indicated in the argument.
 * @param {!string} value One of the 3 possible values from the drop down select
 *     in the settings modal: 'upload', 'verify', or 'open'.
 */
Ardublockly.changeIdeButtons = function(value) {
  var largeButton = document.getElementById('button_ide_large');
  var middleButton = document.getElementById('button_ide_middle');
  var leftButton = document.getElementById('button_ide_left');
  var openTitle = 'Open Sketch in IDE';
  var verifyTitle = 'Verify the Sketch';
  var uploadTitle = 'Upload Sketch to the Arduino';
  if (value === 'upload') {
    Ardublockly.changeIdeButtonsDesign(value);
    Ardublockly.ideButtonLeftAction = Ardublockly.ideSendOpen;
    Ardublockly.ideButtonMiddleAction = Ardublockly.ideSendVerify;
    Ardublockly.ideButtonLargeAction = Ardublockly.ideSendUpload;
    leftButton.title = openTitle;
    middleButton.title = verifyTitle;
    largeButton.title = uploadTitle;
  } else if (value === 'verify') {
    Ardublockly.changeIdeButtonsDesign(value);
    Ardublockly.ideButtonLeftAction = Ardublockly.ideSendOpen;
    Ardublockly.ideButtonMiddleAction = Ardublockly.ideSendUpload;
    Ardublockly.ideButtonLargeAction = Ardublockly.ideSendVerify;
    leftButton.title = openTitle;
    middleButton.title = uploadTitle;
    largeButton.title = verifyTitle;
  } else if (value === 'open') {
    Ardublockly.changeIdeButtonsDesign(value);
    Ardublockly.ideButtonLeftAction = Ardublockly.ideSendVerify;
    Ardublockly.ideButtonMiddleAction = Ardublockly.ideSendUpload;
    Ardublockly.ideButtonLargeAction = Ardublockly.ideSendOpen;
    leftButton.title = verifyTitle;
    middleButton.title = uploadTitle;
    largeButton.title = openTitle;
  }
};

/**
 * Loads an XML file from the server and replaces the current blocks into the
 * Blockly workspace.
 * @param {!string} xmlFile Server location of the XML file to load.
 */
Ardublockly.loadServerXmlFile = function(xmlFile) {
  var loadXmlfileAccepted = function() {
    // loadXmlBlockFile loads the file asynchronously and needs a callback
    var loadXmlCb = function(sucess) {
      if (sucess) {
        Ardublockly.renderContent();
      } else {
        Ardublockly.alertMessage(
            'Invalid XML',
            'The XML file was not successfully parsed into blocks.' +
            'Please review the XML code and try again.',
            false);
      }
    };
    var connectionErrorCb = function() {
      Ardublockly.openNotConnectedModal();
    };
    Ardublockly.loadXmlBlockFile(xmlFile, loadXmlCb, connectionErrorCb);
  };

  if (Ardublockly.isWorkspaceEmpty()) {
    loadXmlfileAccepted();
  } else {
    Ardublockly.alertMessage(
        'Load new blocks?',
        'Loading a new XML file will replace the current blocks from the ' +
        'workspace.\nAre you sure you want to proceed?',
        true, loadXmlfileAccepted);
  }
};

/**
 * Loads an XML file from the users file system and adds the blocks into the
 * Blockly workspace.
 */
Ardublockly.loadUserXmlFile = function() {
  // Create event listener function
  var parseInputXMLfile = function(e) {
    var files = e.target.files;
    var reader = new FileReader();
    reader.onload = function() {
      var success = Ardublockly.replaceBlocksfromXml(reader.result);
      if (success) {
        Ardublockly.renderContent();
      } else {
        Ardublockly.alertMessage(
            'Invalid XML',
            'The XML file was not successfully parsed into blocks.' +
            'Please review the XML code and try again.',
            false);
      }
    };
    reader.readAsText(files[0]);
  };
  // Create once invisible browse button with event listener, and click it
  var selectFile = document.getElementById('select_file');
  if (selectFile == null) {
    var selectFileDom = document.createElement('INPUT');
    selectFileDom.type = 'file';
    selectFileDom.id = 'select_file';

    var selectFileWrapperDom = document.createElement('DIV');
    selectFileWrapperDom.id = 'select_file_wrapper';
    selectFileWrapperDom.style.display = 'none';
    selectFileWrapperDom.appendChild(selectFileDom);

    document.body.appendChild(selectFileWrapperDom);
    selectFile = document.getElementById('select_file');
    selectFile.addEventListener('change', parseInputXMLfile, false);
  }
  selectFile.click();
};

/**
 * Creates an XML file containing the blocks from the Blockly workspace and
 * prompts the users to save it into their local file system.
 */
Ardublockly.saveXmlFile = function() {
  Ardublockly.saveTextFileAs(
      document.getElementById('sketch_name').value + '.xml',
      Ardublockly.generateXml());
};

/**
 * Creates an Arduino Sketch file containing the Arduino code generated from
 * the Blockly workspace and prompts the users to save it into their local file
 * system.
 */
Ardublockly.saveSketchFile = function() {
  Ardublockly.saveTextFileAs(
      document.getElementById('sketch_name').value + '.ino',
      ArduBlockly.generateArduino());
};

/**
 * Creates an text file with the input content and files name, and prompts the
 * users to save it into their local file system.
 * @param {!string} fileName Name for the file to be saved.
 * @param {!string} content Text datd to be saved in to the file.
 */
Ardublockly.saveTextFileAs = function(fileName, content) {
  var blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
  saveAs(blob, fileName);
};

/**
 * Retrieves the Settings from ArdublocklyServer to populates the form data
 * and opens the Settings modal dialog.
 */
Ardublockly.openSettings = function() {
  ArdublocklyServer.requestCompilerLocation(
      Ardublockly.setCompilerLocationHtml);
  ArdublocklyServer.requestSketchLocation(Ardublockly.setSketchLocationHtml);
  ArdublocklyServer.requestArduinoBoards(Ardublockly.setArduinoBoardsHtml);
  ArdublocklyServer.requestSerialPorts(Ardublockly.setSerialPortsHtml);
  ArdublocklyServer.requestIdeOptions(Ardublockly.setIdeHtml);
  // Language menu only set on page load within Ardublockly.initLanguage()
  Ardublockly.openSettingsModal();
};

/**
 * Sets the compiler location form data retrieve from an updated element.
 * @param {element} jsonResponse JSON data coming back from the server.
 */
Ardublockly.setCompilerLocationHtml = function(jsonResponse) {
  if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
  var newEl = ArdublocklyServer.createElementFromJson(jsonResponse);
  var compLocIp = document.getElementById('settings_compiler_location');
  if (compLocIp != null) {
    compLocIp.value = newEl.value;
  }
};

/**
 * Sets the sketch location form data retrieve from an updated element.
 * @param {element} jsonResponse JSON data coming back from the server.
 */
Ardublockly.setSketchLocationHtml = function(jsonResponse) {
  if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
  var newEl = ArdublocklyServer.createElementFromJson(jsonResponse);
  var sketchLocIp = document.getElementById('settings_sketch_location');
  if (sketchLocIp != null) {
    sketchLocIp.value = newEl.value;
  }
};

/**
 * Replaces the Arduino Boards form data with a new HTMl element.
 * Ensures there is a change listener to call 'setSerialPort' function
 * @param {element} jsonResponse JSON data coming back from the server.
 */
Ardublockly.setArduinoBoardsHtml = function(jsonResponse) {
  if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
  var newEl = ArdublocklyServer.createElementFromJson(jsonResponse);
  var boardDropdown = document.getElementById('board');
  if (boardDropdown !== null) {
    // Restarting the select elements built by materialize
    $('select').material_select('destroy');
    newEl.name = 'settings_board';
    newEl.id = 'board';
    newEl.onchange = Ardublockly.setBoard;
    boardDropdown.parentNode.replaceChild(newEl, boardDropdown);
    // Refresh the materialize select menus
    $('select').material_select();
  }
};

/**
 * Sets the Arduino Board type with the selected user input from the drop down.
 */
Ardublockly.setBoard = function() {
  var el = document.getElementById('board');
  var boardValue = el.options[el.selectedIndex].value;
  //TODO: Check how ArdublocklyServer deals with invalid data and sanitise
  ArdublocklyServer.setArduinoBoard(
      boardValue, Ardublockly.setArduinoBoardsHtml);
  Ardublockly.changeBlocklyArduinoBoard(boardValue.toLowerCase());
};

/**
 * Replaces the Serial Port form data with a new HTMl element.
 * Ensures there is a change listener to call 'setSerialPort' function
 * @param {element} jsonResponse JSON data coming back from the server.
 */
Ardublockly.setSerialPortsHtml = function(jsonResponse) {
  if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
  var newEl = ArdublocklyServer.createElementFromJson(jsonResponse);
  var serialDropdown = document.getElementById('serial_port');
  if (serialDropdown !== null) {
    // Restarting the select elements built by materialize
    $('select').material_select('destroy');
    newEl.name = 'settings_serial';
    newEl.id = 'serial_port';
    newEl.onchange = Ardublockly.setSerial;
    serialDropdown.parentNode.replaceChild(newEl, serialDropdown);
    // Refresh the materialize select menus
    $('select').material_select();
  }
};

/** Sets the Serial Port with the selected user input from the drop down. */
Ardublockly.setSerial = function() {
  var el = document.getElementById('serial_port');
  var serialValue = el.options[el.selectedIndex].value;
  //TODO: check how ArdublocklyServer deals with invalid data and sanitise
  ArdublocklyServer.setSerialPort(
      serialValue, Ardublockly.setSerialPortsHtml);
};

/**
 * Replaces IDE options form data with a new HTMl element.
 * Ensures there is a change listener to call 'setIdeSettings' function
 * @param {element} jsonResponse JSON data coming back from the server.
 */
Ardublockly.setIdeHtml = function(jsonResponse) {
  if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
  var newEl = ArdublocklyServer.createElementFromJson(jsonResponse);
  var ideDropdown = document.getElementById('ide_settings');
  if (ideDropdown !== null) {
    // Restarting the select elements built by materialize
    $('select').material_select('destroy');
    newEl.name = 'settings_ide';
    newEl.id = 'ide_settings';
    newEl.onchange = Ardublockly.setIdeSettings;
    ideDropdown.parentNode.replaceChild(newEl, ideDropdown);
    // Refresh the materialize select menus
    $('select').material_select();
  }
};

/**
 * Sets the IDE settings data with the selected user input from the drop down.
 * @param {Event} e Event that triggered this function call. Required for link
 *     it to the listeners, but not used.
 * @param {string} preset A value to set the IDE settings bypassing the drop
 *     down selected value. Valid data: 'upload', 'verify', or 'open'.
 */
Ardublockly.setIdeSettings = function(e, preset) {
  if (preset !== undefined) {
    var ideValue = preset;
  } else {
    var el = document.getElementById('ide_settings');
    var ideValue = el.options[el.selectedIndex].value;
  }
  Ardublockly.changeIdeButtons(ideValue);
  //TODO: check how ArdublocklyServer deals with invalid data and sanitise here
  ArdublocklyServer.setIdeOptions(ideValue, Ardublockly.setIdeHtml);
};

/**
 * Send the Arduino Code to the ArdublocklyServer to process.
 * Shows a loader around the button, blocking it (unblocked upon received
 * message from server).
 */
Ardublockly.sendCode = function() {
  Ardublockly.largeIdeButtonSpinner(true);

  /**
   * Receives the IDE data back to be displayed and stops spinner.
   * @param {element} jsonResponse JSON data coming back from the server.
   */
  var sendCodeReturn = function(jsonResponse) {
    Ardublockly.largeIdeButtonSpinner(false);
    if (jsonResponse === null) return Ardublockly.openNotConnectedModal();
    var dataBack = ArdublocklyServer.createElementFromJson(jsonResponse);
    Ardublockly.arduinoIdeOutput(dataBack);
  };

  ArdublocklyServer.sendSketchToServer(
      Ardublockly.generateArduino(), sendCodeReturn);
};

/** Populate the workspace blocks with the XML written in the XML text area. */
Ardublockly.XmlTextareaToBlocks = function() {
  var success = Ardublockly.replaceBlocksfromXml(
      document.getElementById('content_xml').value);
  if (success) {
    Ardublockly.renderContent();
  } else {
    Ardublockly.alertMessage(
        'Invalid XML',
        'The XML inputted into the text area was not successfully parsed into' +
        'blocks. Please review the XML code and try again.',
        false);
  }
};

/**
 * Private variable to save the previous version of the Arduino Code.
 * @type {!String}
 * @private
 */
Ardublockly.PREV_ARDUINO_CODE_ = 'void setup() {\n\n}\n\n\nvoid loop() {\n\n}';

/**
 * Populate the Arduino Code and Blocks XML panels with content generated from
 * the blocks.
 */
Ardublockly.renderContent = function() {
  // Only regenerate the code if a block is not being dragged
  if (Ardublockly.blocklyIsDragging()) return;

  // Render Arduino Code with latest change highlight and syntax highlighting
  var arduinoCode = Ardublockly.generateArduino();
  if (arduinoCode !== Ardublockly.PREV_ARDUINO_CODE_) {
    var diff = JsDiff.diffWords(Ardublockly.PREV_ARDUINO_CODE_, arduinoCode);
    var resultStringArray = [];
    for (var i = 0; i < diff.length; i++) {
      if (diff[i].added) {
        resultStringArray.push(
            '<span class="code_highlight_new">' + diff[i].value + '</span>');
      } else if (!diff[i].removed) {
        resultStringArray.push(diff[i].value);
      }
    }
    document.getElementById('content_arduino').innerHTML =
        prettyPrintOne(resultStringArray.join(''), 'cpp', false);
    Ardublockly.PREV_ARDUINO_CODE_ = arduinoCode;
  }

  // Generate plain XML into element
  document.getElementById('content_xml').value = Ardublockly.generateXml();
};

/**
 * Private variable to indicate if the toolbox is meant to be shown.
 * @type {!boolean}
 * @private
 */
Ardublockly.TOOLBAR_SHOWING_ = true;

/**
 * Toggles the blockly toolbox and the Ardublockly toolbox button On and Off.
 * Uses namespace member variable TOOLBAR_SHOWING_ to toggle state.
 */
Ardublockly.toogleToolbox = function() {
  if (Ardublockly.TOOLBAR_SHOWING_) {
    Ardublockly.blocklyCloseToolbox();
    Ardublockly.displayToolbox(false);
  } else {
    Ardublockly.displayToolbox(true);
  }
  Ardublockly.TOOLBAR_SHOWING_ = !Ardublockly.TOOLBAR_SHOWING_;
};

/** @return {boolean} Indicates if the toolbox is currently visible. */
Ardublockly.isToolboxVisible = function() {
  return Ardublockly.TOOLBAR_SHOWING_;
};

/**
 * Lazy loads the additional block JS files from the ./block directory.
 * Initialises any additional Ardublockly extensions.
 * TODO: Loads the examples into the examples modal
 */
Ardublockly.importExtraBlocks = function() {
  /**
   * Parses the JSON data to find the block and languages js files.
   * @param {jsonDataObj} jsonDataObj JSON in JavaScript object format, null
   *     indicates an error occurred.
   */
  var jsonDataCb = function(jsonDataObj) {
    if (jsonDataObj === null) return Ardublockly.openNotConnectedModal();
    if (jsonDataObj.categories !== undefined) {
      var head = document.getElementsByTagName('head')[0];
      for (var catDir in jsonDataObj.categories) {
        var blocksJsLoad = document.createElement('script');
        blocksJsLoad.src = '../blocks/' + catDir + '/blocks.js';
        head.appendChild(blocksJsLoad);

        var blocksLangJsLoad = document.createElement('script');
        blocksLangJsLoad.src = '../blocks/' + catDir + '/msg/' + 'messages.js';
            //'lang/' + Ardublockly.LANG + '.js';
        head.appendChild(blocksLangJsLoad);

        var blocksGeneratorJsLoad = document.createElement('script');
        blocksGeneratorJsLoad.src = '../blocks/' + catDir +
            '/generator_arduino.js';
        head.appendChild(blocksGeneratorJsLoad);

        // Check if the blocks add additional Ardublockly functionality
        var extensions = jsonDataObj.categories[catDir].extensions
        if (extensions) {
          for (var i = 0; i < extensions.length; i++) {
            var blockExtensionJsLoad = document.createElement('script');
            blockExtensionJsLoad.src = '../blocks/' + catDir + '/extensions.js';
            head.appendChild(blockExtensionJsLoad);
            // Add function to scheduler as lazy loading has to complete first
            setTimeout(function(category, extension) {
              var extensionNamespaces = extension.split('.');
              var extensionCall = window;
              var invalidFunc = false;
              for (var j = 0; j < extensionNamespaces.length; j++) {
                extensionCall = extensionCall[extensionNamespaces[j]];
                if (extensionCall === undefined) {
                  invalidFunc = true;
                  break;
                }
              }
              if (typeof extensionCall != 'function') {
                invalidFunc = true;
              }
              if (invalidFunc) {
                throw 'Blocks ' + category.categoryName + ' extension "' +
                      extension + '" is not a valid function.';
              } else {
                extensionCall();
              }
            }, 800, jsonDataObj.categories[catDir], extensions[i]);
          }
        }
      }
    }
  };
  // Reads the JSON data containing all block categories from ./blocks directory
  // TODO: Now reading a local file, to be replaced by server generated JSON
  Ardublockly.getJsonData('../blocks/blocks_data.json', jsonDataCb);
};

/** Opens a modal with a list of categories to add or remove to the toolbox */
Ardublockly.openExtraCategoriesSelect = function() {
  /**
   * Parses the JSON data from the server into a list of additional categories.
   * @param {jsonDataObj} jsonDataObj JSON in JavaScript object format, null
   *     indicates an error occurred.
   */
  var jsonDataCb = function(jsonDataObj) {
    if (jsonDataObj === null) return Ardublockly.openNotConnectedModal();
    var htmlContent = document.createElement('div');
    if (jsonDataObj.categories !== undefined) {
      for (var catDir in jsonDataObj.categories) {
        // Function required to maintain each loop variable scope separated
        (function(cat) {
          var clickBind = function(tickValue) {
            if (tickValue) {
              var catDom = (new DOMParser()).parseFromString(
                  cat.toolbox.join(''), 'text/xml').firstChild;
              Ardublockly.addToolboxCategory(cat.toolboxName, catDom);
            } else {
              Ardublockly.removeToolboxCategory(cat.toolboxName);
            }
          };
          htmlContent.appendChild(Ardublockly.createExtraBlocksCatHtml(
              cat.categoryName, cat.description, clickBind));
        })(jsonDataObj.categories[catDir]);
      }
    }
    Ardublockly.openAdditionalBlocksModal(htmlContent);
  };
  // Reads the JSON data containing all block categories from ./blocks directory
  // TODO: Now reading a local file, to be replaced by server generated JSON
  Ardublockly.getJsonData('../blocks/blocks_data.json', jsonDataCb);
};

/** Informs the user that the selected function is not yet implemented. */
Ardublockly.functionNotImplemented = function() {
  Ardublockly.shortMessage('Function not yet implemented');
};

/**
 * Interface to display messages with a possible action.
 * @param {!string} title HTML to include in title.
 * @param {!element} body HTML to include in body.
 * @param {boolean=} confirm Indicates if the user is shown a single option (ok)
 *     or an option to cancel, with an action applied to the "ok".
 * @param {string=|function=} callback If confirm option is selected this would
 *     be the function called when clicked 'OK'.
 */
Ardublockly.alertMessage = function(title, body, confirm, callback) {
  Ardublockly.materialAlert(title, body, confirm, callback);
};

/**
 * Interface to displays a short message, which disappears after a time out.
 * @param {!string} message Text to be temporarily displayed.
 */
Ardublockly.shortMessage = function(message) {
  Ardublockly.MaterialToast(message);
};

/**
 * Bind a function to a button's click event.
 * On touch enabled browsers, ontouchend is treated as equivalent to onclick.
 * @param {!Element|string} el Button element or ID thereof.
 * @param {!function} func Event handler to bind.
 * @private
 */
Ardublockly.bindClick_ = function(el, func) {
  if (typeof el == 'string') {
    el = document.getElementById(el);
  }
  // Need to ensure both, touch and click, events don't fire for the same thing
  var propagateOnce = function(e) {
    e.stopPropagation();
    e.preventDefault();
    func();
  };
  el.addEventListener('ontouchend', propagateOnce);
  el.addEventListener('click', propagateOnce);
};
