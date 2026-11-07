# Ternii/Qwen3.6-27B-TR2.5-G

## Resumen

Qwen3.6-27B-TR2.5-G es una versión cuantizada del modelo denso Qwen3.6-27B de Qwen (Alibaba), publicada por Ternii (Wai Chung) bajo licencia Apache-2.0. La técnica empleada, denominada TR Quantisation, almacena los pesos como trits (dígitos ternarios) con una media de 2,5 trits por peso, usando códigos enteros pequeños sobre una rejilla simétrica de 9 o 27 niveles y una escala de 16 bits por grupo de 128 pesos. No hay reentrenamiento ni ajuste fino: la arquitectura, el tokenizador y la plantilla de chat son los del modelo original.

El objetivo es reducir el coste de memoria y acelerar la decodificación frente a otras cuantizaciones de baja precisión, en concreto frente al checkpoint NVFP4 publicado por NVIDIA para el mismo modelo base. Según la model card, el modelo ocupa 16,90 GiB en memoria de GPU frente a los 19,93 GiB de NVFP4 (un 15 % menos) y decodifica a 40,5 tokens/s con un usuario frente a 31,0, aunque el procesamiento de prompt es aproximadamente la mitad de rápido.

La relevancia actual del modelo radica en que demuestra una alternativa de cuantización ternaria calibrada con GPTQ que mantiene la precisión del original en los benchmarks principales del autor (GSM8K, HumanEval+, MBPP+, IFEval) y se sirve mediante un plugin de vLLM (`tritq-qwen36`). El repositorio contiene únicamente el modelo de texto (sin el codificador de visión) y la cabeza de predicción multi-token (MTP) en coma flotante de bloques de 8 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.6), pesos empaquetados como trits; cabeza MTP en coma flotante de bloques de 8 bits |
| Parametros totales | 9.593.230.336 (según safetensors del repo cuantizado) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (el ejemplo de despliegue usa `--max-model-len 16384`) |
| Tipos de cuantizacion | Trit con 2,5 trits por peso de media (rejilla simétrica de 9 o 27 niveles, escala de 16 bits por grupo de 128 pesos), calibrada con GPTQ; cabeza MTP en 8-bit block floating point |
| Idiomas soportados | Inglés (declarado en la model card); el modelo base Qwen3.6 es multilingüe, pero la ficha del autor solo declara `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tensores trit empaquetados) |

## Arquitectura y entrenamiento

El modelo es una cuantización post-entrenamiento del denso Qwen3.6-27B (revisión `6a9e13bd`). No se ha realizado reentrenamiento ni ajuste fino: se conservan la arquitectura transformer, el tokenizador y la plantilla de chat de Qwen. El proceso TR Quantisation traduce cada peso a un código entero pequeño sobre una rejilla ternaria simétrica de 9 o 27 niveles, con una única escala de 16 bits por grupo de 128 pesos, y calibra los códigos mediante GPTQ (de ahí el sufijo `-G`). El resultado es una media de 2,5 trits por peso.

El repositorio incluye el modelo de texto con el codificador de visión eliminado, la cabeza de predicción multi-token (MTP) en coma flotante de bloques de 8 bits y una cabeza de borrador dispersa (sparse draft head) para decodificación especulativa. El autor no detalla la composición exacta del dataset de calibración más allá de las etiquetas del repositorio (nvidia/OpenCodeInstruct, EleutherAI/hendrycks_math y openai/gsm8k), ni el número de tokens empleados. La innovación destacable es la propia cuantización ternaria combinada con decodificación especulativa MTP (6 tokens especulativos en la configuración de referencia) y una parada por confianza en el runtime.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat compatible con Qwen.
- Razonamiento y matemáticas: el autor reporta 92,49 en GSM8K.
- Generación de código: 89,02 en HumanEval+ y 77,51 en MBPP+.
- Seguimiento de instrucciones: 85,40 en IFEval (prompt strict).
- Modo thinking desactivable mediante `chat_template_kwargs` (`enable_thinking`); los benchmarks del autor se midieron con thinking desactivado.
- Decodificación especulativa mediante cabeza MTP, con opción de cabeza de borrador dispersa o completa.
- Servicio mediante API compatible con OpenAI a través del plugin de vLLM `tritq-qwen36`.
- No incluye capacidades de visión: el codificador de visión fue eliminado del checkpoint.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.

## Casos de uso

- Servicio de chat en inglés sobre hardware de memoria unificada: el modelo ocupa 16,90 GiB en GPU tal como se sirve, por lo que puede desplegarse en una DGX Spark (GB10, 128 GB de memoria unificada) con vLLM y el plugin `tritq-qwen36`, atendiendo hasta 8 secuencias concurrentes según la configuración de referencia.
- Generación de código asistida: con 89,02 en HumanEval+ y 77,51 en MBPP+, es adecuado para autocompletado y generación de funciones en pipelines de desarrollo, aunque el procesamiento de prompt (~530 tokens/s en prompt de 2.048 tokens) limita su uso en contextos muy largos.
- Razonamiento matemático y resolución de problemas: el 92,49 en GSM8K lo hace utilizable en asistentes educativos o verificación de cálculos paso a paso, siempre con validación posterior por el riesgo de alucinación.
- Evaluación de cuantizaciones de baja precisión: sirve como referencia práctica para investigadores que comparan esquemas ternarios frente a NVFP4 o BF16 en términos de tamaño, velocidad de decodificación y precisión.
- Despliegue con decodificación especulativa: la cabeza MTP permite configurar `num_speculative_tokens` para maximizar throughput por usuario en entornos de un solo usuario o pocos usuarios.
- Sustitución directa del modelo base en aplicaciones existentes: al conservar tokenizador, plantilla de chat y arquitectura, puede integrarse donde ya se use Qwen3.6-27B, cambiando únicamente el runtime de inferencia.
- Prototipado en entornos con presupuesto de memoria ajustado: la reducción del 15 % frente a NVFP4 permite liberar memoria para caché KV (configurada en fp8 en el ejemplo del autor).

## Benchmarks y rendimiento

Datos publicados por el autor, medidos con vLLM 0.28.0, thinking desactivado y la configuración de inicio rápido (cabeza de borrador dispersa):

| Benchmark | TR2.5-G | NVIDIA NVFP4 |
|---|---|---|
| GSM8K | 92,49 | 92,57 |
| HumanEval+ | 89,02 | 91,46 |
| MBPP+ | 77,51 | 77,51 |
| IFEval (prompt strict) | 85,40 | 84,84 |

| Métrica de velocidad | TR2.5-G | NVIDIA NVFP4 |
|---|---|---|
| Memoria de modelo en GPU (tal como se sirve) | 16,90 GiB | 19,93 GiB |
| Decodificación, 1 usuario (tokens/s) | 40,5 | 31,0 |
| Decodificación por usuario, 4 / 8 usuarios | 33,7 / 26,9 | 27,8 / 25,0 |
| Decodificación total, 8 usuarios | 142,2 | 124,7 |
| Procesamiento de prompt, 2.048 tokens | ~530 | ~1.044 |

El propio autor advierte que "sin diferencia significativa" no equivale a igualdad: con 164 problemas de HumanEval y la corrección por comparaciones múltiples aplicada, solo se detectarían diferencias de unos 7 puntos o más, y TR está nominalmente 2,4-3,0 puntos por detrás en esa prueba. Las mediciones se realizaron en una DGX Spark (GB10), con CUDA 13.0 y una sola GPU; otras GPU no fueron probadas.

## Requisitos de hardware

- VRAM estimada: 16,90 GiB de memoria de GPU tal como se sirve (pesos, cabeza MTP y cabeza de borrador dispersa); 15,66 GiB con `TRITQ_DRAFT_HEAD=full`.
- Descarga del repositorio: 16,31 GB (16.313.888.779 bytes según `SHA256SUMS`).
- GPU probada: NVIDIA DGX Spark (GB10, 128 GB de memoria unificada), CUDA 13.0, una GPU. Otras GPU no han sido probadas según el autor.
- GPU consumer: no disponible confirmación de funcionamiento en RTX 4090 u otras consumer; el requisito de ~17 GiB excede la VRAM de muchas tarjetas consumer de 16 GB.
- Despliegue: vLLM 0.28.0 con el plugin `tritq-qwen36` (imagen Docker `ghcr.io/ternii-ai/tritq-qwen36:0.2`); no se mencionan soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 40,5 tokens/s de decodificación con un usuario; ~530 tokens/s de procesamiento de prompt con 2.048 tokens; 142,2 tokens/s agregados con 8 usuarios, en la DGX Spark de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Memoria en GPU | GSM8K | HumanEval+ | Licencia |
|---|---|---|---|---|---|---|---|
| Qwen3.6-27B-TR2.5-G | 9.593.230.336 (repo cuantizado) | No disponible | Trit 2,5 bits/peso (GPTQ) | 16,90 GiB | 92,49 | 89,02 | Apache-2.0 |
| Qwen3.6-27B-NVFP4 (NVIDIA) | No disponible | No disponible | NVFP4 | 19,93 GiB | 92,57 | 91,46 | No disponible |
| Qwen3.6-27B (BF16 original) | No disponible | No disponible | BF16 | No disponible | Referencia de precisión según el autor | Referencia de precisión según el autor | Apache-2.0 |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El procesamiento de prompt es aproximadamente la mitad de rápido que NVFP4 (~530 frente a ~1.044 tokens/s), lo que penaliza cargas con prompts largos o RAG.
- La ventaja de decodificación por usuario se reduce al aumentar la concurrencia (x1,22 con 4 usuarios, x1,08 con 8 usuarios).
- El autor reconoce que en HumanEval+ el modelo está nominalmente 2,4-3,0 puntos por detrás de NVFP4 (4-5 problemas netos), aunque la muestra no permite establecer significación estadística.
- Solo se declara soporte de inglés; la cabeza de borrador `english` es más lenta que la completa fuera del inglés, según el autor.
- El codificador de visión fue eliminado: no hay capacidades multimodales.
- Solo ha sido probado en una DGX Spark con CUDA 13.0; el comportamiento en otras GPU es desconocido.
- Requiere un runtime específico (vLLM 0.28.0 con plugin propietario del autor); no hay soporte documentado para llama.cpp, Ollama o TGI.
- Riesgo de alucinación inherente a los modelos de lenguaje; los benchmarks del autor se midieron con thinking desactivado, lo que puede no reflejar el rendimiento en tareas de razonamiento complejo.
- Las cifras de benchmarks y velocidad proceden del propio autor y no han sido replicadas de forma independiente en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.6-27B y del runtime `tritq-qwen36`.

## Enlaces

- Hugging Face: https://huggingface.co/Ternii/Qwen3.6-27B-TR2.5-G
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Runtime y plugin vLLM: https://github.com/ternii-ai/tritq-vllm
- Model card del 35B TR (referencia de configuración del runtime): https://huggingface.co/Ternii/Qwen3.6-35B-A3B-TR2.25-G#quick-start-nvidia-dgx-spark
- Perfil del autor en Hugging Face: https://huggingface.co/Ternii/models
- Ficha del modelo en Microsoft Foundry: https://ai.azure.com/catalog/models/qwen--qwen3.6-27b
