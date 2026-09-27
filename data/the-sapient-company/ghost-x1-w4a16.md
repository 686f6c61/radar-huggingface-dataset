# The-Sapient-Company/ghost-x1-w4a16

## Resumen

ghost-x1-w4a16 es una version cuantizada a 4 bits (formato w4a16, pesos de 4 bits y activaciones de 16 bits) del modelo abliterado Huihui-Qwen3.8-27B-abliterated, publicado por The-Sapient-Company. El modelo padre es una variante sin rechazos (uncensored) de Qwen/Qwen3.8-27B obtenida mediante tecnicas de abliteracion, es decir, la identificacion y eliminacion de la direccion de activacion asociada a las respuestas de rechazo, sin reentrenamiento adicional. El resultado es un modelo multimodal de tipo image-text-to-text con 26.895.998.464 parametros (aproximadamente 26,9 mil millones), pensado para generacion conversacional y tareas que combinan texto e imagen.

La relevancia de esta ficha es doble. Por un lado, el tag compressed-tensors y el sufijo w4a16 indican que el checkpoint esta preparado para servir con runtimes de inferencia de alto rendimiento (vLLM, SGLang, TGI) reduciendo el coste de memoria frente al modelo en bfloat16. Por otro, el tag endpoints_compatible sugiere que el artefacto esta empaquetado para desplegarse en plataformas de inferencia gestionada sin conversiones adicionales.

Se trata, sin embargo, de un artefacto con validacion practicamente nula: cero descargas y cero likes en el momento de redactar esta ficha, con una model card que reproduce en su mayor parte el README del modelo abliterado original de huihui-ai y no documenta el proceso de cuantizacion, los idiomas soportados, la longitud de contexto ni resultados de evaluacion. Cualquier decision de produccion deberia apoyarse en una evaluacion propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); arquitectura concreta no documentada en la informacion disponible |
| Parametros totales | 26.895.998.464 (aproximadamente 26,9 B) |
| Parametros activos | No procede (no hay evidencia de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | w4a16 (pesos de 4 bits, activaciones de 16 bits) en formato compressed-tensors; no se publican GGUF ni otras variantes en el repositorio |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con metadatos compressed-tensors; libreria transformers |
| Modelo base | Qwen/Qwen3.8-27B, via la variante abliterada huihui-ai/Huihui-Qwen3.8-27B-abliterated |
| Tamano del repositorio | 74,1 GB |
| Pipeline declarado | image-text-to-text |
| Fecha de publicacion | 2026-09-27 (ultima actualizacion 2026-09-27) |

## Arquitectura y entrenamiento

La informacion disponible describe el proceso aplicado al modelo base, no una arquitectura propia de este repositorio. El modelo original Qwen/Qwen3.8-27B fue transformado mediante abliteracion, una tecnica que calcula la direccion media de activacion que separa las respuestas con rechazo de las respuestas neutras y despues proyecta esa direccion fuera de las matrices de pesos implicadas. La implementacion de referencia citada en la model card es `remove-refusals-with-transformers` de Sumandora, descrita por el propio autor como una prueba de concepto sin TransformerLens.

La model card detalla el alcance del proceso: solo se ablacionaron las capas 18 a 51, mientras que las 15 primeras capas se conservan sin modificar para preservar mejor el rendimiento del modelo original. Ademas, se indica explicitamente que las cabezas de prediccion multitoken (MTP) y el modulo visual no han sido alterados. No se documento ningun reentrenamiento, ajuste con RLHF/DPO ni cambio en los datos de preentrenamiento: la abliteracion es una intervencion post-hoc sobre los pesos, y el presente repositorio anade unicamente una capa de cuantizacion w4a16 mediante compressed-tensors. No hay informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de cuantizacion (calibracion, granularidad de grupos, precision de escalas).

## Capacidades

- Generacion de texto conversacional multturno, heredada del modelo base y etiquetada con el tag `conversational`.
- Procesamiento de entradas image-text-to-text: el pipeline declarado y la referencia al modulo visual no modificado implican soporte de vision.
- Generacion de codigo y resolucion de problemas tecnicos, como capacidad esperable del modelo Qwen subyacente, si bien no hay evaluacion publicada que lo cuantifique en esta variante.
- Prediccion multitoken (MTP), presente en el modelo base y explicitamente preservada sin ablacionar.
- Ausencia deliberada de rechazos: el modelo no aplicara las politicas de negativa del modelo original ante peticiones censuradas o sensibles.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking): la model card menciona el token `</think>`, lo que sugiere plantilla de razonamiento del modelo base, pero no se documenta su comportamiento en esta variante.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion en alineacion y seguridad: el modelo sirve como sujeto de pruebas para medir como cambia la tasa de rechazo tras ablacionar las capas 18 a 51, comparando respuestas frente al Qwen3.8-27B original en un mismo conjunto de prompts.
- Red teaming de aplicaciones: al carecer de rechazos, permite generar de forma controlada contenido que un modelo alineado bloquearia, util para construir conjuntos de evaluacion de filtros de moderacion en entornos de laboratorio aislados.
- Analisis de documentos escaneados: gracias al pipeline image-text-to-text, puede extraer campos estructurados de facturas, formularios o capturas de pantalla, siempre que la tarea no requiera contexto muy largo (no se documenta la ventana disponible).
- Prototipado de asistentes conversacionales internos: el tag `endpoints_compatible` y el formato compressed-tensors permiten levantarlo en vLLM o TGI con un consumo de memoria reducido respecto al modelo en bfloat16.
- Generacion creativa y editorial sin filtros: redaccion de ficcion, guiones o contenido de marca donde las politicas de rechazo del modelo base resultan un obstaculo, con revision humana obligatoria posterior.
- Base para ajuste fino (LoRA/QLoRA): el checkpoint cuantizado en 4 bits es adecuado como punto de partida para QLoRA sobre dominios verticales, reduciendo el coste de hardware frente al modelo en bfloat16.
- Evaluacion comparativa de cuantizacion: util para medir la degradacion de calidad que introduce w4a16 frente al modelo abliterado en bfloat16, ejecutando el mismo banco de prompts sobre ambos.
- Asistente de codigo autoalojado: despliegue en infraestructura propia para autocompletado y explicacion de codigo, evitando enviar codigo propietario a APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni para el modelo abliterado ni para esta version cuantizada. Tampoco se documenta la perdida de calidad introducida por la cuantizacion w4a16 respecto al checkpoint en bfloat16.

