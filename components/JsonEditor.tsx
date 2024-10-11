import React, { FC } from "react";
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css";

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
  readOnly?: boolean;
  maxHeight?: string; // Add maxHeight prop
  minHeight?: string; // Add minHeight prop
}

const JsonCodeEditor: FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  placeholder = "Paste your JSON configuration here",
  className = "",
  style = {},
  readOnly = false,
  maxHeight = "max-h-[512px]", // Default value for maxHeight
  minHeight = "min-h-[256px]", // Default value for minHeight
}) => {
  return (
    <div
      className={`block w-full mx-auto overflow-auto ${maxHeight} ${minHeight}`}
    >
      <ReactSimpleCodeEditor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, languages.json, "json")}
        textareaClassName="code-editor"
        padding={15}
        placeholder={placeholder}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          overflowX: "auto",
          ...style,
        }}
        className={`bg-gray-100 w-full ${minHeight} rounded-sm whitespace-pre-wrap ${className} no-focus-outline`}
        readOnly={readOnly}
      />
    </div>
  );
};

export default JsonCodeEditor;
