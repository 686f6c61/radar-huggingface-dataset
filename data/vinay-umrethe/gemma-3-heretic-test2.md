# VINAY-UMRETHE/gemma-3-heretic-test2

## Resumen

`VINAY-UMRETHE/gemma-3-heretic-test2` es un modelo de prueba publicado en Hugging Face por el usuario VINAY-UMRETHE. No es un modelo entrenado en sentido estricto: es una versión "decensored" (abliterated) generada automáticamente con la herramienta Heretic v2.1.0.dev0 sobre `tiny-random/gemma-3`, un checkpoint de depuración de 8,6 millones de parámetros inicializado de forma aleatoria a partir de la configuración de `google/gemma-3-27b-it`.

Su relevancia es metodológica, no práctica: sirve para verificar que el pipeline de ablación de Heretic (Arbitrary-Rank Ablation) se ejecuta de extremo a extremo y produce artefactos reproducibles. El propio autor indica que el modelo base "is for debugging" y que está inicializado aleatoriamente, por lo que no genera texto coherente ni tiene capacidades reales de razonamiento, visión o código.

La arquitectura subyacente es Gemma 3 multimodal (`Gemma3ForConditionalGeneration`, pipeline `image-text-to-text`), pero con dimensiones reducidas drásticamente: 32 de dimensión oculta, 2 capas de texto, 2 capas de visión y una sola cabeza de atención. Cualquier uso en producción está fuera de lugar; su interés se limita a la investigación sobre técnicas de ablación y a la validación de herramientas de "decensoring".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Gemma 3 (texto + visión), configurada a escala mínima |
| Parametros totales | 8.600.288 (8,6 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la model card; el config deriva de gemma-3-27b-it pero no se documenta la ventana efectiva) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 en el repo; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo reutiliza la clase `Gemma3ForConditionalGeneration` de transformers, con un `text_config` de 32 de dimensión oculta, 128 de dimensión intermedia, `head_dim` 32, 1 cabeza de atención, 1 cabeza KV y 2 capas ocultas con `sliding_window_pattern = 2`. El `vision_config` también se reduce a 32 de dimensión oculta, 2 capas, 1 cabeza y 128 de intermedia. Los pesos se inicializan con una normal de media 0 y desviación 0,5 bajo `torch.manual_seed(42)`, en bfloat16. No hay entrenamiento supervisado, ni preentrenamiento, ni RLHF/DPO: es un modelo aleatorio.

La única "innovación" documentada es la aplicación de Arbitrary-Rank Ablation (ARA) mediante Heretic v2.1.0.dev0, con parámetros `start_layer_index=1`, `end_layer_index=2`, `preserve_good_behavior_weight=0.0971`, `steer_bad_behavior_weight=0.0035`, `overcorrect_relative_weight=0.2419` y `neighbor_count=5`. El objetivo declarado de Heretic es reducir la tasa de rechazos (refusals) modificando direcciones de activación en capas intermedias. El autor incluye un directorio `reproduce/` con instrucciones para regenerar el modelo, lo que convierte el repositorio en un caso de test reproducible del pipeline.

## Capacidades

- Generación de texto: nominalmente soportada por el pipeline, pero sin utilidad real al ser pesos aleatorios.
- Entrada imagen-texto: el pipeline `image-text-to-text` acepta imágenes y texto, aunque la salida no será coherente.
- Tool calling / function calling: no disponible.
- Razonamiento multi-paso y agentes: no disponible.
- Capacidades multilingües: no disponible; no se documenta ningún idioma.
- Modo "thinking", audio u otras capacidades especiales: no disponible.
- Valor real: servir como banco de pruebas reproducible para Heretic y para validar flujos de ablación sobre arquitecturas Gemma 3.

## Casos de uso

- Validación del pipeline de Heretic: ejecutar el script de `reproduce/` para comprobar que la versión de la herramienta instalada produce el mismo checkpoint (mismos parámetros ARA y misma divergencia KL de 0,0017).
- Test de integración de transformers: al ser un Gemma 3 de 8,6 M de parámetros y 0,1 GB, permite verificar en segundos que `Gemma3ForConditionalGeneration` carga, procesa imágenes y genera tokens en un entorno concreto (por ejemplo, una imagen Docker de CI).
- Pruebas de humo en pipelines de inferencia: útil para comprobar que TGI o endpoints compatibles aceptan la arquitectura Gemma 3 multimodal sin consumir GPU real.
- Investigación sobre abliteration: comparar la tasa de rechazos (87/100 en este modelo frente a 86/100 en el original) y la divergencia KL para estudiar cómo afectan los hiperparámetros ARA a modelos de juguete antes de aplicarlos a modelos grandes.
- Docencia y divulgación: ejemplo mínimo para explicar qué es una ablación de direcciones de activación y cómo se mide su impacto con un clasificador de rechazos.
- Reproducibilidad de publicaciones: adjuntar el checkpoint como artefacto verificable en un artículo o nota técnica sobre decensoring.

