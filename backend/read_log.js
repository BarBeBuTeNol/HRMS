const fs = require('fs');
try {
    const content = fs.readFileSync('schema_log.txt', 'utf16le');
    console.log(content);
} catch (err) {
    console.error(err);
}
