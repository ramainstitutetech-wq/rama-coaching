import { type InputHTMLAttributes, forwardRef } from "react";

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  required?: boolean;
  full?: boolean;
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField({ label, error, required, full, id, className, ...rest }, ref) {
    const fieldId = id ?? rest.name;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
      <div className={`field${full ? " field-full" : ""}`}>
        <label htmlFor={fieldId} className="field-label">
          {label}
          {required ? <span className="field-required" aria-hidden="true"> *</span> : null}
        </label>
        <input
          ref={ref}
          id={fieldId}
          name={rest.name}
          className={`field-input${error ? " field-input-error" : ""}`}
          aria-invalid={error ? true : undefined}
          aria-describedby={errorId}
          {...rest}
        />
        {error ? (
          <p className="field-error" id={errorId} role="alert">
            {error}
          </p>
        ) : null}
      </div>
    );
  }
);
