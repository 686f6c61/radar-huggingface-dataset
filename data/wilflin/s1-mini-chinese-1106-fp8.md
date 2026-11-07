# WIlfLin/S1-mini-Chinese-1106-FP8

## Resumen

S1-mini-Chinese-1106-FP8 es una versión cuantizada en FP8 del modelo S1-mini-Chinese-1106-BF16, un ajuste fino en chino del S1-mini desarrollado originalmente por Superwhisper. No es un modelo de propósito general ni un reconocedor de audio: está especializado en la normalización y postprocesado de transcripciones generadas por Qwen3-ASR, incluyendo texto en chino y casos de code-switching chino-inglés. La arquitectura subyacente es Qwen3-0.6B, con 751.632.384 parámetros totales según los pesos en safetensors.

El modelo resuelve un problema muy concreto de los pipelines de ASR: convertir transcripciones en bruto (sin puntuación fiable, con números mal formateados, nombres propios inconsistentes o cambios de idioma mezclados) en texto limpio, puntuado, con listas numeradas y saltos de línea correctos. Para ello se apoya en un system prompt y unas líneas de control específicas definidas en la model card del modelo base BF16.

Esta variante FP8 emplea cuantización post-entrenamiento (PTQ) con pesos E4M3 por canal y activaciones BF16, validada en la ruta Marlin W8A16 de vLLM. Es relevante porque reduce el peso de los ficheros a aproximadamente 1,064 GB y permite servir el modelo con menor huella de memoria sin degradar de forma significativa las métricas de regresión publicadas por el autor, aunque no debe confundirse con un modelo W8A8 nativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Qwen3-0.6B (arquitectura Qwen3) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el ejemplo de servicio de vLLM usa `--max-model-len 2048`) |
| Tipos de cuantizacion | FP8 E4M3 por canal en pesos (W8A16 con activaciones BF16 vía Marlin); KV cache, embeddings, lm_head y normalizaciones en BF16 |
| Idiomas soportados | zh, en (incluye code-switching chino-inglés) |
| Licencia | s1-mini-license (licencia "other"; conserva LICENSE y NOTICE originales de S1-mini by Superwhisper) |
| Formato de pesos | safetensors con layout `compressed-tensors` |

## Arquitectura y entrenamiento

El modelo parte de S1-mini (Superwhisper), cuya arquitectura subyacente es Qwen3-0.6B, un transformer decoder-only. Sobre esa base se realizó un ajuste fino de continuación con entrenamiento de todos los parámetros sobre datos en chino, dando lugar a la versión BF16 S1-mini-Chinese-1106-BF16. Según la model card, ese entrenamiento incluyó repetición de combinaciones numéricas, restricciones de consistencia frente a un profesor FP32 de confianza y entrenamiento con margen de puntuación sobre caracteres críticos. Los detalles completos se remiten a `training-provenance.json`, `data-provenance.json` y a la model card del modelo BF16.

Esta variante FP8 aplica cuantización post-entrenamiento, sin entrenamiento de cuantización adicional. Los pesos se almacenan en E4M3 por canal y las activaciones se mantienen en BF16 (W8A16) mediante el kernel Marlin de vLLM. La configuración declara simultáneamente `rope_theta=1000000` y `rope_parameters.rope_theta=1000000` para compatibilidad con la carga de codificación posicional en Transformers 4 y 5. El autor advierte que no todos los tensores son de baja precisión: la KV cache, los embeddings, el lm_head y las normalizaciones no cuantizadas permanecen en BF16, por lo que el vocabulario grande conservado en BF16 impide asumir una compresión global de 4x. La calibración se realizó únicamente con muestras de entrenamiento y no se publican datos, grabaciones privadas ni historiales de usuario.

## Capacidades

- Normalización de transcripciones ASR en chino y en mezclas chino-inglés, con generación propia de puntuación, numeración y saltos de línea.
- Formateo condicionado por líneas de control: `Structure: prose` para texto corrido y `Structure: lists` para listas explícitas.
- Normalización de números y cantidades en contexto, incluyendo operadores aritméticos y cifras dentro de frases.
- Tratamiento de nombres propios chinos y de términos inventados o poco frecuentes (拼读, lectura/escritura de caracteres).
- Manejo de code-switching chino-inglés dentro de una misma transcripción.
- Generación de texto conversacional básico (pipeline `text-generation`, tags `conversational`), aunque no es su función principal.
- No es un modelo de audio: no transcribe voz, solo postprocesa texto ya transcrito.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- El autor recomienda desactivar el modo thinking en las peticiones.

## Casos de uso

- Postprocesado de transcripciones de Qwen3-ASR en producción: el modelo recibe el texto bruto del ASR y devuelve una versión puntuada y estructurada, con la ventana de 2048 tokens empleada en los ejemplos de servicio, suficiente para segmentos de transcripción habituales.
- Subtitulado y actas de reuniones en chino: convierte diálogos sin puntuación en párrafos legibles o listas de acuerdos usando `Structure: prose` o `Structure: lists` según el tramo.
- Normalización de cifras en dominios sensibles (importes, fechas, cantidades): el modelo fue entrenado con repetición de combinaciones numéricas y pruebas específicas de contexto numérico, lo que lo hace adecuado para pipelines donde el formato de las cifras importa.
- Limpieza de nombres propios en transcripciones de atención al cliente: dispone de pruebas de regresión específicas de nombres chinos (60/60 en la suite del autor) para estandarizar cómo aparecen los nombres en el texto final.
- Tratamiento de grabaciones con mezcla de idiomas: al soportar code-switching zh-en, puede usarse en entornos bilingües donde el ASR produce segmentos mezclados que requieren un formateo coherente.
- Despliegue en infraestructura con memoria limitada: al ocupar los pesos alrededor de 1,064 GB en FP8, puede servirse con vLLM en GPUs de gama profesional o consumer con suficiente VRAM, reduciendo el coste frente a la versión BF16.
- Integración en pipelines de accesibilidad: generación de transcripciones legibles para vídeos o podcasts en chino, con detección de truncamiento y gestión de errores a cargo de la aplicación, tal como indica el autor.

