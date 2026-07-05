import crypto from 'crypto';

/**
 * Generate CMI SHA-512 Hash
 * CMI requires all POST parameters to be sorted alphabetically by key (case-insensitive usually, but strict ASCII sort is standard).
 * The store key is appended at the end or used as part of the hashing based on CMI documentation.
 * Standard CMI hashing:
 * 1. Sort all parameters (except 'HASH') by key alphabetically.
 * 2. Join values with a pipe '|'
 * 3. Append the store key to the end with a pipe '|'
 * 4. Calculate SHA512 hash of the resulting string and encode in Base64 or Hex (Base64 is standard for CMI).
 */
export function generateCmiHash(params: Record<string, string>, storeKey: string): string {
    const keys = Object.keys(params).filter(k => k !== 'HASH' && k !== 'encoding').sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
    
    let hashString = '';
    for (const key of keys) {
        // According to CMI documentation, empty parameters or specific parameters might need special handling,
        // but typically all POST params are joined with '|'.
        const escapedValue = params[key].replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
        hashString += escapedValue + '|';
    }
    
    // Append the store key
    hashString += storeKey.replace(/\\/g, '\\\\').replace(/\|/g, '\\|');
    
    // Hash using SHA-512 and return Base64
    const hash = crypto.createHash('sha512').update(hashString, 'utf8').digest('base64');
    return hash;
}

/**
 * Validates the CMI Webhook hash
 */
export function validateCmiHash(params: Record<string, string>, storeKey: string, providedHash: string): boolean {
    const calculatedHash = generateCmiHash(params, storeKey);
    return calculatedHash === providedHash;
}

/**
 * Client-side helper to submit the CMI form
 */
export function submitCmiForm(gatewayUrl: string, cmiParams: Record<string, string>) {
    if (typeof window === 'undefined') return;
    
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = gatewayUrl;
    
    Object.keys(cmiParams).forEach(key => {
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = key;
        hiddenField.value = cmiParams[key];
        form.appendChild(hiddenField);
    });
    
    document.body.appendChild(form);
    form.submit();
}
