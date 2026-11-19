// ドラッグ（ゆっくり指で運ぶ）と、近くまで運ぶと吸い付く動き、合わないときに元の場所へ戻る動き
//
// 使い方:
//   draggable(el, {
//     targets: () => [...要素],            // 置ける場所
//     accepts: (target) => true/false,     // その場所に合うか
//     onDrop: (target) => {},              // 合う場所に吸い付いたあと
//     onMiss: (target) => {},              // 合わずに元へ戻ったあと（target は近かった場所 or null）
//   })
// el は position:absolute の要素。動きは transform で付ける

let active = null; // 同時に動かせるのは1つだけ（指が何本触れても混乱しないように）

const RETURN_MS = 650;
const SNAP_MS = 260;

function center(r) { return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }

export function draggable(el, opts = {}) {
  const o = { magnet: 56, snap: true, lockAfterDrop: true, accepts: () => true, ...opts };
  let start = null;
  let pos = { x: 0, y: 0 };
  let locked = false;
  let pid = null;

  el.classList.add('draggable');
  el.style.touchAction = 'none';

  const setT = (x, y, ms = 0) => {
    pos = { x, y };
    el.style.transition = ms ? `transform ${ms}ms cubic-bezier(.3,.7,.35,1)` : 'none';
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  function targets() {
    const t = typeof o.targets === 'function' ? o.targets() : (o.targets || []);
    return t.filter(Boolean);
  }

  function nearest() {
    const c = center(el.getBoundingClientRect());
    let best = null; let bestD = Infinity;
    for (const t of targets()) {
      const r = t.getBoundingClientRect();
      const m = o.magnet;
      if (c.x < r.left - m || c.x > r.right + m || c.y < r.top - m || c.y > r.bottom + m) continue;
      const tc = center(r);
      const d = Math.hypot(tc.x - c.x, tc.y - c.y);
      if (d < bestD) { bestD = d; best = t; }
    }
    return best;
  }

  function down(e) {
    if (locked || active || (e.button !== undefined && e.button > 0)) return;
    e.preventDefault();
    active = el; pid = e.pointerId;
    start = { x: e.clientX - pos.x, y: e.clientY - pos.y };
    el.classList.add('dragging');
    el.style.transition = 'none';
    o.onPick && o.onPick();
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function move(e) {
    if (e.pointerId !== pid) return;
    e.preventDefault();
    setT(e.clientX - start.x, e.clientY - start.y);
    o.onMove && o.onMove(nearest());
  }

  function up(e) {
    if (e.pointerId !== pid) return;
    window.removeEventListener('pointermove', move);
    window.removeEventListener('pointerup', up);
    window.removeEventListener('pointercancel', up);
    el.classList.remove('dragging');
    active = null; pid = null;
    const t = e.type === 'pointercancel' ? null : nearest();
    if (t && o.accepts(t)) {
      if (o.lockAfterDrop) locked = true;
      if (o.snap) {
        const a = center(el.getBoundingClientRect());
        const b = center(t.getBoundingClientRect());
        setT(pos.x + (b.x - a.x), pos.y + (b.y - a.y), SNAP_MS);
      }
      setTimeout(() => o.onDrop && o.onDrop(t), o.snap ? SNAP_MS : 0);
    } else {
      goHome();
      setTimeout(() => o.onMiss && o.onMiss(t), RETURN_MS);
    }
  }

  function goHome() { setT(0, 0, RETURN_MS); }

  el.addEventListener('pointerdown', down);

  return {
    el,
    goHome,
    lock() { locked = true; },
    unlock() { locked = false; },
    // 位置の記録を消して、今の場所を新しい「元の場所」にする（要素を移したあとなど）
    reset() { setT(0, 0); },
    moveTo(x, y, ms = 0) { setT(x, y, ms); },
    destroy() {
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      if (active === el) active = null;
    },
  };
}

export function releaseAllDrags() { active = null; }