## Benchmarks y rendimiento

Los únicos datos publicados por el autor son métricas internas del pipeline de Heretic, no benchmarks estándar de capacidad:

| Metrica | Este modelo | Modelo original (tiny-random/gemma-3) |
|---|---|---|
| Rechazos (clasificador) | 87/100 | 86/100 |
| Divergencia KL | 0,0017 | 0 (por definición) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K, MMMU, etc.) en la información disponible. Dado que los pesos son aleatorios, cualquier puntuación en esos benchmarks sería equivalente a la de un modelo sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en bfloat16 (8,6 M de parámetros, repo de 0,1 GB); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con soporte CUDA o incluso CPU; una RTX 4090, A100 o H100 están sobredimensionadas para este checkpoint.
- Cabe en consumer GPU: sí, en cualquier modelo con al menos 1 GB de memoria (GTX 1050, RTX 3050, etc.), y también en CPU.
- Opciones de despliegue: transformers (vía `pipeline("image-text-to-text")` con `trust_remote_code=True`), TGI (el repo incluye el tag `text-generation-inference`), endpoints compatibles con la API de Hugging Face y FriendliAI según los resultados de búsqueda.
- Latencia y throughput: no disponibles de forma oficial; por el tamaño, la latencia será de milisegundos en GPU moderna, pero la salida no será coherente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gemma-3-heretic-test2 (este) | 8,6 M | no disponible | Test reproducible de ablación Heretic | no disponible | Hugging Face, FriendliAI |
| tiny-random/gemma-3 | ~8,6 M (misma config) | no disponible | Modelo de depuración aleatorio | no disponible | Hugging Face |
| google/gemma-3-27b-it | 27 B | no disponible en la informacion | Modelo multimodal instructivo real | Gemma Terms of Use (no confirmada en esta ficha) | Hugging Face |
| VINAY-UMRETHE/gemma-3-heretic-test | 8,6 M | no disponible | Versión previa del mismo experimento | no disponible | Hugging Face, FriendliAI |

La comparación relevante es con el original `tiny-random/gemma-3` (misma arquitectura y tamaño, sin ablación) y con la variante `gemma-3-heretic-test` del mismo autor. Frente a `google/gemma-3-27b-it` la diferencia de escala es de tres órdenes de magnitud y no son intercambiables en ningún caso de uso real.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo no ha sido entrenado; sus salidas son ruido estadístico y no deben interpretarse como texto, razonamiento o descripción de imágenes.
- No apto para producción: cualquier despliegue orientado a usuarios finales carece de sentido técnico.
- Sesgos: no evaluables, al no existir distribución de entrenamiento; el clasificador de rechazos (87/100) sugiere que la ablación no redujo los rechazos en este checkpoint de prueba.
- Alucinación: total, en el sentido de que toda salida es inventada; no aplica la noción habitual de alucinación porque no hay conocimiento subyacente.
- Licencia no disponible: no se puede asumir uso comercial; además, al derivar de `tiny-random/gemma-3` y de la config de `google/gemma-3-27b-it`, podrían aplicar los Gemma Terms of Use, no confirmados en la información disponible.
- Idiomas y contexto no documentados: no hay garantía de comportamiento multilingüe ni de ventana de contexto efectiva.
- Riesgo reputacional: el etiquetado "uncensored/abliterated" puede inducir a error si se interpreta como un modelo funcional sin restricciones; aquí es solo una prueba de herramienta.
- Reproducibilidad dependiente de la versión: el resultado está ligado a Heretic v2.1.0.dev0 y a la versión de transformers usada; cambios de versión pueden alterar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-test2
- Modelo base: https://huggingface.co/tiny-random/gemma-3
- Configuración de referencia: https://huggingface.co/google/gemma-3-27b-it
- Versión previa del mismo autor: https://huggingface.co/VINAY-UMRETHE/gemma-3-heretic-test
- Endpoint en FriendliAI: https://friendli.ai/models/VINAY-UMRETHE/gemma-3-heretic-test
- Proyecto Heretic: https://heretic-project.org
