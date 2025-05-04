import { ChangeEvent, DetailedHTMLProps, TextareaHTMLAttributes } from "react";

export default function TextArea(
  props: DetailedHTMLProps<
    TextareaHTMLAttributes<HTMLTextAreaElement>,
    HTMLTextAreaElement
  >
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
      {...props}
      onChange={(e) => {
        resizeTextarea(e);
        props.onChange?.(e); // call parent onChange
      }}
    ></textarea>
  );
}
