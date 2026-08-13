import React from 'react';
import type {RouteObject} from 'react-router-dom';
import {type Menu} from "@/api/menu.ts";

const pageModules = import.meta.glob('@/pages/**/*.tsx');

const componentMap: Record<string, React.LazyExoticComponent<React.FC>> = {};
Object.entries(pageModules).forEach(([path, loader]) => {
    const match = path.match(/\/pages\/(.+)\.tsx$/);
    if (match) {
        componentMap[match[1]] = React.lazy(loader as () => Promise<{ default: React.FC }>);
    }
});

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
