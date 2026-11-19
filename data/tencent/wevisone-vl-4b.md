# tencent/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo de vision-lenguaje desarrollado por WeChat Vision (Tencent Inc.) que unifica percepción visual a nivel de objeto y a nivel de píxel en un único modelo de next-token prediction. Está construido sobre Qwen3-VL y añade un decodificador de píxeles ligero de 9,6 millones de parámetros que permite tareas densas como segmentación por referencia y matting alfa. La versión publicada tiene 4.830.581.248 parámetros totales según los pesos en safetensors.

El modelo aborda un problema clásico en visión por computador: la fragmentación de pipelines, donde detección, grounding, conteo, OCR, segmentación y matting requieren modelos separados. WeVisOne-VL los integra mediante tokens de coordenadas dedicados (`<0>` a `<1000>`) para cajas y puntos normalizados, y un token de instancia (`<OBJ>`, ID 152678) que conecta la salida estructurada del LLM con el decodificador denso.

Es relevante porque ofrece percepción de objetos a píxeles en un solo checkpoint de 4B con licencia Apache 2.0, lo que facilita su despliegue en entornos de investigación y producción con requisitos moderados de hardware. La release está orientada a investigación en grounding visual, localización por referencia, pointing, conteo, OCR, segmentación y matting.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje basada en Qwen3-VL (transformer multimodal) con decodificador de píxeles acoplado |
| Parametros totales | 4.830.581.248 (modelo principal); decodificador de máscaras adicional de 9.609.764 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo principal) y `mask_decoder.pt` (decodificador de píxeles) |

## Arquitectura y entrenamiento

WeVisOne-VL parte de Qwen3-VL como backbone multimodal y le añade un decodificador de píxeles de 9,6M de parámetros que combina tres componentes: un adaptador de features visuales sobre features del ViT de Qwen3-VL previas al merging multinivel; un decodificador de queries guiado por caja con 6 bloques de cross-attention deformable inicializados desde el estado oculto del token `<OBJ>` y una caja previa codificada con Fourier; y una cabeza de predicción densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina predicciones en escalas S/4, S/2 y S/1 para producir mattes alfa continuos a resolución completa con stride 1.

El modelo genera salidas estructuradas mediante next-token prediction: usa tokens de coordenadas `<0>`...`<1000>` para representar cajas delimitadoras y puntos normalizados, devuelve `None` cuando el objetivo consultado no está presente y emite `<OBJ>` tras cada caja predicha en tareas densas, lo que permite al decodificador generar la máscara correspondiente a esa instancia. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La release prioriza eficiencia de inferencia: genera salidas estructuradas sin chain-of-thought explícito y está limitada a percepción de imagen en un solo turno (el decodificador de píxeles rechaza rejillas de vídeo).

## Capacidades

- Detección de objetos de vocabulario abierto con cajas delimitadoras en coordenadas normalizadas.
- Localización por referencia (referring localization) a partir de descripciones en lenguaje natural.
- Conteo de objetos con localización de instancias.
- Pointing de objetos mediante puntos normalizados.
- OCR con localización de texto en imagen.
- Segmentación por referencia (referring expression segmentation) con máscaras por instancia.
- Matting alfa promptable con salida continua a resolución completa (stride 1).
- Salida estructurada con rechazo explícito (`None`) cuando el objetivo no existe en la imagen.
- Conversación multimodal de un solo turno sobre imagen (pipeline image-text-to-text).
- No soporta vídeo en la release actual: el decodificador de píxeles rechaza rejillas de vídeo.
- No se documenta soporte de tool calling ni de razonamiento multi-paso con agentes.

## Casos de uso

- Anotación automática de datasets de detección: el modelo genera cajas normalizadas para categorías de vocabulario abierto, lo que permite preetiquetar imágenes y reducir el coste de anotación manual antes de la revisión humana.
- Segmentación de producto en e-commerce: dada una imagen y una consulta como "persona" o "zapatilla", devuelve la máscara de la instancia, útil para recortes, catálogos y pruebas de fondo.
- Matting para edición y postproducción: el `FullCanvasAlphaCascadeHead` produce mattes alfa continuos a resolución completa, adecuados para composición sobre nuevos fondos con bordes suaves (pelo, transparencias).
- Digitalización documental con OCR localizado: extrae texto y su posición en la imagen, lo que sirve para indexar documentos escaneados o validar campos en formularios.
- Control de aforo y conteo en imágenes: el conteo con localización de instancias permite inventariar objetos en estanterías, almacenes o escenas de tráfico a partir de una consulta textual.
- Asistentes visuales de accesibilidad: responder a preguntas del tipo "¿dónde está la salida?" devolviendo la caja o el punto del objeto referenciado en la imagen.
- Grounding para robótica e interfaces: la salida en puntos y cajas normalizadas facilita pasar coordenadas a un sistema de control o a una UI que necesite señalar un objeto concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,83B parámetros en bfloat16 requiere aproximadamente 9,7 GB solo para pesos, más el decodificador de máscaras (~19 MB en fp32) y el overhead de activaciones y del ViT.
- GPU recomendadas: no especificadas por el autor. Por tamaño, encaja en GPUs con 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100).
- Cabe en GPU de consumo: previsiblemente en RTX 4090 (24 GB) en bfloat16; en GPUs de 16 GB requeriría cuantización, para la cual no se documentan formatos en la información disponible.
- Opciones de despliegue: el autor publica un paquete de inferencia propio (`wevisone_vl`, instalable desde GitHub) con carga vía `WeVisOneVL("tencent/WeVisOne-VL-4B", device="auto", dtype="bfloat16")`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A nivel cualitativo, la propuesta diferencial frente a VLMs genéricos de tamaño similar es la integración nativa de tareas densas (segmentación y matting) mediante un decodificador acoplado, en lugar de depender de modelos externos de segmentación.

| Modelo | Parametros | Contexto | Tareas densas | Licencia |
|---|---|---|---|---|
| WeVisOne-VL-4B | 4,83B + 9,6M (decoder) | no disponible | Detección, grounding, conteo, pointing, OCR, segmentación, matting | Apache 2.0 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los bordes alfa finos son sensibles a la resolución de la imagen, a oclusiones severas, a transparencias complejas y a la formulación del prompt.
- El modelo genera salidas estructuradas sin chain-of-thought explícito por eficiencia, lo que puede limitar el rendimiento en consultas ambiguas o composicionales.
- Solo admite percepción de imagen en un solo turno; el decodificador de píxeles rechaza rejillas de vídeo.
- No está destinado a decisiones autónomas de alto impacto ni a la identificación de personas, según la model card.
- No se documentan sesgos conocidos, cobertura idiomática ni comportamiento fuera del dominio visual.
- Riesgo de alucinación en coordenadas y en la decisión de presencia/ausencia (`None`) no cuantificado en la información disponible.
- La licencia Apache 2.0 cubre el código propio de Tencent; los componentes de terceros conservan sus licencias originales y deben revisarse antes de uso comercial.
- El despliegue requiere el paquete de inferencia propio y el archivo `mask_decoder.pt`; no se confirma compatibilidad con servidores de inferencia estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/WeVisOne-VL-4B
- Paper (arXiv 2610.31329): https://huggingface.co/papers/2610.31329
- Página del proyecto: https://tencent.github.io/WeVisOne-VL
- Repositorio de inferencia: https://github.com/Tencent/WeVisOne-VL
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
