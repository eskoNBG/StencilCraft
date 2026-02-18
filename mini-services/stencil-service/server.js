const express = require("express");
const { validateRequest, decodeBase64Image } = require("./lib/utils");
const { preprocess } = require("./lib/preprocess");
const { generateStyle } = require("./lib/styles");
const { postprocess } = require("./lib/postprocess");

const app = express();
const PORT = process.env.PORT || 3005;

// Parse JSON bodies up to 20MB (base64 images are large)
app.use(express.json({ limit: "20mb" }));

// CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "stencil-service",
    version: "1.0.0",
    styles: ["outline", "simple", "detailed", "hatching", "solid"],
  });
});

// Generate stencil
app.post("/generate", async (req, res) => {
  const start = Date.now();

  try {
    // Validate input
    const params = validateRequest(req.body);
    const { style, lineThickness, contrast, inverted, lineColor, transparentBg } = params;

    console.log(`[Generate] Style: ${style}, thickness: ${lineThickness}, contrast: ${contrast}`);

    // Decode base64 image to buffer
    const imageBuffer = decodeBase64Image(params.image);

    // Preprocess: grayscale, denoise, contrast
    const { data: grayBuf, width, height } = await preprocess(imageBuffer, contrast);
    console.log(`[Generate] Preprocessed: ${width}x${height}`);

    // Run style-specific edge detection pipeline
    const edgeBuf = await generateStyle(style, grayBuf, width, height, lineThickness, contrast);

    // Post-process: colorize, invert, transparency, encode PNG
    const stencilImage = await postprocess(edgeBuf, width, height, {
      inverted,
      lineColor,
      transparentBg,
    });

    const elapsed = Date.now() - start;
    console.log(`[Generate] Done in ${elapsed}ms`);

    res.json({ success: true, stencilImage });
  } catch (error) {
    const elapsed = Date.now() - start;
    console.error(`[Generate] Error after ${elapsed}ms:`, error.message);
    res.json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Stencil service running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});
