# turintech/DeepSeek-V4.1-Flash-1017-Artemis-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Artemis-GGUF es una cuantizacion en formato GGUF del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por TurinTech bajo el nombre de su pipeline de compresion Artemis. El modelo base es un transformer de tipo mixture-of-experts (MoE) orientado a generacion de texto, con 748.494.643.824 parametros totales segun los metadatos de safetensors del repositorio. Esta version esta pensada para inferencia en CPU mediante llama.cpp, no para servicio en GPU.

La relevancia de esta ficha radica en que permite ejecutar un modelo de gran escala en hardware sin aceleradores, a costa de un consumo de memoria muy elevado. TurinTech distribuye dos conjuntos de shards: Q3_K (siete ficheros, 385,58 GB) y Q2_K (seis ficheros, 330,38 GB). El repositorio completo ocupa 716,0 GB. La licencia declarada es MIT, heredada del modelo base.

La model card es deliberadamente conservadora: describe una validacion con ocho prompts fijos por conjunto, revisados a mano, y advierte de que no se trata de un benchmark ni de una comparativa entre cuantizaciones. No se publican datos de arquitectura interna, contexto, idiomas ni rendimiento en tareas estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer con mezcla de expertos (MoE), segun etiquetas del autor; detalles internos no disponibles |
| Parametros totales | 748.494.643.824 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la invocacion de ejemplo de llama.cpp usa `-c 4096`) |
| Tipos de cuantizacion | Q3_K (385,58 GB, 7 shards) y Q2_K (330,38 GB, 6 shards) |
| Idiomas soportados | no disponible (la validacion incluye un prompt en espanol) |
| Licencia | MIT |
| Formato de pesos | GGUF (shards multiples) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos, segun las etiquetas `moe` y `mixture-of-experts` de la model card. No se dispone de informacion sobre el numero de expertos, la topologia de enrutamiento, el numero de capas ni la dimension oculta, ni sobre el volumen o la composicion del corpus de entrenamiento, el uso de RLHF o DPO, o innovaciones como decodificacion especulativa o atencion lineal. Todos estos datos deben consultarse en la model card del modelo base.

La aportacion de TurinTech es la compresion con Artemis y el empaquetado en GGUF. La model card indica que se requiere una version de llama.cpp con soporte para DeepSeek V4.1 Flash; se probo con la release v0.9.0 y el commit `149f5641`, sin que se establezca una build minima. La ruta validada es CPU pura: `--device none -ngl 0`, carga por mmap con `--lazy-mode on`, 8 hilos de computo y 8 de batch, contexto de 4096, batch 128 y micro-batch 64. La integracion con Ollama y LM Studio no esta soportada ni cualificada.

## Capacidades

- Generacion de texto y conversacion multi-turno mediante el endpoint `/completion` de llama-server.
- Razonamiento con modo "thinking": la card menciona un prompt de aritmetica con thinking activado y el encoder `encode_messages(messages, thinking_mode="chat")`.
- Llamada a herramientas (tool calling): se valida un prompt de tool call y el parser `parse_message_from_completion_text` lee la respuesta incluyendo tool calls. Las llamadas no se ejecutaron.
- Generacion de codigo: se incluye un prompt de codigo, aunque el codigo generado no se ejecuto.
- Salida estructurada en JSON: uno de los ocho prompts de validacion produce JSON.
- Resumen de texto: prompt de resumen incluido en la validacion.
- Capacidad multilingue limitada en la evidencia disponible: un unico prompt en espanol, que en Q2_K se corto en el limite de 256 tokens.
- Recuperacion de informacion de turnos anteriores dentro de la conversacion (prompt de recall).

## Casos de uso

- Procesamiento por lotes en servidores sin GPU: el modelo se puede servir con llama-server en CPU y cargar por mmap, lo que permite reutilizar hosts con mucha RAM para tareas de generacion no interactivas, como resumir o clasificar grandes volumenes de documentos.
- Analisis de documentos extensos con contexto de 4096 tokens: la configuracion probada admite conversaciones de varios turnos y recuperacion de informacion previa, util para asistentes internos sobre bases documentales acotadas.
- Generacion de codigo asistida en entornos aislados: con tool calling validado a nivel de formato, puede integrarse en flujos donde el codigo se revisa antes de ejecutarse, por ejemplo generacion de parches que pasan por revision humana.
- Extraccion de datos estructurados: el prompt JSON de la validacion sugiere uso en pipelines de normalizacion de registros, siempre con validacion posterior del esquema.
- Prototipado y evaluacion de modelos grandes sin infraestructura de aceleradores: util para equipos que quieren medir el comportamiento cualitativo de un MoE de este tamano antes de invertir en GPU.
- Traduccion y respuestas en espanol en entornos controlados: la validacion incluye un prompt en espanol, aunque el corte a 256 tokens en Q2_K obliga a fijar limites de generacion mas amplios y a verificar la calidad por idioma.
- Experimentacion con cuantizaciones de muy baja precision: comparar Q3_K y Q2_K sobre el mismo conjunto de prompts para estudiar la degradacion de calidad en modelos MoE de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye unicamente una validacion funcional con ocho prompts fijos por conjunto de shards:

