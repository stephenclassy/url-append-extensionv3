var options;
var timeout;

var elem = document.createElement('input');
document.body.appendChild(elem);

function copy(text) {
  if (options.clean_url) {
    elem.value = cleanURL(text);
    //Debugging = console.log('Used CleanURL');
  } else {
    elem.value = text;
    //Debugging = console.log('Did not use CleanURL');
  }
  //Change for value you want appended.
  //Update to take input(s).
  elem.value += '?wt.mc_id=CatalogApi';
  elem.select();
  document.execCommand('Copy', false, null);
}

function setIcon(icon) {
  chrome.browserAction.setIcon({
    path: 'copy_' + icon + '_128.png'
  });
}

function setBadgeText(text) {
  chrome.browserAction.setBadgeText({
    text: text
  });
}

//function endingInput() {
// Need a function to take input of what the ending parameter(s) should be.
//}

function cleanURL(url) {
  var a = document.createElement('a');
  a.href = url;
  //Original search line = a.search = removeTrackingTags(a.search.replace(/^\?/,''));
  a.search = removeTrackingTags(a.search.replace(/^\?(.*)/,''));
  //Debugging = console.log('a.search = ' + a.search);
  a.hash = removeTrackingTags(a.hash.replace(/^#/,''));
  //Debugging = console.log('a.hash = ' + a.hash);
  return a.href
}

function removeTrackingTags(str) {
  return str
    .split('&')
    .filter(function(item) {
      return debug = !/^(utm_|from=|_openstat)/.test(item);
    })
    .join('&');
}

//function removeLocale(str) {
//Add logic to remove locale.
//}

chrome.runtime.onInstalled.addListener(function() {
  chrome.contextMenus.create({
    'id': 'copy-page-url',
    'title': 'Copy URL and add tracking',
    'contexts':[
      'page',
      'selection',
      'link',
      'editable',
      'image',
      'video',
      'audio'
    ]
  });

  chrome.contextMenus.create({
    'id': 'copy-frame-url',
    'title': 'Copy Frame URL',
    'contexts':[
      'frame'
    ]
  });

  chrome.browserAction.setBadgeBackgroundColor({
    color: '#32cd32'
  });
});

chrome.contextMenus.onClicked.addListener(function(info) {
  if (info.menuItemId === 'copy-page-url') {
    copy(info.pageUrl);
  } else if (info.menuItemId === 'copy-frame-url') {
    copy(info.frameUrl);
  }
});

chrome.browserAction.onClicked.addListener(function(tab) {
  copy(tab.url);
  setBadgeText('OK!');
  clearTimeout(timeout);
  timeout = setTimeout(setBadgeText.bind(null, ''), 1000);
});

chrome.tabs.onActivated.addListener(function() {
  clearTimeout(timeout);
  setBadgeText('');
});

chrome.runtime.onMessage.addListener(function(message) {
  if (!message.options) {
    return;
  }

  Object.keys(message.options).forEach(function(key) {
    options[key] = message.options[key];
  });

  var opts = message.options;
  if (opts.toolbar_icon) {
    setIcon(opts.toolbar_icon);
  }
});

chrome.storage.sync.get(defaults, function(items) {
  options = items;
  setIcon(items.toolbar_icon);
});
