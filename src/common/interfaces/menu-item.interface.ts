import { MenuItemType } from "../enums/menu-item.enum";

export default interface MenuItem {
    title: string;
    slug: string;
    path: string;
    type: MenuItemType;
    children?: MenuItem[];
}