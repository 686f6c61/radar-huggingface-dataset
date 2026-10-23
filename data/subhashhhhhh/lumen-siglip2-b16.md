# subhashhhhhh/lumen-siglip2-b16

## Resumen

`subhashhhhhh/lumen-siglip2-b16` es un paquete de ficheros ONNX derivado de **SigLIP 2 ViT-B/16 (224 px, WebLI)** de Google, preparado específicamente para Lumen, una galería fotográfica local-first para Android. No es un modelo nuevo: es una conversión y cuantización del checkpoint `google/siglip2-base-patch16-224`, pensada para ejecutar búsqueda semántica de fotos en el propio teléfono, sin enviar imágenes a ningún servidor. El autor publica tres artefactos: el codificador visual en fp32, el codificador de texto cuantizado a int8 y el tokenizador Gemma BPE empaquetado.

El modelo resuelve un problema muy concreto: recuperación imagen-texto (*image-text retrieval*) de baja latencia en dispositivos móviles. La arquitectura es de dos torres: una torre visual ViT-B/16 que convierte una imagen de 224×224 en un vector de 768 dimensiones y una torre de texto que convierte una consulta de hasta 64 tokens en otro vector de 768 dimensiones; la similitud coseno entre ambos ordena las fotos para una búsqueda dada.

Su relevancia es de nicho pero clara para quien construye aplicaciones de galería, archivo o catálogo offline: ofrece un pipeline completo (preprocesado documentado, tokenizador empaquetado, checksums SHA256 y licencia Apache 2.0 heredada) listo para descargar bajo demanda desde una app Android. Conviene tener presente que el repositorio no incluye evaluación propia, no declara parámetros y acumula cero descargas y cero *likes* en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos torres: ViT-B/16 visual + codificador de texto de la familia SigLIP 2, exportados a ONNX |
| Parametros totales | no disponible (la model card no los declara; el encoder visual es un ViT-B/16) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como en un LLM: entrada de texto fija de 64 tokens (`text` int32 [1, 64]) |
| Tipos de cuantizacion | fp32 en el encoder visual; int8 dinamica (MatMul, Gemm, Gather) en el encoder de texto via ONNX Runtime |
| Idiomas soportados | no disponible (tokenizador Gemma BPE; la model card no detalla cobertura linguistica) |
| Licencia | Apache 2.0 (hereda la del modelo original; incluye `LICENSE` y `NOTICE`) |
| Formato de pesos | ONNX (`visual.onnx`, `textual_int8.onnx`), tokenizador `gemma_bpe.bin` y `SHA256SUMS`; sin safetensors ni GGUF |
| Dimension del embedding | 768 (ambas torres, salida L2-normalizada) |
| Resolucion de entrada | 224x224 px, RGB, sin recorte, normalizacion `(x/255 - 0.5)/0.5`, formato CHW |
| Tamano del repositorio | 0,7 GB |
| Modelo base | `google/siglip2-base-patch16-224` (forma OpenCLIP: `timm/ViT-B-16-SigLIP2`) |

## Arquitectura y entrenamiento

El modelo original es SigLIP 2 en su variante base con parches de 16×16 y resolución 224, entrenada sobre WebLI. SigLIP 2 mantiene el esquema de dos torres con pérdida sigmoidea frente al contraste softmax de CLIP, y en esta conversión solo se exportan las dos torres de inferencia (visión y texto), no componentes auxiliares de entrenamiento. La torre de texto emplea un tokenizador Gemma BPE, tal y como confirma el fichero `gemma_bpe.bin` empaquetado a partir del `tokenizer.json` original.

No hay entrenamiento propio por parte del autor: el trabajo consiste en una cadena de conversión. Los pesos proceden de la exportación ONNX ya publicada por Immich (`immich-app/ViT-B-16-SigLIP2__webli`, commit `5f3fc29104ebcf51e9d893af57604badd51a3ea6`); el encoder visual se mantiene intacto en fp32, mientras que el encoder de texto se cuantiza dinámicamente a int8 en los operadores MatMul, Gemm y Gather con ONNX Runtime. Los scripts de conversión (`quantize_clip.py`, `pack_gemma_tokenizer.py`) están en el repositorio de Lumen, bajo `tools/models/`. La model card no documenta número de tokens de entrenamiento, composición del dataset ni etapas de RLHF/DPO, por lo que esos datos deben consultarse en la documentación de SigLIP 2.

