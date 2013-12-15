// define context -> handler mapping

var contexts = [
  {
    title: 'Save to doctape (link)',
    type: 'link',
    handler: handleSaveUrl,
  },
  {
    title: 'Save to doctape (image)',
    type: 'image',
    handler: handleSaveUrl,
  },
  {
    title: 'Save to doctape (audio)',
    type: 'audio',
    handler: handleSaveUrl,
  },
  {
    title: 'Save to doctape (video)',
    type: 'video',
    handler: handleSaveUrl,
  },
  {
    title: 'Save to doctape (selection)',
    type: 'selection',
    handler: handleText
  },
  {
    title: 'Save to doctape (editable)',
    type: 'editable',
    handler: handleText
  }
]

// bind handlers to contexts
for (var i in contexts) {
  var context = contexts[i];
  var title = context.title;
  var handler = context.handler;
  var type = context.type;
  var id = chrome.contextMenus.create(
    {
      title: title,
      contexts:[type],
      onclick: handler
    },
    function() {
      if (chrome.extension.lastError) {
        console.log("Got expected error: " + chrome.extension.lastError.message);
      }
    }
  );
}

// handlers

function handleSaveUrl(info, tab) {
  var url = info.srcUrl || info.linkUrl;
  //alert('Saving (' + url + ') to doctape...');
  postDoctape({type: 'url', data: url}, null, function(err, data) {
    if(err) {
      alert('Save to doctape failed. Have you logged into my.doctape.com?');
    }
  });
}

function handleText(info, tab) {
  var text = info.selectionText;
  //alert('Saving selected text (' + text + ') to doctape...');
  postDoctape({type: 'data', data: text}, null, function(err, data) {
    if(err) {
      alert('Save to doctape failed. Are you connected and logged-in at my.doctape.com?');
    }
  });
}

// helpers

function postDoctape(content, filename, cb) {

  var contentType = false;

  var formData = new FormData();
  if(content.type === 'data') {
    formData.append(
      'file',
      new Blob([content.data], {type: 'application/text'}),
      'Chrome text selection.txt'
    );
  } else if(content.type === 'url') {
    formData.append('url', content.data);
    //formData.append('filename', filename);
  } else {
    if(cb) {
      return cb(new Error('Unknown content type'));
    }
  }

  $.ajax({
    url: 'https://my.doctape.com/v1/doc/upload',
    type: 'POST',
    success: function (data) {
      if(cb) cb(null, data);
    },
    error: function (xhr, textStatus, errorThrown) {
      if(cb) cb(textStatus || errorThrown);
    },
    data: formData,
    cache: false,
    contentType: false,
    processData: false
  });
}