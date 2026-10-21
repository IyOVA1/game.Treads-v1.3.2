import { GainMapNode } from '../nodes/GainMapNode';
import { LoaderBaseNode } from './LoaderBaseNode';
/**
 * A Three.js Loader for the gain map format stored as separate files (sdr image, gain map image, metadata json),
 * returning a {@link GainMapNode} (a TSL texture node holding the decoded HDR image).
 *
 * No renderer is needed: `load` returns the node synchronously, it can be assigned to materials right away
 * and it is decoded on the GPU once loaded.
 *
 * @category Loaders
 * @group Loaders
 *
 * @example
 * import { GainMapNodeLoader } from '@monogrid/gainmap-js/webgpu'
 * import { MeshBasicNodeMaterial } from 'three/webgpu'
 *
 * const hdr = new GainMapNodeLoader().load([
 *   'sdr.webp',
 *   'gainmap.webp',
 *   'metadata.json'
 * ])
 *
 * const material = new MeshBasicNodeMaterial()
 * material.colorNode = hdr
 */
export declare class GainMapNodeLoader extends LoaderBaseNode<[string, string, string]> {
    /**
     * Loads a gainmap using separate data
     * * sdr image
     * * gain map image
     * * metadata json
     *
     * useful for webp gain maps
     *
     * @param urls An array in the form of [sdr.jpg, gainmap.jpg, metadata.json]
     * @param onLoad Load complete callback, will receive the node
     * @param onProgress Progress callback, will receive a `ProgressEvent`
     * @param onError Error callback
     * @returns a node which can be used immediately, it will hold the image once loaded
     */
    load(urls: [string, string, string], onLoad?: (data: GainMapNode) => void, onProgress?: (event: ProgressEvent) => void, onError?: (err: unknown) => void): GainMapNode;
}
