const C = 0
const Cs = 1
const D = 2
const Ds = 3
const E = 4
const F = 5
const Fs = 6
const G = 7
const Gs = 8
const A = 9
const As = 10
const B = 11

const Cb = B
const Db = Cs
const Eb = Ds
const Es = F
const Fb = E
const Gb = Fs
const Ab = Gs
const Bb = As
const Bs = C

const keyNames = ["C", "Db", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"]

const preset = _tone_0000_Aspirin_sf2_file
const AudioContextFunc = window.AudioContext || window.webkitAudioContext;
const audioContext = new AudioContextFunc();
const player = new WebAudioFontPlayer();
player.loader.decodeAfterLoading(audioContext, "_tone_0000_Aspirin_sf2_file")

let key = B; // random between 0 and 11
let grade = 3 // random between 0 and 6
let exampleOctave = 3 // random between 3 and 4
let octave = exampleOctave
let score = 0
let played = 0
let timesPlayed = 0

let interactionEnabled = false

window.onload = () => start()

function start() {
    player.cancelQueue(audioContext)
    score = 0
    played = 0
    resetChallenge()
}

function play() {
    if (!interactionEnabled) return
    player.cancelQueue(audioContext)
    timesPlayed++
    playHarmonicContextChallengeMajorScale(key, grade, exampleOctave, octave)
    updateUI()
}

function resetChallenge() {
    player.cancelQueue(audioContext)
    key = random(C, B)
    grade = random(0, 6)
    exampleOctave = random(3, 4)
    octave = random(Math.max(exampleOctave - 1, 3), Math.min(exampleOctave + 1, 5))
    timesPlayed = 0

    resetButtons()
    updateUI()
    interactionEnabled = true
}

function guess(guessedGrade) {
    if (!interactionEnabled) return
    interactionEnabled = false

    player.cancelQueue(audioContext)

    if (grade === guessedGrade) score++
    played++


    if (grade !== guessedGrade) el(`btn-grade${guessedGrade}`).classList.add("btn-danger")
    el(`btn-grade${grade}`).classList.add("btn-success")

    updateUI()
    setTimeout(() => {
        resetChallenge()
        play()
    }, 2000)
}

function updateUI() {
    el("times").textContent = timesPlayed.toString()
    el("key").textContent = keyNames[key]
    el("played").textContent = played
    el("score").textContent = score
}

function resetButtons() {
    for (let i = 0; i <= 6; i++) {
        el(`btn-grade${i}`).classList.remove("btn-success", "btn-danger")
    }
}

function el(id) {
    return document.getElementById(id)
}

function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min)
}

function getMajorScale(base) {
    return [C, D, E, F, G, A, B].map(n => base + n)
}

function getMajorScaleContext(scale, startingOctave) {
    return [
        [note(scale[0], startingOctave), 0.2, 0.3],
        [note(scale[1], startingOctave), 0.4, 0.3],
        [note(scale[2], startingOctave), 0.6, 0.3],
        [note(scale[3], startingOctave), 0.8, 0.3],
        [note(scale[4], startingOctave), 1.0, 0.3],
        [note(scale[0], startingOctave + 1), 1.4, 0.3],
        [note(scale[4], startingOctave), 1.8, 0.3],
        [note(scale[2], startingOctave), 2.2, 0.3],
        [note(scale[0], startingOctave), 2.6, 0.8],
    ]
}

function playSequence(sequence) {
    for (const [note, when, duration] of sequence) {
        playNote(note, audioContext.currentTime + when, duration)
    }
}

function getSequenceDuration(sequence) {
    const ends = sequence.map(([_, when, duration]) => when + duration)
    return Math.max(...ends)
}

function playHarmonicContextChallengeMajorScale(tonic, grade, exampleOctave, octave) {
    const scale = getMajorScale(tonic)
    const context = getMajorScaleContext(scale, exampleOctave)
    const duration = getSequenceDuration(context)
    const challengeNote = [[note(scale[grade], octave), duration + 0.4, 0.8]]
    const s = context.concat(challengeNote)
    playSequence(s)
}

function note(pitch, octave) {
    return 12 * octave + pitch
}

function playNote(note, when, duration) {
    player.queueWaveTable(
        audioContext,
        audioContext.destination,
        preset,
        when,
        note,
        duration
    )
}
