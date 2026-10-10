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
    maxCoins: 600, seedCoins: 180, initialSupply: 45, cycleSeconds: 1.25,
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
        label.font = "Arial, Noto Sans CJK SC, Microsoft YaHei, sans-serif";
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
        this.labels.aim.x = 355 + this.aim * 120;
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
        this.image("resources/visual/side-neon.webp", 0, 343, 750, 630);
        this.image("resources/visual/score-panel.webp", 12, 272, 221, 69);
        this.image("resources/visual/supply-panel.webp", 265, 272, 221, 69);
        this.image("resources/visual/arcade-panel.webp", 518, 272, 221, 69);
        // The Chinese labels live in artwork, so they display correctly even on Linux without CJK fonts.
        // Only numeric readouts are dynamic.
        this.labels.score = this.text("0", 151, 283, 74, 44, 31, "#ffeaa6");
        this.labels.supply = this.text("45", 404, 283, 74, 44, 31, "#bdf3ff");
        this.labels.energy = this.text("0/12", 651, 283, 83, 44, 27, "#ffbbdb");
        // A moving tiny gold arrow gives aim feedback without covering the metal housing.
        this.labels.aim = this.text("▼", 355, 355, 42, 40, 29, "#ffe8a3");
        // Dynamic foreground note between machine and console.
        this.labels.notice = this.text("", 180, 947, 390, 24, 16, "#fff0d0");
        this.arrow(28, 1062, 148, 193, -1);
        this.arrow(450, 1062, 135, 193, 1);
        this.hit(178, 991, 268, 265, () => { if (!this.paused)
            this.onDrop(); });
        this.hit(588, 1060, 151, 197, () => { if (!this.paused)
            this.onArcade(); });
        // Dedicated pause icon above the control deck, avoids hiding a gameplay button.
        this.plate(671, 925, 68, 54, "#25165b", 0.94);
        this.text("II", 681, 929, 48, 43, 33, "#ffda64");
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
        this.labels.score.text = String(s.score);
        this.labels.supply.text = String(s.supply);
        this.labels.energy.text = `${s.energy}/${GameRules_1.RULES.arcadeThreshold}`;
        if (paused)
            this.lastNotice = "已暂停";
        else if (s.supply <= 0 && queued === 0)
            this.lastNotice = "供币用尽，可以使用已充能的礼炮";
        else if (queued >= GameRules_1.RULES.queueCapacity)
            this.lastNotice = "推板推进中…";
        else
            this.lastNotice = "";
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
        this.playfieldTextureLoaded = false;
        this.decorativeParts = 0;
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
        this.loadCoinSurface();
        this.loadPlayfield();
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
    /** Geometry attached to the moving kinematic pusher, but has no collider of its own. */
    trimOn(parent, name, pos, size, mat) {
        const node = new Laya.Sprite3D(name);
        node.transform.localPosition = this.v(...pos);
        node.addComponent(Laya.MeshFilter).sharedMesh = Laya.PrimitiveMesh.createBox(...size);
        node.addComponent(Laya.MeshRenderer).sharedMaterial = mat;
        parent.addChild(node);
        return node;
    }
    /** Decals decorate genuine Bullet bodies. A failed texture request leaves the coins playable. */
    loadCoinSurface() {
        const type = Laya.Loader?.TEXTURE2D || "TEXTURE2D";
        Laya.loader.load("resources/visual/coin-crown.png", type).then((texture) => {
            if (texture && this.coinFaceMaterial)
                this.coinFaceMaterial.albedoTexture = texture;
        }).catch((error) => console.warn("[CoinPusher] coin-face texture fallback", error));
    }
    /** Laya 3D surface textures decorate visible meshes, never hide a static collision body. */
    loadPlayfield() {
        const type = Laya.Loader?.TEXTURE2D || "TEXTURE2D";
        Laya.loader.load("resources/visual/playfield-inlay.webp", type).then((texture) => {
            if (texture && this.playfieldMaterial) {
                this.playfieldMaterial.albedoTexture = texture;
                this.playfieldTextureLoaded = true;
            }
        }).catch((err) => console.warn("[CoinPusher] etched playfield fallback", err));
    }
    /** Round tubes/caps for the actual cabinet, as true 3D meshes rather than giant rectangular strips. */
    rod(name, pos, length, radius, axis, mat) {
        const node = this.createMesh(name, Laya.PrimitiveMesh.createCylinder(radius, length, 14), mat, pos);
        node.transform.rotationEuler = this.v(axis === "x" ? 0 : 90, 0, axis === "x" ? 90 : 0);
        this.decorativeParts++;
        return node;
    }
    rivet(name, pos, radius, mat) {
        this.createMesh(name, Laya.PrimitiveMesh.createSphere(radius, 10, 8), mat, pos);
        this.decorativeParts++;
    }
    createStage() {
        const gold = this.makeMaterial("gold", 1.0, .62, .10, .98);
        this.makeMaterial("seed", .93, .57, .08, .98);
        this.makeMaterial("reward", .84, .69, 1.0, .95);
        const navy = this.makeMaterial("navy", .06, .045, .20, .72);
        const violet = this.makeMaterial("violet", .19, .08, .43, .73);
        const pink = this.makeMaterial("pink", .98, .08, .49, .92);
        const cream = this.makeMaterial("cream", 1.0, .77, .24, .94);
        const board = this.makeMaterial("board", .043, .025, .073, .42);
        const electricBlue = this.makeMaterial("electricBlue", .13, .48, 1.0, .96);
        const neonPurple = this.makeMaterial("neonPurple", .64, .13, 1.0, .88);
        const bronze = this.makeMaterial("bronze", .73, .30, .08, .94);
        const glass = this.makeMaterial("glass", .32, .65, .94, .85);
        glass.albedoColor = new Laya.Color(.18, .49, .88, .29);
        if (Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT !== undefined)
            glass.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
        const coinFace = this.makeMaterial("coinFace", 1, 1, 1, .92);
        coinFace.albedoColor = new Laya.Color(1, 1, 1, 1);
        if (Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT !== undefined)
            coinFace.renderMode = Laya.BlinnPhongMaterial.RENDERMODE_TRANSPARENT;
        this.coinFaceMaterial = coinFace;
        const obsidian = this.makeMaterial("obsidian", .055, .020, .116, .94);
        const graphite = this.makeMaterial("graphite", .145, .120, .226, .94);
        const ruby = this.makeMaterial("ruby", .58, .035, .20, .92);
        const richGold = this.makeMaterial("richGold", 1.0, .49, .035, .97);
        const champagne = this.makeMaterial("champagne", 1.0, .85, .42, .99);
        const coinEdge = this.makeMaterial("coinEdge", .77, .37, .028, .91);
        const cyan = this.makeMaterial("cyan", .20, .88, 1.0, .94);
        const goldHaze = this.makeMaterial("goldHaze", 1.0, .76, .27, .94);
        const hotPink = this.makeMaterial("hotPink", 1.0, .17, .53, .97);
        const polishedSteel = this.makeMaterial("polishedSteel", .35, .34, .55, .98);
        const playfield = this.makeMaterial("playfieldArt", .74, .68, .83, .64);
        this.playfieldMaterial = playfield;
        this.camera = new Laya.Camera(0, 0.1, 100);
        this.camera.transform.position = this.v(0, 7.7, 8.65);
        this.camera.transform.lookAt(this.v(0, -.1, -.38), this.v(0, 1, 0));
        this.camera.fieldOfView = 50;
        this.camera.clearColor = new Laya.Color(.045, .02, .11, 1);
        this.scene.addChild(this.camera);
        const lightOwner = new Laya.Sprite3D("StudioKeyLight");
        this.scene.addChild(lightOwner);
        const light = lightOwner.addComponent(Laya.DirectionLightCom);
        light.color = new Laya.Color(1.0, .88, .71, 1);
        light.intensity = 1.46;
        lightOwner.transform.rotationEuler = this.v(-56, -25, 0);
        this.scene.ambientMode = Laya.AmbientMode.SolidColor;
        this.scene.ambientColor = new Laya.Color(.35, .31, .46, 1);
        // Contrasting cool rim light makes polished gold, chrome and transparent guards legible.
        const coolOwner = new Laya.Sprite3D("ElectricBlueRimLight");
        this.scene.addChild(coolOwner);
        const cool = coolOwner.addComponent(Laya.DirectionLightCom);
        cool.color = new Laya.Color(.32, .53, 1.0, 1);
        cool.intensity = .48;
        coolOwner.transform.rotationEuler = this.v(-50, 140, 0);
        // Low-range accent spots shape the gold piles and cabinet, not an expensive full-scene bloom pass.
        if (Laya.PointLightCom) {
            for (const side of [-1, 1]) {
                const owner = new Laya.Sprite3D(`GoldCoinSpot_${side}`);
                this.scene.addChild(owner);
                owner.transform.position = this.v(side * 2.20, 2.45, -.15);
                const lamp = owner.addComponent(Laya.PointLightCom);
                lamp.color = side < 0 ? new Laya.Color(1, .54, .22, 1) : new Laya.Color(.87, .37, .95, 1);
                lamp.intensity = .56;
                lamp.range = 5.2;
            }
        }
        // Real collision footprint is untouched: a separate ornament never secretly blocks a coin.
        this.box("tray-solid", [0, -.12, -.56], [5.14, .22, 5.68], board, "static");
        this.box("tray-rim-back", [0, .22, -3.46], [5.4, .65, .2], graphite, "static");
        this.box("left-lane-rail", [-2.66, .24, -1.9], [.18, .64, 3.03], graphite, "static");
        this.box("right-lane-rail", [2.66, .24, -1.9], [.18, .64, 3.03], graphite, "static");
        // A single dark playing field ensures coins keep contrast without a flat bright-blue wall.
        this.box("deep-field-inlay", [0, -.004, -.42], [5.08, .014, 5.36], obsidian);
        // Laser-etched playfield is a real textured XZ mesh, independent of collision geometry.
        this.createMesh("etched-playfield-plane", Laya.PrimitiveMesh.createPlane(5.04, 5.32, 1, 1), playfield, [0, .010, -.43]);
        this.box("underbed-shadow", [0, -.70, -.36], [6.67, .18, 6.60], navy);
        this.box("outer-plinth", [0, -.87, -.45], [6.84, .55, 7.20], violet);
        this.box("plinth-metal-front", [0, -.94, 2.97], [6.84, .26, .28], graphite);
        this.box("plinth-gold-line", [0, -.77, 2.97], [6.72, .055, .095], richGold);
        // Front chute is not a physics wall: coins still fall through the real front slot.
        this.box("collection-mouth", [0, -.51, 2.82], [5.92, .24, .72], obsidian);
        this.box("chute-shadow", [0, -.49, 2.72], [4.92, .035, .43], graphite);
        this.box("collection-trim", [0, -.28, 2.53], [5.36, .15, .20], champagne);
        this.box("collection-trim-inner", [0, -.25, 2.61], [5.19, .045, .07], richGold);
        this.box("front-neon-stripe", [0, -.64, 3.18], [6.32, .07, .07], neonPurple);
        this.box("front-blue-footlight", [0, -.88, 3.21], [6.32, .06, .08], electricBlue);
        this.rod("rounded-payout-front-gold", [0, -.235, 2.56], 5.34, .055, "x", goldHaze);
        this.rod("rounded-payout-low-chrome", [0, -.66, 3.13], 5.94, .065, "x", polishedSteel);
        for (const side of [-1, 1]) {
            this.rivet(`payout-bolt-${side}`, [side * 2.73, -.19, 2.58], .105, champagne);
            this.rivet(`payout-footer-${side}`, [side * 3.14, -.77, 3.08], .095, richGold);
        }
        // A recessed stepped, gently tilted chute visibly receives falling coins,
        // but its ornate surfaces are purely cosmetic and cannot falsely catch a body.
        const payoutRamp = this.box("payout-collector-ramp", [0, -.58, 2.94], [5.12, .035, .40], graphite);
        payoutRamp.transform.rotationEuler = this.v(-16, 0, 0);
        this.box("payout-ramp-highlight", [0, -.51, 3.07], [4.96, .018, .08], bronze);
        // Three distinct widths make the upper housing look like moulded plated metal.
        this.box("rear-body-outer", [0, .46, -3.99], [6.79, 1.48, .72], violet);
        this.box("rear-body-shadow", [0, .42, -3.55], [5.84, .93, .13], obsidian);
        this.box("rear-luminous-gold-panel", [0, .51, -3.44], [5.6, .77, .18], richGold);
        this.box("rear-inside-ruby", [0, .54, -3.30], [5.12, .56, .06], ruby);
        this.box("rear-lower-lip", [0, .12, -3.24], [5.45, .16, .19], champagne);
        this.box("rear-overhead-ridge", [0, 1.20, -3.81], [6.77, .20, .54], ruby);
        this.box("rear-overhead-gold", [0, 1.11, -3.43], [6.38, .075, .10], champagne);
        this.rod("marquee-crown-gold-shoulder", [0, 1.195, -3.39], 6.44, .065, "x", champagne);
        this.rod("rear-bottom-blue-tube", [0, .065, -3.20], 5.52, .048, "x", electricBlue);
        for (let k = 0; k < 7; k++) {
            const x = (k - 3) * .81;
            this.box(`rear-vent-shadow-${k}`, [x, .66, -3.205], [.46, .065, .016], obsidian);
            this.box(`rear-vent-gold-${k}`, [x, .716, -3.197], [.32, .018, .024], goldHaze);
        }
        for (const side of [-1, 1]) {
            this.rivet(`rear-large-bolt-${side}`, [side * 2.95, .94, -3.37], .105, champagne);
            this.rivet(`rear-small-bolt-${side}`, [side * 3.09, .26, -3.36], .078, richGold);
        }
        // Physical cannon tunnel with three metallic raised frames. Decorative only.
        this.box("arcade-port-shadow", [0, .57, -3.24], [1.93, .54, .15], obsidian);
        this.box("arcade-port-gold-top", [0, .88, -3.16], [2.10, .07, .12], champagne);
        this.box("arcade-port-gold-bottom", [0, .28, -3.15], [2.10, .085, .12], gold);
        this.box("arcade-port-left", [-1.025, .57, -3.16], [.08, .55, .12], richGold);
        this.box("arcade-port-right", [1.025, .57, -3.16], [.08, .55, .12], richGold);
        this.box("cannon-interior", [0, .56, -3.12], [1.73, .41, .06], obsidian);
        for (let k = 0; k < 5; k++) {
            const x = (k - 2) * .32;
            this.box(`cannon-shutter-groove-${k}`, [x, .56, -3.079], [.08, .3, .02], graphite);
            this.rivet(`cannon-shutter-lamp-${k}`, [x, .83, -3.083], .04, champagne);
        }
        // Side guard assemblies have repeated seams, steel/glass/LED material layering.
        for (const side of [-1, 1]) {
            this.box(`side-main-${side}`, [side * 3.23, -.21, -.43], [.52, .75, 6.65], violet);
            this.box(`side-outer-chrome-${side}`, [side * 3.46, -.27, -.46], [.14, .28, 6.78], champagne);
            this.box(`side-outer-ruby-${side}`, [side * 3.48, .01, -.46], [.11, .23, 6.73], ruby);
            this.box(`side-neon-purple-${side}`, [side * 3.32, .33, -.51], [.08, .08, 6.52], neonPurple);
            this.box(`side-neon-blue-${side}`, [side * 2.94, .71, -.51], [.05, .07, 4.70], cyan);
            this.box(`side-clear-wall-${side}`, [side * 2.80, .45, .20], [.058, .70, 3.92], glass);
            this.box(`side-clear-wall-glint-${side}`, [side * 2.80, .82, .20], [.075, .03, 3.91], champagne);
            this.box(`side-clear-front-cap-${side}`, [side * 2.78, .44, 2.16], [.12, .90, .10], champagne);
            this.rod(`side-top-rounded-chrome-${side}`, [side * 2.80, .91, .16], 4.17, .075, "z", champagne);
            this.rod(`side-top-magenta-inset-${side}`, [side * 2.79, .98, .16], 4.05, .035, "z", hotPink);
            this.rod(`side-bottom-rounded-blue-${side}`, [side * 2.82, .015, .12], 4.22, .042, "z", electricBlue);
            this.rod(`side-housing-tube-${side}`, [side * 3.43, .20, -.56], 6.50, .075, "z", polishedSteel);
            for (let k = 0; k < 3; k++) {
                const zz = -1.79 + k * 1.93;
                this.rivet(`side-top-crystal-${side}-${k}`, [side * 2.80, 1.02, zz], .090, cyan);
                this.rivet(`side-top-crystal-backing-${side}-${k}`, [side * 2.80, .96, zz], .115, richGold);
            }
            // Per-side stepped metal ribs and visible gold fasteners.
            for (let i = 0; i < 6; i++) {
                const z = -2.94 + i * .98;
                this.box(`side-rib-${side}-${i}`, [side * 3.27, .12, z], [.55, .07, .13], graphite);
                this.createMesh(`side-bolt-${side}-${i}`, Laya.PrimitiveMesh.createSphere(.067, 8, 8), champagne, [side * 3.34, .17, z]);
            }
        }
        // The step plate behind the pusher has three layers but is not a fake second pusher.
        this.box("pusher-track-black", [0, -.012, -2.8], [5.05, .06, 1.09], graphite);
        this.box("pusher-track-gold-edge", [0, .035, -2.25], [5.12, .05, .11], gold);
        this.rod("pusher-track-guidance-rail", [0, .078, -2.246], 5.08, .043, "x", champagne);
        this.pusher = this.box("kinematic-pusher", [0, .16, this.cycleRearZ], [4.9, .28, .42], ruby, "kinematic");
        this.trimOn(this.pusher, "pusher-gold-cap", [0, .155, 0], [4.94, .052, .44], champagne);
        this.trimOn(this.pusher, "pusher-red-top", [0, .188, -.03], [4.72, .03, .32], pink);
        this.trimOn(this.pusher, "pusher-gold-forward-edge", [0, .04, .225], [4.96, .12, .064], richGold);
        this.trimOn(this.pusher, "pusher-purple-underglow", [0, -.087, .227], [4.82, .05, .06], neonPurple);
        this.trimOn(this.pusher, "pusher-front-blue-seam", [0, .106, .237], [4.78, .028, .028], electricBlue);
        for (const side of [-1, 1]) {
            this.trimOn(this.pusher, `pusher-end-block-${side}`, [side * 2.34, .20, -.06], [.18, .14, .43], polishedSteel);
        }
        for (let i = 0; i < 7; i++) {
            const x = (i - 3) * .69;
            this.trimOn(this.pusher, `pusher-inset-light-${i}`, [x, .222, -.08], [.34, .008, .09], champagne);
        }
        // Decoration cannot participate in scoring. Three real slot triggers unchanged.
        this.makeGate("front-slot-trigger", "front", [0, -.42, 2.64], [5.16, .72, .68]);
        this.makeGate("left-side-trigger", "side", [-2.80, -.42, .80], [.42, .72, 2.90]);
        this.makeGate("right-side-trigger", "side", [2.80, -.42, .80], [.42, .72, 2.90]);
        this.coinMesh = Laya.PrimitiveMesh.createCylinder(.19, .075, 32);
        this.coinEdgeMesh = Laya.PrimitiveMesh.createCylinder(.186, .014, 32);
        // The textured planar medallion is a child of the moving 3D coin and follows all spins.
        this.coinTopMesh = Laya.PrimitiveMesh.createPlane(.356, .356, 1, 1);
        const bulb = Laya.PrimitiveMesh.createSphere(.085, 10, 10);
        for (let i = 0; i < 15; i++) {
            const x = (i - 7) * .375;
            this.createMesh(`rear-gold-lamp-${i}`, bulb, champagne, [x, 1.01, -3.27]);
        }
        for (let i = 0; i < 9; i++) {
            const x = (i - 4) * .58;
            this.createMesh(`front-slot-lamp-${i}`, bulb, champagne, [x, -.28, 2.46]);
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
        // Crown orientation and small tilts are not synchronised across the pile.
        node.transform.rotationEuler = this.v(((id * 13) % 7 - 3) * 1.7, (id * 137.508) % 360, ((id * 23) % 9 - 4) * 1.35);
        // A polished beveled rim and a crown-face texture both follow this rigid body.
        const rim = new Laya.Sprite3D(`coin_milled_rim_${id}`);
        rim.transform.localPosition = this.v(0, .039, 0);
        rim.addComponent(Laya.MeshFilter).sharedMesh = this.coinEdgeMesh;
        rim.addComponent(Laya.MeshRenderer).sharedMaterial = this.material["coinEdge"];
        node.addChild(rim);
        const face = new Laya.Sprite3D(`coin_crown_${id}`);
        face.transform.localPosition = this.v(0, .048, 0);
        face.addComponent(Laya.MeshFilter).sharedMesh = this.coinTopMesh;
        face.addComponent(Laya.MeshRenderer).sharedMaterial = this.material["coinFace"];
        node.addChild(face);
        const body = node.addComponent(Laya.Rigidbody3D);
        body.colliderShape = new Laya.CylinderColliderShape(.19, .075);
        body.mass = .07;
        body.friction = .44;
        body.restitution = .025;
        body.linearDamping = .13;
        body.angularDamping = .4;
        this.coins.set(id, { id, origin, node });
        return true;
    }
    seed() {
        // Deterministic irregular distribution: three physical strata, not a grid of coins.
        // The upper strata settle onto the lower layer under Bullet gravity.
        let state = 0x7A51D20;
        const rand = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return state / 4294967296; };
        let total = 0;
        const layers = [
            { count: 102, xMin: -2.25, xMax: 2.25, zMin: -1.84, zMax: 1.65, clearance: .342, y: .084 },
            { count: 54, xMin: -1.97, xMax: 1.97, zMin: -.55, zMax: 1.80, clearance: .35, y: .235 },
            { count: 24, xMin: -1.45, xMax: 1.45, zMin: .34, zMax: 1.91, clearance: .38, y: .400 }
        ];
        for (const layer of layers) {
            const taken = [];
            for (let i = 0; i < layer.count; i++) {
                let x = 0, z = 0, placed = false;
                // Poisson rejection for natural scatter, with bounded execution.
                for (let attempt = 0; attempt < 2400; attempt++) {
                    x = layer.xMin + rand() * (layer.xMax - layer.xMin);
                    z = layer.zMin + rand() * (layer.zMax - layer.zMin);
                    if (taken.every(p => (p.x - x) ** 2 + (p.z - z) ** 2 >= layer.clearance ** 2)) {
                        placed = true;
                        break;
                    }
                }
                if (!placed) { // still finite; fallback gives Bullet a chance to separate it.
                    x = layer.xMin + rand() * (layer.xMax - layer.xMin);
                    z = layer.zMin + rand() * (layer.zMax - layer.zMin);
                }
                taken.push({ x, z });
                this.coin("seed", x, layer.y + (rand() - .5) * .016, z);
                total++;
            }
        }
        if (total !== GameRules_1.RULES.seedCoins)
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
        this.loadCoinSurface();
        this.loadPlayfield();
        this.hud.update(this.rules.snapshot(), this.queue.occupied, this.paused);
    }
    /** Read-only debug status for localhost Chromium automation, never production scores. */
    inspect() {
        return { ...this.rules.snapshot(), activeCoins: this.rules.activeCount,
            queued: this.queue.occupied, phase: this.queue.phase, paused: this.paused, aim: this.aim,
            pusherZ: this.pusher.transform.position.z,
            physicsReady: Boolean(this.scene.physicsSimulation),
            coinFaceLoaded: Boolean(this.coinFaceMaterial?.albedoTexture),
            playfieldLoaded: this.playfieldTextureLoaded,
            decorativeParts: this.decorativeParts,
            movingTrimCount: this.pusher?.numChildren || 0,
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
