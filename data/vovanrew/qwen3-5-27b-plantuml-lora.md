# vovanrew/Qwen3.5-27B-PlantUML-LoRA

## Resumen

Qwen3.5-27B-PlantUML-LoRA es un adaptador LoRA desarrollado por el usuario vovanrew sobre el modelo base Qwen/Qwen3.5-27B. Su funcion es convertir una imagen de un diagrama UML (de clases o de secuencia) ya renderizado en su codigo fuente PlantUML equivalente. El adaptador resuelve la tarea inversa a la generacion de diagramas: reconocimiento visual de diagramas y traduccion a codigo (image-to-code), un caso de uso util para ingenieria inversa de documentacion tecnica, recuperacion de fuentes perdidas y auditoria de diagramas existentes.

El adaptador forma parte de un estudio mas amplio titulado "Fine-tuning for image-to-PlantUML: Qwen3.5 at 2B, 9B and 27B", que evalua el rendimiento del modelo base antes y despues del ajuste fino mediante un benchmark especifico de image-to-PlantUML. El repositorio contiene un unico adaptador entrenado con 20.000 pares imagen-codigo, correspondiente al checkpoint `step_02500`. El modelo base es un transformer multimodal de 27.000 millones de parametros con soporte de entrada imagen-texto, y el adaptador anade capacidades especializadas de reconocimiento de diagramas sin modificar los pesos originales.

La relevancia actual del adaptador radica en su enfoque acotado y reproducible: el autor publica la receta de entrenamiento, la construccion del conjunto de datos y los resultados del benchmark, lo que permite verificar y replicar el ajuste. La licencia Apache-2.0 del modelo base se mantiene, lo que facilita su uso comercial, aunque con las advertencias habituales sobre los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen3.5-27B (image-text-to-text) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base Qwen3.5-27B tiene 27.000 millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.5-27B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible (heredados del modelo base; la tarea es generacion de codigo PlantUML) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`adapter_model.safetensors` + `adapter_config.json`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de PEFT aplicado sobre Qwen/Qwen3.5-27B, un modelo multimodal de tipo image-text-to-text. El adaptador no modifica la arquitectura del modelo base: inyecta matrices de bajo rango en las capas del transformer para especializarlo en la tarea de image-to-PlantUML. El repositorio contiene un unico subdirectorio `pairs-20000`, entrenado con 20.000 pares imagen-codigo y correspondiente al checkpoint `step_02500`, con hash sha256 `f7510e612ff3ddd3f7d585993cbbdd040bc99f2a4e5e8a27a13b53cd55f0ac38` para `adapter_model.safetensors`.

El entrenamiento y la evaluacion se realizaron sobre la revision `fc05daec18b0a78c049392ed2e771dde82bdf654` del modelo base, que debe especificarse al cargar el modelo, ya que `adapter_config.json` no la registra. Los datos de entrenamiento consisten en diagramas PlantUML de clases y de secuencia renderizados y estandarizados segun las imagenes de test del benchmark (`data/puml_images_1568/`). La entrada de inferencia esperada es un unico turno de usuario con la imagen, un salto de linea y el prompt del benchmark (`prompts/zero_shot.txt`), usando la plantilla de chat del modelo con `enable_thinking=False` y decodificacion greedy de hasta 5.376 tokens nuevos. El autor advierte que el comportamiento fuera de este formato de entrada no esta definido. No se dispone de informacion sobre el numero total de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Reconocimiento visual de diagramas UML de clases y de secuencia renderizados.
- Generacion de codigo fuente PlantUML a partir de una imagen de diagrama.
- Tarea de image-to-code especializada, entrenada sobre pares imagen-codigo.
- Soporte de entrada multimodal image-text-to-text heredado del modelo base Qwen3.5-27B.
- Generacion de codigo PlantUML con decodificacion greedy y hasta 5.376 tokens nuevos.
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues especificas del adaptador.

## Casos de uso

