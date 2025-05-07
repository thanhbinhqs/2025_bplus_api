import { MenuItemType } from "../enums/menu-item.enum";

export default interface MenuItem {
    label: string;
    slug: string;
    path: string;
    type: MenuItemType;
    children?: MenuItem[];
}