# x-square-robot/X-Planner-9B-0916

## Resumen

X-Planner-9B-0916 es un modelo multimodal de tipo image-text-to-text desarrollado por x-square-robot, diseñado como front-end de planificación para manipulación robótica de horizonte largo. El modelo recibe una instrucción de alto nivel, observaciones sincronizadas desde múltiples vistas y, opcionalmente, un historial de ejecución, y predice el siguiente evento estructurado con anclaje en acciones. El plan resultante se pasa a un modelo world-action downstream, lo que hace explícito e inspeccionable el estado intermedio de planificación.

El modelo se basa en la arquitectura Qwen3.5 de 9B (`Qwen3_5ForConditionalGeneration`) y cuenta con 9.409.813.744 parámetros almacenados en BF16. Ofrece dos interfaces complementarias: un modo de eventos legible, que produce estados de planificación estructurados en lenguaje natural, y un modo unificado que genera estados latentes compactos mediante Staircase Decoding.

Su relevancia radica en separar la planificación de alto nivel del control motor de bajo nivel en sistemas de IA encarnada, un enfoque que facilita la depuración, la evaluación y la integración modular en pipelines robóticos. La licencia Apache 2.0 y la ausencia de código remoto personalizado simplifican su adopción en investigación y producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (arquitectura Qwen3.5 9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 (pesos); codigo MIT |
| Formato de pesos | safetensors (BF16, sharded a 5 GB, 760 tensores) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen3.5 multimodal para generación condicional, con un modelo de lenguaje de 9B parámetros y un codificador visual que procesa observaciones multi-vista. El checkpoint se serializa en safetensors en BF16, fragmentado en shards de 5 GB, y conserva los 760 tensores de forma bit a bit. El repositorio incluye configuración de modelo y generación, tokenizer, chat template, configuración de procesador de imagen y vídeo, y metadatos mínimos del checkpoint; también un `release_manifest.json` con hashes de archivos y el SHA-256 de los pesos originales sin fragmentar para trazabilidad.

La innovación técnica destacable es la doble interfaz de planificación: el modo de eventos produce estados estructurados en lenguaje natural, mientras que el modo unificado genera estados latentes compactos mediante Staircase Decoding. El modelo está orientado a predecir el siguiente evento anclado en acciones a partir de instrucciones, observaciones y historial de ejecución, y el plan estructurado se transfiere a un modelo world-action downstream. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento aplicado a planificación de tareas de manipulación robótica.
- Comprensión de imágenes y vídeo multi-vista como entrada (pipeline image-text-to-text).
- Planificación estructurada de horizonte largo mediante eventos anclados en acciones.
- Modo de eventos: estados de planificación legibles en lenguaje natural, inspeccionables.
- Modo unificado: estados latentes compactos generados con Staircase Decoding.
- Integración con historial de ejecución opcional para replanificación condicionada.
- Interfaz para modelos world-action downstream.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling, function calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Planificación de manipulación robótica de horizonte largo: el modelo descompone una instrucción de alto nivel en una secuencia de eventos anclados en acciones que un modelo world-action ejecuta después, adecuado por su diseño específico para este dominio.
- Depuración de pipelines robóticos: el modo de eventos produce estados de planificación legibles que permiten inspeccionar dónde falla la descomposición de una tarea antes de llegar al control motor.
- Replanificación con historial de ejecución: al aceptar historial opcional junto con observaciones multi-vista, permite ajustar el plan cuando la ejecución previa se desvía de lo esperado.
- Investigación en IA encarnada: sirve como componente de planificación modular evaluable de forma aislada, con benchmark público de 1.500 episodios y 3.490 vídeos para comparar variantes.
- Evaluación comparativa de planificadores: la separación entre planificación y ejecución permite sustituir el planificador manteniendo el resto del stack, útil para experimentos controlados.
- Integración en simulación y entornos de entrenamiento: el formato estructurado de salida facilita conectar el planificador con simuladores que consumen eventos de acción discretos.
- Prototipado de asistentes robóticos bilingües inglés-chino: el soporte de ambos idiomas permite desplegar instrucciones en esos dos idiomas sin traducción intermedia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no reporta una nueva evaluación de X-Planner-9B-0916 y que los resultados del informe técnico u otras revisiones del checkpoint deben conservar su procedencia original de modelo y evaluación. El benchmark público asociado contiene 1.500 episodios, 3.490 vídeos y metadatos de planificación a nivel de episodio, pero las anotaciones temporales completas y el protocolo fijo de evaluación extremo a extremo son independientes de esta publicación de medios.

## Requisitos de hardware

- Los pesos en BF16 ocupan aproximadamente 18,82 GB; la inferencia requiere además memoria para activaciones, tokens visuales y caché de generación.
- VRAM estimada: por encima de 20 GB en BF16 para cargar pesos y operar con margen; el consumo total depende de la resolución y número de vistas de entrada y de la longitud de generación.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue cómodo en BF16 con entradas multi-vista; una RTX 4090 (24 GB) puede resultar ajustada y requerir reducción de resolución, número de vistas o longitud de contexto.
- Cabe en GPU de consumo solo con cuantización o recorte de entradas; no se documentan cuantizaciones oficiales (GGUF, AWQ, GPTQ) en la información disponible.
- Opciones de despliegue: Transformers (versión con soporte Qwen3.5; el checkpoint se guardó con 5.2.0) con PyTorch y Accelerate, `attn_implementation="sdpa"` y `device_map="auto"`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X-Planner-9B-0916 | 9,41B | no disponible | Planificación robótica multimodal (eventos y latentes) | Apache 2.0 | Hugging Face, Transformers |
| Qwen3.5-9B | 9B (arquitectura base) | no disponible | LLM multimodal generalista | no disponible en la información | Hugging Face |
| Alternativas de planificación encarnada | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se documenta soporte de castellano.
- No se publican resultados de benchmarks para esta revisión concreta; no deben atribuirse a este checkpoint los resultados del informe técnico u otras revisiones.
- La CLI de planificación por eventos requiere un backend de datos compatible con X-Planner y un snapshot de eventos preparado; el manifiesto de vídeo crudo del benchmark no es un snapshot preparado. La disponibilidad pública del backend debe consultarse en el repositorio de código.
- El modelo es un front-end de planificación: no ejecuta acciones por sí mismo y depende de un modelo world-action downstream para el control.
- Riesgo de alucinación en la generación de eventos no está cuantificado en la información disponible.
- Sesgos conocidos no documentados en la información proporcionada.
- Longitud de contexto no especificada, lo que limita la estimación de coste en tareas con historial largo.
- Licencia Apache 2.0 en pesos y MIT en código permiten uso comercial, pero los datos y medios del benchmark tienen condiciones propias que deben revisarse.
- El modelo requiere Transformers con soporte Qwen3.5 (guardado con 5.2.0); versiones anteriores pueden no cargarlo correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/x-square-robot/X-Planner-9B-0916
- Página del proyecto: https://x-square-robot.github.io/Xplanner/
- Código y guía de inferencia: https://github.com/X-Square-Robot/Xplanner
- Runtime de estados de evento: https://github.com/X-Square-Robot/Xplanner/tree/main/x_planner/data/event_states
- Informe técnico (arXiv): https://arxiv.org/abs/2609.25187
- PDF del informe técnico: https://github.com/X-Square-Robot/Xplanner/blob/main/docs/paper/X_Planner_Event_Structured_Task_Planning_for_Embodied_Intelligence.pdf
- Benchmark: https://huggingface.co/datasets/x-square-robot/xplanner-benchmark
- Modelo base de arquitectura: https://huggingface.co/Qwen/Qwen3.5-9B
