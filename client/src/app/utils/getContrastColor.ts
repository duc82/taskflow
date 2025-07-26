const contrasts = {
  dark: {
    background: "#ffffff3d",
    color: "#101828",
  },
  light: {
    background: "#0000003d",
    color: "white",
  },
};

function getContrastColorFromRGB(rgbStr: string): "light" | "dark" {
  const match = rgbStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!match) {
    throw new Error("Invalid RGB(A) format");
  }

  const r = parseInt(match[1], 10);
  const g = parseInt(match[2], 10);
  const b = parseInt(match[3], 10);

  // Calculate brightness using standard formula
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 128 ? "dark" : "light";
}

function getContrastColorFromImage(url: string): Promise<"light" | "dark"> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const image = new Image();
    image.crossOrigin = "Anonymous"; // Handle CORS for external images
    image.src = url;

    image.onload = () => {
      canvas.width = image.width;
      canvas.height = image.height;
      if (ctx) {
        ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;

        // Sample every 10th pixel for performance
        for (let i = 0; i < data.length; i += 40) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }

        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);

        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        resolve(brightness > 128 ? "dark" : "light");
      } else {
        resolve("dark"); // Fallback
      }
    };
  });
}

export { getContrastColorFromRGB, getContrastColorFromImage, contrasts };
