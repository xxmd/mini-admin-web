import type {Menu} from "@/api/menu.ts";

export interface Role {
    id: number;
    label: string;
    value: string;
    menuSet: Set<Menu>;
}

export default {}
