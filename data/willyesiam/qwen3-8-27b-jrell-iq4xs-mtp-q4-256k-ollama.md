# willyesiam/Qwen3.8-27B-jrell-IQ4XS-MTP-Q4-256K-Ollama

## Resumen

Este repositorio no contiene un modelo nuevo, sino un paquete de despliegue para Ollama que combina dos artefactos GGUF del modelo base Qwen/Qwen3.8-27B: una cuantización principal IQ4_XS de la comunidad jrell y un modelo draft Q4_0 de Unsloth para decodificación especulativa (MTP). El resultado es una configuración lista para ejecutar en Ollama con una ventana de contexto de 262 144 tokens (256K), pensada para aprovechar la capacidad de contexto largo del modelo base en hardware de consumo.

El modelo subyacente, Qwen3.8-27B, es un modelo denso de 27 mil millones de parámetros, nativo de visión-lenguaje, construido sobre la arquitectura de Qwen3.5 y orientado a tareas de razonamiento multi-paso y uso agéntico. Este paquete, desarrollado por willyesiam, no es un lanzamiento oficial de Qwen y no incluye los pesos en el repositorio: un script de instalación los descarga desde los repositorios upstream. Su relevancia radica en ofrecer una forma sencilla de ejecutar localmente un modelo de 27B con contexto de 256K y aceleración por decodificación especulativa, sin necesidad de configurar manualmente el draft model.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base: Qwen3.8-27B) |
| Parametros totales | 27 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262 144 tokens (256K) |
| Tipos de cuantizacion | IQ4_XS (modelo principal, con FFN en IQ3_S) y Q4_0 (draft MTP) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo principal y draft MTP) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso, según la documentación oficial de Qwen, que lo describe como un modelo de visión-lenguaje nativo con control de pensamiento flexible y capacidad para completar tareas complejas de varios pasos. El repositorio de GitHub QwenLM/Qwen3.8 indica que se construye sobre la base arquitectónica de Qwen3.5 y ofrece mejoras en codificacion, trabajo profesional, investigacion y tareas agénticas de largo horizonte. La informacion disponible no detalla el número de tokens de entrenamiento ni la composicion del dataset.

Este paquete concreto no es un fine-tune ni un merge: es una configuracion de Ollama que genera un Modelfile con las instrucciones `FROM` (modelo principal jrell IQ4_XS) y `DRAFT` (modelo MTP Q4_0 de Unsloth), junto con `PARAMETER num_ctx 262144` y `PARAMETER draft_num_predict 2`. La innovacion tecnica destacable es la combinacion de una cuantizacion hibrida "i1" (atencion en IQ4_XS, capas FFN en IQ3_S) con un modelo draft separado para decodificacion especulativa, lo que puede reducir la latencia de generacion en Ollama.

## Capacidades

- Generacion de texto y razonamiento multi-paso: el modelo base Qwen3.8-27B esta diseñado para tareas complejas que requieren planificacion y ejecucion de varios pasos.
- Vision y lenguaje: segun la documentacion de Qwen, el modelo es nativo de vision-lenguaje, capaz de entender imagenes y videos. No se especifica si el encoder de vision esta incluido en los GGUFs de este paquete.
- Control de pensamiento flexible: el modelo puede alternar entre modos de razonamiento explicito y respuesta directa, segun la tarea.
- Codigo y matematicas: el modelo base esta optimizado para tareas de programacion y calculo, aunque no se aportan benchmarks en esta ficha.
- Soporte de agentes y tareas de largo horizonte: el contexto de 256K permite mantener el estado de conversaciones o workflows extensos.
- Tool calling / function calling: no se menciona explicitamente en la informacion disponible; no se puede confirmar para esta configuracion concreta.
- Decodificacion especulativa: el paquete incluye un modelo draft MTP Q4_0, que en Ollama se usa para acelerar la generacion mediante prediccion de tokens candidatos.

## Casos de uso

