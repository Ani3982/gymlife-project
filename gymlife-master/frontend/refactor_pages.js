import fs from 'fs';
import path from 'path';

const pagesDir = path.join(process.cwd(), 'src', 'pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

for (const file of files) {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Remove everything from {/*  Page Preloder  */} to {/*  Header End  */}
  const startPreloaderRegex = /\{\/\*  Page Preloder  \*\/\}/g;
  const endHeaderRegex = /\{\/\*  Header End  \*\/\}/g;
  
  const startPreloaderMatch = startPreloaderRegex.exec(content);
  const endHeaderMatch = endHeaderRegex.exec(content);

  if (startPreloaderMatch && endHeaderMatch) {
    const beforePreloader = content.substring(0, startPreloaderMatch.index);
    const afterHeader = content.substring(endHeaderMatch.index + '{/*  Header End  */}'.length);
    content = beforePreloader + afterHeader;
  }

  // Reset indices for next regex searches since content length might have changed!
  // Wait, the indices for the second match are based on the NEW content string.
  
  // Remove everything from {/*  Get In Touch Section Begin  */} to the scripts before `</>`
  const startGetInTouchRegex = /\{\/\*  Get In Touch Section Begin  \*\/\}/g;
  const startFooterRegex = /\{\/\*  Footer Section Begin  \*\/\}/g;
  
  let endSectionStartMatch = startGetInTouchRegex.exec(content);
  if (!endSectionStartMatch) {
    // try to fallback to Footer if Get In Touch isn't there
    endSectionStartMatch = startFooterRegex.exec(content);
  }

  const endTagRegexGlobal = /<\/>/g;
  let lastEndTagMatch;
  let match;
  while ((match = endTagRegexGlobal.exec(content)) !== null) {
      lastEndTagMatch = match;
  }

  if (endSectionStartMatch && lastEndTagMatch) {
    const beforeEndSection = content.substring(0, endSectionStartMatch.index);
    const afterEndTag = content.substring(lastEndTagMatch.index);
    content = beforeEndSection + afterEndTag;
  }

  // Also remove the empty useEffect that just contains comments
  content = content.replace(/useEffect\(\(\) => \{\s*\/\/[^\n]*\n\s*\/\/[^\n]*\n\s*\}, \[\]\);\s*/, '');

  fs.writeFileSync(filePath, content);
  console.log(`Refactored ${file}`);
}
