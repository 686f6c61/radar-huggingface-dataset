# Yahya308/Mini-Intelligence

## Resumen

Mini Intelligence v2 es un modelo encoder de tipo router de consultas, desarrollado por Yahya308 en el contexto de un trabajo de fin de máster sobre enrutamiento de LLM. No es un modelo generativo: dado un texto de consulta en inglés, estima para cada uno de 20 modelos abiertos de aproximadamente 7–9B de parámetros la probabilidad de responder correctamente a esa consulta, y devuelve la puntuación de los 20 candidatos junto con la selección del más probable. El llamador puede entonces enviar la consulta al modelo elegido.

Técnicamente es un fine-tune completo del encoder inglés Laya (ModernBERT-large, 28 capas, ~395M de parámetros) con una cabeza de predicción de 20 salidas. El checkpoint publicado incluye el encoder completo en formato estándar de transformers, la cabeza, el tokenizador y la configuración del router, y funciona sin dependencias del paquete `laya` original.

Su relevancia práctica está en la reducción de coste en sistemas multi-modelo: en lugar de enviar todas las consultas al modelo más grande o más caro, un router ligero de ~395M de parámetros decide qué modelo de 7–9B es más probable que acierte, con un coste de inferencia muy inferior al de cualquiera de los candidatos. La versión 2.0.0 mejora a la 1.0.0 (LoRA de rango 8 sobre una única matriz) con un fine-tune completo y una mejora moderada en las métricas de enrutamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT-large (encoder transformer) + cabeza de clasificación multi-etiqueta de 20 salidas |
| Parametros totales | 394.781.696 (encoder) + 135.828 (cabeza) = 394.917.524 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 423 tokens de consulta (primeros 211 + últimos 212 si excede); el encoder subyacente soporta contextos mayores, pero el router trunca a ese tamaño |
| Tipos de cuantizacion | no disponible (el autor publica pesos en float32; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (encoder float32, 1.58 GB; cabeza en `head.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT-large de 28 capas y ~395M de parámetros, inicializado desde `convaiinnovations/laya` (revisión `e333cb7c823cd1787276228260f56d02fbf5180b`) y afinado completamente, incluidas las embeddings. La entrada es únicamente el texto de la consulta: se sustituye el token de máscara del tokenizador por un espacio, se leen `[CLS]`, hasta 423 tokens y `[SEP]`, y las consultas más largas se representan por sus primeros 211 y últimos 212 tokens. La representación usada es el vector CLS tras la normalización final del encoder.

La cabeza de predicción es una secuencia LayerNorm → lineal de 1024 a 128 → GELU → dropout 0.1 → lineal de 128 a 20 → sigmoid, con una salida por cada modelo candidato. El entrenamiento se realizó sobre resultados registrados por LLMRouterBench, aprendiendo a predecir el éxito de cada candidato a partir de la consulta. La política de selección por defecto (`raw`) elige el candidato con mayor probabilidad predicha; existe una política `gated` que recurre a Qwen3-8B como fallback si el mejor candidato no supera su probabilidad por un margen, pero en este checkpoint el margen elegido es 0.0, por lo que `gated` produce las mismas decisiones que `raw`.

## Capacidades

- Clasificación multi-etiqueta de consultas en inglés contra un pool fijo de 20 LLMs de 7–9B parámetros.
- Predicción de probabilidad de éxito por modelo candidato (20 puntuaciones independientes con sigmoid).
- Selección de modelo con dos políticas: `raw` (argmax) y `gated` (fallback a Qwen3-8B, equivalente a `raw` en este checkpoint).
- Extracción de features vía `ModernBertModel` estándar de transformers.
- Inferencia en float32 en CPU o CUDA; bfloat16 opcional con autocast en GPU CUDA.
- Verificación de integridad de pesos mediante SHA-256 en el paquete oficial.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un router/clasificador.

## Casos de uso

- Enrutamiento de consultas en producción: integrar el router delante de un pool de 20 modelos de 7–9B para enviar cada consulta al candidato con mayor probabilidad de acierto, reduciendo el coste frente a usar siempre el modelo más caro.
- Reducción de latencia en asistentes: sustituir un modelo grande por el candidato más pequeño y adecuado cuando el router predice alta probabilidad de éxito, manteniendo la calidad percibida.
- Control de coste en pipelines de generación masiva: procesar lotes de consultas heterogéneas y distribuir la carga entre modelos según la predicción, con un coste de routing de ~395M de parámetros por consulta.
- A/B testing de pools de modelos: usar las 20 puntuaciones como señal para comparar qué candidatos dominan en distintos tipos de consulta antes de fijar un pool definitivo.
- Investigación en LLM routing: reproducir y extender los experimentos de LLMRouterBench con un checkpoint abierto y código de verificación publicado.
- Filtrado previo en sistemas de atención al cliente: clasificar consultas entrantes y derivar a modelos especializados (código, matemáticas, redacción) según la predicción del router.
- Despliegue en CPU: al ser un encoder de ~395M en float32, puede ejecutarse en CPU para entornos sin GPU, con latencia mayor que en CUDA pero sin requisitos de VRAM.

## Benchmarks y rendimiento

Datos publicados en la model card (comparativa v1.0.0 vs v2.0.0):

| Metrica | v1.0.0 | v2.0.0 |
|---|---|---|
| Media sobre los 5 splits oficiales, Sample-Avg | 70,10 % | 70,78 % |
| Media sobre los 5 splits oficiales, Dataset-Avg | 71,35 % | 72,40 % |
| ARC-Challenge (held out, checkpoint publicado) | 93,69 % | 94,03 % |

No se han publicado en la información disponible resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) para este modelo, ya que no es un modelo generativo.

## Requisitos de hardware

- VRAM estimada: ~1,6 GB para los pesos del encoder en float32 más la cabeza (~0,5 MB); el pico real depende del batch y del framework.
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM; en la práctica funciona en RTX 3060/4060 y superiores, así como en A100/H100 para despliegues de alto throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con al menos 2 GB de VRAM; también en CPU.
- Opciones de despliegue: `transformers` (ModernBertModel + cabeza), paquete `mini-intelligence`, y `text-embeddings-inference` según los tags del repo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada. El autor indica float32 por defecto y bfloat16 opcional en CUDA, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mini Intelligence v2 | ~395M | 423 tokens de consulta | Router de 20 LLMs | Apache 2.0 | Hugging Face + GitHub |
| Mini Intelligence v1 | ~395M (LoRA rango 8) | 423 tokens de consulta | Router de 20 LLMs | Apache 2.0 | Tag `v1.0.0` en GitHub |
| Laya (base) | ~395M | contexto del encoder ModernBERT | Feature extraction / encoder | no disponible en la información | Hugging Face (`convaiinnovations/laya`) |
| RouterRoute / otros routers de LLM | no disponible | no disponible | Enrutamiento de LLM | no disponible | no disponible |

No se dispone de datos de benchmarks comparables con otros routers de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo está entrenado y evaluado únicamente en inglés; su uso con otros idiomas no está validado.
- Pool fijo de 20 candidatos: las predicciones solo tienen sentido para esos 20 modelos de 7–9B; no generaliza a modelos fuera del pool ni a tamaños muy distintos.
- Truncamiento a 423 tokens: consultas más largas se representan por sus primeros 211 y últimos 212 tokens, perdiendo información del centro.
- Riesgo de error de enrutamiento: las métricas publicadas (~70–72 % de media, 94 % en ARC-Challenge) implican que una fracción no trivial de consultas se envía a un modelo que no es el óptimo.
- La política `gated` es equivalente a `raw` en este checkpoint (margen 0.0), por lo que no aporta protección adicional frente a fallos del candidato elegido.
- Licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni soporte; el modelo se publica como artefacto de investigación (tesis de máster).
- Sin datos de sesgos, robustez adversarial ni evaluación de calibración de las probabilidades en la información disponible.
- El paquete oficial fija transformers 5.17.0; otras versiones pueden requerir ajustes en la carga de la cabeza.

## Enlaces

- Hugging Face: https://huggingface.co/Yahya308/Mini-Intelligence
- Repositorio GitHub: https://github.com/yahya308/Mini-Intelligence
- Tag v2.0.0: https://github.com/yahya308/Mini-Intelligence/tree/v2.0.0
- Tag v1.0.0: https://github.com/yahya308/Mini-Intelligence/tree/v1.0.0
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- LLMRouterBench: https://github.com/ynulihao/LLMRouterBench
- arXiv referenciado en tags: arXiv:2601.07206 (no verificado en la información disponible)
