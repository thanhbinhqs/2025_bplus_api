import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User } from './entities/user.entity';
import { Utils } from 'src/common/helpers/utils';
import { UserActionType } from 'src/common/enums/user-action.enum';
import { SubjectType } from 'src/common/enums/subject-type.enum';
import { MenuItemType } from 'src/common/enums/menu-item.enum';
import MenuItem from 'src/common/interfaces/menu-item.interface';

@Injectable()
export class MenuService {
  constructor(
    @Inject(REQUEST)
    private readonly request: Request,
  ) {}

  getMenu(user: User) {
    const menu: MenuItem[] = [];

    menu.push({
      label: 'Home',
      slug: 'home',
      path: '/',
      type: MenuItemType.TOP_MENU,
    });

    //check if user is not logged in
    if (!user) return menu;

    if (
      Utils.checkPermissions(
        user.permissions,
        Object.values(UserActionType).map((action) => ({
          subject: SubjectType.USER,
          action,
        })),
      )
    ) {
      menu.push({
        label: 'Users',
        slug: 'users',
        path: '/users',
        type: MenuItemType.TOP_MENU,
      });
    }

    return menu;
  }

  
  findMenu() {
    const user = this.request['user'] as User;
    const menu = this.getMenu(user);
    return menu;
  }
}
