/* eslint-disable */
// @ts-nocheck
import { Route as rootRouteImport } from './routes/__root'
import { Route as IndexRouteImport } from './routes/index'
import { Route as AdminRouteImport } from './routes/admin'
import { Route as DisplayRouteImport } from './routes/display'
import { Route as RequestRouteImport } from './routes/request'
import { Route as StatusRouteImport } from './routes/status'

const IndexRoute = IndexRouteImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRouteImport,
} as any)
const AdminRoute = AdminRouteImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRouteImport,
} as any)
const DisplayRoute = DisplayRouteImport.update({
  id: '/display',
  path: '/display',
  getParentRoute: () => rootRouteImport,
} as any)
const RequestRoute = RequestRouteImport.update({
  id: '/request',
  path: '/request',
  getParentRoute: () => rootRouteImport,
} as any)
const StatusRoute = StatusRouteImport.update({
  id: '/status',
  path: '/status',
  getParentRoute: () => rootRouteImport,
} as any)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/display': typeof DisplayRoute
  '/request': typeof RequestRoute
  '/status': typeof StatusRoute
}
export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/display': typeof DisplayRoute
  '/request': typeof RequestRoute
  '/status': typeof StatusRoute
}
export interface FileRoutesById {
  __root__: typeof rootRouteImport
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/display': typeof DisplayRoute
  '/request': typeof RequestRoute
  '/status': typeof StatusRoute
}
export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/admin' | '/display' | '/request' | '/status'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/admin' | '/display' | '/request' | '/status'
  id: '__root__' | '/' | '/admin' | '/display' | '/request' | '/status'
  fileRoutesById: FileRoutesById
}
export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  DisplayRoute: typeof DisplayRoute
  RequestRoute: typeof RequestRoute
  StatusRoute: typeof StatusRoute
}

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': { id: '/'; path: '/'; fullPath: '/'; preLoaderRoute: typeof IndexRouteImport; parentRoute: typeof rootRouteImport }
    '/admin': { id: '/admin'; path: '/admin'; fullPath: '/admin'; preLoaderRoute: typeof AdminRouteImport; parentRoute: typeof rootRouteImport }
    '/display': { id: '/display'; path: '/display'; fullPath: '/display'; preLoaderRoute: typeof DisplayRouteImport; parentRoute: typeof rootRouteImport }
    '/request': { id: '/request'; path: '/request'; fullPath: '/request'; preLoaderRoute: typeof RequestRouteImport; parentRoute: typeof rootRouteImport }
    '/status': { id: '/status'; path: '/status'; fullPath: '/status'; preLoaderRoute: typeof StatusRouteImport; parentRoute: typeof rootRouteImport }
  }
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute, AdminRoute, DisplayRoute, RequestRoute, StatusRoute,
}
export const routeTree = rootRouteImport
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

import type { getRouter } from './router.tsx'
import type { createStart } from '@tanstack/react-start'
declare module '@tanstack/react-start' {
  interface Register {
    ssr: true
    router: Awaited<ReturnType<typeof getRouter>>
  }
}
