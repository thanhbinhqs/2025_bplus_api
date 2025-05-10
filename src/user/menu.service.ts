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
      title: 'Home',
      slug: 'home',
      path: '/',
      type: MenuItemType.TOP_MENU,
    });

    //check if user is not logged in
    if (!user) return menu;


    //USER ACTION MENUS
    menu.push({
      title: 'Profile',
      slug: 'user-profile',
      path: '/dashboard/users/profile',
      type: MenuItemType.DIALOG_PAGE,
    });
    menu.push({
      title: 'Set Password',
      slug: 'user-set-password',
      path: '/dashboard/users/password',
      type: MenuItemType.DIALOG_PAGE,
    });

    menu.push({
      title: 'Set Active',
      slug: 'user-active',
      path: '/dashboard/users/active',
      type: MenuItemType.DIALOG_PAGE,
    });

    menu.push({
      title: 'Set Active',
      slug: 'user-active',
      path: '/dashboard/users/active',
      type: MenuItemType.DIALOG_PAGE,
    });

    menu.push({
      title: 'Delete',
      slug: 'user-delete',
      path: '/dashboard/users/delete',
      type: MenuItemType.DIALOG_PAGE,
    });



    const dashboardItems: MenuItem[] = [];

    if (
      Utils.checkPermissions(
        user.permissions,
        Object.values(UserActionType).map((action) => ({
          subject: SubjectType.USER,
          action,
        })),
      )
    ) {
      dashboardItems.push({
        title: 'Users',
        slug: 'users',
        path: '/dashboard/users',
        type: MenuItemType.TOP_MENU,
      });
    }

    if (dashboardItems.length > 0) {
      menu.push({
        title: 'Dashboard',
        slug: 'dashboard',
        type: MenuItemType.TOP_MENU,
        path: '/dashboard',
        children: dashboardItems,
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
