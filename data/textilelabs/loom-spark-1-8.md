# textilelabs/Loom-Spark-1.8

## Resumen

Loom Spark 1.8 es un modelo de lenguaje de 18,85 millones de parámetros desarrollado por Textile Labs, un proyecto independiente que entrena modelos pequeños desde cero en hardware de consumo. Es la tercera generación de la familia Loom, tras Loom Spark (7,6M) y Loom Spark 1.5 (12,3M). Su propuesta es deliberadamente contraria a la tendencia actual: en lugar de acumular conocimiento, el modelo está entrenado para ser honesto sobre los límites de su propio saber y para generar consultas de búsqueda limpias que un harness externo ejecuta. Se trata de un experimento de "filosofía de la mente" aplicada a modelos pequeños, con un enfoque en la autoconciencia del modelo y en la interacción con herramientas.

Arquitectónicamente es un transformer decoder estilo GPT-2 con 7 capas, 7 cabezas de atención y dimensión de modelo 448, con una ventana de contexto de solo 256 tokens y un vocabulario BPE de 4096 tokens. Fue entrenado completamente desde cero en una CPU (Dell OptiPlex 9020 con i5-4690, sin GPU), lo que demuestra que es posible obtener resultados razonables con recursos mínimos. Su relevancia actual radica en ser un caso de estudio para el desarrollo de modelos pequeños con capacidades de tool-use y agentes, así como en su licencia MIT que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (estilo GPT-2) |
| Parametros totales | 18.850.496 (18,85M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | Safetensors (precision no especificada) y GGUF (niveles no especificados) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | Safetensors, GGUF |

## Arquitectura y entrenamiento

Loom Spark 1.8 es un transformer decoder causal con 7 capas, 7 cabezas de atencion y dimension de modelo 448. Sigue la arquitectura clasica de GPT-2, sin innovaciones estructurales destacables, pero con un diseno de curriculum propio: el modelo se entrena para reconocer su propio tamano (18,85M parametros) y para distinguir entre conocimiento interno y externo. El entrenamiento se realizo desde cero en una CPU de 2013 (i5-4690, 4 nucleos, sin GPU), lo que condiciona el tamano y la ventana de contexto. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset, aunque se menciona un "curriculum design" y un "data format" heredados de la version 1.5. No se ha aplicado RLHF ni DPO; el entrenamiento es supervisado con un formato de prompt fijo que incluye marcadores `<tools:off>`, `<tools:on>`, `<lookup>` y `<result>`.

La innovacion principal no esta en la arquitectura sino en el protocolo de interaccion: el modelo puede operar en modo offline (respondiendo desde su limitado conocimiento) o en modo online (emitiendo una consulta de busqueda que un harness externo ejecuta y cuyo resultado se inyecta en el contexto). El modelo nunca genera bloques `<result>` por si mismo, lo que se ha verificado en evaluaciones. Ademas, se corrigio un defecto de la version 1.5 que hacia que el modelo declarara incorrectamente su tamano (por ejemplo, "siete millones" o "doce millones"); en 1.8 el curriculum lo entrena para declarar consistentemente 18,85M.

## Capacidades

- Generacion de texto basica con un vocabulario reducido (4096 tokens BPE).
- Razonamiento conversacional limitado, con respuestas cortas y honestas sobre sus limites.
- Tool use mediante un protocolo de busqueda externa: emite consultas `<lookup>...</lookup>` que un harness ejecuta y devuelve como `<result>`.
- Soporte de agentes a traves del harness `loomspark-harness` (v0.2.1), que incluye CLI (`loom-chat`) y una interfaz web (`loom-web`).
- Capacidad de autoidentificacion: el modelo conoce su tamano, su naturaleza temporal y su dependencia del harness.
- Multilingue: no, solo ingles.
- No tiene capacidades de vision, audio ni thinking mode explicito.

## Casos de uso

- Investigacion en modelos pequenos: sirve como banco de pruebas para estudiar como modelos de menos de 20M de parametros pueden manejar protocolos de tool-use y autoconciencia. Los investigadores pueden analizar los pesos y el curriculum para entender que comportamientos emergen con recursos minimos.
- Educacion en IA: es un ejemplo didactico de entrenamiento desde cero en CPU, ideal para cursos de aprendizaje automatico donde se quiera mostrar el ciclo completo de entrenamiento, evaluacion y despliegue sin necesidad de GPUs.
- Prototipado de agentes conversacionales: el harness incluido permite montar rapidamente un agente que consulta la web en tiempo real, util para demostraciones o pruebas de concepto de sistemas de busqueda aumentada.
- Experimentacion con formatos de prompt: su sensibilidad al formato exacto (sin espacio tras `<loom>`) lo convierte en un caso de estudio sobre la importancia de la distribucion de entrenamiento en la generacion.
- Evaluacion de tecnicas de cuantizacion: al ser un modelo tiny, se puede usar para probar diferentes niveles de cuantizacion GGUF y medir su impacto en la calidad de salida con coste computacional minimo.
- Desarrollo de harness de herramientas: el protocolo `<lookup>`/`<result>` es un ejemplo sencillo de como integrar un LLM con una API de busqueda, replicable en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye una evaluacion propia sobre una bateria de 30 preguntas offline, 12 sondas de identidad, 16 sondas de tamano propio y 10 sondas de busqueda online, comparando con la version 1.5:

| Metrica | v1.5 | 1.8 |
|---|---|---|
| Val loss | 0.3434 | 0.3279 |
| Sondas de identidad con fuga de `<lookup>` | 0/12 | 0/12 |
| Respuestas correctas sobre tamano propio | 0 | 11 |
| Respuestas obsoletas/incorrectas sobre tamano | 8 | 0 |
| Busquedas online limpias | 7/10 | 8/10 |
| Bloques `<result>` generados por el modelo | 0 | 0 |
| Fuga de `<lookup>` offline (modelo crudo) | 18/30 | 16/30 |

Estos datos indican una mejora consistente en todas las metricas medidas, pero no son comparables con benchmarks de modelos convencionales.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 18,85M de parametros, en FP32 ocupa aproximadamente 75 MB. Con cuantizacion a 4 bits, menos de 10 MB. Cabe en cualquier GPU moderna, incluso en iGPUs.
- GPU recomendadas: no se requiere GPU; el modelo se entreno y puede ejecutarse en CPU. Cualquier procesador con 4 GB de RAM es suficiente.
- Compatibilidad con consumer GPU: si, absolutamente. Incluso una Raspberry Pi podria ejecutarlo.
- Opciones de despliegue: transformers (Python), Ollama (con Modelfile personalizado), llama.cpp (via GGUF), y el harness propio `loomspark-harness`.
- Latencia y throughput: no se proporcionan datos oficiales, pero por el tamano, la generacion es practicamente instantanea en CPU moderna (menos de 10 ms por token estimado).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocab | Val loss | Licencia |
|---|---|---|---|---|---|
| Loom Spark v1 | 7,56M | 256 | 4096 | 0.3372 | MIT |
| Loom Spark 1.5 | 12,32M | 256 | 4096 | 0.3434 | MIT |
| Loom Spark 1.8 | 18,85M | 256 | 4096 | 0.3279 | MIT |

No se dispone de comparativas con otros modelos tiny de la misma categoria (por ejemplo, GPT-2 small con 124M o modelos como TinyStories) en la informacion proporcionada. La comparativa se limita a los predecesores directos de la misma familia.

## Limitaciones y advertencias

- Conocimiento factual muy limitado: el modelo "sabe muy poco a proposito" y no debe usarse para hechos, medicina, derecho, finanzas ni ninguna tarea que requiera informacion precisa.
- Riesgo de alucinacion: aunque esta entrenado para admitir ignorancia, puede generar respuestas inventadas cuando se le presiona fuera de su distribucion.
- Contexto extremadamente corto (256 tokens): no es adecuado para tareas que requieran razonamiento de largo alcance o multiples turnos con mucho historial.
- Solo ingles: no soporta otros idiomas.
- Formato de prompt muy sensible: cualquier desviacion (como un espacio tras `<loom>`) degrada notablemente la calidad de salida. No es un modelo de chat convencional; usar el Modelfile de Ollama es obligatorio para evitar que el modelo hable consigo mismo.
- Dependencia de un harness externo para la busqueda: sin el harness, el modo online no funciona correctamente.
- Sin garantias de produccion: es un experimento de investigacion, no un modelo listo para entornos empresariales.

## Enlaces

- HuggingFace: https://huggingface.co/textilelabs/Loom-Spark-1.8
- Perfil de Textile Labs: https://huggingface.co/textilelabs
- Loom Spark v1: https://huggingface.co/textilelabs/Loom-Spark
- Loom Spark 1.5: https://huggingface.co/textilelabs/Loom-Spark-1.5
- Repositorio de modelos gratuitos (mencionado en busqueda, no relacionado directamente): https://github.com/ClawLabsAI/free-ai-models
