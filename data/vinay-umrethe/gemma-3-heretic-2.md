# VINAY-UMRETHE/gemma-3-heretic-2

## Resumen

gemma-3-heretic-2 es un modelo derivado de `tiny-random/gemma-3`, una versión de depuración de Gemma 3 con pesos inicializados aleatoriamente y una configuración mínima adaptada de `google/gemma-3-27b-it`. El autor, VINAY-UMRETHE, ha aplicado sobre esa base la herramienta Heretic v2.2.0.dev0 para producir una variante "decensored" mediante ablación de rangos arbitrarios (Arbitrary-Rank Ablation, ARA). No se trata de un modelo entrenado con datos reales, sino de un artefacto técnico pensado para validar pipelines de ablación y reproducibilidad.

El modelo conserva la arquitectura multimodal de Gemma 3 (image-text-to-text) pero con dimensiones reducidas drásticamente: 8.600.288 parámetros totales, 2 capas de texto y 2 capas de visión, con hidden size de 32. Su relevancia es metodológica: demuestra el flujo completo de Heretic sobre un modelo pequeño y reproducible, no su utilidad práctica en producción.

La ficha siguiente describe el modelo tal como está publicado. Dado que la base es un modelo aleatorio de depuración, muchas capacidades y métricas habituales no son aplicables ni están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 3 (texto + visión), configuración reducida |
| Parametros totales | 8.600.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración tiny, sin dato publicado) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3 (`Gemma3ForConditionalGeneration`), con un codificador de visión y un decodificador de texto, pero con la configuración truncada: `hidden_size=32`, `intermediate_size=128`, `head_dim=32`, 1 cabeza de atención, 1 cabeza KV, 2 capas ocultas y `sliding_window_pattern=2` en el texto; `hidden_size=32`, 2 capas, 1 cabeza e `intermediate_size=128` en visión. Los pesos se inicializan con `torch.nn.init.normal_(p, 0, 0.5)` y semilla 42, es decir, no hay entrenamiento con datos.

Sobre esa base aleatoria, Heretic v2.2.0.dev0 aplica una ablación de rangos arbitrarios (ARA) con los parámetros publicados: `start_layer_index=0`, `end_layer_index=2`, `preserve_good_behavior_weight=0.6412`, `steer_bad_behavior_weight=0.2986`, `overcorrect_relative_weight=0.8460` y `neighbor_count=2`. El dataset de referencia es `heretic-org/Multilingual-Harmless-Harmful`. El resultado es un artefacto reproducible (carpeta `reproduce/` incluida) cuyo propósito es validar el método, no generar texto útil.

## Capacidades

- Generación de texto y respuesta multimodal image-text-to-text a nivel de arquitectura, pero sin capacidades funcionales reales al partir de pesos aleatorios.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (sin datos de entrenamiento).
- Modo thinking, visión, audio: la arquitectura incluye torre de visión, pero sin pesos entrenados no hay capacidad efectiva.
- Reproducibilidad del proceso de ablación: sí, mediante los scripts y parámetros ARA documentados.

## Casos de uso

- Validación de pipelines de ablación: usar el modelo como banco de pruebas para comprobar que Heretic v2.2.0.dev0 produce artefactos coherentes antes de aplicarlo a modelos grandes.
- Reproducción de experimentos: ejecutar la carpeta `reproduce/` para verificar que los parámetros ARA publicados regeneran el mismo checkpoint con semilla 42.
- Test de integración de transformers: comprobar que `Gemma3ForConditionalGeneration` carga y ejecuta inferencia con configuraciones mínimas en CI.
- Pruebas de pipeline `image-text-to-text`: validar el flujo de procesador, tokenizador y generación con una imagen de ejemplo y `max_new_tokens` pequeño.
- Docencia y divulgación: ilustrar cómo se construye un modelo tiny a partir de una config grande y cómo se aplica una técnica de decensoring sin entrenamiento.
- Benchmarking de herramientas de decensoring: comparar métricas de refusals y divergencia KL entre distintas versiones de Heretic sobre la misma base.

## Benchmarks y rendimiento

Datos publicados en la model card (modelo base tiny-random/gemma-3 como referencia):

| Metrica | Este modelo | Modelo original |
|---|---|---|
| Refusals | 0/5 | 0/5 |
| Divergencia KL | 0.4494 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,6 M de parámetros, repo de 0,1 GB).
- GPU recomendadas: cualquier GPU con soporte CUDA y bfloat16; también funciona en CPU.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en iGPU o CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documenta soporte GGUF, llama.cpp, Ollama ni vLLM.
- Latencia y throughput: no disponibles; al ser un modelo de depuración no se publican métricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Proposito |
|---|---|---|---|---|
| gemma-3-heretic-2 | 8,6 M | no disponible | no disponible | Artefacto de ablación reproducible |
| tiny-random/gemma-3 | ~8,6 M (misma config) | no disponible | no disponible | Modelo de depuración aleatorio |
| google/gemma-3-27b-it | 27 B | no disponible en esta ficha | Gemma Terms of Use | Modelo multimodal de producción |

La comparación con modelos de producción no es significativa: gemma-3-heretic-2 no es un modelo funcional, sino una variante ablacionada de un modelo de depuración.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: no ha recibido entrenamiento con datos, por lo que no genera texto coherente ni respuestas útiles.
- No apto para producción: cualquier uso en aplicaciones reales carece de sentido técnico.
- Sesgos conocidos: no evaluables, al no existir datos de entrenamiento.
- Riesgo de alucinación: total, en el sentido de que la salida es esencialmente aleatoria.
- Limitaciones de contexto e idioma: no disponibles; la configuración tiny no refleja las capacidades del Gemma 3 original.
- Licencia no especificada: no se puede asumir uso comercial; hay que contactar con el autor o consultar la licencia de la base.
- El término "decensored" o "abliterated" no implica que el modelo sea seguro: la ablación se aplica sobre pesos aleatorios y las métricas de refusals (0/5) no son representativas.
- La fecha de creación indicada (2026-11-15) es futura respecto a la información habitual; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-2
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Modelo de referencia de la config: https://huggingface.co/google/gemma-3-27b-it
- Heretic: https://heretic-project.org
- Dataset: https://huggingface.co/datasets/heretic-org/Multilingual-Harmless-Harmful
- Reproducibilidad: carpeta `reproduce/README.md` dentro del repositorio del modelo
