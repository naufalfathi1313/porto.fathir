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
        io.unobserve(e.target);
      }
    });
  }, {
    threshold: .18,
    rootMargin: '0px 0px -6% 0px'
  });
  document.querySelectorAll('.rv,[data-count]').forEach(function(el) {
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
    lbImg.src = calOpen.dataset.full;
    lbImg.parentNode.scrollLeft = 0;
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

  // kalender: semua kegiatan awalnya numpuk berantakan, rapi ke slot harinya pas discroll
  var calStage = document.getElementById('calStage'),
    calEvs = [].slice.call(calStage.querySelectorAll('.ev, .pev')),
    calMeta = [],
    calCur = reduce ? 1 : 0,
    calTgt = calCur,
    calRun = false;

  function calRand(i, k) {
    var x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
    return x - Math.floor(x);
  }

  // posisi asli (rapi) tiap kegiatan dari offset, jadi gak ngaruh sama transform .rv
  function calMeasure() {
    var small = window.innerWidth <= 760,
      sw = calStage.clientWidth,
      sh = calStage.clientHeight;
    calEvs.forEach(function(e) {
      e.style.transform = '';
    });
    calMeta = calEvs.map(function(e, i) {
      var w = e.offsetWidth,
        h = e.offsetHeight;
      if (!w) return null;
      var x = 0,
        y = 0,
        n = e;
      while (n && n !== calStage) {
        x += n.offsetLeft;
        y += n.offsetTop;
        n = n.offsetParent;
      }
      // potongan kegiatan di mockup iPhone dibesarin rata biar teksnya kebaca pas berantakan
      var pev = e.classList.contains('pev'),
        sx = pev ? 1.8 : small ? 2.4 : 1,
        sy = pev ? 1.8 : small ? 1.4 : 1,
        cx = w * sx / 2 + calRand(i, 1) * (sw - w * sx),
        cy = h * sy / 2 + calRand(i, 2) * (sh - h * sy);
      return {
        x: cx - (x + w / 2),
        y: cy - (y + h / 2),
        a: (calRand(i, 3) - .5) * 70,
        sx: sx,
        sy: sy,
        d: (+(e.dataset.i || e.parentNode.dataset.i) + calRand(i, 4)) / 42 * .5
      };
    });
  }

  function calDraw(p) {
    calStage.style.setProperty('--cp', p.toFixed(3));
    calEvs.forEach(function(e, i) {
      var m = calMeta[i];
      if (!m) return;
      var l = Math.min(Math.max((p - m.d) / .5, 0), 1),
        k = 1 - Math.pow(1 - l, 3),
        r = 1 - k;
      e.style.transform = l >= 1 ? '' :
        'translate(' + (m.x * r).toFixed(1) + 'px,' + (m.y * r).toFixed(1) + 'px) rotate(' + (m.a * r).toFixed(1) + 'deg) scale(' + (1 + (m.sx - 1) * r).toFixed(3) + ',' + (1 + (m.sy - 1) * r).toFixed(3) + ')';
    });
  }

  function calTick() {
    calCur += (calTgt - calCur) * .12;
    if (Math.abs(calTgt - calCur) < .002) calCur = calTgt;
    calDraw(calCur);
    if (calCur !== calTgt) requestAnimationFrame(calTick);
    else calRun = false;
  }

  function updateCal() {
    var r = calStage.getBoundingClientRect(),
      vh = window.innerHeight,
      from = vh * .8,
      to = Math.max(72, Math.min(vh - r.height - 24, vh * .35));
    calTgt = reduce ? 1 : Math.min(Math.max((from - r.top) / (from - to), 0), 1);
    if (calTgt !== calCur && !calRun) {
      calRun = true;
      requestAnimationFrame(calTick);
    }
  }
  calMeasure();
  calDraw(calCur);
  window.addEventListener('resize', function() {
    calMeasure();
    calDraw(calCur);
  });
  window.addEventListener('load', function() {
    calMeasure();
    calDraw(calCur);
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

  function straight(s, W, H) {
    return [28 + s * (W - 56), H / 2];
  }

  // HP: tali nggak lurus ke bawah, tapi meliuk kiri-kanan kayak jalan ular,
  // kata-katanya jadi manik yang dironce di talinya (2 per baris)
  var SN = { key: '', pts: null, len: null, top: 26, pad: 8, n: 5, gap: 0, r: 0 };

  function snakeBuild(W, H) {
    var key = W + 'x' + H;
    if (SN.key === key) return;
    SN.key = key;
    SN.gap = (H - SN.top * 2) / (SN.n - 1);
    SN.r = SN.gap / 2;
    var pts = [],
      len = [0],
      j, k;
    for (k = 0; k < SN.n; k++) {
      var run = snakeRun(k, W),
        y = SN.top + k * SN.gap;
      for (j = 0; j <= 40; j++) pts.push([run[0] + (run[1] - run[0]) * j / 40, y + snakeSag(j / 40)]);
      if (k === SN.n - 1) break;
      // belokan setengah lingkaran ke baris berikutnya
      var dir = k % 2 ? -1 : 1,
        cx = k % 2 ? SN.pad + SN.r : W - SN.pad - SN.r;
      for (j = 1; j < 16; j++) {
        var a = Math.PI * (j / 16 - .5);
        pts.push([cx + dir * Math.cos(a) * SN.r, y + SN.r + Math.sin(a) * SN.r]);
      }
    }
    for (j = 1; j < pts.length; j++) len.push(len[j - 1] + Math.hypot(pts[j][0] - pts[j - 1][0], pts[j][1] - pts[j - 1][1]));
    SN.pts = pts;
    SN.len = len;
  }

  // ujung awal & akhir tiap baris (baris genap ke kanan, ganjil ke kiri)
  function snakeRun(k, W) {
    var xL = SN.pad + SN.r,
      xR = W - SN.pad - SN.r;
    if (k % 2) return [xR, k === SN.n - 1 ? SN.pad : xL];
    return [k === 0 ? SN.pad : xL, k === SN.n - 1 ? W - SN.pad : xR];
  }

  // talinya agak melengkung ke bawah di tengah baris, kayak tali beneran
  function snakeSag(u) {
    return Math.sin(Math.PI * Math.min(Math.max(u, 0), 1)) * 7;
  }

  function snakeAt(s) {
    var L = SN.len[SN.len.length - 1] * s,
      lo = 0,
      hi = SN.len.length - 1;
    while (hi - lo > 1) {
      var mid = (lo + hi) >> 1;
      if (SN.len[mid] < L) lo = mid;
      else hi = mid;
    }
    var t = (L - SN.len[lo]) / (SN.len[hi] - SN.len[lo] || 1);
    return [SN.pts[lo][0] + (SN.pts[hi][0] - SN.pts[lo][0]) * t, SN.pts[lo][1] + (SN.pts[hi][1] - SN.pts[lo][1]) * t];
  }

  // posisi manik: 2 kata per baris, jaraknya dibagi rata sesuai lebar kata
  function snakeChip(i, W) {
    var k = Math.floor(i / 2),
      ltr = k % 2 === 0,
      mate = ropeChips[i % 2 ? i - 1 : i + 1],
      w = ropeChips[i].offsetWidth,
      wm = mate ? mate.offsetWidth : 0,
      left = (i % 2 === 0) === ltr,
      wl = left ? w : wm,
      wr = left ? wm : w,
      x0 = SN.pad + SN.r * .35,
      x1 = W - SN.pad - SN.r * .35,
      g = Math.max((x1 - x0 - wl - wr) / 3, 0),
      x = left ? x0 + g + wl / 2 : x1 - g - wr / 2,
      run = snakeRun(k, W);
    return [x, SN.top + k * SN.gap + snakeSag((x - run[0]) / (run[1] - run[0]))];
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
      N = vert ? 220 : ROPE_N,
      d = '';
    if (vert) snakeBuild(W, H);
    for (var j = 0; j <= N; j++) {
      var s = j / N,
        a = tangle(s, W, H, time),
        b = vert ? snakeAt(s) : straight(s, W, H),
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
        b = vert ? snakeChip(i, W) : straight((i + .5) / ropeChips.length, W, H),
        w = c.offsetWidth,
        hh = c.offsetHeight;
      // posisi akhir: di atas/bawah tali (desktop) atau jadi manik di tali yang meliuk (HP)
      if (!vert) b[1] += (i % 2 ? 30 : -30);
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
    if (!v.ended) v.play().catch(function(err) {
      // autoplay diblok (mis. Low Power Mode di iPhone): cover tetap, kasih tanda buat diketuk
      if (err.name === 'NotAllowedError') v.parentNode.classList.add('tap');
    });
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
    var fig = v.parentNode;
    v.addEventListener('loadeddata', function() {
      fig.classList.add('ready');
    });
    // cover tampil selama loading dan setelah video selesai
    v.addEventListener('playing', function() {
      fig.classList.add('playing');
      fig.classList.remove('tap');
    });
    v.addEventListener('ended', function() {
      fig.classList.remove('playing');
      fig.classList.add('tap');
    });
    // browser blok autoplay bersuara, jadi mulai muted dan suara dinyalain lewat tombol
    var snd = v.parentNode.querySelector('.snd');
    snd.addEventListener('click', function() {
      v.muted = !v.muted;
      snd.setAttribute('aria-pressed', String(!v.muted));
      if (!v.muted) v.play().catch(function() {});
    });
    // sekali main, tanpa loop; ketuk cover buat muter ulang
    fig.querySelector('.cover').addEventListener('click', function() {
      if (!v.src) v.src = v.dataset.src;
      if (v.ended) v.currentTime = 0;
      v.play().catch(function() {});
    });
    vio.observe(v);
  });

  // scroll-driven
  var nav = document.getElementById('nav'),
    prog = document.getElementById('progress'),
    portrait = document.getElementById('portrait'),
    pics = [].slice.call(portrait.querySelectorAll('img')),
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
    tis = [].slice.call(document.querySelectorAll('#tl .ti')),
    links = [].slice.call(document.querySelectorAll('.nav ul a')),
    here = document.getElementById('here'),
    secs = [['about', 'About'], ['bnet', 'Thinking Proses'], ['result', 'Result'], ['Experience', 'Experience'], ['organisasi', 'Organization'], ['pendidikan', 'Education'], ['skills', 'Skills'], ['decision', 'Decision Support'], ['closing', ''], ['kontak', 'Contact']].map(function(s) {
      return { el: document.getElementById(s[0]), label: s[1] };
    }),
    curLabel = null,
    hereLabel = '',
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
      var pt = 'scale(' + (1.12 - k * .12) + ') translateY(' + (k * 24) + 'px)';
      pics.forEach(function(p) {
        p.style.transform = pt;
      });
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
    updateCal();
    // timeline fill
    var tr = tl.getBoundingClientRect(),
      tp = Math.min(Math.max((vh * .6 - tr.top) / tr.height, 0), 1);
    tlfill.style.height = (tp * (tr.height - 16)) + 'px';
    // titik nyala sekali pas ujung garis lewat tengahnya
    var tipY = tr.top + 8 + tp * (tr.height - 16);
    tis.forEach(function(t) {
      if (!t.classList.contains('hit') && t.getBoundingClientRect().top + 14 <= tipY) t.classList.add('hit');
    });
    // cookie: cokelatnya nambah seiring scroll
    var cr = closing.getBoundingClientRect(),
      cp = reduce ? 1 : Math.min(Math.max((vh * .8 - cr.top) / (vh * .35 + cr.height / 2), 0), 1),
      shown = 1 + cp * (chips.length - 1);
    chips.forEach(function(c, i) {
      var t = Math.min(Math.max(shown - i, 0), 1);
      c.setAttribute('r', (c.dataset.r * (1 - Math.pow(1 - t, 3))).toFixed(1));
    });
    // section aktif: menu nav nyala, di HP namanya muncul di sebelah logo
    var cur = '';
    secs.forEach(function(s) {
      if (s.el && s.el.getBoundingClientRect().top < vh * .4) cur = s.label;
    });
    if (cur !== curLabel) {
      curLabel = cur;
      links.forEach(function(a) {
        var on = !!cur && a.textContent === cur;
        a.classList.toggle('on', on);
        if (on) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    }
    if ((y > 40 ? cur : '') !== hereLabel) setHere(y > 40 ? cur : '');
    ticking = false;
  }

  function setHere(label) {
    hereLabel = label;
    [].slice.call(here.children).forEach(function(c) {
      if (c.classList.contains('out')) return;
      c.classList.add('out');
      setTimeout(function() {
        c.remove();
      }, reduce ? 0 : 350);
    });
    if (label) {
      var s = document.createElement('span');
      s.textContent = label;
      here.appendChild(s);
    }
    here.classList.toggle('show', !!label);
  }
  // foto hero gantian: tiap kursor masuk ke foto ganti ke foto berikutnya, di HP tiap di-tap
  var picN = 0,
    hoverMQ = window.matchMedia('(hover: hover)');

  function nextPic() {
    pics[picN].classList.remove('on');
    picN = (picN + 1) % pics.length;
    pics[picN].classList.add('on');
  }
  portrait.addEventListener('pointerenter', function(e) {
    if (e.pointerType === 'mouse') nextPic();
  });
  portrait.addEventListener('click', function() {
    if (!hoverMQ.matches) nextPic();
  });
  // kursor ala iPad (cuma mouse/trackpad, gak di HP): bulatan abu transparan.
  // Deket tombol/ikon dia nempel kayak magnet: ikonnya ketarik ke kursor, membesar,
  // dapet stroke & bayangan, kursornya nyatu (ilang). Link lain dapet sorotan di
  // belakangnya, dan di atas teks kursornya jadi garis ketik.
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches && !reduce) {
    var LIFT = '.tool .ico, .talkgo, .cgrid a, .nav .cta, .btn, .calfull, .snd, .scard .tags span, #prio li',
      TEXT = 'p, h1, h2, h3, h4, li, blockquote, dt, dd, figcaption',
      cur = document.createElement('div'),
      px = -99, py = -99, cx = -99, cy = -99, cSize = '',
      lock = null, mode = '', down = false, fx = [], curRun = false;
    cur.className = 'cur';
    cur.setAttribute('aria-hidden', 'true');
    document.body.appendChild(cur);
    document.documentElement.classList.add('pc');

    var clamp1 = function(v) {
      return Math.max(-1, Math.min(1, v));
    };
    // tiap elemen yang lagi/abis ditempel: geser (x,y), besar (s), bayangan (l)
    var fxOf = function(el) {
      for (var i = 0; i < fx.length; i++)
        if (fx[i].el === el) return fx[i];
      var f = { el: el, x: 0, y: 0, s: 1, l: 0, tx: 0, ty: 0, ts: 1, tl: 0 };
      fx.push(f);
      return f;
    };
    var frame = function() {
      var el = document.elementFromPoint(px, py), next = null, nmode = '';
      // magnet: yang lagi ditempel baru lepas kalau kursor keluar 16px dari pinggirnya
      if (lock) {
        var b = lock.getBoundingClientRect();
        if (px > b.left - 16 && px < b.right + 16 && py > b.top - 16 && py < b.bottom + 16) {
          next = lock;
          nmode = mode;
        }
      }
      if (!next && el && cur.classList.contains('show')) {
        next = el.closest(LIFT);
        nmode = 'lift';
        if (!next) {
          next = el.closest('a, button');
          nmode = 'hl';
        }
      }
      if (next !== lock) {
        if (lock) {
          var o = fxOf(lock);
          o.tx = o.ty = o.tl = 0;
          o.ts = 1;
        }
        lock = next;
        mode = next ? nmode : '';
      }
      // bentuk kursor: bulatan, sorotan seukuran link, garis ketik, atau ilang (nyatu ke ikon)
      var tx = px, ty = py, w = 18, h = 18, r = 9, cls = '';
      if (lock) {
        var f = fxOf(lock), rc = lock.getBoundingClientRect(),
          ew = lock.offsetWidth, eh = lock.offsetHeight,
          mx = rc.left + rc.width / 2 - f.x, my = rc.top + rc.height / 2 - f.y,
          k = Math.min(10, Math.max(ew, eh) * .12);
        f.tx = clamp1((px - mx) / (ew / 2 + 16)) * k;
        f.ty = clamp1((py - my) / (eh / 2 + 16)) * k;
        tx = mx + f.tx;
        ty = my + f.ty;
        if (mode === 'lift') {
          lock.classList.add('lifted');
          f.ts = (1 + Math.min(.12, 10 / Math.max(ew, eh))) * (down ? .96 : 1);
          f.tl = 1;
          w = ew;
          h = eh;
          r = 14;
          cls = 'lift';
        } else {
          w = ew + 10;
          h = eh + 6;
          r = Math.min(h / 2, 18);
          cls = 'hl';
        }
      } else if (el && el.closest(TEXT)) {
        w = 3;
        h = Math.min(Math.round(parseFloat(getComputedStyle(el).fontSize) * 1.1), 130);
        r = 2;
        cls = 'txt';
      }
      var ease = lock ? .28 : .4;
      cx += (tx - cx) * ease;
      cy += (ty - cy) * ease;
      cur.style.transform = 'translate3d(' + cx.toFixed(1) + 'px,' + cy.toFixed(1) + 'px,0)';
      var size = w + ',' + h + ',' + r + ',' + cls;
      if (size !== cSize) {
        cSize = size;
        cur.style.setProperty('--w', w + 'px');
        cur.style.setProperty('--h', h + 'px');
        cur.style.setProperty('--r', r + 'px');
        cur.classList.toggle('lift', cls === 'lift');
        cur.classList.toggle('hl', cls === 'hl');
        cur.classList.toggle('txt', cls === 'txt');
      }
      var busy = Math.abs(tx - cx) + Math.abs(ty - cy) > .3;
      fx = fx.filter(function(f) {
        f.x += (f.tx - f.x) * .25;
        f.y += (f.ty - f.y) * .25;
        f.s += (f.ts - f.s) * .22;
        f.l += (f.tl - f.l) * .22;
        var d = Math.abs(f.tx - f.x) + Math.abs(f.ty - f.y) + Math.abs(f.ts - f.s) * 50 + Math.abs(f.tl - f.l);
        if (d > .02) busy = true;
        if (f.el !== lock && d < .02) {
          f.el.style.translate = f.el.style.scale = '';
          f.el.style.removeProperty('--lift');
          f.el.classList.remove('lifted');
          return false;
        }
        f.el.style.translate = f.x.toFixed(2) + 'px ' + f.y.toFixed(2) + 'px';
        f.el.style.scale = f.s.toFixed(4);
        f.el.style.setProperty('--lift', f.l.toFixed(3));
        return true;
      });
      if (busy) requestAnimationFrame(frame);
      else curRun = false;
    };
    var kick = function() {
      if (!curRun) {
        curRun = true;
        requestAnimationFrame(frame);
      }
    };
    document.addEventListener('pointermove', function(e) {
      if (e.pointerType !== 'mouse') return;
      px = e.clientX;
      py = e.clientY;
      if (!cur.classList.contains('show')) {
        cx = px;
        cy = py;
        cur.classList.add('show');
      }
      kick();
    });
    document.addEventListener('pointerdown', function() {
      down = true;
      cur.classList.add('down');
      kick();
    });
    document.addEventListener('pointerup', function() {
      down = false;
      cur.classList.remove('down');
      kick();
    });
    window.addEventListener('scroll', kick, { passive: true });
    document.documentElement.addEventListener('pointerleave', function() {
      cur.classList.remove('show');
      kick();
    });
  }
  var pillVids = [].slice.call(document.querySelectorAll('.pcard video'));
  // pilar yang dipin: kalau isinya lebih tinggi dari layar, kecilin dikit biar nggak kepotong
  var pilStick = pil.querySelector('.stick'),
    pilWrap = pil.querySelector('.wrap');

  function fitPillars() {
    pilWrap.style.transform = '';
    if (!pinMQ.matches) return;
    var cs = getComputedStyle(pilStick),
      room = pilStick.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - 32,
      h = pilWrap.offsetHeight;
    if (h > room) pilWrap.style.transform = 'scale(' + (room / h).toFixed(3) + ')';
  }
  fitPillars();
  window.addEventListener('resize', fitPillars);
  window.addEventListener('load', fitPillars);
  if (document.fonts) document.fonts.ready.then(fitPillars);
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
