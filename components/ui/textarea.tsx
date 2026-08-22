import { type TextareaHTMLAttributes, forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, helperText, errorText, id, disabled, rows = 3, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = id ?? generatedId;
    const hasError = Boolean(errorText);

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-foreground">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          disabled={disabled}
          aria-invalid={hasError || undefined}
          aria-describedby={errorText || helperText ? `${textareaId}-desc` : undefined}
          className={cn(
            "resize-y rounded-lg border bg-card px-3 py-2 text-base text-foreground placeholder:text-muted-foreground",
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
            id={`${textareaId}-desc`}
            className={cn("text-sm", hasError ? "text-error" : "text-muted-foreground")}
          >
            {errorText || helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
