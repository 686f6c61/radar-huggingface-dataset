# unsloth/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Super-VL-120B-A12B es un modelo multimodal de tipo vision-language desarrollado por NVIDIA dentro de la familia Nemotron, y esta ficha concreta corresponde a la version cuantizada en GGUF publicada por Unsloth. El modelo original en BF16 se distribuye como NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16, con pesos de referencia a precision completa, y esta version GGUF esta pensada para inferencia local y despliegue con llama.cpp u Ollama.

La arquitectura combina capas intercaladas de Mamba-2, Mixture-of-Experts (MoE) y atencion, junto con un codificador de vision C-RADIO y un conector vision-lenguaje. Segun la model card, cuenta con 120.000 millones de parametros totales y 12.000 millones de parametros activos, con una longitud de contexto de hasta 1 millon de tokens y decodificacion especulativa nativa mediante Multi-Token Prediction (MTP). Acepta texto, imagenes y video como entrada, y genera texto.

Su relevancia actual radica en que es uno de los pocos modelos abiertos de escala 120B que unen razonamiento, codigo, uso de herramientas, comprension de documentos y comprension de video en un solo checkpoint, con licencia OpenMDW-1.1 y soporte declarado para uso comercial. La publicacion de cuantizaciones dinamicas por parte de Unsloth facilita el despliegue en hardware que no puede alojar los pesos BF16 completos. Existe una discrepancia notable en los metadatos de HuggingFace: el campo de parametros totales derivado de safetensors indica 1.632.922.404 parametros, un valor incompatible con los 120B que declara la model card; conviene verificar el peso real antes de dimensionar hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-2 + Transformer, con Mixture-of-Experts (MoE) intercalado y codificador de vision C-RADIO |
| Parametros totales | 120B segun la model card (12B activos); el campo de parametros de safetensors en HuggingFace indica 1.632.922.404, dato inconsistente con la model card |
| Parametros activos | 12B |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | GGUF con cuantizaciones dinamicas Unsloth Dynamic 3.0 (niveles concretos no disponibles); el modelo base ofrece ademas una version NVFP4 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | OpenMDW-1.1 (etiquetada como "other" en HuggingFace) |
| Formato de pesos | GGUF en este repositorio; safetensors BF16 y NVFP4 en el modelo base de NVIDIA |
| Precision de referencia | BF16 |
| Modalidades de entrada / salida | Texto, imagenes y video / texto |
| Decodificacion especulativa | Si, mediante Multi-Token Prediction (MTP) nativo |
| Modo de razonamiento | Configurable en la plantilla de chat con `enable_thinking=True/False` |
| Muestreo recomendado | Texto: temperatura 1.0, top_p 0.95; vision: temperatura 0.6, top_p 0.95 |
| Despliegue recomendado (BF16) | 4x H100 o 2x GB200 |

## Arquitectura y entrenamiento

La arquitectura es un hibrido que intercala capas de espacio de estados Mamba-2 con capas de atencion y capas Mixture-of-Experts. Este diseno busca combinar la eficiencia de Mamba-2 en secuencias largas con la capacidad de recuperacion precisa de la atencion, manteniendo un coste de computo por token bajo gracias a que solo se activan 12B de los 120B parametros totales. La parte visual la aporta un codificador C-RADIO seguido de un conector vision-lenguaje que proyecta las representaciones visuales al espacio de tokens del modelo de lenguaje, lo que habilita entradas de imagen y video. El modelo incorpora Multi-Token Prediction, que permite decodificacion especulativa nativa sin necesidad de un modelo borrador externo.

La model card menciona como conjuntos de datos de entrenamiento nvidia/nemotron-pre-training-datasets y nvidia/nemotron-post-training-v3, pero no detalla el numero de tokens, la composicion del corpus ni la mezcla exacta de etapas de ajuste. Tampoco se especifica en la informacion disponible si se emplearon tecnicas concretas de RLHF, DPO u otras variantes de alineacion en la fase de post-entrenamiento. El modelo expone un modo de razonamiento conmutable mediante plantilla de chat, lo que sugiere una etapa de entrenamiento orientada a separar la generacion de cadenas de razonamiento de la respuesta final.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de pensamiento activable o desactivable desde la plantilla de chat.
- Comprension de imagenes y video, incluyendo descripcion, respuesta a preguntas visuales y analisis de contenido audiovisual.
- Comprension de documentos, orientada a extraccion de informacion y analisis de material con estructura compleja.
- Generacion y analisis de codigo.
- Uso de herramientas y function calling, segun lo declarado en la descripcion del modelo.
- Razonamiento matematico y cientifico a nivel de posgrado, segun los resultados publicados en GPQA-Diamond y HLE.
- Soporte multilingue en ingles, castellano, frances, aleman, italiano y japones.
- Contexto largo de hasta 1M tokens, adecuado para corpus extensos y conversaciones de muchos turnos.
- Decodificacion especulativa nativa mediante MTP, sin modelo borrador adicional.

