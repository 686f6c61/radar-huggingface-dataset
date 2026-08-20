# xv0y5ncu/Gemma-4-E4B-it-GLQ-4bpw

## Resumen

Gemma-4-E4B-it-GLQ-4bpw es una cuantización GLQ (E8 lattice quantization) del modelo instruccional multimodal Gemma-4-E4B-it de Google DeepMind, realizada por el usuario xv0y5ncu. El objetivo es reducir el peso del modelo a una media de 4.0 bits por peso (bpw) manteniendo la calidad del original en tareas de razonamiento matemático, con un tamaño de archivo de 6.14 GB, 2.43 veces más pequeño que la versión bf16. El checkpoint base es el modelo instruccional de 4.4 mil millones de parámetros de Google, que soporta entrada multimodal (texto e imagen) y un modo de pensamiento explícito (`enable_thinking=True`) para problemas de razonamiento multi-paso.

La relevancia de esta cuantización reside en que permite ejecutar un modelo multimodal de 4.4B con razonamiento extendido en hardware de consumo (GPU con 8 GB de VRAM o más), manteniendo una precisión competitiva: en la evaluación GSM8K con límite de 50 ejemplos y modo chat+thinking con coincidencia estricta, alcanza un 94 % frente al 86 % del baseline bf16. El proyecto GLQ, que implementa esta cuantización, es de código abierto bajo licencia Apache 2.0, al igual que el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto e imagen), con modo de razonamiento opcional |
| Parametros totales | 3.295.349.322 |
| Parametros activos | no disponible |
| Longitud de contexto | 128.000 tokens (según pruebas NIAH en KV cache; contexto nativo del modelo base) |
| Tipos de cuantizacion | GLQ 4.0 bpw uniforme (E8 lattice, RHT, LDLQ) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Gemma-4-E4B-it es un transformer multimodal de Google DeepMind, entrenado para procesar texto e imagen y generar texto, con soporte de audio en las variantes pequeñas. Incorpora un modo de pensamiento (`thinking mode`) activable mediante el chat template, que permite razonar de forma explícita antes de emitir la respuesta final, especialmente útil en problemas matemáticos y de razonamiento multi-paso.

La cuantización GLQ aplicada en este checkpoint utiliza un codebook de celosía E8 con 65.536 entradas en bloques de 8 dimensiones, una transformada Hadamard aleatorizada (RHT) para rotar entrada y salida, y una descomposición LDL (LDLQ) para retroalimentación durante la codificación. Se emplea cuantización residual en N etapas para capas de 3 bpw o más, y asignación mixta de precisión basada en un proxy de sensibilidad derivado de la traza del Hessiano. El resultado es una media de 4.0 bpw uniforme, con un tamaño de archivo de 6.14 GB. No se han publicado detalles sobre el dataset de entrenamiento de la cuantización ni sobre procesos de RLHF/DPO aplicados al modelo base.

## Capacidades

- Generación de texto con modo de razonamiento explícito (`enable_thinking=True`) para problemas matemáticos y de lógica multi-paso.
- Entrada multimodal: procesa texto e imagen (según las especificaciones de Gemma 4).
- Conversación multi-turno con chat template.
- Cuantización eficiente: 4.0 bpw uniforme con degradación mínima en tareas de razonamiento (gsm8k 94 % vs 86 % en bf16).
- Compresión de cache KV opcional mediante GLQ (E8 lattice) en vLLM, con reducciones de hasta 4.02× en memoria de cache sin pérdida de calidad perceptible en pruebas limitadas.
- Compatibilidad con vLLM y transformers (con integración del paquete `glq`).
- Capacidades de tool calling y agentes no documentadas explícitamente en la model card; se indica "no disponible" si no se confirman.

## Casos de uso

- Razonamiento matemático y resolución de problemas multi-paso: el modo de pensamiento activo permite al modelo desglosar problemas complejos antes de responder, con un presupuesto de tokens de pensamiento recomendado de 8.000 a 16.000 tokens para la versión de 4 bpw. Es adecuado para asistentes educativos o herramientas de verificación de ejercicios.
- Asistente local de código y desarrollo: con 3.4 mil millones de parámetros y 6.14 GB de pesos, puede ejecutarse en una GPU de consumo con 8 GB de VRAM o más, permitiendo un asistente de programación privado sin dependencia de la nube. La entrada multimodal permite adjuntar capturas de pantalla de errores o diagramas.
- Análisis de documentos técnicos con imágenes: la capacidad multimodal permite procesar documentos que combinan texto y figuras, como manuales o papers, extrayendo información y resumiendo contenido en conversaciones multi-turno.
- Chat conversacional en inglés para soporte técnico: la ventana de contexto de 128.000 tokens permite mantener historiales largos de conversación, adecuado para bots de atención al cliente que necesiten recordar detalles de interacciones anteriores.
- Investigación en cuantización y compresión: el checkpoint sirve como referencia para evaluar el impacto de la cuantización E8 en modelos multimodales, comparando con el baseline bf16 en tareas de razonamiento. Los scripts de evaluación con `lm-evaluation-harness` requieren un parche para activar el modo de pensamiento.
- Despliegue de modelos de bajo coste en producción: con el soporte de vLLM y la compresión de KV cache opcional, se puede servir el modelo con un menor consumo de memoria en entornos con GPUs de gama media, reduciendo el coste por inferencia en aplicaciones de generación de texto.

