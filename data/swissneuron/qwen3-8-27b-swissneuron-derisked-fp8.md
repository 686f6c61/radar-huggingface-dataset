# SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked-FP8

## Resumen

Qwen3.8-27B-SwissNeuron-Derisked-FP8 es una cuantización FP8 dinámica del modelo Qwen3.8-27B-SwissNeuron-Derisked, un fine-tune de Qwen3.8-27B realizado por SwissNeuron con el objetivo de reducir riesgos de comportamiento en producción (de ahí el término "derisked"). El modelo base pertenece a la familia Qwen3.8 de Alibaba, un modelo denso de 27 mil millones de parámetros con arquitectura híbrida de atención: solo 16 de sus 64 capas utilizan atención completa, mientras que las otras 48 emplean atención lineal Gated-DeltaNet con estado recurrente constante, lo que reduce sustancialmente el coste de la memoria KV cache en contextos largos.

La versión FP8 aplica cuantización de pesos estática y activaciones dinámicas por token (W8A8), manteniendo en BF16 los módulos de atención lineal, el vision tower, el MTP draft head, embeddings y la cabeza de lenguaje para preservar la estabilidad. El modelo conserva la configuración YaRN factor-4, lo que le permite operar con una ventana de contexto de hasta 1.048.576 tokens. Es un modelo multimodal de visión-lenguaje (image-text-to-text) pensado para despliegue en entornos de producción con GPUs NVIDIA recientes (Hopper, Ada o Blackwell) y compatible con vLLM y Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con 16 capas de atención completa y 48 capas de atención lineal Gated-DeltaNet |
| Parametros totales | 27.356.728.560 (~27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (con YaRN factor-4) |
| Tipos de cuantizacion | FP8 W8A8 dinámica (pesos estáticos, activaciones dinámicas por token); módulos críticos en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Other (no especificada en la model card) |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo se basa en el backbone híbrido de Qwen3.8-27B: de las 64 capas, 16 usan atención completa (intervalo `full_attention_interval: 4`) y las otras 48 usan atención lineal con estado recurrente constante (Gated-DeltaNet), una combinación que reduce drásticamente el coste de la memoria KV cache y permite escalar la ventana de contexto a más de un millón de tokens sin un aumento proporcional de recursos. El modelo base es nativamente multimodal (visión y texto) y fue entrenado sobre la arquitectura Qwen3.8, que mejora las capacidades de codificación y productividad de oficina frente a la versión 3.6-27B.

La versión SwissNeuron-Derisked es un fine-tune sobre el modelo base que combina dos etapas: un SFT de respuesta directa "reparado" y un SFT DWM reciente con coeficiente α=0,1, orientado a reducir comportamientos indeseados y a mejorar la fiabilidad en tareas de producción. La cuantización FP8 dinámica se aplica con compressed-tensors, manteniendo los módulos sensibles en BF16 para minimizar la pérdida de precisión. El modelo incluye un chat template con soporte de modos de razonamiento (thinking) y respuesta directa.

## Capacidades

- Generación de texto y razonamiento en dos modos: `enable_thinking=True` para razonamiento explícito paso a paso y `enable_thinking=False` para respuestas directas de menor latencia.
- Comprensión de imágenes y texto (pipeline image-text-to-text): puede procesar entradas visuales y responder con texto, útil para documentos, diagramas y capturas.
- Soporte de tool calling y function calling, heredado del modelo base Qwen3.8 (no confirmado explícitamente en la model card de este derivado).
- Capacidades de agente y razonamiento multi-paso gracias al modo thinking integrado en el chat template.
- Contexto extremadamente largo: 1.048.576 tokens con YaRN factor-4, adecuado para tareas de recuperación y análisis de documentos extensos.
- Capacidades multilingües: no confirmadas en la documentación de este derivado; el modelo base Qwen3.8 soporta múltiples idiomas, pero no se especifica en la model card.
- Integración con vLLM y Transformers mediante la arquitectura `Qwen3_5ForConditionalGeneration` y compressed-tensors.

## Casos de uso

- Atención al cliente automatizada con contexto largo: con una ventana de 1M tokens, el modelo puede mantener conversaciones multi-turno con historial completo y documentos de referencia, reduciendo la pérdida de información en diálogos prolongados.
- Generación de código en producción: el modo directo (sin thinking) ofrece baja latencia para autocompletado y generación de código en entornos CI/CD, con soporte de tool calling para ejecutar comandos o integrarse con APIs.
- Análisis de documentos y contratos legales: la combinación de visión y texto permite extraer información de PDFs escaneados o imágenes, mientras que el contexto largo facilita procesar expedientes completos sin fragmentar.
- RAG sobre bases de conocimiento extensas: la ventana de 1M tokens permite indexar y consultar manuales, normativas o informes técnicos completos en una sola pasada, simplificando el pipeline de recuperación.
- Asistentes de productividad de oficina: el modelo base Qwen3.8 destaca en tareas de generación de informes, resúmenes y presentaciones, y este derivado FP8 reduce el coste de despliegue en entornos con GPUs de gama alta.
- Evaluación de modelos en investigación: al ser una versión cuantizada de un fine-tune "derisked", sirve para estudiar el impacto de la cuantización FP8 en la calidad de razonamiento y en tareas de visión-lenguaje de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card del modelo no incluye métricas comparativas. Para evaluar el rendimiento de este derivado FP8 se recomienda consultar los resultados del modelo base Qwen3.8-27B y replicar las pruebas en el contexto de la tarea específica, ya que la cuantización puede introducir degradaciones en tareas de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en FP8 ocupa aproximadamente 27,4 GB de pesos en memoria (27,36 B parámetros × 4 bytes por parámetro FP8), a lo que hay que sumar la memoria KV cache y las activaciones dinámicas; se recomienda al menos 32 GB de VRAM para inferencia básica y más para contextos largos.
- GPUs recomendadas: NVIDIA con soporte FP8, es decir, arquitectura Hopper (H100, H200), Ada (RTX 4090, RTX 6000 Ada) o Blackwell (B200, RTX 50). No es compatible con GPUs sin soporte FP8 (por ejemplo, Ampere o Turing).
- En consumer GPU: la RTX 4090 (24 GB) no tiene suficiente VRAM para cargar los pesos completos en FP8; se necesitaría una RTX 5090 (32 GB) o una GPU de estación de trabajo con 32 GB o más. En una GPU de 80 GB (A100, H100) cabe sin problemas.
- Opciones de despliegue: vLLM (recomendado, con soporte compressed-tensors y `--tensor-parallel-size`), Transformers con `Qwen3_5ForConditionalGeneration`, o LM Studio en hardware AMD (según el blog de AMD, aunque no se menciona explícitamente la compatibilidad FP8 en ese caso).
- Latencia y throughput: no se han publicado datos específicos; el modo directo (`enable_thinking=False`) ofrece menor latencia que el modo thinking. La arquitectura híbrida reduce la memoria KV cache frente a un transformer denso puro, lo que mejora el throughput en contextos largos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked-FP8 | 27,36 B | 1.048.576 tokens (YaRN-4) | Other | FP8 (compressed-tensors) | Derivado cuantizado, con fine-tune de reducción de riesgos |
| SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked | 27,36 B | 1.048.576 tokens (YaRN-4) | Other | BF16 | Modelo base sin cuantizar, misma arquitectura y fine-tune |
| Qwen/Qwen3.8-27B | 27 B | 1.048.576 tokens (YaRN-4) | Apache 2.0 (probablemente, no confirmado) | BF16 | Modelo original de Alibaba, sin fine-tune SwissNeuron |

Nota: la comparativa se limita a los modelos de la misma familia; no se dispone de datos de modelos alternativos de otros fabricantes con las mismas características (tamaño, visión-lenguaje, contexto largo) en la información disponible.

## Limitaciones y advertencias

- Cuantización FP8: al ser un derivado cuantizado, puede presentar degradaciones de precisión en tareas de razonamiento complejo, matemáticas o recuperación de información en contextos muy largos; la model card recomienda re-evaluar los workloads críticos en lugar de asumir paridad con el BF16.
- Contexto extremo: aunque la configuración activa mantiene YaRN-4 a 1M tokens, la calidad de la recuperación en los extremos de la ventana no está garantizada; es necesario validar el rendimiento real en cada caso.
- Licencia "other": la licencia no está especificada en la model card, lo que introduce incertidumbre sobre los términos de uso comercial; hay que consultar la documentación del modelo base de Qwen y el repositorio de SwissNeuron.
- Idiomas: no se especifican los idiomas soportados en la model card; la capacidad multilingüe del modelo base no está confirmada en este derivado.
- Sesgos y alucinaciones: no se han publicado análisis de sesgos; como modelo de lenguaje generativo, puede producir alucinaciones, especialmente en tareas de recuperación de información o razonamiento de larga duración.
- Hardware específico: requiere GPUs NVIDIA con soporte FP8 (Hopper, Ada, Blackwell); no es ejecutable en GPUs antiguas o sin soporte FP8, y el despliegue en consumer GPU es limitado por la memoria VRAM.
- Soporte de runtime: necesita una versión reciente de vLLM o Transformers con soporte de compressed-tensors y de la arquitectura Qwen3.5; puede requerir `--trust-remote-code`.

## Enlaces

- [SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked-FP8 (HuggingFace)](https://huggingface.co/SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked-FP8)
- [SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked (modelo base BF16)](https://huggingface.co/SwissNeuron/Qwen3.8-27B-SwissNeuron-Derisked)
- [Qwen/Qwen3.8-27B (modelo original de Qwen)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Qwen3.8-27B - vLLM Recipes](https://recipes.vllm.ai/Qwen/Qwen3.8-27B)
- [Qwen3.8-27B - QwenCloud](https://www.qwencloud.com/models/qwen3.8-27b)
- [Run Qwen 3.8 27B on AMD Ryzen AI Max Agentic PCs and Radeon GPUs (AMD blog)](https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html)
