import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { validate as isUuid } from 'uuid';

@ValidatorConstraint({ async: false })
class IsUuidV4Constraint implements ValidatorConstraintInterface {
    validate(value: string): boolean {
        return typeof value === 'string' && isUuid(value) && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
    }

    defaultMessage(): string {
        return 'Value must be a valid UUID v4 string';
    }
}

/**
 * Custom decorator to validate if a value is a valid UUID v4 string.
 * @param validationOptions - Optional validation options.
 */
export function IsUuidV4(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsUuidV4Constraint,
        });
    };
}