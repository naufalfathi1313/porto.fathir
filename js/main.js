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
        e.target._run = (e.target._run || 0) + 1;
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
      el.textContent = to.toFixed(dec).replace('.', ',') + suf;
      return;
    }
    var t0 = null,
      dur = 1800;

    function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / dur, 1),
        e = 1 - Math.pow(1 - p, 4);
      el.textContent = (to * e).toFixed(dec).replace('.', ',') + suf;
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
  document.addEventListener('keydown', function(e) {
    if (!lbx.classList.contains('open')) return;
    if (e.key === 'Escape') closeLb();
    else if (e.key === 'Tab') {
      e.preventDefault();
      lbClose.focus();
    }
  });

  // tali kusut -> lurus: kata kegiatan numpuk, jadi urut pas priority list dibuat
  var rope = document.getElementById('rope'),
    ropeChips = [].slice.call(rope.querySelectorAll('.rk')),
    ropeP = document.getElementById('ropePath'),
    ropeB = document.getElementById('ropeBack'),
    ropeShow = false,
    ropeE = 0, // target dari scroll
    ropeS = reduce ? 1 : 0, // posisi pegas (melenting)
    ropeV = 0,
    ropeT = 0,
    ptr = { x: 0, y: 0, on: false, k: 0 },
    ROPE_N = 120,
    TAU = Math.PI * 2;

  // tali kusut terus bergerak pelan (fase kurva geser), kata-katanya ikut hanyut
  function tangle(s, W, H, time) {
    var px = time / 1900,
      py = time / 2300;
    return [W * (.5 + .36 * Math.sin(TAU * 3 * s + .6 + px) + .12 * Math.sin(TAU * 8 * s + 1.3 - px * 1.7)),
      H * (.5 + .34 * Math.sin(TAU * 4 * s + 2.1 + py) + .12 * Math.sin(TAU * 11 * s + .4 + py * 1.9))
    ];
  }

  function straight(s, W, H, vert) {
    return vert ? [26, 26 + s * (H - 52)] : [28 + s * (W - 56), H / 2];
  }

  // kursor/jari menyibak tali dan kata
  function push(p, k, R, F) {
    if (!k) return p;
    var dx = p[0] - ptr.x,
      dy = p[1] - ptr.y,
      d = Math.sqrt(dx * dx + dy * dy) || 1;
    if (d < R) {
      var f = Math.pow(1 - d / R, 2) * F * k;
      p[0] += dx / d * f;
      p[1] += dy / d * f;
    }
    return p;
  }

  function drawRope(time) {
    var W = rope.clientWidth,
      H = rope.clientHeight,
      vert = window.innerWidth <= 700,
      c = Math.min(Math.max(ropeS, 0), 1),
      e = c * c * (3 - 2 * c) + (ropeS > 1 ? (ropeS - 1) * .9 : 0),
      wob = reduce ? 0 : Math.min(Math.max(1 - c, 0), 1),
      pk = reduce ? 0 : ptr.k * (.35 + .65 * wob),
      d = '';
    for (var j = 0; j <= ROPE_N; j++) {
      var s = j / ROPE_N,
        a = tangle(s, W, H, time),
        b = straight(s, W, H, vert),
        p = [a[0] + (b[0] - a[0]) * e + Math.sin(time / 520 + s * 22) * 6 * wob,
          a[1] + (b[1] - a[1]) * e + Math.cos(time / 610 + s * 19) * 6 * wob
        ];
      push(p, pk, 120, 46);
      d += (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1);
    }
    ropeP.setAttribute('d', d);
    ropeB.setAttribute('d', d);
    ropeChips.forEach(function(c, i) {
      var a = tangle(+c.dataset.t, W, H, time),
        sl = (i + .5) / ropeChips.length,
        b = straight(sl, W, H, vert),
        w = c.offsetWidth,
        hh = c.offsetHeight;
      // posisi akhir: di atas/bawah tali (desktop) atau di kanan tali (mobile)
      if (vert) b = [b[0] + 20 + w / 2, b[1]];
      else b[1] += (i % 2 ? 30 : -30);
      var ang = Math.sin(i * 12.9898) * 38 * (1 - e) + Math.sin(time / 900 + i * 1.7) * 9 * wob,
        p = [a[0] + (b[0] - a[0]) * e + Math.sin(time / 700 + i) * 5 * wob,
          a[1] + (b[1] - a[1]) * e + Math.cos(time / 800 + i * 2) * 5 * wob
        ];
      push(p, pk, 140, 34);
      // di HP kata yang hanyut gak boleh keluar dari kotak tali (bikin scroll samping)
      if (vert) p[0] = Math.min(Math.max(p[0], w / 2), W - w / 2);
      if (i === 0) c.style.setProperty('--e', Math.min(Math.max(e, 0), 1).toFixed(2));
      c.style.transform = 'translate(' + (p[0] - w / 2).toFixed(1) + 'px,' + (p[1] - hh / 2).toFixed(1) + 'px) rotate(' + ang.toFixed(1) + 'deg)';
    });
  }

  function ropeLoop(t) {
    if (!ropeShow) {
      ropeT = 0;
      return;
    }
    var f = ropeT ? Math.min(t - ropeT, 40) / 16.7 : 1;
    ropeT = t;
    // pegas kurang teredam: tali melenting dikit pas sampai lurus
    ropeV += (ropeE - ropeS) * .07 * f;
    ropeV *= Math.pow(.72, f);
    ropeS += ropeV * f;
    ptr.k += ((ptr.on ? 1 : 0) - ptr.k) * Math.min(.12 * f, 1);
    drawRope(t);
    requestAnimationFrame(ropeLoop);
  }
  new IntersectionObserver(function(es) {
    ropeShow = es[0].isIntersecting;
    if (ropeShow && !reduce) requestAnimationFrame(ropeLoop);
  }).observe(rope);

  function ropeMove(e) {
    var r = rope.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
    ptr.on = true;
  }
  rope.addEventListener('pointermove', ropeMove);
  rope.addEventListener('pointerdown', ropeMove);
  rope.addEventListener('pointerleave', function() {
    ptr.on = false;
  });
  rope.addEventListener('pointercancel', function() {
    ptr.on = false;
  });

  function updateRope() {
    var r = rope.getBoundingClientRect(),
      vh = window.innerHeight;
    ropeE = reduce ? 1 : Math.min(Math.max((vh * .85 - r.top) / (vh * .5), 0), 1);
    if (reduce) {
      ropeS = 1;
      drawRope(0);
    }
  }

  // priority interaktif: tap item -> naik ke atas, bar nyesuain urutan
  var prio = document.getElementById('prio'),
    widths = [1, .78, .55, .32];

  function rankPrio(first) {
    var items = [].slice.call(prio.children),
      tops = items.map(function(li) {
        return li.getBoundingClientRect().top;
      });
    var hadFocus = first && first.contains(document.activeElement);
    if (first) prio.insertBefore(first, prio.firstChild);
    if (hadFocus) first.querySelector('button').focus();
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
  var pinMQ = window.matchMedia('(min-width:1180px) and (min-height:660px)');

  function tryPlay(v) {
    if (!v._vis || !v.paused) return;
    var card = v.closest('.pcard');
    if (pinMQ.matches && card && !card.classList.contains('on')) return;
    if (!v.src) v.src = v.dataset.src;
    if (!v.ended) v.play().catch(function() {});
  }
  var vio = new IntersectionObserver(function(es) {
    es.forEach(function(e) {
      var v = e.target;
      v._vis = e.isIntersecting;
      if (e.isIntersecting) tryPlay(v);
      else v.pause();
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
    chips = [].slice.call(document.querySelectorAll('#chips circle')).sort(function(a, b) {
      return a.dataset.o - b.dataset.o;
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
    if (pinMQ.matches) {
      neq.parentNode.style.setProperty('--p', reduce ? 1 : Math.min(p * 6, 1));
      p1.classList.toggle('on', p > .12);
      p2.classList.toggle('on', p > .5);
    } else {
      neq.parentNode.style.removeProperty('--p');
    }
    pillVids.forEach(tryPlay);
    updateRope();
    // timeline fill
    var tr = tl.getBoundingClientRect(),
      tp = Math.min(Math.max((vh * .6 - tr.top) / tr.height, 0), 1);
    tlfill.style.height = (tp * (tr.height - 16)) + 'px';
    // cookie: cokelatnya nambah seiring scroll
    var cr = closing.getBoundingClientRect(),
      cp = reduce ? 1 : Math.min(Math.max((vh * .8 - cr.top) / (vh * .35 + cr.height / 2), 0), 1),
      shown = 1 + cp * (chips.length - 1);
    chips.forEach(function(c, i) {
      var t = Math.min(Math.max(shown - i, 0), 1);
      c.setAttribute('r', (c.dataset.r * (1 - Math.pow(1 - t, 3))).toFixed(1));
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
  var pillVids = [].slice.call(document.querySelectorAll('.pcard video'));
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
