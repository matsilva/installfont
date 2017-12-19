/*======= Imports =======*/
import fs from 'fs';
import os from 'os';
import path from 'path';
import getSystemFontDirectorys from 'get-system-font-directories';
import determineFileOrDirectory from 'determine-file-or-directory';

const Vow = require('bluebird');
const supportedExtensions = ['ttf', 'otf'];

export default function installfont(fontFileOrDirectory) {
    return determineFileOrDirectory(fontFileOrDirectory).then(type => {
        if (type === 'file') {
            return installFontFile(fontFileOrDirectory);
        } else if (type === 'directory') {
            return installFonts(fontFileOrDirectory);
        }
    });
}