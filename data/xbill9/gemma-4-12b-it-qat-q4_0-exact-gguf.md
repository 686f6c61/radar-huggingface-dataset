# xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf

## Resumen

Esta ficha describe `xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf`, una conversión no oficial a GGUF de llama.cpp del modelo Gemma 4 12B-it de Google, en su variante entrenada con quantisation-aware training (QAT) y cuantizada a 4 bits. El autor, xbill9, publica el modelo de forma independiente a Google. El objetivo es preservar exactamente la rejilla de cuantización de 4 bits que produjo el entrenamiento QAT de Google: cada matriz de pesos, incluida la tabla de embeddings, se almacena como Q4_0 con la escala entrenada por bloque, en lugar del paso estándar de llama.cpp.

El modelo resuelve un problema concreto de fidelidad: los GGUF Q4_0 convencionales recalculan la escala de cada bloque a partir de la magnitud máxima, lo que desplaza valores fuera de la rejilla sobre la que se entrenó el modelo QAT. Esta build recupera el paso entrenado por bloque y reduce la divergencia respecto al modelo bf16. El resultado es un fichero de 6,72 GB que cabe en una GPU de 8 GB con todas las capas en VRAM y permite hasta 40.960 tokens de contexto con caché KV en f16 en una RTX 3050.

El modelo es solo de texto: la torre de visión vive en un `mmproj` separado que no se incluye. Tiene 11.907.350.576 parámetros totales (aproximadamente 12B) y licencia Apache 2.0, aunque el enlace de licencia apunta a los términos de Gemma 4 de Google.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Gemma 4), con 8 capas de atención completa y 40 capas de ventana deslizante |
| Parámetros totales | 11.907.350.576 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 40.960 tokens con caché KV f16 en 8 GB; hasta 131.072 tokens con caché KV q4_0; hasta 81.920 con drafter y caché q4_0 |
| Tipos de cuantización | Q4_0 (todos los pesos, incluida la tabla de embeddings); normas, escalas y frecuencias RoPE en F32; caché KV configurable en f16, q8_0 o q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 4 12B-it, un transformer denso de aproximadamente 12.000 millones de parámetros. La estructura descrita en la model card indica 48 capas en total: 8 capas de atención completa y 40 capas de ventana deslizante. Las 8 capas de atención completa no tienen matriz de valor (v), como en el modelo fuente. El modelo base fue entrenado por Google con quantisation-aware training sobre una rejilla de 4 bits: en cada bloque de 32 valores, cada valor es una escala de bloque multiplicada por un entero entre -8 y 7. Esa restricción se aplica también a la tabla de embeddings.

La aportación técnica de esta build no está en el entrenamiento, sino en la conversión. El autor reconstruyó las 328 matrices de capa (atención q/k/v/o y MLP gate/up/down) y la tabla de embeddings desde `google/gemma-4-12B-it-qat-q4_0-unquantized` en la revisión `b6ed862`, almacenándolas como Q4_0. La diferencia clave es que recupera el paso entrenado de cada bloque en lugar de usar el paso estándar de llama.cpp (magnitud máxima del bloque dividida por 8). Los metadatos (tokenizador, plantilla de chat, hiperparámetros y orden de tensores) se copiaron byte a byte del GGUF de Google en la revisión `29d0977`. Las normas, escalas y frecuencias RoPE se copiaron sin cambios en F32.

## Capacidades

- Generación de texto conversacional e instrucciones, en el pipeline `text-generation` con etiqueta `conversational`.
- Razonamiento y respuesta a instrucciones en modo chat, con la plantilla de chat de Gemma 4 copiada del GGUF oficial.
- Solo texto: no incluye capacidades de visión, ya que el `mmproj` de Google no está incluido en el repositorio.
- Soporte de decodificación especulativa mediante un drafter Q4_0 separado (`xbill9/gemma-4-12B-it-qat-assistant-q4_0-exact-gguf`), que eleva la generación a 56 tok/s en RTX 3050.
- Evaluado por el autor en GSM8K, BFCL simple y recuperación de códigos en documentos largos, con resultados estables entre cachés KV f16, q8_0 y q4_0.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling y function calling: no disponible en la información proporcionada, aunque BFCL simple se usa como prueba de referencia.

