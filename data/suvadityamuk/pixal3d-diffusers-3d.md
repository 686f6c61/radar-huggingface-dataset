# suvadityamuk/Pixal3D-diffusers-3d

## Resumen

Pixal3D-diffusers-3d es una conversión comunitaria del modelo TencentARC/Pixal3D al ecosistema diffusers-3d, publicada por el desarrollador suvadityamuk (Suvaditya Mukherjee). No se trata de un modelo entrenado desde cero, sino de un reempaquetado de los pesos originales de Tencent ARC Lab en carpetas de componentes estándar de Diffusers y Transformers, acompañadas de un fichero lateral `object3d_model_index.json` que el cargador automático del paquete valida antes de descargar nada. La pipeline declarada es image-to-3d y el repositorio ocupa 13,2 GB en formato safetensors.

El modelo resuelve la generación de activos 3D a partir de una única imagen RGBA, donde el canal alfa actúa como máscara del objeto. La reconstrucción se realiza en el marco de la cámara de entrada, especificada mediante `camera_angle_x` (campo de visión horizontal en radianes), y puede producir voxels, mallas, gaussian splats y mallas con textura PBR. Para la codificación de la imagen de entrada depende de un codificador DINOv3 ViT-L/16 externo que no se redistribuye y que está sujeto a la licencia DINOv3 de Meta.

Su relevancia es fundamentalmente práctica: permite ejecutar los pesos de Pixal3D sin `remote_code`, usando código de Diffusers estándar y PyTorch puro sobre CPU o GPU, con licencia MIT para los pesos y el código de Pixal3D. Como contrapartida, el repositorio no incluye benchmarks, no documenta el número de parámetros y no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelos de flujo (flow matching) con planificador Euler para estructura dispersa y SLat, más decodificadores de la familia TRELLIS.2; detalles de la red troncal no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una imagen) |
| Tipos de cuantización | no disponible; los pesos se cargan en `torch.bfloat16` según el ejemplo oficial de la model card y no se declara soporte GGUF ni de cuantización de otro tipo |
| Idiomas soportados | no disponible (no aplica: la entrada es una imagen, no texto) |
| Licencia | MIT para los pesos y el código de Pixal3D (Copyright (c) Tencent ARC Lab); el codificador DINOv3 no se redistribuye y queda bajo la licencia DINOv3 de Meta |
| Formato de pesos | safetensors (carpetas de componentes Diffusers/Transformers + `object3d_model_index.json`) |
| Tamaño del repositorio | 13,2 GB |
| Pipeline | image-to-3d (`diffusers:Pixal3DImageTo3DPipeline`) |
| Salidas declaradas | `o_voxel`, `mesh`, gaussian splats (requiere backend `gsplat`) y malla con textura PBR (requiere CuMesh) |

## Arquitectura y entrenamiento

La conversión expone doce componentes que perfilan un pipeline en cascada propio de la familia TRELLIS.2. El primer bloque es un `Pixal3DSparseStructureFlowModel` con su decodificador (`Trellis2SparseStructureDecoder`) y planificador `Trellis2FlowEulerScheduler`, que genera la estructura dispersa. Después actúan dos modelos de flujo SLat (`Pixal3DSLatFlowModel`) para forma y textura, junto con los decodificadores `Trellis2ShapeDualGridDecoder` y `Trellis2PBRSparseDecoder`. La condición de imagen se inyecta mediante un `Pixal3DNAFUpsampler` (upsampler NAF, Neighborhood Attention Filtering, de valeo.ai) y el codificador DINOv3 ViT-L/16. Existencia de variantes nombradas `shape_slat_flow_model_1024` y `texture_slat_flow_model_1024`, lo que sugiere un modo de trabajo a resolución 1024, aunque el autor no documenta explícitamente este dato.

