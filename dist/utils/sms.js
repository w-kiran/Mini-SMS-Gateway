"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.analyzeMessage = analyzeMessage;
// GSM-7 basic character set: each character uses 1 septet
const GSM_BASIC = "@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞÆæßÉ !\"#¤%&'()*+,-./0123456789:;<=>?¡" +
    "ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà";
// GSM-7 extension characters: each one uses 2 septets (an escape + the character)
const GSM_EXTENSION = "^{}\\[~]|€";
function analyzeMessage(text) {
    let septets = 0;
    let isGsm = true;
    for (const ch of text) {
        if (GSM_BASIC.includes(ch)) {
            septets += 1;
        }
        else if (GSM_EXTENSION.includes(ch)) {
            septets += 2;
        }
        else {
            // one unsupported character makes the WHOLE message Unicode
            isGsm = false;
            break;
        }
    }
    if (isGsm) {
        // 160 fits in one SMS, longer messages use 153 per part
        const segments = septets <= 160 ? 1 : Math.ceil(septets / 153);
        return { encoding: "GSM7", length: septets, segments };
    }
    // Unicode counts UTF-16 units, so an emoji counts as 2
    const length = text.length;
    const segments = length <= 70 ? 1 : Math.ceil(length / 67);
    return { encoding: "UNICODE", length, segments };
}
