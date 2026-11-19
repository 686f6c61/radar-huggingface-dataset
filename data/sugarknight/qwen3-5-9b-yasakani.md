# sugarknight/Qwen3.5-9B-YASAKANI

## Resumen

Qwen3.5-9B-YASAKANI es una conversión cuantizada del modelo Qwen/Qwen3.5-9B (revisión `c202236`) publicada por el usuario sugarknight. No se trata de un modelo nuevo ni de un fine-tuning: los pesos de texto del checkpoint original se cuantizan y se reempaquetan en el formato propietario `.yskn`, diseñado para el motor de inferencia nativo para Windows YASAKANI. El tokenizer, la plantilla de chat y los ficheros de configuración provienen del checkpoint original de Qwen, por lo que el comportamiento lingüístico y de plantilla es el del modelo base.

El paquete incluye dos variantes de pesos: `speed.yskn` con proyecciones de cuerpo a 3 bits por peso (3,51 GB) y `quality.yskn` a 4 bits por peso (4,38 GB). Ambas emplean embeddings a 3 bits y una cabeza de salida a 4 bits. El repositorio ocupa 7,9 GB en total. La relevancia de esta ficha es acotada: el modelo solo es utilizable con el motor YASAKANI (builds CUDA y SYCL para Windows) y no con los runners habituales (llama.cpp, vLLM, TGI), lo que limita su adopción fuera de ese ecosistema.