## Casos de uso

- Despliegue local en GPU de 8 GB: el modelo cabe completo en VRAM en una RTX 3050 con 6.390 MiB de pesos y deja espacio para caché KV, lo que permite ejecutar un modelo de 12B en hardware de gama de entrada sin descargar capas a CPU.
- Asistentes conversacionales de contexto largo: con 40.960 tokens en caché f16 o hasta 131.072 con caché q4_0, se pueden mantener conversaciones multi-turno o procesar documentos extensos sin truncar.
- Procesamiento de documentos largos con recuperación de información: el autor verifica la recuperación de códigos distribuidos a lo largo de un documento largo, lo que lo hace adecuado para tareas de extracción sobre textos extensos.
- Razonamiento matemático en local: los resultados estables en GSM8K entre configuraciones de caché permiten usar el modelo para resolución de problemas aritméticos en entornos sin conexión.
- Inferencia de baja latencia con decodificación especulativa: combinado con el drafter Q4_0, alcanza 56 tok/s en RTX 3050 y 55,1 tok/s sin contexto, lo que sirve para aplicaciones interactivas en tiempo real.
- Integración en pipelines llama.cpp: al ser un GGUF compatible con `llama-server`, `llama-bench` y `llama-perplexity`, se puede desplegar con `-ngl 99 -fa 1` en servidores o estaciones de trabajo con CUDA.
- Evaluación de fidelidad de cuantización: sirve como referencia para estudiar el impacto de preservar la rejilla QAT frente a la cuantización post-entrenamiento estándar, con métricas de divergencia KL y perplejidad publicadas.

## Benchmarks y rendimiento

| Métrica (CPU, wikitext-2, 16 chunks de 512 tokens) | GGUF Q4_0 de Google | Esta build |
|---|---:|---:|
| Divergencia KL media respecto a bf16 | 0,543225 ± 0,019046 | 0,124504 ± 0,009525 |
| Percentil 99 de divergencia KL | 6,217015 | 1,914886 |
| Mismo token top que bf16 | 71,77 ± 0,71 % | 89,14 ± 0,49 % |
| Perplejidad relativa a bf16 | 1,3855 ± 0,0449 | 1,2567 ± 0,0248 |
| Tamaño de fichero | 6.975.879.296 B | 6.716.356.736 B |
| Pesos en VRAM | 6.637,69 MiB | 6.390,19 MiB |
| Contexto máximo en 8 GB con KV f16 | 28.672 tokens | 40.960 tokens |

| Rendimiento en RTX 3050 OEM (8 GB) | GGUF de Google | Esta build |
|---|---:|---:|
| Generación, 128 tokens | 27,68 tok/s | 28,64 tok/s (1,035x) |
| Procesamiento de prompt, 512 tokens | 979,7 tok/s | 987,2 tok/s (1,008x) |

| Contexto máximo con `llama-server -ngl 99 -fa 1` en RTX 3050 8 GB | f16 KV | q8_0 KV | q4_0 KV |
|---|---:|---:|---:|
| Esta build | 40.960 | 65.536 | 131.072 |
| Esta build + drafter Q4_0 | 24.576 | 49.152 | 81.920 (7.853 MiB) |
| GGUF de Google | 28.672 | no probado | no probado |

