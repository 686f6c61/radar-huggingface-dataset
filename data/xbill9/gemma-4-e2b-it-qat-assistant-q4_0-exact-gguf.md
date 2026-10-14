# xbill9/gemma-4-E2B-it-qat-assistant-q4_0-exact-gguf

## Resumen

Este repositorio contiene `gemma-4-E2B-it-qat-assistant-q4_0-exact.gguf`, una conversión no oficial a GGUF del modelo borrador (drafter) de decodificación especulativa que acompaña a Gemma 4 E2B-it QAT. No es un modelo de chat autónomo: es el "asistente" que propone tokens que después verifica un modelo objetivo Gemma 4 E2B-it QAT, de modo que solo tiene sentido desplegado en pareja con ese objetivo. Lo publica el usuario xbill9 de forma independiente a Google.

El borrador tiene 77.207.300 parámetros y una arquitectura deliberadamente pequeña: 4 capas transformer de anchura 256, de las cuales 3 usan atención de ventana deslizante y 1 atención completa, más dos proyecciones hacia el estado oculto de 1536 dimensiones del modelo objetivo. Todas las matrices de pesos se almacenan en Q4_0 sobre la misma rejilla que produjo el entrenamiento con conciencia de cuantización (QAT) de Google, lo que da un fichero de 59.236.000 bytes.

Su interés práctico está en el equilibrio entre tamaño, fidelidad y velocidad: frente al fichero Q8_0 que escribe el conversor de llama.cpp (97.836.704 bytes), ocupa un 39,4% menos, se desvía menos de los pesos bf16 originales y mantiene el mismo ratio de aceptación de tokens (0,475) y una velocidad prácticamente idéntica (151,1 tok/s frente a 150,1 tok/s en una RTX 3050).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer como modelo borrador de decodificación especulativa con predicción multi-token (MTP); 4 capas de anchura 256 (3 de atención de ventana deslizante, 1 de atención completa); solo consultas (Q), con claves y valores tomados de la caché del modelo objetivo |
| Parametros totales | 77.207.300 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la medición de referencia usa `-c 8192`; el contexto efectivo lo fija el modelo objetivo) |
| Tipos de cuantizacion | Q4_0 en todas las matrices de pesos (embedding, 4 x atención q/o, 4 x MLP gate/up/down y las dos proyecciones); normas y escalas en F32. Se compara en la propia ficha con el Q8_0 del conversor de llama.cpp |
| Idiomas soportados | no disponible (modelo solo texto; hereda el tokenizador del modelo base, con vocabulario de 262.144 tokens) |
| Licencia | Apache 2.0, sujeta además a los términos de licencia de Gemma 4 |
| Formato de pesos | GGUF (llama.cpp), con `general.file_type` fijado a Q4_0 |
| Modelo base | google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant (revisión `ebc7e1a`), relación: cuantizado |
| Tamano del fichero | 59.236.000 bytes (`gemma-4-E2B-it-qat-assistant-q4_0-exact.gguf`) |
| SHA-256 | `060f5a0158f8120d25137866b90e04e21cd0d2d23de1db7a9cc3b7f00e60bd11` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un borrador de decodificación especulativa, no un generador independiente. Consta de 4 capas transformer de anchura 256; tres de ellas emplean atención de ventana deslizante y una atención completa. El borrador calcula únicamente las consultas: las claves y los valores proceden de la caché del modelo objetivo, lo que reduce coste y memoria. Dos proyecciones conectan su espacio de 256 dimensiones con el estado oculto de 1536 dimensiones del objetivo, y la cabeza de salida es el embedding atado de 262.144 tokens. El checkpoint original fue entrenado por Google con cuantización con conciencia de entrenamiento (QAT).

Esta conversión concreta reconstruye la rejilla Q4_0 exacta que produjo el QAT: para cada bloque se recupera el paso entrenado (magnitud máxima dividida entre 8, 7, … 1, el que sitúe los 32 valores en un nivel entero), se refina por mínimos cuadrados y se guarda como escala de bloque en fp16. Según el autor, ningún bloque quedó fuera de la rejilla y entre el 96,5% y el 97,1% de los valores por tensor reproducen exactamente la fuente bf16 tras redondear de nuevo a bf16. Los metadatos (hiperparámetros, tokenizador, plantilla de chat) provienen del conversor de llama.cpp. El conversor descarta los centroides `masked_embedding` y el ordenamiento de tokens del checkpoint, de modo que llama.cpp puntúa el vocabulario completo. No hay información disponible sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- No genera respuestas por sí solo: produce tokens candidatos que el modelo objetivo verifica y acepta o descarta, por lo que la calidad final de la respuesta la determina el objetivo.
- Acelera la decodificación del objetivo: 1,40x medido sobre una RTX 3050 con 2 tokens borrador por paso, frente a 1,0x sin borrador.
- Modelo solo texto: no incorpora componentes de visión ni de audio.
- No dispone de tool calling, function calling ni capacidades de agente propias; los resultados de BFCL que se citan corresponden al modelo objetivo sirviendo con el borrador activo.
- Capacidades multilingües: no disponible.
- No tiene modo de razonamiento (thinking) propio ni decodificación especulativa interna adicional.
- Mantiene las respuestas greedy idénticas a las del objetivo sin borrador en las pruebas realizadas, salvo por el redondeo de la verificación por lotes.
- El repositorio incluye un directorio `evidence/` con el script de construcción (`gguf_exact.py`), su informe por tensor y la tabla por prompt de la prueba de velocidad, lo que permite auditar la cuantización.

