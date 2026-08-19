import { type InputHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, helperText, errorText, id, disabled, ...props }, ref) => {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={errorText || helperText ? `${inputId}-desc` : undefined}
          className={cn(
            "h-10 rounded-lg border bg-card px-3 text-base text-foreground placeholder:text-muted-foreground",
            "transition-colors duration-(--duration-micro)",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
            hasError ? "border-error" : "border-border",
            className
          )}
          {...props}
        />
        {(errorText || helperText) && (
          <p
            id={`${inputId}-desc`}
            className={cn("text-sm", hasError ? "text-error" : "text-muted-foreground")}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