| Fichero | Tamano | Prompts completados (de 8) | Cortados por limite de tokens (de 8) | RSS pico del servidor en CPU |
|---|---|---|---|---|
| TurinTech Q3_K | 385,58 GB | 8 | 0 | 254,01 GB |
| TurinTech Q2_K | 330,38 GB | 7 | 1 | 372,65 GB |

Los prompts cubren explicacion, JSON, codigo, resumen, espanol, recall de un turno anterior, tool call y aritmetica con thinking. El codigo y las tool calls no se ejecutaron. El autor advierte explicitamente de que esta prueba no es un benchmark, no compara con ficheros de otros publicadores y no permite ordenar las dos cuantizaciones. El RSS pico se observo en un host compartido con 2 TB de RAM y no constituye un requisito minimo.

## Requisitos de hardware

- RAM: el conjunto Q3_K ocupa 385,58 GB en disco y registro un RSS pico de 254,01 GB; el Q2_K ocupa 330,38 GB y registro 372,65 GB de RSS pico. Se recomienda un host con al menos 512 GB de RAM para Q3_K y con margen amplio para Q2_K, dado el RSS observado.
- GPU: no se cualifico el servicio en GPU. La ruta probada es CPU con `--device none -ngl 0`. No hay datos de VRAM para A100, H100 ni RTX 4090; con 748.494 millones de parametros totales, el modelo no cabe en ninguna GPU de consumo en estas cuantizaciones.
- GPU de consumo: no cabe. Ni siquiera en configuraciones multi-GPU de gama alta sin offloading masivo a RAM.
- Despliegue: llama.cpp con soporte para DeepSeek V4.1 Flash (probado con v0.9.0 y commit `149f5641`), mediante `llama-server` y el endpoint `/completion`. Ollama y LM Studio no estan soportados ni cualificados. No se menciona soporte de vLLM ni TGI para estos ficheros GGUF.
- Codificacion de peticiones: obligatorio usar el encoder propio del modelo base, `encode_messages(messages, thinking_mode="chat")` de `encoding/encoding.py` en el repositorio deepseek-ai/DeepSeek-V4.1-Flash-1017 (commit `1bae0e1`), enviar la cadena a `/tokenize` con `"add_special": false, "parse_special": true` y pasar la lista de tokens como `prompt` de `/completion`.
- Parametros de inferencia probados: `temperature: 0`, `seed: 0`, `n_predict: 256` (128 para recall, 384 para tool call, 1024 para thinking), `cache_prompt: false`, `stream: false`.
- Latencia y throughput: no disponibles. La card no publica tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Evidencia de rendimiento |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-Artemis-GGUF (esta ficha) | 748,49 B | no disponible | GGUF Q3_K / Q2_K | MIT | Validacion funcional de 8 prompts; sin benchmarks |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (modelo base) | 748,49 B | no disponible | safetensors | MIT | no disponible en esta ficha |
| Otras cuantizaciones GGUF del mismo modelo base | no disponible | no disponible | GGUF | MIT (presumible) | no disponible |

No se dispone de informacion sobre alternativas comparables de la misma categoria en el material proporcionado; la comparativa con modelos de otros autores queda como no disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks; la unica evidencia de calidad es una validacion manual de ocho prompts, insuficiente para decisiones de produccion.
- El codigo y las tool calls generados durante la validacion no se ejecutaron, por lo que no hay garantia de correccion funcional.
- El Q2_K no completo uno de los ocho prompts: la respuesta en espanol se corto en el limite de 256 tokens. La calidad multilingue y la robustez de esta cuantizacion estan sin verificar.
- El consumo de memoria es extremo: cientos de GB de RAM. El RSS pico de Q2_K (372,65 GB) supero al de Q3_K (254,01 GB) en el host de prueba, lo que sugiere un comportamiento de memoria no trivial que debe medirse en el hardware objetivo.
- La ruta de servicio en GPU no esta cualificada; usar aceleradores exige validacion propia.
- El endpoint correcto es `/completion`, no chat completions. Usar la API de chat sin el encoder propio del modelo puede producir resultados incorrectos.
- La integracion con Ollama y LM Studio no esta soportada; los botones automaticos del Hub no constituyen una prueba de compatibilidad.
- No hay informacion sobre sesgos, riesgo de alucinacion especifico, idiomas soportados ni limitaciones de contexto mas alla de los 4096 tokens usados en la prueba.
- La licencia MIT se hereda del modelo base; conviene verificar el fichero LICENSE enlazado en el repositorio base antes de uso comercial.
- Descargas y adopcion muy bajas (394 descargas, 5 likes en el momento de la consulta): ecosistema de soporte limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/turintech/DeepSeek-V4.1-Flash-1017-Artemis-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Encoder del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/1bae0e1088993b9b82de08f59de5be5a34e42170/encoding/encoding.py
- Licencia del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017/blob/1bae0e1088993b9b82de08f59de5be5a34e42170/LICENSE
- Resultados completos y metodo: RESULTS.md en el repositorio de TurinTech
- Web de TurinTech: https://www.turintech.ai
- Perfil de TurinTech en Hugging Face: https://huggingface.co/turintech
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