La licencia declarada es Apache-2.0, heredada del modelo base de Alibaba Cloud. El soporte declarado es exclusivamente de texto (entrada y salida), sin visión ni audio. No se han publicado idiomas soportados ni resultados de benchmarks del modelo base en la información disponible; los únicos datos de rendimiento son los del motor YASAKANI ejecutando estos packs en una RTX 5060 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles internos del base no disponibles) |
| Parametros totales | 9B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible para el modelo; la prueba del motor usó 2.048 tokens de asignación de contexto |
| Tipos de cuantizacion | 3 bits por peso (`speed.yskn`) y 4 bits por peso (`quality.yskn`); embeddings a 3 bits y cabeza de salida a 4 bits en ambos packs |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.yskn` (formato propietario del motor YASAKANI); tokenizer y config en JSON/Jinja del checkpoint Qwen |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un transformer de 9.000 millones de parámetros desarrollado por Alibaba Cloud. La información proporcionada no detalla la arquitectura interna del base (número de capas, dimensiones, tipo de atención, composición del dataset de entrenamiento, número de tokens ni si hubo etapas de RLHF o DPO), por lo que esos datos se consideran no disponibles en esta ficha.

La contribución de este repositorio es puramente de conversión: los pesos de texto se cuantizan a 3 o 4 bits y se reempaquetan en el formato `.yskn` para el motor YASAKANI, con builds específicos para CUDA y SYCL (Intel/NVIDIA vía SYCL). El motor recibe IDs de token y almacena la caché KV en BF16. La DLL de 9B se compila desde el fork `yasakani-sycl-qwen35` en la revisión `30e4f55`. No hay entrenamiento adicional, destilación ni modificación de los datos del modelo original.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la plantilla de chat heredada de Qwen3.5.
- Entrada y salida exclusivamente de texto; no se declara visión, audio ni multimodalidad.
- Razonamiento y matemáticas: la model card reporta una prueba interna de aritmética con 10/12 aciertos (packs `speed` en SYCL y CUDA) y 9/12 (pack `quality` en CUDA), sobre un conjunto reducido no especificado.
- Comprensión lectora en japonés: 3/3 en las pruebas de lectura reportadas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; las pruebas del motor usan prompts en japonés.
- Modo thinking: el benchmark se ejecutó con "thinking off", lo que sugiere que el modelo base podría disponer de un modo de razonamiento, pero no se documenta su funcionamiento en este paquete.

## Casos de uso

- Inferencia local en Windows con GPU de consumo: el pack `speed` ocupa 3,51 GB y el `quality` 4,38 GB, con un incremento de VRAM medido de 3,7-4,8 GiB en una RTX 5060 Ti de 16 GB. Es adecuado para ejecutar un modelo de 9B en equipos con 8-12 GB de VRAM efectivos tras cargar el motor.
- Despliegue en GPUs NVIDIA antiguas vía SYCL: el build SYCL compiló también para `sm_86` (RTX 3060), lo que permite usar el modelo en tarjetas Ampere sin depender del stack CUDA más reciente.
- Prototipado de chat conversacional de baja latencia: con TTFT de 305-372 ms y 85-117 tok/s de decodificación en una RTX 5060 Ti, es viable para asistentes interactivos de un solo usuario.
- Procesamiento de documentos en japonés: las pruebas de lectura en japonés (3/3) y el TTFT bajo con prompts de ~1.073 tokens lo hacen apto para resumen y extracción sobre textos cortos en ese idioma.
- Evaluación comparativa de cuantizaciones: disponer de dos packs (3 y 4 bits) con el mismo tokenizer permite medir la degradación de calidad frente a velocidad en un mismo hardware; la prueba reportada muestra 10/12 frente a 9/12 en aritmética entre `speed` y `quality` en CUDA.
- Integración en pipelines de escritorio con requisitos de huella reducida: al no requerir CUDA toolkit completo en la ruta SYCL y caber en menos de 5 GB de VRAM adicional, encaja en estaciones de trabajo con GPUs modestas.
- No es adecuado para servir múltiples peticiones concurrentes: el benchmark se ejecutó con una petición a la vez y no se documenta batching.

## Benchmarks y rendimiento

Los únicos datos publicados son los del motor YASAKANI ejecutando estos packs en una RTX 5060 Ti 16 GB, con contexto de 2.048 tokens, KV en BF16, una petición simultánea, generación greedy y thinking desactivado. TTFT y TPS son medianas de tres prompts de lectura en japonés de aproximadamente 1.073 tokens. La VRAM es el incremento máximo sobre el uso previo a cargar el modelo.

| Pack | Backend | Decodificacion (tok/s) | TTFT (ms) | Incremento VRAM (MiB) | Aritmetica | Lectura |
|---|---|---:|---:|---:|---:|---:|
| speed | SYCL | 102,89 | 305,8 | 3.706 | 10/12 | 3/3 |
| speed | CUDA | 117,26 | 328,7 | 3.970 | 10/12 | 3/3 |
| quality | SYCL | 85,26 | 311,6 | 4.530 | 10/12 | 3/3 |
| quality | CUDA | 95,12 | 372,3 | 4.814 | 9/12 | 3/3 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) del modelo base ni de estos packs en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,7-4,0 GiB adicionales para el pack `speed` y 4,5-4,8 GiB para el `quality`, medidos en RTX 5060 Ti con contexto de 2.048 tokens y KV en BF16. Con contextos mayores la VRAM crecerá proporcionalmente al tamaño de la caché KV.
- GPU recomendadas: RTX 5060 Ti 16 GB (probada), RTX 3060 (`sm_86`, build SYCL compilado). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 8 GB de VRAM para el pack `speed` y 12 GB para holgura con el `quality`.
- Opciones de despliegue: exclusivamente el motor YASAKANI (DLL de 9B compilada desde `yasakani-sycl-qwen35`, revisión `30e4f55`), con backends CUDA y SYCL. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato `.yskn` es propietario.
- Latencia y throughput: TTFT de 305,8-372,3 ms y 85,26-117,26 tok/s de decodificación en RTX 5060 Ti, según la tabla anterior. No hay datos para otras GPUs.
- Plataforma: Windows nativo; la guía de compilación referenciada es específica para Windows.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-YASAKANI (este) | 9B | no disponible | `.yskn` (3/4 bits) | Apache-2.0 | Solo motor YASAKANI en Windows |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | safetensors (BF16) | Apache-2.0 | Hugging Face, runners estándar |
| Otras cuantizaciones de Qwen3.5-9B (GGUF, AWQ, etc.) | 9B | no disponible | GGUF, AWQ, GPTQ | Apache-2.0 | llama.cpp, vLLM, Ollama |

La ventaja diferencial de este paquete frente al base es la huella de VRAM (3,5-4,4 GB frente a los aproximadamente 18 GB en BF16) y el rendimiento medido en hardware de consumo. La desventaja es la dependencia total del motor YASAKANI y de Windows, frente a la portabilidad de las cuantizaciones GGUF o AWQ del mismo modelo base.

## Limitaciones y advertencias

- Dependencia de un motor propietario: los pesos `.yskn` solo se cargan con la DLL de YASAKANI compilada para la revisión indicada; no son compatibles con llama.cpp, vLLM, TGI ni Ollama.
- Plataforma restringida: el flujo documentado es Windows nativo con backends CUDA o SYCL; no se documenta soporte Linux ni macOS.
- Idiomas no declarados: la model card no enumera idiomas soportados y las pruebas se limitan a japonés; el rendimiento en castellano no está verificado.
- Benchmarks muy limitados: las cifras de aritmética (10/12, 9/12) y lectura (3/3) provienen de un conjunto de prueba pequeño y no especificado, con tres prompts; no son representativas de la calidad general.
- Sin datos de sesgo ni alucinación: no se ha publicado ninguna evaluación de sesgos, toxicidad o tasa de alucinación para este paquete ni para el modelo base en la información disponible.
- Contexto no documentado: aunque el modelo base podría soportar ventanas mayores, la prueba usó 2.048 tokens y no se indica la longitud máxima admitida por el motor.
- Sin soporte de concurrencia documentado: el benchmark es de una sola petición; no hay datos de batching ni de throughput agregado.
- Licencia: Apache-2.0 permite uso comercial, pero el aviso de copyright de Alibaba Cloud (2026) debe conservarse según los ficheros LICENSE y NOTICE del repositorio.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sugarknight/Qwen3.5-9B-YASAKANI
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B (revisión fijada: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c202236235762e1c871ad0ccb60c8ee5ba337b9a)
- Código fuente del motor: https://github.com/sugarkwork/yasakani-sycl-qwen35/tree/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807
- Guía de compilación para Windows: https://github.com/sugarkwork/yasakani-sycl-qwen35/blob/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807/docs/WINDOWS-QWEN35.md
- Detalles de benchmarks: https://github.com/sugarkwork/yasakani-sycl-qwen35/blob/30e4f55d5b2a97e74ac44f5cdf41f739e1d13807/docs/QWEN35-BENCHMARKS.md
