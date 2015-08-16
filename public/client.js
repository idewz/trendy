document.addEventListener("DOMContentLoaded", function(event) {
  var socket = io();

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

    document.body.innerHTML = list.join('');
  })
});
