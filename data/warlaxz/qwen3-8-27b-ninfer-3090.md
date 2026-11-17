# WarlaxZ/Qwen3.8-27B-NInfer-3090

## Resumen
Qwen3.8-27B-NInfer-3090 es un artefacto de pesos cuantizados del modelo multimodal Qwen3.8-27B (27.000 millones de parámetros) de Alibaba Qwen, convertido al formato propietario `.ninfer` por el fork de NInfer para RTX 3090 mantenido en `ashalliants/ninfer-3090` y publicado por el usuario WarlaxZ. No es un checkpoint de Transformers, ni una distribución de safetensors, ni un GGUF: requiere los ejecutables de ese fork concreto para cargarse.

El problema que resuelve es el despliegue de un modelo multimodal de 27B en una única GPU de consumo de 24 GB (RTX 3090), algo imposible con precisión completa. El artefacto ocupa 17,68 GiB (18.979.828.480 bytes) frente a los 20.437.521.664 bytes del artefacto upstream, gracias a un esquema de cuantización mixta (4/5/6 bits) con búsqueda de escalas guiada por una matriz de importancia (imatrix) y escalas con signo.

La revisión del 16 de noviembre de 2026 recoloca los bytes de 5 bits en las capas donde el error ponderado por imatrix es mayor (capas 23, 24 y 30 en lugar de 0–35), reduciendo la divergencia KL un 9% aproximado respecto a la primera revisión con el mismo tamaño de archivo. La licencia declarada es Apache 2.0 y el pipeline es image-text-to-text.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForCausalLM` (transformer multimodal con componentes de visión, MTP, DFlash2 y cabeza de propuesta) |
| Parametros totales | 27.000 millones (según nombre del modelo base; no se detalla desglose) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la cabeza de propuesta tiene 131.072 filas) |
| Tipos de cuantizacion | Mixta: embeddings 4 bits, cabeza de salida 6 bits, Q4 en query/key/gate/up, Q5 en value/z/gate/down/output; proyecciones de salida de atención y GDN y down de MLP en 4 bits en capas tempranas y 5 bits desde capas 23/24/30 |
| Idiomas soportados | no disponible (el corpus de evaluación incluye wikipedia en/zh, arXiv, GitHub y chat) |
| Licencia | apache-2.0 |
| Formato de pesos | `.ninfer` (contenedor versión 3, 1.190 objetos: 1.184 tensores y 6 recursos) |

## Arquitectura y entrenamiento
El modelo base Qwen3.8-27B emplea la arquitectura `Qwen3_5ForCausalLM`, un transformer multimodal que integra un componente de visión junto al decodificador de texto. El artefacto incluye además componentes MTP (multi-token prediction), DFlash2 y una cabeza de propuesta de 131.072 filas, presumiblemente para decodificación especulativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

La innovación técnica relevante está en la codificación de pesos, no en el entrenamiento. El codificador `grouped_search` busca la escala FP16 de cada grupo de 64 pesos sobre 50 candidatos, eligiendo la que minimiza el error cuadrático ponderado por importancia (media cuadrática de activaciones de entrada por canal, es decir, una imatrix). Las escalas pueden ser negativas, lo que permite usar el rango completo de códigos (−8 para Q4, −16 para Q5). La revisión del 16-11-2026 mueve los bytes de 5 bits a las capas 23, 24 y 30 (salida de atención, salida GDN y down de MLP) en lugar de las capas 0–35, manteniendo el mismo recuento de bytes y reduciendo la KL en torno al 9%. El repositorio incluye el informe de conversión (`qwen3_8_27b.ninfer.conversion.json`) y la imatrix (`qwen3_8_27b.imatrix.safetensors`) para poder reconstruir el artefacto.

## Capacidades
- Generación de texto y razonamiento conversacional multi-turno.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con componente de visión incluido en el artefacto.
- Decodificación especulativa mediante MTP, DFlash2 y cabeza de propuesta de 131.072 filas, orientada a acelerar la generación.
- Capacidades multilingües: el corpus de evaluación incluye wikipedia en inglés y chino, aunque no se declara una lista formal de idiomas.
- No se documenta soporte explícito de tool calling, function calling ni comportamiento de agente multi-paso en la información disponible.
- No se documentan modos especiales (thinking, audio) más allá de la multimodalidad imagen-texto.

## Casos de uso
- Asistente multimodal local en estación de trabajo con una RTX 3090: el artefacto de 17,68 GiB cabe en 24 GB de VRAM y permite conversaciones imagen-texto sin depender de la nube, con la ventaja de privacidad y coste cero por token.
- Análisis de documentos escaneados y capturas: al aceptar entrada de imagen y texto, puede extraer y razonar sobre contenido visual en flujos de digitalización, con la ventaja de ejecutarse íntegramente en local.
- Generación asistida por decodificación especulativa: los componentes MTP y DFlash2 permiten acelerar la decodificación en escenarios de chat interactivo, donde la latencia por token es crítica.
- Prototipado e investigación en cuantización: el repositorio incluye imatrix, informe de conversión y mediciones de perplejidad y KL, lo que lo convierte en un banco de pruebas reproducible para estudiar codificadores de cuantización mixta.
- Evaluación comparativa de motores de inferencia: al existir un artefacto upstream equivalente (`neroued/Qwen3.8-27B-NInfer`), sirve para medir diferencias de calidad (perplejidad, KL) y velocidad entre codificaciones sobre el mismo hardware.
- Despliegue en entornos Windows con CUDA 12.8: las mediciones del autor se hicieron en esa configuración, por lo que es un caso realista para equipos de desarrollo con GPU consumer y sistema Windows.
- Sustitución de un modelo de 27B en precisión reducida en pipelines existentes de NInfer, siempre que se actualice a la versión del fork que soporta la ruta MLP down de 4 bits.

## Benchmarks y rendimiento
Calidad medida con `ninfer-perplexity --quick --kv-dtype int8`:

| Corpus | Upstream | Primera revisión | Esta revisión | Cambio vs upstream |
|---|---:|---:|---:|---:|
| `perplexity-1m` (heredado) | 4,3428 | 4,3025 | 4,3014 | −0,95% |
| `perplexity-heldout-2026-09` (wikipedia en/zh, arXiv, GitHub, código propio, chat) | 4,3396 | 4,3169 | 4,3224 | −0,40% |

Divergencia KL frente al GGUF Q8_0 de Unsloth en el corpus held-out (8 × 4096 tokens por flujo, llama.cpp b11316 con pesos NInfer exportados bit a bit a bloques Q8_0):

| Pesos | KLD media |
|---|---:|
| Codificación y layout upstream | 0,0376 |
| Layout de la primera revisión con embedding de 6 bits | 0,0304 |
| Primera revisión (embedding de 4 bits) | 0,0318 |
| **Esta revisión** (embedding 4 bits, Q5 desde capas 23, 24 y 30) | **0,0288** |
| Unsloth UD-Q4_K_XL (formatos llama.cpp, 17,56 GB de pesos de texto) | 0,0156 |

El autor reporta hasta 2,1× la velocidad de decodificación frente a llama.cpp en una RTX 3090, y mejoras de prefill y decodificación en turnos de agente con NInfer-3090 v0.15.1, aunque las cifras concretas de tokens por segundo no se detallan en la información disponible.

## Requisitos de hardware
- VRAM estimada: el artefacto pesa 17,68 GiB, por lo que requiere al menos 24 GB de VRAM para cargar pesos y dejar margen para caché KV (medido con `--kv-dtype int8`).
- GPU recomendada: RTX 3090 (24 GB) es el objetivo declarado y probado; no se documentan otras GPU.
- Cabe en GPU consumer: sí, en RTX 3090; no se confirma compatibilidad con GPU de 16 GB o menos.
- Despliegue: exclusivamente mediante los ejecutables del fork `ashalliants/ninfer-3090`; NInfer upstream y builds antiguos del fork lo rechazan al arrancar por falta de la ruta MLP down de 4 bits.
- Entorno probado: RTX 3090, CUDA 12.8, Windows.
- Latencia y throughput: hasta 2,1× la velocidad de decodificación de llama.cpp según el autor; no se publican tokens/s absolutos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WarlaxZ/Qwen3.8-27B-NInfer-3090 | 27B | no disponible | `.ninfer` (17,68 GiB) | Apache 2.0 | Hugging Face, requiere fork ninfer-3090 |
| neroued/Qwen3.8-27B-NInfer (upstream) | 27B | no disponible | `.ninfer` (20.437.521.664 bytes) | Apache 2.0 | Hugging Face, NInfer upstream |
| Unsloth UD-Q4_K_XL (formato llama.cpp) | 27B | no disponible | GGUF (17,56 GB de pesos de texto) | Apache 2.0 (heredada) | Hugging Face, llama.cpp |

En calidad medida por KL frente a Q8_0, el formato GGUF de llama.cpp (0,0156) supera a esta codificación (0,0288), mientras que esta revisión mejora al artefacto upstream de NInfer (0,0376). No se dispone de comparación con otros modelos de 27B en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información proporcionada.

## Limitaciones y advertencias
- No es un checkpoint estándar: no funciona con Transformers, safetensors ni llama.cpp; exige los binarios del fork `ashalliants/ninfer-3090` en una versión que soporte la ruta MLP down de 4 bits.
- La cuantización introduce pérdida de calidad: la KL media (0,0288) es casi el doble que la del GGUF Q4_K_XL de Unsloth (0,0156), con degradación concentrada en wikipedia en chino (perplejidad de 9,14 a 9,27) y en chat.
- El embedding de 4 bits empeora chino (KL 0,0794 → 0,0859) y chat (0,0355 → 0,0373) frente a un embedding de 6 bits, según las mediciones del autor.
- Riesgo de alucinación inherente a un modelo de 27B cuantizado a 4/5 bits; no se documentan evaluaciones de factualidad.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no se declara lista oficial; la evaluación sugiere mejor comportamiento en inglés que en chino bajo esta cuantización.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia del fork de inferencia puede condicionar el despliegue en producción (soporte, mantenimiento y compatibilidad futura no garantizados).
- El artefacto se actualizó el 2026-11-16 y los scripts `download-model` de versiones anteriores descargan la revisión antigua por pin, lo que puede provocar inconsistencias si no se fija la revisión.
- Solo 4 likes y 58.151 descargas en el momento de la consulta; comunidad pequeña y validación externa limitada.

## Enlaces
- Hugging Face: https://huggingface.co/WarlaxZ/Qwen3.8-27B-NInfer-3090
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artefacto upstream: https://huggingface.co/neroued/Qwen3.8-27B-NInfer
- Repositorio del fork: https://github.com/ashalliants/ninfer-3090
- Pull request de la revisión: https://github.com/ashalliants/ninfer-3090/pull/445
