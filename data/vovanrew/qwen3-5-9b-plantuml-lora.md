# vovanrew/Qwen3.5-9B-PlantUML-LoRA

## Resumen

Qwen3.5-9B-PlantUML-LoRA es un adaptador LoRA desarrollado por el usuario vovanrew sobre el modelo base Qwen/Qwen3.5-9B. Su funcion es convertir una imagen de un diagrama UML (de clases o de secuencia) ya renderizado en su codigo fuente PlantUML correspondiente. Resuelve el problema inverso al habitual: en lugar de generar diagramas a partir de codigo, reconstruye el codigo a partir de la representacion visual, tarea relevante para ingenieria inversa de documentacion, migracion de diagramas heredados y digitalizacion de material grafico.

El adaptador forma parte de un estudio mas amplio titulado "Fine-tuning for image-to-PlantUML: Qwen3.5 at 2B, 9B and 27B", que evalua el rendimiento del modelo base antes y despues del ajuste fino mediante un benchmark propio de reconocimiento image-to-PlantUML. El repositorio publicado contiene un unico conjunto de adaptadores entrenado sobre 20.000 pares imagen-codigo (checkpoint `step_02500`), con un peso total de 0,2 GB en formato safetensors.

Se trata de un modelo especializado y de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a un caso de uso muy concreto (reconocimiento de diagramas UML) y no a proposito general. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-9B; el adaptador modifica pesos del modelo base mediante matrices de bajo rango |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0,2 GB; los parametros del modelo base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador se implementa con PEFT (LoRA) sobre el modelo base Qwen/Qwen3.5-9B, un transformer multimodal con pipeline `image-text-to-text`, es decir, capaz de procesar imagenes y texto conjuntamente. El adaptador no modifica la arquitectura del modelo base: anade matrices de bajo rango entrenadas para la tarea especifica de image-to-PlantUML. El repositorio contiene un unico subdirectorio, `pairs-20000`, con el checkpoint `step_02500`, entrenado sobre 20.000 pares de imagen y codigo PlantUML.

El entrenamiento se realizo sobre un unico turno de usuario compuesto por la imagen del diagrama, un salto de linea y el prompt del benchmark (`prompts/zero_shot.txt`). Las imagenes de entrenamiento son diagramas de clases y de secuencia PlantUML renderizados y estandarizados segun el conjunto de test del benchmark (`data/puml_images_1568/`). La evaluacion se realizo con decodificacion greedy, hasta 5.376 tokens nuevos y con `enable_thinking=False` en la plantilla de chat del modelo base. Los diagramas de entrenamiento se extrajeron de repositorios de codigo abierto y cada uno conserva la licencia de su repositorio de origen; no se distribuyen en este repositorio. Los detalles completos del dataset, la receta y la seleccion del checkpoint se documentan en el repositorio del estudio (enlaces en la seccion final).

## Capacidades

- Reconocimiento de imagenes de diagramas UML de clases y de secuencia y generacion de su codigo fuente PlantUML.
- Conversion image-to-code en un unico paso, sin turnos de refinamiento.
- Procesamiento multimodal imagen + texto (hereda la capacidad del modelo base Qwen3.5-9B).
- Generacion de codigo PlantUML estructurado (clases, relaciones, participantes, mensajes de secuencia).
- No se documentan capacidades de tool calling, function calling, agentes, vision general, audio ni modo de razonamiento explicito para este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de documentacion heredada: introducir capturas o renders de diagramas UML antiguos y obtener el codigo PlantUML editable para versionarlo en un repositorio, evitando la redibujado manual.
- Migracion entre herramientas de modelado: convertir diagramas exportados como imagen desde herramientas propietarias (por ejemplo, Visio o Enterprise Architect) a PlantUML para integrarlos en pipelines de documentacion como-texto.
- Ingenieria inversa de arquitectura: a partir de diagramas de clases incluidos en memorias tecnicas o papers en PDF, reconstruir el codigo PlantUML para analizar relaciones, herencias y dependencias de forma programatica.
- Generacion automatica de documentacion en CI: integrar el adaptador en un pipeline que, ante una imagen de diagrama en un repositorio, genere el `.puml` correspondiente y lo valide con el renderizador de PlantUML.
- Extraccion de diagramas de secuencia de especificaciones funcionales: convertir diagramas de secuencia en imagen a codigo PlantUML para reutilizarlos en herramientas de documentacion viva (por ejemplo, generacion de documentacion con Sphinx o MkDocs).
- Creacion de datasets de pares imagen-codigo: usar el adaptador para anotar automaticamente corpus de diagramas y ampliar conjuntos de entrenamiento para tareas de reconocimiento de diagramas.
- Auditoria de diagramas: comparar el codigo PlantUML generado con el original para detectar discrepancias o diagramas desactualizados en la documentacion de un proyecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas de ejecucion del conjunto de test en `runs.zip` del repositorio del estudio, pero no se incluyen cifras concretas (precision, exactitud de reconstruccion, BLEU, etc.) en la informacion proporcionada.

