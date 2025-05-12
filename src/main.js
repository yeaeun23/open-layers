import Feature from "ol/Feature.js";
import Map from "ol/Map.js";
import View from "ol/View.js";
import Point from "ol/geom/Point.js";
import Tile from "ol/layer/Tile.js";
import { fromLonLat } from "ol/proj.js";
import Vector from "ol/source/Vector.js";
import XYZ from "ol/source/XYZ.js";
import Heatmap from "ol/layer/Heatmap.js";
import { data } from "./data.js";
import { boundingExtent } from "ol/extent";

// 타일 레이어
const tileLayer = new Tile({
  source: new XYZ({
    url: "https://cartodb-basemaps-{a-d}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png", // 다크 테마
  }),
});

// 히트맵 레이어
const heatmapLayer = new Heatmap({
  source: new Vector({
    features: data.map(([lon, lat, weight]) => {
      return new Feature({
        geometry: new Point(fromLonLat([lon, lat])),
        weight: weight,
      });
    }),
  }),
  blur: 20,
  radius: 15,
  weight: function (feature) {
    return feature.get("weight");
  },
  gradient: [
    "rgba(255,255,255,0)",
    "rgba(255,255,255,0.3)",
    "rgba(255,255,255,0.5)",
    "rgba(255,255,255,0.7)",
    "rgba(255,255,255,0.9)",
  ],
});

// 지도 생성
const map = new Map({
  target: "map",
  layers: [tileLayer, heatmapLayer],
  view: new View({
    center: fromLonLat([127.7669, 36.2084]), // 지도 중심좌표표
    zoom: 7, // 초기 줌 레벨
    minZoom: 7, // 최소 줌 레벨
    maxZoom: 12, // 최대 줌 레벨
    extent: boundingExtent([
      // 드래그 범위
      fromLonLat([124.5, 33.0]), // 남서쪽 좌표
      fromLonLat([131.5, 39.5]), // 북동쪽 좌표표
    ]),
    smoothExtentConstraint: true, // 부드러운 드래그
  }),
});
