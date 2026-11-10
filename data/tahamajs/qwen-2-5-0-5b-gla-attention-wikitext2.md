# tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2` es un experimento de investigación publicado en Hugging Face por el usuario tahamajs, consistente en un transplante de atención sobre el modelo base Qwen2.5-0.5B. El autor sustituye el mecanismo de atención original por uno denominado `gla_attention` (registrado en un `ATTENTION_REGISTRY` propio, presumiblemente del framework NeuralOps) siguiendo un patrón de cirugía identificado como `hybrid_3_1`, es decir, una mezcla híbrida de capas con atención original y capas con atención GLA en proporción 3 a 1.

El modelo tiene 519.096.508 parámetros reales según los pesos en safetensors (1,2 GB en fp32/bf16), lo que confirma que se trata de una modificación estructural del Qwen2.5-0.5B original, no de un modelo entrenado desde cero. El ajuste se realiza mediante destilación de conocimiento sobre el dataset WikiText-2 (`wikitext-2-raw-v1`) durante 182,4 segundos en una NVIDIA RTX 3090.

La relevancia de esta ficha es limitada desde el punto de vista de producción: los datos publicados por el propio autor muestran una perplejidad causal (PPL) de 400580,78 tanto antes como después de la destilación, con un delta de +0,00, lo que indica que el proceso de ajuste no mejoró el modelo y que este se encuentra en un estado claramente no funcional para generación de texto. Se documenta aquí como artefacto de investigación sobre transplantes de atención, no como modelo utilizable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen2.5-0.5B con atención sustituida por `gla_attention` en patrón híbrido `hybrid_3_1` |
| Parametros totales | 519.096.508 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo base | Qwen2.5-0.5B |
| Dataset de ajuste | WikiText-2 (`wikitext-2-raw-v1`) |
| Patrón de cirugía | `hybrid_3_1` |
| PPL causal pre-destilación | 400580,78 |
| PPL causal post-destilación | 400580,78 |
| Delta de PPL | +0,00 |
| Tiempo de destilación | 182,4 s en NVIDIA RTX 3090 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-11-10 |
| Fecha de actualización | 2026-11-10 |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso de aproximadamente 500 millones de parámetros, y le aplica una cirugía estructural que reemplaza parte de las capas de atención por un mecanismo denominado `gla_attention`. El patrón `hybrid_3_1` sugiere que por cada tres capas se conserva la atención original y una se sustituye por GLA, aunque la model card no detalla qué capas concretas se modifican ni la definición exacta de `gla_attention` (podría tratarse de Gated Linear Attention u otra variante propietaria del framework NeuralOps). No se especifica si el mecanismo incorpora decodificación especulativa, atención lineal o compuertas recurrentes.

El ajuste se realiza mediante destilación de conocimiento sobre WikiText-2 durante 182,4 segundos en una RTX 3090, un tiempo extremadamente corto que sugiere un número muy reducido de pasos o un subconjunto mínimo del dataset. Los datos publicados son concluyentes: la perplejidad causal es idéntica antes y después de la destilación (400580,78), con delta +0,00. Una PPL de ese orden de magnitud indica que el modelo no ha aprendido la distribución del lenguaje y que la destilación no ha tenido efecto medible, probablemente por un fallo en el pipeline de entrenamiento, una inicialización incorrecta de las capas transplantadas o una incompatibilidad entre el mecanismo GLA y el resto de la arquitectura. No se documenta RLHF, DPO ni ninguna otra fase de alineamiento.

## Capacidades

- No se han documentado capacidades funcionales en la información disponible.
- Generación de texto: no verificada; la PPL publicada (400580,78) indica que el modelo no produce texto coherente.
- Razonamiento, código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- El único interés técnico documentado es servir como banco de pruebas para el transplante de atención `gla_attention` del framework NeuralOps.

## Casos de uso

