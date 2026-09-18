# willamazon1/Qwen3-8B-SDFT-Math-LoRA-pristine

## Resumen

Qwen3-8B-SDFT-Math-LoRA-pristine es un ajuste fino del modelo base denso Qwen3-8B-Base, publicado por el usuario willamazon1. Se trata de un checkpoint de matemáticas y razonamiento obtenido tras una etapa de SFT sobre una mezcla equilibrada de datos (matemáticas, QA con recuperación aumentada y diálogo con uso de herramientas) seguida de una etapa de RL con GRPO sobre problemas matemáticos con recompensa verificable de respuesta en caja. El repositorio distribuye los pesos en bf16 completamente fusionados: el adaptador LoRA (rango 128, alpha 128) está plegado en las matrices del modelo base, por lo que no hace falta cargar PEFT ni ningún adaptador adicional.

La relevancia de esta ficha es sobre todo metodológica y de reproducibilidad. El propio autor documenta de forma honesta que la etapa de RL, a lo largo de 120 rollouts, fue estable pero no produjo una mejora medible: el pass@1 sobre el conjunto de entrenamiento pasó de 0,558 a 0,578 con una pendiente lineal de +4e-5 por rollout frente a una desviación estándar por rollout de 0,027, es decir, un cambio dentro del ruido. El autor lo describe explícitamente como «el modelo SFT más un delta de RL pequeño que no degrada», no como una mejora demostrada, y señala que es el primer checkpoint de esta línea cuyos pesos base congelados están provablemente sin corromper.

Se trata de un modelo de estilo base (completion), no de un modelo de chat instruido: debe usarse con prompts tipo `Question: … \nAnswer:` en lugar de plantillas de conversación. El modelo tiene 8.190.735.360 parámetros (8,19B), 36 capas y licencia Apache-2.0, con un tamaño de repositorio de 16,4 GB y 196 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B-Base), 36 capas |
| Parametros totales | 8.190.735.360 (8,19B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la model card; se hereda la del modelo base Qwen/Qwen3-8B-Base) |
| Tipos de cuantizacion | Pesos en bf16 fusionados; no se distribuyen variantes cuantizadas (GGUF, AWQ, GPTQ, bitsandbytes) en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, LoRA fusionada en las matrices base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-8B-Base, un transformer denso de 36 capas y 8,19B parámetros. El pipeline de entrenamiento consta de tres etapas: (1) base preentrenada Qwen3-8B-Base; (2) SFT supervisado sobre una mezcla equilibrada de matemáticas, QA con recuperación aumentada y diálogo con uso de herramientas; y (3) RL de matemáticas mediante GRPO sobre problemas con recompensa verificable de respuesta en caja.

La etapa de RL entrena adaptadores LoRA de rango 128 y alpha 128 (escalado 1.0) sobre las proyecciones `q/k/v`, `o_proj`, `gate/up_proj` y `down_proj` de todas las capas, durante 120 rollouts. La receta sigue un enfoque estilo DAPO: clip-higher con valores 0,2/0,28, muestreo dinámico, pérdida de gradiente de política a nivel de token e importance sampling truncado para corregir el desajuste entre entrenamiento y rollout. El entrenamiento se realizó con slime sobre Megatron-LM con paralelismo de tensor TP=4, CP=1 y precisión bf16. Tras el RL, los adaptadores se fusionaron íntegramente en los pesos base, de modo que el checkpoint resultante es un reemplazo directo del modelo base sin necesidad de cargar PEFT.

## Capacidades

- Generación de texto de estilo completion (modelo base, no chat): espera prompts con formato `Question: … \nAnswer:`.
- Razonamiento matemático con respuestas verificables en caja, objetivo principal de la etapa de RL.
- Razonamiento multi-paso heredado del modelo base, estimulado por el entrenamiento con recompensa verificable.
- Diálogo con uso de herramientas (tool use) como parte del dataset de SFT, aunque el checkpoint final no está formateado como modelo instruido.
- QA con recuperación aumentada (retrieval-augmented QA) presente en la mezcla de SFT.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modos de «thinking» explícitos.

## Casos de uso

