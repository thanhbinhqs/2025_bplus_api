import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { Permission } from 'src/user/entities/permission.entity';
import { SubjectType } from '../enums/subject-type.enum';
import { ActionType } from '../enums/action.enum';
import { UserActionType } from '../enums/user-action.enum';
import { PermissionDto } from 'src/user/dto/set-user-permission.dto';

export const Utils = {
  // Function to check if a string is empty or contains only whitespace characters
  isEmptyOrWhitespace: (str: string): boolean => {
    return !str || str.trim().length === 0;
  },

  // Function to check if a string is a valid email address
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Function to check if a string is a valid phone number
  isValidPhoneNumber: (phone: string): boolean => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/; // E.164 format
    return phoneRegex.test(phone);
  },

  // Function to check if a string is a valid URL
  isValidURL: (url: string): boolean => {
    const urlRegex = /^(https?:\/\/)?([a-z0-9-]+\.)+[a-z]{2,}([\/\w.-]*)*\/?$/i;
    return urlRegex.test(url);
  },

  // Function to check if a string is a valid base64 encoded string
  isValidBase64: (str: string): boolean => {
    const base64Regex = /^(data:image\/[a-zA-Z]+;base64,)?([A-Za-z0-9+/=]+)$/;
    return base64Regex.test(str);
  },

  // Function to check if a string is a valid UUID
  isValidUUID: (uuid: string): boolean => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  },
  // Function to check if a string is a valid date
  isValidDate: (date: string): boolean => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD format
    return dateRegex.test(date);
  },

  // Function to check if a string is a valid time
  isValidTime: (time: string): boolean => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM format
    return timeRegex.test(time);
  },

  // Function to check if a string is a valid date-time
  isValidDateTime: (dateTime: string): boolean => {
    const dateTimeRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/; // ISO 8601 format
    return dateTimeRegex.test(dateTime);
  },

  // Function to check if a string is a valid IP address
  isValidIP: (ip: string): boolean => {
    const ipRegex =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  },

  // Function to check if a string is a valid postal code
  isValidPostalCode: (postalCode: string): boolean => {
    const postalCodeRegex = /^\d{5}(-\d{4})?$/; // US ZIP code format
    return postalCodeRegex.test(postalCode);
  },

  // Function to check if a string is a valid credit card number
  isValidCreditCard: (cardNumber: string): boolean => {
    const cardNumberRegex =
      /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9]{2})[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|7[0-9]{15})$/;
    return cardNumberRegex.test(cardNumber);
  },

  // Function to check if a string is a valid hexadecimal color code
  isValidHexColor: (color: string): boolean => {
    const hexColorRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/;
    return hexColorRegex.test(color);
  },

  // Function to check if a string is a valid JSON string
  isValidJSON: (jsonString: string): boolean => {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  },

  // Function to check if a string is a valid XML string
  isValidXML: (xmlString: string): boolean => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
    return xmlDoc.getElementsByTagName('parsererror').length === 0;
  },

  // Function to check if a string is a valid CSV string
  isValidCSV: (csvString: string): boolean => {
    const csvRegex = /^(?:(?:"([^"]*)"|([^",]*))(?:,|$))/gm;
    return csvRegex.test(csvString);
  },

  // Function to check if a string is a valid Markdown string
  isValidMarkdown: (markdownString: string): boolean => {
    const markdownRegex =
      /^(#{1,6} .+|[-*] .+|\d+\. .+|> .+|`{3}.+|!\[.*\]\(.*\)|\[.*\]\(.*\))$/gm;
    return markdownRegex.test(markdownString);
  },

  // Function to check if a string is a valid HTML string
  isValidHTML: (htmlString: string): boolean => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');
    return doc.body.innerHTML !== '' && !doc.querySelector('parsererror');
  },

  //hash password
  hashPassword: (password: string): string => {
    const salt = bcrypt.genSaltSync(10);
    return bcrypt.hashSync(password, salt);
  },
  //compare password
  comparePassword: (password: string, hash: string): boolean => {
    return bcrypt.compareSync(password, hash);
  },

  extractToken(request: Request): string {
    // Check for token in Authorization header
    const authHeader = request.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.split(' ')[1];
    }

    // Check for token in cookies
    if (request.cookies && request.cookies['access-token']) {
      return request.cookies['access-token'];
    }

    return '';
  },

  checkPermissions(
    userPermissions: Permission[],
    requiredPermissions: {
      subject: SubjectType;
      action: ActionType | UserActionType;
      attributes?: string;
    }[],
    and?: boolean,
  ): boolean {
    const result: boolean[] = [];
    // Check if user has all required permissions
    for (const requiredPermission of requiredPermissions) {
      const hasPermission = userPermissions.some((userPermission) => {
        if (userPermission.action == '*' && userPermission.subject == '*')
          return true;
        if (!requiredPermission.attributes) {
          return (
            (userPermission.subject == '*' ||
              requiredPermission.subject == userPermission.subject) &&
            (userPermission.action == '*' ||
              requiredPermission.action == userPermission.action) &&
            !userPermission.attributes
          );
        } else {
          if (!userPermission.attributes) return false;
          const userAttributes = JSON.parse(userPermission.attributes);
          const requiredAttributes = JSON.parse(requiredPermission.attributes);
          return (
            Object.keys(requiredAttributes).every((key) => {
              return userAttributes[key] == requiredAttributes[key];
            }) &&
            (userPermission.subject == '*' ||
              requiredPermission.subject == userPermission.subject) &&
            (userPermission.action == '*' ||
              requiredPermission.action == userPermission.action)
          );
        }
      });
      result.push(hasPermission);
    }
    return !and ? result.some((r) => r) : result.every((r) => r);
  },
  getAllAppPermissions() {
    const permissions: PermissionDto[] = [];

    Object.values(UserActionType).forEach((value) => {
      permissions.push({
        subject: SubjectType.USER,
        action: value,
      });
    });
    Object.values(SubjectType).forEach((value) => {
      //skip user
      if (value == SubjectType.USER) return;
      Object.values(ActionType).forEach((action) => {
        permissions.push({
          subject: value,
          action: action,
        });
      });
    });
    return permissions;
  },

  isValidPermission(permissions: PermissionDto[]): {
    valid: boolean;
    message: { action: string; subject: string }[];
  } {
    const allPermissions = this.getAllAppPermissions();
    const invalidPermissions = permissions.filter((permission) => {
      return !allPermissions.some(
        (p) =>
          p.subject === permission.subject && p.action === permission.action,
      );
    });
    //return result & message if invalid permissions found
    return {
      valid: invalidPermissions.length == 0,
      message: invalidPermissions.map((p) => {
        return { action: p.action, subject: p.subject };
      }),
    };
  },
};
