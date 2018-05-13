function SpeechSynth() {

    this.synth = window.speechSynthesis;
    this.myVoice = -1;


    SpeechSynth.prototype.talk = function(msg, type) {

        if (this.myVoice == -1) {
            this.voices = this.synth.getVoices();
            for (var v=0; v < this.voices.length; v++) {
                var voice = this.voices[v];
                if (voice.lang == 'en-GB' || voice.lang == 'en-US') {
                    this.myVoice = v;
                    break;
                }
            }
            if (this.myVoice == -1 && this.voices.length > 0) {
                // Get first available voice
                this.myVoice = 0;
            }
        }

        switch (type) {
            case MSG_TO_PLANE:
                voice = this.myVoice;
                break;
            case MSG_FROM_PLANE:
                voice = 5;
                break;
            case MSG_FROM_TWR:
            case MSG_TO_TWR:
                voice = 4;
                break;
            case MSG_FROM_ATC:
            case MSG_TO_ATC:
                voice = 3;
                break;
            default:
                voice = -1;
                break;
        }
        if (voice != -1) {
            msg = this.normalizePhrase(msg);
            var utterThis = new SpeechSynthesisUtterance(msg);
            utterThis.voice = this.voices[voice];
            utterThis.rate = 1.3;
            utterThis.lang = 'en';
            this.synth.speak(utterThis);
        }
    }


    SpeechSynth.prototype.normalizePhrase = function(msg) {
        console.log('speak phrase: ' + msg);
        var finalMsg = '';
        var word;
        var words = msg.split(' ');
        while (words.length > 0) {
            word = words[0];
            console.log('word: ' + word);
            words.shift();
            switch (word) {
                case 'PLANE:':
                    word = words[0];
                    words.shift();
                    finalMsg += this.spellLetters(word);
                    word = words[0];
                    words.shift();
                    finalMsg += this.spellNumbers(word) + ', ';
                    break;
                case 'FL-':
                    word = words[0];
                    words.shift();
                    finalMsg += 'descend to flight level ' + this.spellNumbers(word);
                    break;
                case 'FL+':
                    word = words[0];
                    words.shift();
                    finalMsg += 'climb to flight level ' + this.spellNumbers(word);
                    break;
                case 'FLI':
                    word = words[0];
                    words.shift();
                    finalMsg += 'initial climb to flight level ' + this.spellNumbers(word);
                    break;
                case 'REL':
                    finalMsg += 'release accepted ';
                    break;
                case 'CAI':
                    finalMsg += 'continue as instructed ';
                    break;
                case 'SQUACK':
                    word = words[0];
                    words.shift();
                    finalMsg += 'squack ' + this.spellNumbers(word);
                    break;
                case 'IDENT':
                    finalMsg += 'squack ident ';
                    break;
                case 'SPEED':
                    word = words[0];
                    words.shift();
                    finalMsg += 'set speed to ' + this.spellNumbers(word) + ' knots';
                    break;
                case 'CLEARED':
                    if (words.length > 0) {
                        word = words[0];
                        if (word == 'TO') {
                            finalMsg += 'cleared to take off ';
                            words.shift();
                        }
                        else if (word == 'RW') {
                            finalMsg += 'cleared to final approach runway ';
                            words.shift();
                            word = words[0];
                            finalMsg += this.spellRunway(word);
                            words.shift();
                        }
                        else {
                            finalMsg += 'cleared to ';
                        }
                    }
                    break;
                case 'RW':
                    word = words[0];
                    words.shift();
                    finalMsg += 'runway ';
                    finalMsg += this.spellRunway(word);
                    break;
                case 'HR':
                case 'HL':
                default:
                    if (parseInt(word) >= 0) {
                        finalMsg += this.spellNumbers(word);
                    }
                    else if (word == word.toUpperCase()) {
                        if (word.length == 3 || (word.length == 4 && word.substr(3,1) == ',')) {
                            finalMsg += this.spellIcaoLetters(word);
                        }
                        else {
                            finalMsg += word + ' ';
                        }
                    }
            }
        }
        console.log('final phrase: ' + finalMsg);
        return finalMsg;
    }

    SpeechSynth.prototype.spellNumbers = function(word) {
        msg = '';
        var c = 0;
        numbers = word.split('');
        while (numbers.length > 0) {
            var s = numbers.shift();
            msg += s + ' ';
        }
        return msg;
    }

    SpeechSynth.prototype.spellLetters = function(word) {
        msg = '';
        var c = 0;
        letters = word.split('');
        while (letters.length > 0) {
            var s = letters.shift();
            msg += s + ' ';
        }
        return msg;
    }

    SpeechSynth.prototype.spellRunway = function(word) {
        msg = '';
        numbers = word.split('');
        while (numbers.length > 0) {
            var s = numbers.shift();
            switch (s) {
                case 'L':
                    msg += 'left ';
                    break;
                case 'R':
                    msg += 'right ';
                    break;
                case 'C':
                    msg += 'center ';
                    break;
                default:
                    msg += s + ' ';
                    break;
            }
        }
        return msg;
    }

    SpeechSynth.prototype.spellIcaoLetters = function(word) {
        msg = '';
        var c = 0;
        letters = word.split('');
        while (letters.length > 0) {
            var s = letters.shift().toUpperCase();
            switch(s) {
                case 'A':
                    msg += 'alpha ';
                    break;
                case 'B':
                    msg += 'bravo ';
                    break;
                case 'C':
                    msg += 'charlie ';
                    break;
                case 'C':
                    msg += 'delta ';
                    break;
                case 'E':
                    msg += 'echo ';
                    break;
                case 'F':
                    msg += 'foxtrot ';
                    break;
                case 'G':
                    msg += 'golf ';
                    break;
                case 'H':
                    msg += 'hotel ';
                    break;
                case 'J':
                    msg += 'juliet ';
                    break;
                case 'K':
                    msg += 'kilo ';
                    break;
                case 'L':
                    msg += 'lima ';
                    break;
                case 'M':
                    msg += 'mike ';
                    break;
                case 'N':
                    msg += 'november ';
                    break;
                case 'O':
                    msg += 'oscar ';
                    break;
                case 'P':
                    msg += 'papa ';
                    break;
                case 'Q':
                    msg += 'quebec ';
                    break;
                case 'R':
                    msg += 'romeo ';
                    break;
                case 'S':
                    msg += 'sierra ';
                    break;
                case 'T':
                    msg += 'tango ';
                    break;
                case 'U':
                    msg += 'uniform ';
                    break;
                case 'V':
                    msg += 'victor ';
                    break;
                case 'W':
                    msg += 'whiskey ';
                    break;
                case 'X':
                    msg += 'xray ';
                    break;
                case 'Y':
                    msg += 'yankee ';
                    break;
                case 'Z':
                    msg += 'zulu ';
                    break;
                case ',':
                    msg += ', ';
            }
        }
        return msg;
    }

    function spellNumber(numbers) {
        var p = new Promise(function(resolve, reject) {
            var c = 0;
            var s = numbers.shift();
            if (parseInt(s) >= 0) {
                speakNumber(parseInt(s)).then(function () {
                    spellNumber(numbers).then(function() {
                        if (numbers.length <= 1) {
                            resolve(true);
                        }
                    });
                });
            }
            else {
                resolve(true);
            }
        });
        return p;
    }

    function spellIcao(letters) {
        var p = new Promise(function(resolve, reject) {
            var c = 0;
            if (letters.length == 0) {
                resolve(true);
                return;
            }
            var s = letters.shift();
            speakLetter(s).then(function () {
                spellIcao(letters).then(function() {
                    if (letters.length <= 1) {
                        resolve(true);
                    }
                });
            });
        });
        return p;
    }

    function speakPhrase(words) {
        var word;
        if (words.length > 0) {
            word = words[0];
            console.log('SPEAK ' + word);
            words.shift();
            if (parseInt(word) >= 0) {
                var numbers = word.split('');
                spellNumber(numbers).then(function() {
                    speakPhrase(words);
                });
            }
            else {
                switch (word) {
                    case 'FL':
                    case 'HR':
                    case 'HL':
                    case 'DT':
                        speakInstruction(word).then(function() {
                            speakPhrase(words);
                        });
                        break;
                    default:
                        var letters = word.split('');
                        spellIcao(letters).then(function() {
                            speakPhrase(words);
                        });
                }
            }
        }
    }

}

