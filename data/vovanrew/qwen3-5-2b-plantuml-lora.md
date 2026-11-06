# vovanrew/Qwen3.5-2B-PlantUML-LoRA

## Resumen

`vovanrew/Qwen3.5-2B-PlantUML-LoRA` es un conjunto de adaptadores LoRA (PEFT) sobre el modelo multimodal `Qwen/Qwen3.5-2B` de Alibaba Qwen, especializados en una tarea muy concreta: convertir la imagen de un diagrama UML de clases o de secuencia, ya renderizado, en su codigo fuente PlantUML. Lo publica el desarrollador independiente vovanrew como artefacto reproducible de un estudio propio sobre reconocimiento de diagramas, con el codigo de entrenamiento y de evaluacion alojado en GitHub.

El adaptador no es un modelo generalista: es un ajuste fino orientado a imagen-a-codigo dentro de un dominio cerrado (PlantUML). El repositorio incluye tres variantes segun el volumen de pares de entrenamiento (1.000, 5.000 y 20.000 pares), cada una con su checkpoint y su hash SHA-256, de modo que los resultados del estudio se pueden reproducir byte a byte. El tamano del repositorio es de aproximadamente 0,2 GB, coherente con pesos LoRA y no con un modelo completo.

Su relevancia es doble. Por un lado, demuestra que un modelo de 2B de parametros con vision puede resolver una tarea estructurada de image-to-code cuando se le ajusta con datos especificos. Por otro, sirve como referencia metodologica: fija la revision exacta del modelo base, el formato de entrada, el prompt y la decodificacion, lo que reduce la variabilidad al comparar resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-2B (image-text-to-text) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-2B) |
| Tipos de cuantizacion | No disponible (los adaptadores se sirven en safetensors; el estudio usa bfloat16) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |
| Modelo base | Qwen/Qwen3.5-2B, revision `15852e8c16360a2fea060d615a32b45270f8a8fc` |
| Subcarpetas | `pairs-20000` (step_02500), `pairs-5000` (step_00626), `pairs-1000` (step_00126) |
| Libreria | peft |
| Pipeline | image-text-to-text |
| Tamano del repo | ~0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer multimodal de 2B de parametros que procesa simultaneamente imagen y texto. El LoRA modifica los pesos del modelo base para especializarlo en la generacion de codigo PlantUML a partir de la representacion visual de un diagrama. El estudio entrena tres variantes con 1.000, 5.000 y 20.000 pares de entrenamiento, y conserva el checkpoint final de cada una (`step_00126`, `step_00626` y `step_02500` respectivamente).

Los datos de entrenamiento son diagramas PlantUML de clases y de secuencia extraidos de repositorios de codigo abierto; cada diagrama conserva la licencia del repositorio de origen y no se redistribuye en este repositorio. El procedimiento de construccion del conjunto de entrenamiento, la receta de ajuste y el criterio de seleccion de checkpoint estan documentados en el repositorio del estudio. La evaluacion se realiza sobre el benchmark image-to-PlantUML del mismo autor, con imagenes estandarizadas a 1568 px (`data/puml_images_1568/`) y un prompt zero-shot fijo. La inferencia se hace con decodificacion greedy, hasta 5.376 tokens nuevos y `enable_thinking=False`.

## Capacidades

- Reconocimiento de diagramas UML de clases renderizados y conversion a codigo PlantUML.
- Reconocimiento de diagramas UML de secuencia renderizados y conversion a codigo PlantUML.
- Procesamiento conjunto de imagen y texto (entrada image-text-to-text).
- Generacion de codigo estructurado en el lenguaje PlantUML.
- Reproducibilidad controlada: revision fija del modelo base, prompt fijo y decodificacion greedy.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento extendido en la informacion disponible.

## Casos de uso

