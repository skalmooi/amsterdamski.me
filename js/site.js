(function () {
  'use strict';

  var header = document.getElementById('header');

  // Reserve space for the absolutely positioned header (same as Squarespace).
  function setHeaderHeight() {
    if (!header) return;
    var inner = header.querySelector('.header-inner');
    document.documentElement.style.setProperty('--header-height', inner.getBoundingClientRect().height + 'px');
  }
  setHeaderHeight();
  window.addEventListener('resize', setHeaderHeight);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setHeaderHeight);

  // Mobile menu
  var burger = header && header.querySelector('.header-burger-btn');
  if (burger) {
    burger.addEventListener('click', function () {
      var open = document.body.classList.toggle('header--menu-open');
      burger.classList.toggle('burger--active', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'Close Menu' : 'Open Menu');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && document.body.classList.contains('header--menu-open')) burger.click();
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (mq) {
      if (mq.matches && document.body.classList.contains('header--menu-open')) burger.click();
    });
  }

  // Native (self-hosted) video blocks: poster + play button, then native controls.
  document.querySelectorAll('.native-video-player').forEach(function (player) {
    var video = player.querySelector('video');
    var btn = player.querySelector('.native-video-play');
    function start() {
      player.classList.add('is-playing');
      video.controls = true;
      video.play();
    }
    btn.addEventListener('click', start);
    video.addEventListener('click', function () { if (!player.classList.contains('is-playing')) start(); });
    video.addEventListener('play', function () {
      // Pause any other playing media on the page.
      document.querySelectorAll('video, audio').forEach(function (m) { if (m !== video && !m.paused) m.pause(); });
      player.classList.add('is-playing');
      video.controls = true;
    });
    video.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      video.controls = false;
    });
  });

  // Audio blocks: minimal player (play/pause, click-to-seek, elapsed time).
  function fmt(s) {
    s = Math.max(0, Math.floor(s || 0));
    return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2);
  }
  document.querySelectorAll('.audio-player').forEach(function (player) {
    var audio = new Audio();
    audio.preload = 'none';
    audio.src = player.getAttribute('data-src');
    var action = player.querySelector('.audio-action');
    var played = player.querySelector('.audio-played');
    var progress = player.querySelector('.audio-progress');
    var total = player.querySelector('.audio-total');

    function toggle() {
      if (audio.paused) {
        document.querySelectorAll('video, audio').forEach(function (m) { if (!m.paused) m.pause(); });
        audio.play();
      } else {
        audio.pause();
      }
    }
    action.addEventListener('click', function (e) { e.stopPropagation(); toggle(); });
    player.addEventListener('click', function (e) {
      if (!audio.duration) { toggle(); return; }
      var rect = player.getBoundingClientRect();
      audio.currentTime = Math.min(audio.duration, Math.max(0, (e.clientX - rect.left) / rect.width) * audio.duration);
      if (audio.paused) audio.play();
    });
    audio.addEventListener('play', function () {
      player.classList.add('is-playing', 'has-played');
      document.querySelectorAll('.audio-player.is-playing').forEach(function (p) { if (p !== player) p.classList.remove('is-playing'); });
    });
    audio.addEventListener('pause', function () { player.classList.remove('is-playing'); });
    audio.addEventListener('loadedmetadata', function () { total.textContent = fmt(audio.duration); });
    audio.addEventListener('timeupdate', function () {
      if (!audio.duration) return;
      played.style.width = (audio.currentTime / audio.duration * 100) + '%';
      progress.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('ended', function () {
      player.classList.remove('is-playing');
      played.style.width = '0';
      progress.textContent = '';
    });
  });

  // Pause other audio players when one starts (they share the document-level pause above).
  document.addEventListener('play', function (e) {
    if (e.target.tagName !== 'AUDIO') return;
    document.querySelectorAll('audio').forEach(function (a) { if (a !== e.target && !a.paused) a.pause(); });
  }, true);

  // YouTube section background: muted, looped, half speed (Squarespace "video background").
  var bgs = document.querySelectorAll('.sqs-video-background[data-youtube-id]');
  if (bgs.length && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
    window.onYouTubeIframeAPIReady = function () {
      bgs.forEach(function (bg) {
        var id = bg.getAttribute('data-youtube-id');
        var start = parseInt(bg.getAttribute('data-start') || '0', 10);
        var rate = parseFloat(bg.getAttribute('data-playback-rate') || '1');
        var holder = bg.querySelector('.video-background-player');
        function size() {
          var w = bg.clientWidth, h = bg.clientHeight;
          var iw = Math.max(w, h * 16 / 9), ih = Math.max(h, w * 9 / 16);
          var el = bg.querySelector('iframe');
          if (el) { el.style.width = iw + 'px'; el.style.height = ih + 'px'; }
        }
        var player = new YT.Player(holder, {
          videoId: id,
          playerVars: { autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: id, start: start, playsinline: 1, rel: 0, modestbranding: 1, iv_load_policy: 3, disablekb: 1 },
          events: {
            onReady: function (e) {
              e.target.mute();
              e.target.setPlaybackRate(rate);
              e.target.seekTo(start, true);
              e.target.playVideo();
              size();
            },
            onStateChange: function (e) {
              if (e.data === YT.PlayerState.ENDED) { e.target.seekTo(start, true); e.target.playVideo(); }
              if (e.data === YT.PlayerState.PLAYING) e.target.setPlaybackRate(rate);
            }
          }
        });
        window.addEventListener('resize', size);
      });
    };
  }
})();
