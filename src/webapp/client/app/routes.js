import { index, route, prefix, layout } from '@react-router/dev/routes';

export default [
  // ── Webapp (QR destination) ──
   index("routes/intro.jsx"),
  route("map", "routes/map.jsx", [
    layout("layouts/detail-panel.jsx", [
      route(":locationId", "routes/location-detail.jsx"),
    ]),
  ]),
  // ── Portal (kiosk) ──
  ...prefix('portal', [
   layout('routes/portal/layout.jsx', [
      index('routes/portal/form.jsx'),
     // route('scan',  'routes/portal/scan.jsx'),
      //route('form',  'routes/portal/form.jsx'),
      route('qr',    'routes/portal/qr.jsx'),
    ]),
  ]),
];