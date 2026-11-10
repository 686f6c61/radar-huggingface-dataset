# tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2

## Resumen

Qwen-2.5-0.5B-compressed-attention-wikitext2 es un experimento de investigación publicado por el usuario tahamajs en Hugging Face. Se trata de un transplante de atención sobre el modelo base Qwen2.5-0.5B, en el que las capas de atención originales se sustituyen por una implementación denominada `compressed_attention` procedente del registro `ATTENTION_REGISTRY` del framework NeuralOps. El resultado es un checkpoint de 501.827.200 parámetros que no es un modelo entrenado desde cero, sino una modificación quirúrgica de un modelo existente seguida de un proceso de destilación.

El interés del artefacto es metodológico más que de producto: documenta un patrón de cirugía de atención denominado `hybrid_3_1` y cuantifica el impacto de la sustitución en la perplejidad sobre WikiText-2. Antes de la destilación, la perplejidad causal se dispara a 340.984,77; tras 180,5 segundos de destilación en una NVIDIA RTX 3090, baja a 95,76. Esa diferencia de 340.889,02 puntos es el dato central de la model card y sugiere que la atención transplantada rompe el modelo hasta que se recalibra con un corpus de referencia.

No hay información publicada sobre licencia, idiomas soportados, pipeline de inferencia ni resultados de benchmarks estándar. El repositorio ocupa 1,1 GB y contiene pesos en formato safetensors con arquitectura declarada qwen2. Cualquier uso en producción debería considerarse prematuro sin una evaluación adicional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (qwen2) con atención sustituida por `compressed_attention` (patrón `hybrid_3_1`) |
| Parámetros totales | 501.827.200 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only de 0,5 mil millones de parámetros, y aplica una cirugía de atención: las capas de auto-atención originales se reemplazan por módulos `compressed_attention` importados del `ATTENTION_REGISTRY` de NeuralOps. El patrón `hybrid_3_1` indica presumiblemente una mezcla de capas con atención original y capas con atención comprimida en proporción 3:1, aunque la model card no detalla la semántica exacta del patrón ni qué se comprime (claves, valores, cabezas o proyecciones).

El proceso de recuperación es una destilación de conocimiento sobre WikiText-2 (`wikitext-2-raw-v1`), ejecutada en 180,5 segundos sobre una RTX 3090. La perplejidad causal pasa de 340.984,77 antes de la destilación a 95,76 después. No se documentan número de tokens de entrenamiento, hiperparámetros, composición del dataset más allá de WikiText-2, ni si hubo RLHF o DPO. Tampoco se especifica qué profesor se usa en la destilación, aunque por el contexto se asume el propio Qwen2.5-0.5B original.

## Capacidades

- Generación de texto autoregresiva heredada de la arquitectura Qwen2, sujeta a la degradación introducida por la atención transplantada.
- La model card no documenta capacidades específicas verificadas tras la cirugía.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación sobre compresión de atención: el checkpoint sirve como referencia reproducible de un transplante `compressed_attention` con patrón `hybrid_3_1` sobre un modelo Qwen2.5, permitiendo comparar perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento rápida: los 180,5 segundos en RTX 3090 y la caída de perplejidad de 340.984,77 a 95,76 ofrecen un punto de partida para analizar la velocidad de recuperación tras una cirugía agresiva.
- Benchmarking de frameworks de atención: útil para validar la implementación de `compressed_attention` en NeuralOps frente a la atención estándar de Qwen2 en tareas de lenguaje sobre WikiText-2.
- Reproducción de experimentos de neurocirugía de modelos: el patrón `hybrid_3_1` puede replicarse sobre otros checkpoints para estudiar la tolerancia de distintas arquitecturas a la sustitución parcial de capas de atención.
- Docencia y divulgación: ejemplo didáctico de cómo una modificación estructural en la atención degrada la perplejidad en órdenes de magnitud y cómo la destilación la recupera parcialmente.
- Pruebas de robustez en pipelines de evaluación: permite comprobar si las métricas estándar detectan modelos con atención alterada que mantienen una perplejidad aparentemente razonable (95,76) pero cuya calidad generativa no está verificada.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (WikiText-2) | 340.984,77 |
| Perplejidad causal post-destilación (WikiText-2) | 95,76 |
| Delta de perplejidad | -340.889,02 |
| Tiempo de destilación | 180,5 s en NVIDIA RTX 3090 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (501,8 M de parámetros), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: en torno a 0,5 GB; en 4 bits, en torno a 0,3 GB, aunque no se documentan cuantizaciones publicadas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder cargar el modelo en FP16; una RTX 3090 se usó para la destilación.
- Cabe en GPU consumer: sí, previsiblemente en GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: no se documentan; al ser safetensors con arquitectura qwen2, es compatible con vLLM, TGI y transformers, y potencialmente convertible a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen-2.5-0.5B-compressed-attention-wikitext2 | 501,8 M | no disponible | no disponible | Experimental, 0 descargas |
| Qwen2.5-0.5B (base) | 494 M aprox. | 32.768 tokens (según documentación pública de Qwen) | Apache 2.0 (según documentación pública de Qwen) | Modelo oficial, ampliamente adoptado |
| Modelos de 0,5 B comparables (p. ej., SmolLM2-360M, TinyLlama-1.1B) | 360 M – 1,1 B | 2.048 – 8.192 tokens | Apache 2.0 / MIT | Modelos oficiales con benchmarks publicados |

La comparación directa con el Qwen2.5-0.5B original es la más relevante: el checkpoint aquí descrito modifica la atención y solo reporta perplejidad en WikiText-2, sin benchmarks de tareas. No hay datos para comparar rendimiento funcional con alternativas.

## Limitaciones y advertencias

- La perplejidad post-destilación de 95,76 es muy superior a la de un modelo de 0,5 B bien entrenado en WikiText-2, lo que sugiere una calidad de lenguaje degradada pese a la mejora respecto al estado pre-destilación.
- No se han publicado evaluaciones en tareas (razonamiento, código, matemáticas, multilingüe), por lo que se desconoce si el modelo conserva capacidades funcionales.
- Sesgos conocidos: no documentados; al derivar de Qwen2.5-0.5B, podría heredar sesgos del modelo base, pero no se ha verificado.
- Riesgo de alucinación: no evaluado; la atención comprimida y la destilación limitada a WikiText-2 aumentan la incertidumbre sobre la fidelidad factual.
- Licencia no disponible: no puede asumirse uso comercial sin confirmación del autor y sin verificar la licencia del modelo base Qwen2.5-0.5B.
- Idiomas soportados no documentados; la destilación solo usó WikiText-2, corpus predominantemente en inglés.
- Longitud de contexto no documentada; la cirugía de atención podría alterar el comportamiento en secuencias largas.
- Repositorio con 0 descargas y 1 like: sin validación comunitaria ni mantenimiento conocido.
- No apto para producción sin una evaluación independiente y una clarificación de licencia.

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-compressed-attention-wikitext2
- Modelo base referenciado en la model card: `/dev/shm/Qwen2.5-0.5B` (ruta local, sin enlace público)
- Dataset WikiText-2: https://huggingface.co/datasets/wikitext
- Framework NeuralOps (`ATTENTION_REGISTRY`): no disponible en la información proporcionada