El autor no aporta información sobre el entrenamiento: no se indican número de tokens, composición del dataset, ni si hubo RLHF, DPO u otras fases de ajuste. La model card se limita a describir la conversión, realizada con la herramienta `diffusers-3d-convert-pixal3d` a partir de `diffusers-3d 0.1.0.dev0`, e indica que el README de la familia en el paquete lista las revisiones upstream fijadas y el mapeo de cada tensor. La paridad con el código upstream fijado se verifica mediante tests incluidos en el propio paquete, no publicados en este repositorio.

## Capacidades

- Generación de geometría 3D a partir de una imagen RGBA, usando el canal alfa como máscara del objeto; la pipeline recorta y rellena la imagen igual que el código original liberado.
- Reconstrucción en el marco de la cámara de entrada: la forma se reconstruye según `camera_angle_x` (campo de visión horizontal en radianes).
- Generación de estructura dispersa y de representaciones SLat de forma y de textura mediante modelos de flujo con planificador Euler.
- Salida en voxels (`o_voxel`) y en malla (`mesh`) según el ejemplo de uso de la model card.
- Renderizado de gaussian splats cuando se instala el backend opcional `gsplat`.
- Generación de malla con textura PBR mediante el decodificador `Trellis2PBRSparseDecoder`, que requiere CuMesh.
- Ejecución en PyTorch puro sobre CPU o GPU, sin `remote_code` y sin descarga de código remoto durante la carga.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje ni un agente.
- Capacidades multilingües: no aplica.
- Capacidad especial destacable: el codificador de imagen es un componente externo intercambiable que se pasa a `from_pretrained`, no un peso incluido en el repositorio.

## Casos de uso

- Digitalización de producto para comercio electrónico: a partir de una fotografía con fondo recortado en formato RGBA se puede obtener una malla con textura PBR utilizable en visores web 3D, sin necesidad de escaneo dedicado.
- Previsualización en flujos de impresión 3D: la salida en voxels y malla permite alimentar laminadores y comprobar la viabilidad de una pieza antes de fabricarla, partiendo de una única imagen de referencia.
- Generación de activos para videojuegos y motores 3D: la malla con textura PBR generada puede importarse en motores como Unity o Unreal como recurso provisional o definitivo, reduciendo el tiempo de modelado manual.
- Prototipado de diseño industrial: convertir bocetos o fotografías de referencia en geometría 3D permite iterar sobre formas y volúmenes antes de pasar a CAD.
- Realidad aumentada y virtual: la salida de gaussian splats, renderizable con el backend `gsplat`, es adecuada para representaciones volumétricas ligeras en visores y aplicaciones inmersivas.
- Investigación en generación 3D: el repositorio sirve como referencia reproducible para comparar la implementación convertida con el código upstream de TencentARC, gracias a los tests de paridad del paquete.
- Automatización de catálogos a escala: la ejecución con PyTorch estándar sobre GPU permite procesar lotes de imágenes en un pipeline propio de conversión por lotes, siempre que se disponga del codificador DINOv3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de calidad geométrica, de textura ni comparativas cuantitativas con otros modelos de image-to-3D, y la model card se limita a describir los componentes y el proceso de conversión.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto de entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Pixal3D-diffusers-3d (este modelo) | Pipeline image-to-3D reempaquetado | no disponible | Imagen RGBA + campo de visión | MIT (pesos y código Pixal3D) | Hugging Face, 13,2 GB | Conversión comunitaria, sin benchmarks publicados |
| TencentARC/Pixal3D | Modelo base original | no disponible | no disponible | MIT (según la model card de la conversión) | Hugging Face | Upstream del que se convierte este repositorio |
| TRELLIS.2 (familia de diffusers-3d) | Familia de decodificadores y planificadores | no disponible | no disponible | no disponible | no disponible | Solo se menciona que los decodificadores PBR y de estructura de esta conversión provienen de esta familia; requiere CuMesh para la malla PBR |

No se dispone de datos verificables de parámetros, contexto ni rendimiento para las alternativas de la misma categoría, por lo que la comparación cuantitativa queda como no disponible.

## Requisitos de hardware

