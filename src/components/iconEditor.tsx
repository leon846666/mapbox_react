import React, { useState, useRef } from 'react';
import { SketchPicker, ColorResult } from 'react-color';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import IconComponentCow from './IconComponentCow';
import IconComponentSheep from './IconComponentSheep'; 
import { Canvg } from 'canvg';
import axios from 'axios';


interface IconEditorProps {
  close: () => void;
}

const IconEditor: React.FC<IconEditorProps> = ({ close }) => {

  const [color, setColor] = useState<string>("#000000");
  const [SelectedIconType, setSelectedIconType] = useState<string | null>(null);

  const cowIconComponentRef = useRef<IconComponentCow>(null);
  const sheepIconComponentRef = useRef<IconComponentSheep>(null);

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex);
  };

  const renderSelectedIcon = () => {
    switch (SelectedIconType) {
      case "Cow":
        return <IconComponentCow style={{ color }} color={color} size={60} />;
      case "Sheep":
        return <IconComponentSheep style={{ color }} color={color} size={60} />;
      default:
        return null;
    }
  };

  const svgToPngDataUrl = async (svgData: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const canvgInstance = Canvg.fromString(ctx!, svgData);
      canvgInstance.render().then(() => {
        const dataUrl = canvas.toDataURL("image/png");
        resolve(dataUrl);
      }).catch(reject);
    });
  };




  const uploadImageToServer = async (fileName:string,imgData: string) => {
    try {
      const file = new FormData();
    
      const base64Data = imgData.replace(/^data:image\/png;base64,/, "");

      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);

      const blob = new Blob([byteArray], { type: "image/png" })

      file.append('file', blob, fileName);
      // need a back-end api to upload my icon.
      const response = await axios.post('https://localhost:7143/api/uploader/upload-icon/', file);

      if (response.status === 200) {
        console.log("Image uploaded successfully!");
      } else {
        console.error("Error uploading the image.");
      }
    } catch (error) {
      console.error("Error uploading the image:", error);

    }
  }



  return (
    <div>
      <div>
        <label htmlFor="iconPicker">Select an icon:</label>
        <div id="iconPicker">
          <IconComponentCow ref={cowIconComponentRef} onClick={() => setSelectedIconType("Cow")} size={52} style={{ color }} />
          <IconComponentSheep ref={sheepIconComponentRef} onClick={() => setSelectedIconType("Sheep")} size={52} style={{ color }} />
        </div>
      </div>
      <div>
        <label htmlFor="colorPicker">Color:</label>
        <SketchPicker color={color} onChange={handleColorChange} />
      </div>
      <div>
        <label>Selected icon:</label>
        <div>{renderSelectedIcon()}</div>
      </div>
      <Button onClick={async () => {
        let svgData = null;

        if (SelectedIconType === "Cow" && cowIconComponentRef.current) {
          svgData = cowIconComponentRef.current.getSVGData();
        }else if (SelectedIconType === "Sheep" && sheepIconComponentRef.current) {
          svgData = sheepIconComponentRef.current.getSVGData();
        }
        debugger
        if (svgData) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(svgData, "image/svg+xml");
          const path = doc.querySelector("path"); // 假设需要更新的元素是 path
        
          if (path) {
            path.setAttribute("fill", color); // 更新颜色属性
          }
          debugger
          const modifiedSvgData = new XMLSerializer().serializeToString(doc);
          const pngDataUrl = await svgToPngDataUrl(modifiedSvgData);
          let fileName:string = SelectedIconType?.toLocaleLowerCase()!+"_"+color+".png";

          uploadImageToServer(fileName,pngDataUrl);
        

        }
      }}>
        Save
      </Button>
      <Button onClick={close}>Close</Button>
    </div>
  );
};

export default IconEditor;
