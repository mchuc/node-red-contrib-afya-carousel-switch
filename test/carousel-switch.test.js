'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createRED } = require('./helper');
const carousel = require('../afya-carousel-switch/carousel-switch.js');

function setup(config) {
  const RED = createRED();
  carousel(RED);
  return { RED, node: RED.create('afya-carousel-switch', config) };
}

const values = (node) => node.sent.map((m) => m.payload.value);

test('nextValue', () => {
  assert.equal(carousel.nextValue(undefined, 2, 1), 0);
  assert.equal(carousel.nextValue(undefined, 2, -1), 2);
  assert.equal(carousel.nextValue(2, 2, 1), 0);
  assert.equal(carousel.nextValue(0, 2, -1), 2);
  assert.equal(carousel.nextValue(7, 3, -1), 3); // stored value above a new maximum
});

test('forward, backward, reset, noop', async () => {
  const { RED, node } = setup({ variableName: 'scene', scope: 'global', maxValue: '2' });
  for (let i = 0; i < 4; i++) await node.receive({ payload: 'click' });
  assert.deepEqual(values(node), [0, 1, 2, 0]);
  assert.equal(RED.context.global.get('scene'), 0);

  await node.receive({ payload: { rev: 'yes' } });
  await node.receive({ payload: { rev: true } });
  assert.deepEqual(values(node).slice(-2), [2, 1]);
  assert.equal(node.sent.at(-1).payload.direction, -1);

  await node.receive({ payload: { reset: 'yes', noop: 'yes' } });
  assert.equal(RED.context.global.get('scene'), undefined);
  assert.equal(node.sent.length, 6); // noop sends nothing

  await node.receive({ payload: {}, topic: 'scenes' });
  const last = node.sent.at(-1);
  assert.equal(last.payload.value, 0);
  assert.equal(last.payload.maxValue, 2);
  assert.equal(last.topic, 'scenes'); // message properties are kept
});

test('legacy node without scope keeps using flow context', async () => {
  const { RED, node } = setup({ variableName: 'old', maxValue: 3 });
  await node.receive({});
  assert.equal(RED.context.flow.get('old'), 0);
  assert.equal(RED.context.global.get('old'), undefined);
});

test('never-edited node (variableName -1) still works', async () => {
  const { RED, node } = setup({ variableName: -1, maxValue: 1 });
  await node.receive({});
  await node.receive({});
  assert.deepEqual(values(node), [0, 1]);
  assert.equal(RED.context.flow.get('AFYA_carousel_n1'), 1);
});

test('context store prefix', async () => {
  const { RED, node } = setup({ variableName: '#:(file)::scene', scope: 'global', maxValue: 2 });
  await node.receive({});
  assert.equal(RED.context.global.get('scene', 'file'), 0);
});
