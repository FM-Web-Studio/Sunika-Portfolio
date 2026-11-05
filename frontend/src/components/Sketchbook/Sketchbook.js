import { useEffect, useRef, useState } from 'react';
import { FiDownload, FiRotateCcw } from 'react-icons/fi';
import { usePrefs } from '../../hooks/usePrefs';
import { DEMO, MIRRORS, copiesOf, hexToRgb, mixAt, nextPoint, segmentAt } from '../../lib/sketch';
import TabLine from '../TabLine';
import styles from './Sketchbook.module.css';

const COLOURS = [
  { key: 'mix', label: 'Mixed colours' },
  { key: 'coral', label: 'Coral' },
  { key: 'teal', label: 'Teal' },
  { key: 'sun', label: 'Yellow' },
  { key: 'ink', label: 'Ink' },
];

const MAX_DPR = 2;
const DEMO_MIRROR = 6;
const DEMO_STEP = 0.004;
const DEMO_GAP = 350;

const Sketchbook = ({ copy }) => {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);
  const engine = useRef(null);
  const tool = useRef({ colour: 'mix', mirror: 6 });
  const still = useRef(false);
  const { theme, reduceMotion } = usePrefs();
  const [colour, setColour] = useState('mix');
  const [mirror, setMirror] = useState(6);
  const [count, setCount] = useState(0);
  const [touched, setTouched] = useState(false);

  tool.current = { colour, mirror };
  still.current = reduceMotion;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const strokes = [];
    const dirty = new Set();
    const view = { cx: 0, cy: 0, s: 1, dpr: 1 };
    let palette = null;
    let frame = 0;
    let active = null;
    let rect = null;
    let demo = null;
    let demoDone = false;

    const readPalette = () => {
      const css = getComputedStyle(wrap);
      const get = (name) => css.getPropertyValue(name).trim();
      palette = {
        coral: get('--coral'),
        teal: get('--teal'),
        sun: get('--sun'),
        ink: get('--ink'),
        mix: ['--coral', '--sun', '--teal', '--sun'].map((n) => hexToRgb(get(n))),
      };
    };

    const colourOf = (stroke, p) => (stroke.colour === 'mix' ? mixAt(palette.mix, p.d) : palette[stroke.colour]);

    const place = ([a, b, c, d]) => {
      const k = view.dpr * view.s;
      ctx.setTransform(k * a, k * b, k * c, k * d, view.dpr * view.cx, view.dpr * view.cy);
    };

    const drawSegment = (stroke, j) => {
      const { from, ctrl, to } = segmentAt(stroke.points, j);
      ctx.strokeStyle = colourOf(stroke, ctrl);
      ctx.lineWidth = ctrl.w;
      ctx.beginPath();
      for (const m of copiesOf(stroke.mirror)) {
        place(m);
        ctx.moveTo(from.x, from.y);
        ctx.quadraticCurveTo(ctrl.x, ctrl.y, to.x, to.y);
      }
      ctx.stroke();
    };

    const drawCap = (stroke) => {
      const pts = stroke.points;
      const last = pts[pts.length - 1];
      ctx.beginPath();
      if (pts.length === 1) {
        ctx.fillStyle = colourOf(stroke, last);
        for (const m of copiesOf(stroke.mirror)) {
          place(m);
          ctx.moveTo(last.x + last.w / 2, last.y);
          ctx.arc(last.x, last.y, last.w / 2, 0, Math.PI * 2);
        }
        ctx.fill();
        return;
      }
      const prev = pts[pts.length - 2];
      ctx.strokeStyle = colourOf(stroke, last);
      ctx.lineWidth = last.w;
      for (const m of copiesOf(stroke.mirror)) {
        place(m);
        ctx.moveTo((prev.x + last.x) / 2, (prev.y + last.y) / 2);
        ctx.lineTo(last.x, last.y);
      }
      ctx.stroke();
    };

    const progress = (stroke) => {
      while (stroke.drawn < stroke.points.length - 1) {
        stroke.drawn += 1;
        drawSegment(stroke, stroke.drawn);
      }
      if (stroke.done && !stroke.capped) {
        stroke.capped = true;
        drawCap(stroke);
      }
      return stroke.drawn >= stroke.points.length - 1 && (!stroke.done || stroke.capped);
    };

    const redraw = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of strokes) {
        s.drawn = 0;
        s.capped = false;
        progress(s);
      }
    };

    const resize = () => {
      const { width, height } = wrap.getBoundingClientRect();
      if (!width || !height) return;
      view.dpr = Math.min(MAX_DPR, window.devicePixelRatio || 1);
      view.cx = width / 2;
      view.cy = height / 2;
      view.s = Math.min(width, height) / 2;
      canvas.width = Math.round(width * view.dpr);
      canvas.height = Math.round(height * view.dpr);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      if (!palette) readPalette();
      redraw();
    };

    const newStroke = (c, m) => ({ colour: c, mirror: m, points: [], drawn: 0, done: false, capped: false });

    const advanceDemo = (now) => {
      if (now < demo.start) return;
      const curve = DEMO[demo.index];
      if (!demo.stroke) {
        demo.stroke = newStroke(curve.colour, DEMO_MIRROR);
        demo.u = 0;
        strokes.push(demo.stroke);
      }
      const target = Math.min(1, (now - demo.start) / curve.ms);
      const pts = demo.stroke.points;
      while (demo.u < target) {
        demo.u = Math.min(target, demo.u + DEMO_STEP);
        const p = curve.at(demo.u);
        const last = pts[pts.length - 1];
        pts.push({ ...p, d: last ? last.d + Math.hypot(p.x - last.x, p.y - last.y) : 0, t: now });
      }
      dirty.add(demo.stroke);
      if (target < 1) return;
      demo.stroke.done = true;
      demo.index += 1;
      demo.stroke = null;
      demo.start = now + DEMO_GAP;
      setCount(strokes.length);
      if (demo.index >= DEMO.length) {
        demo = null;
        demoDone = true;
      }
    };

    const tick = (now) => {
      frame = 0;
      if (demo) advanceDemo(now);
      dirty.forEach((s) => { if (progress(s) && s.done) dirty.delete(s); });
      if (demo || dirty.size) frame = requestAnimationFrame(tick);
    };

    const schedule = () => { if (!frame) frame = requestAnimationFrame(tick); };

    const stopDemo = () => {
      if (demo?.stroke) {
        demo.stroke.done = true;
        dirty.add(demo.stroke);
      }
      demo = null;
      demoDone = true;
    };

    const startDemo = () => {
      if (demo || demoDone || strokes.length || still.current) return;
      demo = { index: 0, start: performance.now(), stroke: null, u: 0 };
      schedule();
    };

    const toLocal = (e) => ({
      x: (e.clientX - rect.left - view.cx) / view.s,
      y: (e.clientY - rect.top - view.cy) / view.s,
    });

    const add = (e) => {
      const { x, y } = toLocal(e);
      const p = nextPoint(active.points[active.points.length - 1], x, y, e.timeStamp);
      if (p) active.points.push(p);
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      e.preventDefault();
      canvas.setPointerCapture(e.pointerId);
      stopDemo();
      rect = canvas.getBoundingClientRect();
      active = newStroke(tool.current.colour, tool.current.mirror);
      active.pointerId = e.pointerId;
      add(e);
      strokes.push(active);
      dirty.add(active);
      setTouched(true);
      schedule();
    };

    const onMove = (e) => {
      if (!active || e.pointerId !== active.pointerId) return;
      const events = e.getCoalescedEvents?.() || [];
      (events.length ? events : [e]).forEach(add);
      schedule();
    };

    const onUp = (e) => {
      if (!active || e.pointerId !== active.pointerId) return;
      active.done = true;
      active = null;
      setCount(strokes.length);
      schedule();
    };

    const visible = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) startDemo();
    }, { threshold: 0.5 });

    const sized = new ResizeObserver(resize);

    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onUp);
    canvas.addEventListener('lostpointercapture', onUp);
    sized.observe(wrap);
    visible.observe(wrap);

    engine.current = {
      undo: () => {
        stopDemo();
        strokes.pop();
        dirty.clear();
        redraw();
        setCount(strokes.length);
      },
      clear: () => {
        stopDemo();
        const wipe = () => {
          strokes.length = 0;
          dirty.clear();
          redraw();
          canvas.style.opacity = '';
          setCount(0);
        };
        if (still.current || !canvas.animate) { wipe(); return; }
        canvas.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(0.96)' }], { duration: 280, easing: 'ease-in' })
          .finished.then(wipe, wipe);
        canvas.style.opacity = '0';
      },
      save: () => {
        const out = document.createElement('canvas');
        out.width = canvas.width;
        out.height = canvas.height;
        const o = out.getContext('2d');
        o.fillStyle = getComputedStyle(wrap).backgroundColor;
        o.fillRect(0, 0, out.width, out.height);
        o.drawImage(canvas, 0, 0);
        out.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = 'sketch.png';
          link.click();
          setTimeout(() => URL.revokeObjectURL(url), 1000);
        });
      },
      repaint: () => requestAnimationFrame(() => {
        readPalette();
        redraw();
      }),
    };

    return () => {
      cancelAnimationFrame(frame);
      sized.disconnect();
      visible.disconnect();
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onUp);
      canvas.removeEventListener('lostpointercapture', onUp);
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.repaint();
  }, [theme]);

  return (
    <div className={styles.book}>
      <div ref={wrapRef} className={styles.paper} style={{ '--n': mirror }} data-mirror={mirror > 1 || undefined}>
        <canvas ref={canvasRef} className={styles.canvas} role="img" aria-label={copy.playHint} />
        <p className={`${styles.hint} ${touched ? styles.hintGone : ''}`} aria-hidden="true">{copy.playHint}</p>
      </div>

      <div className={styles.tools}>
        <div className={styles.group} role="group" aria-label={copy.playColour}>
          <span className={styles.label}>{copy.playColour}</span>
          {COLOURS.map((c) => (
            <button
              key={c.key}
              type="button"
              className={`${styles.swatch} ${styles[c.key]}`}
              aria-label={c.label}
              aria-pressed={colour === c.key}
              onClick={() => setColour(c.key)}
            />
          ))}
        </div>

        <div className={styles.group}>
          <span className={styles.label}>{copy.playMirror}</span>
          <TabLine
            label={copy.playMirror}
            value={String(mirror)}
            onChange={(key) => setMirror(Number(key))}
            items={MIRRORS.map((n) => ({ key: String(n), label: n === 1 ? copy.playMirrorOff : String(n) }))}
          />
        </div>

        <div className={styles.actions}>
          <button type="button" className="btn btn-sm" onClick={() => engine.current?.undo()} disabled={!count}>
            <FiRotateCcw aria-hidden="true" /> {copy.playUndo}
          </button>
          <button type="button" className="btn btn-sm btn-danger" onClick={() => engine.current?.clear()} disabled={!count}>
            {copy.playClear}
          </button>
          <button type="button" className="btn btn-sm" onClick={() => engine.current?.save()} disabled={!count}>
            <FiDownload aria-hidden="true" /> {copy.playSave}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sketchbook;
