const AD = "EU9HHUYcYX9BHxl3TgQScHRqchBraUwCamgbeWB+FEp1a2Z8aWdDARBOHnQLSRh2eRccckUbbWN/FUkHb2VoZm5kZ30VSx1zTwVCABNxehhKCBZMY2FAHnZsexl8EnMRcG4XTXdtfRNIBmV7H3ViYHFvZHp+FE0DGnhsYngWRBo=";

function ED() {
    const e = [];
    for (let t = 0; t < 26; t++) e.push(String.fromCharCode(65 + t));
    for (let t = 0; t < 26; t++) e.push(String.fromCharCode(97 + t));
    for (let t = 0; t < 10; t++) e.push(String.fromCharCode(48 + t));
    return e.push("+", "/"), e.join("");
}

const tv = ED();

function CD(e, t) {
    try {
        const r = Buffer.from(e, 'base64').toString('binary');
        const n = [];
        for (let a = 0; a < r.length; a += 2) {
            const o = r.charCodeAt(a);
            const s = r.charCodeAt(a + 1);
            const i = ((o ^ 91) - 17 + (s ^ 47) - 39) / 2;
            n.push(i);
        }
        return n.map(a => t[a]).join("");
    } catch (e) {
        console.error(e);
        return "";
    }
}

const _D = CD(AD, tv);
console.log("Custom Alphabet (_D):", _D);
console.log("Standard Alphabet (tv):", tv);
