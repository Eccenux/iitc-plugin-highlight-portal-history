// ==UserScript==
// @name           IITC plugin: Highlight portals based on history
// @author         Johtaja
// @category       Highlighter
// @version        0.2.1
// @description    Use the portal fill color to denote the portal has been visited, captured, scout controlled
// @id             highlight-portal-history
// @namespace      https://github.com/IITC-CE/ingress-intel-total-conversion
// @match          https://intel.ingress.com/*
// @grant          none
// @updateURL      https://github.com/Eccenux/iitc-plugin-highlight-portal-history/raw/master/highlight-portal-history.meta.js
// @downloadURL    https://github.com/Eccenux/iitc-plugin-highlight-portal-history/raw/master/highlight-portal-history.user.js
// ==/UserScript==

function wrapper(plugin_info) {
// ensure plugin framework is there, even if iitc is not yet loaded
if(typeof window.plugin !== 'function') window.plugin = function() {};

// use own namespace for plugin
var portalsHistory = {};
window.plugin.portalHighlighterPortalsHistory = portalsHistory;

// nux: custom styles
portalsHistory.styles = {
  common: {
    fillOpacity: 0.8,
  },
  marked: {
    fillColor: 'red',
  },
  semiMarked: {
    fillColor: 'yellow'
  },
  commonOther: {
    // transparent by default
    fillOpacity: 0.2,
	opacity: 0.2,
  }
};

portalsHistory.setStyle = function (data, name) {
  data.portal.setStyle(portalsHistory.styles[name]);
};

portalsHistory.visited = function (data) {
  var history = data.portal.options.data.history;
  if (!history) {
    return;
  }
  var s = portalsHistory.styles;
  if (history.captured) {
    data.portal.setStyle(s.captured);
  } else if (history.visited) {
    data.portal.setStyle(s.visited);
  } else if (!$.isEmptyObject(s.otherVC)) {
    data.portal.setStyle(s.otherVC);
  }
};

portalsHistory.notVisited = function (data) {
  var history = data.portal.options.data.history;
  if (!history) {
    return;
  }
  var s = portalsHistory.styles;
  if (!history.visited) {
    data.portal.setStyle(s.visitTarget);
  } else if (!history.captured) {
    data.portal.setStyle(s.captureTarget);
  } else if (!$.isEmptyObject(s.otherNotVC)) {
    data.portal.setStyle(s.otherNotVC);
  }
};

portalsHistory.scoutControlled = function (data) {
  var history = data.portal.options.data.history;
  if (!history) {
    return;
  }
  var s = portalsHistory.styles;
  if (history.scoutControlled) {
    data.portal.setStyle(s.scoutControlled);
  } else if (!$.isEmptyObject(s.otherScout)) {
    data.portal.setStyle(s.otherScout);
  }
};

portalsHistory.notScoutControlled = function (data) {
  var history = data.portal.options.data.history;
  if (!history) {
    return;
  }
  var s = portalsHistory.styles;
  if (!history.scoutControlled) {
    data.portal.setStyle(s.scoutControllTarget);
  } else if (!$.isEmptyObject(s.otherNotScout)) {
    data.portal.setStyle(s.otherNotScout);
  }
};

// Creating styles based on a given template
function inherit (parentName, childNames) {
  var styles = portalsHistory.styles;
  childNames.forEach(function (name) {
    // Extension of _styles_ with a new _name_ object, created based on _parentName_ object.
    styles[name] = L.extend(L.Util.create(styles[parentName]), styles[name]);
  });
}

var setup = function () {
  inherit('common', ['marked', 'semiMarked']);
  inherit('semiMarked', ['visited', 'captureTarget']);
  inherit('marked', ['captured', 'visitTarget', 'scoutControlled', 'scoutControllTarget']);
  inherit('commonOther', ['otherVC', 'otherNotVC', 'otherScout', 'otherNotScout']);

  window.addPortalHighlighter('History: not visited/captured', portalsHistory.notVisited);
  window.addPortalHighlighter('History: not scout controlled', portalsHistory.notScoutControlled);
  window.addPortalHighlighter('History: visited/captured', portalsHistory.visited);
  window.addPortalHighlighter('History: scout controlled', portalsHistory.scoutControlled);
};

setup.info = plugin_info; //add the script info data to the function as a property
if(!window.bootPlugins) window.bootPlugins = [];
window.bootPlugins.push(setup);
// if IITC has already booted, immediately run the 'setup' function
if(window.iitcLoaded && typeof setup === 'function') setup();
} // wrapper end
// inject code into site context
var script = document.createElement('script');
var info = {};
if (typeof GM_info !== 'undefined' && GM_info && GM_info.script) info.script = { version: GM_info.script.version, name: GM_info.script.name, description: GM_info.script.description };
script.appendChild(document.createTextNode('('+ wrapper +')('+JSON.stringify(info)+');'));
(document.body || document.head || document.documentElement).appendChild(script);
