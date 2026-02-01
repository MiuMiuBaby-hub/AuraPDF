/**
 * Font subsetter using harfbuzzjs WebAssembly.
 *
 * Subsets OTF/TTF fonts to contain only the specified Unicode characters.
 * This bypasses @pdf-lib/fontkit's buggy CJK subsetting by performing
 * the subset externally via HarfBuzz before pdf-lib ever sees the bytes.
 *
 * WASM binary (~750 KB) is loaded lazily on first use and cached.
 */

// Vite resolves this to a cache-busted URL pointing to the WASM asset
import hbSubsetWasmUrl from 'harfbuzzjs/hb-subset.wasm?url';

const HB_MEMORY_MODE_WRITABLE = 2;

interface HbSubsetExports {
    memory: WebAssembly.Memory;
    malloc: (size: number) => number;
    free: (ptr: number) => void;
    hb_blob_create: (data: number, length: number, mode: number, userData: number, destroy: number) => number;
    hb_blob_destroy: (blob: number) => void;
    hb_blob_get_data: (blob: number, length: number) => number;
    hb_blob_get_length: (blob: number) => number;
    hb_face_create: (blob: number, index: number) => number;
    hb_face_destroy: (face: number) => void;
    hb_face_reference_blob: (face: number) => number;
    hb_subset_input_create_or_fail: () => number;
    hb_subset_input_destroy: (input: number) => void;
    hb_subset_input_unicode_set: (input: number) => number;
    hb_set_add: (set: number, value: number) => void;
    hb_subset_or_fail: (source: number, input: number) => number;
}

let wasmExports: HbSubsetExports | null = null;
let wasmPromise: Promise<HbSubsetExports> | null = null;

/**
 * Lazily load the hb-subset WASM module.
 * Loaded once and cached for the session lifetime.
 */
async function loadWasm(): Promise<HbSubsetExports> {
    if (wasmExports) return wasmExports;
    if (wasmPromise) return wasmPromise;

    wasmPromise = (async () => {
        const wasmBytes = await fetch(hbSubsetWasmUrl).then(r => r.arrayBuffer());
        const { instance } = await WebAssembly.instantiate(wasmBytes);
        wasmExports = instance.exports as unknown as HbSubsetExports;
        console.info('[Font Subsetter] HarfBuzz WASM loaded');
        return wasmExports;
    })();

    try {
        return await wasmPromise;
    } catch (error) {
        wasmPromise = null; // Allow retry on next call
        throw error;
    }
}

/**
 * Subset an OTF/TTF font to contain only the specified characters.
 *
 * Uses harfbuzzjs WASM — independent of @pdf-lib/fontkit, so fontkit's
 * CJK corruption bug does not apply.
 *
 * @param fontBytes  Full font file (OTF or TTF)
 * @param characters String containing all characters to include in the subset
 * @returns          Subsetted font bytes (same format as input)
 */
export async function subsetFont(
    fontBytes: ArrayBuffer,
    characters: string,
): Promise<ArrayBuffer> {
    const exports = await loadWasm();

    // 1. Copy font into WASM heap
    const fontBuffer = exports.malloc(fontBytes.byteLength);
    new Uint8Array(exports.memory.buffer).set(new Uint8Array(fontBytes), fontBuffer);

    // 2. Create HarfBuzz blob → face
    const blob = exports.hb_blob_create(fontBuffer, fontBytes.byteLength, HB_MEMORY_MODE_WRITABLE, 0, 0);
    const face = exports.hb_face_create(blob, 0);
    exports.hb_blob_destroy(blob);

    // 3. Create subset input and add Unicode codepoints
    const input = exports.hb_subset_input_create_or_fail();
    if (!input) {
        exports.hb_face_destroy(face);
        exports.free(fontBuffer);
        throw new Error('hb_subset_input_create_or_fail returned null');
    }

    const unicodeSet = exports.hb_subset_input_unicode_set(input);
    for (const char of characters) {
        const codepoint = char.codePointAt(0);
        if (codepoint !== undefined) {
            exports.hb_set_add(unicodeSet, codepoint);
        }
    }

    // 4. Perform subsetting
    const subset = exports.hb_subset_or_fail(face, input);
    exports.hb_subset_input_destroy(input);

    if (!subset) {
        exports.hb_face_destroy(face);
        exports.free(fontBuffer);
        throw new Error('hb_subset_or_fail returned null — subsetting failed');
    }

    // 5. Extract result bytes
    //    Re-read memory.buffer — it may have grown during subsetting
    const resultBlob = exports.hb_face_reference_blob(subset);
    const dataPtr = exports.hb_blob_get_data(resultBlob, 0);
    const length = exports.hb_blob_get_length(resultBlob);

    if (length === 0) {
        exports.hb_blob_destroy(resultBlob);
        exports.hb_face_destroy(subset);
        exports.hb_face_destroy(face);
        exports.free(fontBuffer);
        throw new Error('Subset produced empty font');
    }

    const currentHeap = new Uint8Array(exports.memory.buffer);
    const result = new ArrayBuffer(length);
    new Uint8Array(result).set(currentHeap.subarray(dataPtr, dataPtr + length));

    // 6. Cleanup
    exports.hb_blob_destroy(resultBlob);
    exports.hb_face_destroy(subset);
    exports.hb_face_destroy(face);
    exports.free(fontBuffer);

    return result;
}
