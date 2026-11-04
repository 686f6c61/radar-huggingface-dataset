# t8star/WeVisOne-VL-Comfy

## Resumen

WeVisOne-VL-Comfy es un repositorio de distribucion que empaqueta los checkpoints oficiales del modelo vision-lenguaje WeVisOne-VL de Tencent (en variantes de 2B y 4B parametros) junto con los activos necesarios para su uso en ComfyUI a traves del nodo personalizado ComfyUI-WeVisOne-VL-T8. No se trata de un modelo nuevo entrenado por t8star, sino de una reorganizacion de pesos originales sin modificar, acompanada de los checkpoints de SAM2.1 Hiera Base+ y de la cabeza de refinamiento Mask2Alpha de Tencent, que permiten tareas de segmentacion guiada por texto y matting de imagen dentro del ecosistema ComfyUI.

El interes practico del repositorio reside en la integracion: unifica en un unico snapshot descargable el modelo vision-lenguaje, el tokenizer, el processor, el decodificador de pixeles, el checkpoint de SAM2 y la cabeza Mask2Alpha, ademas de una exportacion ONNX opcional de forma fija. Esto elimina la necesidad de rastrear manualmente pesos dispersos entre el repositorio oficial de Tencent, HuggingFace y el repositorio de Meta SAM2, y anade ficheros de procedencia (`provenance.json`) y sumas de verificacion SHA-256 para auditar el origen de cada tensor.

El repositorio ocupa 15,0 GB e incluye las dos variantes de tamano (2B y 4B), lo que permite al descargador del nodo seleccionar solo la solicitada. La licencia declarada es Apache-2.0, heredada de los modelos originales, y el pipeline registrado es image-text-to-text. El modelo base es tencent/WeVisOne-VL-2B y tencent/WeVisOne-VL-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo vision-lenguaje; pesos originales de Tencent WeVisOne-VL) |
| Parametros totales | 2B y 4B (dos variantes incluidas) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos pretrained sin cuantizar; hay exportacion ONNX de la cabeza Mask2Alpha) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (modelo), .pt (SAM2.1 y Mask2Alpha), .onnx (cabeza de refinamiento opcional) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura interna del modelo WeVisOne-VL mas alla de su naturaleza vision-lenguaje y su pipeline image-text-to-text. Los pesos se copian sin modificar desde los checkpoints oficiales de Tencent (tencent/WeVisOne-VL-2B y tencent/WeVisOne-VL-4B), por lo que las decisiones de arquitectura, el corpus de entrenamiento, el numero de tokens vistos y las posibles fases de RLHF o DPO corresponden al trabajo original de Tencent y no se detallan en esta model card. Tampoco se especifica si el modelo emplea atencion lineal, decodificacion especulativa u otra innovacion concreta.

Lo que si documenta el repositorio es la composicion del paquete: por cada tamano (2B y 4B) se incluyen pesos del modelo, tokenizer, processor y el decodificador de pixeles requerido (`mask_decoder.pt`), imprescindible para segmentacion y matting guiados por texto. Se anaden ademas el checkpoint oficial SAM2.1 Hiera Base+ (`sam2.1_hiera_base_plus.pt`) y la cabeza de refinamiento Mask2Alpha de Tencent (`mask2alpha_sam2_bplus.pt`), con una exportacion ONNX opcional de forma fija (`mask2alpha_head.onnx`). Los motores TensorRT, si se desean, se construyen localmente para la GPU y el runtime del usuario. La procedencia queda fijada en `provenance.json` con revisiones de origen, tamanos de fichero y checksums SHA-256.

## Capacidades

