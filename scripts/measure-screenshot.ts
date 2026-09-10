import fs from 'fs';

// PNG chunk parser
const buf = fs.readFileSync('C:/Users/kotas/.gemini/antigravity-ide/brain/be451248-bece-44bd-95ca-119f5c326a72/robot_full_body_1789066894065.png');
const width = buf.readUInt32BE(16);
const height = buf.readUInt32BE(20);

console.log(`Screenshot Dimensions: ${width} x ${height}`);
