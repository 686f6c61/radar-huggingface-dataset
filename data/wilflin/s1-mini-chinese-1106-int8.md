# WIlfLin/S1-mini-Chinese-1106-INT8

## Resumen

S1-mini-Chinese-1106-INT8 es una versión cuantizada a INT8 del modelo de posprocesamiento de texto S1-mini-Chinese-1106-BF16, publicada por el usuario WIlfLin en Hugging Face. Se trata de un ajuste fino completo sobre S1-mini de Superwhisper, cuya arquitectura subyacente es Qwen3-0.6B, especializado en la normalización de transcripciones generadas por Qwen3-ASR en chino y en contextos de cambio de código chino-inglés. No es un reconocedor de audio ni un asistente conversacional de propósito general: su función es transformar texto ASR en bruto en texto legible con puntuación, números y estructura correctos.

El modelo cuenta con 751.632.384 parámetros (aproximadamente 0,75 mil millones) y un repositorio de 1,1 GB. La versión INT8 emplea cuantización por canal de salida (W8A16), manteniendo en BF16 el KV cache, los embeddings, la lm_head y las capas de normalización no cuantizadas. El formato de compresión es `compressed-tensors`, y la librería declarada es vLLM, lo que condiciona el flujo de despliegue recomendado.

Su relevancia radica en que aborda un problema muy concreto de los pipelines de ASR en producción: la salida cruda del reconocedor carece de puntuación fiable, normaliza mal números y nombres propios, y presenta errores sistemáticos en transcripciones bilingües. Este modelo actúa como etapa de postprocesado determinista y ligera, con un tamaño que permite ejecutarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-0.6B) |
| Parametros totales | 751.632.384 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el ejemplo de despliegue usa `--max-model-len 2048` |
| Tipos de cuantizacion | INT8 W8A16 (pesos INT8 por canal de salida, activaciones BF16); KV cache, embeddings, lm_head y normalizaciones en BF16 |
| Idiomas soportados | zh, en (incluye cambio de codigo chino-ingles) |
| Licencia | s1-mini-license (licencia propia derivada; ver seccion de limitaciones) |
| Formato de pesos | safetensors con layout `compressed-tensors` |
| Libreria / backend | vLLM (declarada); compatible con carga via config de cuantizacion |
| Modelo base | WIlfLin/S1-mini-Chinese-1106-BF16 (a su vez derivado de S1-mini de Superwhisper) |
| Tamano del repositorio | 1,1 GB (pesos ~1,064 GB) |
| RoPE theta | 1.000.000 (declarado en `rope_theta` y `rope_parameters.rope_theta`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basado en Qwen3-0.6B, reentrenado mediante ajuste fino completo (full fine-tune) sobre datos en chino a partir de S1-mini de Superwhisper. El modelo base BF16 se sometió a entrenamiento de todos los parámetros con datos chinos, replay de combinaciones numéricas, restricciones de consistencia frente a un profesor FP32 de confianza y entrenamiento con margen de puntuación sobre caracteres críticos. Según la model card, la calibración de la cuantización se realizó únicamente con muestras de entrenamiento, y no se publican textos de datos, grabaciones privadas ni historiales de entrada de usuarios.

La versión INT8 aplica cuantización de pesos por canal de salida con activaciones en BF16, conservando en BF16 el KV cache, los embeddings, la lm_head y las capas de normalización. El autor advierte explícitamente que la etiqueta de formato no implica que todos los tensores sean de baja precisión, y que debido a la gran tabla de vocabulario conservada en BF16 no puede inferirse una compresión de 4x a partir del ancho de bit nominal. La configuración declara RoPE theta de 1.000.000 de forma redundante para compatibilidad con la carga de codificación posicional en Transformers 4 y 5. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición detallada del dataset más allá de las referencias a los ficheros de procedencia.

## Capacidades

- Normalización de transcripciones ASR: inserción de puntuación, numeración, saltos de línea y estructura de párrafos o listas según la instrucción `Structure: prose` o `Structure: lists`.
- Corrección de números y cantidades en contexto: expansión o compactación de cifras, tratamiento de ceros, operadores aritméticos y expresiones numéricas.
- Manejo de nombres propios chinos y de palabras inventadas o poco frecuentes con reglas de deletreo.
- Procesamiento de cambio de código chino-inglés en una misma transcripción.
- Generación de texto conversacional y de formato controlado mediante system prompt y líneas de control.
- Soporte de modo thinking desactivable (el flujo recomendado exige desactivarlo).
- No dispone de tool calling ni function calling documentado.
- No dispone de capacidades de agente, razonamiento multi-paso ni visión o audio; es exclusivamente un postprocesador de texto.
- Capacidades multilingües limitadas a chino e inglés.

## Casos de uso

- Postprocesado en pipelines de ASR en producción: tras la salida de Qwen3-ASR, el modelo recibe la transcripción cruda y devuelve texto con puntuación, mayúsculas y estructura, reduciendo la carga de corrección manual en flujos de subtitulado y actas.
- Normalización de cifras en informes y transcripciones financieras: el ajuste específico sobre contextos numéricos (con pruebas de hasta 432 casos por bloque) lo hace adecuado para convertir expresiones habladas de cantidades en representaciones numéricas consistentes.
- Transcripción de reuniones bilingües chino-inglés: el soporte de cambio de código permite procesar intervenciones que alternan ambos idiomas sin segmentar manualmente el audio.
- Generación de listas y estructuras a partir de dictado: con la instrucción `Structure: lists`, el modelo produce enumeraciones y viñetas, útil para extraer tareas o puntos de una transcripción oral.
- Limpieza de nombres propios en subtítulos y bases de datos de contactos: el entrenamiento específico en nombres chinos (60/60 en la prueba reportada) lo hace apropiado para normalizar entidades nombradas en transcripciones.
- Etapa ligera en entornos con GPU modesta: con 0,75 mil millones de parámetros y pesos INT8 de ~1 GB, puede desplegarse como servicio vLLM dedicado junto al reconocedor sin competir por VRAM en exceso.
- Preprocesado para motores de búsqueda o indexación sobre transcripciones: la salida estructurada y puntuada mejora la segmentación y la calidad de indexación de contenido hablado.

## Benchmarks y rendimiento

Los datos disponibles son pruebas de regresión internas del autor, no evaluaciones independientes ni reproducciones del 94,8 % de precisión por token del modelo upstream. Se ejecutaron con la misma configuración de vLLM (lotes de 64, concurrencia máxima 8, 256 tokens de generación máxima) sobre una RTX PRO 6000 Blackwell SM120 con vLLM 0.17. La comparación de emparejamiento léxico elimina caracteres no alfanuméricos pero conserva mayúsculas y dígitos.

| Prueba | BF16 base | INT8 (este modelo) |
|---|---:|---:|
| Deletreo núcleo | 8/8 | 8/8 |
| Capacidad básica | 46/48 | 46/48 |
| Formato y números | 20/20 | 20/20 |
| Nombres propios chinos | 60/60 | 60/60 |
| Deletreo en contexto | 318/326 | 318/326 |
| Deletreo de palabras inventadas | 196/200 | 197/200 |
| Matemáticas básicas | 235/236 | 235/236 |
| Contexto numérico A | 414/432 | 414/432 |
| Contexto numérico B | 430/432 | 431/432 |
| Texto de fuentes públicas | 234/400 | 237/400 |

CER léxico sobre texto público: 9,2367 % en BF16 frente a 9,2257 % en INT8. La comprobación de una sola petición sobre saltos de línea, contenido de nombres, operadores y nuevos errores numéricos fue de 5/5. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 1,064 GB; con KV cache, embeddings y lm_head en BF16, el consumo total en inferencia se sitúa en el entorno de 1,5 a 2,5 GB según longitud de contexto y número de secuencias concurrentes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM y soporte de BF16; el autor validó la carga en RTX PRO 6000 Blackwell SM120 con vLLM 0.17.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y superiores.
- Despliegue: vLLM es el backend recomendado y el único declarado como librería; no se documenta soporte para llama.cpp, Ollama ni TGI, y el formato `compressed-tensors` dificulta su carga en backends genéricos.
- Comando de referencia: `vllm serve WIlfLin/S1-mini-Chinese-1106-INT8 --dtype bfloat16 --max-model-len 2048 --max-num-seqs 1`.
- Latencia y throughput: no disponibles de forma agregada; las pruebas de regresión usan lotes de 64 con concurrencia 8, sin publicar métricas de latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-Chinese-1106-INT8 (este) | 751.632.384 | no disponible (ejemplo a 2048) | Postprocesado de transcripciones zh/en | s1-mini-license | Hugging Face, pesos safetensors `compressed-tensors` |
| WIlfLin/S1-mini-Chinese-1106-BF16 | no disponible | no disponible | Postprocesado de transcripciones zh/en | s1-mini-license | Hugging Face |
| S1-mini (Superwhisper) | no disponible | no disponible | Postprocesado de transcripciones (original) | s1-mini-license | Hugging Face |
| Qwen3-0.6B | 0.6B (aprox.) | no disponible | Modelo generalista multilingüe | Apache-2.0 (según el modelo base citado) | Hugging Face |

La información disponible no permite comparar rendimiento numérico con alternativas de la misma categoría, ya que no se han publicado resultados de benchmarks estándar ni métricas equivalentes para los modelos comparados.

## Limitaciones y advertencias

- La cuantización no elimina los errores del modelo base: pueden aparecer ceros adicionales en cifras, errores en palabras propias, en mayúsculas de deletreo, en negaciones, en correcciones sobre la marcha y en párrafos largos.
- El rendimiento varía según backend, tamaño de lote y hardware; las pruebas publicadas no garantizan corrección para cualquier entrada.
- Las puntuaciones de cada versión de precisión deben evaluarse con su propia regresión; no es válido extrapolar los resultados de BF16 a INT8 ni al contrario.
- Es un postprocesador de texto, no un reconocedor de audio ni un asistente general; usarlo fuera de ese dominio no está respaldado por la documentación.
- Requiere el mismo system prompt y líneas de control que el modelo BF16, con el modo thinking desactivado; el incumplimiento de este contrato de entrada degrada la salida.
- La aplicación que lo integra debe gestionar peticiones anómalas, detección de truncamiento y envío seguro de saltos de línea; el modelo no incluye reglas de predeletreo ni filtros de protección de contenido.
- La licencia es `s1-mini-license`, una licencia propia con cláusulas adicionales que obligan a mantener el nombre original y la atribución de Superwhisper; no es Apache-2.0 y debe revisarse antes de uso comercial.
- Los datos de entrenamiento incluyen conjuntos con licencias CC-BY-SA-4.0 (CS2W) y CC-BY-4.0 (Disfl-QA), lo que puede imponer obligaciones de atribución o compartición derivadas.
- No se documentan sesgos específicos, pero al estar entrenado sobre datos en chino e inglés puede presentar un comportamiento degradado en otros idiomas o variantes dialectales.
- Riesgo de alucinación en la normalización: el modelo puede reescribir contenido en lugar de limitarse a puntuar, especialmente en pasajes ambiguos o con ruido de ASR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106-INT8
- Modelo base BF16: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106-BF16
- Modelo previo sin sufijo de versión: https://huggingface.co/WIlfLin/S1-mini-Chinese-1106
- Ficheros de procedencia citados en la model card: `quantization-provenance.json`, `evaluation-summary.json`, `training-provenance.json`, `data-provenance.json` (en el repositorio del modelo)
- Licencia y aviso: `LICENSE` y `NOTICE` (en el repositorio del modelo)
- Página de proveedor en BenchLM: https://benchlm.ai/providers/wilflin
