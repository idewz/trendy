var progress;
var repeat, maxRepeat = 1, animating = false;

function nextProgress() {
  animating = true;
  var now = new Date();
  var s   = now.getSeconds();
  var ms  = now.getMilliseconds();

  if (progress.value < progress.max) {
    progress.value = (s * 1000) + ms;
  } else {
    if (++repeat >= maxRepeat) {
      animating = false;
      return;
    }
    progress.value = progress.min;
  }
  requestAnimationFrame(nextProgress);
}

function startProgress() {
  repeat = 0;
  progress.value = progress.min;
  if (!animating) {
    nextProgress();
  }
}

window.addEventListener('WebComponentsReady', function() {
  startProgress();
});

document.addEventListener("DOMContentLoaded", function(event) {
  var socket = io();

  progress = document.querySelector('paper-progress');

  socket.on('io:rank', function(urls) {
    list = [];

    urls.forEach(function(url) {
      template = ' \
<my-card> \
  <div class="shares">' + url.share_count + '</div> \
  <div class="url truncate"> \
    <a href="' + url.url + '">' + (url.title || url.url) + '</a> \
  </div> \
</my-card>'

      list.push(template);
    });

    document.querySelector('.list').innerHTML = list.join('');
    startProgress();
  })
});
