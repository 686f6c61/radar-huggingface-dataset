# vtava/Qwen3.5-0.8B-MemoryFusion

## Resumen

Qwen3.5-0.8B-MemoryFusion es un ajuste fino experimental publicado por el usuario vtava sobre el modelo base Qwen/Qwen3.5-0.8B. Su rasgo distintivo es la incorporacion de un mecanismo denominado TinyCeNN Memory Fusion, etiquetado en el repositorio como memory-fusion y recurrent-attention, que se aplica por capas ancladas (anchors) concretas del decodificador: 3, 7, 11, 15, 19 y 23. El autor define un conjunto de umbrales de aceptacion por ancla (NMSE <= 0,20, coseno >= 0,90, incremento de NLL <= 0,015 y NLL acumulado <= 0,05) para decidir si cada modulo de memoria se incorpora definitivamente al modelo.

El problema que aborda es el de dotar a un modelo de lenguaje pequeno (aproximadamente 0,8 mil millones de parametros, segun la denominacion del modelo base) de una forma de memoria recurrente adicional sin degradar su comportamiento linguistico original, algo relevante para despliegues en dispositivo o en hardware limitado. En el momento de redactar esta ficha, la model card indica explicitamente que no hay ningun ancla aceptada, por lo que se trata de un artefacto de entrenamiento en curso y no de un modelo validado para produccion.

