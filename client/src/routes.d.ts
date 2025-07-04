import { ReactNode } from 'react';

declare module './routes' {
  interface RouteObject {
    path: string;
    element: ReactNode;
    children?: RouteObject[];
  }

  const routes: RouteObject[];
  export default routes;
}