## Requisitos de hardware

- El adaptador en si ocupa 0,2 GB y se carga junto al modelo base Qwen3.5-9B; los requisitos de VRAM dependen fundamentalmente del modelo base, no del adaptador.
- VRAM estimada para el modelo base en bfloat16: no disponible en la informacion proporcionada (depende del tamano exacto y de la configuracion del modelo Qwen3.5-9B).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; depende de la cuantizacion aplicada al modelo base.
- Opciones de despliegue: la model card solo documenta la carga mediante `transformers` (`AutoModelForImageTextToText`) y `peft` (`PeftModel`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada. Como referencia estructural, el estudio del autor evalua el mismo adaptador sobre las variantes Qwen3.5 de 2B, 9B y 27B, pero no se aportan cifras comparativas en la informacion disponible.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-PlantUML-LoRA | no disponible (adaptador de 0,2 GB) | no disponible | Image-to-PlantUML | Apache-2.0 | Hugging Face |
| Qwen3.5-2B (variante del estudio) | no disponible | no disponible | Image-to-PlantUML | no disponible | no disponible |
| Qwen3.5-27B (variante del estudio) | no disponible | no disponible | Image-to-PlantUML | no disponible | no disponible |

## Limitaciones y advertencias

- El comportamiento fuera del formato de entrada documentado (un unico turno con la imagen, un salto de linea y el prompt del benchmark) es indefinido segun el autor.
- El adaptador esta entrenado exclusivamente para diagramas de clases y de secuencia PlantUML renderizados y estandarizados como las imagenes de test del benchmark; otros tipos de diagrama UML o estilos de render pueden degradar el resultado.
- No se documentan sesgos especificos, pero al ser un ajuste fino sobre un modelo base de proposito general, puede heredar sesgos del modelo base y de los repositorios de origen de los diagramas de entrenamiento.
- Riesgo de alucinacion: al generar codigo PlantUML, el modelo puede omitir relaciones, inventar atributos o producir sintaxis invalida; se recomienda validar la salida con un renderizador PlantUML antes de usarla en produccion.
- La licencia Apache-2.0 cubre el adaptador; los diagramas de entrenamiento conservan la licencia de sus repositorios de origen y no se distribuyen con el modelo.
- El autor no registra la revision del modelo base en `adapter_config.json`, por lo que es necesario pasar explicitamente la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a` al cargar el modelo base para reproducir el comportamiento entrenado.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en produccion ni validacion independiente.
- No se documentan limitaciones de contexto ni de idioma porque esos datos no estan disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vovanrew/Qwen3.5-9B-PlantUML-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio del estudio de fine-tuning: https://github.com/vovanrew/plantuml-recognition-fine-tuning
- Benchmark de reconocimiento image-to-PlantUML: https://github.com/vovanrew/plantuml-recognition-evaluation
- Prompt zero-shot del benchmark: https://github.com/vovanrew/plantuml-recognition-evaluation/blob/main/prompts/zero_shot.txt
- Receta de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-recipe.md
- Construccion del conjunto de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-set-construction.md
- Citacion (CITATION.cff): https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/CITATION.cff