- Digitalizacion de documentacion tecnica heredada: a partir de capturas o PDFs con diagramas UML ya renderizados, el adaptador genera el PlantUML correspondiente para volver a versionar el diagrama como codigo en el repositorio.
- Migracion de diagramas entre herramientas: si una organizacion tiene diagramas exportados como imagenes desde una herramienta propietaria, el modelo permite reconstruir la fuente PlantUML y reabrir el diagrama en un editor basado en texto.
- Generacion automatica de documentacion en pipelines de CI: al integrar el adaptador en un flujo que detecte imagenes de diagramas en la documentacion, se puede producir o actualizar el `.puml` asociado y validar que compila.
- Auditoria y comparacion de arquitecturas: dado un diagrama de clases en imagen, el modelo extrae clases, atributos y relaciones en forma de codigo, lo que facilita comparaciones y analisis automatizados sobre el modelo de dominio.
- Formacion y docencia: reconstruir el codigo fuente de diagramas de ejemplo para que los alumnos puedan modificarlos y experimentar con ellos en lugar de partir de una imagen estatica.
- Investigacion en image-to-code: el adaptador sirve como linea base reproducible (con revision y hashes fijados) para comparar nuevas tecnicas de ajuste fino o de reconocimiento de diagramas sobre el mismo benchmark.
- Prototipado rapido de asistentes de modelado: integrado en un editor, permite al usuario pegar una captura de pizarra o de una herramienta de dibujo y obtener un esqueleto PlantUML editable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a las tablas y ejecuciones del estudio en `runs.zip` del repositorio de fine-tuning, pero los valores numericos no se incluyen en la informacion proporcionada.

## Requisitos de hardware

- El adaptador LoRA en si ocupa aproximadamente 0,2 GB; el coste real de inferencia lo determina el modelo base Qwen3.5-2B.
- VRAM estimada: no disponible de forma explicita. Para un modelo multimodal de 2B en bfloat16, el orden de magnitud habitual esta en torno a 4-6 GB solo para pesos, mas el coste de procesar la imagen y la cache KV; debe verificarse en el hardware concreto.
- GPU recomendadas: no disponibles en la informacion proporcionada. Cualquier GPU con suficiente VRAM para el modelo base en bfloat16 deberia poder ejecutar el adaptador.
- Despliegue: la model card documenta carga con `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y `peft` (`PeftModel.from_pretrained`). No se documentan instrucciones para vLLM, llama.cpp, Ollama ni TGI, y al ser un adaptador multimodal con entrada de imagen, la compatibilidad con esos motores no esta garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vovanrew/Qwen3.5-2B-PlantUML-LoRA | 2B (base) + LoRA | No disponible | Imagen de diagrama UML a PlantUML | Apache-2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen3.5-2B (base) | 2B | No disponible | Image-text-to-text general | Apache-2.0 (segun model card del adaptador) | Hugging Face |
| Alternativas especializadas en image-to-PlantUML | No disponible | No disponible | Conversion de diagramas a codigo | No disponible | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- Dominio cerrado: el autor advierte que el comportamiento fuera del formato de entrada del estudio es indefinido. Solo se entreno y evaluo con diagramas UML de clases y de secuencia renderizados y estandarizados a 1568 px.
- Formato de entrada estricto: un unico turno de usuario compuesto por la imagen, un salto de linea y el prompt zero-shot del benchmark; desviarse de ese formato puede degradar la salida.
- Decodificacion fija: los resultados del estudio se obtuvieron con decodificacion greedy y `enable_thinking=False`; otros ajustes no estan validados.
- Riesgo de alucinacion: al generar codigo estructurado, el modelo puede omitir relaciones, inventar atributos o producir PlantUML sintacticamente valido pero semanticamente incorrecto respecto a la imagen.
- Sesgos: no se documentan analisis de sesgos en la informacion disponible; el conjunto de entrenamiento procede de repositorios de codigo abierto y puede heredar sus sesgos de estilo y de nomenclatura.
- Idiomas: no se especifican idiomas soportados; la tarea es principalmente de codigo, pero los identificadores y etiquetas de los diagramas pueden estar en cualquier idioma.
- Licencia: el adaptador es Apache-2.0, igual que el modelo base, lo que permite uso comercial, pero los diagramas de entrenamiento conservan la licencia de sus repositorios de origen y no se redistribuyen.
- Revision del modelo base: `adapter_config.json` no registra la revision, por lo que es necesario pasarla explicitamente al cargar Qwen3.5-2B para reproducir los resultados.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vovanrew/Qwen3.5-2B-PlantUML-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio del estudio de fine-tuning: https://github.com/vovanrew/plantuml-recognition-fine-tuning
- Receta de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-recipe.md
- Construccion del conjunto de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-set-construction.md
- Benchmark de evaluacion image-to-PlantUML: https://github.com/vovanrew/plantuml-recognition-evaluation
- Prompt zero-shot del benchmark: https://github.com/vovanrew/plantuml-recognition-evaluation/blob/main/prompts/zero_shot.txt
- Citacion (CITATION.cff): https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/CITATION.cff
