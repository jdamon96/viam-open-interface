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
}

const JsonCodeEditor: FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  placeholder = "Paste your JSON configuration here",
  className = "",
  style = {},
  readOnly = false,
  maxHeight = "max-h-[512px]", // Default value for maxHeight
}) => {
  return (
    <div className={`block w-full max-w-xl mx-auto overflow-auto ${maxHeight}`}>
      <ReactSimpleCodeEditor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlight(code, languages.json, "json")}
        padding={15}
        placeholder={placeholder}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          overflowX: "auto",
          ...style,
        }}
        className={`bg-gray-50 w-full rounded-sm whitespace-pre-wrap ${className}`}
        readOnly={readOnly}
      />
    </div>
  );
};

export default JsonCodeEditor;
