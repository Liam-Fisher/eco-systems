


type index = number;

interface scene_node {
    mesh: number,
    rotation?: [number,number,number,number] // quaternion
    scale?: [number,number,number] // xyz

}
interface bufferView {
  buffer: index
  byteOffset: number,
  byteLength: number,
  target: number
}
export interface gltfModel {
    scene: index,
    scenes: {
        nodes: index[]
    }
    nodes: scene_node[]

    buffers: {
        uri: string,
        byteLength: number
    }[]
    bufferViews: bufferView[];
    accessors: {
        bufferView: index
    }
    textures: {
        source: index
    }[]
  }
