# xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-3bpw

## Resumen

SmolLM2-360M-Instruct-GLQ-trellis-3inst-3bpw es una cuantización extrema del modelo SmolLM2-360M-Instruct de Hugging Face, realizada por el usuario xv0y5ncu mediante GLQ (un framework de cuantización de pesos) con un codebook de tipo trellis (TCQ) a 3 bits por peso, en su variante lookup-free 3INST. El objetivo es reducir drásticamente el tamaño y el coste de inferencia de un modelo ya compacto (360M de parámetros) para permitir su ejecución en dispositivos con recursos muy limitados, como GPUs de consumo o incluso entornos embebidos. La cuantización no modifica la arquitectura del transformer original, solo los pesos, y está diseñada para funcionar con vLLM mediante el backend de cuantización GLQ.

Este modelo es relevante porque demuestra que es posible llevar un LLM instructivo de 360M a solo 0,2 GiB de pesos cargados (frente a los 0,7 GiB del original en bf16) manteniendo una calidad aceptable, aunque con una pérdida de perplexidad de ~11% en wikitext-2 respecto a la referencia. La cuantización a 3 bpw es el escalón más bajo de una escalera de cuatro rung (6, 5, 4 y 3 bpw) publicada por el autor, que permite elegir el punto de equilibrio entre tamaño, velocidad y degradación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2) |
| Parametros totales | 106.773.440 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 (2K) |
| Tipos de cuantizacion | 3 bits/peso (GLQ trellis TCQ, variante 3INST lookup-free) |
| Idiomas soportados | no especificado (el modelo base se entrenó principalmente en inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con cuantización GLQ) |

## Arquitectura y entrenamiento

El modelo base SmolLM2-360M-Instruct es un transformer decoder-only de 360M de parámetros, entrenado por HuggingFace sobre 4 billones de tokens con una mezcla de datasets como FineWeb-Edu, DCLM y The Stack. El proceso de alineamiento incluyó un paso de supervisión fina (SFT) con datos propios y de Argilla, y luego una optimización por preferencias directas (DPO) con UltraFeedback. El modelo instruct soporta tareas como reescritura de texto, resumen y function calling (aunque para la versión de 1.7B se menciona explícitamente; para la de 360M no se confirma).

La cuantización GLQ aplica un codebook de tipo trellis (TCQ) con 3 bits por peso, usando la variante 3INST lookup-free que no requiere tablas de búsqueda adicionales. Se aplicó una tasa uniforme en todas las capas, sin capas especiales. El proceso de cuantización se realizó con `glq-quantize` sobre 128 muestras de secuencia de 2048 tokens. La cuantización no cambia la arquitectura; solo comprime los pesos. El checkpoint se ha validado únicamente con vLLM (glq >= 0.8.8), no con el pipeline de Transformers.

## Capacidades

- Generación de texto y seguimiento de instrucciones: mantiene las capacidades de chat del modelo base.
- Razonamiento y conocimiento factual básico: el modelo base alcanzó un MMLU de 35 en la versión no cuantizada (según fuentes externas).
- Reescritura de texto y resumen de documentos (capacidades del modelo base instruct).
- Soporte de tool calling / function calling: no confirmado para esta variante de 360M; la documentación lo atribuye al modelo de 1.7B.
- Capacidades multilingües limitadas; el modelo base se centra en inglés, aunque puede producir texto en otros idiomas con menor calidad.
- No tiene capacidades de visión, audio ni pensamiento extendido.

## Casos de uso

- Asistentes conversacionales en dispositivos edge: con 0,2 GiB de pesos, el modelo puede ejecutarse en una Raspberry Pi con acelerador o en un smartphone con GPU, ofreciendo respuestas coherentes a preguntas simples.
- Generación de texto en tiempo real para aplicaciones de bajo consumo: el throughput de 6.650 tokens/s agregados (B=32) en una RTX PRO 6000 Blackwell permite generar respuestas casi instantáneas en servicios de chat.
- Preprocesamiento de texto en pipelines de datos: su baja huella de memoria permite desplegar múltiples instancias en una sola GPU para tareas de resumen o reescritura de párrafos.
- Aprendizaje por refuerzo con retroalimentación humana: al ser tan pequeño y rápido, sirve como modelo de recompensa o generador de respuestas en entornos de investigación con recursos limitados.
- Simulación de comportamiento en pruebas de integración: se puede usar como mock de un LLM más grande en entornos de desarrollo, por su baja latencia (TTFT de 16 ms) y facilidad de despliegue.
- Educación y prototipado: permite a desarrolladores experimentar con cuantización y despliegue de modelos en entornos académicos sin necesidad de hardware de alto rendimiento.

