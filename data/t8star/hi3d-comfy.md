# t8star/Hi3d-Comfy

## Resumen

Hi3D T8 es un repositorio de pesos distribuido por T8star que reúne el núcleo del modelo Hi3D V1.0 de refinamiento de geometría 3D junto con 15 componentes de extensión para generación image-to-3D y texturizado PBR. No se trata de un unico modelo generativo de lenguaje, sino de un paquete de checkpoints, configuraciones y codificadores (DINOv2 Large, CLIP ViT-L/14, entre otros) pensado para integrarse en ComfyUI mediante nodos nativos o en el banco de trabajo independiente Hi3D T8 Workbench. El repositorio aloja 99 artefactos (pesos, configuraciones y licencias) que suman 84,2 GB.

El componente central, Hi3D V1.0, realiza refinamiento de geometría a partir de una imagen de referencia y una malla gruesa (coarse mesh), con checkpoints a 512 y 1024 de resolución y pesos compartidos de VAE; la resolución 1536 reutiliza los pesos de 1024. Las extensiones añaden generación de geometría desde imagen (Hunyuan3D-2mini Turbo, Hunyuan3D 2.1, Hunyuan3D-2mv multivista y TRELLIS.2) y texturizado PBR (TRELLIS.2, Hunyuan3D-Paint 2.1 y UltraTex en FP8 e INT8).

