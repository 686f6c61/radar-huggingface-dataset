# xv0y5ncu/gemma-4-26B-A4B-it-GLQ-6bpw

## Resumen

El modelo `xv0y5ncu/gemma-4-26B-A4B-it-GLQ-6bpw` es una cuantización de alta fidelidad del modelo multimodal `google/gemma-4-26B-A4B-it` de Google DeepMind, realizada por el autor xv0y5ncu. Utiliza el método GLQ (6.0 bits por peso) basado en un codebook E8-lattice con transformada de Hadamard aleatorizada y LDLQ, que mantiene los pesos comprimidos en memoria y los descomprime en tiempo real mediante kernels CUDA fusionados. El modelo base es un MoE de 26B parámetros con 3.8B activos, diseñado para razonamiento avanzado y tareas agénticas, y es multimodal (entrada de texto e imagen, salida de texto). Esta cuantización permite ejecutar el modelo con menor huella de memoria sin pérdida significativa de rendimiento, especialmente en modo thinking.

El repositorio pesa 21.1 GB y el archivo safetensors reporta 10.545.504.206 parámetros (probablemente solo el decoder de texto cuantizado, ya que las torres de visión/audio se mantienen en su formato nativo). La licencia es Apache 2.0, lo que permite uso comercial y modificación. La cuantización está calibrada con 128 muestras de WikiText-2 y ofrece una SQNR media de 27.06 dB sobre 7885 capas cuantizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (transformer, imagen-texto) |
| Parametros totales | 26B (modelo base) |
| Parametros activos | 3.8B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GLQ 6.0 bits/peso (E8-lattice + RHT + LDLQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `gemma-4-26B-A4B-it` es un MoE (Mixture of Experts) con 26B parámetros totales y 3.8B activos por token, lo que acelera la inferencia. Es multimodal: procesa texto e imágenes (también soporta audio según el pipeline). La cuantización GLQ aplica un codebook de 8 dimensiones con transformada de Hadamard aleatoria y LDLQ (Latent Distributional Quantization) para minimizar el error de cuantificación. Los pesos se mantienen en formato de 6 bits y se descomprimen sobre la marcha en los kernels CUDA. La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2.

El modelo base fue entrenado por Google DeepMind con técnicas de RLHF y optimización para razonamiento (modo thinking). La cuantización no altera la arquitectura ni el entrenamiento, solo la representación de los pesos del decoder de texto. La versión cuantizada requiere `transformers>=5.13.1` y vLLM 0.27.1 (o superior) para su uso, y se recomienda fijar `transformers<5.15` por compatibilidad.

## Capacidades

- Generación de texto y razonamiento complejo, con modo "thinking" activable (`enable_thinking=True`).
- Entrada multimodal: procesa imágenes y texto (aunque la cuantización solo afecta al decoder; las torres de visión/audio se mantienen en formato original).
- Soporte para agentes y tool calling (se puede usar con pi-code, opencode u otros clientes compatibles con API OpenAI).
- Capacidades multilingües (heredadas del modelo base, aunque no se detallan idiomas específicos).
- Decodificación eficiente gracias al MoE con 3.8B activos, lo que reduce latencia y VRAM.
- Integración con vLLM y Transformers para despliegue en producción.

## Casos de uso

- **Agentes de código en producción**: el modelo se puede servir con vLLM y conectarse a herramientas como pi-code u opencode mediante API compatible con OpenAI, permitiendo generación de código con contexto largo y razonamiento multi-paso.
- **Atención al cliente automatizada**: con su capacidad de razonamiento y contexto extenso (aunque no se especifica la ventana exacta, el modelo base soporta hasta 256k tokens), puede gestionar conversaciones complejas y multilingües.
- **Análisis de documentos con imágenes**: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados y extraer información relevante.
- **Razonamiento matemático y científico**: con benchmarks AIME-2024 de 93.3% en modo thinking, es adecuado para resolver problemas matemáticos avanzados.
- **Asistentes personales locales**: gracias a la cuantización, puede ejecutarse en GPUs de consumo (24 GB) para tareas de asistencia personal sin depender de la nube.
- **Sistemas de generación de informes**: combina razonamiento y generación de texto para resumir datos o documentos técnicos con alta precisión.

## Benchmarks y rendimiento

La model card proporciona resultados de fidelidad de cuantización comparando GLQ-6bpw con el modelo bf16 en modo thinking (muestras pequeñas, no son resultados de leaderboard):

| Benchmark | bf16 base | GLQ 6bpw |
| :-- | :-- | :-- |
| MMLU-Pro (n=60, 16k budget) | 91.7% (55/60) | 88.3% (53/60) |
| AIME-2024 (n=30, 32k budget) | 93.3% (28/30) | 93.3% (28/30) |
| AIME 2025+2026 (n=60, 64k budget) | 93.3% (56/60) | 90.0% (54/60) |

El modelo cuantizado mantiene un rendimiento estadísticamente indistinguible del bf16 en los subconjuntos evaluados, con la misma tasa de truncamiento (7/60 en AIME 2025+2026). Nota: el autor advierte que evaluar el modelo sin modo thinking da resultados bajos (~31% en MMLU-Pro) por un artefacto de extracción de respuestas; siempre debe usarse en modo thinking.

## Requisitos de hardware

- VRAM estimada: el modelo base tiene 26B parámetros, pero al ser MoE con 3.8B activos, la inferencia requiere menos memoria que un modelo denso equivalente. Con cuantización de 6 bits, el peso del decoder ocupa ~10.5B × 0.75 bytes ≈ 7.9 GB, más los componentes de visión/audio en bf16 y KV cache. Se recomienda una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100 40GB).
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, o cualquier GPU con soporte CUDA y al menos 24 GB.
- Compatible con GPUs consumer de gama alta (RTX 4090) y con GPUs de centro de datos.
- Opciones de despliegue: vLLM (recomendado), Transformers con integración GLQ, y servidores compatibles con API OpenAI.
- Latencia y throughput: no se han publicado datos concretos, pero el MoE con 3.8B activos ofrece una token/s significativamente mayor que un modelo denso de 26B.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Cuantización |
| :-- | :-- | :-- | :-- | :-- | :-- |
| google/gemma-4-26B-A4B-it (bf16) | 26B | 3.8B | 256k (según documentación) | Apache 2.0 | bf16 |
| xv0y5ncu/gemma-4-26B-A4B-it-GLQ-6bpw | 26B | 3.8B | no disponible | Apache 2.0 | GLQ 6bpw |
| Qwen3-30B-A4B (hipotético) | 30B | 4B | 128k | Apache 2.0 | bf16/GGUF |