## Casos de uso

- Analisis de documentos extensos: con hasta 1M tokens de contexto, el modelo puede ingerir contratos, informes tecnicos o expedientes completos y responder preguntas que requieran cruzar informacion situada en secciones muy distantes del documento, junto con las tablas o figuras escaneadas que contenga.
- Revision de video para supervision industrial: el modelo acepta video como entrada, por lo que puede procesar grabaciones de linea de produccion o de camaras de seguridad y emitir informes textuales sobre eventos detectados, reduciendo la necesidad de un pipeline separado de vision y lenguaje.
- Asistente de codigo en produccion: dado su soporte declarado de tool calling, puede integrarse en flujos de CI/CD para revisar diferencias de codigo, proponer parches y ejecutar llamadas a herramientas de test o de busqueda en el repositorio.
- Atencion al cliente multilingue: el soporte de seis idiomas y el contexto largo permiten mantener conversaciones multi-turno con historial extenso y documentacion de producto adjunta, sin perder el hilo de la conversacion.
- Extraccion de informacion de facturas y formularios: combinando la entrada de imagen y el razonamiento sobre documentos, se puede usar para convertir documentos escaneados en estructuras de datos verificables antes de volcarlas a un sistema de gestion.
- Razonamiento cientifico asistido: los resultados publicados en GPQA-Diamond y HLE apuntan a un uso en tareas de nivel experto en fisica, quimica y biologia, como apoyo a la revision de hipotesis o a la interpretacion de resultados experimentales.
- Agente autonomo con multiples pasos: el modo de razonamiento configurable y el soporte de herramientas permiten construir agentes que planifiquen, invoquen APIs y verifiquen resultados en varios ciclos antes de responder.
- Analisis de accesibilidad de contenido audiovisual: generacion de descripciones y subtitulos enriquecidos a partir de video, aprovechando la comprension conjunta de imagen, audio transcrito y texto.

## Benchmarks y rendimiento

La model card publica la siguiente tabla de resultados. El valor de LiveCodeBench v6 aparece truncado en la informacion disponible, por lo que no se reproduce. La columna del modelo figura en la fuente como "Nemotron 3.5 SuperGA BF16". No se especifica la configuracion de evaluacion (numero de intentos, modo de razonamiento activado o desactivado), por lo que los valores deben tomarse como referencia publicada por el fabricante.

| Benchmark | Nemotron 3.5 Super VL (BF16) | Qwen3.5-122B-A10B | Qwen3.8-Flash-Next | DeepSeek-V4-Flash0731 | Nemotron 3 Ultra | Inkling-Small | GLM-5.3-Flash |
|---|---:|---:|---:|---:|---:|---:|---:|
| GPQA-Diamond | 89,52 | 86,7 | 92,7 | 89,6 | 87,0 | 88,6 | 91,2 |
| HLE (solo texto) | 31,79 | 24,2 | 39,6 | 35,8 | 29,2 | 33,3 | 36,47 |
| MMLU-ProX | 76,91 | 83,2 | 83,0 | 85,5 | 83,1 | 84,0 | 83,0 |
| AA-Omniscience (precision) | 26,20 | 26,2 | 27,9 | 45,0 | 25,3 | 35,4 | 34,2 |
| AA-Omniscience (tasa de alucinacion) | 30,0 | 84,5 | 41,3 | 95,9 | 22,1 | 59,6 | 30,3 |
| AA-Omniscience (indice) | 4,03 | -36,1 | -1,9 | -7,8 | 8,8 | -3,1 | 14,3 |
| CritPt | 10,86 | 1,1 | no disponible | 12,6 | 3,1 | 9,1 | no disponible |
| APEX shortlist | 88,36 | 54,7 | 91,8 | 88,7 | 75,0 | 71,5 | 77,1 |
| LiveCodeBench v6 | valor truncado en la fuente, no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados especificos de benchmarks de vision, video u OCR, ni comparativas de rendimiento para la version cuantizada en GGUF frente a la version BF16.

## Requisitos de hardware

