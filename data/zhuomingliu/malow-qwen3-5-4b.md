# zhuomingliu/MaLoW-Qwen3.5-4B

## Resumen

MaLoW-Qwen3.5-4B es un checkpoint de inferencia publicado por el usuario zhuomingliu para la investigacion "Memory as Weights: Internalizing Long-Term History for Streaming Videos". No es un modelo base autonomo, sino un adaptador que se carga sobre Qwen/Qwen3.5-4B y que anade un mecanismo de memoria interna (memory-as-weights) orientado a la comprension de video en streaming con historial de largo plazo. El repositorio contiene modulos de inferencia, no los pesos completos del modelo base.

El checkpoint registra 235.033.152 parametros en formato safetensors (aproximadamente 235 M, es decir, un orden de magnitud por debajo del modelo base de ~4B), con un tamano de repositorio de 1,0 GB y licencia Apache-2.0. Su relevancia actual reside en atacar uno de los cuellos de botella del video streaming: mantener contexto historico sin recurrir a ventanas de contexto crecientes, internalizando la memoria en los propios pesos del adaptador.

El proyecto depende de una futura publicacion de codigo en el repositorio MaLoW (github.com/dragonlzm/MaLoW), aun pendiente de publicacion publica, por lo que la evaluacion y el uso practico requieren ese runtime especifico. Los resultados reportados en la model card son referencias del articulo, no una reevaluacion de esta exportacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador sobre transformer denso multimodal (base Qwen3.5-4B) con mecanismo memory-as-weights |
| Parametros totales | 235.033.152 (checkpoint del adaptador); modelo base Qwen3.5-4B de ~4B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens en el modelo base Qwen3.5-4B (no confirmada para el adaptador) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base dispone de GGUF (por ejemplo, variante de Unsloth) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de ~4B parametros con contexto nativo de 262.144 tokens y entrenamiento de fusion temprana sobre tokens multimodales (texto, imagen y video). MaLoW se construye sobre esa base mediante un adaptador de 235 M de parametros que implementa el enfoque "memory-as-weights": en lugar de gestionar el historial de un video en streaming como una ventana de contexto creciente, el metodo lo internaliza en los pesos del modulo de memoria. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion tecnica principal es precisamente ese mecanismo de memoria persistente para video en tiempo real, evaluado con los benchmarks OVO-Bench y StreamingBench. No se dispone de informacion sobre detalles de atencion (lineal, dispersa o completa), estrategias de decodificacion especulativa ni presupuesto de computo de entrenamiento.

## Capacidades

- Comprension de video en streaming con memoria de largo plazo internalizada en los pesos.
- Razonamiento temporal sobre el video en tres regimenes evaluados: backward, real-time y forward.
- Capacidades de vision-lenguaje heredadas del modelo base Qwen3.5-4B (texto, imagenes y video nativos).
- Respuesta en tiempo real sobre flujos de video continuos (puntuacion mas alta en la subtarea Real-time).
- Comportamiento proactivo y de omni-comprension segun StreamingBench.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Analisis de video en directo con memoria historica: el adaptador permite recordar eventos ocurridos minutos atras en un stream sin reinyectar el historial completo en el contexto, lo que resulta adecuado para vigilancia o monitorizacion continua.
- Asistentes de video bajo demanda: responder preguntas sobre un video largo (por ejemplo, una clase o una reunion) apoyandose en la memoria interna en lugar de truncar el contexto.
- Analisis retrospectivo de retransmisiones (backward reasoning): reconstruir causas o explicaciones de eventos pasados dentro del video, aprovechando la subtarea backward de OVO-Bench.
- Monitorizacion de entornos en tiempo real: la puntuacion de 70,52 en la categoria Real-time lo hace candidato para aplicaciones que requieren respuestas inmediatas sobre el fotograma actual con conocimiento del pasado reciente.
- Sistemas proactivos de alerta: la subtarea Proactive de StreamingBench (56,8) apunta a escenarios donde el modelo debe anticipar o sugerir acciones sin una pregunta explicita.
- Investigacion academica en memoria para modelos multimodales: sirve como referencia reproducible sobre el paradigma memory-as-weights para video streaming.
- Asistencia a accesibilidad: describir y resumir contenido de video continuo para personas con discapacidad visual, manteniendo coherencia temporal gracias a la memoria persistente.

