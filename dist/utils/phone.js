"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizePhone = normalizePhone;
exports.validatePhones = validatePhones;
// Returns the normalized 10 digit number, or null if it is not a valid Nepali mobile number.
function normalizePhone(raw) {
    // remove spaces and dashes
    let n = raw.replace(/[\s-]/g, "");
    if (n.startsWith("+977")) {
        n = n.slice(4);
    }
    else if (n.startsWith("977") && n.length === 13) {
        // the length check matters: "9771234567" is a normal 10 digit number that happens to start with 977
        n = n.slice(3);
    }
    // exactly 10 digits, starting with 97 or 98
    return /^9[78]\d{8}$/.test(n) ? n : null;
}
// Checks a whole list. Returns the unique valid numbers and the list of invalid ones.
function validatePhones(list) {
    const numbers = [];
    const invalid = [];
    for (const raw of list) {
        const n = normalizePhone(raw);
        if (n) {
            numbers.push(n);
        }
        else {
            invalid.push({
                number: raw,
                reason: "Must be a Nepali mobile number: 10 digits starting with 97 or 98",
            });
        }
    }
    // Set removes duplicate numbers, so nobody is charged twice for the same recipient
    return { numbers: [...new Set(numbers)], invalid };
}