## Casos de uso

- Servicio de inferencia de bajo coste en GPU de consumo: el par objetivo + borrador ocupa 2875 MiB con contexto de 8192, de modo que cabe en una GPU de 8 GB como la RTX 3050 y permite servir Gemma 4 E2B-it QAT con un 40% más de velocidad que sin borrador.
- Despliegue local o en el borde con llama.cpp: el comando documentado (`llama-server` con `-fa 1`, `--spec-type draft-mtp`, `-ngld all` y `--spec-draft-n-max 2`) arranca objetivo y borrador en una sola instancia, sin infraestructura de servido adicional.
- Autocompletado de código de baja latencia: al reducir el coste por token generado, el borrador resulta adecuado para completados cortos y frecuentes donde la latencia percibida importa más que la longitud de la respuesta.
- Asistentes conversacionales multi-turno: las pruebas con 8 peticiones concurrentes dan 0,9022 en GSM8K y 0,9225 en BFCL simple, lo que respalda su uso en backends de chat con varias sesiones simultáneas sin degradar la calidad respecto a servir sin borrador.
- Pipelines de evaluación y regresión de razonamiento matemático: los 1319 problemas de GSM8K se resolvieron a 151 tok/s de media en la GPU de prueba, lo que abarata las ejecuciones de evaluación repetidas.
- Validación de herramientas y function calling en producción: con 400 llamadas de BFCL simple la precisión se mantiene en 0,9225, igual que con el borrador Q8_0, así que puede integrarse en flujos donde el objetivo emite llamadas estructuradas.
- Auditoría y reproducibilidad de cuantizaciones: el script incluido y la fidelidad de 29,4% de pesos idénticos bit a bit (decuantizados a fp32) sirven para verificar pipelines de cuantización QAT frente a los pesos bf16 de referencia.
- Investigación en decodificación especulativa y predicción multi-token: es un artefacto pequeño (59,2 MB) y bien documentado para medir aceptación de borradores a distintas precisiones sin necesidad de grandes clústeres.
- Reducción de coste energético y por token en servidores con muchas peticiones concurrentes: al pasar de 108,2 tok/s a 151,1 tok/s en el mismo hardware, se reduce el tiempo de GPU por respuesta servida.

## Benchmarks y rendimiento

Calidad con el borrador sirviendo, objetivo E2B, llama.cpp `77c4540ce`, 8 peticiones simultáneas, greedy, 2 tokens borrador:

| Prueba | Sin borrador | Borrador Q8_0 | Este borrador |
|---|---:|---:|---:|
| GSM8K, 1319 problemas | 0,8976 | 0,8992 | 0,9022 |
| BFCL simple, 400 llamadas de herramienta | 0,9250 | 0,9225 | 0,9225 |
| Tokens borrador aceptados (concurrencia) | — | 0,7974 | 0,7972 |

Velocidad y memoria, RTX 3050 OEM (8 GB), llama.cpp `77c4540ce`, atención flash, caché KV en f16, seis prompts (código, chat, relato, explicación, datos, resumen), 256 tokens, greedy, mediana de tres ejecuciones, media geométrica entre prompts:

| Configuración | Tokens/s | Aceleración | Tokens aceptados |
|---|---:|---:|---:|
| Sin borrador (solo objetivo) | 108,2 | 1,00x | — |
| Borrador bf16 sin cuantizar | 133,1 | 1,23x | 0,475 |
| Borrador Q8_0 del conversor | 150,1 | 1,39x | 0,475 |
| Este borrador Q4_0 | 151,1 | 1,40x | 0,475 |

Fidelidad y memoria frente al Q8_0:

| Métrica | Q8_0 (conversor de llama.cpp) | Este GGUF |
|---|---:|---:|
| Tamaño de fichero | 97.836.704 B | 59.236.000 B |
| Error relativo frente a los pesos bf16 de Google | 0,00494 | 0,00138 |
| Pesos idénticos bit a bit (decuantizados, fp32) | 11,7% | 29,4% |
| VRAM, objetivo + borrador, `-c 8192` | 2915 MiB | 2875 MiB |

El autor indica que, emparejando sobre los mismos problemas, el intervalo bootstrap del 95% para la diferencia de cada brazo con borrador respecto a no usar borrador incluye el cero.

## Requisitos de hardware

