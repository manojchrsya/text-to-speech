'use strict;'
const TextContentWrapper = document.getElementById("code-wrapper");
const totalLines = $('.CodeMirror-gutter-wrapper .CodeMirror-gutter-elt:last').text();
const tts = {
  editor: null,
  isSupported: false,
  voices: [],
  currentLine: 0,
  defaultLang: ['en-IN', 'en_IN'],
  config: {
    voice: null,
    voiceURI: 'native',
    volume: 1,
    rate: 0.8,
    pitch: 2,
    text: 'Please write your content and press play button!',
  },
  init: async function () {
    this.isSupported = "speechSynthesis" in window;
    if (!this.isSupported) return false;
    this._showInstructions();
    await this._setVoiceLanguage();
    this._showEditor();
    this._speechSynthesis = new SpeechSynthesisUtterance();
    this._speechSynthesis.onend = this._onEnd;
    this._speechSynthesis.onstart = this._onStart;
    this._speechSynthesis.onerror = this._onError;
  },
  _showInstructions: function () {
    if (this.isSupported) {
      $('.instructions').removeClass('alert-danger d-none').addClass('alert-warning').html(`<strong>Awsome!!</strong> Your browser supports TTS feature. Please Upload Text, PDF, Image or write your
       own content to listen.`)
    } else {
      $('.instructions').removeClass('alert-warning d-none').addClass('alert-danger').html(`<strong>Warning:</strong> Your browser does not support Speech Synthesis. Please use latest
      Chrome or Upgrade to new version.`)
    }
  },
  _showEditor: function () {
    this.editor = CodeMirror.fromTextArea(TextContentWrapper, {
      lineNumbers: true,
      theme: 'default',
      extraKeys: {"Ctrl-Space": "autocomplete"},
      styleActiveSelected: true,
      styleActiveLine: true,
      indentWithTabs: true,
      matchBrackets: true,
      highlightMatches: true,
      lineWrapping: true,
      mode: {name: "javascript", globalVars: true},
    });
    if ($('#story-content').val() && $('#story-content').val().trim().length > 0) {
      this.editor.setValue($('#story-content').val());
    } else {
      this.editor.setValue("Welcome to Text to Speech, please write your content and press play button!");
    }
  },
  _markLine: function (lineNo)  {
    $('.CodeMirror-line span > span').removeClass('alert alert-info p-0');
    this.editor.markText(
      { line: lineNo, ch: 0 },
      { line: lineNo, ch: this.editor.getLine(lineNo).length },
      { className: "alert alert-info p-0" },
    );
  },
  _setVoiceLanguage: async function () {
    this.voices = await this.getVoiceList();
    let voiceHtml = '';
    this.voices.forEach((voice) => {
      if (this.defaultLang.indexOf(voice.lang) !== -1) {
        $('.selected-lang').text(`${voice.name} (${voice.lang})`);
        this.config.voice = voice;
        this.config.lang = voice.lang;
        this.config.voiceURI = voice.voiceURI;
      }
      voiceHtml += `<a class="dropdown-item" value="${voice.voiceURI}"  >${voice.name} (${voice.lang})</a>`
    });
    if (voiceHtml !== '') {
      $('.voices').html(voiceHtml);
    }
  },
  getVoiceList: function () {
    return new Promise((resolve) => {
      let synth = window.speechSynthesis;
      let id;
      id = setInterval(() => {
          if (synth.getVoices().length !== 0) {
              resolve(synth.getVoices());
              clearInterval(id);
          }
      }, 10);
    });
  },
  totalLines: function () {
    return parseInt($('.CodeMirror-gutter-wrapper .CodeMirror-gutter-elt:last').text());
  },
  _onStart: function () {
    tts._markLine(tts.currentLine);
  },
  _onEnd: function () {
    if (tts.currentLine <= tts.totalLines()) {
      tts.currentLine++;
      tts.play();
    } else {
      this.reset();
    }
  },
  _onError: function (error) {
    console.log(error);
  },
  play: function () {
    if (this.currentLine > this.totalLines()) {
      this.reset();
      return false;
    }
    for (const [key, value] of Object.entries(this.config)) {
      this._speechSynthesis[key] = value;
    }
    let currentLineText = this.editor.getLine(this.currentLine);
    // if line is empty then skip the line
    if ($.trim(currentLineText).length === 0 ) {
      this.currentLine++
      this.play();
      return false;
    }
    this._speechSynthesis.text = this.editor.getLine(this.currentLine);
    window.setTimeout(() => {
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume(this._speechSynthesis);
      } else {
        window.speechSynthesis.speak(this._speechSynthesis);
      }
    }, 200);
  },
  pause: function () {
    for (const [key, value] of Object.entries(this.config)) {
      this._speechSynthesis[key] = value;
    }
    window.setTimeout(function() {
      window.speechSynthesis.pause();
    }, 200);
  },
  reverse: function () {
    this.currentLine = this.currentLine > 0
      ? (this.currentLine - 1) : 0;
    this.play();
  },
  forward: function () {
    this.currentLine = this.currentLine < this.totalLines()
      ? (this.currentLine + 1) : this.totalLines();
    this.play();
  },
  reset: function () {
    window.setTimeout(() => {
      window.speechSynthesis.cancel();
      this.currentLine = 0;
      $('.actions .pause').addClass('d-none');
      $('.actions .play').removeClass('d-none');
    }, 200);
  },
};

$(document).ready(function(e) {
  tts.init();
  // update config based on voice selection
  $('.voices').on('click', '.dropdown-item', function(e) {
    e.preventDefault();
    if ($(this).attr('value')) {
      const voiceURI = $(this).attr('value');
      const voice = tts.voices.find(voice =>  voice.voiceURI === voiceURI);
      tts.config.voice = voice;
      tts.config.lang = voice.lang;
      tts.config.voiceURI = voice.voiceURI;
      $('.selected-lang').text($(this).text());
    }
  });
  // $('.actions .reverse').on('click', function(e) {
  //   e.preventDefault();
  //   tts.reverse();
  // });
  $('.actions .reset').on('click', function(e) {
    e.preventDefault();
    tts.reset();
  });

  $('.actions .play').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('d-none');
    $('.actions .pause').removeClass('d-none');
    tts.play();
  });
  $('.actions .pause').on('click', function(e) {
    e.preventDefault();
    $(this).addClass('d-none');
    $('.actions .play').removeClass('d-none');
    tts.pause();
  });
});
