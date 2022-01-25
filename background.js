// Copyright 2018 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

'use strict';

chrome.runtime.onInstalled.addListener(function() {
  //console.error('on installed')
  closeProhibited()
});

chrome.tabs.onUpdated.addListener( (ev, ff, tab) => {
  //console.error('on update', tab.url)
  closeProhibited()
})

chrome.tabs.onCreated.addListener( () => {
  //console.error('on create')
  closeProhibited()
})
