const fs = require('fs');
const path = require('path');

// Create a simple HTML that we can convert to PNG
const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      padding: 0;
      width: 256px;
      height: 256px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #ECE1E9;
      border-radius: 48px;
    }
    .emoji {
      font-size: 160px;
      font-family: system-ui, -apple-system, "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji";
      line-height: 1;
    }
  </style>
</head>
<body>
  <div class="emoji">🌱</div>
</body>
</html>
`;

const outputPath = path.join(__dirname, '../public/icon-preview.html');
fs.writeFileSync(outputPath, html);
console.log('Icon preview HTML created at:', outputPath);
console.log('Open this file in a browser and take a screenshot for the icon.');
