# tstepspam/gemma-4-26B-A4B-it-heretic-q4-mlx

## Resumen

`tstepspam/gemma-4-26B-A4B-it-heretic-q4-mlx` es una version cuantizada a 4 bits en formato MLX del modelo `coder3101/gemma-4-26B-A4B-it-heretic`, a su vez derivado de la familia Gemma 4 de Google en su variante instruida (sufijo `-it`). El repositorio lo publica el usuario `tstepspam` y esta pensado para inferencia local en hardware Apple Silicon mediante la libreria MLX, no para despliegue en GPU NVIDIA.

El modelo base incorpora en su nombre la nomenclatura `26B-A4B`, que en la convencion de Google corresponde a un diseno de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones activos por token. El recuento real de safetensors del repositorio es de 25.233.053.440 parametros totales, ligeramente por debajo de la cifra nominal. Las etiquetas `heretic`, `abliterated`, `uncensored` y `decensored` indican que el modelo ha pasado por un proceso de ablation de la direccion de rechazo (abliteration) orientado a eliminar las respuestas de negativa del modelo instruido original.

Su relevancia practica es doble: por un lado, permite ejecutar un MoE de ~25.000 millones de parametros en equipos Apple con memoria unificada, algo inviable en precision completa; por otro, ofrece una variante sin alineamiento de seguridad, lo que la hace util para investigacion en robustez y red teaming, pero desaconsejable para productos de cara al publico sin capas adicionales de moderacion. El repositorio no incluye model card descriptiva, no declara benchmarks y registra 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion del repositorio; la nomenclatura `26B-A4B` del modelo base sugiere mezcla de expertos (MoE) con ~4B parametros activos, sin confirmar |
| Parametros totales | 25.233.053.440 (dato real de safetensors) |
| Parametros activos | No confirmado; ~4B segun la nomenclatura `A4B` del nombre del modelo base |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits (etiqueta `4-bit`), formato MLX; no se declaran otros niveles |
| Idiomas soportados | No disponible en el repositorio; el modelo base pertenece a la familia Gemma de Google, de proposito multilingue, pero esta ficha no lista idiomas concretos |
| Licencia | apache-2.0 (etiqueta del repositorio); el enlace de licencia apunta a los terminos de Gemma 4 de Google (`https://ai.google.dev/gemma/docs/gemma_4_license`), que prevalecen sobre la etiqueta |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`) |
| Tamano del repositorio | 14,2 GB |
| Modelo base | coder3101/gemma-4-26B-A4B-it-heretic |
| Pipeline | text-generation |
| Modalidad | Texto (la etiqueta `conversational` sugiere plantilla de chat) |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |

## Arquitectura y entrenamiento

La informacion disponible no incluye detalles de entrenamiento. No hay datos sobre el numero de tokens utilizados, la composicion del dataset, el uso de RLHF, DPO u otra tecnica de alineamiento, ni sobre innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal. La unica informacion estructural proviene de la nomenclatura del nombre del modelo base (`gemma-4-26B-A4B-it`), que apunta a un transformer con mezcla de expertos, ~26.000 millones de parametros totales y ~4.000 millones activos, en variante instruida.

Lo que si se puede afirmar es el proceso de post-procesado: las etiquetas `heretic`, `abliterated`, `uncensored` y `decensored` indican que el modelo `coder3101/gemma-4-26B-A4B-it-heretic` fue sometido a una ablation de la direccion de rechazo, presumiblemente mediante la herramienta Heretic. Este tipo de intervencion modifica pesos o activaciones para suprimir el comportamiento de negativa ante determinadas peticiones. La etiqueta `ara` aparece en el repositorio sin definicion en la informacion disponible. La cuantizacion a 4 bits en MLX la realiza el publicador del repositorio, no Google ni el autor del modelo base.

## Capacidades

- Generacion de texto conversacional en formato instruido (`text-generation`, `conversational`).
- Razonamiento multi-turno, con la salvedad de que la longitud de contexto no esta declarada.
- Respuestas sin filtros de rechazo en las categorias que el modelo base rechazaba, como consecuencia del proceso de abliteration.
- Presunta capacidad de generacion de codigo, no verificada en la informacion disponible; el prefijo `coder3101` del modelo base es un nombre de usuario, no una indicacion confirmada de especializacion en codigo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; no hay plantilla ni documentacion de formato de herramientas.
- Capacidades multilingues: no disponibles en la ficha; probablemente heredadas del modelo Gemma subyacente, sin lista confirmada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. El repositorio es exclusivamente de texto.
- Ejecucion nativa en Apple Silicon mediante MLX (`mlx-lm`, MLX Swift).

## Casos de uso

- Investigacion en seguridad y red teaming: evaluar hasta que punto la ablation de rechazo altera el comportamiento del modelo, comparando respuestas contra el Gemma 4 instruido original para medir la degradacion del alineamiento y detectar categorias de contenido problematico.
- Escritura creativa y narrativa sin restricciones editoriales: novela, guion o ficcion adulta donde los filtros estandar del modelo instruido interrumpen la generacion. El modelo ofrece continuidad sin negativas, a costa de perder supervision de seguridad.
- Procesamiento de documentos sensibles en local: analisis de contratos, informes medicos o expedientes legales en un Mac sin enviar datos a APIs externas. La cuantizacion de 14,2 GB permite mantener todo el flujo en el dispositivo, lo que facilita el cumplimiento de requisitos de confidencialidad.
- Asistente de desarrollo en portatil Apple Silicon: generacion de fragmentos de codigo, explicacion de errores y refactorizacion local, con 4B parametros activos por token, lo que reduce el coste de inferencia frente a un modelo denso de 25B.
- Generacion de datos sinteticos para fine-tuning: producir corpus de instrucciones y respuestas sin las restricciones de un modelo alineado, util para aumentar diversidad en datasets de investigacion, con revision humana obligatoria posterior.
- Prototipado rapido de productos conversacionales: validar plantillas de prompt, flujos multi-turno y formatos de salida antes de invertir en inferencia en GPU o en un modelo mayor, aprovechando que el modelo cabe en memoria unificada de 24 GB o mas.
- Experimentacion con cuantizacion y MLX: servir como banco de pruebas para medir la perdida de calidad de un MoE de ~25B al pasar a 4 bits en Apple Silicon, o como punto de partida para destilar o generar adaptadores LoRA.
- Analisis de sentimiento y clasificacion sobre textos crudos: en dominios donde el contenido incluye lenguaje explicito (moderacion de foros, analisis de abuso), un modelo sin rechazo evita interrupciones constantes al procesar el material.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio resultados relevantes sobre el modelo (unicamente paginas de reserva de tours sin relacion alguna). Tampoco se declaran mediciones de latencia, tokens por segundo ni comparaciones con el modelo base sin cuantizar.

## Requisitos de hardware

- Pesos en 4 bits: el repositorio ocupa 14,2 GB, por lo que la carga del modelo requiere al menos ese espacio mas el overhead del runtime.
- Memoria unificada recomendada: 24 GB o mas para trabajar con contexto moderado. Con 16 GB es posible cargar los pesos, pero el margen para la cache KV y el sistema queda muy justo y obliga a limitar la longitud de contexto.
- Equipos objetivo: Mac con chip de la serie M (M1, M2, M3, M4 y sus variantes Pro, Max y Ultra). Los modelos Max y Ultra, con mayor ancho de banda de memoria, ofrecen mejor rendimiento por token.
- GPU NVIDIA y AMD: MLX no soporta CUDA ni ROCm. Para usar este repositorio en una RTX 4090, A100, H100 u otra GPU dedicada es necesario convertir los pesos a un formato compatible (safetensors de Hugging Face, GGUF u otro), operacion no documentada en el repositorio.
- Opciones de despliegue: `mlx-lm` (Python) y MLX Swift son las rutas nativas. LM Studio soporta pesos MLX. Ollama, llama.cpp, vLLM y TGI no consumen MLX directamente y requieren conversion previa.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para esta cuantizacion en ningun chip concreto.

## Comparativa con modelos similares

| Modelo | Parametros totales | Cuantizacion | Formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| `tstepspam/gemma-4-26B-A4B-it-heretic-q4-mlx` (este) | 25.233.053.440 | 4 bits | MLX safetensors | No disponible | apache-2.0 con enlace a licencia Gemma 4 | 14,2 GB de repositorio, 0 descargas |
| `coder3101/gemma-4-26B-A4B-it-heretic` | No disponible | No disponible | No disponible | No disponible | No disponible | Modelo base directo de esta cuantizacion |
| Gemma 4 26B-A4B-it (original de Google) | No disponible | Precision completa y otras | No disponible | No disponible | Terminos de Gemma 4 de Google | Version instruida sin abliteration |

No se dispone de datos de rendimiento comparados entre estas variantes, y la busqueda web no aporto informacion adicional sobre alternativas de la misma categoria. Cualquier comparacion cuantitativa seria especulativa.

## Limitaciones y advertencias

- Modelo abliterado: la supresion de la direccion de rechazo reduce el alineamiento de seguridad y puede degradar capacidades generales, algo documentado en la literatura sobre abliteration. No se han publicado mediciones de esa perdida para esta variante concreta.
- Sin filtros de seguridad: puede generar contenido danino, ilegal o gravemente ofensivo. No es apto para exposicion directa a usuarios finales sin una capa de moderacion externa.
- Sesgos: no hay evaluacion de sesgos en la informacion disponible. Los sesgos del modelo base y los introducidos por el proceso de abliteration son desconocidos.
- Alucinacion: sin benchmarks ni evaluaciones publicadas, no hay estimacion de la tasa de alucinacion. El riesgo es el habitual en modelos de este tamano, agravado por la ausencia de verificacion de la cuantizacion.
- Contexto e idiomas: la longitud de contexto no esta declarada en el repositorio, lo que impide planificar despliegues que dependan de ventanas largas. La lista de idiomas soportados tampoco esta disponible.
- Licencia: aunque la etiqueta indica apache-2.0, el enlace de licencia apunta a los terminos de Gemma 4 de Google, que imponen restricciones de uso adicionales, incluida una politica de uso prohibido. Antes de un uso comercial conviene revisar dichos terminos, ya que la etiqueta del repositorio por si sola no es concluyente.
- Mantenimiento: el repositorio se creo y se actualizo el mismo dia (2026-09-15), con 0 descargas y 0 likes. No hay evidencia de mantenimiento posterior ni de validacion por parte de la comunidad.
- Ausencia de model card: el repositorio no documenta el proceso de cuantizacion, la plantilla de chat, la configuracion de generacion ni las limitaciones conocidas, lo que dificulta la reproducibilidad.
- Portabilidad: los pesos en MLX no son directamente utilizables en el ecosistema CUDA; requieren conversion para cualquier despliegue en servidores con GPU.
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo, por lo que no hay fuentes independientes que validen sus caracteristicas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tstepspam/gemma-4-26B-A4B-it-heretic-q4-mlx
- Modelo base: https://huggingface.co/coder3101/gemma-4-26B-A4B-it-heretic
- Licencia referenciada por el autor: https://ai.google.dev/gemma/docs/gemma_4_license
- Libreria de inferencia MLX para modelos de lenguaje: https://github.com/ml-explore/mlx-lm
- Proyecto MLX de Apple: https://github.com/ml-explore/mlx