La relevancia actual del repositorio es, por tanto, metodologica mas que de rendimiento: documenta un protocolo de validacion por puertas metricas para inyectar modulos de memoria en un transformer preentrenado y comparar la salida original frente a la modificada mediante ejemplos de chat deterministas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5) con modulos de fusion de memoria y atencion recurrente (TinyCeNN Memory Fusion) insertados en las capas 3, 7, 11, 15, 19 y 23; detalle interno no disponible |
| Parametros totales | Aproximadamente 0,8 mil millones segun la denominacion del modelo base; cifra no confirmada en la informacion disponible |
| Parametros activos | No aplica: no se describe una arquitectura de mezcla de expertos (MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (declarada en el repositorio y en la model card) |
| Formato de pesos | Biblioteca transformers; formato de fichero de pesos no especificado (no disponible) |

Otros datos de identificacion: revision base declarada `2fc06364715b967f1860aea9cf38778875588b17`, fecha de creacion 16 de septiembre de 2026, 0 descargas y 0 me gusta en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B y le superpone un componente llamado TinyCeNN Memory Fusion. Segun las etiquetas y el contenido de la model card, este componente combina fusion de memoria con atencion recurrente y se inserta en seis capas concretas del decodificador, denominadas anclas. El entrenamiento se ejecuta de forma secuencial por capa: el repositorio incluye `training/sequential_in_progress.pt`, descrito como la capa actual reanudable y potencialmente no aceptada, junto con `sequential_progress.json` para el progreso guardado.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO. Tampoco se detalla si el ajuste congela el modelo base o actualiza todos sus pesos. La innovacion tecnica declarada es el propio mecanismo de fusion de memoria con puertas de aceptacion objetivas: cada modulo solo se consolida si cumple simultaneamente NMSE <= 0,20, similitud coseno >= 0,90, incremento de NLL <= 0,015 y NLL acumulado <= 0,05 frente al modelo original. En la version consultada, el campo "Accepted anchors" esta vacio (`[]`) y el apartado de resultados de aceptacion indica que aun no hay ninguna ancla aceptada.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-0.8B, no documentada de forma especifica para este ajuste.
- Memoria recurrente por capas: el mecanismo TinyCeNN Memory Fusion esta disenado para aportar estado recurrente adicional en seis capas del decodificador; su efecto real no esta validado al no existir anclas aceptadas.
- Comparacion determinista original frente a fusion: el repositorio incluye `chat_examples.json` con comparaciones de conversacion entre el modelo original y la variante con Memory Fusion.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles de un modelo de aproximadamente 0,8 mil millones de parametros con memoria recurrente anadida, pero deben considerarse hipotesis de trabajo: al no haber anclas aceptadas ni benchmarks publicados, ninguno de ellos esta respaldado por resultados verificados.

- Asistentes conversacionales en dispositivo: un modelo de este tamano puede ejecutarse en CPU o en GPUs de gama baja, y el componente de memoria recurrente busca mantener coherencia en conversaciones multi-turno sin reenviar todo el historial; requiere validar primero los umbrales de NLL incremental.
- Clasificacion y extraccion de informacion local: despliegue en entornos sin conectividad (industria, sanidad, administracion) donde no se pueden enviar datos a la nube; el modelo cabe en memoria de un equipo de sobremesa.
- Preprocesado y enrutado en pipelines RAG: uso del modelo como componente ligero para reescribir consultas o resumir fragmentos antes de pasarlos a un modelo mayor.
- Generacion de texto asistida en herramientas ofimaticas: autocompletado, resumen de notas y reformulacion de parrafos con latencia baja.
- Investigacion sobre memoria en transformers: el repositorio sirve como banco de pruebas reproducible del protocolo de anclas y de las puertas de aceptacion (NMSE, coseno, NLL) para estudiar como afecta la insercion de modulos recurrentes a un modelo preentrenado.
- Evaluacion de tecnicas de ajuste incremental: comparacion sistematica entre la salida original y la modificada mediante `chat_examples.json`, util para medir deriva linguistica en ajustes por capas.
- Filtrado y moderacion de texto a gran escala: inferencia por lotes con un modelo pequeno para tareas de etiquetado binario o multietiqueta en servidores modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra suite estandar, y el apartado de aceptacion indica que no hay anclas aceptadas. Los unicos criterios cuantitativos presentes son las puertas de aceptacion internas, que se reproducen a continuacion tal como aparecen en la model card:

| Metrica | Umbral exigido | Estado declarado |
|---|---|---|
| NMSE | <= 0,20 | Sin anclas aceptadas |
| Similitud coseno | >= 0,90 | Sin anclas aceptadas |
| NLL incremental | <= 0,015 | Sin anclas aceptadas |
| NLL acumulado | <= 0,05 | Sin anclas aceptadas |

Anclas objetivo: 3, 7, 11, 15, 19 y 23. Anclas aceptadas: ninguna.

## Requisitos de hardware

Las cifras de memoria que figuran a continuacion son estimaciones aritmeticas a partir del tamano nominal del modelo base (aproximadamente 0,8 mil millones de parametros) y no mediciones publicadas por el autor.

- Pesos en precision completa (FP32): en torno a 3,2 GB de VRAM solo para los pesos.
- Pesos en FP16 o BF16: en torno a 1,6 GB, mas la memoria de activaciones y la cache KV, que depende del contexto y no esta documentada.
- Cuantizacion de 8 bits: en torno a 0,8 GB de pesos.
- Cuantizacion de 4 bits: en torno a 0,4-0,5 GB de pesos.
- GPU recomendadas: no disponibles; por tamano, el modelo es apto para cualquier GPU de consumo con 4 GB o mas de VRAM (por ejemplo, GTX 1650, RTX 3050, RTX 4060) y para GPUs de centro de datos como A100 o H100 si se busca alto throughput.
- Inferencia en CPU: viable en teoria por el reducido numero de parametros, aunque no hay datos de latencia publicados.
- Opciones de despliegue: la biblioteca declarada es transformers; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos en formato GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de benchmarks ni especificaciones verificadas de modelos alternativos, por lo que la comparacion cuantitativa no esta disponible. La unica referencia contrastable es el modelo base del que deriva este ajuste:

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-0.8B-MemoryFusion (vtava) | Aproximadamente 0,8 mil millones (segun el nombre del base) | No disponible | Apache 2.0 | Ajuste en curso, sin anclas aceptadas |
| Qwen/Qwen3.5-0.8B | Aproximadamente 0,8 mil millones (segun el nombre) | No disponible | No disponible en la informacion proporcionada | Modelo base publicado por el equipo Qwen |
| Otras alternativas de menos de 1000 millones de parametros | No disponible | No disponible | No disponible | No se dispone de datos comparativos en esta busqueda |

## Limitaciones y advertencias

- Estado de validacion: la model card indica explicitamente que no hay ninguna ancla aceptada, por lo que el comportamiento con fusion de memoria no esta confirmado. El fichero `training/sequential_in_progress.pt` corresponde a una capa en progreso y puede no estar aceptada.
- Ausencia de benchmarks: no hay resultados publicados de MMLU, HumanEval, GSM8K ni de ninguna otra suite, ni comparaciones con el modelo base mas alla de los ejemplos de chat incluidos.
- Riesgo de alucinacion: no evaluado en la informacion disponible; se hereda el comportamiento del modelo base, que tampoco se documenta aqui.
- Deriva por ajuste: las puertas de aceptacion existen precisamente para limitar la degradacion del modelo original (NLL incremental y acumulado); mientras no se cumplan, existe riesgo de perdida de calidad linguistica respecto al base.
- Sesgos: no documentados. No se especifica la composicion del dataset de ajuste ni si se aplicaron tecnicas de mitigacion.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no se puede garantizar cobertura multilingue.
- Contexto: la longitud de contexto no se especifica, lo que impide planificar despliegues con historiales largos.
- Licencia: el repositorio declara Apache 2.0, pero conviene verificar la licencia del modelo base Qwen/Qwen3.5-0.8B antes de un uso comercial, ya que las condiciones del derivado dependen de las del original.
- Adopcion nula: 0 descargas y 0 me gusta en el momento de la consulta, sin senales de uso en produccion ni de validacion por terceros.
- Resultados de busqueda no relevantes: las consultas web asociadas devolvieron exclusivamente paginas de prevision meteorologica para Belgrado, sin ninguna relacion con el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vtava/Qwen3.5-0.8B-MemoryFusion
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Ficheros citados en la model card: `sequential_progress.json`, `chat_examples.json`, `training/sequential_in_progress.pt` (disponibles en el repositorio de HuggingFace del modelo)
- Paper, blog tecnico o repositorio de codigo del autor: no disponibles en la informacion proporcionada
- Demo o espacio interactivo: no disponible
