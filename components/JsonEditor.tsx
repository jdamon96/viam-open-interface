import React, { FC } from "react";
import ReactSimpleCodeEditor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-json";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism.css"; //Example style, you can use another

interface JsonCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  style?: React.CSSProperties;
}

const JsonCodeEditor: FC<JsonCodeEditorProps> = ({
  value,
  onChange,
  placeholder = "Paste your JSON configuration here",
  className = "",
  style = {},
}) => {
  return (
    <div className="block w-full max-w-xl mx-auto max-h-[512px] overflow-auto">
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
      />
    </div>
  );
};

export default JsonCodeEditor;
