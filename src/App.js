import { useState, useEffect } from "react";
import { FileUploader } from "react-drag-drop-files";
import Button from '@mui/material/Button';
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { amber } from "@mui/material/colors";
import Paper from '@mui/material/Paper';
import logo from './logo.png';
import Typography from "@mui/material/Typography";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import dataConverters, {linearInterpolate} from "./dataConverter.js";
import Slider from '@mui/material/Slider';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1472a4',
    },
    secondary: amber,
  },
});


const fileTypes = ["CSV", "TXT"];

function createDownloadLink(data, filename = "processed_data.txt") {
  const content = data.join("\n");
  const blob = new Blob([content], { type: "text/csv" });
  return URL.createObjectURL(blob);
}

export default function App() {
  
  const [file, setFile] = useState(null);
  const [downloadLink, setDownloadlLink] = useState(null);
  const [outputFileName, setOutputFileName] = useState("output");
  const [selectedConverter, setSelectedConverter] = useState(dataConverters[0]);
  const [scalingFactor, setScalingFactor] = useState(100);
  const [shouldInterpolateData, setShouldInterpolateData] = useState(false);

  useEffect(() => {

    if (file == null) {
      return;
    }

    console.log("Running");

    selectedConverter.convert(file, scalingFactor/100).then(result => {
      if (shouldInterpolateData) {
        result = linearInterpolate(result, 2);
      }
      setDownloadlLink(createDownloadLink(result));
    });
  }, [file, shouldInterpolateData, selectedConverter, scalingFactor])

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar
          position="static"
          color="primary"
          sx={{
            backgroundColor: "#ffffff",
            color: "#000000", // makes the text/icons visible
          }}>
          <Toolbar>
            <a href="https://www.taborelec.com/"  style={{ display: "inline-flex" }}>
              <Box
                component="img"
                alt="Logo"
                src={logo}
                sx={{
                  height: 50,
                  mr: 2,
                }}
              >
              </Box>
            </a>
          </Toolbar>
        </AppBar>
    
        <Box sx={{
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "#043a57"
        }}>
          <Paper
          sx={{
            marginTop: 5,
            paddingTop: 2,
            paddingLeft: 10,
            paddingRight: 10,
            paddingBottom: 5,
            maxWidth: 500,
          }}>
            <div className="App">
              <Typography variant="h4">
                Signal Trace Converter
              </Typography>
              <Typography variant="p">
                Convert waveform trace data for playback on Tabor Proteus signal generator. 
              </Typography>
              <Box sx={{
                marginTop: 3,
              }}>
                <FileUploader
                  multiple={false}
                  handleChange={setFile}
                  name="file"
                  types={fileTypes}
                />
              </Box>
              <p>{file ? `File name: ${file.name}` : "no files uploaded yet"}</p>
              <FormControl fullWidth>
                <InputLabel>Device Trace Data Type</InputLabel>
                <Select
                  value={selectedConverter.name}
                  label="Device Trace Data Type"
                  onChange={(event) => {
                    const newConverter = dataConverters.find(
                      converter => converter.name === event.target.value);
                    setSelectedConverter(newConverter);
                  }}
                >
                  {dataConverters.map((converter) => {
                    return <MenuItem value={converter.name}>{converter.name}</MenuItem>;
                  })}
                </Select>
              </FormControl>
              <FormControl fullWidth sx={{
                marginTop: 3
              }}>
              <TextField
                label="Output File Name"
                variant="outlined"
                defaultValue={outputFileName}
                onChange={(event) => setOutputFileName(event.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment position="end">.csv</InputAdornment>,
                }}
              />
              </FormControl>
              <FormControl fullWidth sx={{
                marginTop: 3
              }}>
              <Typography gutterBottom>Scaling Factor (%)</Typography>
                <Slider
                  aria-label="Amplitude Scaling Factor"
                  defaultValue={100}
                  valueLabelDisplay="auto"
                  shiftStep={30}
                  step={1}
                  min={0}
                  max={100}
                  onChange={(event) => setScalingFactor(event.target.value)}
                />
              </FormControl>
              <FormControlLabel control={
                <Checkbox onChange={(event) => {setShouldInterpolateData(event.target.checked); console.log(event.target.checked)}} />
              } label="Interpolate Data" />
              <FormControl fullWidth sx={{
                marginTop: 3
              }}>
                {downloadLink != null ? 
                  <Button variant="contained" onClick={(event) => {
                    const link = document.createElement("a");
                    link.href = downloadLink;
                    link.download = outputFileName + ".csv";
                    link.click()
                  }}>Download</Button> : null
                }
              </FormControl>
            </div>
          </Paper>
        </Box>
      </Box>
    </ThemeProvider>
  );
}