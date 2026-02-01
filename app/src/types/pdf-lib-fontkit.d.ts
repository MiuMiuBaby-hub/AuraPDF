declare module '@pdf-lib/fontkit' {
    import type { Fontkit } from 'pdf-lib-plus-encrypt';
    const fontkit: Fontkit;
    export default fontkit;
}

declare module 'harfbuzzjs/hb-subset.wasm?url' {
    const url: string;
    export default url;
}
