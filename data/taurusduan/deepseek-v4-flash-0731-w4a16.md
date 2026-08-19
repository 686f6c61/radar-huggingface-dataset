# taurusduan/DeepSeek-V4-Flash-0731-W4A16

## Resumen

DeepSeek-V4-Flash-0731-W4A16 es una versión cuantizada del modelo DeepSeek-V4-Flash-0731, desarrollada por el usuario independiente taurusduan. El modelo original, creado por DeepSeek, emplea una arquitectura de mezcla de expertos (MoE) con 283 000 millones de parámetros, de los cuales aproximadamente 13 000 millones se activan por token, y una ventana de contexto de 1 millón de tokens. La particularidad del original es que usa precisión mixta: los 256 expertos enrutados están en FP4, formato nativo de las GPU Blackwell, mientras que la atención MLA, los expertos compartidos y el indexador están en FP8.

Este repositorio convierte los expertos de FP4 a INT4 (W4A16, con group_size=32) manteniendo la atención en FP8, de modo que el modelo pueda ejecutarse en GPU Hopper (H20, H100) y Ampere (A100, L40S) que no soportan tensor cores FP4. La conversión usa una búsqueda de escala óptima por grupo que minimiza el error cuadrático medio, alcanzando una relación señal-ruido de aproximadamente 25,8 dB. El resultado son 34 archivos safetensors de unos 166 GB en total, servibles con vLLM mediante paralelismo tensorial. La relevancia actual del modelo radica en que democratiza el acceso a un modelo de frontera de 283B en hardware de generaciones anteriores, sin necesidad de infraestructura Blackwell.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atención MLA (Multi-head Latent Attention), 256 expertos enrutados, expertos compartidos, indexador y hyper-connections |
| Parametros totales | 283 000 millones (283B) |
| Parametros activos | ~13 000 millones (13B) por token |
| Longitud de contexto | 1 000 000 tokens (calibrado; ampliable hasta 1,5M en configuraciones experimentales) |
| Tipos de cuantizacion | W4A16 (INT4 en expertos enrutados, group_size=32; FP8 en atención; BF16 en el resto) |
| Idiomas soportados | Inglés y chino (según metadatos del modelo base) |
| Licencia | deepseek (licencia propietaria de DeepSeek; consultar términos en el enlace del repositorio base) |
| Formato de pesos | safetensors (34 shards, ~166 GB) con formato compressed-tensors de precisión mixta |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformador MoE con 283B parámetros totales y 13B activos por token. Su arquitectura incluye atención MLA (Multi-head Latent Attention) para reducir el coste de la caché KV, 256 expertos enrutados, un conjunto de expertos compartidos, un módulo indexador para el enrutamiento y conexiones hyper-connection entre capas. El modelo incorpora además un mecanismo de decodificación especulativa propio llamado DSpark, en el que un modelo draft comparte pesos con el modelo principal, lo que acelera la generación sin necesidad de un draft separado.

El entrenamiento del modelo base no está documentado en la información disponible (número de tokens, composición del dataset, uso de RLHF o DPO no se especifican). El repositorio cuantizado, por su parte, no ha realizado ningún fine-tuning ni destilación: se limita a una conversión de formato y precisión. El proceso de cuantización convierte los pesos FP4 de los expertos a INT4 mediante dos pasos: primero una de-cuantización exacta de FP4 a BF16 (los 16 niveles FP4 se representan sin pérdida en BF16), y después una cuantización BF16 a INT4 con búsqueda de escala óptima sobre seis candidatos de redondeo por grupo de 32 elementos. La atención se conserva íntegramente en FP8, sin resampling. El resultado no es matemáticamente sin pérdidas (los niveles de cuantización INT4 difieren de los FP4), pero la pérdida medida es de aproximadamente un 0,26 % de error cuadrático relativo, que en la evaluación práctica del autor no produce diferencias observables en la salida.

## Capacidades

