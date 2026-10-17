/* Portofolio Fathir — animasi scroll, counter, nav, lightbox kalender, priority, video */
(function() {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  requestAnimationFrame(function() {
    document.body.classList.add('loaded');
  });

  // reveal on scroll
  var io = new IntersectionObserver(function(es) {
    es.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        if (e.target.dataset.count) count(e.target);
        if (e.target.dataset.replay === undefined) io.unobserve(e.target);
      } else if (e.target.dataset.replay !== undefined) {
        // angka besar ngitung lagi tiap balik ke layar
        e.target._done = false;
        e.target.textContent = '0';
      }
    });
  }, {
    threshold: .18,
    rootMargin: '0px 0px -6% 0px'
  });
  document.querySelectorAll('.rv,.ti,[data-count]').forEach(function(el) {
    io.observe(el);
  });

  // counters
  function count(el) {
    if (el._done) return;
    el._done = true;
    var run = el._run = (el._run || 0) + 1;
    var to = parseFloat(el.dataset.count),
      dec = +(el.dataset.dec || 0),
      suf = el.dataset.suffix || '';
    if (reduce) {
      el.textContent = to.toFixed(dec) + suf;
      return;
    }
    var t0 = null,
      dur = 1800;

    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1),
        e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to * e).toFixed(dec) + suf;
      if (p < 1 && el._run === run) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // lightbox kalender
  var lbx = document.getElementById('lb'),
    lbImg = document.getElementById('lbImg'),
    calOpen = document.getElementById('calOpen'),
    lbClose = document.getElementById('lbClose');

  function openLb() {
    lbImg.src = document.getElementById('calImg').src;
    lbx.classList.add('open');
    lbx.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lbClose.focus();
  }

  function closeLb() {
    lbx.classList.remove('open');
    lbx.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    calOpen.focus();
  }
  calOpen.addEventListener('click', openLb);
  lbx.addEventListener('click', function(e) {
    if (e.target !== lbImg) closeLb();
  });
  lbx.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeLb();
  });

  // priority interaktif: tap item -> naik ke atas, bar nyesuain urutan
  var prio = document.getElementById('prio'),
    widths = [1, .78, .55, .32];

  function rankPrio(first) {
    var items = [].slice.call(prio.children),
      tops = items.map(function(li) {
        return li.getBoundingClientRect().top;
      });
    if (first) prio.insertBefore(first, prio.firstChild);
    [].slice.call(prio.children).forEach(function(li, i) {
      var bar = li.querySelector('i');
      bar.style.setProperty('--w', widths[i]);
      bar.style.setProperty('--o', 1 - i * .22);
      if (first && !reduce) {
        li.animate([{
          transform: 'translateY(' + (tops[items.indexOf(li)] - li.getBoundingClientRect().top) + 'px)'
        }, {
          transform: 'none'
        }], {
          duration: 520,
          easing: 'cubic-bezier(.34,1.56,.64,1)'
        });
      }
    });
  }
  rankPrio();
  prio.addEventListener('click', function(e) {
    var li = e.target.closest('li');
    if (li && li !== prio.firstChild) rankPrio(li);
  });

  // slot video 10 detik: baru muncul kalau file-nya ada, main sekali pas kelihatan
  var vio = new IntersectionObserver(function(es) {
    es.forEach(function(e) {
      var v = e.target;
      if (e.isIntersecting) {
        if (!v.src) v.src = v.dataset.src;
        if (!v.ended) v.play().catch(function() {});
      } else v.pause();
    });
  }, {
    threshold: .4
  });
  document.querySelectorAll('.vslot video').forEach(function(v) {
    v.addEventListener('loadeddata', function() {
      v.parentNode.classList.add('ready');
    });
    // browser blok autoplay bersuara, jadi mulai muted dan suara dinyalain lewat tombol
    var snd = v.parentNode.querySelector('.snd');
    snd.addEventListener('click', function() {
      v.muted = !v.muted;
      snd.setAttribute('aria-pressed', String(!v.muted));
      snd.setAttribute('aria-label', v.muted ? 'Nyalain suara' : 'Matiin suara');
      if (!v.muted) v.play().catch(function() {});
    });
    // sekali main, tanpa loop; tap videonya buat muter ulang
    v.addEventListener('click', function() {
      if (v.ended) {
        v.currentTime = 0;
        v.play().catch(function() {});
      }
    });
    vio.observe(v);
  });

  // scroll-driven
  var nav = document.getElementById('nav'),
    prog = document.getElementById('progress'),
    img = document.getElementById('portraitImg'),
    portrait = document.getElementById('portrait'),
    pil = document.querySelector('.pillars'),
    neq = document.getElementById('neq'),
    p1 = document.getElementById('p1'),
    p2 = document.getElementById('p2'),
    closing = document.getElementById('closing'),
    chips = [].slice.call(document.querySelectorAll('#chips .chip')).sort(function(a, b) {
      return a.dataset.r - b.dataset.r;
    }),
    tl = document.getElementById('tl'),
    tlfill = document.getElementById('tlfill'),
    links = [].slice.call(document.querySelectorAll('.nav ul a')),
    darks = [].slice.call(document.querySelectorAll('.dark')),
    ticking = false;

  function onScroll() {
    var y = window.scrollY,
      vh = window.innerHeight,
      H = document.documentElement.scrollHeight - vh;
    nav.classList.toggle('scrolled', y > 8);
    var od = false;
    darks.forEach(function(d) {
      var b = d.getBoundingClientRect();
      if (b.top <= 26 && b.bottom >= 26) od = true;
    });
    nav.classList.toggle('ondark', od);
    prog.style.transform = 'scaleX(' + (H > 0 ? y / H : 0) + ')';
    if (!reduce) {
      var r = portrait.getBoundingClientRect(),
        k = Math.min(Math.max(1 - r.bottom / (vh + r.height), 0), 1);
      img.style.transform = 'scale(' + (1.12 - k * .12) + ') translateY(' + (k * 24) + 'px)';
    }
    // pillars
    var pr = pil.getBoundingClientRect(),
      span = pil.offsetHeight - vh;
    var p = span > 0 ? Math.min(Math.max(-pr.top / span, 0), 1) : 1;
    if (window.innerWidth > 860) {
      neq.parentNode.style.setProperty('--p', reduce ? 1 : Math.min(p * 6, 1));
      p1.classList.toggle('on', p > .12);
      p2.classList.toggle('on', p > .5);
    }
    // timeline fill
    var tr = tl.getBoundingClientRect(),
      tp = Math.min(Math.max((vh * .6 - tr.top) / tr.height, 0), 1);
    tlfill.style.height = (tp * (tr.height - 16)) + 'px';
    // cookie: cokelatnya nambah seiring scroll
    var cr = closing.getBoundingClientRect(),
      cp = reduce ? 1 : Math.min(Math.max((vh * .8 - cr.top) / (vh * .35 + cr.height / 2), 0), 1),
      shown = 1 + cp * (chips.length - 1);
    chips.forEach(function(c, i) {
      c.style.setProperty('--t', Math.min(Math.max(shown - i, 0), 1).toFixed(3));
    });
    // active nav
    links.forEach(function(a) {
      var s = document.querySelector(a.getAttribute('href'));
      if (!s) return;
      var b = s.getBoundingClientRect();
      a.classList.toggle('on', b.top < vh * .4 && b.bottom > vh * .4);
    });
    ticking = false;
  }
  window.addEventListener('scroll', function() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }, {
    passive: true
  });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
