import { FormGroup, ValidatorFn } from "@angular/forms";

export function atLeastOneCheckboxCheckedValidator(
  minRequired, isOptional
): ValidatorFn {
  return function validate(formGroup: FormGroup) {
    let checked = 0;
    const seenPriorities = new Set<number>();
    let hasDuplicatePriority = false;
    let hasMissingPriority = false;

    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.controls[key];
      const { value, priority } = control.value ?? {};

      if (value === true) {
        checked++;

        if (!priority) {
          hasMissingPriority = true;
          return;
        }

        if (seenPriorities.has(priority)) {
          hasDuplicatePriority = true;
        }
        seenPriorities.add(priority);
      }
    });

    if (!isOptional && checked < minRequired) {
      return {
        requireCheckboxToBeChecked: true,
      };
    }

    if (hasMissingPriority) {
      return {
        missingPriority: true,
      };
    }

    if (hasDuplicatePriority) {
      return {
        duplicatePriority: true,
      };
    }

    return null;
  };
}
