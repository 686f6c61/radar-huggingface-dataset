# StillDeadcode/minicpm5-2b-iq8r

## Resumen

MiniCPM5-2B IQ8R + DSpark es un contenedor de pesos cuantizados del modelo MiniCPM5-2B de OpenBMB, empaquetado en un único fichero `.rad` (3,04 GiB) para el motor de inferencia radiance, orientado a GPUs AMD con arquitectura RDNA4 y ROCm. Lo publica el desarrollador independiente StillDeadcode y sustituye a su contenedor anterior en FP8 (`minicpm5-2b-fp8`), ofreciendo la misma anchura de 8 bits por peso pero con menor divergencia respecto al modelo en bf16 y un rendimiento ligeramente superior.

El contenedor integra además el modelo borrador MiniCPM5-2B-DSpark (5 capas, tamaño de bloque 7) para decodificación especulativa, de modo que el usuario obtiene en un solo artefacto tanto el modelo objetivo como el especulador, ambos cuantizados. La cuantización emplea el esquema propietario IQ8R: códigos int8 con escala u8 por fila y una segunda escala bf16 cada 256 elementos de K, con rotación Hadamard no normalizada cada 128 elementos de K y redondeo al más cercano. Las activaciones también se cuantizan a int8 bajo la misma rotación (W8A8).

Es relevante porque demuestra una ruta de despliegue de un modelo de 2B con contexto de 131.072 tokens sobre hardware AMD de consumo y profesional, con decodificación especulativa y caché KV en int8, algo poco habitual en el ecosistema dominado por CUDA. La ficha se centra en el artefacto cuantizado; los detalles de entrenamiento del modelo base no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base MiniCPM5-2B); contenedor con decodificador especulativo DSpark de 5 capas |
| Parámetros totales | no disponible (modelo base de 2B; el artefacto añade el borrador DSpark) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | IQ8R: pesos int8 (códigos −127..127) con escala u8 por fila y bf16 cada 256 de K, rotación Hadamard cada 128 de K; activaciones int8 (W8A8); lm_head int8 con escala bf16 por fila cada 128; embeddings y normas en bf16; cabeza del vocabulario del especulador en códigos de 2 bits |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | apache-2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance); 3,04 GiB |

## Arquitectura y entrenamiento

El modelo base es MiniCPM5-2B, un transformer de aproximadamente 2.000 millones de parámetros con longitud de contexto entrenada de 131.072 tokens y capacidades multimodales limitadas a texto en este contenedor (la model card indica "Modalities: text"). Sobre él se integra MiniCPM5-2B-DSpark, un modelo borrador de 5 capas con tamaño de bloque 7 para decodificación especulativa, cuantizado con el mismo esquema IQ8R salvo su cabeza de vocabulario, que se almacena con códigos de 2 bits y escala u8 por grupo de 128 con escala f16.

La innovación técnica del artefacto es el esquema de cuantización IQ8R combinado con rotación Hadamard. Cada matriz lineal se cuantiza con códigos int8 simétricos, una escala u8 por fila y una segunda escala bf16 cada 256 elementos de la dimensión K, aplicando antes una transformada Hadamard rápida no normalizada (fwht128) sobre bloques de 128 elementos de K. Las activaciones se cuantizan a int8 bajo la misma rotación, lo que permite una multiplicación W8A8 coherente. El resultado declarado es una divergencia KL media de 0,0103 respecto a la distribución del contenedor bf16 del mismo modelo, frente a 0,0688 del contenedor FP8 anterior, sobre 82.066 posiciones de texto mixto. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto en inglés y chino.
- Decodificación especulativa integrada mediante el borrador DSpark (acepta entre 8,7 y 9,1 tokens redactados por paso sobre 24 prompts de chat).
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Soporte de tool calling y salida estructurada (structured output) según la model card del contenedor.
- Caché KV en int8 (`kv-cache-dtype: i8`) para reducir huella de memoria en contextos largos.
- Contexto largo de hasta 131.072 tokens.
- Capacidades de razonamiento, código y matemáticas: no disponibles en la información proporcionada.
- Capacidades de visión o audio: no disponibles (el contenedor declara únicamente texto).

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens de ventana, el modelo puede mantener conversaciones multi-turno extensas o procesar documentos completos sin truncar, usando la caché KV en int8 para contener el consumo de memoria.
- Despliegue en hardware AMD RDNA4: el contenedor está pensado para el motor radiance sobre ROCm y GPUs como la Radeon AI PRO R9700 (gfx1201), lo que permite servir el modelo en estaciones de trabajo AMD sin depender de CUDA.
- Generación de código en pipelines: el soporte de tool calling y salida estructurada permite integrarlo en flujos de CI/CD o asistentes de IDE que necesitan invocar funciones y devolver JSON validado.
- Atención al cliente automatizada: el servidor compatible con la API de OpenAI facilita sustituir backends existentes sin reescribir la capa de aplicación, y la decodificación especulativa reduce la latencia percibida en respuestas cortas.
- Procesamiento de documentos bilingües inglés-chino: el modelo cubre ambos idiomas, útil para resumen, extracción y clasificación de textos en entornos con documentación mixta.
- Inferencia de bajo coste en producción: con 3,04 GiB de pesos y cuantización W8A8, el modelo cabe en GPUs de gama media y permite mayor densidad de secuencias concurrentes (la model card reporta latencias de 6,87 ms y 7,92 ms por paso especulativo con 1 y 4 secuencias concurrentes).
- Entornos de investigación sobre cuantización: el recetario (`minicpm5-2b-iq8r.recipe`) y las métricas de divergencia KL publicadas permiten reproducir y comparar esquemas de cuantización sobre el mismo modelo base.

