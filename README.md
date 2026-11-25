# node-red-contrib-afya-carousel-switch

[![npm](https://img.shields.io/npm/v/node-red-contrib-afya-carousel-switch)](https://www.npmjs.com/package/node-red-contrib-afya-carousel-switch)
[![license: MIT](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Node-RED carousel switch: every message steps the value **0 → 1 → 2 → … → max → 0 …** – made for scenes switched with one button.

**[English](#english) · [Polski](#polski)**

---

## English

### Install

```bash
cd ~/.node-red
npm install node-red-contrib-afya-carousel-switch
```

Requires Node-RED ≥ 3.0 and Node.js ≥ 18. The node appears in the **AFYA** palette group as **carousel switch**.

### Configuration

| Field | Description |
|---|---|
| **Maximum value** | Highest position; the carousel goes `0 … max`. |
| **Variable** | Context variable with the current position – `global` (readable from any flow) or `flow`, optionally in a chosen context store. New nodes get a unique name. |
| **Name** | Optional label. |

### Input

Any message makes one step. Optional commands in `msg.payload` (value `"yes"` or `true`):

| Command | Effect |
|---|---|
| `msg.payload.rev` | step backwards: `max → … → 1 → 0 → max` |
| `msg.payload.reset` | start again – next value is `0` (or `max` backwards) |
| `msg.payload.noop` | do nothing and send nothing – use with `reset` to only reset |

### Output

```json
{ "value": 1, "maxValue": 2, "direction": 1, "timestamp": 1764057600000 }
```

`direction`: `1` forward, `-1` backward. Other message properties (e.g. `msg.topic`) are passed through.

### Reading the position elsewhere

```js
const scene = global.get("AFYA_xxxxx"); // the name shown in the node
```

### Upgrading to 0.1.0

Nodes created with older versions keep using **flow** context until you open them and choose **global**.
See [change.log](change.log).

---

## Polski

Każda wiadomość zwiększa wartość o 1: **0 → 1 → 2 → … → max → 0 …** – do scen przełączanych jednym przyciskiem.

### Instalacja

```bash
cd ~/.node-red
npm install node-red-contrib-afya-carousel-switch
```

Wymaga Node-RED ≥ 3.0 i Node.js ≥ 18. Węzeł **carousel switch** jest w grupie palety **AFYA**.

### Konfiguracja

| Pole | Opis |
|---|---|
| **Maximum value** | Najwyższa pozycja; karuzela chodzi `0 … max`. |
| **Variable** | Zmienna z bieżącą pozycją – `global` (dostępna z każdego flow) lub `flow`, opcjonalnie w wybranym magazynie kontekstu. Nowy węzeł dostaje unikalną nazwę. |

### Komendy w `msg.payload` (wartość `"yes"` lub `true`)

* `rev` – krok do tyłu,
* `reset` – od początku (następna wartość `0`, w tył `max`),
* `noop` – nic nie rób i nic nie wysyłaj (np. sam reset).

Na wyjściu: `{ value, maxValue, direction, timestamp }`. Węzły z wcześniejszych wersji używają nadal zakresu
**flow**, dopóki nie zmienisz go w formularzu.

---

Marcin Chuć · [MIT](LICENSE)