## Benchmarks y rendimiento

La model card de la cuantización no reporta resultados de benchmarks de tareas (MMLU, HumanEval, etc.). En su lugar, proporciona métricas de perplexity y velocidad medidas en una sesión con vLLM 0.27.1 en una RTX PRO 6000 Blackwell. Los valores de perplexity son teacher-forced wikitext-2 con seqlen 2048, y las velocidades corresponden a decode de 256 tokens.

| Métrica | Valor |
|---|---|
| Perplexity wikitext-2 (seqlen 2048) | 14.173 (frente a 12.735 del bf16) |
| SQNR promedio de pesos | 16.19 dB |
| Tiempo a primer token (TTFT) a B=1 | 16 ms |
| Throughput a B=1 | 294 tokens/s |
| Throughput agregado a B=32 | 6.650 tokens/s |

La pérdida de perplexity respecto al modelo bf16 es del +11.3%, lo que indica una degradación notable pero aún coherente en la generación de texto. No se ejecutaron evaluaciones de tareas a este tamaño de modelo, por lo que no hay datos comparables con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GiB (0,20 GiB de pesos cargados, más overhead de activaciones y KV cache). Con contexto de 2048 tokens, el uso total puede rondar los 0,5-1 GiB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM. Se ha validado en una RTX PRO 6000 Blackwell, pero debería funcionar en RTX 3060, RTX 4090 o incluso en iGPU con suficiente memoria.
- Cabe en GPU consumer: sí, es perfectamente viable para GPUs de gama media y baja.
- Opciones de despliegue: vLLM con `--quantization glq` (validado), y posiblemente llama.cpp si se convierte a GGUF, aunque no se ha probado. No se recomienda el pipeline de Transformers porque no está verificado.
- Latencia y throughput: TTFT de 16 ms a B=1, throughput de 294 tokens/s a B=1 y 6.650 tokens/s agregados a B=32 (medidos en la RTX PRO 6000). En GPUs más modestas estos valores serán menores.

## Comparativa con modelos similares

Se compara con las otras cuantizaciones de la misma familia (misma arquitectura y tamaño, diferentes bpw) y con el modelo original bf16.

| Modelo | Peso cargado | Perplexity wikitext-2 | SQNR | Throughput B=32 | Licencia |
|---|---|---|---|---|---|
| SmolLM2-360M-Instruct (bf16) | 0.72 GiB | 12.735 | — | — | Apache-2.0 |
| GLQ trellis 6 bpw | 0.31 GiB | 12.755 (+0.16%) | 33.20 dB | 4.466 tok/s | Apache-2.0 |
| GLQ trellis 5 bpw | 0.27 GiB | 12.834 (+0.78%) | 27.67 dB | 4.383 tok/s | Apache-2.0 |
| GLQ trellis 4 bpw | 0.24 GiB | 13.085 (+2.7%) | 22.04 dB | 6.478 tok/s | Apache-2.0 |
| GLQ trellis 3 bpw (este) | 0.20 GiB | 14.173 (+11.3%) | 16.19 dB | 6.650 tok/s | Apache-2.0 |

No hay comparación con otros modelos de tamaño similar como Qwen2.5-0.5B o TinyLlama-1.1B, porque no se dispone de datos de benchmarks en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bpw introduce una pérdida de perplexity del 11% en wikitext-2, lo que puede manifestarse en respuestas menos coherentes o con más alucinaciones en tareas complejas.
- No se han realizado evaluaciones de tareas (razonamiento, código, matemáticas) sobre esta cuantización, por lo que su rendimiento en esos dominios es desconocido.
- El modelo base tiene limitaciones propias de un modelo de 360M: conocimiento limitado, razonamiento básico y sensibilidad a sesgos del dataset.
- El checkpoint solo ha sido validado con vLLM; el uso con Transformers de HuggingFace no está probado y podría fallar.
- La variante 3INST lookup-free puede tener un comportamiento ligeramente distinto en la generación de tokens al comprimir los pesos con un codebook fijo.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar la documentación del modelo base para cualquier restricción adicional (no se han encontrado).
- El modelo no soporta function calling confirmado para la variante de 360M; si se necesita esa capacidad, se debe usar la versión de 1.7B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xv0y5ncu/SmolLM2-360M-Instruct-GLQ-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
- Repositorio de GLQ: https://github.com/cnygaard/glq
- Paper de SmolLM2: https://arxiv.org/abs/2502.02737
- Página de SmolLM2 en GitHub: https://github.com/huggingface/smollm