## Benchmarks y rendimiento

Resultados de referencia reportados en la model card (porcentajes; no son una reevaluacion fresca de esta exportacion).

| OVO-Bench | Backward | Real-time | Forward | Average |
|---|---:|---:|---:|---:|
| MaLoW-Qwen3.5-4B | 61,15 | 70,52 | 50,82 | 60,83 |

| StreamingBench | Average | Real-time | Omni | Proactive | SQA |
|---|---:|---:|---:|---:|---:|
| MaLoW-Qwen3.5-4B | 71,18 | 80,8 | 60,2 | 56,8 | 55,2 |

La media global de OVO-Bench se calcula a partir de las subtareas listadas usando pesos 2500:1500:250:250. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la informacion disponible.

## Requisitos de hardware

- El adaptador suma 235 M de parametros (~1,0 GB de repositorio); el coste de inferencia domina lo que exige el modelo base Qwen3.5-4B.
- El modelo base corre en torno a 8 GB de VRAM a precision completa, segun las referencias consultadas.
- En cuantizacion Q4 el base ocupa aproximadamente 2,5-3 GB, lo que permite ejecucion en GPU de consumo (por ejemplo, RTX 3060 de 12 GB o superiores) e incluso en CPU.
- Para el adaptador no se especifican requisitos de VRAM adicionales mas alla de los del base.
- Opciones de despliegue: el runtime propietario de MaLoW (pendiente de publicacion publica) es necesario para evaluacion; para el modelo base se citan runners como LM Studio, Jan AI y GGUF de Unsloth.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Benchmark destacado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MaLoW-Qwen3.5-4B | 235 M (adaptador) sobre base de ~4B | Heredado del base (262.144 tokens) | OVO-Bench avg 60,83; StreamingBench avg 71,18 | Apache-2.0 | Repositorio publico; runtime pendiente |
| Qwen3.5-4B (base) | ~4B denso | 262.144 tokens | Aproxima Qwen3-30B en MMLU-Pro y supera a GPT-5-Nano en vision, segun fuentes secundarias | Apache-2.0 | Publico (HuggingFace, LM Studio, GGUF) |
| Qwen3-30B (generacion anterior) | ~30B | no disponible | Referencia comparativa en MMLU-Pro para el base | no disponible | Publico |

No se dispone de comparativas directas de MaLoW frente a otros adaptadores de memoria para video en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar por separado Qwen/Qwen3.5-4B y cargar el adaptador a traves del runtime MaLoW.
- El codigo de MaLoW aun no esta publicado publicamente; sin el, la evaluacion y el uso no son reproducibles.
- Los resultados de benchmarks son cifras de referencia del articulo, no una reevaluacion de esta exportacion concreta.
- No se documentan sesgos, idiomas soportados ni riesgos de alucinacion especificos del adaptador.
- El repositorio registra 0 descargas y 0 likes, sin senales de adopcion ni validacion por terceros.
- Aunque la licencia es Apache-2.0, los pesos del modelo base y los activos de los benchmarks conservan sus terminos upstream (ver LICENSE y NOTICE).
- La longitud de contexto efectiva del adaptador no esta confirmada; solo se conoce la del base.
- Idoneidad para produccion no verificada: no hay datos de latencia, throughput ni pruebas de carga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhuomingliu/MaLoW-Qwen3.5-4B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio de codigo MaLoW (pendiente de publicacion): https://github.com/dragonlzm/MaLoW
- Guia local Qwen 3.5 4B (theaibench): https://theaibench.ai/models/qwen-3-5-4b/
- Qwen3.5-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
- Qwen3.5-4B en Firethering: https://firethering.com/qwen3-5-4b-local-ai-model/
- Qwen3.5-4B en Awesome Agents: https://awesomeagents.ai/models/qwen-3-5-4b/
- Cobertura de Reuters sobre Qwen3.5: https://www.reuters.com/world/china/alibaba-unveils-new-qwen35-model-agentic-ai-era-2026-02-16/