- BF16 (pesos de referencia): aproximadamente 240 GB solo en pesos (120B x 2 bytes), lo que exige 4x H100 de 80 GB o 2x GB200 segun la propia model card. Estimacion aritmetica, no confirmada por el fabricante para esta configuracion concreta.
- NVFP4: NVIDIA publica una release especifica en NVFP4 para despliegue optimizado; los requisitos de hardware de esa variante no se detallan en la informacion disponible.
- GGUF en Q4: estimacion de unos 68-72 GB de pesos, compatible con una H100 80 GB o con configuraciones multi-GPU de 48 GB o mas; no cabe en una unica RTX 4090 de 24 GB.
- GGUF en Q8: estimacion de unos 127 GB de pesos, fuera del alcance de cualquier GPU consumer individual.
- Inferencia con offload a CPU: al ser un MoE con solo 12B de parametros activos, llama.cpp puede repartir los expertos entre RAM y VRAM, lo que permite ejecutar el modelo en equipos con bastante memoria del sistema aunque con latencia por token elevada. No se dispone de mediciones publicadas de throughput en esta configuracion.
- Contexto de 1M tokens: la cache KV con esa longitud es muy costosa en memoria adicional; en la practica conviene usar contextos menores o tecnicas de compresion de cache. No se especifica en la informacion disponible el consumo de memoria por token de contexto.
- Opciones de despliegue: llama.cpp, Ollama y Unsloth Studio para los ficheros GGUF; vLLM y TGI para los pesos safetensors en BF16 o NVFP4.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparativa se limita a los modelos que aparecen en la tabla de benchmarks publicada por NVIDIA, ya que no hay informacion disponible sobre sus fichas tecnicas completas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron 3.5 Super VL 120B-A12B | 120B totales, 12B activos | Hasta 1M tokens | OpenMDW-1.1 | Pesos en HuggingFace (NVIDIA en BF16 y NVFP4; Unsloth en GGUF) |
| Qwen3.5-122B-A10B | 122B totales, 10B activos (segun la nomenclatura) | no disponible | no disponible | no disponible en la informacion proporcionada |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| DeepSeek-V4-Flash0731 | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |
| GLM-5.3-Flash | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

En los datos publicados, Nemotron 3.5 Super VL obtiene el mejor resultado en APEX shortlist (88,36) y en CritPt (10,86) del conjunto comparado, mientras que queda por debajo de Qwen3.8-Flash-Next en HLE y GPQA-Diamond, y claramente por debajo de Qwen3.5-122B-A10B y DeepSeek-V4-Flash0731 en MMLU-ProX. Destaca su tasa de alucinacion declarada en AA-Omniscience (30,0), muy inferior a la de Qwen3.5-122B-A10B (84,5) y DeepSeek-V4-Flash0731 (95,9), aunque superior a la de Nemotron 3 Ultra (22,1).

## Limitaciones y advertencias

- Discrepancia de metadatos: el repositorio de HuggingFace declara 1.632.922.404 parametros en el campo derivado de safetensors, frente a los 120B de la model card. Es imprescindible verificar el contenido real de los ficheros antes de planificar el despliegue.
- Riesgo de alucinacion: la propia tabla de NVIDIA reporta una tasa de alucinacion de 30,0 en AA-Omniscience, con un indice de 4,03. Es un valor bajo en su grupo, pero no nulo, por lo que las salidas factuales deben validarse en entornos de produccion.
- Rendimiento desigual por tarea: el resultado en MMLU-ProX (76,91) esta por debajo de varios competidores directos, lo que sugiere menor solidez en conocimiento general y multilingue que en razonamiento cientifico.
- Cobertura idiomatica limitada a seis idiomas (en, es, fr, de, it, ja); no se declara soporte para otras lenguas, incluidos otros idiomas oficiales de Espana.
- Longitud de contexto de 1M tokens: es una capacidad nominal que no viene acompanada de datos publicos sobre degradacion de rendimiento a esa distancia ni de benchmarks especificos de contexto largo.
- Licencia OpenMDW-1.1: la model card afirma que el modelo esta listo para uso comercial y no comercial, pero la licencia figura como "other" en HuggingFace y sus terminos completos deben revisarse antes de distribuirlo o integrarlo en productos.
- Los requisitos de hardware citados (4x H100 o 2x GB200) corresponden a la version BF16 y no se han publicado cifras equivalentes para las cuantizaciones GGUF de este repositorio.
- No hay resultados publicados de benchmarks para la version cuantizada, por lo que la perdida de precision respecto a BF16 es desconocida.
- El repositorio ocupa 1202,2 GB, lo que implica un coste de almacenamiento y de ancho de banda considerable incluso si solo se descarga una de las cuantizaciones.
- No se detalla la composicion del dataset de entrenamiento ni si se aplicaron tecnicas de alineacion como RLHF o DPO, lo que limita el analisis de sesgos y de comportamiento en dominios sensibles.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Release en NVFP4: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4
- Guia de Unsloth para ejecutar Nemotron 3.5 Super VL: https://unsloth.ai/docs/models/nemotron-3.5-super-vl
- Cuantizaciones dinamicas Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Pagina de desarrollador de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Dataset de pre-entrenamiento: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth
- Documentacion de Unsloth Studio: https://unsloth.ai/docs/new/studio
- Servidor de Discord de Unsloth: https://discord.gg/unsloth
- Servidor de Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
