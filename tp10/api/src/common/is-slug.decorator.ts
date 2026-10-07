import { registerDecorator, type ValidationOptions } from 'class-validator';

const SLUG = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** `@IsSlug()` on a DTO property: lowercase letters, digits and single dashes. */
export function IsSlug(options?: ValidationOptions) {
  return (object: object, propertyName: string): void => {
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && SLUG.test(value),
        defaultMessage: () => `${propertyName} must be a lowercase slug`,
      },
    });
  };
}
