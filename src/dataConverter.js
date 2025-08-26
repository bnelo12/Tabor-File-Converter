const converters = [
    {
        name: "Tektronix (.txt)",
        convert: convertTektronix
    },
    {
        name: "Lecroy (.csv)",
        convert: convertLecroy
    },
];

function convertLecroy(file, scalingFactor) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const data = text
        .split(/\r?\n/)
        .slice(3)
        .map(line => line.trim())
        .filter(line => line !== "")
        .map((value) => Number(value));

      const min = Math.min(...data);
      const max = Math.max(...data) - min;

      const normalised_data = data.map(value => Math.floor(scalingFactor*(value-min)/max*(Math.pow(2, 16)-1)));    
    
      resolve(normalised_data);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

function convertTektronix(file, scalingFactor) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const data = text
        .split(/\r?\n/)
        .map(line => line.trim())
        .filter(line => line !== "")
        .map((line) => {
          const splitLine = line.split(",");
          return Number(splitLine[0]);
        });

      const min = Math.min(...data);
      const max = Math.max(...data) - min;

      const normalised_data = data.map(value => Math.floor(scalingFactor*(value-min)/max*(Math.pow(2, 16)-1)));    
        
      resolve(normalised_data);
    };

    reader.onerror = (error) => reject(error);
    reader.readAsText(file);
  });
}

export function linearInterpolate(data, factor) {

  const result = [];

  for (let i = 0; i < data.length - 1; i++) {
    const start = data[i];
    const end = data[i + 1];
    result.push(start);

    for (let j = 1; j < factor; j++) {
      const t = j / factor;
      result.push(start + t * (end - start));
    }
  }

  result.push(data[data.length - 1]);

  return result;
}


export default converters;