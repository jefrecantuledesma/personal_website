var canvas, stage, exportRoot, anim_container, dom_overlay_container, fnStartAnimation;

function init() {
  canvas = document.getElementById("canvas");
  anim_container = document.getElementById("animation_container");
  dom_overlay_container = document.getElementById("dom_overlay_container");
  var comp = AdobeAn.getComposition("CCA42EC0162AC6408FE13DD94D36AB58");
  var lib = comp.getLibrary();
  var loader = new createjs.LoadQueue(false);
  loader.addEventListener("fileload", function(evt) { handleFileLoad(evt, comp) });
  loader.addEventListener("complete", function(evt) { handleComplete(evt, comp) });
  loader.loadManifest(lib.properties.manifest);
}

function handleFileLoad(evt, comp) {
  var images = comp.getImages();
  if (evt && (evt.item.type == "image")) {
    images[evt.item.id] = evt.result;
  }
}

function handleComplete(evt, comp) {
  var lib = comp.getLibrary();
  var ss = comp.getSpriteSheet();
  var queue = evt.target;
  var ssMetadata = lib.ssMetadata;
  for (i = 0; i < ssMetadata.length; i++) {
    ss[ssMetadata[i].name] = new createjs.SpriteSheet({ "images": [queue.getResult(ssMetadata[i].name)], "frames": ssMetadata[i].frames });
  }
  exportRoot = new lib.DONE();
  stage = new lib.Stage(canvas);
  stage.enableMouseOver();
  fnStartAnimation = function() {
    stage.addChild(exportRoot);
    createjs.Ticker.framerate = lib.properties.fps;
    createjs.Ticker.addEventListener("tick", stage);
  }
  AdobeAn.makeResponsive(true, 'both', true, 1, [canvas, anim_container, dom_overlay_container]);
  AdobeAn.compositionLoaded(lib.properties.id);
  fnStartAnimation();
}

