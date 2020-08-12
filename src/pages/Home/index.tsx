import React, { FormEvent, useState, useEffect } from "react";

import "./styles.css";
import Input from "../../components/Input";
import Textarea from "../../components/Textarea";

function Home() {
  const [messageType, setMessageType] = useState("");
  const [messagePort, setMessagePort] = useState("");
  const [messageBinding, setMessageBinding] = useState("");
  const [messageOperation, setMessageOperation] = useState("");
  const [messageRequest, setMessageRequest] = useState("");
  const [messageResponse, setMessageResponse] = useState("");
  const [resultWSDL, setResultWSDL] = useState("");

  function decodeToXML(object: any, propName: string, isFirst: boolean) {
    var result = "";

    if (!propName) {
      propName = "root";
    }

    if (isFirst) {
      result += '<xsd:complexType name="' + propName + '"><xsd:sequence>';
    } else {
      result +=
        '<xsd:element name="' +
        propName +
        '" maxOccurs="unbounded" minOccurs="0"><xsd:complexType><xsd:sequence>';
    }

    if (Array.isArray(object)) {
      object = object[0];
    }

    for (var prop in object) {
      if (typeof object[prop] === "object") {
        if (Array.isArray(object[prop])) {
          result += decodeToXML(object[prop][0], prop, false);
        } else {
          result += decodeToXML(object[prop], prop, false);
        }
      } else {
        var sTypeDef;

        if (typeof object[prop] === "number") {
          sTypeDef = "integer";
        } else {
          sTypeDef = typeof object[prop];
        }

        result +=
          '<xsd:element type="xsd:' +
          sTypeDef +
          '" name="' +
          prop +
          '" minOccurs="0"/>';
      }
    }

    if (isFirst) {
      result += "</xsd:sequence></xsd:complexType>";
    } else {
      result += "</xsd:sequence></xsd:complexType></xsd:element>";
    }

    return result;
  }

  function generateWSDL() {
    let sWSDLTemplate =
      '<?xml version="1.0" encoding="utf-8"?> <wsdl:definitions targetNamespace="urn:sap-com:document:sap:rfc:functions" xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:wsoap12="http://schemas.xmlsoap.org/wsdl/soap12/" xmlns:http="http://schemas.xmlsoap.org/wsdl/http/" xmlns:mime="http://schemas.xmlsoap.org/wsdl/mime/" xmlns:tns="urn:sap-com:document:sap:rfc:functions">   <wsdl:documentation>    <sidl:sidl xmlns:sidl="http://www.sap.com/2007/03/sidl"/>   </wsdl:documentation>   <wsdl:types>    <xsd:schema attributeFormDefault="qualified" targetNamespace="urn:sap-com:document:sap:rfc:functions">            &&XSD_INPUT&&           &&XSD_OUTPUT&&      <xsd:element name="MT_&&MESSAGE_TYPE&&">        <xsd:complexType>           <xsd:sequence>            <xsd:element name="&&MESSAGE_TYPE&&" type="tns:&&MESSAGE_TYPE&&" minOccurs="0" maxOccurs="&&MESSAGE_TYPE_REQ_MAXOCCURS&&"/>           </xsd:sequence>         </xsd:complexType>      </xsd:element>      <xsd:element name="MT_&&MESSAGE_TYPE&&Response">        <xsd:complexType>           <xsd:sequence>            <xsd:element name="&&MESSAGE_TYPE&&Response" type="tns:&&MESSAGE_TYPE&&Response" minOccurs="0" maxOccurs="&&MESSAGE_TYPE_RESP_MAXOCCURS&&"/>          </xsd:sequence>         </xsd:complexType>      </xsd:element>    </xsd:schema>   </wsdl:types>   <wsdl:message name="MT_&&MESSAGE_TYPE&&">     <wsdl:part name="parameters" element="tns:MT_&&MESSAGE_TYPE&&"/>  </wsdl:message>   <wsdl:message name="MT_&&MESSAGE_TYPE&&Response">     <wsdl:part name="parameter" element="tns:MT_&&MESSAGE_TYPE&&Response"/>   </wsdl:message>   <wsdl:portType name="&&MESSAGE_PORT&&">     <wsdl:operation name="&&MESSAGE_OPERATION&&">       <wsdl:input message="tns:MT_&&MESSAGE_TYPE&&"/>       <wsdl:output message="tns:MT_&&MESSAGE_TYPE&&Response"/>    </wsdl:operation>   </wsdl:portType>  <wsdl:binding name="&&MESSAGE_BINDING&&" type="tns:&&MESSAGE_PORT&&">     <soap:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>     <wsdl:operation name="&&MESSAGE_OPERATION&&">       <soap:operation soapAction="urn:sap-com:document:sap:rfc:functions:&&MESSAGE_PORT&&:&&MESSAGE_OPERATION&&Request" style="document"/>      <wsdl:input>        <soap:body use="literal"/>      </wsdl:input>       <wsdl:output>         <soap:body use="literal"/>      </wsdl:output>    </wsdl:operation>   </wsdl:binding>   <wsdl:binding name="&&MESSAGE_BINDING&&_soap12" type="tns:&&MESSAGE_PORT&&">    <wsoap12:binding transport="http://schemas.xmlsoap.org/soap/http" style="document"/>    <wsdl:operation name="&&MESSAGE_OPERATION&&">       <wsoap12:operation soapAction="urn:sap-com:document:sap:rfc:functions:&&MESSAGE_PORT&&:&&MESSAGE_OPERATION&&Request" style="document"/>       <wsdl:input>        <wsoap12:body use="literal"/>       </wsdl:input>       <wsdl:output>         <wsoap12:body use="literal"/>       </wsdl:output>    </wsdl:operation>   </wsdl:binding>   <wsdl:service name="&&MESSAGE_BINDING&&">     <wsdl:port name="&&MESSAGE_BINDING&&" binding="tns:&&MESSAGE_BINDING&&">      <soap:address location="http://dummy.com:80/dummy"/>    </wsdl:port>    <wsdl:port name="&&MESSAGE_BINDING&&_soap12" binding="tns:&&MESSAGE_BINDING&&_soap12">      <wsoap12:address location="http://dummy.com:80/dummy"/>     </wsdl:port>  </wsdl:service> </wsdl:definitions>';

    const sMessageType = messageType; //&&MESSAGE_REQ&&
    const sMessagePort = messagePort; //&&MESSAGE_PORT&&
    const sMessageOperation = messageOperation; //&&MESSAGE_OPERATION&&
    const sMessageBinding = messageBinding; //&&MESSAGE_BINDING&&
    const sRequestMessage = messageRequest;
    const sResponseMessage = messageResponse;

    //Tratar exceções
    const oJsonRequest = JSON.parse(sRequestMessage);
    const oJsonResponse = JSON.parse(sResponseMessage);

    const sXSDInput = decodeToXML(oJsonRequest, sMessageType, true); //&&XSD_INPUT&&

    const sXSDOutput = decodeToXML(
      oJsonResponse,
      sMessageType + "Response",
      true
    ); //&&XSD_OUTPUT&&

    sWSDLTemplate = sWSDLTemplate.replace("&&XSD_INPUT&&", sXSDInput);
    sWSDLTemplate = sWSDLTemplate.replace("&&XSD_OUTPUT&&", sXSDOutput);

    if (Array.isArray(oJsonRequest)) {
      sWSDLTemplate = sWSDLTemplate.replace(
        "&&MESSAGE_TYPE_REQ_MAXOCCURS&&",
        "unbounded"
      );
    } else {
      sWSDLTemplate = sWSDLTemplate.replace(
        "&&MESSAGE_TYPE_REQ_MAXOCCURS&&",
        "1"
      );
    }

    if (Array.isArray(oJsonResponse)) {
      sWSDLTemplate = sWSDLTemplate.replace(
        "&&MESSAGE_TYPE_RESP_MAXOCCURS&&",
        "unbounded"
      );
    } else {
      sWSDLTemplate = sWSDLTemplate.replace(
        "&&MESSAGE_TYPE_RESP_MAXOCCURS&&",
        "1"
      );
    }

    sWSDLTemplate = sWSDLTemplate.replace(/&&MESSAGE_TYPE&&/g, sMessageType);
    sWSDLTemplate = sWSDLTemplate.replace(/&&MESSAGE_PORT&&/g, sMessagePort);
    sWSDLTemplate = sWSDLTemplate.replace(
      /&&MESSAGE_OPERATION&&/g,
      sMessageOperation
    );
    sWSDLTemplate = sWSDLTemplate.replace(
      /&&MESSAGE_BINDING&&/g,
      sMessageBinding
    );

    setResultWSDL(prettyXML(sWSDLTemplate));
  }

  function prettyXML(sourceXml: string) {
    const xmlDoc = new DOMParser().parseFromString(sourceXml, "application/xml");
    const xsltDoc = new DOMParser().parseFromString(
      [
        '<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform">',
        '  <xsl:strip-space elements="*"/>',
        '  <xsl:template match="para[content-style][not(text())]">',
        '    <xsl:value-of select="normalize-space(.)"/>',
        "  </xsl:template>",
        '  <xsl:template match="node()|@*">',
        '    <xsl:copy><xsl:apply-templates select="node()|@*"/></xsl:copy>',
        "  </xsl:template>",
        '  <xsl:output indent="yes"/>',
        "</xsl:stylesheet>",
      ].join("\n"),
      "application/xml"
    );

    const xsltProcessor = new XSLTProcessor();
    xsltProcessor.importStylesheet(xsltDoc);
    const resultDoc = xsltProcessor.transformToDocument(xmlDoc);
    const resultXml = new XMLSerializer().serializeToString(resultDoc);
    return resultXml;
  }

  function handleGenerateWSDL(e: FormEvent) {
    e.preventDefault();

    generateWSDL();

    const buttonDowload = document.getElementById(
      "downloadWSDLButton"
    ) as HTMLButtonElement;

    buttonDowload.disabled = false;
  }

  function handleDownloadWSDL(e: FormEvent) {
    e.preventDefault();

    const element = document.createElement('a') as HTMLAnchorElement;
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(resultWSDL));
    element.setAttribute('download', "generated_wsdl_from_json.wsdl");

    element.style.display = 'none';

    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
  }

  function initForm() {
    setMessageType("SampleMessage");
    setMessagePort("WSPort");
    setMessageOperation("Query");
    setMessageBinding("SampleBinding");
    setMessageRequest('{ "document": "123" }');
    setMessageResponse(
      '{ "returnMessage" : "Success!", "returnCode" : "200" }'
    );
  }

  useEffect(() => {
    initForm();
  }, []);

  return (
    <div id="page-home">
      <div id="page-form">
        <main>
          <form onSubmit={handleGenerateWSDL}>
            <fieldset>
              <legend>Webservice Parameters</legend>

              <Input
                name="messageType"
                label="Message Type"
                value={messageType}
                onChange={(e) => {
                  setMessageType(e.target.value);
                }}
              />

              <Input
                name="messagePort"
                label="Message Port"
                value={messagePort}
                onChange={(e) => {
                  setMessagePort(e.target.value);
                }}
              />
              <Input
                name="messageOperation"
                label="Message Operation"
                value={messageOperation}
                onChange={(e) => {
                  setMessageOperation(e.target.value);
                }}
              />
              <Input
                name="messageBinding"
                label="Message Binding"
                value={messageBinding}
                onChange={(e) => {
                  setMessageBinding(e.target.value);
                }}
              /> 
              <Textarea
                name="request"
                label="Request JSON"
                value={messageRequest}
                onChange={(e) => {
                  setMessageRequest(e.target.value);
                }}
              />
              <Textarea
                name="response"
                label="Response JSON"
                value={messageResponse}
                onChange={(e) => {
                  setMessageResponse(e.target.value);
                }}
              />

              <br />
              <footer>
                <button type="submit">Generate WSDL</button>
              </footer>
            </fieldset>
          </form>
        </main>
      </div>
      <div id="page-result">
        <Textarea
          name="result"
          label=""
          value={resultWSDL}
          onChange={(e) => {
            setResultWSDL(e.target.value);
          }}
          id="fulltextarea"
          disabled
        />
        <br />
        <form onSubmit={handleDownloadWSDL}>
          <button id="downloadWSDLButton" type="submit" disabled>
            Download WSDL
          </button>
        </form>
      </div>
      <div id="footer">
        Created by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/ggalvesdev"
        >
          Gabriel Gonçalves Alves
        </a> 
      </div>
    </div>
  );
}

export default Home;
