function SpeechSynth() {

    this.synth = window.speechSynthesis;
    this.voices = this.synth.getVoices();

    SpeechSynth.prototype.talk = function(msg, type) {
        switch (type) {
            case MSG_TO_PLANE:
                voice = 5;
                break;
            case MSG_FROM_PLANE:
                voice = 1;
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
            var utterThis = new SpeechSynthesisUtterance(msg);
            utterThis.voice = this.voices[voice];
            utterThis.lang = 'en';
            this.synth.speak(utterThis);
        }
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

