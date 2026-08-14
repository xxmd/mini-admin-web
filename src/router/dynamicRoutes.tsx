import React from 'react';
import type {RouteObject} from 'react-router-dom';
import {type Menu} from "@/api/system/menu";

const pageModules = import.meta.glob([
    '@/pages/**/*.tsx',
    '!@/pages/Login.tsx',
    '!@/pages/NotFound.tsx',
    '!@/pages/Welcome.tsx',
]);

const componentMap: Record<string, React.LazyExoticComponent<React.FC>> = {};
const loaderMap: Record<string, () => Promise<unknown>> = {};

Object.entries(pageModules).forEach(([path, loader]) => {
    const match = path.match(/\/pages\/(.+)\.tsx$/);
    if (match) {
        loaderMap[match[1]] = loader;
        componentMap[match[1]] = React.lazy(loader as () => Promise<{default: React.FC}>);
    }
});

export function preloadPage(component: string): void {
    const loader = loaderMap[component];
    if (loader) {
        void loader();
    }
}

export function preloadPages(components: string[]): void {
    for (const component of components) {
        preloadPage(component);
    }
}

function parseToRouteObjects(menus: Menu[]): RouteObject[] {
    return menus.map(item => {
        const route: RouteObject = {path: item.path};
        if (item.component && componentMap[item.component]) {
            route.element = React.createElement(componentMap[item.component]);
        }
        if (item.hasChildren) {
            route.children = parseToRouteObjects(Array.from(item.children!));
        }
        return route;
    });
}

export function buildDynamicRoutes(menus: Menu[]): RouteObject[] {
    return parseToRouteObjects(menus);
}
