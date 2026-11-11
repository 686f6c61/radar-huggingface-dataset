# stneric/simplixity-writer-4b-GGUF

## Resumen

simplixity-writer-4b-GGUF es la version cuantizada en formato GGUF de simplixity-writer-4b, el modelo de respuesta del proyecto Simplixity, desarrollado por stneric. Se trata de un modelo de generacion de texto de aproximadamente 4.326 millones de parametros (4,3B) orientado especificamente a tareas de generacion aumentada por recuperacion (RAG) con citacion de fuentes. El repositorio incluye dos cuantizaciones listas para usar con llama.cpp y Ollama.

El modelo se construye sobre una base arquitectonica etiquetada como qwen3.5, lo que sugiere una adaptacion o derivacion de la familia Qwen. Su ventana de contexto declarada es de 8192 tokens, dimensionada para acomodar documentos fuente junto con la consulta del usuario en flujos RAG. La licencia Apache 2.0 facilita su adopcion tanto en entornos de investigacion como comerciales.

Su relevancia actual radica en dos aspectos: por un lado, la especializacion en citacion verificable de fuentes, una necesidad creciente en aplicaciones de recuperacion de informacion; por otro, la preservacion de la capa MTP (multi-token prediction) en los archivos GGUF, que habilita decodificacion especulativa en llama.cpp y Ollama con una mejora reportada de aproximadamente 127 a 180 tokens por segundo en una RTX 3070 Ti.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base qwen3.5, segun tags del autor) |
| Parametros totales | 4.326.350.848 (4,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | Q4_K_M (2,8 GB, recomendada), Q8_0 (4,6 GB) |
| Idiomas soportados | ingles (en), aleman (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo se basa en una arquitectura transformer etiquetada como qwen3.5 y que deriva del modelo stneric/simplixity-writer-4b. No se detalla en la model card el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; la documentacion remite al repositorio del proyecto Simplixity para los detalles de entrenamiento y resultados.

La innovacion tecnica destacable es la conservacion de la capa MTP (multi-token prediction) en ambos archivos GGUF. Esto permite que llama.cpp y Ollama realicen decodificacion especulativa usando esa capa como borrador, con un `draft_num_predict` de 2 (valores de 3 resultan mas lentos segun el autor). El modelo esta ajustado para una ventana de 8192 tokens, que es la longitud para la que fue entrenado.

## Capacidades

- Generacion de texto conversacional orientada a respuestas con citacion de fuentes (RAG con citations).
- Produccion de respuestas fundamentadas en documentos recuperados, ajustando las fuentes a la ventana de contexto disponible.
- Soporte de decodificacion especulativa mediante capa MTP en llama.cpp y Ollama.
- Capacidades multilingues limitadas a ingles y aleman.
- Integracion con Ollama mediante `RENDERER` y `PARSER` qwen3.5 para el procesamiento correcto del system prompt.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Asistente RAG con citas verificables: el modelo recibe documentos recuperados y genera respuestas que referencian las fuentes, adecuado para bases de conocimiento internas donde la trazabilidad es requisito.
- Busqueda documental en entornos corporativos: con 8192 tokens de contexto puede procesar varios fragmentos recuperados junto a la consulta y sintetizar una respuesta citando cada fragmento.
- Despliegue local en estaciones de trabajo: la cuantizacion Q4_K_M de 2,8 GB cabe en GPUs de consumo, lo que permite ejecutar el modelo en equipos sin infraestructura dedicada.
- Atencion al cliente sobre documentacion propia: integrado en Ollama como modelo de chat, responde consultas apoyandose en manuales o FAQ recuperados, con citas que permiten al usuario verificar la respuesta.
- Prototipado rapido de pipelines RAG: la integracion documentada con Simplixity y Ollama permite montar un flujo completo de recuperacion y respuesta en pocos pasos.
- Procesamiento de documentacion tecnica bilingue (ingles/aleman): util para equipos que operan con documentacion en ambos idiomas y necesitan respuestas citadas en la misma lengua de la fuente.
- Inferencia de alta velocidad en hardware modesto: gracias a la decodificacion especulativa via MTP, alcanza aproximadamente 180 tokens/s en una RTX 3070 Ti, adecuado para aplicaciones interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio del proyecto Simplixity para consultar resultados y limites. El unico dato de rendimiento proporcionado es el de throughput en inferencia: aproximadamente 127 a 180 tokens/s en una RTX 3070 Ti con decodificacion especulativa activada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB para Q4_K_M y 5 GB para Q8_0, mas el overhead del contexto de 8192 tokens.
- GPU recomendadas: RTX 3070 Ti (medicion reportada por el autor), asi como GPUs con 6 GB o mas de VRAM para Q4_K_M.
- Cabe en GPU de consumo: si, con la cuantizacion Q4_K_M en tarjetas de 6 GB o superiores.
- Opciones de despliegue: llama.cpp (`llama-server` con `--spec-type draft-mtp --spec-draft-n-max 2`) y Ollama (version 0.40 o superior para decodificacion especulativa con `draft_num_predict 2`).
- Latencia y throughput: aproximadamente 127 tokens/s sin decodificacion especulativa y 180 tokens/s con ella en una RTX 3070 Ti, segun el autor.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni comparaciones con otros modelos de la misma categoria, por lo que no es posible establecer una comparativa fundamentada.

## Limitaciones y advertencias

- Idiomas limitados a ingles y aleman; no se documenta soporte de castellano.
- Ventana de contexto de 8192 tokens, insuficiente para documentos muy extensos o conversaciones de muchos turnos con mucho material recuperado.
- Sin datos publicados de benchmarks, sesgos o evaluaciones de alucinacion en la informacion disponible; el riesgo de alucinacion debe evaluarse en el dominio concreto de uso.
- El modelo esta especializado en generacion de respuestas RAG con citas; no se documentan capacidades de codigo, matematicas, tool calling ni agentes.
- Para que el system prompt llegue al modelo en Ollama es obligatorio configurar `RENDERER` y `PARSER` con el valor qwen3.5; sin ellos el comportamiento se degrada.
- En Ollama, `draft_num_predict` debe ser 2; un valor de 3 resulta mas lento.
- La ruta indicada tras `FROM` en el Modelfile debe ser absoluta; las rutas relativas no funcionan.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y del proyecto Simplixity.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria practicamente inexistentes.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/stneric/simplixity-writer-4b-GGUF
- Modelo base: https://huggingface.co/stneric/simplixity-writer-4b
- Repositorio del proyecto Simplixity: https://github.com/stneric/simplixity