- Investigación sobre transplantes de atención: el modelo sirve como artefacto para estudiar cómo afecta la sustitución de capas de atención por `gla_attention` en un transformer denso pequeño, comparando la PPL resultante con la del Qwen2.5-0.5B original. Es el uso principal y prácticamente el único documentado.
- Reproducción de experimentos de cirugía de modelos: el patrón `hybrid_3_1` y el registro `ATTENTION_REGISTRY` permiten reproducir el pipeline de modificación estructural y verificar si el fallo de destilación es reproducible o depende de la configuración del entorno.
- Docencia sobre pipelines de destilación: el caso ilustra un fallo típico en el que la PPL no mejora tras la destilación, útil para enseñar a diagnosticar problemas de inicialización o de compatibilidad de capas.
- Auditoría de model cards: sirve como ejemplo de publicación transparente de métricas negativas (delta de PPL +0,00), útil para discutir buenas prácticas de documentación en Hugging Face.
- Pruebas de compatibilidad de frameworks: puede emplearse para validar si el framework NeuralOps carga correctamente pesos safetensors con capas de atención no estándar.
- No se recomienda su uso en atención al cliente, generación de código en producción, RAG, agentes ni ninguna aplicación que requiera generación de texto fiable, dado que el modelo no supera la validación de perplejidad.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (WikiText-2) | 400580,78 |
| Perplejidad causal post-destilación (WikiText-2) | 400580,78 |
| Delta de PPL | +0,00 |
| Tiempo de destilación | 182,4 s (RTX 3090) |

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos numéricos son los de perplejidad del propio autor, que indican un modelo no funcional.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,0-1,1 GB en fp16/bf16 (519 M de parámetros × 2 bytes), y alrededor de 0,5 GB en cuantización de 8 bits. El repo ocupa 1,2 GB, consistente con pesos en fp32 o con metadatos adicionales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el autor usó una RTX 3090 para la destilación.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna (RTX 3060, RTX 4060, RTX 4090, e incluso iGPU con memoria unificada suficiente).
- Opciones de despliegue: al ser safetensors con arquitectura Qwen2 modificada, la carga con vLLM, TGI o llama.cpp requeriría soporte explícito para el mecanismo `gla_attention`; no se documenta compatibilidad con ninguna de estas herramientas. La carga con `transformers` estándar probablemente falle sin el registro de atención de NeuralOps.
- Latencia y throughput estimados: no disponible. Dado el estado no funcional del modelo, las mediciones de throughput carecen de sentido práctico.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2 | 519 M | no disponible | 400580,78 | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B (base original) | ~494 M | 32 768 tokens (según documentación pública de Qwen) | no disponible en esta ficha | Apache 2.0 (según documentación pública de Qwen) | Hugging Face |
| SmolLM2-360M | ~360 M | 8192 tokens (según documentación pública) | no disponible en esta ficha | Apache 2.0 (según documentación pública) | Hugging Face |
| Qwen3-0.6B | ~600 M | 32 768 tokens (según documentación pública) | no disponible en esta ficha | Apache 2.0 (según documentación pública) | Hugging Face |

La comparación relevante es contra el Qwen2.5-0.5B original: el modelo aquí documentado no mejora ninguna métrica publicada y no declara licencia ni idiomas, por lo que en la práctica no es un sustituto utilizable de su propio modelo base.

## Limitaciones y advertencias

- Modelo no funcional para generación de texto: la PPL causal de 400580,78 (idéntica antes y después de la destilación) indica que no ha aprendido la distribución del lenguaje.
- La destilación no produjo ninguna mejora (delta +0,00) en 182,4 segundos de entrenamiento, lo que apunta a un fallo en el pipeline o a una incompatibilidad del mecanismo `gla_attention` con la arquitectura base.
- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier uso.
- Idiomas no declarados: se desconoce si conserva las capacidades multilingües del Qwen2.5-0.5B original.
- Longitud de contexto no documentada: no se puede asumir la ventana de 32 768 tokens del modelo base.
- Riesgo de alucinación: máximo, dado que el modelo no genera texto coherente; cualquier salida debe considerarse ruido.
- Sesgos: no evaluados ni documentados.
- Compatibilidad: requiere el registro de atención de NeuralOps (`ATTENTION_REGISTRY`) para cargarse; no se garantiza su funcionamiento con `transformers`, vLLM, llama.cpp u Ollama estándar.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad.
- No usar en producción bajo ninguna circunstancia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-gla-attention-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper de Gated Linear Attention (referencia genérica, no confirmada como la implementación usada): https://arxiv.org/abs/2312.06635
- Perfil del autor en Hugging Face: https://huggingface.co/tahamajs
- Framework NeuralOps: no disponible (no se ha encontrado enlace en la información proporcionada)
