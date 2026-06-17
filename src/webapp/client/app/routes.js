import { index, route, prefix, layout } from '@react-router/dev/routes';

export default [
  // ── Portal (kiosk) — serves at root ──
  layout('routes/portal/layout.jsx', [
    index('routes/portal/form.jsx'),
    route('qr', 'routes/portal/qr.jsx'),
  ]),
  // ── Webapp (QR destination) ──
  route("web", "routes/intro.jsx"),
  route("map", "routes/map.jsx", [
    layout("layouts/detail-panel.jsx", [
      route(":locationId", "routes/location-detail.jsx"),
    ]),
  ]),
];