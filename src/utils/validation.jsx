
//  Aadhaar Validation (12 digits only, no spaces, no letters)
export const isValidAadhaar = (aadhaar) => {
    if (!aadhaar) return false;

    // Remove accidental spaces
    const clean = aadhaar.replace(/\s+/g, "");

    // Must be exactly 12 digits
    const aadhaarRegex = /^[0-9]{12}$/;

    return aadhaarRegex.test(clean);
};


// PAN Validation (AAAAA9999A format)

export const isValidPAN = (pan) => {
    if (!pan) return false;

    const clean = pan.toUpperCase().trim();

    // Format: 5 alphabets + 4 digits + 1 alphabet
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

    return panRegex.test(clean);
};


export const getToday = () => {
    return new Date().toISOString().split("T")[0];
};


export const getMaxDOB = () => {
    const today = new Date();
    const lastYear = today.getFullYear() - 1;

    return `${lastYear}-12-31`; // last day of previous year
};