import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { validate as isUuid } from 'uuid';

export function IsUuidOrString(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            name: 'isUuidOrString',
            target: object.constructor,
            propertyName: propertyName,
            options: { ...validationOptions, each: false },
            validator: {
                validate(value: any, args: ValidationArguments): boolean {     
                    return typeof value === 'string' && (isUuid(value) || value.trim().length > 0);
                },
                defaultMessage(args: ValidationArguments) {
                    return `${args.property} must be a valid UUID or a non-empty string`;
                },
            },
        });
    };
}