import fs from 'fs';
import os from 'os';
const platform = os.platform().toLowerCase();
const isWin = /^win/.test(process.platform);
const isMac = /darwin/.test(platform);
const isLinux = /linux/.test(platform);

export default function getSysFontDirs() {

    let systemFontDirectory = isMac ? '/Library/Fonts' : '/usr/share/fonts',
        ttfDirectory = '',
        otfDirectory = '';

    if (isWin) systemFontDirectory = 'C:/Windows/Fonts';

    if (platform.indexOf('linux') !== -1) {
        ttfDirectory = path.join(systemFontDirectory, 'truetype');
        otfDirectory = path.join(systemFontDirectory, 'opentype');
        if (!fs.existsSync(ttfDirectory)) fs.mkdirSync(ttfDirectory);
        if (!fs.existsSync(otfDirectory)) fs.mkdirSync(otfDirectory);
    }

    return {
        systemFontDirectory,
        ttfDirectory,
        otfDirectory
    };
}