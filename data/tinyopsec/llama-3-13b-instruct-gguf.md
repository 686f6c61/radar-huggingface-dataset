# tinyopsec/Llama-3-13B-Instruct-GGUF

## Resumen

`tinyopsec/Llama-3-13B-Instruct-GGUF` es una coleccion de cuantizaciones GGUF del modelo `elinas/Llama-3-13B-Instruct`, un merge de tipo passthrough construido a partir de slices del modelo original Llama-3-8B-Instruct de Meta. El resultado es un modelo de aproximadamente 13.000 millones de parametros orientado a generacion de texto conversacional y escritura creativa (storywriting), distribuido en 13 ficheros GGUF que cubren desde F16 hasta Q2_K.

El modelo no es un entrenamiento original: es un merge que combina pesos de Llama-3-8B-Instruct para alcanzar un tamano intermedio de 13B, una practica habitual en la comunidad para obtener variantes con mayor capacidad que el 8B base sin llegar a los 70B. El autor de este repositorio (`tinyopsec`) se limita a publicar las cuantizaciones producidas con llama.cpp, por lo que la calidad final depende enteramente del merge original de `elinas`.

Es relevante ahora porque permite ejecutar un modelo de 13B en hardware de consumo mediante cuantizacion de 4 bits, con compatibilidad con llama.cpp, Ollama, LM Studio y koboldcpp. Sin embargo, el propio autor advierte de que las capacidades logicas (programacion, matematicas, ciencia) pueden estar degradadas por el proceso de merge, lo que limita su uso a tareas conversacionales y creativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3), pesos fusionados mediante merge passthrough |
| Parametros totales | 13.046.837.248 (13,05B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M (recomendada), Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Llama 3 Community License (llama3) |
| Formato de pesos | GGUF (13 ficheros; repo de 120,2 GB en total) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia Llama 3. No se trata de un modelo entrenado desde cero, sino de un merge de tipo passthrough: se combinan slices de pesos del Llama-3-8B-Instruct de Meta para producir un checkpoint de 13B. Este tipo de fusion no anade entrenamiento nuevo ni ajuste adicional; hereda las capacidades del modelo base y las redistribuye en una arquitectura de mayor tamano.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO, ya que el autor no las documenta y el modelo base original de Meta si las tuvo pero no se detallan en esta ficha. La innovacion tecnica relevante es la propia cuantizacion GGUF generada con llama.cpp, que permite ejecutar el modelo en CPU y GPU de consumo con perdida controlada de precision. No se documentan tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional multi-turno en formato chat/instruct.
- Escritura creativa y storywriting, el caso de uso principal declarado por el autor.
- Razonamiento basico y respuesta a instrucciones, aunque el autor advierte de posible degradacion logica.
- Compatibilidad con runtimes GGUF: llama.cpp, Ollama, LM Studio, koboldcpp.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible; el aviso de degradacion logica sugiere que no es fiable.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Escritura creativa y generacion de ficcion: el modelo esta disenado explicitamente para storywriting; con Q4_K_M cabe en GPUs de consumo y permite iterar borradores largos en local.
- Chat conversacional local: su formato instruct permite desplegarlo en Ollama o LM Studio para asistentes personales sin conexion, con la ventaja de privacidad de ejecucion local.
- Prototipado de aplicaciones de texto: util para validar pipelines de generacion antes de migrar a modelos mayores, gracias a su bajo coste de inferencia en cuantizacion de 4 bits.
- Generacion de dialogos para videojuegos o narrativa interactiva: el enfoque en storywriting encaja con la produccion de lineas de personaje y ramificaciones narrativas.
- Experimentacion con merges y cuantizaciones: sirve como caso de estudio para investigadores que quieran analizar el efecto del merge passthrough y la cuantizacion en la calidad.
- Despliegue en entornos con CPU: los ficheros Q3 y Q4 permiten inferencia en CPU con llama.cpp, adecuado para estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: F16 ~26,1 GB; Q8_0 ~13-14 GB; Q6_K ~10-11 GB; Q5_K_M ~9-10 GB; Q4_K_M ~7,5-8 GB; Q3_K_M ~6-7 GB; Q2_K ~5 GB (estimaciones a partir del tamano de los ficheros y del numero de parametros).
- GPU recomendadas: A100 o H100 para F16; RTX 4090 (24 GB) para Q8_0 y superiores; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con Q4_K_M; en GPUs de 8 GB con Q3_K_M o Q2_K.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| tinyopsec/Llama-3-13B-Instruct-GGUF | 13,05B | no disponible | Llama 3 Community | GGUF | Merge passthrough; logica potencialmente degradada |
| elinas/Llama-3-13B-Instruct | ~13B | no disponible | Llama 3 Community | safetensors | Modelo base del que deriva esta cuantizacion |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03B | 8.192 tokens | Llama 3 Community | safetensors, GGUF | Modelo oficial de Meta; referencia de calidad instruct |
| Mistral-7B-Instruct | 7,24B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa permisiva con contexto mayor |

La comparativa se limita a datos estructurales; no hay benchmarks publicados para este merge que permitan comparar rendimiento real frente a las alternativas.

## Limitaciones y advertencias

- El autor advierte explicitamente de que las capacidades logicas (programacion, matematicas, ciencia) pueden estar degradadas por el merge; no es adecuado para tareas que requieran razonamiento preciso.
- Riesgo de alucinacion elevado en tareas factuales, agravado por la falta de benchmarks que validen su calidad.
- El autor recomienda usar sin penalizacion de repeticion o con valores inferiores a 1,05; valores superiores pueden degradar la coherencia.
- Licencia Llama 3 Community: restricciones de uso comercial, obligacion de atribucion y clausulas de aceptacion de la licencia de Meta; revisar antes de produccion.
- No se documentan idiomas soportados; el rendimiento en castellano no esta garantizado.
- No hay informacion sobre longitud de contexto efectiva ni sobre soporte de tool calling, lo que limita su uso en pipelines de agentes.
- Modelo de la comunidad con 774 descargas y 0 likes: sin validacion externa significativa.
- El repositorio ocupa 120,2 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tinyopsec/Llama-3-13B-Instruct-GGUF
- Modelo base: https://huggingface.co/elinas/Llama-3-13B-Instruct
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- Licencia Llama 3: https://llama.meta.com/llama3/license
