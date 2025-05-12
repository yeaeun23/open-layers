import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import { unByKey } from "ol/Observable.js";
import View from "ol/View.js";
import { easeOut } from "ol/easing.js";
import Point from "ol/geom/Point.js";
import TileLayer from "ol/layer/Tile.js";
import VectorLayer from "ol/layer/Vector.js";
import { fromLonLat } from "ol/proj.js";
import { getVectorContext } from "ol/render.js";
import VectorSource from "ol/source/Vector.js";
import CircleStyle from "ol/style/Circle.js";
import Stroke from "ol/style/Stroke.js";
import Style from "ol/style/Style.js";
import Fill from "ol/style/Fill.js";
import XYZ from "ol/source/XYZ.js";

const tileLayer = new TileLayer({
  source: new XYZ({
    url: "https://{a-c}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    attributions:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 20,
    wrapX: false,
  }),
});

const source = new VectorSource({
  wrapX: false,
});
const vector = new VectorLayer({
  source: source,
});

const map = new Map({
  layers: [tileLayer, vector],
  target: "map",
  view: new View({
    center: fromLonLat([127.7669, 36.5]), // 대한민국 중심
    zoom: 8,
    multiWorld: true,
  }),
});

// 도시 배열
const cityCoords = [
  { name: "서울", coords: [126.978, 37.566], radius: 18, color: "red" },
  { name: "부산", coords: [129.075, 35.1796], radius: 14, color: "blue" },
  { name: "대구", coords: [128.6014, 35.8714], radius: 13, color: "green" },
  { name: "광주", coords: [126.853, 35.1595], radius: 10, color: "purple" },
  { name: "인천", coords: [126.7052, 37.4563], radius: 15, color: "orange" },
];

// 점 생성 및 스타일 적용
cityCoords.forEach((city) => {
  const point = new Point(fromLonLat(city.coords));
  const feature = new Feature(point);
  const style = new Style({
    image: new CircleStyle({
      radius: city.radius,
      fill: new Fill({ color: city.color }),
      stroke: new Stroke({ color: "white", width: 2 }),
    }),
  });
  feature.setStyle(style);
  feature.set("name", city.name);
  source.addFeature(feature);
});

// 랜덤 위치 점 추가 및 효과
function addRandomFeature() {
  const x = Math.random() * 360 - 180;
  const y = Math.random() * 170 - 85;
  const geom = new Point(fromLonLat([x, y]));
  const feature = new Feature(geom);
  source.addFeature(feature);
}

const duration = 3000;
function flash(feature) {
  const start = Date.now();
  const flashGeom = feature.getGeometry().clone();
  const listenerKey = tileLayer.on("postrender", animate);

  function animate(event) {
    const frameState = event.frameState;
    const elapsed = frameState.time - start;
    if (elapsed >= duration) {
      unByKey(listenerKey);
      return;
    }
    const vectorContext = getVectorContext(event);
    const elapsedRatio = elapsed / duration;
    const radius = easeOut(elapsedRatio) * 25 + 5;
    const opacity = easeOut(1 - elapsedRatio);

    const style = new Style({
      image: new CircleStyle({
        radius: radius,
        stroke: new Stroke({
          color: `rgba(255, 0, 0, ${opacity})`,
          width: 0.25 + opacity,
        }),
      }),
    });

    vectorContext.setStyle(style);
    vectorContext.drawGeometry(flashGeom);
    map.render();
  }
}

source.on("addfeature", function (e) {
  flash(e.feature);
});

window.setInterval(addRandomFeature, 1000);
