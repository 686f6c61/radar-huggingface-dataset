# xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic

## Resumen

Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic es un modelo de lenguaje de 4.539 millones de parametros publicado por el usuario xtools-at en Hugging Face. Se trata de la version "decensored" del checkpoint xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge, obtenida aplicando la herramienta Heretic v2.0.0.dev0, que realiza una ablacion de rangos arbitrarios (Arbitrary-Rank Ablation, ARA) sobre las capas 2 a 20 para reducir la tasa de rechazos del modelo original. El resultado es un modelo que mantiene la linea base Qwen3.5-4B pero con la alineacion de seguridad atenuada de forma medible: pasa de 95/100 rechazos en el modelo original a 3/100, con una divergencia KL de 0.0883 respecto al original.

El modelo original es a su vez un merge lineal ponderado de tres checkpoints derivados de Qwen3.5-4B: uno asociado a destilacion de razonamiento estilo Claude (Claude-3xMerge-Jackrong, peso 1.0), otro asociado a la linea Heretic de DavidAU (Heretic-2xMerge-DavidAU, peso 0.8) y un tercero de destilacion multiple (MultiDistill-3xMerge, peso 0.6). La intencion declarada es combinar comportamientos complementarios de razonamiento, conversacion y tareas agenticas conservando las capacidades generales de generacion de texto del Qwen3.5-4B subyacente.

Es relevante ahora porque ejemplifica una practica creciente en el ecosistema open source: la publicacion de variantes "abliterated" o "uncensored" reproducibles, con parametros de ablacion documentados y metricas de rechazo y divergencia KL, lo que permite auditar el compromiso entre supresion de rechazos y preservacion del comportamiento original. El autor indica que el modelo es reproducible y proporciona un directorio `reproduce` con instrucciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); tag `qwen3_5`, pipeline `image-text-to-text` |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only de la familia Qwen3.5 con aproximadamente 4.500 millones de parametros. El checkpoint final no se entrena desde cero: es el resultado de una cadena de merges lineales ponderados. El merge base (8xMerge) combina tres checkpoints: Claude-3xMerge-Jackrong (peso 1.0), Heretic-2xMerge-DavidAU (peso 0.8) y MultiDistill-3xMerge (peso 0.6). Sobre ese merge se aplica posteriormente Heretic v2.0.0.dev0, que realiza una ablacion de rangos arbitrarios sobre las capas 2 a 20 con los parametros `preserve_good_behavior_weight` 0.6444, `steer_bad_behavior_weight` 0.0004, `overcorrect_relative_weight` 0.9465 y `neighbor_count` 11.

En cuanto a los datos de entrenamiento, la model card documenta la procedencia de los datasets asociados a la linea de los modelos fuente, pero advierte explicitamente que no esta establecido que cada checkpoint fuente se entrenara directamente con todos ellos. Los datasets referenciados en los metadatos son: nohurry/Opus-4.6-Reasoning-3000x-filtered, Jackrong/Qwen3.5-reasoning-700x, Roman1111111/claude-opus-4.6-10000x, Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces. La receta de Jackrong, relacionada con la linea Claude, describe supervision enfocada a respuestas con razonamiento formateado en bloques ``. No se detalla el numero de tokens de entrenamiento ni si hubo RLHF o DPO en el checkpoint final. La innovacion tecnica destacable es la ablacion ARA de Heretic, que permite reducir rechazos de forma controlada y reproducible con metricas de divergencia KL publicadas.

## Capacidades

- Generacion de texto conversacional e instrucciones generales.
- Razonamiento multi-paso con formato de cadena de pensamiento (`<think>...</think>`), heredado de la linea de destilacion.
- Resolucion de problemas matematicos, logicos y analiticos (inferido de la linea de los modelos fuente, no medido de forma independiente en el checkpoint final).
- Preguntas y explicaciones tecnicas relacionadas con codigo.
- Respuestas estructuradas y multi-paso.
- Tareas orientadas a agentes y flujos de uso de herramientas cuando el entorno de inferencia lo soporta (declarado como caso de uso potencial, no verificado).
- Capacidad multimodal de entrada imagen-texto segun el tag `image-text-to-text` del repositorio; no se detalla el alcance.
- Supresion de rechazos: 3/100 rechazos frente a 95/100 del modelo original, segun la metrica publicada por el autor.

## Casos de uso

