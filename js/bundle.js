/* 肉鸽推币机 V0.2 - compiled TypeScript gameplay. No source .ts is shipped to preview. */
(function(global){
  const factories={"Entry":function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.main = main;
const CoinPusherGame_1 = require("./game/CoinPusherGame");
async function main() {
    Laya.stage.bgColor = "#100726";
    const mobileUA = /Android|iPhone|iPad|iPod|Mobile/i.test(globalThis.navigator?.userAgent ?? "");
    const miniApp = Boolean(globalThis.wx || globalThis.tt);
    const layout = () => {
        // Desktop landscape uses letterboxing, never rotate the whole Web page.
        const landscapeDesktop = !mobileUA && !miniApp && globalThis.innerWidth > globalThis.innerHeight;
        Laya.stage.scaleMode = landscapeDesktop ? Laya.Stage.SCALE_SHOWALL : Laya.Stage.SCALE_FIXED_AUTO;
        Laya.stage.screenMode = landscapeDesktop ? Laya.Stage.SCREEN_NONE : Laya.Stage.SCREEN_VERTICAL;
    };
    layout();
    Laya.stage.on(Laya.Event.RESIZE, null, layout);
    Laya.stage.alignH = Laya.Stage.ALIGN_CENTER;
    Laya.stage.alignV = Laya.Stage.ALIGN_MIDDLE;
    // The LayaAir 3.4 IDE loads its configured Bullet adapter before Entry.main().
    // Failing fast is preferable to silently falling back to a fake 2D physics sim.
    if (!Laya.Rigidbody3D || !Laya.CylinderColliderShape) {
        throw new Error("LayaAir 3.4 Bullet 3D physics module not loaded; check PlayerSettings engine modules");
    }
    const game = new CoinPusherGame_1.CoinPusherGame();
    game.start();
    const loc = globalThis.location;
    if (loc && ["localhost", "127.0.0.1"].includes(loc.hostname) &&
        new URLSearchParams(loc.search).has("e2e")) {
        globalThis.__COIN_PUSHER__ = game;
    }
}

},
"core/GameRules":function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PusherQueue = exports.GameRules = exports.RULES = void 0;
exports.RULES = Object.freeze({
    maxCoins: 600, seedCoins: 144, initialSupply: 45, cycleSeconds: 1.25,
    queueCapacity: 2, scorePerCoin: 10, energyPerCoin: 1, arcadeThreshold: 12,
    rewardCount: 6, maxEnergy: 35
});
class GameRules {
    constructor() {
        this.nextId = 1;
        this.records = new Map();
        this.score = 0;
        this.collected = 0;
        this.leaked = 0;
        this.energy = 0;
        this.supply = exports.RULES.initialSupply;
        this.shots = 0;
    }
    get entityCount() { return this.records.size; }
    get activeCount() { let n = 0; for (const c of this.records.values())
        if (c.terminal === null)
            n++; return n; }
    register(origin) {
        if (this.activeCount >= exports.RULES.maxCoins)
            return null;
        const id = this.nextId++;
        this.records.set(id, { id, origin, terminal: null });
        return id;
    }
    spendCoin() {
        if (this.supply <= 0)
            return false;
        this.supply--;
        return true;
    }
    /** True iff this was the first terminal event for the entity. */
    settle(id, terminal) {
        const coin = this.records.get(id);
        if (!coin || coin.terminal !== null)
            return false;
        coin.terminal = terminal;
        if (terminal === "side") {
            this.leaked++;
            return true;
        }
        this.collected++;
        this.score += exports.RULES.scorePerCoin;
        // Seed N coins and player N coins charge; reward R coins cannot charge.
        if (coin.origin !== "reward")
            this.energy = Math.min(exports.RULES.maxEnergy, this.energy + exports.RULES.energyPerCoin);
        return true;
    }
    canFire() { return this.energy >= exports.RULES.arcadeThreshold; }
    fire() {
        if (!this.canFire())
            return false;
        this.energy -= exports.RULES.arcadeThreshold;
        this.shots++;
        return true;
    }
    snapshot() {
        return { score: this.score, collected: this.collected, leaked: this.leaked,
            energy: this.energy, supply: this.supply, shots: this.shots };
    }
    /** Explicit reset; never reuses entity IDs, so delayed callbacks cannot credit a new run. */
    reset() {
        this.records.clear();
        this.score = this.collected = this.leaked = this.energy = this.shots = 0;
        this.supply = exports.RULES.initialSupply;
    }
}
exports.GameRules = GameRules;
/** Cycle queue never silently eats supply; a rejected input has no side effects. */
class PusherQueue {
    constructor() {
        this.pending = 0;
        this.phase = 0;
        this.active = false;
    }
    get pendingCount() { return this.pending; }
    get occupied() { return this.pending + Number(this.active); }
    request() {
        if (this.occupied >= exports.RULES.queueCapacity)
            return false;
        this.pending++;
        return true;
    }
    update(dt) {
        if (!this.active && this.pending > 0) {
            this.pending--;
            this.active = true;
            this.phase = 0;
        }
        if (!this.active)
            return 0;
        this.phase += Math.min(Math.max(0, dt), 0.05) / exports.RULES.cycleSeconds;
        if (this.phase >= 1) {
            this.phase = 0;
            this.active = false;
            return 0;
        }
        // Forward +Z to first half-cycle, retract on second half-cycle.
        return Math.sin(this.phase * Math.PI) * 0.68;
    }
    reset() { this.pending = 0; this.phase = 0; this.active = false; }
}
exports.PusherQueue = PusherQueue;

},
"core/CollectionGates":function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRAY = void 0;
exports.routeBelowPlane = routeBelowPlane;
exports.verifyTrigger = verifyTrigger;
exports.TRAY = Object.freeze({
    frontLipZ: 2.28,
    halfWidth: 2.57,
    topY: 0,
    bottomY: -0.12,
    settleY: -0.30,
    killY: -2.50
});
function routeBelowPlane(p) {
    if (p.y > exports.TRAY.settleY)
        return null;
    // A coin often drops almost vertically after its rear edge loses support;
    // requiring center.z > lip + 0.12 misclassified legitimate front drops.
    if (p.z >= exports.TRAY.frontLipZ - 0.16 && Math.abs(p.x) <= exports.TRAY.halfWidth + 0.06)
        return "front";
    // Side rails finish before the front lip, allowing a genuine side escape.
    if (Math.abs(p.x) > exports.TRAY.halfWidth + 0.06 || p.z < -3.88)
        return "side";
    // Avoid classifying a coin that has temporarily sunk into the tray; only
    // resolve a floor-crossing anomaly after it has fallen far below the board.
    if (p.y < exports.TRAY.killY)
        return "side";
    return null;
}
/** Ignore pre-lip and corner contacts even if the Bullet callback fires. */
function verifyTrigger(type, p) {
    if (type === "front")
        return p.z > exports.TRAY.frontLipZ + 0.08 && Math.abs(p.x) <= exports.TRAY.halfWidth + 0.06;
    return Math.abs(p.x) > exports.TRAY.halfWidth + 0.06 && p.z <= exports.TRAY.frontLipZ + 0.08;
}

},
"ui/Hud":function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Hud = void 0;
const GameRules_1 = require("../core/GameRules");
/** V0.2 artwork-based arcade HUD: the machine/currency remain real LayaAir 3D objects. */
class Hud {
    constructor(onAim, onDrop, onArcade, onPause, onReset) {
        this.onAim = onAim;
        this.onDrop = onDrop;
        this.onArcade = onArcade;
        this.onPause = onPause;
        this.onReset = onReset;
        this.labels = {};
        this.aim = 0;
        this.paused = false;
        this.lastNotice = "左右移动瞄准位置，点击投币";
        this.W = 750;
        this.H = 1334;
    }
    text(content, x, y, w, h, size, color = "#fff8e8") {
        const label = new Laya.Text(content);
        label.pos(x, y);
        label.size(w, h);
        label.fontSize = size;
        label.color = color;
        label.bold = true;
        label.align = "center";
        label.valign = "middle";
        label.mouseEnabled = false;
        label.stroke = 2;
        label.strokeColor = "#1e164e";
        this.root.addChild(label);
        return label;
    }
    image(url, x, y, w, h) {
        const art = new Laya.Sprite();
        art.pos(x, y);
        art.size(w, h);
        art.mouseEnabled = false;
        this.root.addChild(art);
        // A missing image must never hide the gameplay or break button input.
        Laya.loader.load(url).then((texture) => {
            if (texture && !art.destroyed)
                art.graphics.drawTexture(texture, 0, 0, w, h);
        }).catch((err) => console.error("[CoinPusher] UI artwork not loaded", url, err));
    }
    plate(x, y, w, h, color, opacity = 1) {
        const p = new Laya.Sprite();
        p.pos(x, y);
        p.size(w, h);
        p.alpha = opacity;
        p.graphics.drawRect(0, 0, w, h, color);
        this.root.addChild(p);
        return p;
    }
    hit(x, y, w, h, handler) {
        const b = new Laya.Sprite();
        b.pos(x, y);
        b.size(w, h);
        // LayaAir 3.4 needs a real hit area, even over artwork that doesn't receive events.
        b.graphics.drawRect(0, 0, w, h, "#ffffff");
        b.alpha = 0.001;
        b.hitArea = new Laya.Rectangle(0, 0, w, h);
        b.mouseEnabled = true;
        b.on(Laya.Event.CLICK, this, handler);
        this.root.addChild(b);
        return b;
    }
    stepAim(direction) {
        this.aim = Math.max(-1, Math.min(1, this.aim + direction * 0.125));
        this.onAim(this.aim);
        this.labels.aim.text = `投币位置 ${Math.round((this.aim + 1) * 50)}%`;
    }
    arrow(x, y, w, h, dir) {
        const a = this.hit(x, y, w, h, () => { });
        const tick = () => this.stepAim(dir);
        let held = false;
        a.on(Laya.Event.MOUSE_DOWN, this, () => {
            if (held || this.paused)
                return;
            held = true;
            tick();
            Laya.timer.loop(135, this, tick);
        });
        const stop = () => { if (!held)
            return; held = false; Laya.timer.clear(this, tick); };
        a.on(Laya.Event.MOUSE_UP, this, stop);
        a.on(Laya.Event.MOUSE_OUT, this, stop);
        Laya.stage.on(Laya.Event.MOUSE_UP, this, stop);
    }
    mount() {
        this.root = new Laya.Sprite();
        this.root.size(this.W, this.H);
        Laya.stage.addChild(this.root);
        this.layout();
        Laya.stage.on(Laya.Event.RESIZE, this, this.layout);
        // Marquee and control deck are cropped from the approved 肉鸽推币机 concept.
        this.image("resources/visual/marquee.webp", 0, 0, 750, 270);
        this.image("resources/visual/console.webp", 0, 973, 750, 361);
        for (const [x, y] of [[12, 272], [265, 272], [518, 272]]) {
            this.image("resources/visual/hud-pill.webp", x, y, 221, 69);
        }
        this.labels.score = this.text("得分 0", 20, 281, 210, 49, 29, "#ffeaa6");
        this.labels.supply = this.text("剩余 45", 273, 281, 210, 49, 29, "#bdf3ff");
        this.labels.energy = this.text("礼炮 0/12", 526, 281, 210, 49, 28, "#ffbbdb");
        // Small live targeting marker, distinct from the static art.
        this.plate(288, 351, 174, 34, "#21133f", 0.84);
        this.labels.aim = this.text("投币位置 50%", 292, 352, 165, 31, 21, "#ffe7a0");
        // Dynamic foreground note between machine and console.
        this.plate(68, 940, 615, 30, "#140d32", 0.79);
        this.labels.notice = this.text(this.lastNotice, 73, 939, 604, 31, 20, "#fff0d0");
        this.arrow(28, 1062, 148, 193, -1);
        this.arrow(450, 1062, 135, 193, 1);
        this.hit(178, 991, 268, 265, () => { if (!this.paused)
            this.onDrop(); });
        this.hit(588, 1060, 151, 197, () => { if (!this.paused)
            this.onArcade(); });
        // Dedicated pause icon above the control deck, avoids hiding a gameplay button.
        this.plate(671, 925, 68, 54, "#25165b", 0.94);
        this.text("Ⅱ", 681, 929, 48, 43, 33, "#ffda64");
        this.hit(671, 925, 68, 54, () => this.onPause());
        this.buildPauseLayer();
    }
    buildPauseLayer() {
        const shade = new Laya.Sprite();
        shade.size(750, 1334);
        shade.graphics.drawRect(0, 0, 750, 1334, "#08091e");
        shade.alpha = 0.88;
        shade.mouseEnabled = true;
        this.root.addChild(shade);
        const title = this.text("游戏已暂停", 105, 485, 540, 100, 51, "#ffd47c");
        const tip = this.text("休息一下，金币会留在原位", 100, 586, 550, 55, 25, "#b9e7ff");
        const continueText = this.text("▶ 继续游戏", 205, 722, 340, 80, 36, "#ffffff");
        const resetText = this.text("↻ 重新开始", 205, 835, 340, 80, 32, "#ffffff");
        const resumePanel = this.plate(200, 725, 350, 76, "#e98a1f", 0.8);
        const resetPanel = this.plate(200, 838, 350, 76, "#653c99", 0.9);
        // Re-add text so it is never obscured by panel graphics.
        this.root.addChild(continueText);
        this.root.addChild(resetText);
        const resume = this.hit(200, 725, 350, 76, () => this.onPause());
        const restart = this.hit(200, 838, 350, 76, () => this.onReset());
        this.pauseLayer = { shade, title, tip, resumePanel, resetPanel, continueText, resetText, resume, restart };
        this.setPauseVisible(false);
    }
    setPauseVisible(value) {
        if (!this.pauseLayer)
            return;
        for (const n of Object.values(this.pauseLayer))
            n.visible = value;
    }
    layout() {
        if (!this.root)
            return;
        this.root.x = Math.round((Laya.stage.width - this.W) / 2);
        this.root.y = Math.round((Laya.stage.height - this.H) / 2);
    }
    update(s, queued, paused) {
        this.paused = paused;
        this.labels.score.text = `得分 ${s.score}`;
        this.labels.supply.text = `剩余 ${s.supply}`;
        this.labels.energy.text = `礼炮 ${s.energy}/${GameRules_1.RULES.arcadeThreshold}`;
        if (paused)
            this.lastNotice = "已暂停";
        else if (s.supply <= 0 && queued === 0)
            this.lastNotice = "供币用尽，可以使用已充能的礼炮";
        else if (queued >= GameRules_1.RULES.queueCapacity)
            this.lastNotice = "推板推进中…";
        else
            this.lastNotice = `前落 ${s.collected}  ·  侧漏 ${s.leaked}  ·  已发礼炮 ${s.shots}`;
        this.labels.notice.text = this.lastNotice;
        this.setPauseVisible(paused);
    }
    showMessage(message) { this.lastNotice = message; this.labels.notice.text = message; }
}
exports.Hud = Hud;

},
"game/CoinPusherGame":function(module,exports,require){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoinPusherGame = void 0;
const GameRules_1 = require("../core/GameRules");
const CollectionGates_1 = require("../core/CollectionGates");
const Hud_1 = require("../ui/Hud");
/** Receives genuine Bullet overlap callbacks; never awards points directly. */
class CoinSlotTrigger extends Laya.Script {
    constructor() {
        super(...arguments);
        this.kind = "side";
        this.notify = null;
    }
    onTriggerEnter(other) { this.notify?.(this.kind, other); }
}
/** 3D physics prototype. Every visible coin has its own Bullet Rigidbody3D cylinder. */
class CoinPusherGame {
    constructor() {
        this.rules = new GameRules_1.GameRules();
        this.queue = new GameRules_1.PusherQueue();
        this.coins = new Map();
        this.terminalEvents = new Map();
        this.aim = 0;
        this.paused = false;
        this.material = {};
        this.pendingArcade = 0;
        this.clock = 0;
        this.cycleRearZ = -2.72;
        this.trayFrontZ = CollectionGates_1.TRAY.frontLipZ;
        this.halfWidth = CollectionGates_1.TRAY.halfWidth;
    }
    start() {
        this.scene = new Laya.Scene3D();
        this.scene.name = "CandyNightCoinPusher";
        Laya.stage.addChild(this.scene);
        this.createStage();
        this.hud = new Hud_1.Hud(a => { this.aim = a; }, () => { this.dropPlayerCoin(); }, () => { this.fireArcade(); }, () => { this.setPaused(!this.paused); }, () => { this.reset(); });
        this.hud.mount();
        this.seed();
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
        Laya.timer.frameLoop(1, this, this.update);
        // Browsers may throttle callbacks or pause rendering when backgrounded;
        // stop both game input and physics simulation, never catch up elapsed hours.
        if (typeof document !== "undefined") {
            document.addEventListener("visibilitychange", () => {
                if (document.hidden)
                    this.setPaused(true);
            });
        }
        console.info("[CoinPusher] LayaAir3.4 scene ready, physics cylinders active");
    }
    v(x, y, z) { return new Laya.Vector3(x, y, z); }
    makeMaterial(name, r, g, b, shine = 0.6) {
        const mat = new Laya.BlinnPhongMaterial();
        mat.albedoColor = new Laya.Color(r, g, b, 1);
        mat.specularColor = new Laya.Color(.97, .87, .64, 1);
        mat.shininess = shine;
        this.material[name] = mat;
        return mat;
    }
    createMesh(name, mesh, material, pos) {
        const n = new Laya.Sprite3D(name);
        n.transform.position = this.v(pos[0], pos[1], pos[2]);
        n.addComponent(Laya.MeshFilter).sharedMesh = mesh;
        n.addComponent(Laya.MeshRenderer).sharedMaterial = material;
        this.scene.addChild(n);
        return n;
    }
    box(name, pos, size, material, physics = "none") {
        const n = this.createMesh(name, Laya.PrimitiveMesh.createBox(...size), material, pos);
        if (physics !== "none") {
            const body = n.addComponent(physics === "static" ? Laya.PhysicsCollider : Laya.Rigidbody3D);
            body.colliderShape = new Laya.BoxColliderShape(...size);
            body.friction = 0.6;
            body.restitution = 0.02;
            if (physics === "kinematic")
                body.isKinematic = true;
        }
        return n;
    }
    createStage() {
        const gold = this.makeMaterial("gold", 1.0, .65, .16, .94);
        this.makeMaterial("seed", .9, .7, .32, .9);
        this.makeMaterial("reward", .96, .34, .6, .85);
        const navy = this.makeMaterial("navy", .06, .045, .20, .72);
        const violet = this.makeMaterial("violet", .19, .08, .43, .73);
        const pink = this.makeMaterial("pink", .98, .08, .49, .92);
        const cream = this.makeMaterial("cream", .98, .78, .49, .7);
        const board = this.makeMaterial("board", .09, .065, .14, .32);
        const electricBlue = this.makeMaterial("electricBlue", .13, .48, 1.0, .96);
        const neonPurple = this.makeMaterial("neonPurple", .64, .13, 1.0, .88);
        const bronze = this.makeMaterial("bronze", .73, .30, .08, .94);
        const glass = this.makeMaterial("glass", .32, .65, .94, .85);
        glass.albedoColor = new Laya.Color(.18, .49, .88, .29);
        if (Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT !== undefined)
            glass.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
        this.makeMaterial("coinFace", 1.0, .91, .42, .95);
        this.camera = new Laya.Camera(0, 0.1, 100);
        this.camera.transform.position = this.v(0, 8.0, 9.0);
        this.camera.transform.lookAt(this.v(0, -.1, -.38), this.v(0, 1, 0));
        this.camera.fieldOfView = 52;
        this.scene.addChild(this.camera);
        const lightOwner = new Laya.Sprite3D("StudioKeyLight");
        this.scene.addChild(lightOwner);
        const light = lightOwner.addComponent(Laya.DirectionLightCom);
        light.color = new Laya.Color(1.0, .88, .71, 1);
        light.intensity = 1.8;
        lightOwner.transform.rotationEuler = this.v(-56, -25, 0);
        this.scene.ambientMode = Laya.AmbientMode.SolidColor;
        this.scene.ambientColor = new Laya.Color(.55, .52, .60, 1);
        // Thin physical tray; no collider under the front lip or either side-drop lane.
        this.box("tray-solid", [0, -.12, -.56], [5.14, .22, 5.68], board, "static");
        this.box("tray-rim-back", [0, .22, -3.46], [5.4, .65, .2], cream, "static");
        this.box("left-lane-rail", [-2.66, .24, -1.9], [.18, .64, 3.03], pink, "static");
        this.box("right-lane-rail", [2.66, .24, -1.9], [.18, .64, 3.03], pink, "static");
        // Front landing chest is ornamental, deliberately has no collider to catch coins.
        this.box("collection-mouth", [0, -.56, 2.81], [5.9, .4, .75], navy);
        this.box("collection-trim", [0, -.26, 2.55], [5.35, .13, .17], gold);
        this.box("outer-plinth", [0, -.83, -.4], [6.7, .55, 7.0], violet);
        this.box("cabinet-crown", [0, .4, -3.95], [6.6, 1.3, .68], pink);
        this.box("crown-inset", [0, .45, -3.55], [5.6, .78, .12], cream);
        this.box("left-post", [-3.2, -.04, -.5], [.44, .76, 6.5], pink);
        this.box("right-post", [3.2, -.04, -.5], [.44, .76, 6.5], pink);
        this.box("arcade-mouth", [0, .6, -3.34], [1.55, .45, .45], navy);
        // Neon cabinet rails, layered plated trim and a shallow plexiglass lip.
        // These are visual-only meshes: never block the actual front collection slot.
        for (const side of [-1, 1]) {
            this.box(`neon-side-${side}`, [side * 3.24, .29, -.55], [.085, .065, 6.42], neonPurple);
            this.box(`electric-rail-${side}`, [side * 2.78, .56, -.58], [.052, .06, 4.77], electricBlue);
            this.box(`brass-cabinet-${side}`, [side * 3.43, -.39, -.45], [.14, .20, 6.7], bronze);
            this.box(`glass-guard-${side}`, [side * 2.84, .46, .20], [.062, .78, 3.95], glass);
        }
        this.box("front-gold-bezel", [0, -.56, 3.07], [6.47, .12, .11], gold);
        this.box("front-neon-stripe", [0, -.64, 3.17], [6.30, .07, .07], neonPurple);
        this.box("pusher-accent", [0, .32, -2.71], [4.85, .05, .07], gold);
        this.box("arcade-blue-trim", [0, .88, -3.26], [1.8, .07, .08], electricBlue);
        this.box("lower-bezel", [0, -1.06, 1.7], [6.90, .17, 2.1], navy);
        // Metallic guide is visual. The real moving pusher is a kinematic collision body.
        this.box("pusher-rail", [0, -.01, -2.8], [5.07, .08, 1.04], cream);
        this.pusher = this.box("kinematic-pusher", [0, .16, this.cycleRearZ], [4.9, .28, .42], pink, "kinematic");
        this.makeGate("front-slot-trigger", "front", [0, -.42, 2.64], [5.16, .72, .68]);
        this.makeGate("left-side-trigger", "side", [-2.80, -.42, .80], [.42, .72, 2.90]);
        this.makeGate("right-side-trigger", "side", [2.80, -.42, .80], [.42, .72, 2.90]);
        this.coinMesh = Laya.PrimitiveMesh.createCylinder(.19, .055, 18);
        this.coinTopMesh = Laya.PrimitiveMesh.createCylinder(.138, .002, 18);
        // Decorative dots echo the light-bulb frame, non-interactive.
        const dotMesh = Laya.PrimitiveMesh.createSphere(.085, 8, 8);
        for (let x = -2.8; x <= 2.8; x += .55) {
            this.createMesh("cabinet-bulb", dotMesh, cream, [x, .84, -3.46]);
        }
    }
    makeGate(name, kind, pos, size) {
        const n = new Laya.Sprite3D(name);
        n.transform.position = this.v(...pos);
        this.scene.addChild(n);
        const trigger = n.addComponent(Laya.PhysicsCollider);
        trigger.colliderShape = new Laya.BoxColliderShape(...size);
        trigger.isTrigger = true;
        const script = n.addComponent(CoinSlotTrigger);
        script.kind = kind;
        script.notify = (gate, other) => {
            // Laya 3D passes the OTHER PhysicsColliderComponent (not its render node).
            const node = other?.owner;
            const id = node?.coinEntityId;
            if (!Number.isInteger(id) || !this.coins.has(id))
                return;
            const p = node.transform.position;
            if ((0, CollectionGates_1.verifyTrigger)(gate, p))
                this.queueTerminal(id, gate);
        };
    }
    queueTerminal(id, kind) {
        if (!this.coins.has(id))
            return;
        // A front collectible cannot also be cashed as a side leak in the same step.
        const existing = this.terminalEvents.get(id);
        if (existing === undefined)
            this.terminalEvents.set(id, kind);
        else if (kind === "front")
            this.terminalEvents.set(id, "front");
    }
    coin(origin, x, y, z) {
        const id = this.rules.register(origin);
        if (id === null)
            return false;
        const node = this.createMesh(`coin_${id}_${origin}`, this.coinMesh, this.material[origin === "player" ? "gold" : origin], [x, y, z]);
        node.coinEntityId = id;
        // Embossed contrasting coin face as a child of the real dynamic rigid body.
        const face = new Laya.Sprite3D(`coin_face_${id}`);
        face.transform.localPosition = this.v(0, .029, 0);
        face.addComponent(Laya.MeshFilter).sharedMesh = this.coinTopMesh;
        face.addComponent(Laya.MeshRenderer).sharedMaterial = this.material["coinFace"];
        node.addChild(face);
        const body = node.addComponent(Laya.Rigidbody3D);
        body.colliderShape = new Laya.CylinderColliderShape(.19, .055);
        body.mass = .07;
        body.friction = .44;
        body.restitution = .025;
        body.linearDamping = .13;
        body.angularDamping = .4;
        this.coins.set(id, { id, origin, node });
        return true;
    }
    seed() {
        // Live Bullet bodies: staggered base coins, plus a few raised coins that
        // settle naturally. No fake wallpaper of coins and no per-device coin culling.
        let count = 0;
        for (let row = 0; row < 12; row++) {
            for (let col = 0; col < 9; col++) {
                const x = (col - 4) * .48 + (row % 2) * .13;
                const z = -1.64 + row * .335;
                this.coin("seed", x, .09, z);
                count++;
            }
        }
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 9; col++) {
                const x = (col - 4) * .47 + (row % 2) * .18;
                const z = -1.10 + row * .87;
                this.coin("seed", x, .31 + (col % 3) * .008, z);
                count++;
            }
        }
        if (count !== GameRules_1.RULES.seedCoins)
            throw new Error("Seed count disagrees with physics layout");
    }
    dropPlayerCoin() {
        if (this.paused || this.queue.occupied >= GameRules_1.RULES.queueCapacity || this.rules.supply === 0)
            return false;
        if (this.rules.activeCount >= GameRules_1.RULES.maxCoins)
            return false;
        if (!this.queue.request())
            return false;
        this.rules.spendCoin();
        const x = this.aim * 2.05;
        this.coin("player", x, .66, -2.20);
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
        return true;
    }
    fireArcade() {
        if (this.paused || !this.rules.canFire() || this.queue.occupied >= GameRules_1.RULES.queueCapacity)
            return false;
        if (this.rules.activeCount + GameRules_1.RULES.rewardCount > GameRules_1.RULES.maxCoins)
            return false;
        if (!this.queue.request())
            return false;
        this.rules.fire();
        this.pendingArcade = GameRules_1.RULES.rewardCount;
        this.hud.showMessage("礼炮发射！奖励币正落回推币台");
        return true;
    }
    update() {
        if (this.paused)
            return;
        const dt = Math.min(.05, Math.max(0, Laya.timer.delta / 1000));
        this.clock += dt;
        const offset = this.queue.update(dt);
        this.pusher.transform.position = this.v(0, .16, this.cycleRearZ + offset);
        if (this.pendingArcade > 0) {
            // Give reward coins unique bodies; don't just add a score multiplier.
            const toMake = Math.min(2, this.pendingArcade);
            for (let i = 0; i < toMake; i++) {
                const n = GameRules_1.RULES.rewardCount - this.pendingArcade + i;
                this.coin("reward", (n - 2.5) * .65, .85, -2.15 + (n % 2) * .18);
            }
            this.pendingArcade -= toMake;
        }
        // Bullet trigger contacts queue events; a conservative geometric fallback
        // handles missed overlaps after the body has passed below the board.
        for (const [id, c] of this.coins) {
            const p = c.node.transform.position;
            const routed = (0, CollectionGates_1.routeBelowPlane)(p);
            if (routed)
                this.queueTerminal(id, routed);
        }
        // Flush only after physics callbacks have finished; ID order stabilizes
        // multiple drops within one simulation step.
        const terminal = [...this.terminalEvents].sort((a, b) => a[0] - b[0]);
        this.terminalEvents.clear();
        for (const [id, kind] of terminal) {
            if (this.rules.settle(id, kind)) {
                const c = this.coins.get(id);
                if (c) {
                    c.node.destroy();
                    this.coins.delete(id);
                }
            }
        }
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
    }
    setPaused(value) {
        this.paused = value;
        // LayaAir's engine timer also drives simulation delta. A mere early return
        // from our frameLoop does not suspend Bullet, so freeze the game clock.
        Laya.timer.scale = value ? 0 : 1;
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
    }
    reset() {
        this.setPaused(false);
        for (const c of this.coins.values())
            c.node.destroy();
        this.coins.clear();
        this.terminalEvents.clear();
        this.rules.reset();
        this.queue.reset();
        this.pendingArcade = 0;
        this.clock = 0;
        this.aim = 0;
        this.paused = false;
        this.pusher.transform.position = this.v(0, .16, this.cycleRearZ);
        this.seed();
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
    }
    /** Read-only debug status for localhost Chromium automation, never production scores. */
    inspect() {
        return { ...this.rules.snapshot(), activeCoins: this.rules.activeCount,
            queued: this.queue.occupied, phase: this.queue.phase, paused: this.paused,
            pusherZ: this.pusher.transform.position.z,
            physicsReady: Boolean(this.scene.physicsSimulation),
            coinSample: [...this.coins.values()].slice(0, 3).map(c => ({
                id: c.id, x: c.node.transform.position.x,
                y: c.node.transform.position.y, z: c.node.transform.position.z
            })) };
    }
    // Test actions emulate actual input boundaries but cannot mint score.
    debugDrop() { return this.dropPlayerCoin(); }
    debugFire() { return this.fireArcade(); }
    debugAim(value) { this.aim = Math.max(-1, Math.min(1, value)); }
}
exports.CoinPusherGame = CoinPusherGame;

}};
  const cache={};
  function get(pathname){
    const id=pathname;
    if(cache[id])return cache[id].exports;
    const factory=factories[id];if(!factory)throw new Error('Missing compiled module: '+id);
    const mod={exports:{}};cache[id]=mod;
    const dir=id.includes('/')?id.slice(0,id.lastIndexOf('/')+1):'';
    const req=(q)=>{
      const combined=dir+q;const parts=[];
      for(const part of combined.split('/')){if(part==='.'||part==='')continue;if(part==='..')parts.pop();else parts.push(part);}
      return get(parts.join('/'));
    };
    factory(mod,mod.exports,req);return mod.exports;
  }
  global.$_main_=()=>get('Entry').main();
})(typeof window!=='undefined'?window:globalThis);
