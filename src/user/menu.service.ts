import { Inject, Injectable } from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import { User } from './entities/user.entity';
import { Utils } from 'src/common/helpers/utils';
import { SubjectType } from 'src/common/enums/subject-type.enum';
import { MenuItemType } from 'src/common/enums/menu-item.enum';
import MenuItem from 'src/common/interfaces/menu-item.interface';
import { UserActionType } from 'src/common/enums/user-action.enum';

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
      pattern: '/',
    });

    //check if user is not logged in
    if (!user) return menu;

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

    //USER MENU ACTION

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_UPDATE,
        },
      ])
    ) {
      menu.push({
        title: 'Profile',
        slug: 'profile',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/profile',
        subject: SubjectType.USER,
      });
    }

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_SET_ROLE,
        },
      ])
    ) {
      menu.push({
        title: 'Role',
        slug: 'role',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/role',
        subject: SubjectType.USER,
      });
    }

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_SET_PERMISSIONS,
        },
      ])
    ) {
      menu.push({
        title: 'Permission',
        slug: 'permission',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/permission',
        subject: SubjectType.USER,
      });
    }

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_SET_ACTIVE,
        },
      ])
    ) {
      menu.push({
        title: 'Active',
        slug: 'active',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/active',
        subject: SubjectType.USER,
      });
    }

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_SET_PASSWORD,
        },
      ])
    ) {
      menu.push({
        title: 'Password',
        slug: 'password',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/password',
        subject: SubjectType.USER,
      });
    }

    if (
      Utils.checkPermissions(user.permissions, [
        {
          subject: SubjectType.USER,
          action: UserActionType.USER_DELETE,
        },
      ])
    ) {
      menu.push({
        title: 'Delete',
        slug: 'delete',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/delete',
        subject: SubjectType.USER,
      });
      menu.push({
        title: 'Rollback',
        slug: 'rollback',
        type: MenuItemType.ACTION_MENU,
        path: '/dashboard/users/rollback',
        subject: SubjectType.USER,
      });
    }

    //OTHER

    return menu;
  }

  findMenu() {
    const user = this.request['user'] as User;
    const menu = this.getMenu(user);
    return menu;
  }
}