Su relevancia radica en que empaqueta en un solo repositorio reproducible un pipeline completo de image-to-3D con hashes SHA256 verificados, revisiones fijadas y licencias upstream conservadas, algo poco habitual en el ecosistema de modelos 3D. Está orientado a flujos de trabajo en ComfyUI y a la aplicación de escritorio del autor, no a inferencia mediante APIs de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multimodal de refinamiento de geometría 3D y texturizado PBR; combina el núcleo Hi3D V1.0 con codificadores DINOv2 Large y CLIP ViT-L/14 y decodificadores de extensión (Hunyuan3D, TRELLIS.2, FLUX.2 Klein, Qwen3) |
| Parametros totales | no disponible (repositorio de 99 artefactos, 84,2 GB; no se declara un recuento agregado de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (UltraTex, cuantización upstream) e INT8 ConvRot (Klein Base 9B, versión comunitaria de CivitAI); resto de pesos sin cuantizar declarada |
| Idiomas soportados | en, zh |
| Licencia | multiple-upstream-licenses (Hi3D Open License v1.0, Apache-2.0, MIT, Tencent Hunyuan 3D 2.0/2.1 Community, DINOv3 License, FLUX Non-Commercial, BSD-3-Clause) |
| Formato de pesos | safetensors, diffusers, ONNX |

## Arquitectura y entrenamiento

El repositorio no documenta un entrenamiento propio: es una redistribución verificada de pesos upstream con revisiones fijadas y licencias originales conservadas. El núcleo Hi3D V1.0 actúa como refinador de geometría sobre una malla gruesa condicionada por una imagen de referencia, apoyándose en DINOv2 Large y CLIP ViT-L/14 como codificadores. Las extensiones incorporan arquitecturas heterogéneas: los modelos de geometría de Hunyuan3D (2mini Turbo, 2.1 y 2mv multivista), el decodificador de estructura y geometría de TRELLIS.2, y para texturizado PBR Hunyuan3D-Paint 2.1, TRELLIS.2 y UltraTex, este último con un backbone FLUX.2 Klein 9B en FP8 o INT8 y un codificador de texto Qwen3.

La innovación principal es de ingeniería de distribución: `manifest.json` registra el núcleo compartido, `extensions/manifest.json` fija las 15 extensiones con sus repositorios y revisiones, y `model-catalogue.json` lista los 99 artefactos con recuento de bytes y SHA256. La actualización del 7 de noviembre de 2026 añade cuatro archivos oficiales multivista (unos 4,93 GB). No se especifican en la información disponible datos de entrenamiento, número de tokens, composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Refinamiento de geometría 3D a partir de imagen de referencia y malla gruesa, con resoluciones de 512, 1024 y 1536 (esta última reutiliza pesos de 1024).
- Generación image-to-3D mediante extensiones: Hunyuan3D-2mini Turbo, Hunyuan3D 2.1 y TRELLIS.2.
- Generación multivista: Hunyuan3D-2mv acepta vista frontal más vistas izquierda, trasera y derecha; el refinamiento posterior y los pintores existentes usan la referencia frontal.
- Texturizado PBR con Hunyuan3D-Paint 2.1, TRELLIS.2 y UltraTex (FP8 o INT8 ConvRot).
- Extracción opcional de primer plano en CPU mediante U2Netp.
- Integración con ComfyUI mediante nodos nativos que infieren dentro del propio Python de ComfyUI, sin servicio externo de workbench.
- Soporte de codificadores auxiliares DINOv2 Giant, DINOv3 y Real-ESRGAN para pintado y reescalado.
- Idiomas de la documentación y prompts textuales: inglés y chino.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión generalista; el alcance es específicamente 3D.

## Casos de uso

- Refinamiento de mallas en producción de assets: dado un modelo bloqueado de baja calidad y una imagen de referencia, el núcleo Hi3D V1.0 a 1024 o 1536 mejora la geometría conservando la topología de partida, útil en pipelines de videojuegos donde se parte de blocking.
- Generación rápida de prototipos 3D desde una sola imagen: con Hunyuan3D-2mini Turbo (3,82 GB) se obtiene geometría inicial en cuestión de segundos dentro de ComfyUI, adecuado para iteración de concepto.
- Modelado multivista para objetos simétricos o con oclusión: Hunyuan3D-2mv permite subir vistas frontal, izquierda, trasera y derecha para reconstruir geometría con menos ambigüedad, útil en escaneo de producto.
- Texturizado PBR de mallas existentes: Hunyuan3D-Paint 2.1 (11,50 GB) o TRELLIS.2 PBR (8,04 GB) generan mapas de albedo, rugosidad y metalicidad sobre geometría ya validada, integrándose en flujos de renderizado offline.
- Texturizado de alta fidelidad con backbone generativo: UltraTex con FLUX.2 Klein 9B en FP8 o INT8 ConvRot (unos 19,5-19,6 GB) produce texturas detalladas cuando la calidad visual prima sobre el coste de VRAM.
- Automatización por lotes en ComfyUI: los nodos nativos permiten encadenar extracción de fondo (U2Netp), generación de geometría y pintado en un grafo reproducible, con pesos verificados por SHA256 para entornos con requisitos de trazabilidad.
- Reproducibilidad en investigación: el catálogo con hashes y revisiones fijadas facilita replicar experimentos de image-to-3D comparando Hunyuan3D, TRELLIS.2 y UltraTex sobre el mismo conjunto de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; depende del componente. El núcleo completo ocupa 10,66 GB en disco y el conjunto total 84,2 GB, por lo que se recomienda almacenamiento amplio además de VRAM.
- Componentes por tamaño en disco: núcleo Hi3D 10,66 GB; Hunyuan3D-2mini Turbo 3,82 GB; Hunyuan3D 2.1 7,37 GB; Hunyuan3D-2mv 4,93 GB; TRELLIS.2 geometría 10,06 GB; TRELLIS.2 PBR 8,04 GB; Hunyuan3D-Paint 2.1 11,50 GB; UltraTex FP8 19,62 GB; UltraTex INT8 19,46 GB.
- GPU recomendadas: no disponible en la información proporcionada. UltraTex, al incluir un backbone FLUX.2 Klein 9B, es el componente más exigente y probablemente requiera GPUs de datacenter o consumer de gama alta; no se confirman cifras.
- Ajuste en GPU consumer: no confirmado. Los componentes pequeños (Hunyuan3D-2mini Turbo, 3,82 GB) son los candidatos más plausibles para GPUs consumer; el resto no está verificado.
- Despliegue: ComfyUI con nodos nativos, o el banco de trabajo Hi3D T8 Workbench (v0.5.1 y candidato 0.6 para multivista). El conversor CUDA opcional para Windows se instala aparte desde `runtime-wheels/v0.4.9/` con hash fijado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hi3D T8 (este repo) | Paquete de refinamiento 3D y extensiones image-to-3D/PBR | no disponible (84,2 GB en 99 artefactos) | no aplica | multiple-upstream-licenses | Hugging Face, ComfyUI, workbench propio |
| Hunyuan3D 2.1 (upstream) | Image-to-3D | no disponible | no aplica | Tencent Hunyuan 3D 2.1 Community | Incluido como extensión y disponible upstream |
| TRELLIS.2 (upstream) | Geometría y PBR | no disponible | no aplica | MIT | Incluido como extensión y disponible upstream |
| UltraTex / FLUX.2 Klein 9B (upstream) | Texturizado PBR con backbone generativo | 9B en el backbone | no disponible | FLUX Non-Commercial (backbone) | Incluido como extensión |

La comparación directa con otros paquetes de modelos 3D no está disponible en la información proporcionada; los tres alternativas listadas son componentes upstream que este repositorio redistribuye.

## Limitaciones y advertencias

- Licencia fragmentada: conviven Hi3D Open License v1.0, Apache-2.0, MIT, Tencent Hunyuan 3D Community, DINOv3 License, BSD-3-Clause y FLUX Non-Commercial. El backbone FLUX.2 Klein 9B de UltraTex es no comercial, lo que restringe ese componente en producción.
- El repositorio no contiene la aplicación ni Python; solo pesos, configuraciones y licencias. Requiere ComfyUI o el workbench del autor para funcionar.
- La funcionalidad multivista exige el workbench 0.6 candidato o superior; descargar solo los pesos no añade los controles a versiones antiguas.
- El archivo INT8 ConvRot es una cuantización comunitaria publicada (Klein Base, no distilled/KV) y no fue cuantizada por este proyecto; la FP8 proviene de upstream.
- Los modelos de segmentación de assets, rigging y movimiento (`studio`) no forman parte de los 99 archivos y se gestionan por separado desde repositorios oficiales fijados.
- Idiomas limitados a inglés y chino en documentación y prompts; no se declara soporte multilingüe adicional.
- Riesgo de alucinación geométrica y de textura inherente a los modelos generativos 3D: las mallas y mapas PBR deben validarse manualmente antes de producción.
- Sesgos conocidos: no documentados en la información disponible.
- El tamaño total (84,2 GB) más espacio de trabajo y runtime exige planificación de almacenamiento; se recomienda descargar solo las filas de componentes necesarias.
- No se especifican requisitos mínimos de VRAM ni latencias, lo que dificulta el dimensionado de infraestructura sin pruebas propias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/t8star/Hi3d-Comfy
- Árbol de archivos: https://huggingface.co/t8star/Hi3d-Comfy/tree/main
- Sección de licencias: https://huggingface.co/t8star/Hi3d-Comfy/blob/main/README.md#licenses
- README en chino: https://huggingface.co/t8star/Hi3d-Comfy/blob/main/README.zh-CN.md
- Workbench Hi3D T8 (GitHub): https://github.com/T8mars/Comfyui-Hi3d-T8
- Código candidato multivista: https://github.com/T8mars/Comfyui-Hi3d-T8/tree/codex/asset-studio-multiview
