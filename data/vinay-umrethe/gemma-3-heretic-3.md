# VINAY-UMRETHE/gemma-3-heretic-3

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-3` es un modelo de prueba (debug model) publicado en Hugging Face por el usuario VINAY-UMRETHE. No es un modelo funcional entrenado, sino una versión "decensored" (abliterated) generada con la herramienta Heretic v2.2.0.dev0 sobre el checkpoint `tiny-random/gemma-3`, que a su vez es un modelo de inicialización aleatoria construido a partir de la configuración de `google/gemma-3-27b-it`. El resultado es un transformer multimodal de 8,6 millones de parámetros con pesos aleatorios, útil únicamente para depurar pipelines y flujos de trabajo de transformers.

El interés técnico del artefacto no está en sus capacidades lingüísticas (inexistentes por la inicialización aleatoria), sino en que documenta de forma reproducible el proceso de "ablación de rangos arbitrarios" (Arbitrary-Rank Ablation, ARA) aplicado por Heretic para eliminar comportamientos de rechazo. El autor publica los hiperparámetros exactos del proceso y las métricas de refusals y divergencia KL, lo que lo convierte en una referencia metodológica para quienes investigan técnicas de des-censura de modelos.

Es relevante ahora porque Heretic es una herramienta relativamente reciente dentro del ecosistema open source para modificar el comportamiento de seguridad de modelos abiertos, y esta ficha documenta un caso de uso controlado (sobre un modelo aleatorio) que sirve para validar el pipeline sin necesidad de ejecutar la ablación sobre modelos grandes con coste computacional asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3: vision encoder + language model con atención deslizante) |
| Parametros totales | 8.600.288 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (configuración derivada de gemma-3-27b-it, sin datos explícitos en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,1 GB) |

## Arquitectura y entrenamiento

El modelo replica la arquitectura Gemma 3 multimodal (`Gemma3ForConditionalGeneration`) pero con dimensiones reducidas drásticamente: `hidden_size=32`, `intermediate_size=128`, `head_dim=32`, `num_attention_heads=1`, `num_key_value_heads=1`, `num_hidden_layers=2` y `sliding_window_pattern=2`. El vision encoder tiene `hidden_size=32`, `num_hidden_layers=2`, `num_attention_heads=1` e `intermediate_size=128`. Los pesos se inicializan con una distribución normal de media 0 y desviación 0,5 con semilla fija 42, y el modelo se guarda en bfloat16. No hay entrenamiento supervisado, RLHF ni DPO: es un checkpoint aleatorio.

La innovación metodológica es el proceso Heretic (Arbitrary-Rank Ablation, ARA) aplicado sobre las capas 1 a 2 del modelo, con los parámetros `preserve_good_behavior_weight=0.3552`, `steer_bad_behavior_weight=0.0253`, `overcorrect_relative_weight=0.0469` y `neighbor_count=6`. Los datasets de referencia usados por Heretic son `mlabonne/harmful_behaviors` y `mlabonne/harmless_alpaca`. El autor indica que el proceso es reproducible y que el directorio `reproduce/` contiene la documentación para replicarlo.

## Capacidades

- Generación de texto multimodal (image-text-to-text) según el `pipeline_tag` declarado, aunque al tener pesos aleatorios las salidas carecen de coherencia semántica.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial: el modelo está marcado como `uncensored`, `decensored` y `abliterated`, con 0 rechazos en 100 prompts según la model card. Esta métrica, sin embargo, carece de valor práctico dado que el modelo no genera lenguaje coherente.

## Casos de uso

- Depuración de pipelines de transformers: sirve para validar la carga de `Gemma3ForConditionalGeneration`, el procesador multimodal y el pipeline `image-text-to-text` con un coste de memoria mínimo (repo de 0,1 GB).
- Pruebas de integración en CI/CD: al ser un modelo de 8,6 M de parámetros, se puede ejecutar en cualquier entorno de integración continua sin GPU, permitiendo testear rutas de código de inferencia multimodal.
- Validación del pipeline Heretic: los hiperparámetros ARA publicados permiten reproducir el proceso de ablación y verificar que la herramienta funciona correctamente antes de aplicarla a modelos de mayor tamaño.
- Investigación sobre técnicas de des-censura: sirve como caso base controlado para estudiar el efecto de la ablación de rangos arbitrarios sin la variabilidad de un modelo entrenado.
- Benchmarking de herramientas de evaluación de refusals: la métrica 0/100 refusals y la divergencia KL de 0,0047 permiten calibrar scripts de evaluación de comportamiento.
- Docencia y formación: ejemplo didáctico de cómo se construye un modelo Gemma 3 miniatura y cómo se aplica una técnica de modificación de comportamiento sobre él.

## Benchmarks y rendimiento

| Métrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Refusals | 0/100 | 0/100 |
| Divergencia KL | 0,0047 | 0 (por definición) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, lo cual es esperable al tratarse de un modelo con pesos aleatorios.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en bfloat16 (8,6 M de parámetros ≈ 17 MB de pesos, más overhead del procesador y del vision encoder).
- GPU recomendadas: cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090) o incluso CPU; no requiere acelerador dedicado.
- Cabe en cualquier GPU consumer y en CPU.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se menciona soporte de llama.cpp, Ollama ni TGI con cuantización.
- Latencia y throughput: no disponibles; al ser un modelo de juguete, la latencia estará dominada por el overhead del pipeline más que por el cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| VINAY-UMRETHE/gemma-3-heretic-3 | 8,6 M | no disponible | no disponible | Debug / reproducible |
| tiny-random/gemma-3 | ~8,6 M (config adaptada) | no disponible | no disponible | Debug / testing de transformers |
| google/gemma-3-27b-it | 27 B | no disponible en esta ficha | Gemma Terms of Use | Producción multimodal |

La comparativa con modelos de producción no es significativa: este artefacto no compite en capacidad, sino que es una herramienta de depuración y un ejemplo reproducible de ablación. Frente a `tiny-random/gemma-3`, la única diferencia es la aplicación de Heretic (ARA) sobre las capas 1-2.

## Limitaciones y advertencias

- Pesos inicializados aleatoriamente: el modelo no genera lenguaje coherente ni respuestas útiles; cualquier salida es ruido estadístico.
- No apto para producción bajo ningún concepto: no debe desplegarse en aplicaciones reales, ni siquiera como fallback.
- Sesgos conocidos: no disponibles; al no haber entrenamiento, no se pueden caracterizar sesgos de datos.
- Riesgo de alucinación: total, en el sentido de que toda salida es inventada por definición.
- Limitaciones de contexto e idioma: no documentadas; la configuración deriva de gemma-3-27b-it pero el autor no especifica la ventana efectiva.
- Restricciones de licencia: la licencia no está declarada en la información disponible, lo que impide determinar si el uso comercial está permitido. Dado que el modelo base es `tiny-random/gemma-3` (derivado de la config de Gemma 3), podrían aplicar los términos de uso de Gemma, pero esto no se confirma en la model card.
- La etiqueta `uncensored`/`abliterated` no debe interpretarse como una garantía de comportamiento seguro: en un modelo aleatorio la ausencia de rechazos es trivial y no refleja una eliminación real de salvaguardas.
- El modelo fue creado y actualizado el 2026-11-15 con 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-3
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Modelo de referencia de arquitectura: https://huggingface.co/google/gemma-3-27b-it
- Heretic (herramienta de ablación): https://heretic-project.org
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset harmless_alpaca: https://huggingface.co/datasets/mlabonne/harmless_alpaca
- Documentación de transformers (Gemma 3): https://huggingface.co/docs/transformers/model_doc/gemma3