## Benchmarks y rendimiento

El autor publica una regresión comparativa entre la versión BF16 y esta versión FP8, ejecutada con la misma configuración de vLLM (lotes de 64, concurrencia máxima 8, máximo 256 tokens generados). La comparación léxica elimina caracteres no alfanuméricos pero conserva mayúsculas y dígitos.

| Prueba | BF16 | FP8 |
|---|---:|---:|
| Núcleo de lectura/escritura de caracteres | 8/8 | 8/8 |
| Capacidades básicas | 46/48 | 46/48 |
| Formato y números | 20/20 | 20/20 |
| Nombres chinos | 60/60 | 60/60 |
| Lectura/escritura en contexto | 318/326 | 318/326 |
| Términos inventados | 196/200 | 197/200 |
| Matemáticas básicas | 235/236 | 235/236 |
| Contexto numérico A | 414/432 | 414/432 |
| Contexto numérico B | 430/432 | 429/432 |
| Texto de fuentes públicas | 234/400 | 233/400 |

CER léxico sobre texto público: 9,2367 % en BF16 y 9,3685 % en esta versión FP8. El autor indica además una comprobación puntual de 5/5 en requisitos de saltos de línea, contenido de nombres, operadores de expresiones y nuevos errores numéricos. Estas cifras son pruebas de desarrollo y regresión del propio autor, no una evaluación ciega independiente, ni una medida de corrección semántica humana, ni una reproducción del 94,8 % de precisión por token del modelo original.

## Requisitos de hardware

- VRAM estimada: los pesos suman aproximadamente 1,064 GB; con KV cache en BF16 y overhead de vLLM, un despliegue realista requiere del orden de 2 a 4 GB de VRAM según longitud de contexto y número de secuencias.
- GPU recomendadas: el autor validó la carga en una RTX PRO 6000 Blackwell (SM120) con vLLM 0.17. No se documenta validación en otras GPU ni en Orin.
- GPU consumer: por tamaño, el modelo cabe en GPUs consumer con al menos 4-6 GB de VRAM, siempre que el backend soporte el layout `compressed-tensors` y la ruta Marlin W8A16.
- Despliegue: vLLM con detección automática de la cuantización desde la configuración del modelo; el autor advierte explícitamente de no cargar los pesos comprimidos como safetensors BF16 convencionales.
- Comando de referencia del autor: `vllm serve WIlfLin/S1-mini-Chinese-1106-FP8 --dtype bfloat16 --max-model-len 2048 --max-num-seqs 1`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-Chinese-1106-FP8 | 751.632.384 | no disponible | FP8 W8A16 (compressed-tensors) | s1-mini-license | Hugging Face |
| S1-mini-Chinese-1106-BF16 | no disponible en la información | no disponible | BF16 | s1-mini-license | Hugging Face |
| Qwen3-0.6B (arquitectura base) | ~0,6B | no disponible en la información | múltiples | Apache-2.0 (según el modelo base original) | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros modelos de postprocesado de transcripciones en la información proporcionada.

## Limitaciones y advertencias

- La cuantización no elimina los errores del modelo base: pueden aparecer ceros adicionales en cifras, fallos en términos propios, en mayúsculas de lectura/escritura de caracteres, en negaciones, en correcciones sobre la marcha (改口) y en párrafos largos.
- Los resultados pueden variar según backend, tamaño de lote y hardware; las comprobaciones publicadas no garantizan corrección en cualquier entrada.
- Cada versión de precisión debe seleccionarse con su propia regresión: no es válido trasladar los resultados de BF16 a FP8 ni al contrario.
- El modelo no incluye reglas de prelectura ni filtros de protección de contenido; la aplicación debe gestionar peticiones anómalas, detección de truncamiento y envío seguro de saltos de línea.
- Requiere el mismo system prompt y las mismas líneas de control que el modelo BF16, y el modo thinking debe desactivarse.
- No es un reconocedor de audio ni un asistente general de preguntas y respuestas; usarlo fuera de la normalización de transcripciones degrada la calidad esperada.
- Licencia restrictiva: s1-mini-license, con obligación de conservar LICENSE y NOTICE originales de S1-mini by Superwhisper, incluida la cláusula de mantener el nombre y la atribución del autor original. No es Apache-2.0; los datos CS2W (CC-BY-SA-4.0) y Disfl-QA (CC-BY-4.0) conservan sus propias condiciones.
- No se documentan sesgos específicos más allá de los derivados de los datos de entrenamiento en chino e inglés; no hay información sobre comportamiento en otros idiomas.
- El formato FP8 está validado solo en la ruta Marlin W8A16 de vLLM sobre RTX PRO 6000 Blackwell; otros backends o GPUs sin soporte de esa ruta pueden no cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106-FP8
- Modelo base BF16: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106-BF16
- Modelo S1-mini-Chinese-1106 (referencia de búsqueda): https://huggingface.co/WIlfLin/S1-mini-Chinese-1106
- Ficheros de procedencia citados en la model card: `quantization-provenance.json`, `evaluation-summary.json`, `training-provenance.json`, `data-provenance.json` (en el repositorio del modelo)
- Licencia y aviso legal: `LICENSE` y `NOTICE` en el repositorio del modelo