## Benchmarks y rendimiento

| Benchmark | Resultado | Comparación |
|---|---|---|
| GSM8K (limit=50, chat+thinking, strict-match) | 94 % | bf16 baseline: 86 % |
| MMLU-Pro (n=240, con KV cache e8_relaxed:2) | 71.25 % | fp16 baseline: 71.25 % (idéntico) |
| MMLU-Pro (n=40, con KV cache e8_relaxed:1) | 60 % (intervalo de confianza Wilson 95 %: [45 %, 73 %]) | No validado con tamaño de muestra suficiente |
| NIAH passkey (ctx=16k, e8_relaxed:1) | 9/10 | Un fallo por un dígito |
| NIAH passkey (ctx=16k/32k/64k/130k, e8_relaxed:2) | 40/40 | Perfecto en toda la ventana de 128k |

No se han publicado resultados adicionales de benchmarks estándar (MMLU completo, HumanEval, etc.) en la información disponible. Los datos de GSM8K corresponden a la cuantización de pesos, mientras que los de MMLU y NIAH se refieren a la compresión de KV cache sobre el modelo bf16 sin cuantizar.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 8 GB con cuantización 4 bpw (el tamaño del checkpoint es de 6.14 GB, más el overhead de activaciones y KV cache; la web de Gemma 4 E4B indica un mínimo de 8 GB de VRAM).
- GPU recomendadas: RTX 4090, RTX 4080, A100, H100, RTX PRO 6000 Blackwell (la prueba de KV cache se realizó en una RTX PRO 6000 Blackwell con vLLM).
- Compatibilidad con GPU de consumo: sí, cabe en tarjetas con 8 GB de VRAM o más, como la RTX 3060 Ti, RTX 3070, etc., dependiendo del contexto y del modo de pensamiento.
- Opciones de despliegue: vLLM (con soporte de compresión de KV cache), llama.cpp (no mencionado explícitamente, pero formato GGUF no presente; el checkpoint es safetensors), HuggingFace transformers con el paquete `glq`, y Ollama (no documentado en la información).
- Latencia y throughput: no disponible en la información proporcionada; el kernel CUDA JIT-compila en el primer uso (~30 segundos) y requiere CUDA 12.x.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Rendimiento GSM8K |
|---|---|---|---|---|---|
| Gemma-4-E4B-it (bf16) | 3.295.349.322 | 128K | Apache 2.0 | safetensors | 86 % (limit=50, thinking) |
| Gemma-4-E4B-it-GLQ-4bpw (este modelo) | 3.295.349.322 | 128K | Apache 2.0 | safetensors (GLQ 4.0 bpw) | 94 % (limit=50, thinking) |
| Gemma-4-E4B-it-GLQ-6bpw | 3.295.349.322 | 128K | Apache 2.0 | safetensors (GLQ 6.0 bpw) | No disponible en la información |

La comparativa con otros modelos de la misma categoría (p.ej., Qwen2.5-4B, Llama-3.2-3B) no se ha documentado en la información proporcionada, por lo que se indica como no disponible.

## Limitaciones y advertencias

- La cuantización de 4 bpw puede requerir un presupuesto de tokens de pensamiento mayor que el modelo bf16 para converger a la respuesta final; con presupuestos insuficientes (menos de 8.000 tokens) el modelo puede truncar el razonamiento y omitir la respuesta final.
- El modo de pensamiento activo no está expuesto en `lm-evaluation-harness`; requiere un parche manual del tokenizer para evaluaciones estándar.
- La compresión de KV cache con `e8_relaxed:1` (4 bpw) no ha sido validada con tamaños de muestra suficientes en MMLU-Pro, y en NIAH presentó un fallo de un dígito a contexto 16K; se recomienda usar `e8_relaxed:2` (6 bpw) para producción.
- La combinación de cuantización de pesos (4 bpw) con compresión de KV cache no ha sido probada de extremo a extremo; los resultados de KV cache se midieron con el modelo bf16 sin cuantizar.
- La integración con vLLM requiere fijar `transformers` por debajo de la versión 5.15, ya que la 5.15.0 rompe la carga de Gemma-4 (problema no específico de GLQ, sino del propio modelo base).
- El idioma de soporte declarado es únicamente inglés; no se documenta el rendimiento en otros idiomas.
- El modelo puede alucinar en tareas de razonamiento complejo si el presupuesto de pensamiento es insuficiente; se recomienda verificar las respuestas finales en aplicaciones críticas.

## Enlaces

- Checkpoint en HuggingFace: https://huggingface.co/xv0y5ncu/Gemma-4-E4B-it-GLQ-4bpw
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Repositorio GLQ: https://github.com/cnygaard/glq
- Página de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Página de Gemma 4 E4B en gemma4.dev: https://gemma4.dev/models/gemma-4-e4b
- Ficha en Qualcomm AI Hub: https://aihub.qualcomm.com/iot/models/gemma_4_e4b_it