- Recuperacion de fuentes PlantUML perdidas: a partir de capturas o imagenes de diagramas UML existentes en documentacion, el adaptador genera el codigo PlantUML para reconstruir la fuente y permitir su mantenimiento.
- Ingenieria inversa de documentacion tecnica: convertir diagramas de clases o secuencia embebidos en PDFs o wikis en codigo editable, facilitando su versionado en repositorios Git.
- Auditoria y migracion de diagramas: digitalizar diagramas heredados de herramientas propietarias y regenerarlos como PlantUML para unificarlos en una unica herramienta de documentacion.
- Generacion de documentacion asistida: integrar el adaptador en un pipeline que, dada una imagen de diagrama, produzca el codigo fuente y lo renderice de nuevo para validar la fidelidad.
- Educacion y formacion: permitir a estudiantes comparar un diagrama renderizado con su codigo PlantUML generado, como ejercicio de aprendizaje de sintaxis UML.
- Control de calidad de diagramas: detectar discrepancias entre la representacion visual y el codigo fuente original comparando la salida del adaptador con el codigo conocido.
- Automatizacion de pruebas de regresion visual: generar el codigo PlantUML de diagramas de referencia y re-renderizarlos para comprobar que el pipeline de documentacion no ha cambiado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor remite a las tablas y ejecuciones del conjunto de test en `runs.zip` del repositorio del estudio, pero los valores numericos no se incluyen en la model card proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3.5-27B (27.000 millones de parametros) y de la cuantizacion empleada.
- GPU recomendadas: no disponible. El modelo base de 27B requiere, en bfloat16, del orden de 54 GB solo para pesos, por lo que no cabe en GPUs de consumo sin cuantizacion.
- Cabe en consumer GPU: no disponible con precision; con cuantizacion agresiva del modelo base podria intentarse en GPUs de 24 GB, pero no hay datos confirmados.
- Opciones de despliegue: carga mediante `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`) y `peft` (`PeftModel`), segun el ejemplo de la model card. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vovanrew/Qwen3.5-27B-PlantUML-LoRA | Adaptador LoRA sobre 27B | no disponible | Image-to-PlantUML | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-27B (base) | 27.000 millones | no disponible | Multimodal general image-text-to-text | Apache-2.0 | Hugging Face |
| Adaptadores del mismo estudio a 2B y 9B | 2B / 9B (base) | no disponible | Image-to-PlantUML | no disponible | Referenciados en el repositorio del estudio |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta entrenado exclusivamente para diagramas UML de clases y de secuencia renderizados y estandarizados segun `data/puml_images_1568/`; su comportamiento fuera de ese formato de entrada no esta definido.
- La entrada debe seguir un formato estricto: un unico turno de usuario con la imagen, un salto de linea y el prompt del benchmark, con `enable_thinking=False` y decodificacion greedy.
- No se han publicado resultados de benchmarks en la informacion disponible, por lo que no es posible cuantificar la fidelidad de la conversion.
- Riesgo de alucinacion inherente a los modelos generativos: el codigo PlantUML generado puede no corresponder exactamente al diagrama de entrada.
- Los diagramas de entrenamiento se extrajeron de repositorios de codigo abierto y cada uno mantiene la licencia de su repositorio de origen; no se distribuyen en este repositorio.
- La licencia Apache-2.0 se hereda del modelo base, pero el uso comercial debe considerar las licencias de los datos de entrenamiento de origen.
- No se dispone de informacion sobre sesgos conocidos ni sobre el rendimiento en idiomas distintos del codigo PlantUML.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vovanrew/Qwen3.5-27B-PlantUML-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Repositorio del estudio de fine-tuning: https://github.com/vovanrew/plantuml-recognition-fine-tuning
- Repositorio del benchmark de evaluacion: https://github.com/vovanrew/plantuml-recognition-evaluation
- Prompt zero-shot del benchmark: https://github.com/vovanrew/plantuml-recognition-evaluation/blob/main/prompts/zero_shot.txt
- Receta de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-recipe.md
- Construccion del conjunto de entrenamiento: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/methodology/training-set-construction.md
- Citacion: https://github.com/vovanrew/plantuml-recognition-fine-tuning/blob/main/CITATION.cff