El pipeline de preprocesado está explicitado y es parte crítica del uso correcto: para texto, minúsculas, eliminación de puntuación ASCII, colapso de espacios, conversión de espacios en `▁`, BPE sobre la cadena completa, añadido de `<eos>` (id 1) y *padding* con 0 hasta 64 tokens; para imagen, redimensionado directo a 224×224 sin recorte. Omitir cualquiera de estos pasos degrada la calidad de la recuperación.

## Capacidades

- Recuperación imagen-texto: genera embeddings de 768 dimensiones para imágenes y consultas, comparables por similitud coseno.
- Búsqueda semántica de fotos en lenguaje natural sobre bibliotecas locales, incluyendo consultas que no coinciden literalmente con nombres de fichero o metadatos.
- Clasificación Zero-shot de imágenes mediante prompts de texto, sin reentrenamiento.
- Agrupación y deduplicación de imágenes por proximidad en el espacio de embeddings.
- Etiquetado automático de bibliotecas fotográficas a partir de vocabularios de texto definidos por la aplicación.
- Ejecución totalmente offline: el modelo se descarga bajo demanda y la inferencia ocurre en el dispositivo.
- Integridad verificable: `SHA256SUMS` permite validar cada fichero tras la descarga.
- No soporta *tool calling*, agentes, razonamiento multi-paso, generación de texto libre, código, matemáticas, audio ni vídeo. Tampoco es un modelo de *thinking*: es un encoder de doble torre.

## Casos de uso

- Búsqueda semántica en galerías Android: la app indexa cada foto con `visual.onnx` y responde a consultas como "recibo del hotel" o "playa al atardecer" codificando el texto con `textual_int8.onnx` y ordenando por similitud coseno; el coste de 768 dimensiones por imagen hace viable un índice local en SQLite o similar.
- Archivado y gestión documental de fotos personales: agrupar capturas de pantalla, documentos escaneados y fotos por temática para facilitar el borrado selectivo o la exportación por carpetas.
- Aplicaciones de accesibilidad: permitir a usuarios con discapacidad visual localizar una foto concreta describiéndola oralmente, sin que la imagen salga del teléfono.
- Catálogos de producto offline: una app de inventario o comercio puede emparejar fotos tomadas en tienda con descripciones textuales del catálogo, con inferencia en el propio dispositivo y sin coste de API.
- Moderación y filtrado previo en el dispositivo: usar prompts de texto para puntuar imágenes y derivar casos dudosos a revisión, manteniendo el contenido sensible en local.
- Deduplicación y limpieza de bibliotecas: calcular embeddings de todo el corpus y agrupar por umbral de similitud para detectar ráfagas, duplicados y versiones recortadas de la misma foto.
- Indexación previa para RAG multimodal ligero: almacenar los vectores de 768 dimensiones y recuperar imágenes relevantes antes de pasarlas, si hiciera falta, a un modelo generativo en servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@k, mAP), ni evaluación de la pérdida de calidad introducida por la cuantización int8 del encoder de texto, ni latencias medidas en dispositivos Android concretos. Tampoco hay comparación con la exportación original de Immich. Cualquier cifra de rendimiento para este repositorio concreto debe medirse localmente.

## Requisitos de hardware