Con drafter y caché q4_0, la generación es de 55,1 / 42,4 / 37,8 / 30,8 tok/s con 0 / 16k / 32k / 65k tokens en contexto (0,85x respecto a f16 a 16k). Sin drafter: 28,6 / 26,8 / 26,3 tok/s con 0 / 8.192 / 16.384 tokens en contexto. El autor advierte que estas cifras deben compararse entre columnas del mismo test y no con las de otros modelos, ya que el modelo de 12B instruction-tuned lee texto crudo de Wikipedia con dificultad (perplejidad bf16 de 312, frente a 40 de E4B en el mismo test).

## Requisitos de hardware

- VRAM estimada: 6.390,19 MiB de pesos en VRAM con todas las capas en GPU; el resto se destina a caché KV (16 KiB por token para las 8 capas de atención completa más 480 MiB fijos para las 40 capas de ventana deslizante en f16).
- GPU recomendadas: RTX 3050 OEM de 8 GB verificada por el autor; cualquier GPU con 8 GB o más y soporte CUDA puede ejecutarlo. Para contexto largo con caché q4_0 se recomienda más de 8 GB.
- Cabe en GPU consumer: sí, en una RTX 3050 de 8 GB con todas las capas en GPU, siempre que la tarjeta esté inactiva (quedan 370–640 MiB libres).
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-bench`, `llama-perplexity`); probado con la build `7182ef71e`.
- Latencia y throughput: 28,64 tok/s de generación y 987,2 tok/s de procesamiento de prompt en RTX 3050 sin drafter; 56 tok/s con el drafter Q4_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto máximo (8 GB, KV f16) | Divergencia KL media vs bf16 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Esta build (xbill9, exact Q4_0) | 11,9B | 40.960 | 0,124504 | Apache 2.0 | GGUF en HF |
| `google/gemma-4-12B-it-qat-q4_0-gguf` | 11,9B | 28.672 | 0,543225 | Apache 2.0 / Gemma 4 | GGUF en HF |
| `xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf` | no disponible (E4B) | no disponible | 0,0010 (en el mismo test) | Apache 2.0 | GGUF en HF |
| `xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf` | no disponible (E2B) | no disponible | no disponible | Apache 2.0 | GGUF en HF |

## Limitaciones y advertencias

- Build no oficial: hecha y publicada de forma independiente a Google; no cuenta con el respaldo del desarrollador original.
- Solo texto: no incluye visión; el `mmproj` de Google no está en el repositorio.
- El modelo de 12B instruction-tuned rinde mal sobre texto crudo de Wikipedia (perplejidad bf16 de 312), por lo que las métricas de divergencia y perplejidad del autor deben interpretarse solo en comparación interna entre las dos columnas, no frente a otros modelos.
- La tarjeta gráfica debe estar inactiva para las cifras de contexto publicadas: quedan solo 370–640 MiB libres en la RTX 3050.
- Idiomas soportados no disponibles en la información proporcionada.
- Riesgo de alucinación y sesgos: no disponible en la información proporcionada.
- Restricciones de licencia: la licencia declarada es Apache 2.0, pero el enlace de licencia apunta a los términos de Gemma 4 de Google; conviene revisar las condiciones de uso comercial de Gemma 4 antes de producción.
- El rendimiento con drafter reduce el contexto máximo disponible (24.576 tokens con KV f16 frente a 40.960 sin drafter).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xbill9/gemma-4-12B-it-qat-q4_0-exact-gguf
- Modelo base: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-unquantized
- GGUF oficial de Google: https://huggingface.co/google/gemma-4-12B-it-qat-q4_0-gguf
- Drafter Q4_0: https://huggingface.co/xbill9/gemma-4-12B-it-qat-assistant-q4_0-exact-gguf
- Variante E2B: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf
- Variante E4B: https://huggingface.co/xbill9/gemma-4-E4B-it-qat-q4_0-exact-gguf
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Informe de benchmarks de caché KV: https://github.com/xbill9/gemma4-dev/blob/main/local-llamacpp-3050oem-12b-q4_0/benchmarks/runs/2026-10-17-kvcache-12b-3050oem/REPORT.md
