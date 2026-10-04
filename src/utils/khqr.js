/**
 * KHQR (Bakong / EMVCo Merchant-Presented QR) payload builder.
 *
 * Produces the exact ASCII string that a Cambodian banking app (ABA Mobile,
 * Bakong, Wing, ACLEDA, ...) expects when it scans a KHQR code. The string is
 * then fed to the `qrcode` package to render a scannable image.
 *
 * Reference: National Bank of Cambodia KHQR specification, which follows the
 * EMVCo Merchant-Presented QR standard (TLV blocks + CRC16-CCITT checksum).
 *
 * Tag layout emitted here (all lengths are 2-digit DECIMAL, per KHQR):
 *
 *   00  Payload Format Indicator ....... "01"
 *   01  Point of Initiation Method ..... "12" dynamic (amount) / "11" static
 *   29  Individual Account Information . 00 = Bakong Account ID (e.g. user@aba)
 *   52  Merchant Category Code ......... "5999"
 *   53  Transaction Currency ........... "840" (USD) / "116" (KHR)
 *   54  Transaction Amount ............. dynamic KHQR only
 *   58  Country Code ................... "KH"
 *   59  Merchant Name .................. uppercase, max 25 chars
 *   60  Merchant City .................. uppercase, max 15 chars
 *   62  Additional Data Field .......... 01 = bill number (optional)
 *   99  Timestamp ...................... 00 = created, 01 = expires (epoch ms)
 *   63  CRC16 .......................... 4 hex chars, computed over 00..6304
 *
 * IMPORTANT: tag 29 sub-tag 00 holds the Bakong Account ID *itself*. KHQR does
 * not use a "kh.gov.nbc.bakong" GUID - that value is not an account, so putting
 * it in sub-tag 00 makes every bank app reject the code as an invalid QR.
 *
 * IMPORTANT: tag 99 is MANDATORY as soon as tag 54 (amount) is present, because
 * a dynamic KHQR must carry a creation/expiration stamp. A compliant decoder
 * raises EXPIRATION_TIMESTAMP_REQUIRED without it (-> "Invalid QR Code").
 */

// Storefront's fixed exchange rate used for the KHR dual-currency display.
export const USD_TO_KHR = 4100;

// Default KHQR lifetime (seconds) - kept in sync with the checkout countdown.
export const KHQR_TTL_SECONDS = 300;

/**
 * USD amount -> riel amount using the storefront's fixed exchange rate.
 */
export function toKhr(amountUsd) {
  return Math.round(parseFloat(amountUsd || 0) * USD_TO_KHR);
}

/**
 * Build one TLV (Tag-Length-Value) block: 2-char id + 2-digit length + value.
 *
 * The length is decimal (0-99), not hexadecimal - as required by KHQR/EMVCo.
 */
function tlv(tag, value) {
  const v = value === undefined || value === null ? '' : String(value);
  return `${tag}${String(v.length).padStart(2, '0')}${v}`;
}

/**
 * CRC16-CCITT (FALSE) checksum required by EMVCo / KHQR (Tag 63).
 * Polynomial 0x1021, initial value 0xFFFF, no reflection, no final XOR.
 */
export function crc16(input) {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) !== 0 ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

function currencyCode(currency) {
  return String(currency || 'USD').toUpperCase() === 'KHR' ? '116' : '840';
}

/**
 * Decimal amount string for tag 54.
 *
 * KHR is a zero-decimal currency and Bakong rejects decimals for it; USD allows
 * at most 2 decimals. Returns '' when there is nothing to pay (= static QR).
 */
function formatAmount(amount, currency) {
  const value = parseFloat(amount || 0);
  if (!Number.isFinite(value) || value <= 0) return '';
  return currencyCode(currency) === '116'
    ? String(Math.round(value))
    : value.toFixed(2);
}

/**
 * Merchant name / city value: uppercase, alphanumeric + spaces only.
 */