- Analisis de documentos extensos: con una ventana de 262 144 tokens, el modelo puede procesar manuales tecnicos, informes legales o contratos completos sin necesidad de fragmentar el texto. Es adecuado para sectores como legal o auditoria, donde la coherencia global del documento es critica.
- Agentes autonomos con memoria larga: el contexto amplio permite que un agente mantenga el historial completo de una interaccion prolongada, lo que facilita tareas de planificacion y ejecucion de multiples pasos sin perder informacion intermedia.
- Generacion de codigo en local: la cuantizacion IQ4_XS reduce el peso del modelo a unos 13,5 GB, lo que permite ejecutarlo en GPUs de consumo (por ejemplo, RTX 4090 o RTX 5090) con Ollama, ideal para entornos de desarrollo sin dependencia de APIs externas.
- Asistente de investigacion academica: el contexto de 256K permite cargar varios papers completos y realizar preguntas transversales sobre ellos, manteniendo las citas y el contenido original en memoria.
- Soporte tecnico con historial de conversacion: en escenarios de atencion al cliente, el modelo puede gestionar conversaciones multi-turno muy largas, recordando decisiones anteriores y evitando respuestas contradictorias.
- Revision de repositorios de codigo grandes: el contexto largo permite analizar multiples ficheros fuente a la vez, extrayendo patrones, dependencias o posibles errores sin necesidad de dividir el analisis en pasos separados.
- RAG sobre grandes corpus: la ventana de 256K reduce la necesidad de fragmentar la recuperacion, permitiendo inyectar mas documentos relevantes en una sola pasada y mejorando la precision de las respuestas basadas en conocimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21,1 GB observados en una configuracion probada con contexto de 262 144 tokens y el modelo draft cargado en GPU. La mayor parte de la VRAM se consume en la cache KV, no en los pesos.
- GPU recomendada: NVIDIA GeForce RTX 5090 Laptop (24 GB) fue la configuracion verificada. Se recomienda una GPU con al menos 24 GB de VRAM para usar el contexto completo de 256K.
- GPUs de consumo: con contextos mas reducidos (por ejemplo, 65 536 tokens) podria caber en GPUs de 16 GB, pero no hay datos de pruebas que lo confirmen.
- Opciones de despliegue: Ollama (principal, con el script `install.ps1`), o carga manual de los GGUFs en llama.cpp u otros motores compatibles con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Caracteristica | Este paquete (jrell IQ4_XS + MTP Q4_0) | Qwen/Qwen3.8-27B (base, safetensors) | unsloth/Qwen3.8-27B-GGUF (GGUF estandar) |
|---|---|---|---|
| Parametros | 27B | 27B | 27B |
| Contexto configurado | 262 144 tokens | No disponible | No disponible |
| Cuantizacion | IQ4_XS (FFN IQ3_S) + Q4_0 draft | Sin cuantizar | Varias (no especificadas en esta ficha) |
| Decodificacion especulativa | Si (MTP draft) | No | No |
| Licencia | Apache-2.0 | Apache-2.0 | Apache-2.0 |
| Formato | GGUF | Safetensors | GGUF |
| Disponibilidad | Repositorio de instalacion, sin pesos | HuggingFace | HuggingFace |

La comparacion se limita a caracteristicas tecnicas, ya que no se dispone de datos de rendimiento ni benchmarks publicados para ninguna de las variantes.

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo: el script de instalacion los descarga de los repositorios upstream. Si estos dejan de estar disponibles, el paquete no funcionara.
- La cuantizacion de jrell no declara una licencia independiente en su model card; por este motivo no se redistribuye en este repositorio, pero su uso queda sujeto a los terminos del repositorio original.
- El contexto de 256K es muy intensivo en memoria: la mayoria de la VRAM se destina a la cache KV, no a los pesos. No se garantiza que todas las GPUs de 24 GB puedan cargar esta configuracion.
- El comportamiento de la decodificacion especulativa puede variar entre versiones de Ollama. La configuracion fue verificada en Ollama 0.33.3, pero no se garantiza en versiones posteriores.
- No se han publicado benchmarks, por lo que no es posible evaluar el rendimiento real del modelo en tareas estandar como MMLU, HumanEval o GSM8K.
- El modelo base Qwen3.8-27B tiene capacidades de vision-lenguaje, pero no se especifica si los GGUFs de este paquete incluyen el encoder de vision. Es necesario verificar antes de usarlo en tareas multimodales.
- Riesgo de alucinacion inherente a los modelos de lenguaje. No se dispone de datos sobre sesgos especificos de esta configuracion.

## Enlaces

- Repositorio del paquete: https://huggingface.co/willyesiam/Qwen3.8-27B-jrell-IQ4XS-MTP-Q4-256K-Ollama
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF de Unsloth (draft MTP): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizacion principal de jrell: https://huggingface.co/jrell/Qwen3.8-27B-i1-IQ4_XS-GGUF-Smaller
- GitHub de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Descarga de Ollama para Windows: https://ollama.com/download/windows