## Benchmarks y rendimiento

La información proporcionada no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K). Sí incluye métricas de calidad de cuantización y latencia:

| Métrica | Este contenedor (IQ8R) | minicpm5-2b-fp8 |
|---|---|---|
| KLD media vs. bf16 (82.066 posiciones) | 0,0103 | 0,0688 |
| Acuerdo top-1 vs. bf16 | 97,3 % | 91,7 % |
| KLD con caché KV en int8/fp8 | 0,0113 (i8) | 0,0837 (fp8) |
| Paso especulativo, 1 secuencia (ms) | 6,87 | 7,14 |
| Paso especulativo, 4 secuencias (ms) | 7,92 | 8,17 |
| Tokens redactados aceptados por paso | 8,7–9,1 | 8,7–9,1 |
| Paso de decodificación sin borrador (ms) | 5,17 | 5,40 |

Medido en una Radeon AI PRO R9700 (gfx1201) con caché KV en bf16 salvo donde se indica.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,04 GiB de pesos más la caché KV; con 131.072 tokens de contexto y caché KV en int8 el consumo adicional depende de la configuración de `max-model-len` y `max-num-seqs`, no disponible con precisión.
- GPU recomendadas: Radeon AI PRO R9700 (gfx1201), arquitectura RDNA4; probado con una y dos tarjetas (`tp: 2` divide el modelo entre dos GPUs).
- Compatibilidad con GPUs de consumo: no confirmada en la información proporcionada; el motor radiance está orientado a RDNA4 y ROCm, por lo que requiere hardware AMD compatible.
- Opciones de despliegue: motor radiance (compilado desde main posterior a la versión 1.17.0, ya que IQ8R con escala cada 256 de K y la caché KV int8 no están en 1.17.0). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,17 ms por paso de decodificación sin borrador y 6,87 ms por paso especulativo con una secuencia en una R9700; 7,92 ms con cuatro secuencias concurrentes.
- Requisito de software: ROCm y compilación específica del motor radiance; el servidor expone la API de OpenAI.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM5-2B IQ8R + DSpark (este) | ~2B + borrador | 131.072 | IQ8R W8A8, KV int8 | apache-2.0 | Contenedor `.rad` para radiance (AMD RDNA4) |
| MiniCPM5-2B bf16 (StillDeadcode) | ~2B | 131.072 | bf16 | apache-2.0 | Contenedor `.rad` para radiance |
| MiniCPM5-2B FP8 (StillDeadcode) | ~2B | 131.072 | FP8, KV fp8 | apache-2.0 | Contenedor `.rad` para radiance |
| MiniCPM5-2B (OpenBMB) | ~2B | 131.072 | pesos originales | apache-2.0 | Hugging Face (modelo base) |

No se dispone de datos de benchmarks estándar para comparar el rendimiento de tarea con modelos de otros autores; la comparación disponible se limita a variantes del mismo modelo base y a métricas de fidelidad de cuantización y latencia.

## Limitaciones y advertencias

- El artefacto solo es utilizable con el motor radiance compilado desde main posterior a la versión 1.17.0; no funciona con versiones anteriores ni con otros motores de inferencia habituales.
- Requiere hardware AMD RDNA4 y ROCm; no hay soporte declarado para CUDA ni para GPUs de otros fabricantes.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está documentado.
- El modelo base es de 2B parámetros, por lo que su capacidad de razonamiento complejo y conocimiento factual es limitada en comparación con modelos mayores; riesgo de alucinación inherente no cuantificado en la información disponible.
- La cuantización int8 introduce una divergencia respecto a bf16 (KLD 0,0103, acuerdo top-1 del 97,3 %); en tareas sensibles a la distribución exacta de probabilidades puede ser relevante.
- La decodificación especulativa depende del borrador DSpark integrado; desactivarla (`num-speculative-tokens: 0`) aumenta la latencia por paso.
- No se han publicado datos sobre sesgos del modelo base ni sobre evaluación de seguridad en la información proporcionada.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base OpenBMB y de los pesos originales antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/StillDeadcode/minicpm5-2b-iq8r
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo borrador: https://huggingface.co/openbmb/MiniCPM5-2B-DSpark
- Contenedor FP8 previo: https://huggingface.co/StillDeadcode/minicpm5-2b-fp8
- Contenedor bf16: https://huggingface.co/StillDeadcode/minicpm5-2b-bf16
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Tokenizer del modelo base: https://huggingface.co/openbmb/MiniCPM5-2B/tokenizer.json
