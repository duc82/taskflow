import {
  ChangeEvent,
  DetailedHTMLProps,
  ForwardedRef,
  forwardRef,
  TextareaHTMLAttributes,
} from "react";

export default forwardRef(function TextArea(
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >,
  ref: ForwardedRef<HTMLTextAreaElement>
) {
  const resizeTextarea = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;

    if (textarea) {
      textarea.style.height = (props.style?.minHeight as string) || "auto"; // reset to shrink if needed
      textarea.style.height = `${textarea.scrollHeight}px`; // set to scrollHeight
    }
  };

  return (
    <textarea
      ref={ref}
      {...props}
      onChange={(e) => {
        resizeTextarea(e);
        props.onChange?.(e); // call parent onChange
      }}
    ></textarea>
  );
});