function sanitizeName(name, maxLength = 25) {
  return String(name || '')
    .toUpperCase()
    .replace(/[^A-Z0-9 ]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

/**
 * Bill number (tag 62-01) must be plain alphanumeric, max 25 chars.
 */
function sanitizeBillNumber(billNumber) {
  return String(billNumber || '').replace(/[^A-Za-z0-9]/g, '').slice(0, 25);
}

/**
 * Merchants are resolved by this ID, so it has to be a real, registered Bakong
 * account. Warn instead of silently shipping an unscannable code.
 */
function normalizeAccountId(bakongAccountId) {
  const account = String(bakongAccountId || '').trim();
  // Bakong requires "name@bank_domain" and caps the whole ID at 32 chars.
  if (!account.includes('@') || account.length > 32) {
    console.warn(
      `[KHQR] "${account}" is not a valid Bakong account ID (expected "name@bank_domain", max 32 chars). Banking apps will reject the QR until a real account is configured.`
    );
  }
  return account;
}

/**
 * Assemble the full KHQR payload string.
 *
 * @param {object} opts
 * @param {string} opts.bakongAccountId     e.g. "men_itc_store@aba"
 * @param {string} [opts.merchantName]      e.g. "MEN ITC STORE"
 * @param {string} [opts.merchantCity]      e.g. "Phnom Penh"
 * @param {number} [opts.amount]            transaction amount (dynamic QR)
 * @param {string} [opts.currency]          "USD" (default) or "KHR"
 * @param {string} [opts.billNumber]        order reference (tag 62)
 * @param {string} [opts.merchantCategoryCode]
 * @param {number} [opts.expirationSeconds] QR lifetime when `expirationMs` is absent
 * @param {number} [opts.createdMs]         creation stamp (epoch ms), defaults to now
 * @param {number} [opts.expirationMs]      explicit expiry stamp (epoch ms)
 * @returns {string} KHQR payload ready to be encoded into a QR code
 */
export function buildKhqrPayload({
  bakongAccountId,
  merchantName = 'MEN ITC STORE',
  merchantCity = 'Phnom Penh',
  amount = 0,
  currency = 'USD',
  billNumber = '',
  merchantCategoryCode = '5999',
  expirationSeconds = KHQR_TTL_SECONDS,
  createdMs = Date.now(),
  expirationMs
} = {}) {
  const amountValue = formatAmount(amount, currency);
  const isDynamic = amountValue !== ''; // an amount => dynamic (scan-to-pay) KHQR
  const categoryCode = /^\d{4}$/.test(String(merchantCategoryCode))
    ? String(merchantCategoryCode)
    : '5999';

  // Tag 29 - Individual Account Information. Sub-tag 00 carries the Bakong
  // Account ID itself, e.g. "0015john_smith@devb" (decimal length, no GUID tag).
  const accountInformation = tlv('00', normalizeAccountId(bakongAccountId));

  let payload =
    tlv('00', '01') +                      // Payload Format Indicator
    tlv('01', isDynamic ? '12' : '11') +   // Point of Initiation Method
    tlv('29', accountInformation) +        // Bakong merchant account
    tlv('52', categoryCode) +              // Merchant Category Code
    tlv('53', currencyCode(currency));     // Transaction Currency

  if (isDynamic) {
    payload += tlv('54', amountValue);     // Transaction Amount
  }

  payload +=
    tlv('58', 'KH') +                                           // Country Code
    tlv('59', sanitizeName(merchantName)) +                     // Merchant Name
    tlv('60', sanitizeName(merchantCity, 15) || 'PHNOM PENH');  // Merchant City

  const bill = sanitizeBillNumber(billNumber);
  if (bill) {
    payload += tlv('62', tlv('01', bill)); // Additional Data Field: bill number
  }

  if (isDynamic) {
    // Tag 99 - a dynamic KHQR must be stamped. Without it a compliant decoder
    // throws EXPIRATION_TIMESTAMP_REQUIRED and banking apps report an invalid QR.
    const created = Number(createdMs) || Date.now();
    const expires = Number(expirationMs) > created
      ? Number(expirationMs)
      : created + Math.max(1, Number(expirationSeconds) || KHQR_TTL_SECONDS) * 1000;
    payload += tlv('99', tlv('00', String(created)) + tlv('01', String(expires)));
  }

  // Tag 63 always carries a 4-char CRC; the checksum covers everything before it.
  const toChecksum = payload + '6304';
  return toChecksum + crc16(toChecksum);
}

export default buildKhqrPayload;