- Generación de texto y razonamiento de propósito general, con soporte de modo de pensamiento (thinking mode) configurable mediante `reasoning_effort` (low, high, max).
- Razonamiento matemático y lógico de alto nivel, con resultados de referencia destacados en LiveCodeBench y MMLU Pro.
- Generación de código y resolución de problemas de programación competitiva (CodeForces).
- Comprensión y generación multilingüe, con soporte declarado para inglés y chino.
- Decodificación especulativa nativa DSpark, que acelera la generación sin modelo draft externo.
- Soporte de tool calling y function calling (implícito en la arquitectura de agente del modelo base, aunque no se documenta explícitamente en el repositorio cuantizado).
- Capacidad de manejo de contexto muy largo (1M tokens), adecuado para tareas de razonamiento multi-paso sobre documentos extensos.
- Prompt encoding no estándar: requiere el módulo `encoding_dsv4.py` incluido en el repositorio; no usa `apply_chat_template`.

## Casos de uso

- Razonamiento matemático y científico avanzado: el modelo mantiene un 100 % de acierto en la evaluación de 50 preguntas del autor tras la cuantización, lo que lo hace adecuado para investigación y resolución de problemas formales en entornos donde no se dispone de GPU Blackwell.
- Generación de código en producción: con puntuaciones de 91,60 en LiveCodeBench y 3052 en CodeForces, puede integrarse en pipelines de CI/CD para revisión de código, generación de tests o autocompletado, aprovechando la decodificación especulativa para reducir la latencia.
- Análisis de documentos extensos: su ventana de 1M tokens permite procesar libros técnicos, codebases completos o expedientes legales en una sola pasada, con capacidad de razonamiento multi-paso sobre el contenido.
- Atención al cliente automatizada en chino e inglés: el soporte bilingüe y el modo de pensamiento configurable permiten gestionar conversaciones multi-turno con contexto largo y respuestas razonadas.
- Investigación académica en entornos con hardware limitado: al poder ejecutarse en A100 o H20 con vLLM, permite a laboratorios sin infraestructura Blackwell experimentar con un modelo MoE de 283B.
- Evaluación de técnicas de cuantización: el repositorio documenta una metodología de conversión FP4 a INT4 con búsqueda de escala que puede servir de referencia para otros proyectos de compresión de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del modelo cuantizado en la información disponible (el autor solo reporta una evaluación propia de 50 preguntas). Los datos del modelo base DeepSeek-V4-Flash-0731, según fuentes externas, son los siguientes:

| Benchmark | Resultado del modelo base |
|---|---|
| LiveCodeBench | 91,60 |
| MMLU Pro | 86,40 |
| CodeForces | 3052 |

Evaluación del autor del repositorio cuantizado (50 preguntas, greedy decoding, comparación entre el modelo original FP4+FP8 y el W4A16):

| Categoria | Original FP4+FP8 | W4A16 | Diferencia |
|---|---|---|---|
| Matematicas (10 preguntas) | 100 % | 100 % | 0 |
| Codigo (10 preguntas) | 100 % | 100 % | 0 |
| Conocimiento general (10 preguntas) | 100 % | 100 % | 0 |
| Logica (10 preguntas) | 100 % | 100 % | 0 |
| Instrucciones (10 preguntas) | 100 % | 100 % | 0 |
| Total (50 preguntas) | 100 % | 100 % | 0 |

El autor advierte que este conjunto de 50 preguntas es sencillo y solo verifica que la cuantización no ha degradado el modelo; recomienda validar con GSM8K o MMLU para mayor confianza. En cuanto a rendimiento de inferencia, con DSpark activado y 7 tokens especulativos, el modelo alcanza 21,4 tokens por segundo en 2×H20 96GB, frente a 21,7 del original. La tasa de aceptación de tokens especulativos es del 41,7 % (frente al 38,1 % del original).

## Requisitos de hardware

