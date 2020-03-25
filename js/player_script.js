var play = document.getElementById('play-btn');
var volume = document.getElementById('volume-btn');
var audio = document.getElementById('audio-transmission');
var volumeSlider = document.getElementById("volume-slider");
var volumeMemory;
var playing = false;
var canvas = document.getElementById('visualization');
var ctx = canvas.getContext('2d');
var backgroundImage = document.getElementById('background-image')
var audioCtx, audioSrc, analyser, bufferLength, dataArray;
var req;

function updateTime() {
  let curtime = Math.floor(audio.currentTime);
  let sec = Math.floor(curtime % 60);
  let min = Math.floor(audio.currentTime/60);
  let hour = Math.floor(audio.currentTime/3600);
  sec = sec < 10 ? '0' + sec : sec;
  min = min < 10 ? '0' + min : min;
  if (hour <1){
    document.getElementById('current-time').innerHTML= `${min}:${sec}`;
  }
  else{
    document.getElementById('current-time').innerHTML= `${hour}:${min}:${sec}`;
  }
}

function muting () {
  volume.innerHTML = '<img src="images/btn Mute.svg" />';
  audio.muted = true;
  volumeMemory = audio.volume;
  audio.volume = 0;
}

function setVolume (vol) {
  volume.innerHTML = '<img src="images/btn Volumen.svg" />';
  audio.muted = false;
  audio.volume = vol;
}

function initPlayerAnimation() {
  audioCtx = new AudioContext();
  audioSrc = audioCtx.createMediaElementSource(audio);
  analyser = audioCtx.createAnalyser();
  audioSrc.connect(analyser);
  analyser.connect(audioCtx.destination);
  analyser.fftSize = 128;
  bufferLength = analyser.frequencyBinCount;
  dataArray = new Uint8Array(bufferLength);
}

function animate() {
  req = requestAnimationFrame(animate);
  let barWidth = (canvas.width / bufferLength);
  let barHeight;
  let x = 0;
  analyser.getByteFrequencyData(dataArray);
  ctx.drawImage(backgroundImage, 0, 0)
  for (let i = 0; i < bufferLength; i++) {
    barHeight = dataArray[i];
    let r = Math.ceil(234 - (i * (223 / bufferLength)));
    let g = Math.ceil(120 + (i * (66 / bufferLength)));
    let b =Math.ceil(11 + (i * (223 / bufferLength)));
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(x, canvas.height - barHeight , barWidth, barHeight);
    x += barWidth + 2;
  }
}

function stopAnimate(){
  ctx.drawImage(backgroundImage, 0, 0)
  window.cancelAnimationFrame(req)
}

window.addEventListener('load', () => {ctx.drawImage(backgroundImage, 0, 0)})
audio.volume = volumeSlider.value;
volumeSlider.style.background = `linear-gradient(to right,#fff ${volumeSlider.value*100}%,rgba(255,255,255,0.5)${volumeSlider.value*100}%)`;
audio.addEventListener('timeupdate', updateTime, false);

volume.onclick = function () {
  audio.muted ? setVolume(volumeMemory) : muting();
  volumeSlider.value = audio.volume;
  volumeSlider.style.background = `linear-gradient(to right,#fff ${volumeSlider.value*100}%,rgba(255,255,255,0.5)${volumeSlider.value*100}%)`;
}
volumeSlider.oninput = function (){
  volumeSlider.style.background = `linear-gradient(to right,#fff ${volumeSlider.value*100}%,rgba(255,255,255,0.5)${volumeSlider.value*100}%)`;
  if(volumeSlider.value == 0){
    muting()
  }
  else{
    setVolume(volumeSlider.value)
  }
}

play.onclick = function () {
    playing ? audio.pause() : audio.play();
}
audio.addEventListener("pause", function () {
  stopAnimate()
  play.innerHTML = '<img src="images/btn Play.svg" />';
  playing = false;
}, false);
audio.addEventListener("playing", function () {
  if(!audioCtx) {
    initPlayerAnimation()
  }
  play.innerHTML = '<img src="images/btn Pause.svg" />';
  animate()
  playing = true;
}, false);
audio.addEventListener("ended", function () {
    document.getElementById('current-time').innerHTML= '00:00';
}, false);