## Requisitos de hardware

- VRAM estimada para inferencia en w4a16: aproximadamente 13,5 GB solo para los pesos (26,9 B x 0,5 bytes). Con cache KV, buffers de activacion y el modulo visual, es razonable planificar entre 16 y 22 GB para contextos moderados.
- VRAM estimada en bfloat16: aproximadamente 54 GB para los pesos, mas cache KV segun contexto.
- GPU consumer: una RTX 4090 o RTX 3090 de 24 GB puede ejecutar la version w4a16 con contexto limitado; una RTX 4080/4070 Ti de 16 GB queda al limite y probablemente requiera cuantizacion mas agresiva u offload.
- GPU profesional: A100 40 GB suficiente para w4a16 con holgura, insuficiente para bfloat16 sin paralelismo; A100 80 GB y H100 80 GB permiten bfloat16 sin offload; H200 141 GB permite bfloat16 con contextos mas largos.
- Configuraciones multi-GPU: dos A100 40 GB o dos RTX 4090 con tensor parallelism son una via practica para servir bfloat16 o aumentar el contexto.
- Opciones de despliegue: vLLM y SGLang son los candidatos naturales por su soporte de compressed-tensors; TGI y transformers tambien son viables. Para Ollama existe el tag `huihui_ai/Qwen3.8-abliterated`, pero corresponde al modelo abliterado sin cuantizar en ese formato, no a este repositorio.
- CPU: no se publica GGUF, de modo que llama.cpp, Ollama o LM Studio no pueden consumir directamente este checkpoint sin una conversion previa a ese formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| The-Sapient-Company/ghost-x1-w4a16 | 26,9 B | No disponible | w4a16 | Si (image-text-to-text) | apache-2.0 | HuggingFace, 0 descargas |
| huihui-ai/Huihui-Qwen3.8-27B-abliterated | No disponible (heredado del base) | No disponible | bfloat16 | Si (modulo visual sin modificar) | apache-2.0 | HuggingFace y Ollama |
| Qwen/Qwen3.8-27B | No disponible | No disponible | bfloat16 | Si | apache-2.0 | HuggingFace |

La comparativa se limita a los tres artefactos mencionados en la informacion proporcionada. No se dispone de datos de parametros, contexto ni rendimiento de los modelos base y abliterado mas alla de lo indicado, y no se han encontrado en la busqueda web modelos alternativos comparables con datos verificables.

## Limitaciones y advertencias

- Modelo abliterado: la eliminacion de la direccion de rechazo implica que no aplicara politicas de contenido. No es apto para aplicaciones de cara al publico sin una capa de moderacion externa.
- Riesgo de respuestas daninas, ilegales o inseguras: la abliteracion reduce la capacidad del modelo para negarse a peticiones problematicas por diseno, no por fallo puntual.
- Degradacion potencial de coherencia: la intervencion sobre las capas 18 a 51 puede afectar a otras capacidades ademas del rechazo; no se publica ninguna evaluacion que lo mida.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, y presumiblemente no inferior al del modelo base.
- Perdida adicional por cuantizacion: el paso a w4a16 introduce un error numerico no documentado; no hay comparativa publicada frente al checkpoint en bfloat16.
- Idiomas no declarados: se desconoce la cobertura multilingue real de esta variante.
- Longitud de contexto no declarada: no es posible planificar casos de uso con contexto largo sin medirla experimentalmente.
- Discrepancia en el tamano del repositorio: 74,1 GB frente a los aproximadamente 13,5 GB teoricos de un checkpoint w4a16 de 26,9 B, lo que sugiere la presencia de pesos en mayor precision, copias duplicadas u otros artefactos no documentados. Conviene inspeccionar el indice de safetensors antes de desplegar.
- Inconsistencias en los metadatos: el identificador del repositorio (`ghost-x1-w4a16`) no coincide con el titulo de la model card, que corresponde al modelo abliterado de huihui-ai, y las fechas de creacion y actualizacion estan fijadas en septiembre de 2026.
- Validacion nula: cero descargas y cero likes, sin issues ni referencias externas. No existe evidencia de la comunidad sobre su comportamiento real.
- Licencia: el repositorio declara apache-2.0, pero al derivar de Qwen es recomendable verificar los terminos aplicables al modelo base y el cumplimiento de las condiciones de atribucion antes de un uso comercial.

## Enlaces

- Repositorio del modelo: https://huggingface.co/The-Sapient-Company/ghost-x1-w4a16
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante abliterada de referencia: https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated
- Herramienta de abliteracion citada: https://github.com/Sumandora/remove-refusals-with-transformers
- Version en Ollama del modelo abliterado: https://ollama.com/huihui_ai/Qwen3.8-abliterated
- Repositorio de Ollama: https://github.com/ollama/ollama/releases

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; las entradas recuperadas correspondian al articulo gramatical ingles "the" y no aportan informacion tecnica.
