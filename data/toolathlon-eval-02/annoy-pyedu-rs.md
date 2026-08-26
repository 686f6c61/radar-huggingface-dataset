# toolathlon-eval-02/Annoy-PyEdu-Rs

## Resumen

Annoy-PyEdu-Rs es un conjunto de datos (dataset), no un modelo de lenguaje, publicado por el equipo del proyecto Toolathlon en el marco del benchmark Toolathlon, presentado en ICLR 2026. El dataset se corresponde con el subconjunto Annoy-PythonEdu-Rs, orientado a la educación de Python, y forma parte de un conjunto de recursos más amplio que incluye modelos entrenados sobre Qwen 2.5 7B Coder, LLaMA 3.1 8B y DeepSeek v2 Lite Coder. El objetivo del recurso es proporcionar trayectorias de razonamiento sintetizadas mediante el modelo DeepSeek-V2.5 para tareas de uso de herramientas en entornos realistas. La relevancia del dataset radica en que es el único subconjunto publicado del conjunto completo de datos del proyecto, debido a requisitos de cumplimiento de los colaboradores. Su licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Tipo de recurso | Dataset (conjunto de datos) |
| Arquitectura | no aplica (no es un modelo) |
| Parametros totales | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | no aplica (es un dataset) |
| Modelo de sintesis | DeepSeek-V2.5 |
| Modelos base asociados | Qwen 2.5 7B Coder, LLaMA 3.1 8B, DeepSeek v2 Lite Coder |
| Subconjunto | Annoy-PythonEdu-Rs (unico subconjunto publicado) |
| Version de datos crudos | Annoy-PyEdu-Rs-Raw (disponible por separado) |

## Arquitectura y entrenamiento

No aplica en el sentido de arquitectura de modelo, ya que se trata de un dataset. El proceso de construccion de los datos se describe en la model card: en lugar de generar trayectorias de ejecucion a partir de codigo ejecutable completo (lo que presenta dos problemas: la imposibilidad de obtener una funcion inversa determinista para la prediccion de entradas y la limitacion expresiva de plantillas predefinidas), se opto por un enfoque completamente basado en LLM para sintetizar todas las respuestas deseadas, utilizando DeepSeek-V2.5 por su rendimiento de primer nivel y su coste extremadamente bajo en comparacion con otros LLM avanzados. El dataset forma parte del benchmark Toolathlon, que evalua el uso general de herramientas por parte de agentes linguisticos en entornos realistas.

## Capacidades

- Contiene trayectorias de razonamiento para tareas de educacion de Python.
- Forma parte del benchmark Toolathlon, que evalua el uso de herramientas por agentes linguisticos.
- Incluye tareas de largo recorrido (long-horizon tool calls) en entornos de software reales.
- Evaluacion basada en ejecucion, no solo en coincidencia de texto.
- Soporta el entrenamiento de modelos en dos etapas (Stage 1 y Stage 2) para los modelos base asociados.
- Incluye una variante Annoy++ que anade pasos de planificacion (planning) sobre los modelos base.

## Casos de uso

- Evaluacion de agentes con uso de herramientas: el dataset permite evaluar la capacidad de agentes linguisticos para realizar llamadas a herramientas de forma secuencial y de largo recorrido en entornos de software reales.
- Entrenamiento de modelos para tool calling: los datos sintetizados con DeepSeek-V2.5 pueden usarse para fine-tuning de modelos base como Qwen 2.5 7B Coder, LLaMA 3.1 8B o DeepSeek v2 Lite Coder.
- Desarrollo de agentes de codigo en educacion: el subconjunto PythonEdu-Rs es especifico para tareas de educacion de Python, lo que permite entrenar agentes que ayuden a estudiantes a resolver ejercicios de programacion.
- Investigacion en razonamiento multi-paso: las trayectorias de razonamiento sintetizadas permiten estudiar como los modelos aprenden a descomponer tareas complejas en pasos intermedios.
- Evaluacion de modelos de codigo: los datos pueden combinarse con los modelos de la coleccion (qwen2.5-7b-coder_spec, llama3.1-8b_spec, etc.) para evaluar el rendimiento en tareas de codigo asistido por herramientas.
- Comparacion de estrategias de sintesis de datos: el dataset ofrece un caso de estudio sobre la sintetizacion de trayectorias de razonamiento con LLMs en lugar de usar ejecucion directa de codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El dataset forma parte del benchmark Toolathlon, que cuenta con una evaluacion basada en ejecucion, pero no se proporcionan metricas numericas concretas para este subconjunto en la documentacion accesible.

## Requisitos de hardware

No aplica: este recurso es un dataset, no un modelo de inferencia. Para el entrenamiento de los modelos asociados (Qwen 2.5 7B Coder, LLaMA 3.1 8B, DeepSeek v2 Lite Coder) se requieren GPUs de alta capacidad (por ejemplo, A100 o H100), pero no se especifican requisitos concretos en la informacion disponible.

## Comparativa con modelos similares

No disponible. No se dispone de informacion sobre datasets o benchmarks comparables directamente con Annoy-PyEdu-Rs en la informacion proporcionada. El proyecto Toolathlon se presenta como un benchmark de uso de herramientas con evaluacion basada en ejecucion, pero no se proporcionan comparaciones con otros benchmarks en los documentos accesibles.

## Limitaciones y advertencias

- Solo se publica el subconjunto Annoy-PythonEdu-Rs del dataset completo; el resto de subconjuntos no se liberan por requisitos de cumplimiento de los colaboradores.
- La licencia se indica como Apache-2.0 en la model card, pero existe una pagina de incidencia de licencia en la documentacion del proyecto (Toolathlon Dataset License Issue) que sugiere que la licencia podria estar sujeta a revision; se recomienda verificar la licencia actualizada antes de su uso comercial.
- El dataset fue sintetizado con DeepSeek-V2.5, por lo que las trayectorias de razonamiento pueden heredar sesgos o limitaciones del modelo generador.
- No se especifica el numero exacto de muestras, ni el volumen de datos, ni la composicion completa del dataset en la informacion disponible.
- El dataset es de creacion reciente (agosto de 2026) y cuenta con cero descargas y cero likes en el momento de la consulta, por lo que su validacion externa es limitada.
- Para uso en produccion, se recomienda validar la calidad de las trayectorias generadas, ya que el proceso de sintesis automatica puede producir errores no detectados.

## Enlaces

- [HuggingFace - Dataset Annoy-PyEdu-Rs](https://huggingface.co/datasets/toolathlon-eval-02/Annoy-PyEdu-Rs)
- [HuggingFace - Dataset crudo Annoy-PyEdu-Rs-Raw](https://huggingface.co/datasets/toolathlon-eval-02/Annoy-PyEdu-Rs-Raw)
- [HuggingFace - Coleccion de recursos](https://huggingface.co/collections/toolathlon-eval-02/specx-67a978e28fd926b56a4f55a2)
- [GitHub - Toolathlon](https://github.com/hkust-nlp/Toolathlon)
- [Pagina del proyecto Toolathlon](https://toolathlon.xyz/introduction)
- [Documentacion de la incidencia de licencia](https://toolathlon.xyz/docs/tasks/tech/18)
- [Gist con el README actualizado de licencia](https://gist.github.com/mcpllmbench-ops/9bbcbf0aa849898f3f8c38fb3d32060f/3819e5bacc81e5152617dfabc9c9345a23d5d1c3)
- [Paper (referencia)](https://huggingface.co/papers/xxxx.xxxxx)
