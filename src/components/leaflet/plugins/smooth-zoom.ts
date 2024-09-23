// src/plugins/smooth-zoom.ts
import L from "leaflet";

L.Map.mergeOptions({
  smoothWheelZoom: true,
  smoothSensitivity: 5,
});

L.Map.SmoothWheelZoom = L.Handler.extend({
  addHooks: function () {
    L.DomEvent.on(this._map._container, "wheel", this._onWheelScroll, this);
  },
  removeHooks: function () {
    L.DomEvent.off(this._map._container, "wheel", this._onWheelScroll, this);
  },
  _onWheelScroll: function (e: WheelEvent) {
    if (!this._isWheeling) {
      this._onWheelStart(e);
    }
    this._onWheeling(e);
  },
  _onWheelStart: function (e: WheelEvent) {
    const map = this._map;
    this._isWheeling = true;
    this._wheelMousePosition = map.mouseEventToContainerPoint(e);
    this._centerPoint = map.getSize().divideBy(2);
    this._startLatLng = map.containerPointToLatLng(this._centerPoint);
    this._wheelStartLatLng = map.containerPointToLatLng(
      this._wheelMousePosition
    );
    this._startZoom = map.getZoom();
    this._moved = false;
    this._zooming = true;

    map.stop();
    if (map._panAnim) map._panAnim.stop();

    this._goalZoom = map.getZoom();
    this._prevCenter = map.getCenter();
    this._prevZoom = map.getZoom();

    this._zoomAnimationId = requestAnimationFrame(
      this._updateWheelZoom.bind(this)
    );
  },
  _onWheeling: function (e: WheelEvent) {
    const map = this._map;

    this._goalZoom =
      this._goalZoom +
      L.DomEvent.getWheelDelta(e) * 0.003 * map.options.smoothSensitivity;
    if (
      this._goalZoom < map.getMinZoom() ||
      this._goalZoom > map.getMaxZoom()
    ) {
      this._goalZoom = map._limitZoom(this._goalZoom);
    }
    this._wheelMousePosition = this._map.mouseEventToContainerPoint(e);

    clearTimeout(this._timeoutId);
    this._timeoutId = setTimeout(this._onWheelEnd.bind(this), 200);

    L.DomEvent.preventDefault(e);
    L.DomEvent.stopPropagation(e);
  },
  _onWheelEnd: function () {
    this._isWheeling = false;
    cancelAnimationFrame(this._zoomAnimationId);
    this._map._moveEnd(true);
  },
  _updateWheelZoom: function () {
    const map = this._map;

    if (
      !map.getCenter().equals(this._prevCenter) ||
      map.getZoom() !== this._prevZoom
    ) {
      this._isWheeling = false;
      return;
    }

    this._zoom = map.getZoom() + (this._goalZoom - map.getZoom()) * 0.1;
    this._zoom = Math.floor(this._zoom * 100) / 100;

    const delta = this._wheelMousePosition.subtract(this._centerPoint);
    if (delta.x === 0 && delta.y === 0) return;

    if (map.options.smoothWheelZoom === "center") {
      this._center = this._startLatLng;
    } else {
      this._center = map.unproject(
        map.project(this._wheelStartLatLng, this._zoom).subtract(delta),
        this._zoom
      );
    }

    if (!this._moved) {
      map._moveStart(true, false);
      this._moved = true;
    }

    map._move(this._center, this._zoom);
    this._prevCenter = map.getCenter();
    this._prevZoom = map.getZoom();

    this._zoomAnimationId = requestAnimationFrame(
      this._updateWheelZoom.bind(this)
    );
  },
});

L.Map.addInitHook("addHandler", "smoothWheelZoom", L.Map.SmoothWheelZoom);

export default L;
