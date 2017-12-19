import { exec } from 'child_process';
import fs from 'fs';
import os from 'os';
const Vow = require('bluebird');
const platform = os.platform().toLowerCase();
const isWin = /^win/.test(process.platform);
const isMac = /darwin/.test(platform);
const isLinux = /linux/.test(platform);

export default function installFontFile(fontFilePath) {
    if (isWin) {
        return installFontFileWindows(fontFilePath);
    } else if (isMac) {} else if (isLinux) {} else {
        return Vow.reject(new Error('installfont err: Unsupported operating system - ', fontFilePath));
    }
}

export function installFontFileWindows(fontFilePath) {
    return new Vow((resolve, reject) => {});
}

export function installFontFileMac(fontFilePath) {
    return new Vow((resolve, reject) => {});
}