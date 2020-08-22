import React, { TextareaHTMLAttributes } from "react";

import XMLViewer from "react-xml-viewer";

import "./styles.css";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  name: string;
  label: string;
  isXML?: boolean;
}

const Textarea: React.FC<TextareaProps> = ({ label, name, isXML, ...rest }) => {
  return (
    <div className="textarea-block">
      <label htmlFor={name}>{label}</label>
      <textarea id={name} {...rest} />
    </div>
  );
  //   return isXML && rest.value !== "" ? (
  //     <div className="textarea-block" id="xmlviewer">
  //       <XMLViewer xml={rest.value} theme={
  //           {
  //               "overflowBreak": true
  //           }
  //       } />
  //     </div>
  //   ) : (
  //     <div className="textarea-block">
  //       <label htmlFor={name}>{label}</label>
  //       <textarea id={name} {...rest} />
  //     </div>
  //   );
};

export default Textarea;