- Generacion de texto condicionada por imagen (pipeline image-text-to-text) en las variantes 2B y 4B.
- Comprension de imagen y respuesta en lenguaje natural a partir de la entrada visual.
- OCR: la etiqueta `ocr` figura entre las capacidades declaradas del paquete.
- Segmentacion guiada por texto mediante el decodificador de pixeles y SAM2.1 Hiera Base+.
- Matting de imagen y conversion de mascara a alfa (Mask2Alpha) con la cabeza de refinamiento de Tencent.
- Integracion nativa en ComfyUI mediante el nodo ComfyUI-WeVisOne-VL-T8, con loader que selecciona el tamano de modelo y descarga los checkpoints compartidos.
- Exportacion ONNX de forma fija de la cabeza Mask2Alpha para despliegue sin PyTorch.
- Soporte de tool calling, agentes, multi-step reasoning, thinking mode, vision avanzada o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Segmentacion guiada por texto en flujos de edicion: el usuario describe el objeto a aislar y el paquete combina WeVisOne-VL con SAM2.1 Hiera Base+ para producir la mascara, que Mask2Alpha refina y convierte en canal alfa para composicion posterior.
- Matting de producto para e-commerce: a partir de una imagen de catalogo, se genera una mascara alfa limpia que permite sustituir el fondo sin trabajo manual, usando la cabeza Mask2Alpha y el decodificador de pixeles incluidos.
- Extraccion de texto en imagenes (OCR) dentro de pipelines de digitalizacion: el modelo responde a consultas sobre el contenido textual de la imagen, util para indexar capturas, documentos escaneados o pantallazos.
- Automatizacion de postproduccion en ComfyUI: el nodo permite encadenar la descripcion textual de una region con la generacion de mascara y alfa, integrándose en grafos de nodos existentes sin salir de la interfaz.
- Prototipado rapido de asistentes visuales: la variante 2B permite iterar en local con requisitos de memoria reducidos antes de escalar a la variante 4B para mayor calidad.
- Descripcion automatica de imagenes para accesibilidad o catalogacion: el pipeline image-text-to-text genera descripciones en lenguaje natural que pueden almacenarse como metadatos.
- Verificacion de integridad en despliegues regulados: los ficheros `provenance.json` y `SHA256SUMS` permiten auditar que los pesos desplegados coinciden con las revisiones oficiales de Tencent y Meta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia orientativa por tamano, la variante 2B en precision completa requiere del orden de 4-6 GB solo para pesos, y la 4B del orden de 8-10 GB, a lo que hay que sumar el decodificador de pixeles, SAM2.1 Hiera Base+ y la cabeza Mask2Alpha; estas cifras no estan confirmadas en la model card.
- GPU recomendadas: no disponible. El repositorio menciona que los motores TensorRT se construyen localmente para la GPU y runtime del usuario, lo que sugiere soporte para GPUs NVIDIA, sin modelos concretos listados.
- Compatibilidad con GPU de consumo: no confirmada; la variante 2B es la candidata natural para GPUs de consumo por su menor huella, pero el dato no se especifica.
- Opciones de despliegue: ComfyUI mediante el nodo ComfyUI-WeVisOne-VL-T8; descarga via `huggingface_hub.snapshot_download`; exportacion ONNX de la cabeza Mask2Alpha; construccion local de motores TensorRT. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de contexto que permitan una comparacion cuantitativa fiable con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio es una redistribucion de pesos de terceros: no aporta mejoras de entrenamiento ni ajustes sobre los modelos originales de Tencent, por lo que hereda sus limitaciones.
- No se documentan sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez; deben asumirse los riesgos habituales de los modelos vision-lenguaje.
- Idiomas soportados no declarados; no hay garantia de calidad multilingue mas alla de lo que ofrezcan los checkpoints originales.
- Longitud de contexto no disponible: no es posible planificar cargas de contexto largo con datos verificados.
- La licencia Apache-2.0 permite uso comercial, pero se deben conservar los avisos originales incluidos en cada directorio del modelo y en `LICENSES/`; el usuario es responsable de verificar las condiciones de los componentes de terceros (SAM2 de Meta y Mask2Alpha de Tencent).
- El repositorio pesa 15,0 GB porque incluye ambas variantes; conviene usar `allow_patterns` para descargar solo el tamano necesario y evitar consumo innecesario de disco y ancho de banda.
- Los motores TensorRT no se distribuyen: deben compilarse localmente, lo que anade complejidad de despliegue y dependencia de la version de CUDA y del driver.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria documentada.
- El nodo ComfyUI depende de un repositorio externo (T8mars/Comfyui-WeVisOne-VL-T8); su mantenimiento y compatibilidad con versiones futuras de ComfyUI no estan garantizados por el autor del modelo original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/t8star/WeVisOne-VL-Comfy
- Nodo ComfyUI: https://github.com/T8mars/Comfyui-WeVisOne-VL-T8
- WeVisOne-VL de Tencent (GitHub): https://github.com/Tencent/WeVisOne-VL
- Rama Mask2Alpha: https://github.com/Tencent/WeVisOne-VL/tree/mask2alpha
- Modelo oficial 2B: https://huggingface.co/tencent/WeVisOne-VL-2B
- Modelo oficial 4B: https://huggingface.co/tencent/WeVisOne-VL-4B
- Meta SAM2: https://github.com/facebookresearch/sam2
- Perfil del autor en HuggingFace: https://huggingface.co/t8star
- Bilibili del autor: https://space.bilibili.com/385085361
- YouTube del autor: https://www.youtube.com/@T8star-Aix/
