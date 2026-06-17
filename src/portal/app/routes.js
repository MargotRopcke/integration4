import { index, route, layout } from "@react-router/dev/routes";

export default [
  index("routes/form.jsx"),
  route('qr', 'routes/qr.jsx'),
];
// ── Portal (kiosk) — serves at root ──
  //layout('routes/portal/layout.jsx', [
   // index('routes/portal/form.jsx'),
    //route('qr', 'routes/portal/qr.jsx'),
  //]),