var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.arrayIteratorImpl = function(a) {
    var b = 0;
    return function() {
        return b < a.length ? {
            done: !1,
            value: a[b++]
        } : {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function(a) {
    return {
        next: $jscomp.arrayIteratorImpl(a)
    }
};
$jscomp.makeIterator = function(a) {
    var b = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return b ? b.call(a) : $jscomp.arrayIterator(a)
};
$jscomp.arrayFromIterator = function(a) {
    for (var b, c = []; !(b = a.next()).done;) c.push(b.value);
    return c
};
$jscomp.arrayFromIterable = function(a) {
    return a instanceof Array ? a : $jscomp.arrayFromIterator($jscomp.makeIterator(a))
};

function pdfToText(a, b, c) {
    loadPdf(a, c)
}

function loadPdf(a, b) {
    var c = {
            pages: {},
            lines: [],
            ps: [],
            currentPage: 1
        },
        e;
    PDFJS.getDocument(a).promise.then(function(d) {
        e = d.numPages;
        console.log("PDF loaded with " + e + " pages");
        appendNextPagesToLs(d, c, b)
    }, function(d) {
        console.error(d)
    })
}

function appendNextPagesToLs(a, b, c) {
    a.getPage(b.currentPage).then(function(e) {
        b.pages[b.currentPage] = {
            lines: []
        };
        e.getTextContent().then(function(d) {
            d = d.items;
            if (0 < d.length && (appendBlockToPageLines(d[0], b, !0), 1 < d.length))
                for (var f = 1; f < d.length; f++) appendBlockToPageLines(d[f], b, !1);
            console.log(d);
            b.pages[b.currentPage].lines = sortLines(b.pages[b.currentPage].lines);
            b.currentPage < a.numPages ? (b.currentPage++, appendNextPagesToLs(a, b, c)) : null != c && void 0 != c && (d = generateParagraphsFromLines(allLinesFromPages(b.pages,
                a.numPages)), d = removeFootersAndEmpty(d), c(psToString(d)))
        })
    })
}

function allLinesFromPages(a, b) {
    for (var c = [], e = 1; e <= b; e++) c.push.apply(c, $jscomp.arrayFromIterable(a[e].lines));
    return c
}

function removeFootersAndEmpty(a) {
    var b = [];
    a = $jscomp.makeIterator(a);
    for (var c = a.next(); !c.done; c = a.next()) c = c.value, isParFooter(c) || isParEmpty(c) || b.push(c);
    return b
}

function isParFooter(a) {
    return a.pageEnd != a.pageStart ? !1 : 40 > a.yTop ? !0 : !1
}

function isParEmpty(a) {
    return 0 == a.str.trim().length ? !0 : !1
}

function generateParagraphsFromLines(a) {
    var b = [];
    if (null == a || void 0 == a || 0 == a.length) return b;
    if (1 == a.length) return a;
    b.push(newParagraphFromLine(a[0]));
    for (var c = 0; c < a.length; c++) doesLineBelongToParagraph(b[b.length - 1], a[c]) ? b[b.length - 1] = glueLineToParagraph(b[b.length - 1], a[c]) : b.push(newParagraphFromLine(a[c]));
    return b
}

function newParagraphFromLine(a) {
    return {
        str: a.str,
        pageStart: a.page,
        pageEnd: a.page,
        height: a.height,
        xStart: a.xStart,
        xEnd: a.xEnd,
        yTop: a.yTop,
        yBottom: a.yBottom
    }
}

function glueLineToParagraph(a, b) {
    return {
        str: a.str + b.str,
        pageStart: a.pageStart,
        pageEnd: b.page,
        height: a.height,
        xStart: Math.min(a.xStart, b.xStart),
        xEnd: Math.max(a.xEnd, b.xEnd),
        yTop: a.yTop,
        yBottom: b.yBottom
    }
}

function sortLines(a) {
    var b = [];
    return null == a || void 0 == a ? [] : 1 >= a.length ? a : b = a.sort(function(c, e) {
        return e.yBottom - c.yBottom
    })
}

function getNewLineBasedOnBlock(a, b) {
    return {
        page: b,
        str: a.str,
        height: a.height,
        yTop: a.transform[5],
        yBottom: a.transform[5] - a.height,
        xStart: a.transform[4],
        xEnd: a.transform[4] + a.width
    }
}

function glueBlockToLine(a, b) {
    var c = Math.max(b.height, a.height);
    if (b.transform[4] > a.xStart) {
        var e = a.xStart;
        var d = b.transform[4] + b.width;
        var f = a.str;
        a.xEnd + c < b.transform[4] && (f += " ");
        f += b.str
    } else e = b.transform[4], d = a.xEnd, f = b.str, b.transform[4] + b.width + c < a.xStart && (f += " "), f += a.str;
    return {
        page: a.page,
        str: f,
        height: c,
        yTop: Math.max(b.transform[5], a.yTop),
        yBottom: Math.min(b.transform[5] - b.height, a.yBottom),
        xStart: e,
        xEnd: d
    }
}

function appendBlockToPageLines(a, b, c) {
    null != a && void 0 != a && (0 == b.pages[b.currentPage].lines.length || c || !areLineAndBlockSameLine(b.pages[b.currentPage].lines[b.pages[b.currentPage].lines.length - 1], a) ? (a = getNewLineBasedOnBlock(a, b.currentPage), b.pages[b.currentPage].lines.push(a)) : b.pages[b.currentPage].lines[b.pages[b.currentPage].lines.length - 1] = glueBlockToLine(b.pages[b.currentPage].lines[b.pages[b.currentPage].lines.length - 1], a))
}

function areLineAndBlockSameLine(a, b) {
    var c = b.transform[5] - b.height,
        e = b.transform[5];
    return c >= a.yBottom && c <= a.yTop || a.yBottom >= c && a.yBottom <= e ? !0 : !1
}

function doesLineBelongToParagraph(a, b) {
    return a.height != b.height || a.pageEnd == b.page && a.yBottom - a.height > b.yTop ? !1 : !0
}

function psToString(a) {
    if (null == a || void 0 == a || 0 == a.length) return "";
    for (var b = "", c = 0; c < a.length; c++) b += a[c].str + "\n\n";
    return b
}

"speechSynthesis" in window || alert("Speech Synthesis is not supported by your browser. Switch to Chrome.");
var TtsEngine = {
        DEFAULT_LANG: "en",
        voice: null,
        voices: null,
        rate: .9,
        utteranceId: 0,
        startedAndNotTerminatedCounter: 0,
        listener: null,
        utterance: null,
        _googleBugTimeout: null,
        _speakTimeout: null,
        _canceledAtMs: 0,
        init: function(a) {
            null != a && (this.listener = a);
            this._populateVoices();
            var b = this;
            void 0 !== speechSynthesis.onvoiceschanged && (speechSynthesis.onvoiceschanged = function() {
                b._populateVoices()
            });
            this.utterance = new SpeechSynthesisUtterance
        },
        _setBestMatchingVoice: function(a, b, c) {
            if (null != this.voices && 0 != this.voices.length) {
                if (null !=
                    a)
                    for (var e = $jscomp.makeIterator(this.voices), d = e.next(); !d.done; d = e.next())
                        if (d = d.value, d == a) {
                            this.voice = d;
                            return
                        } if (null != b)
                    for (a = $jscomp.makeIterator(this.voices), d = a.next(); !d.done; d = a.next())
                        if (d = d.value, d.voiceURI == b) {
                            this.voice = d;
                            return
                        } if (null != c)
                    for (b = $jscomp.makeIterator(this.voices), d = b.next(); !d.done; d = b.next())
                        if (d = d.value, d.lang == c) {
                            this.voice = d;
                            return
                        } if (null != this.voice)
                    for (c = $jscomp.makeIterator(this.voices), d = c.next(); !d.done; d = c.next())
                        if (d.value == this.voice) return;
                this.voice = this.voices[0]
            }
        },
        _populateVoices: function() {
            var a = window.speechSynthesis.getVoices();
            if (null != a && 0 < a.length) {
                var b = null == this.voices;
                if (null == this.voices || 0 == this.voices.length) this.voices = a, this._setBestMatchingVoice(this.voice, this.DEFAULT_LANG);
                if (b && null != this.listener && void 0 !== this.listener.onInit) this.listener.onInit()
            }
        },
        setVoiceByUri: function(a) {
            this._setBestMatchingVoice(null, a, null)
        },
        setVoice: function(a) {
            this._setBestMatchingVoice(a, null, null)
        },
        setRate: function(a) {
            "string" == typeof a && (a = Number(a));
            isNaN(a) ||
                (.1 > a && (a = .1), 4 < a && (a = 4), this.rate = a)
        },
        isInitiated: function() {
            return null != this.voices
        },
        _defaultOnStart: function(a) {
            this.startedAndNotTerminatedCounter++;
            this._solveChromeBug()
        },
        _defaultOnEnd: function(a) {
            0 < this.startedAndNotTerminatedCounter && this.startedAndNotTerminatedCounter--;
            this._clearUtteranceTimeouts()
        },
        _defaultOnError: function(a) {
            0 < this.startedAndNotTerminatedCounter && this.startedAndNotTerminatedCounter--;
            this._clearUtteranceTimeouts()
        },
        _clearUtteranceTimeouts: function() {
            null != this._googleBugTimeout &&
                (window.clearTimeout(this._googleBugTimeout), this._googleBugTimeout = null)
        },
        _solveChromeBug: function() {
            if (null != this.voice && -1 != this.voice.voiceURI.toLowerCase().indexOf("google")) {
                this._clearUtteranceTimeouts();
                var a = this;
                this._googleBugTimeout = window.setTimeout(function() {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                    a._solveChromeBug()
                }, 2E3)
            }
        },
        speakOut: function(a) {
            a = Utils.prepareTextForSynthesis(a);
            if (!this.isInitiated()) return !1;
            this.utteranceId++;
            var b = this.utterance;
            b.text = a;
            null == this.voice && this._setBestMatchingVoice(null, null, this.DEFAULT_LANG);
            b.lang = this.voice.lang;
            b.voiceURI = this.voice.voiceURI;
            b.voice = this.voice;
            b.rate = this.rate;
            var c = this;
            b.onstart = function(e) {
                c._defaultOnStart(e);
                if (c.listener && c.listener.onStart) c.listener.onStart()
            };
            b.onend = function(e) {
                c._defaultOnEnd(e);
                if (c.listener && c.listener.onDone) c.listener.onDone();
                b = null
            };
            b.onerror = function(e) {
                c._defaultOnError(e);
                b = null
            };
            0 < this.startedAndNotTerminatedCounter ? (this.stop(), this._speakTimeout = window.setTimeout(function() {
                    c._speakUtterance(b)
                },
                200)) : this._speakUtterance(b)
        },
        stop: function() {
            null != this._speakTimeout && (window.clearTimeout(this._speakTimeout), this._speakTimeout = null);
            window.speechSynthesis.cancel();
            this._canceledAtMs = Date.now()
        },
        _speakUtterance: function(a) {
            null != this._speakTimeout && (window.clearTimeout(this._speakTimeout), this._speakTimeout = null);
            window.speechSynthesis.paused && window.speechSynthesis.resume();
            100 < Date.now() - this._canceledAtMs ? window.speechSynthesis.speak(a) : this._speakTimeout = window.setTimeout(function() {
                    window.speechSynthesis.speak(a)
                },
                200)
        }
    },
    Utils = {
        prepareTextForSynthesis: function(a) {
            a = a.replace("\u00b7", ", ");
            a = a.replace("- ", ", ");
            a.trim();
            return a
        }
    },
    ALLOWED_EXTENSIONS = "txt json html pdf rtf epub".split(" "),
    DEFAULT_PLACEHOLDER = $("#text_box").attr("placeholder"),
    MAX_SEGMENT_LENGTH = 300,
    shouldSpeak = !1,
    caretPos = 0,
    wholeText = "",
    lastMsgLength = 0,
    lastEndTime = 0,
    msg = new SpeechSynthesisUtterance("hello world");
msg.volume = 1;
msg.rate = .9;
msg.pitch = 1;
msg.lang = "en-GB";
var book = null,
    currentChapterIndexInApp = 0,
    totalNumberOfChapters = 0,
    isBookOn = !1,
    bookTitle = "",
    dropbox = document.getElementById("text_box"),
    syncCheckbox = document.querySelector("input[name=cloudSyncCheckbox]"),
    interval = null;
document.getElementById("select_language").addEventListener("change", updateVoice);
document.getElementById("select_speed").addEventListener("change", updateSpeed);
document.getElementById("files").addEventListener("change", handleFileSelect, !1);
dropbox.addEventListener("dragenter", dragenter, !1);
dropbox.addEventListener("dragleave", dragleave, !1);
dropbox.addEventListener("dragover", dragover, !1);
dropbox.addEventListener("drop", drop, !1);
document.getElementById("clearBtn").addEventListener("click", handleClearBtn);
document.getElementById("backBtn").addEventListener("click", handleBackBtn);
document.getElementById("nextBtn").addEventListener("click", handleNextBtn);
document.getElementById("cloudDownloadBtn").addEventListener("click", handleCloudDownloadBtn);
document.getElementById("cloudUploadBtn").addEventListener("click", handleCloudUploadBtn);
syncCheckbox.addEventListener("change", handleSyncCheckboxToggle);
document.getElementById("removeAdsBtn").addEventListener("click", invokePremiumDialog);
$("#text_box").keydown(function(a) {
    shouldSpeak && a.preventDefault()
});
$("#text_box").on("input", function(a) {
    shouldSpeak ? a.preventDefault() : (wholeText = document.getElementById("text_box").value, retainUserData && retainUserData(KEYS.wholeText, wholeText))
});
if (null === localStorage.getItem("selected_language")) switch (localStorage.getItem("interfaceLang")) {
    case "de":
        retainUserData(KEYS.selected_language, "de-DE");
        break;
    case "es":
        retainUserData(KEYS.selected_language, "es-ES");
        break;
    case "fr":
        retainUserData(KEYS.selected_language, "fr-FR");
        break;
    case "ja":
        retainUserData(KEYS.selected_language, "ja-JP");
        break;
    case "it":
        retainUserData(KEYS.selected_language, "it-IT");
        break;
    case "zh":
    case "cn":
        retainUserData(KEYS.selected_language, "zh-CN");
        break;
    default:
        retainUserData(KEYS.selected_language,
            "en-GB")
}
"speechSynthesis" in window ? (document.getElementById("play_button").disabled = !0, TtsEngine.init({
    onInit: function() {
        console.log("initiated");
        document.getElementById("play_button").disabled = !1;
        generateVoicesList(TtsEngine.voices);
        loadStoredVoice()
    },
    onStart: function() {
        console.log("got to onStart")
    },
    onDone: onDoneHandler
})) : alert("It seems that TTS is not supported by your browser. Try it on Chrome.");

function onDoneHandler() {
    console.log("got to onDone");
    lastEndTime = Date.now();
    shouldSpeak ? (console.log("should continue"), setCaretPosition(caretPos + lastMsgLength), console.log("syccess on caret = ", caretPos, " of ", wholeText.length), caretPos < wholeText.length ? speakOut() : (goToBeginning(), shouldSpeak = !1, showPausedUi())) : caretPos >= wholeText.length && goToBeginning()
}
loadUserPrefs();

function persistDynamicBookData() {
    retainUserData(KEYS.isBookOn, isBookOn);
    retainUserData(KEYS.currentChapterIndexInApp, currentChapterIndexInApp);
    retainUserData(KEYS.totalNumberOfChapters, totalNumberOfChapters);
    retainUserData(KEYS.bookTitle, bookTitle)
}

function loadUserPrefs() {
    isPremium() && (document.getElementById("removeAdsBtn").style.display = "none");
    "true" == localStorage.getItem("shouldCloudSync") && (syncCheckbox.checked = !0);
    null === localStorage.getItem("select_speed") && retainUserData(KEYS.select_speed, "0.9");
    loadStoredRate();
    isBookOn = localStorage.getItem(KEYS.isBookOn);
    currentChapterIndexInApp = localStorage.getItem(KEYS.currentChapterIndexInApp);
    totalNumberOfChapters = localStorage.getItem(KEYS.totalNumberOfChapters);
    (bookTitle = localStorage.getItem(KEYS.bookTitle)) ||
    (bookTitle = "");
    if (null != totalNumberOfChapters && null != currentChapterIndexInApp) {
        totalNumberOfChapters = parseInt(totalNumberOfChapters);
        currentChapterIndexInApp = parseInt(currentChapterIndexInApp);
        var a = localStorage.getItem(chapterIndexToStorageKey(currentChapterIndexInApp));
        if ("true" == isBookOn && null != currentChapterIndexInApp && null != totalNumberOfChapters && a && 0 < totalNumberOfChapters) {
            loadChapter(currentChapterIndexInApp);
            setCaretPositionFromLocalStorage();
            return
        }
    }
    null != localStorage.getItem("wholeText") ?
        (wholeText = localStorage.getItem("wholeText"), document.getElementById("text_box").value = wholeText, setCaretPositionFromLocalStorage()) : ((caretPos = parseInt(localStorage.getItem("caretPos"))) && caretPos > localStorage.getItem("wholeText").length && (console.log("BUG!! How can caretPos be larger than text length Genius???"), setCaretPosition(0)), setCaretPosition(0))
}

function loadStoredVoice() {
    var a = "";
    null != localStorage.getItem("selected_language") && null == localStorage.getItem("selected_voice") ? a = getVoiceByLanguage(localStorage.getItem("selected_language")) : null != localStorage.getItem("selected_voice") && (a = localStorage.getItem("selected_voice"), isVoiceAvailable(a) || (a = ""));
    "" == a && (isVoiceAvailable("Google UK English Male") ? a = "Google UK English Male" : (a = getVoiceByLanguage("en-GB"), "" == a && (a = getVoiceByLanguage("en-US"), "" == a && (a = getVoiceByLanguage("en")))));
    setVoice(a);
    selectElement("select_language", localStorage.getItem("selected_voice"))
}

function loadStoredRate() {
    selectElement("select_speed", localStorage.getItem("select_speed"))
}

function setCaretPositionFromLocalStorage() {
    localStorage.getItem("caretPos") ? (caretPos = parseInt(localStorage.getItem("caretPos")), caretPos > localStorage.getItem("wholeText").length ? (console.log("BUG!! How can caretPos be larger than text length Genius???"), setCaretPosition(0, !0)) : setCaretPosition(caretPos, !0)) : setCaretPosition(0)
}

function setCaretPosition(a, b) {
    caretPos = a;
    retainUserData(KEYS.caretPos, caretPos.toString());
    setSelectionRange(a, a);
    b || scrollToViewCaret()
}

function updateVoice() {
    setVoice(select_language.value)
}

function updateSpeed() {
    retainUserData(KEYS.select_speed, "" + select_speed.value);
    console.log(select_speed.value);
    msg.rate = parseFloat(select_speed.value)
}

function setVoice(a) {
    0 < TtsEngine.voices.filter(function(b) {
        return b.name == a
    }).length ? (msg.voice = TtsEngine.voices.filter(function(b) {
        return b.name === a
    })[0], retainUserData(KEYS.selected_voice, msg.voice.name), retainUserData(KEYS.selected_language, msg.lang)) : "Google UK English Male" !== a && (a = "Google UK English Male", setVoice("Google UK English Male"))
}

function clearBookFromLocalStorage() {
    for (var a = 0; a < totalNumberOfChapters; a++) try {
        removeUserData(chapterIndexToStorageKey(a))
    } catch (b) {
        console.log(b.message)
    }
}

function resetSpeechVariables() {
    setCaretPosition(0);
    document.getElementById("text_box").value = ""
}

function resetStoredBookVariables() {
    clearBookFromLocalStorage();
    book = null;
    totalNumberOfChapters = currentChapterIndexInApp = 0;
    isBookOn = !1;
    bookTitle = "";
    persistDynamicBookData()
}

function scrollToViewCaret() {
    $("#text_box").blur();
    $("#text_box").focus();
    $.event.trigger({
        type: "keypress"
    })
}

function showUiDropboxActivated() {
    $("#text_box").toggleClass("activated", !0);
    $("#text_box").attr("placeholder", "Drop Files Here")
}

function showUiDropboxDeactivated() {
    $("#text_box").toggleClass("activated", !1);
    $("#text_box").attr("placeholder", DEFAULT_PLACEHOLDER)
}

function setSelectionRange(a, b) {
    var c = document.getElementById("text_box");
    c.setSelectionRange ? (c.focus(), c.setSelectionRange(a, b)) : c.createTextRange && (c = c.createTextRange(), c.collapse(!0), c.moveEnd("character", b), c.moveStart("character", a), c.select())
}

function selectElement(a, b) {
    document.getElementById(a).value = getClosestValue(a, b)
}

function showPlayingUi() {
    document.getElementById("speak_button_new").className = "glyphicon glyphicon-pause btn-glyph";
    document.getElementById("speak_button_new").blur()
}

function showPausedUi() {
    document.getElementById("speak_button_new").className = "glyphicon glyphicon-play btn-glyph";
    document.getElementById("text_box").focus()
}

function updateBookUi(a) {
    a ? (document.getElementById("bookHeader").style.display = "block", document.getElementById("backBtn").style.display = "inline-block", document.getElementById("nextBtn").style.display = "inline-block", document.getElementById("bookTitleLabel").innerText = bookTitle, document.getElementById("chapterNumberLabel").innerText = currentChapterIndexInApp + 1, document.getElementById("totalChaptersLabel").innerText = totalNumberOfChapters) : (document.getElementById("bookHeader").style.display = "none", document.getElementById("backBtn").style.display =
        "none", document.getElementById("nextBtn").style.display = "none")
}

function handleCloudDownloadBtn() {
    isSignedIn() ? syncFromFirebase() : invokeSignInDialog()
}

function handleCloudUploadBtn() {
    isSignedIn() ? syncToFirebase() : invokeSignInDialog()
}

function handleSyncCheckboxToggle() {
    syncCheckbox.checked ? isSignedIn() ? (localStorage.setItem("shouldCloudSync", "true"), syncToFirebase()) : (syncCheckbox.checked = !1, invokeSignInDialog()) : localStorage.setItem("shouldCloudSync", "false")
}

function handleClearBtn() {
    resetStoredBookVariables();
    resetSpeechVariables();
    updateBookUi(isBookOn)
}

function handleBackBtn() {
    setCaretPosition(0);
    0 < currentChapterIndexInApp && loadChapter(--currentChapterIndexInApp)
}

function handleNextBtn() {
    setCaretPosition(0);
    currentChapterIndexInApp < totalNumberOfChapters - 1 && loadChapter(++currentChapterIndexInApp)
}

function clearText() {
    wholeText = text_box.value = "";
    retainUserData(KEYS.wholeText, "");
    goToBeginning()
}

function goToBeginning() {
    wholeText = document.getElementById("text_box").value;
    lastMsgLength = 0;
    setCaretPosition(0);
    shouldSpeak && TtsEngine.stop()
}

function startOrPause() {
    shouldSpeak ? (shouldSpeak = !1, TtsEngine.stop(), showPausedUi()) : (msg.rate = parseFloat(select_speed.value), wholeText = document.getElementById("text_box").value, 0 < wholeText.length ? (shouldSpeak = !0, showPlayingUi(), document.getElementById("text_box").selectionStart == wholeText.length ? setCaretPosition(0) : setCaretPosition(document.getElementById("text_box").selectionStart), speakOut()) : alert("Please write something for me to read :)"))
}

function dragenter(a) {
    a.stopPropagation();
    a.preventDefault();
    showUiDropboxActivated()
}

function dragover(a) {
    a.stopPropagation();
    a.preventDefault()
}

function dragleave(a) {
    showUiDropboxDeactivated()
}

function drop(a) {
    a.stopPropagation();
    a.preventDefault();
    handleFiles(a.dataTransfer.files);
    showUiDropboxDeactivated()
}

function handleFileSelect(a) {
    handleFiles(a.target.files)
}

function handleFiles(a) {
    shouldSpeak && startOrPause();
    a = a[0];
    switch (a.name.split(".")[a.name.split(".").length - 1]) {
        case "txt":
        case "json":
        case "rtf":
            loadTextFile(a);
            break;
        case "pdf":
            loadPdfFile(a);
            break;
        case "epub":
            loadEpubFile(a);
            break;
        default:
            alert("File not supported. Try text / pdf / epub files.")
    }
}

function loadEpubFile(a) {
    var b = new FileReader;
    b.onload = function(c) {
        loadEpub(c.target.result)
    }.bind(this);
    b.readAsArrayBuffer(a)
}

function loadTextFile(a) {
    var b = new FileReader;
    b.onloadend = function(c) {
        dropbox.value = this.result;
        wholeText = document.getElementById("text_box").value;
        retainUserData(KEYS.wholeText, wholeText);
        setCaretPosition(0)
    };
    b.readAsText(a)
}

function loadPdfFile(a) {
    var b = new FileReader;
    b.onload = function(c) {
        pdfToText(this.result, function(e, d) {
            dropbox.value = "Loading file: " + Math.round(e / d * 100) + "%"
        }, function(e) {
            dropbox.value = e;
            wholeText = document.getElementById("text_box").value;
            retainUserData(KEYS.wholeText, wholeText);
            setCaretPosition(0)
        })
    };
    b.readAsArrayBuffer(a)
}

function loadEpub(a) {
    resetStoredBookVariables();
    book = ePub({
        bookPath: a
    });
    book.getMetadata().then(function(e) {
        bookTitle = e.bookTitle
    });
    book.renderTo("area");
    var b = 0,
        c = "";
    book.on("renderer:locationChanged", function(e) {
        c != e && (c = e, console.log(e), e = document.getElementById("area").getElementsByTagName("IFRAME")[0].contentWindow.document.body.innerText, 0 < e.length && (console.log("chapter text length = " + e.length), retainUserData(chapterIndexToStorageKey(b), e), 0 == b && (setCaretPosition(0), loadChapter(0)), b++, totalNumberOfChapters =
            b, updateBookUi(!0), persistDynamicBookData()));
        book.nextChapter()
    })
}

function loadChapter(a) {
    wholeText = localStorage.getItem(chapterIndexToStorageKey(a));
    document.getElementById("text_box").value = wholeText;
    retainUserData(KEYS.wholeText, wholeText);
    currentChapterIndexInApp = a;
    isBookOn = !0;
    updateBookUi(!0);
    persistDynamicBookData()
}

function findFileType(a) {
    if (-1 != a.indexOf(".epub")) return "epub";
    if (-1 != a.indexOf(".txt") || -1 != a.indexOf(".json")) return "txt";
    if (-1 != a.indexOf(".pdf")) return "pdf"
}
msg.onboundary = function(a) {
    console.log("onboundary reached")
};

function speakOut() {
    var a = wholeText.substring(caretPos),
        b = a.indexOf("{{pause}}");
    if (0 == b) lastMsgLength = 9, setTimeout(function() {
        onDoneHandler()
    }, 1E3);
    else {
        -1 < b && (a = a.substring(0, b));
        b = findSegment(a.slice(0, MAX_SEGMENT_LENGTH));
        msg.text = a.slice(0, b);
        lastMsgLength = msg.text.length;
        for (setSelectionRange(caretPos, caretPos + b - 1);
            (-1 != ' #.,"/<>()?;:_\u201d\u201c'.indexOf(msg.text[0]) || "\n" == msg.text.substring(0, 2)) && 0 < msg.text.length;) msg.text = msg.text.slice(1);
        0 < msg.text.length ? (TtsEngine.setVoice(msg.voice),
            TtsEngine.setRate(msg.rate), TtsEngine.speakOut(msg.text)) : onDoneHandler()
    }
}

function handleEndOfText() {
    isBookOn && handleNextBtn()
}
(function() {
    var a = document.getElementById("insertPauseBtn");
    null != a && void 0 != a && a.addEventListener("click", function(b) {
        setCaretPosition(document.getElementById("text_box").selectionStart);
        wholeText = document.getElementById("text_box").value;
        wholeText = wholeText.substring(0, caretPos) + " {{pause}} " + wholeText.substring(caretPos);
        document.getElementById("text_box").value = wholeText;
        setCaretPosition(caretPos);
        retainUserData(KEYS.wholeText, wholeText);
        scrollToViewCaret()
    })
})();

function findSegment(a) {
    var b = [];
    var c = a.indexOf("\n"); - 1 < c && b.push(c);
    c = findFirstRealPeriod(a); - 1 < c && b.push(c);
    c = a.indexOf("!"); - 1 < c && b.push(c);
    c = a.indexOf("?"); - 1 < c && b.push(c);
    if (0 < b.length && (c = Math.min.apply(null, b), -1 < c)) return c + 1;
    if (a.length < MAX_SEGMENT_LENGTH) return a.length + 1;
    c = a.lastIndexOf(",");
    if (-1 < c) return c + 1;
    c = Math.max(a.indexOf("("), a.indexOf(")"), a.indexOf("{"), a.indexOf("}"), a.indexOf("["), a.indexOf("]"));
    if (-1 < c) return c + 1;
    c = a.lastIndexOf(" ");
    return -1 < c ? c + 1 : a.length + 1
}

function findFirstRealPeriod(a) {
    for (var b = 0; b < a.length; b++)
        if (!("." !== a.charAt(b) || b < a.length - 1 && -1 != "0123456789".indexOf(a.charAt(b + 1)) || 1 < b && "." == a.charAt(b - 2))) {
            if (2 < b) {
                var c = a.substring(b - 2, b).toLowerCase();
                if ("mr" == c || "ms" == c || "dr" == c) continue
            }
            if (b < a.length - 1 && -1 != "   [({])}".indexOf(a.charAt(b + 1)) || "\n" == a.charAt(b + 1)) return b
        } return -1
}

function getClosestValue(a, b) {
    for (var c = document.getElementById(a), e = null, d = c.options[0].value, f = 0; f < c.options.length; f++) {
        var g = c.options[f].value;
        if (g == b) return b;
        var h = Math.abs(c.options[f].value - b);
        null == e ? (e = h, d = g) : h < e && (e = h, d = g)
    }
    return d
}

function sortList(a) {
    if (void 0 == a || null == a) return a;
    if ("[object Array]" === Object.prototype.toString.call(a)) return a.sort(function(b, c) {
        var e = b[1].toUpperCase(),
            d = c[1].toUpperCase();
        return e < d ? -1 : e > d ? 1 : 0
    })
}

function generateVoicesList() {
    for (var a = [], b = 0; b < TtsEngine.voices.length; b++) {
        var c = ["", ""],
            e = TtsEngine.voices[b];
        c[0] = e.name;
        1 < TtsEngine.voices.filter(function(f) {
            return f.lang.split("-")[0] == e.lang.split("-")[0]
        }).length ? c[1] = codeToLanguage(e.lang) + ", " + cleanName(e.name) : c[1] = codeToLanguage(e.lang);
        0 == c[1].length && (c[1] = e.name);
        var d = "";
        e.name.toLowerCase().includes("google") && (d = " **");
        c[1] += d;
        a[b] = c
    }
    a = sortList(a);
    for (b = 0; b < a.length; b++) document.getElementById("select_language").options[b + 1] = new Option(a[b][1],
        a[b][0]);
    return a
}

function cleanName(a) {
    var b = a;
    a = a.toLowerCase();
    a.includes("google") && (b = a.includes("female") ? "Female" : a.includes("male") ? "Male" : "G");
    return b
}

function codeToLanguage(a) {
    a = a.replace("_", "-");
    for (var b = [
            ["en", "English, US"],
            ["en-US", "English, US"],
            ["id-ID", "Bahasa, Indonesia"],
            ["ms-MY", "Bahasa, Melayu"],
            ["bg-BG", "Bulgarian"],
            ["cs-CZ", "Czech"],
            ["da-DK", "Danish, Denmark"],
            ["de-DE", "Deutsch"],
            ["nl-NL", "Dutch, Netherlands"],
            ["nl-BE", "Dutch, Belgium"],
            ["en-AU", "English, Australia"],
            ["en-CA", "English, Canada"],
            ["en-IN", "English, India"],
            ["en-IE", "English, Ireland"],
            ["en-NZ", "English, New Zealand"],
            ["en-ZA", "English, S. Africa"],
            ["en-GB", "English, UK"],
            ["en-US", "English, US"],
            ["es-AR", "espa\u00f1ol, Argentina"],
            ["es-BO", "espa\u00f1ol, Bolivia"],
            ["es-CL", "espa\u00f1ol, Chile"],
            ["es-CO", "espa\u00f1ol, Colombia"],
            ["es-CR", "espa\u00f1ol, Costa Rica"],
            ["es-EC", "espa\u00f1ol, Ecuador"],
            ["es-SV", "espa\u00f1ol, El Salvador"],
            ["es-ES", "espa\u00f1ol, Espa\u00f1a"],
            ["es-US", "espa\u00f1ol, Estados Unidos"],
            ["es-GT", "espa\u00f1ol, Guatemala"],
            ["es-HN", "espa\u00f1ol, Honduras"],
            ["es-MX", "espa\u00f1ol, M\u00e9xico"],
            ["es-NI", "espa\u00f1ol, Nicaragua"],
            ["es-PA",
                "espa\u00f1ol, Panam\u00e1"
            ],
            ["es-PY", "espa\u00f1ol, Paraguay"],
            ["es-PE", "espa\u00f1ol, Per\u00fa"],
            ["es-PR", "espa\u00f1ol, Puerto Rico"],
            ["es-DO", "espa\u00f1ol, R. Dominicana"],
            ["es-UY", "espa\u00f1ol, Uruguay"],
            ["es-VE", "espa\u00f1ol, Venezuela"],
            ["fr-FR", "fran\u00e7ais"],
            ["fr-CA", "fran\u00e7ais, Canada"],
            ["hi-IN", "Hindi"],
            ["is-IS", "Icelandic"],
            ["zu-ZA", "IsiZulu"],
            ["it-IT", "italiano"],
            ["it-CH", "italiano, Svizzera"],
            ["ko-KR", "Korean"],
            ["hu-HU", "Magyar"],
            ["nb-NO", "Norwegian"],
            ["pl-PL", "Polski"],
            ["pt-BR",
                "Portugu\u00eas, Brasil"
            ],
            ["pt-PT", "Portugu\u00eas, Portugal"],
            ["ro-RO", "rom\u00e2n\u0103"],
            ["ru-RU", "\u0420\u043e\u0441\u0441\u0438\u0438"],
            ["sr-RS", "Serbian"],
            ["sk-SK", "Slovak"],
            ["fi-FI", "Suomi"],
            ["sv-SE", "Svenska"],
            ["th-TH", "Thai"],
            ["tr-TR", "Turkish"],
            ["el-GR", "\u0395\u03bb\u03bb\u03b7\u03bd\u03b9\u03ba\u03ac"],
            ["zh-CN", "\u666e\u901a\u8bdd (\u4e2d\u56fd\u5927\u9646)"],
            ["zh-HK", "\u666e\u901a\u8bdd (\u9999\u6e2f)"],
            ["zh-TW", "\u4e2d\u6587 (\u53f0\u7063)"],
            ["cmn-Hans-CN", "\u666e\u901a\u8bdd (\u4e2d\u56fd\u5927\u9646)"],
            ["cmn-Hans-HK", "\u666e\u901a\u8bdd (\u9999\u6e2f)"],
            ["cmn-Hant-TW", "\u4e2d\u6587 (\u53f0\u7063)"],
            ["yue-Hant-HK", "\u7cb5\u8a9e (\u9999\u6e2f)"],
            ["ja-JP", "\u65e5\u672c\u8a9e"],
            ["he-IL", "\u05e2\u05d1\u05e8\u05d9\u05ea"],
            ["ar-DZ", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Algeria"],
            ["ar-EG", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Egypt"],
            ["ar-IQ", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Iraq"],
            ["ar-JO", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Jordan"],
            ["ar-KW", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Kuwait"],
            ["ar-LB", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Lebanon"],
            ["ar-MA", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Morocco"],
            ["ar-QA", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Qatar"],
            ["ar-SA", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, Saudi Arabia"],
            ["ar-AE", "\u0627\u0644\u0639\u0631\u0628\u064a\u0629, UAE"]
        ], c = 0; c < b.length; c++)
        if (b[c][0] == a) return b[c][1];
    for (c = 0; c < b.length; c++)
        if (b[c][0].split("-")[0] == a.split("-")[0]) return b[c][1].split(",")[0];
    return a
}

function getVoiceByLanguage(a) {
    return 0 < TtsEngine.voices.filter(function(b) {
        return b.lang == a
    }).length ? TtsEngine.voices.filter(function(b) {
        return b.lang == a
    })[0].name : ""
}

function isVoiceAvailable(a) {
    return 0 < TtsEngine.voices.filter(function(b) {
        return b.name == a
    }).length ? !0 : !1
};