- Conversacion general y seguimiento de instrucciones: el modelo puede mantener dialogos multi-turno y responder a instrucciones directas; es el uso principal declarado en la model card y el que menos depende de las capacidades especializadas de los checkpoints fusionados.
- Razonamiento analitico y resolucion de problemas: la linea de destilacion con trazas de razonamiento estilo Claude y los datasets de trazas de Opus 4.6/4.7 lo hacen adecuado para tareas que requieren descomposicion en pasos, siempre que se acepte el formato de pensamiento explicito.
- Asistencia tecnica y explicaciones de codigo: puede responder preguntas sobre codigo y explicar conceptos tecnicos; util en herramientas de documentacion o soporte interno donde no se requiere ejecucion de codigo.
- Flujos agenticos y uso de herramientas: la model card lo menciona como caso potencial cuando el entorno de inferencia soporta tool calling; encaja en pipelines de agentes que necesiten un modelo pequeno y desplegable en local.
- Generacion de respuestas sin rechazos en dominios creativos o de investigacion: la reduccion de rechazos a 3/100 lo hace util para experimentacion con contenido que el modelo base rechazaria, por ejemplo escritura creativa con tematicas sensibles o investigacion sobre alineacion y comportamiento de modelos.
- Evaluacion de tecnicas de ablacion: al ser reproducible y publicar parametros ARA y divergencia KL, sirve como caso de estudio para investigadores que analizan el compromiso entre supresion de rechazos y preservacion de capacidades.
- Despliegue en entornos con recursos limitados: con 4.500 millones de parametros y pesos safetensors, es candidato a inferencia en GPU de consumo, aunque no se publican requisitos oficiales.

## Benchmarks y rendimiento

La model card solo publica metricas del proceso de decensoring, no benchmarks de capacidades (MMLU, HumanEval, GSM8K u otros).

| Metrica | Este modelo | Modelo original (8xMerge) |
|---|---|---|
| Rechazos | 3/100 | 95/100 |
| Divergencia KL | 0.0883 | 0 (por definicion) |

No se han publicado resultados de benchmarks de capacidades en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de 4.500 millones de parametros en safetensors, los pesos en precision completa ocupan aproximadamente 9 GB (el repositorio pesa 9.1 GB); en cuantizacion de 8 bits rondaria los 4,5-5 GB y en 4 bits los 2,5-3 GB, mas el espacio para el contexto y el cache KV.
- GPU recomendadas: no especificadas por el autor. Por tamano, es viable en GPU de consumo con suficiente VRAM y en GPU de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: previsiblemente si en tarjetas con 8 GB o mas de VRAM si se cuantiza; no confirmado por el autor.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente) y endpoints compatibles; no se confirma soporte de llama.cpp, Ollama o vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (heretic) | 4.539 M | no disponible | 3/100 | apache-2.0 | Version decensored del 8xMerge |
| xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge | 4.539 M (mismo base) | no disponible | 95/100 | apache-2.0 | Modelo original sin ablacion |
| Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled | ~4B (familia Qwen3.5-4B) | no disponible | no disponible | no disponible | Checkpoint de destilacion de razonamiento relacionado |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | ~4B (familia Qwen3.5-4B) | no disponible | no disponible | no disponible | Linea Heretic de DavidAU relacionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablacion deliberada de su alineacion de seguridad; la reduccion de rechazos a 3/100 implica que puede generar contenido que el modelo original rechazaria. No es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- La divergencia KL de 0.0883 respecto al original indica un cambio medible en la distribucion de salida; puede haber degradacion en algunas capacidades no cuantificada por el autor.
- La model card advierte que los casos de uso son inferidos de la linea de los modelos fuente y no son afirmaciones de rendimiento medidas de forma independiente en el checkpoint final.
- El mapeo exacto entre datasets y checkpoints fuente no esta completamente establecido; la procedencia de los datos de entrenamiento es parcial.
- No se publican datos de contexto maximo, idiomas soportados ni cuantizaciones disponibles; estos extremos deben verificarse antes de usarlo en produccion.
- Riesgo de alucinacion: inherente a los modelos de 4B y no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; la ablacion de seguridad puede alterar tambien el comportamiento ante temas sensibles de forma no uniforme.
- Licencia apache-2.0 permite uso comercial, pero la responsabilidad sobre el contenido generado sin alineacion recae en el desplegador.
- El modelo tiene pocas descargas (203) y un solo like en el momento de la consulta; no cuenta con validacion comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic
- Archivos del repositorio: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge-UNCENSORED-heretic/tree/main
- Modelo original (8xMerge): https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-Megamix-8xMerge
- Checkpoint fuente Claude-3xMerge-Jackrong: https://huggingface.co/xtools-at/Qwen3.5-4B-Claude-3xMerge-Jackrong
- Checkpoint fuente Heretic-2xMerge-DavidAU: https://huggingface.co/xtools-at/Qwen3.5-4B-Heretic-2xMerge-DavidAU
- Checkpoint fuente MultiDistill-3xMerge: https://huggingface.co/xtools-at/Qwen3.5-4B-MultiDistill-3xMerge
- Checkpoint relacionado de Jackrong: https://huggingface.co/Jackrong/Qwen3.5-4B-Claude-4.6-Opus-Reasoning-Distilled
- Checkpoint relacionado de DavidAU: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Heretic: https://heretic-project.org
