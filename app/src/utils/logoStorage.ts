import type { StoredLogo } from '../types';
import { MAX_LOGO_SLOTS } from '../types';

const DB_NAME = 'aurapdf_logos';
const DB_VERSION = 1;
const STORE_NAME = 'logos';
const ACTIVE_LOGO_KEY = 'aurapdf_active_logo_id';

// IndexedDB record shape
interface LogoRecord {
    slotIndex: number;
    id: string;
    name: string;
    mimeType: string;
    size: number;
    dimensions: { width: number; height: number };
    addedAt: string;
    bytes: ArrayBuffer;
}

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'slotIndex' });
            }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveLogoToSlot(
    slotIndex: number,
    logo: StoredLogo
): Promise<void> {
    const db = await openDB();
    const record: LogoRecord = {
        slotIndex,
        id: logo.id,
        name: logo.name,
        mimeType: logo.mimeType,
        size: logo.size,
        dimensions: logo.dimensions,
        addedAt: logo.addedAt,
        bytes: logo.bytes,
    };

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.put(record);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

export async function loadAllLogos(): Promise<(StoredLogo | null)[]> {
    const db = await openDB();
    const result: (StoredLogo | null)[] = new Array(MAX_LOGO_SLOTS).fill(null);

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.getAll();

        req.onsuccess = () => {
            const records: LogoRecord[] = req.result;
            for (const record of records) {
                if (record.slotIndex >= 0 && record.slotIndex < MAX_LOGO_SLOTS) {
                    const blob = new Blob([record.bytes], { type: record.mimeType });
                    const previewUrl = URL.createObjectURL(blob);
                    result[record.slotIndex] = {
                        id: record.id,
                        name: record.name,
                        mimeType: record.mimeType,
                        size: record.size,
                        dimensions: record.dimensions,
                        addedAt: record.addedAt,
                        bytes: record.bytes,
                        previewUrl,
                    };
                }
            }
            resolve(result);
        };
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

export async function deleteLogoFromSlot(slotIndex: number): Promise<void> {
    const db = await openDB();

    return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const req = store.delete(slotIndex);
        req.onsuccess = () => resolve();
        req.onerror = () => reject(req.error);
        tx.oncomplete = () => db.close();
    });
}

export function getActiveLogoId(): string | null {
    return localStorage.getItem(ACTIVE_LOGO_KEY);
}

export function setActiveLogoId(id: string | null): void {
    if (id === null) {
        localStorage.removeItem(ACTIVE_LOGO_KEY);
    } else {
        localStorage.setItem(ACTIVE_LOGO_KEY, id);
    }
}
