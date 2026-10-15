import { type RouteConfig, index, route } from '@react-router/dev/routes';

export default [
  index('routes/home.tsx'),
  route('acervo', 'routes/archive.tsx'),
  route('pecas/:slug', 'routes/piece.tsx'),
  route('404', 'routes/not-found.tsx'),
  route('*', 'routes/catch-all.tsx'),
] satisfies RouteConfig;