La comparación directa se limita al modelo base sin cuantizar; la ventaja principal de la versión GLQ es la reducción de memoria (21.1 GB vs ~50 GB en bf16) sin pérdida significativa de rendimiento en pruebas pequeñas. No se dispone de datos de otros modelos comparables.

## Limitaciones y advertencias

- La cuantización introduce una pérdida de precisión leve (2 puntos en MMLU-Pro en la muestra evaluada), aunque dentro del ruido estadístico.
- El modelo es multimodal, pero la cuantización solo aplica al decoder de texto; las torres de visión/audio no están cuantizadas, por lo que el ahorro de memoria es parcial.
- El autor advierte que evaluar el modelo sin el modo thinking (usando el formato chat estándar) produce resultados bajos (~31% en MMLU-Pro) por un artefacto de extracción de respuestas; es necesario usar `enable_thinking=True`.
- La versión de Transformers debe fijarse entre 5.13.1 y 5.15 para evitar errores con vLLM.
- El modelo puede sufrir alucinaciones o sesgos, como cualquier LLM; se recomienda validar las salidas en entornos de producción.
- La licencia Apache 2.0 permite uso comercial, pero hay que cumplir los términos de la licencia de Gemma (no se aplica ninguna restricción adicional).
- No se han publicado resultados de benchmarks oficiales (como MMLU completo o HumanEval) para esta cuantización; los datos presentados son de subconjuntos pequeños con fines de verificación.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/xv0y5ncu/gemma-4-26B-A4B-it-GLQ-6bpw)
- [Modelo base de Google](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Página de Gemma 4 en Google DeepMind](https://deepmind.google/models/gemma/gemma-4/)
- [Documentación de Gemma 4 en Google Cloud](https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it)
- [Ficha técnica en SiliconFlow](https://www.siliconflow.com/models/gemma-4-26b-a4b-it)
