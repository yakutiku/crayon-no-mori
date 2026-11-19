// 担当が作る（仮置き）
import { svg, s } from '../core/crayon.js';
import { P } from '../core/palette.js';
export default {
  id: 'lengths',
  title: 'lengths',
  icon() { const g = svg(120, 120); g.append(s('circle', { cx: 60, cy: 60, r: 40, fill: P.graySoft })); return g; },
  start(root, ctx) { ctx.done(); },
  stop() {},
};