- No se han publicado requisitos oficiales de hardware. Como referencia derivada del tamaño del repositorio (13,2 GB en safetensors), la carga completa de componentes en bfloat16 requiere aproximadamente 13 GB solo para los pesos, a lo que hay que sumar activaciones y el codificador externo; una estimación razonable sitúa el mínimo práctico en torno a 16 GB de VRAM. Es una estimación, no un dato confirmado por el autor.
- El codificador DINOv3 ViT-L/16 se carga por separado y también consume memoria; el autor no documenta su coste en este pipeline.
- GPUs recomendadas: no disponible. Por el volumen de pesos, las GPUs de 8-12 GB probablemente no sean suficientes en bfloat16; una RTX 4090 (24 GB), A100 o H100 serían candidatas razonables, sin confirmación oficial.
- Inferencia en CPU: la model card afirma que todas las redes se ejecutan en PyTorch puro sobre CPU o GPU, aunque no se documenta latencia ni viabilidad práctica en CPU para el conjunto completo.
- Despliegue: `AutoPipelineForImageTo3D` del paquete `diffusers-3d` (instalado desde el repositorio de GitHub del autor). El renderizado de gaussian splats necesita el backend opcional `gsplat` y la malla PBR de TRELLIS.2 necesita CuMesh.
- No aplican vLLM, llama.cpp, Ollama ni TGI: no es un modelo de lenguaje y no se publican pesos en GGUF.
- Latencia y throughput: no disponible.

## Limitaciones y advertencias

- No hay resultados de benchmarks ni evaluaciones de fidelidad geométrica o de textura publicados, por lo que el error en zonas ocluidas de la imagen de entrada no está cuantificado.
- El repositorio registra 0 descargas y 0 valoraciones, lo que implica ausencia de validación por parte de la comunidad.
- La conversión es de terceros y no está afiliada ni respaldada por Tencent, valeo.ai ni Meta; los tests de paridad existen dentro del paquete, pero no se publican en este repositorio.
- El codificador DINOv3 no se redistribuye y está sujeto a la licencia DINOv3 de Meta: es obligatorio aceptar esa licencia en el repositorio correspondiente y pasar el codificador manualmente. Sin él, la pipeline no funciona.
- El checkpoint del upsampler NAF de valeo.ai se publica sin licencia separada, aunque el código NAF sea Apache-2.0; esto introduce una incertidumbre legal para uso comercial pese a que los pesos de Pixal3D sean MIT.
- Requiere instalar una bifurcación de Diffusers desde GitHub (`diffusers-3d 0.1.0.dev0`), una API en desarrollo cuya estabilidad no está garantizada.
- No se declara soporte de cuantización ni de formatos GGUF, lo que limita el despliegue en hardware de gama baja.
- No es un modelo de lenguaje: no soporta tool calling, agentes, multilingüismo ni generación de texto, por lo que no debe evaluarse con métricas tipo MMLU o HumanEval.
- La licencia MIT cubre los pesos y el código de Pixal3D según la model card, pero el conjunto final del repositorio combina componentes con condiciones distintas (NAF y DINOv3); conviene revisar `LICENSE-MIT` y `NOTICE` antes de un uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/suvadityamuk/Pixal3D-diffusers-3d
- Modelo base: https://huggingface.co/TencentARC/Pixal3D
- Paquete diffusers-3d (GitHub): https://github.com/suvadityamuk/diffusers
- Subdirectorio del paquete: https://github.com/suvadityamuk/diffusers/tree/main/packages/diffusers-3d
- Codificador DINOv3 (acceso restringido): https://huggingface.co/facebook/dinov3-vitl16-pretrain-lvd1689m
- Checkpoint del upsampler NAF de valeo.ai: https://github.com/valeoai/NAF/releases
- Perfil del autor en Hugging Face: https://huggingface.co/suvadityamuk
- Perfil del autor en GitHub: https://github.com/suvadityamuk

La búsqueda web asociada a esta ficha no devolvió documentación técnica adicional: los resultados obtenidos fueron anuncios de servicios comerciales de generación 3D y perfiles del autor, sin papers, blogs ni demos relevantes para el modelo.