- VRAM estimada para inferencia: 2875 MiB para el conjunto objetivo + borrador con contexto de 8192; el fichero del borrador por sí solo ocupa 59,2 MB.
- GPU recomendada y probada: RTX 3050 OEM de 8 GB. No se han publicado mediciones en A100, H100, RTX 4090 u otras GPU.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 8 GB de VRAM para el par completo en la configuración medida.
- Opciones de despliegue: llama.cpp / `llama-server` con soporte de MTP para Gemma 4. Se probó con el build `77c4540ce` y requiere una versión que incluya el soporte MTP (issue/PR `#23398`, junio de 2026, según la ficha).
- Comando de referencia: `llama-server -m <objetivo E2B QAT Q4_0>.gguf -ngl 99 -fa 1 -md gemma-4-E2B-it-qat-assistant-q4_0-exact.gguf --spec-type draft-mtp -ngld all --spec-draft-n-max 2`.
- Latencia y throughput medidos: 151,1 tok/s de media geométrica en RTX 3050 con 2 tokens borrador por paso, frente a 108,2 tok/s del objetivo solo.
- Compatibilidad con vLLM, TGI, Ollama u otros motores: no disponible.
- El borrador debe emparejarse con un objetivo Gemma 4 E2B-it QAT de la misma precisión Q4_0; la propia ficha de Google indica que el borrador ha de coincidir con la precisión QAT del objetivo.

## Comparativa con modelos similares

No se dispone de datos de otros borradores de terceros (EAGLE, Medusa u otros) en la información proporcionada. La comparación posible es entre las tres precisiones del mismo borrador y el objetivo sin asistencia:

| Versión | Tamaño | Error relativo vs bf16 | Pesos idénticos (fp32) | Velocidad (RTX 3050) | VRAM (objetivo + borrador, -c 8192) |
|---|---:|---:|---:|---:|---:|
| Este GGUF Q4_0 | 59.236.000 B | 0,00138 | 29,4% | 151,1 tok/s (1,40x) | 2875 MiB |
| Q8_0 del conversor de llama.cpp | 97.836.704 B | 0,00494 | 11,7% | 150,1 tok/s (1,39x) | 2915 MiB |
| Borrador bf16 sin cuantizar (Google) | no disponible | 0 (referencia) | 100% (referencia) | 133,1 tok/s (1,23x) | no disponible |
| Objetivo E2B QAT Q4_0 sin borrador | no disponible | no aplica | no aplica | 108,2 tok/s (1,00x) | no disponible |

Modelos comparables de otros autores: no disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: sin un objetivo Gemma 4 E2B-it QAT emparejado no produce respuestas útiles. No debe evaluarse como modelo de chat.
- Build no oficial, publicada por un tercero (xbill9) al margen de Google; no cuenta con soporte ni garantías del fabricante del modelo base.
- Dependencia de versión: exige un llama.cpp con soporte de MTP para Gemma 4 (build `77c4540ce` o equivalente). En versiones anteriores el borrador no funcionará.
- La licencia declarada es Apache 2.0, pero el enlace de licencia del repositorio apunta a los términos de Gemma 4 (`https://ai.google.dev/gemma/docs/gemma_4_license`). Conviene revisar ambas antes de un uso comercial.
- Solo texto: sin visión ni audio, por lo que no sirve para cargas multimodales.
- El conversor de llama.cpp omite los centroides `masked_embedding` y el ordenamiento de tokens del checkpoint original; llama.cpp puntúa el vocabulario completo de 262.144 tokens, lo que puede alterar ligeramente el comportamiento respecto a la implementación de referencia.
- El borrador no cambia las respuestas greedy salvo por el redondeo en la verificación por lotes, pero las diferencias medidas en GSM8K y BFCL tienen intervalos de confianza del 95% que incluyen el cero: no hay evidencia de mejora de calidad, solo de velocidad.
- Idiomas soportados no documentados; se hereda el tokenizador del modelo base, pero el repositorio no enumera idiomas.
- Datos de benchmarks limitados a GSM8K y BFCL simple, sobre una única GPU (RTX 3050 OEM de 8 GB) y un único build de llama.cpp; la extrapolación a otros hardware y contextos no está respaldada por mediciones.
- Repositorio sin tracción: 0 descargas y 0 likes, creado el 2026-10-14, por lo que no existe validación independiente de las cifras declaradas.
- Riesgo de alucinación y sesgos: no se han publicado análisis específicos para este borrador; al delegar la generación en el objetivo, hereda los del modelo objetivo Gemma 4 E2B-it QAT.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-assistant-q4_0-exact-gguf
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-unquantized-assistant
- Objetivo recomendado por el autor (GGUF Q4_0): https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-exact-gguf
- Objetivo GGUF de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-q4_0-gguf
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Soporte MTP para Gemma 4 en llama.cpp: PR/issue `#23398` (junio de 2026), referencia citada en la model card
- Model card original de Google conservada en el repositorio: `ORIGINAL_README.md`
- Script de construcción y evidencias: directorio `evidence/` del repositorio (`gguf_exact.py`, informe por tensor y tabla de velocidad por prompt)
