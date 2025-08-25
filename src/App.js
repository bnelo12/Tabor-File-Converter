import { useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import Button from '@mui/material/Button';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';


const fileTypes = ["CSV"];

function createDownloadLink(data, filename = "processed_data.txt") {
  const content = data.join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  return URL.createObjectURL(blob);
}

function readFileDataAndNormalise(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      console.log("Reading file!");
      // Convert file contents to string
      const text = event.target.result;

      // Split into lines
      const data = text
        .split(/\r?\n/)
        .slice(3)
        .map(line => line.trim())
        .filter(line => line !== "")
        .map(Number);

      const min = Math.min(...data);
      const max = Math.max(...data) - min;

      const normalised_data = data.map(value => Math.floor((value-min)/max*(Math.pow(2, 16)-1)));
      const nearest_multiple = Math.floor(normalised_data.length / 64) * 64;
      const clipped_data = normalised_data
        .slice(0, nearest_multiple);      
    
      resolve(clipped_data);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export default function App() {
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadlLink] = useState(null);
  const handleChange = (file) => {
    setFile(file);
    readFileDataAndNormalise(file).then(result => {
      setDownloadlLink(createDownloadLink(result));
      console.log("File read and processed!");
    });
  };
  return (
    <div className="App">
      <h1>File Convert</h1>
      <FileUploader
        multiple={false}
        handleChange={handleChange}
        name="file"
        types={fileTypes}
      />
      <p>{file ? `File name: ${file.name}` : "no files uploaded yet"}</p>
      {downloadLink != null ? 
        <Button variant="contained" onClick={(event) => {
          const link = document.createElement("a");
          link.href = downloadLink;
          link.download = "processed_data.csv";
          link.click()
        }}>Download</Button> : null
      }
    </div>
  );
}