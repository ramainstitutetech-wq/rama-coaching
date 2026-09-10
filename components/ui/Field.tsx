import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

export function Field({
  label,
  error,
  required,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      {children}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}

const baseInput =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-navy focus:ring-2 focus:ring-navy/20";

export function TextInput({
  error,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <input
      className={`${baseInput} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
      {...rest}
    />
  );
}

export function TextArea({
  error,
  className = "",
  ...rest
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: string }) {
  return (
    <textarea
      className={`${baseInput} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
      {...rest}
    />
  );
}

export function SelectField({
  error,
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { error?: string }) {
  return (
    <select
      className={`${baseInput} ${error ? "border-red-400 focus:border-red-500 focus:ring-red-500/20" : ""} ${className}`}
      {...rest}
    >
      {children}
    </select>
  );
}