- VRAM/RAM estimada: no publicada. Como referencia de orden de magnitud, un encoder ViT-B/16 en fp32 ocupa del orden de 0,35-0,4 GB y el encoder de texto en int8 alrededor de 0,1 GB, lo que concuerda con un repositorio de 0,7 GB; son estimaciones, no datos de la model card.
- GPU de servidor: no es el objetivo del paquete; para lotes grandes en servidor conviene partir del checkpoint original o de la exportación de Immich y usar TensorRT, ONNX Runtime con CUDA o similar.
- GPU de consumo: cabe en cualquier GPU con 2 GB o más de VRAM para ejecución en fp32 del encoder visual; en la práctica está pensado para CPU móvil.
- Móvil: viable en Android con ONNX Runtime; la model card no especifica *execution providers* (NNAPI, XNNPACK, GPU delegate), por lo que el rendimiento real depende del integrador.
- Opciones de despliegue: ONNX Runtime (escritorio, servidor y móvil). vLLM, TGI, llama.cpp y Ollama no son aplicables a este formato y arquitectura; requeriría conversión previa a otro runtime.
- Latencia y throughput: no disponibles. Los formas de entrada fijas (lote 1, 64 tokens, 224×224) limitan el *batching* y simplifican el despliegue en móvil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `subhashhhhhh/lumen-siglip2-b16` (esta ficha) | no disponible | texto 64 tokens; imagen 224×224 | Apache 2.0 | ONNX en HF; 0 descargas, 0 likes |
| `google/siglip2-base-patch16-224` | no disponible en esta informacion | texto 64 tokens; imagen 224×224 | Apache 2.0 | Pesos originales en HF; ecosistema transformers |
| `immich-app/ViT-B-16-SigLIP2__webli` | no disponible en esta informacion | texto 64 tokens; imagen 224×224 | Apache 2.0 (heredada) | Exportación ONNX de referencia, sin cuantizar |
| `timm/ViT-B-16-SigLIP2` | no disponible en esta informacion | texto 64 tokens; imagen 224×224 | Apache 2.0 | Formato OpenCLIP para timm |

Las alternativas comparables son variantes del mismo modelo base; la diferencia práctica entre ellas es el formato, la cuantización y el empaquetado del tokenizador, no la calidad del embedding. Frente a CLIP ViT-B/32 o MobileCLIP no se dispone de datos en la información proporcionada para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Repositorio sin tracción ni validación externa: cero descargas y cero likes en el momento de la ficha, y ninguna evaluación publicada.
- Conversión no oficial: el autor no es Google ni Immich; los pesos pasan por dos conversiones encadenadas (Google → Immich → este repositorio), lo que añade superficie de error.
- Cuantización int8 del encoder de texto sin estudio de degradación: puede afectar al ranking en consultas ambiguas o largas, y no hay métricas para cuantificarlo.
- Ventana de texto muy corta (64 tokens) y preprocesado destructivo: minúsculas, eliminación de puntuación ASCII y truncado a 64 tokens limitan consultas largas y pueden perjudicar idiomas con diacríticos o escrituras no latinas. La cobertura lingüística no está declarada.
- Imagen redimensionada a 224×224 sin recorte: altera la relación de aspecto y penaliza detalles finos, texto pequeño en la imagen y fotos panorámicas.
- Formas de entrada fijas (lote 1): no apto para indexación masiva en servidor sin reexportar el grafo con dimensiones dinámicas.
- Riesgo de falsos positivos por similitud coseno: no hay umbral calibrado publicado; un umbral mal elegido devuelve resultados irrelevantes con puntuaciones altas.
- Solo recuperación: no genera descripciones ni respuestas; no debe presentarse como un modelo multimodal generativo.
- Licencia Apache 2.0 permite uso comercial, pero obliga a conservar `LICENSE` y `NOTICE` y a atribuir correctamente a Google y a Immich por la exportación intermedia.
- Los resultados de búsqueda web asociados a esta consulta no contenían información técnica relevante sobre el modelo y se han descartado por completo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/subhashhhhhh/lumen-siglip2-b16
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Forma OpenCLIP en timm: https://huggingface.co/timm/ViT-B-16-SigLIP2
- Exportación ONNX de referencia (Immich), commit `5f3fc29104ebcf51e9d893af57604badd51a3ea6`: https://huggingface.co/immich-app/ViT-B-16-SigLIP2__webli
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper y blog de SigLIP 2: no disponibles en la informacion proporcionada
- Repositorio de Lumen (scripts `tools/models/quantize_clip.py` y `tools/models/pack_gemma_tokenizer.py`): no disponible el enlace en la informacion proporcionada
- Demo: no disponible
