import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';

export function IsJigMetadataValue(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsJigMetadataValue',
      target: object.constructor,
      propertyName: propertyName,
      options: { ...validationOptions, each: false },
      validator: {
        validate(values: string | string[], args: ValidationArguments): boolean {
          
          if (typeof values === 'string') {
            values = [values];
          }
          var results: boolean[] = [];
          try {            
            values.forEach((value) => {
              const json = JSON.parse(value);
              const keys = Object.keys(json);
              results.push(
                keys.includes('name') &&
                  keys.includes('slug') &&
                  keys.includes('value'),
              );
            });
           
          } catch {
            results.push(false);
          }
          return results.every((result) => result === true);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid Jig Metadata Value or a non-empty string`;
        },
      },
    });
  };
}
