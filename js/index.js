/* LayaAir 3.4 compiled Web bootstrap. Scene and gameplay live in bundle.js. */
(function () {
  const output = document.getElementById('startup-state');
  const config = {
    resolution: { designWidth: 750, designHeight: 1334, scaleMode: 'showall', screenMode: 'none', alignH: 'center', alignV: 'middle', backgroundColor: '#11172a' },
    '2D': { useRetinalCanvas: false, defaultFontSize: 22, defaultFont: 'Arial' },
    '3D': { pixelRatio: 1, enableDynamicBatch: true, enableMultiLight: true, maxLightCount: 8, lightClusterCount: { x: 12, y: 12, z: 12 } },
    addons: { 'laya.ui': 'ui2' },
    UI: { alwaysIncludeDefaultSkin: false },
    modules: { 'laya.physics3D': true },
    physics3dModule: 'laya.bullet',
    physics3D: { fixedTimeStep: 0.016666666666666666, maxSubSteps: 2, enableCCD: false },
    pkgs: [],
    splash: { enabled: false }
  };
  const notify = (message, failed) => {
    if (!output) return;
    output.textContent = message;
    output.classList.toggle('failed', !!failed);
    if (failed) output.hidden = false;
  };
  try {
    if (!window.Laya || !Laya.PlayerConfig) throw Error('LayaAir 3.4 libraries have not loaded');
    Object.assign(Laya.PlayerConfig, config);
    Object.assign(Laya.Config, config['2D']);
    Object.assign(Laya.Config3D, config['3D']);
    if (Laya.UIConfig2) Object.assign(Laya.UIConfig2, config.UI);
    if (Laya.Config3D.lightClusterCount && Laya.Vector3) {
      const v = Laya.Config3D.lightClusterCount;
      Laya.Config3D.lightClusterCount = new Laya.Vector3(v.x, v.y, v.z);
    }
    notify('正在加载 3D 物理世界…', false);
    Laya.init(config.resolution).then(() => {
      if (typeof window.$_main_ !== 'function') throw Error('Compiled game entrypoint missing');
      return window.$_main_();
    }).then(() => { if (output) output.hidden = true; }).catch(e => {
      console.error('Coin pusher Web bootstrap failed', e);
      notify('游戏启动失败：' + (e?.message || String(e)), true);
    });
  } catch (e) {
    console.error('Coin pusher startup error', e);
    notify('游戏初始化失败：' + (e?.message || String(e)), true);
  }
})();
