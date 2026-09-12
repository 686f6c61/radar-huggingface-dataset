# TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-W4A16-AWQ

## Resumen

La ficha corresponde al modelo `TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-W4A16-AWQ`, una cuantizacion de 4 bits publicada por el usuario TheUnderscore sobre el modelo base `DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored`. No se trata de un modelo entrenado desde cero, sino de una version comprimida del modelo de DavidAU, que a su vez es un ajuste fino de la familia Qwen3.5/Qwen3.8 segun las etiquetas del repositorio. El pipeline declarado es `image-text-to-text`, por lo que el modelo conserva la torre de vision en BF16 y admite entradas de imagen y texto.

El modelo declara 27.781.427.952 parametros totales en los pesos safetensors y ocupa 19,6 GB en el repositorio. La cuantizacion aplicada es W4A16 asimetrica (4 bits en pesos, 16 bits en activaciones) con tamano de grupo 128, almacenada en el formato pack-quantized de `compressed-tensors`, que LMDeploy `turbomind` detecta y carga de forma nativa. Se mantienen en BF16 los embeddings, `lm_head`, normalizaciones, `linear_attn.in_proj_a/b`, la torre de vision y las cabezas MTP (multi-token prediction), de modo que la arquitectura completa sigue siendo cargable.

La relevancia de esta publicacion es practica: reduce el coste de despliegue de un modelo de ~27,8B multimodal a un unico repositorio de menos de 20 GB, con soporte para 5 modos de razonamiento (thinking) y 5 modos de instruccion conmutables en caliente. Las etiquetas `uncensored` y `heretic` indican un ajuste fino con filtros de rechazo reducidos de forma deliberada, lo que condiciona su uso responsable en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrida de atencion (familia Qwen3.5, segun etiquetas), con torre de vision y cabezas MTP; `linear_attn.in_proj_a/b` presentes, lo que indica capas de atencion lineal combinadas con atencion completa |
| Parametros totales | 27.781.427.952 (27,78B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16_ASYM (4 bits asimetricos, grupo de 128) en formato `compressed-tensors` pack-quantized; embeddings, `lm_head`, normalizaciones, `linear_attn.in_proj_a/b`, torre de vision y cabezas MTP permanecen en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (400 modulos cuantizados repartidos en 7 shards + 1 shard no cuantizado `model-nonquant.safetensors`) |
| Biblioteca declarada | transformers |
| Pipeline | image-text-to-text |
| Tamano del repositorio | 19,6 GB |

## Arquitectura y entrenamiento

La arquitectura se corresponde con la familia Qwen3.5 referenciada en las etiquetas, con una configuracion de atencion hibrida: capas de atencion completa combinadas con capas de atencion lineal, identificables por la presencia de `linear_attn.in_proj_a/b` entre los tensores que el autor ha decidido no cuantizar. El modelo incorpora ademas cabezas MTP (`mtp.*`), orientadas a decodificacion especulativa o prediccion multi-token, y una torre de vision (`model.visual.*`) que habilita el pipeline image-text-to-text. La receta de cuantizacion del autor indica que las activaciones de las capas de atencion hibrida requieren mapeos especificos de suavizado AWQ (atencion completa `input_layernorm` a `self_attn.q/k/v`, `post_attention_layernorm` a `mlp.gate/up`, y `mlp.up_proj` a `mlp.down_proj`, con `duo_scaling="both"`), y advierte que un mapeo generico o mal emparejado corrompe la decodificacion en esta familia de modelos.

No se dispone de informacion sobre el proceso de entrenamiento del modelo base: no se detalla el numero de tokens, la composicion del dataset ni si se emplearon tecnicas de RLHF, DPO u otras. Lo unico documentado es el proceso de cuantizacion: cuantizacion one-shot offline con `llmcompressor` y offloading a CPU (`compressed_tensors.offload.load_offloaded_model`), con `AWQModifier` para el suavizado de activaciones. La ejecucion registro 400 modulos cuantizados, 244 minutos de tiempo total y un pico de 5,06 GB de VRAM por GPU sobre un equipo de 2x16 GB.

## Capacidades

- Generacion de texto conversacional y multimodal: el pipeline declarado es `image-text-to-text`, con torre de vision preservada en BF16.
- Razonamiento con modos de pensamiento: 5 modos thinking y 5 modos instruct, conmutables en caliente mediante API, de forma directa o dentro del propio mensaje de chat.
- Reduccion de tokens de pensamiento: la variante TWIN-TURBO se presenta explicitamente como una version con menos "thinking tokens" y mejor rendimiento que sus equivalentes de mayor tamano.
- Ajuste orientado a contenido sin censura: variante "Light to Moderate Heretic", con equilibrio declarado hacia el rendimiento.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Decodificacion especulativa: la presencia de cabezas MTP sugiere soporte, pero no se documenta explicitamente su uso en inferencia.

## Casos de uso

- Despliegue en GPU de gama alta para consumo: al ocupar 19,6 GB en disco con pesos de 4 bits, el modelo puede servirse en una unica GPU de 24 GB o repartirse en 2x16 GB con `tp=2`, tal como documenta el autor, lo que abarata el coste por instancia frente a la version BF16.
- Asistente conversacional multimodal: la torre de vision en BF16 permite procesar imagenes junto a texto, util para transcripcion de capturas, analisis de documentos escaneados o descripcion de diagramas en flujos internos.
- Generacion de texto con control de esfuerzo: los 5 modos thinking permiten alternar entre respuestas rapidas de bajo coste y cadenas de razonamiento largas segun la criticidad de la consulta, sin recargar el modelo.
- Experimentacion en investigacion sobre alineacion y seguridad: la variante "uncensored"/"heretic" es adecuada para estudiar el comportamiento del modelo ante prompts rechazados por versiones alineadas, siempre en entornos controlados y con supervision.
- Pipelines con `lmdeploy turbomind`: el formato `compressed-tensors` es autodetectado por el motor, lo que permite desplegar el modelo con decodificacion paginada y servir peticiones concurrentes sin convertir los pesos.
- Evaluacion comparativa de cuantizaciones: el repositorio incluye scripts de cuantizacion y un shard no cuantizado, lo que facilita reproducir la receta y comparar la perdida de calidad frente al modelo base en BF16.
- Integracion en entornos con soporte de `compressed-tensors`: la etiqueta `endpoints_compatible` apunta a su uso detras de APIs compatibles tipo endpoints, util para montar servicios internos de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite explicitamente al README del modelo original (`DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored`) para las tablas completas de rendimiento, sin incluir cifras propias. La busqueda web realizada no devolvio ningun resultado relacionado con el modelo: todos los enlaces recuperados corresponden a documentacion historica sobre el caso Brown v. Board of Education y son irrelevantes para esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB solo para pesos (19,6 GB de repositorio), a los que hay que sumar cache KV y activaciones. Cifra estimada, no publicada por el autor.
- Configuracion validada por el autor: LMDeploy `turbomind` con `tp=2` sobre un equipo de 2x16 GB. La cuantizacion del modelo original se ejecuto con offloading a CPU y un pico de 5,06 GB por GPU.
- GPU recomendadas: 2x16 GB en tensor parallel para una configuracion holgada; una unica GPU de 24 GB (RTX 3090, RTX 4090, A10G) queda muy justa y depende de la longitud de contexto y del tamano de lote; GPU de 40-80 GB (A100, H100) eliminan la presion de memoria y permiten lotes mayores.
- Cabe en GPU de consumo: si, en RTX 3090 o RTX 4090 de 24 GB, con contexto y lote reducidos; en tarjetas de 16 GB es necesario tensor parallel o cuantizacion adicional.
- Opciones de despliegue: LMDeploy `turbomind` con `model_format="compressed-tensors"` (ruta probada por el autor y recomendada por el formato); vLLM y cualquier runtime con soporte de `compressed-tensors`; la carga mediante `transformers` es posible pero no implica aceleracion de la cuantizacion. No se documenta soporte de llama.cpp, GGUF ni Ollama para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Benchmarks |
|---|---|---|---|---|---|
| TheUnderscore/Qwen3.8-27B-...-W4A16-AWQ (este modelo) | 27,78B | no disponible | W4A16 AWQ, `compressed-tensors` | apache-2.0 | no disponibles |
| DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored (modelo base) | no disponible | no disponible | BF16 | no disponible | no disponibles en la informacion proporcionada |
| Qwen3-32B (referencia de la familia) | no disponible en esta busqueda | no disponible en esta busqueda | multiples (BF16, AWQ, GPTQ) | apache-2.0 | no disponibles en esta busqueda |

La informacion proporcionada no incluye datos de rendimiento del modelo base ni de alternativas, y la busqueda web no aporto ninguna comparativa utilizable, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Modelo marcado como `uncensored` y `heretic`: el ajuste fino reduce deliberadamente los rechazos, por lo que puede generar contenido que otros modelos de la familia bloquearian. Requiere filtros propios si se expone a usuarios finales.
- Riesgo de alucinacion: no se publican evaluaciones de veracidad ni de tasas de alucinacion, ni para este modelo ni para su base.
- La cuantizacion a 4 bits puede degradar la calidad respecto al modelo en BF16; el autor no aporta tablas comparativas que cuantifiquen esa perdida.
- Longitud de contexto no declarada: no es posible planificar cargas de trabajo con documentos largos sin validacion previa.
- Idiomas soportados no declarados: no se puede asumir cobertura multilingue correcta sin pruebas.
- Restricciones de licencia: el repositorio declara apache-2.0, pero el modelo base no declara licencia en la informacion disponible, lo que introduce incertidumbre juridica para uso comercial. Conviene verificar la licencia del modelo original de DavidAU antes de un despliegue en produccion.
- Formato de pesos no portable a todos los runtimes: al usar `compressed-tensors` pack-quantized, no es directamente compatible con llama.cpp, GGUF u Ollama sin una conversion adicional no documentada.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de uso ni validacion por terceros.
- Fechas de creacion y actualizacion (11 de septiembre de 2026) posteriores a la fecha habitual de referencia, dato que conviene contrastar con el registro real del repositorio.
- Las etiquetas mencionan `qwen3.5`, `qwen3.8` y `qwen3_5` simultaneamente, lo que dificulta fijar con precision la arquitectura subyacente exacta.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/TheUnderscore/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-W4A16-AWQ
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Herramienta de cuantizacion llmcompressor: https://github.com/vllm-project/llmcompressor
- Nota: la busqueda web asociada a esta ficha no devolvio ningun resultado relacionado con el modelo, su modelo base ni su familia arquitectonica.
