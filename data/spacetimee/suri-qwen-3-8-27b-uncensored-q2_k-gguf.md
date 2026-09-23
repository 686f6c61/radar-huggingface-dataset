# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q2_K-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-Q2_K-GGUF es la version cuantizada en formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, un LLM de aproximadamente 26.900 millones de parametros. El repositorio ha sido generado automaticamente con la herramienta GGUF-my-repo de ggml.ai a partir del modelo original en precision completa, aplicando la cuantizacion Q2_K de llama.cpp. Se trata, por tanto, de un artefacto de distribucion mas que de un modelo nuevo: no aporta pesos reentrenados ni cambios de arquitectura respecto a su modelo base.

El interes practico radica en que la cuantizacion Q2_K reduce el peso del modelo a un tamano manejable (el repositorio ocupa 10,7 GB) para poder ejecutarlo en hardware de consumo con llama.cpp, Ollama o LM Studio, a costa de una perdida notable de calidad respecto a cuantizaciones mas altas. El sufijo "Uncensored" del modelo base indica que este ha sido modificado para eliminar o relajar las capas de alineacion de seguridad, un aspecto relevante para cualquier despliegue en produccion.

La informacion publicada por el autor es minima: no se declara licencia, idiomas soportados, pipeline ni resultados de evaluacion. El nombre sugiere un linaje Qwen (familia Qwen3) de ~27B, pero este dato no esta confirmado en la documentacion disponible y debe verificarse en el modelo base antes de cualquier uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre del modelo base sugiere linaje Qwen; sin confirmar en la documentacion) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K (esta version); el modelo base puede ofrecer otras, no documentadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |
| Tamano del repositorio | 10,7 GB |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Fecha de creacion | 2026-09-23 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna, el proceso de entrenamiento, la composicion del dataset, el numero de tokens utilizados ni sobre tecnicas de alineacion (RLHF, DPO u otras) del modelo base. La model card de este repositorio es una plantilla generada automaticamente por GGUF-my-repo y no incluye detalles tecnicos mas alla de las instrucciones de uso con llama.cpp.

Lo unico verificable es el proceso de conversion: los pesos originales en precision completa se transformaron a formato GGUF y se cuantizaron a Q2_K mediante llama.cpp. Q2_K es una cuantizacion de 2 bits con escalas y minimos por bloque (superbloques de 256 pesos), lo que sitúa el peso efectivo en torno a 2,6 bits por parametro. Esto explica que un modelo de ~26,9B se reduzca a un fichero de aproximadamente 10 GB, pero tambien implica una degradacion considerable de la calidad de generacion, especialmente en tareas de razonamiento, matematicas y codigo.

## Capacidades

La documentacion disponible no detalla capacidades especificas. A partir del tipo de modelo (LLM denso de ~27B) y del nombre del modelo base se puede inferir lo siguiente, siempre sin confirmacion documental:

- Generacion de texto y conversacion multi-turno en un LLM de proposito general.
- Presumible capacidad de razonamiento y conocimiento general propia de un modelo de ~27B.
- Comportamiento sin filtros de seguridad o con filtros muy relajados, segun indica el sufijo "Uncensored" del modelo base.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades multimodales (vision, audio): no disponible; los tags no indican vision.

Nota: la cuantizacion Q2_K degrada de forma significativa las capacidades anteriores respecto al modelo base en precision completa. No debe asumirse que el rendimiento observado en el modelo original se mantenga en esta version.

## Casos de uso

- Asistente conversacional autoalojado: un LLM de ~27B cuantizado a Q2_K puede ejecutarse en una GPU de consumo o incluso en CPU con RAM suficiente, lo que permite desplegar un chatbot privado sin dependencia de APIs externas.
- Generacion de texto creativo sin restricciones editoriales: la naturaleza "Uncensored" del modelo base lo hace adecuado para ficcion, guiones o narrativa donde los filtros de seguridad de modelos comerciales resultan limitantes.
- Procesamiento de documentos sensibles en local: al poder ejecutarse on-premise, permite resumir, clasificar o extraer informacion de textos confidenciales sin enviarlos a terceros.
- Investigacion en alineacion y seguridad: util como referencia para estudiar el comportamiento de modelos sin alineacion frente a sus equivalentes alineados, comparando respuestas ante prompts sensibles.
- Generacion de datos sinteticos: puede emplearse para producir corpus de texto de bajo coste en pipelines de aumento de datos, con la advertencia de que la calidad de Q2_K es limitada y requiere revision posterior.
- Reescritura y transformacion de texto en lotes: tareas de parafraseo, cambio de tono o reformateo de documentos pueden automatizarse localmente sin coste por token.
- Prototipado rapido en entornos con recursos limitados: Q2_K permite validar un flujo de trabajo con un modelo de ~27B antes de migrar a una cuantizacion mayor o a un proveedor en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 10-12 GB solo para los pesos en Q2_K; con contexto moderado (4-8K tokens) y cache KV, entre 12 y 16 GB.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) o A100/H100 permiten ejecutar el modelo con contexto amplio y margen.
- Cabe en GPU de consumo: si. RTX 4080 / 4070 Ti Super (16 GB) lo ejecutan con contexto reducido; una RTX 3060 de 12 GB podria cargarlo con contexto muy limitado y riesgo de desbordamiento.
- Despliegue en CPU: viable con llama.cpp si se dispone de 12-16 GB de RAM libre; el rendimiento sera notablemente inferior al de GPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python. vLLM tiene soporte GGUF limitado y no es la via recomendada para este formato.
- Latencia y throughput: no disponible. No se han publicado mediciones para esta cuantizacion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de modelos comparables documentados en la informacion proporcionada. Se puede comparar esta cuantizacion con su propio modelo base:

| Modelo | Parametros | Formato | Tamano | Calidad esperada | Licencia |
|---|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored-Q2_K-GGUF | ~26,9B | GGUF Q2_K | 10,7 GB | Reducida (cuantizacion de 2 bits) | no disponible |
| Suri-Qwen-3.8-27B-Uncensored (base) | ~26,9B | safetensors | no disponible (precisión completa) | Referencia | no disponible |

Comparacion con alternativas de otros autores: no disponible.

## Limitaciones y advertencias

- Calidad degradada por la cuantizacion: Q2_K es una de las cuantizaciones mas agresivas de llama.cpp (en torno a 2,6 bits por parametro). Se espera una perdida notable en razonamiento, matematicas, codigo y coherencia en contextos largos respecto al modelo base.
- Modelo "Uncensored": al haberse eliminado o relajado la alineacion de seguridad, el modelo puede generar contenido danino, ofensivo, ilegal o inexacto sin las salvaguardas habituales. Requiere supervision humana y filtros externos si se expone a usuarios finales.
- Riesgo de alucinacion: no disponible de forma especifica, pero todo LLM de este tipo puede inventar hechos; la cuantizacion Q2_K probablemente incrementa este riesgo.
- Licencia no declarada: no se especifica la licencia de este repositorio ni del modelo base. Es imprescindible verificar los terminos del modelo original antes de cualquier uso comercial.
- Idiomas no declarados: se desconoce que idiomas cubre el modelo y con que calidad.
- Longitud de contexto desconocida: la model card de ejemplo usa `-c 2048`, pero eso es solo un valor de ejemplo del servidor, no la capacidad real del modelo.
- Cero adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Artefacto automatico: al haber sido generado con GGUF-my-repo, no ha habido una revision manual de la calidad de la conversion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q2_K-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio GGUF-my-repo (herramienta de conversion): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
