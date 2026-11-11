# yunyu1258/minicpm-ocr-1.0-ax650

## Resumen

MiniCPM-OCR 1.0 AX650 es un paquete de despliegue del modelo de visión-lenguaje openbmb/MiniCPM-OCR-1.0 (1.300 millones de parámetros, orientado a OCR y parsing de documentos) convertido para ejecutarse sobre la NPU AX650 de AXERA mediante el runtime `axllm`, compatible con la API HTTP de OpenAI. No es un modelo nuevo ni un fine-tuning: es una conversión comunitaria de los pesos originales a formato `.axmodel` para inferencia en hardware de borde, publicada por el usuario yunyu1258.

El paquete resuelve un problema concreto: llevar un VLM de OCR de 1,3 B parámetros a un SoC NPU de bajo consumo (AX650N, 8 núcleos, 3,8 GB de DDR) sin GPU dedicada, manteniendo fidelidad de reconocimiento verificable contra la referencia de Hugging Face. Incluye el codificador visual compilado en U16, las 24 capas del LLM en formato híbrido Qwen3.5 y el tokenizer exportado, todo cargado por mmap con un consumo de CMM de aproximadamente 1,4 GB.

Es relevante para quienes necesitan OCR local en dispositivos empotrados (lectores de documentos, digitalización en el borde, pipelines sin conectividad) y quieren una referencia reproducible de conversión a NPU. La licencia del paquete es Apache-2.0, heredada del modelo base, con el runtime `axllm` bajo BSD-3-Clause de AXERA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLM encoder-decoder: codificador visual (448×448 → 256 image embeds) + LLM híbrido Qwen3.5 de 24 capas |
| Parametros totales | 1.300 millones (1.30 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 2048 tokens (bucket de contexto del runtime); prefill bucket 1152 |
| Tipos de cuantizacion | Activaciones U16 en el codificador visual; INT8 descartado por pérdida de precisión (cosine 0.311); pesos del LLM en `.axmodel` por capa, embeddings en bfloat16 |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 (modelo base y conversión); runtime `axllm` BSD-3-Clause |
| Formato de pesos | `.axmodel` (AXERA), `model.embed_tokens.weight.bfloat16.bin`, tokenizer `.txt` |
| Tamano del paquete | ~2,5 GB en disco; ~1,4 GB de CMM en carga |
| Hardware objetivo | NPU AX650 / AX650N (aarch64) |
| Resolucion de vision | 448×448 por slice; `scale_resolution=448`, `patch_size=14`, `downsample_mode=4x` |
| Maximo de slices | 9 (`max_slice_nums=9`) |

## Arquitectura y entrenamiento

El modelo base MiniCPM-OCR-1.0 es un VLM de 1,30 B parámetros que combina un codificador visual con un LLM. En esta conversión, el codificador visual procesa imágenes de 448×448 y produce `[1, 256, 1024]` embeddings de imagen; el LLM es un transformer híbrido etiquetado como Qwen3.5, con 24 capas exportadas individualmente a `.axmodel` más una capa final (final norm + lm_head) de 277 MB. El vocabulario tiene 248.100 entradas de 1.024 dimensiones en bfloat16, con los pesos de embedding atados al lm_head.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, la composición del corpus ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable de este paquete no está en el modelo sino en la conversión: el codificador visual debe compilarse con activaciones U16 mediante Pulsar2 6.0, ya que Pulsar2 7.0/8.0 falla con un crash nativo en la fase `build op serially` al compilar grafos U16 completos, y la variante INT8 degrada el codificador hasta hacerlo inútil (cosine 0.311 frente a 0.9953 en U16). El procesado de imagen replica el `MiniCPMOcrImageProcessor` oficial con segmentación en slices y coincide con él con una diferencia de 0 px por slice.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de extremo a extremo sobre imágenes de documentos.
- Parsing de documentos estructurados: reconocimiento de tablas (prompt específico "Table Recognition"), fórmulas ("Formula Recognition") y texto corrido ("Text Recognition").
- Procesamiento por slices de una página completa: una página de 2000×3083 se divide en 9 slices (1 global de 364×560 y 8 de 504×392), generando 2.276 image tokens y 9.104 patches.
- Generación de texto y respuesta conversacional básica a través de la API `/v1/chat/completions` compatible con OpenAI (entrada de imagen como data URI en `image_url`).
- Soporte bilingüe inglés y chino.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni razonamiento multi-paso.

## Casos de uso

- Digitalización de documentos en el borde: despliegue del paquete en un dispositivo AX650N sin GPU para convertir páginas escaneadas en texto estructurado, con un coste aproximado de 2,5 minutos por página en modo de 9 slices.
- Extracción de tablas de informes y facturas: el prompt de "Table Recognition" sobre un slice de 448×448 produce salida con similitud de caracteres 1.0 frente a la referencia de Hugging Face y precisión numérica de 12/12 en las pruebas del autor.
- Reconocimiento de fórmulas matemáticas en apuntes y artículos: el prompt de "Formula Recognition" procesa cada slice de forma independiente, adecuado para digitalizar documentación técnica.
- Procesamiento por lotes en dispositivos empotrados: el codificador visual tarda 615 ms por imagen de 448×448 y el decode ronda los 10 tok/s, lo que permite integrar el modelo en flujos de captura continua con cámara.
- Servicio HTTP local compatible con OpenAI: el runtime `axllm serve` expone `/v1/chat/completions`, de modo que clientes existentes que usen la API de OpenAI pueden apuntar al dispositivo sin cambios de código.
- Investigación y evaluación de conversiones a NPU: el paquete sirve como referencia reproducible (con repositorio de conversión y documento `docs/accuracy.md`) para estudiar el impacto de U16 frente a INT8 en codificadores visuales.
- Digitalización de archivos en chino e inglés: el soporte bilingüe cubre los dos idiomas declarados, útil para fondos documentales mixtos.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Tiempo por slice 448×448 (tabla) | 12,2–22 s | 277 prompt tokens / 237 tokens generados |
| Throughput de decode | ~10 tok/s | AX650N, 8 núcleos |
| Codificación visual 448×448 → 256 tokens | 615 ms | Codificador U16 |
| Texto "1+1" | 0,6 s | Prueba mínima de texto |
| Página completa en modo 9 slices | ~2,5 min/página | Referencia oficial de 2.276 tokens |
| Página de 12 slices (medición local) | 130–160 s | Medición del autor |
| Fidelidad del codificador visual (U16) | cosine 0.9953 | Frente a referencia ONNX |
| Fidelidad del codificador visual (INT8) | cosine 0.311 | No utilizable |
| Similitud de texto OCR (bloque de tabla) | 1.0 | Frente a referencia HF |
| Precisión numérica (bloque de tabla) | 12/12 | Frente a referencia HF |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- NPU AX650 / AX650N (aarch64). No es ejecutable en GPU convencional ni en CPU x86 con este paquete.
- Memoria: ~2,5 GB de almacenamiento para el paquete y ~1,4 GB de CMM reservada; el autor prueba con 3,8 GB de DDR y CMM configurada a 4.096 MB.
- Despliegue mediante el binario `axllm` incluido (2,5 MB), lanzado con `LD_LIBRARY_PATH=/opt/lib:/opt/bin:$PWD/bin ./bin/axllm serve . --port 18081`.
- No aplica despliegue con vLLM, llama.cpp, Ollama ni TGI: el formato `.axmodel` es específico de AXERA.
- Latencia: 615 ms de codificación visual por slice, decode de ~10 tok/s, 12,2–22 s por slice completo y ~2,5 min por página en modo de 9 slices.
- Compilación del codificador: requiere Pulsar2 6.0 con activaciones U16; versiones 7.0/8.0 no son válidas para este grafo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 AX650 (este paquete) | 1,30 B | 2048 tokens | NPU AX650 | Apache-2.0 (runtime BSD-3-Clause) | Hugging Face, conversión comunitaria |
| openbmb/MiniCPM-OCR-1.0 | 1,30 B | no disponible | GPU/CPU genérica | Apache-2.0 | Hugging Face, oficial |
| MiniCPM-V 4.6 (runtime `axllm` de origen) | no disponible | no disponible | NPU AX650 | no disponible | Paquete oficial AXERA |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una publicación oficial de AXERA ni de OpenBMB; no hay garantía de soporte ni de mantenimiento.
- El codificador visual solo es funcional con activaciones U16 compiladas con Pulsar2 6.0; las versiones 7.0 y 8.0 provocan un crash nativo y la variante INT8 inutiliza el modelo (cosine 0.311).
- El contexto es de 2.048 tokens y el bucket de prefill de 1.152, lo que limita la longitud de las respuestas y obliga a procesar páginas por slices.
- El modo de página completa con el slice global de baja resolución tiende a alucinar; el autor recomienda omitirlo y procesar cada slice con su prompt específico.
- Solo cubre inglés y chino; no hay soporte declarado de otros idiomas.
- Riesgo de alucinación inherente a los VLM en regiones de imagen de baja calidad o texto poco legible; no se documentan evaluaciones de sesgo.
- El rendimiento es bajo en términos absolutos (~10 tok/s de decode, ~2,5 min por página), adecuado para procesamiento por lotes pero no para interacción en tiempo real.
- La licencia Apache-2.0 permite uso comercial, pero debe respetarse también la licencia del modelo base y la BSD-3-Clause del runtime `axllm`.
- El repositorio de conversión se anuncia con URL provisional ("以最终发布为准"), por lo que puede cambiar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunyu1258/minicpm-ocr-1.0-ax650
- Modelo base: https://huggingface.co/openbmb/MiniCPM-OCR-1.0
- Repositorio de conversión y despliegue: https://github.com/yuyun2000/minicpm-ocr-ax650
