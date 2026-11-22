# subhashhhhhh/lumen-siglip2-b16

## Resumen

Lumen SigLIP2 B/16 es una conversión del modelo vision-lenguaje SigLIP 2 ViT-B/16 de Google (variante de 224 px entrenada sobre WebLI), empaquetada específicamente para su ejecución en dispositivos Android dentro de la aplicación Lumen, una galería local-first. El autor, subhashhhhhh, no entrena ningún modelo nuevo: parte de los pesos originales de `google/siglip2-base-patch16-224` y de la exportación ONNX realizada por Immich, y produce artefactos optimizados (ONNX en fp32 e int8, TFLite para LiteRT) que permiten búsqueda foto-texto totalmente offline en el teléfono.

El modelo resuelve el problema de la recuperación imagen-texto en el borde: dado un texto en lenguaje natural, ranking de fotos por similitud coseno en un espacio compartido de 768 dimensiones. La relevancia actual reside en que demuestra un pipeline completo de despliegue móvil de un modelo SigLIP 2, con cuantización int8 del codificador de texto, exportación a LiteRT con atención fusionada y un vocabulario precomputado de 4.227 palabras cotidianas para evitar ejecutar el codificador de texto miles de veces en el dispositivo.

Arquitectónicamente es un par de codificadores transformer (visión ViT-B/16 y texto) al estilo CLIP/SigLIP, con contexto de texto fijo de 64 tokens y entrada de imagen de 224×224. El repositorio ocupa 1,0 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Par de codificadores transformer (ViT-B/16 para visión y codificador de texto SigLIP 2), espacio de embedding compartido de 768 dimensiones |
| Parametros totales | no disponible (el modelo base es ViT-B/16; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 64 tokens de texto (padding fijo); imagen de entrada 224×224 px |
| Tipos de cuantizacion | fp32 (visual.onnx, visual.tflite) e int8 dinámica en MatMul, Gemm y Gather (textual_int8.onnx); vectores del vocabulario en fp16 |
| Idiomas soportados | no disponible (el tokenizador es Gemma BPE; la model card no declara cobertura idiomática) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (visual.onnx fp32, textual_int8.onnx int8), TFLite/LiteRT (visual.tflite), tokenizador empaquetado en `gemma_bpe.bin`, vocabulario en `vocabulary.bin` |

## Arquitectura y entrenamiento

El modelo es una conversión, no un entrenamiento propio. La base es SigLIP 2 ViT-B/16 a 224 px entrenado por Google sobre WebLI, con la conocida función de pérdida sigmoidea de SigLIP en lugar de softmax contrastivo. El repositorio contiene dos codificadores: uno visual (ViT-B/16, entrada `[1, 3, 224, 224]`, salida de 768 dimensiones) y uno textual (entrada `[1, 64]` de tokens int32, salida de 768 dimensiones). Ambos se L2-normalizan y se comparan por similitud coseno.

La innovación técnica está en el proceso de conversión y despliegue. El `visual.tflite` se exportó desde los pesos OpenCLIP con `litert-torch`, manteniendo las atención como operaciones fusionadas `odml.scaled_dot_product_attention` y las remodelaciones en 4-D para que el modelo completo se ejecute en GPUs móviles; según el autor, coincide con el original a coseno 1.00000. Se advierte explícitamente de que la GPU debe ejecutarse en fp32 porque fp16 desborda en este modelo. El codificador de texto se cuantizó dinámicamente a int8 con ONNX Runtime. Además, se incluye un vocabulario precomputado (`vocabulary.bin`, formato `LUMV` versión 1) con 4.227 palabras de la lista de etiquetas de Recognize Anything, cada una con su vector de texto en fp16 generado con el tokenizador y el codificador del propio repositorio, de modo que las búsquedas en el dispositivo coinciden exactamente con las del modelo. Los scripts de conversión (`quantize_clip.py`, `pack_gemma_tokenizer.py`, `export_siglip_litert.py`) están en el repositorio de Lumen, en `tools/models/`.

## Capacidades

- Recuperación imagen-texto (image-text retrieval) mediante similitud coseno en un espacio compartido de 768 dimensiones.
- Codificación de imágenes a 224×224 px con normalización `(x / 255 - 0.5) / 0.5` en formato CHW.
- Codificación de texto con tokenizador Gemma BPE, minúsculas, eliminación de puntuación ASCII, colapso de espacios y token `<eos>` final, con padding a 64 tokens.
- Búsqueda de fotos por consultas en lenguaje natural en local, sin conexión a red.
- Etiquetado rápido de fotos mediante el vocabulario precomputado de 4.227 palabras (por ejemplo, "tennis player", "race track", "cat") sin ejecutar el codificador de texto en cada consulta.
- Ejecución en GPU o CPU móvil mediante LiteRT, con exportación ONNX alternativa para usuarios de ONNX Runtime.
- Verificación de integridad de los ficheros descargados mediante `SHA256SUMS`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, visión generativa ni modo thinking: es exclusivamente un modelo de embeddings.

## Casos de uso

- Búsqueda de fotos en galerías Android: la aplicación indexa las imágenes con `visual.tflite` y responde a consultas textuales comparando embeddings; encaja porque todo el cálculo ocurre en el dispositivo y no requiere subir fotos a la nube.
- Etiquetado automático de fotos: usando `vocabulary.bin`, la app puede asignar etiquetas cotidianas ("cat", "race track") a cada imagen comparando su embedding con los 4.227 vectores precomputados, sin coste de inferencia textual repetida.
- Organización de álbumes por contenido: agrupar fotos por similitud visual o por coincidencia con categorías del vocabulario para generar colecciones automáticas.
- Filtrado y búsqueda en aplicaciones de notas o documentos escaneados: cualquier app Android que necesite recuperación imagen-texto puede reutilizar los artefactos ONNX/TFLite con el mismo preprocesado documentado.
- Despliegue en servidores ligeros con ONNX Runtime: `visual.onnx` (fp32) y `textual_int8.onnx` permiten montar un servicio de búsqueda multimodal de bajo coste sin dependencias de frameworks de inferencia pesados.
- Investigación y evaluación de SigLIP 2 en el borde: sirve como referencia reproducible de cuantización int8 del codificador de texto y de exportación LiteRT con atención fusionada para comparar latencia y fidelidad frente al modelo original.
- Integración en pipelines de privacidad por diseño: aplicaciones que exigen que ningún dato biométrico o fotográfico salga del dispositivo pueden usar estos ficheros como componente de búsqueda local verificable por checksum.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara que el `visual.tflite` coincide con el original a coseno 1.00000, sin tablas de MMLU, HumanEval, GSM8K ni métricas de recuperación (Recall@K) sobre conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el modelo está pensado para ejecución en dispositivo móvil, no para GPU de escritorio.
- GPU recomendadas: no disponible; el caso objetivo son GPUs móviles compatibles con LiteRT, con fallback a CPU.
- Cabe en GPU de consumo: sí, por tamaño (ViT-B/16 y codificador de texto de 64 tokens), aunque el autor no publica cifras de VRAM para RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT (GPU o CPU) para `visual.tflite`; ONNX Runtime para `visual.onnx` y `textual_int8.onnx`. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. Se advierte de que la GPU debe ejecutarse en fp32 porque fp16 desborda en este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Lumen SigLIP2 B/16 (este repo) | no disponible (base ViT-B/16) | 64 tokens de texto; imagen 224×224 | Apache 2.0 | Hugging Face, 784 descargas | Conversión ONNX/TFLite para Android, int8 en texto, vocabulario precomputado |
| google/siglip2-base-patch16-224 | no disponible (ViT-B/16) | 64 tokens de texto; imagen 224×224 | Apache 2.0 | Hugging Face (modelo base) | Pesos originales en formato transformers; sin optimización móvil |
| immich-app/ViT-B-16-SigLIP2__webli | no disponible (ViT-B/16) | 64 tokens de texto; imagen 224×224 | no disponible en la información | Hugging Face | Exportación ONNX de referencia usada como base por este repositorio |
| timm/ViT-B-16-SigLIP2 | no disponible (ViT-B/16) | 64 tokens de texto; imagen 224×224 | no disponible en la información | Hugging Face | Forma OpenCLIP de los pesos originales |

## Limitaciones y advertencias

- Es un modelo de recuperación imagen-texto, no un modelo generativo: no produce texto, código ni respuestas conversacionales.
- El contexto de texto está limitado a 64 tokens con padding fijo; consultas más largas se truncan o degradan.
- La imagen se redimensiona a 224×224 sin recorte, lo que puede perder detalle en fotos con objetos pequeños o relaciones espaciales complejas.
- El preprocesado textual es específico (minúsculas, sin puntuación ASCII, espacios como `▁`, `<eos>` final); desviarse de él rompe la coincidencia con los embeddings del vocabulario.
- La GPU móvil debe ejecutar en fp32: fp16 desborda en este modelo, lo que limita optimizaciones de memoria y velocidad.
- Los vectores de `vocabulary.bin` se generaron en un teléfono con el tokenizador y codificador de este repositorio; solo son válidos con ese pipeline exacto.
- No se declaran idiomas soportados ni sesgos conocidos; al derivar de WebLI, hereda los sesgos del corpus original de Google.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos en la recuperación: la similitud coseno puede ordenar fotos irrelevantes como relevantes.
- La licencia Apache 2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE`, incluida la atribución a Recognize Anything por la lista de etiquetas.
- El autor no publica métricas de calidad de recuperación ni latencia; para producción conviene validar Recall@K en el dominio propio antes de confiar en el ranking.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/subhashhhhhh/lumen-siglip2-b16
- Modelo base: https://huggingface.co/google/siglip2-base-patch16-224
- Forma OpenCLIP: https://huggingface.co/timm/ViT-B-16-SigLIP2
- Exportación ONNX de Immich: https://huggingface.co/immich-app/ViT-B-16-SigLIP2__webli
- Scripts de conversión: en el repositorio de Lumen, ruta `tools/models/` (no se proporciona URL directa en la información disponible)