- VRAM estimada: el modelo completo ocupa ~166 GB en disco; para inferencia se requieren al menos 2×H20 96GB (192 GB) o 4×A100 80GB (320 GB) con paralelismo tensorial TP=2 o TP=4.
- GPU recomendadas: H20, H100 (Hopper) para un funcionamiento óptimo sin parches; A100, L40S, L20 (Ampere) requieren un pequeño parche de vLLM según el autor. No es compatible con GPU Blackwell nativa para FP4, pero sí puede ejecutarse en ellas.
- No cabe en GPU de consumo (RTX 4090, 3090, etc.) debido al tamaño del modelo y a los requisitos de memoria.
- Opciones de despliegue: vLLM (versión ≥ 0.26.0) con `tensor_parallel_size=2` o `4`; requiere torch ≥ 2.11 (recomendado build cu130). No se documenta soporte para llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 21,4 tokens por segundo en 2×H20 con DSpark activo; el rendimiento en A100 no se especifica.
- Prompt encoding: obligatorio usar el módulo `encoding_dsv4.py` incluido en el repositorio; el modelo no funciona con el chat template estándar de HuggingFace.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision | Licencia | Hardware requerido |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 (original) | 283B (13B activos) | 1M tokens | FP4 experts + FP8 attention | deepseek | Blackwell (B200) para FP4 nativo |
| DeepSeek-V4-Flash-0731-W4A16 (este repo) | 283B (13B activos) | 1M tokens | INT4 experts + FP8 attention | deepseek | Hopper o Ampere (H20, H100, A100) |
| DeepSeek-V3 (referencia de generación anterior) | 671B (37B activos) | 128K tokens | BF16 | MIT | Multi-GPU de alta gama |

La comparativa con DeepSeek-V3 es orientativa: ambos son MoE de DeepSeek, pero V3 tiene el doble de parámetros y un contexto mucho menor. El repositorio cuantizado no ofrece datos comparativos adicionales con otros modelos de la misma categoría. No se dispone de información suficiente para comparar con alternativas como Qwen o Llama en esta ficha.

## Limitaciones y advertencias

- La conversión FP4 a INT4 no es matemáticamente sin pérdidas: los niveles de cuantización difieren y el error cuadrático relativo es de ~0,26 %. Aunque el autor no observa degradación en su evaluación de 50 preguntas, no hay garantía de que no aparezcan diferencias en tareas más complejas o sensibles.
- La licencia es la propietaria de DeepSeek (no es MIT, pese a que algunas fuentes externas lo afirmen). Hay que revisar los términos del repositorio base para determinar si el uso comercial está permitido y bajo qué condiciones.
- Solo se declaran soporte de inglés y chino; el rendimiento en otros idiomas no está verificado.
- El prompt encoding es no estándar y requiere el módulo incluido; usar `apply_chat_template` dará resultados incorrectos.
- Requiere vLLM ≥ 0.26.0 y torch ≥ 2.11, versiones muy recientes que pueden no estar disponibles en todos los entornos de producción.
- En GPU Ampere (A100, L40S) se necesita un parche no documentado en detalle en el repositorio; el autor recomienda H20 o H100 para un uso sin fricciones.
- El tamaño de 166 GB implica costes de almacenamiento y transferencia considerables, y el despliegue exige infraestructura multi-GPU.
- No hay evidencia publicada de evaluación en benchmarks estándar (GSM8K, MMLU) del modelo cuantizado; los resultados del modelo base no garantizan el comportamiento tras la cuantización.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran tamaño; no se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/taurusduan/DeepSeek-V4-Flash-0731-W4A16
- Modelo base en HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Documentación técnica en DeepWiki: https://deepwiki.com/deepseek-v4-flash-0731/deepseek-v4-flash-0731
- Análisis de especificaciones y benchmarks en Datalearner: https://www.datalearner.com/en/ai-models/pretrained-models/deepseek-v4-flash
- Guía de despliegue con DSpark y KV cache NVFP4: https://github.com/tonyd2wild/DeepSeek-v4-Flash-0731-DSpark-1M-NVFP4-KV-2x-DGX-Spark
- Resumen de DeepSeek V4 y la versión 0731: https://felloai.com/deepseek-v4/
- Licencia del modelo base: https://github.com/deepseek-ai/DeepSeek-V4-Flash/blob/main/LICENSE