- Evaluación de recetas de RL: el checkpoint sirve como referencia reproducible para estudiar si GRPO con LoRA sobre un modelo 8B aporta mejora medible, dado que el propio autor documenta que el delta queda dentro del ruido estadístico.
- Investigación en recompensas verificables: permite analizar el diseño de recompensas de respuesta en caja sin tener que reproducir el pipeline completo de entrenamiento.
- Generación de soluciones matemáticas en formato de completado: útil en pipelines por lotes donde se envían problemas como texto plano y se parsea la respuesta en caja, sin necesidad de plantilla de chat.
- Base para posteriores ajustes: al ser un drop-in replacement de Qwen3-8B-Base con pesos ya fusionados, puede usarse como punto de partida para nuevos SFT o RL específicos de dominio.
- Comparación de checkpoints de una misma línea: el autor lo presenta como el primer checkpoint con pesos base congelados provablemente sin corromper, lo que lo hace adecuado como control en experimentos comparativos.
- Prototipado de asistentes de resolución de problemas en entornos de investigación donde se disponga de verificación posterior de las respuestas antes de usarlas.
- Análisis de mezclas de datos de SFT: al combinar matemáticas, QA con recuperación y diálogo con herramientas, permite estudiar el efecto de mezclas equilibradas sobre tareas heterogéneas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval, etc.) en la información disponible. La model card únicamente reporta métricas internas del entrenamiento de RL, que se reproducen a continuación tal como aparecen:

| Metrica | Valor |
|---|---|
| Pass@1 en conjunto de entrenamiento (inicio de RL) | 0,558 |
| Pass@1 en conjunto de entrenamiento (final de RL) | 0,578 |
| Pendiente lineal por rollout | +4e-5 (desviación estándar por rollout: 0,027) |
| Prompts resueltos 16/16 | 50,6 → 56,9 de 256 muestreados |
| Prompts nunca resueltos | Sin cambios (plano) |
| Rollouts de RL | 120 |

El autor concluye explícitamente que el cambio en pass@1 está dentro del ruido y que no debe interpretarse como una mejora demostrada sobre el modelo SFT.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 16,4 GB solo para los pesos, más memoria para caché KV y activaciones; en la práctica se recomienda reservar del orden de 20-24 GB para contextos moderados.
- VRAM estimada en 4 bits: alrededor de 5-6 GB para los pesos, aunque esta variante no se distribuye en el repositorio y requeriría cuantizar por cuenta propia.
- GPU recomendadas: A100 (40/80 GB) y H100 para despliegue con paralelismo y lotes grandes; RTX 4090 o RTX 3090 (24 GB) para inferencia en bf16 con contexto contenido.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) en bf16; en tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) previsiblemente sea necesario cuantizar a 4/8 bits.
- Opciones de despliegue: transformers (uso documentado por el autor), vLLM y TGI (el repositorio incluye la etiqueta `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio solo contiene safetensors en bf16.
- Latencia y throughput: no disponibles (no publicados en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Relacion con este checkpoint |
|---|---|---|---|---|
| willamazon1/Qwen3-8B-SDFT-Math-LoRA-pristine | 8,19B (denso, 36 capas) | No disponible | Apache-2.0 | Checkpoint objeto de esta ficha; pesos bf16 con LoRA fusionada |
| Qwen/Qwen3-8B-Base | 8,19B (denso, 36 capas) según la model card | No disponible en la información proporcionada | No disponible en la información proporcionada | Modelo base exacto; este checkpoint es un drop-in replacement tras SFT y RL |
| Modelos de matemáticas de ~7-8B (por ejemplo, destilaciones de razonamiento) | No disponible | No disponible | No disponible | Alternativas de la misma categoría, pero sin datos de comparación en la información proporcionada |

No se dispone de datos comparativos de rendimiento, contexto o licencia de terceros en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- No es un modelo de chat: es un modelo de estilo base que debe invocarse con prompts de completion (`Question: … \nAnswer:`), no con plantillas conversacionales.
- La mejora reportada por la etapa de RL no es estadísticamente significativa; el autor recomienda tratarlo como el modelo SFT más un delta pequeño, no como una mejora demostrada.
- Las respuestas matemáticas no están garantizadas como correctas; deben verificarse antes de depender de ellas.
- Hereda los sesgos y la fecha de corte de conocimiento de Qwen/Qwen3-8B-Base.
- Idiomas soportados no documentados en la model card.
- Longitud de contexto no especificada en la model card; conviene confirmarla contra el modelo base antes de usarlo en producción con contextos largos.
- Licencia Apache-2.0, que en principio permite uso comercial, pero al derivar de Qwen3-8B-Base conviene revisar también los términos aplicables al modelo base.
- Solo se distribuyen pesos safetensors en bf16; no hay versiones cuantizadas oficiales, lo que añade trabajo si se quiere desplegar en hardware limitado.
- El repositorio tiene 196 descargas y 0 «likes», con lo que la validación por parte de la comunidad es muy limitada.
- La búsqueda web realizada no devolvió ningún resultado relevante sobre el modelo (los resultados obtenidos correspondían a sitios escolares sin relación), por lo que no hay documentación externa adicional que respalde o contradiga la model card.

## Enlaces

- HuggingFace: https://huggingface.co/willamazon1/Qwen3-8B-SDFT-Math-LoRA-pristine
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Framework de entrenamiento slime: https://github.com/THUDM/slime
- Resultados de búsqueda web: sin resultados relevantes sobre el modelo (solo páginas de centros escolares sin relación con el tema)
