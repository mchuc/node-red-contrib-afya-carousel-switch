/**
 * AFYA Carousel Switch – every message moves the value one step: 0, 1, 2 … max, 0 …
 * (C) 2019–2026 Marcin Chuć · MIT
 */
'use strict';

function hhmmss(d = new Date()) {
  return [d.getHours(), d.getMinutes(), d.getSeconds()].map((n) => String(n).padStart(2, '0')).join(':');
}

/** "yes", true, 1, "true", "on" → true */
function flag(v) {
  return v === true || v === 1 || ['yes', 'true', '1', 'on'].includes(String(v).trim().toLowerCase());
}

/** Next carousel position. `current` undefined → start (0 forward, max backward). */
function nextValue(current, maxValue, direction) {
  if (typeof current !== 'number' || Number.isNaN(current)) {
    return direction > 0 ? 0 : maxValue;
  }
  const next = current + direction;
  if (direction > 0) return next > maxValue ? 0 : next;
  return next < 0 ? maxValue : Math.min(next, maxValue);
}

module.exports = function (RED) {
  function AFYACarouselSwitch(config) {
    RED.nodes.createNode(this, config);
    const node = this;

    // legacy nodes (no scope saved) keep using flow context
    const scope = config.scope === 'global' ? 'global' : 'flow';
    let name = String(config.variableName === undefined ? '' : config.variableName).trim();
    if (!name || name === '-1') name = `AFYA_carousel_${node.id}`;
    const { key, store } = RED.util.parseContextStore(name);
    const ctx = () => node.context()[scope];

    let maxValue = Math.round(Math.abs(Number(config.maxValue)));
    if (!Number.isFinite(maxValue) || maxValue < 1) maxValue = 1;

    node.status({ fill: 'grey', shape: 'ring', text: `${scope}.${key} · 0…${maxValue}` });

    node.on('input', (msg, send, done) => {
      const cmd = msg.payload !== null && typeof msg.payload === 'object' && !Array.isArray(msg.payload) ? msg.payload : {};
      const direction = flag(cmd.rev) ? -1 : 1;

      if (flag(cmd.reset)) {
        ctx().set(key, undefined, store);
        node.status({ fill: 'yellow', shape: 'dot', text: `reset · ${hhmmss()}` });
      }
      if (flag(cmd.noop)) {
        node.status({ fill: 'blue', shape: 'ring', text: `no operation · ${hhmmss()}` });
        return done();
      }

      const value = nextValue(ctx().get(key, store), maxValue, direction);
      ctx().set(key, value, store);

      node.status({
        fill: 'green',
        shape: 'dot',
        text: `${direction > 0 ? '→' : '←'} ${value} / ${maxValue} · ${hhmmss()}`,
      });

      msg.payload = { direction, timestamp: Date.now(), value, maxValue };
      send(msg);
      done();
    });
  }

  RED.nodes.registerType('afya-carousel-switch', AFYACarouselSwitch);
};

module.exports.nextValue = nextValue;
