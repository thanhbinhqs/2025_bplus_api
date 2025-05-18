import { MenuItemType } from '../enums/menu-item.enum';
import { SubjectType } from '../enums/subject-type.enum';

export default interface MenuItem {
  title: string;
  slug: string;
  path: string;
  pattern?: string;
  type: MenuItemType;
  children?: MenuItem[];
  subject?: SubjectType;
}
