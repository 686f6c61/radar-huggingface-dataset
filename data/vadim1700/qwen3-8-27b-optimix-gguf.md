# Vadim1700/Qwen3.8-27B-OptiMix-GGUF

## Resumen

Qwen3.8-27B-OptiMix-GGUF es una cuantizacion en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario Vadim1700. No se trata de un modelo entrenado desde cero, sino de una receta de cuantizacion mixta (~4,03 bpw) pensada para inferencia de un solo stream en Apple Silicon, construida y medida sobre un MacBook M4 base con 32 GB de RAM unificada. El repositorio incluye ademas una cabeza MTP (multi-token prediction) cuantizada aparte en Q2_K para usarse como modelo borrador en decodificacion especulativa.

La aportacion tecnica principal no es el modelo en si, sino la mezcla de tipos de cuantizacion por tensor: se usan exclusivamente tipos con kernels rapidos en Metal (IQ4_XS, IQ3_S, Q6_K, Q4_K) y se evita deliberadamente q3_K porque en un M4 sus lecturas mat-vec rondan los 50 GB/s frente a los ~90 GB/s de q4_K, de modo que un modelo q3_K mas pequeno resulta mas lento. El autor reporta 12,8 GiB de pesos con una perplexity en wikitext-2 de 6,302, frente a 6,337 de un Q3_K_M de 12,4 GiB.

El interes practico es acotado pero claro: es una pieza de ingenieria de inferencia local reproducible (la receta `llama-quantize` completa esta en la model card) con mediciones de velocidad y calidad publicadas, algo poco habitual en cuantizaciones de autor individual. Ahora bien, el repositorio tiene 0 descargas y 0 likes, y los metadatos de HuggingFace presentan inconsistencias de tamano y de numero de parametros que conviene verificar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con proyecciones de atencion lineal y modulo SSM (inferido de los nombres de tensor `attn_qkv`, `attn_gate`, `ssm_out` en la receta de cuantizacion); no confirmado en la informacion disponible |
| Parametros totales | 27B segun el nombre del modelo; los metadatos de safetensors del repo indican 2.967.501.312 (~3B). Discrepancia sin resolver en la informacion disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa `-c 8192` como flag de servidor, no como contexto entrenado) |
| Tipos de cuantizacion | GGUF mixta por tensor, ~4,03 bpw: IQ4_XS en proyecciones de atencion y atencion lineal, `attn_output` y `ffn_down`; IQ3_S en `ffn_gate` y `ffn_up`; Q6_K en la cabeza de salida; Q4_K en los embeddings de tokens. Cabeza MTP independiente en Q2_K |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp). El repo declara 1,4 GB de tamano en HuggingFace, frente a los 12,8 GiB del fichero principal segun la model card; discrepancia sin resolver |

Ficheros del repositorio:

| Fichero | Tamano declarado | Contenido |
|---|---|---|
| `Qwen3.8-27B-OptiMix.gguf` | 12,8 GiB | Modelo cuantizado completo |
| `mtp-Qwen3.8-27B-head_q2_K.gguf` | 1,3 GiB | Cabeza MTP de borrador con la cabeza de salida recuantizada a Q2_K (solo afecta al borrador, nunca a la salida final) |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.8-27B, del que la informacion proporcionada solo indica la relacion de cuantizacion; no se detallan datos de entrenamiento, numero de tokens, composicion del corpus ni si hubo RLHF o DPO. Los nombres de tensor que aparecen en la receta (`attn_qkv`, `attn_q`, `attn_k`, `attn_v`, `attn_gate`, `attn_output`, `ssm_out`, `ffn_gate`, `ffn_up`, `ffn_down`) apuntan a una arquitectura hibrida que combina capas de atencion (con compuerta) y capas de atencion lineal con un modulo SSM, pero esta lectura es una inferencia a partir de la receta de cuantizacion y no una confirmacion del autor.

La innovacion documentada esta en el proceso de cuantizacion: se parte de los pesos bf16 completos y se aplica una imatrix de bartowski con una asignacion de tipos por tensor optimizada para los kernels Metal. El criterio declarado es no usar ningun tipo que no tenga kernel Metal rapido, lo que explica la eleccion de IQ4_XS e IQ3_S en las matrices grandes y Q6_K en la cabeza de salida. Ademas se distribuye una cabeza MTP en Q2_K para decodificacion especulativa, con la precaucion de que al ser solo borrador no degrada la calidad de la salida. No se documenta ninguna innovacion en el entrenamiento del modelo base.

## Capacidades

- Generacion de texto conversacional: el repositorio esta etiquetado como `conversational`, por lo que el uso previsto es el dialogo y la generacion de texto en un servidor llama.cpp.
- Decodificacion especulativa mediante cabeza MTP: el autor incluye un borrador Q2_K que acelera la generacion entre un 22 % y un 49 % segun el tipo de contenido (prosa frente a codigo) en el hardware medido.
- Servicio con multiples slots: soporta `llama-server` con hasta 12 slots en paralelo (22 tok/s agregados medidos), lo que permite atender varias peticiones concurrentes en una sola maquina.
- Compatibilidad con endpoints: el repositorio lleva la etiqueta `endpoints_compatible`, lo que indica que puede exponerse a traves de la API HTTP de llama.cpp.
- Optimizacion para Apple Silicon: los tipos de cuantizacion elegidos estan seleccionados para kernels Metal, con mediciones sobre M4.
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling, agentes, modo thinking y capacidades multilingues: no documentados en la informacion disponible.

## Casos de uso

- Asistente de codigo totalmente offline en un portatil Apple Silicon: con 12,8 GiB de pesos y la cabeza MTP, el modelo cabe en un MacBook con 32 GB de RAM unificada y alcanza 10,0 tok/s en generacion de codigo, suficiente para autocompletado y explicacion de fragmentos sin enviar codigo a un servicio externo.
- Servidor de generacion de texto para un equipo pequeno: `llama-server` con 12 slots ofrece 22 tok/s agregados, adecuado para uso interno de baja concurrencia (documentacion, resumenes, respuestas a preguntas sobre documentacion propia) en una unica maquina.
- Investigacion en decodificacion especulativa: el par modelo + cabeza MTP Q2_K permite reproducir y comparar el coste de la pasada de verificacion de 2 a 5 tokens frente a pasadas separadas, con una linea base publicada (stock llama.cpp ~5,5 tok/s frente a 8,2-10,0 tok/s con el fork).
- Evaluacion de recetas de cuantizacion: la receta `llama-quantize` completa y la tabla de perplexity emparejada por chunk permiten reproducir el experimento y comparar IQ4_XS/IQ3_S/Q6_K/Q4_K frente a otras mezclas (Q4_K_M, UD-IQ4_XS, Q3_K_M) sobre el mismo binario.
- Procesamiento de documentos sensibles en local: al ejecutarse con llama.cpp en hardware propio, es apto para resumir o extraer informacion de textos que no pueden salir de la organizacion, siempre que se valide la calidad en el dominio concreto.
- Prototipado de aplicaciones conversacionales antes de escalar a GPU: permite desarrollar la capa de aplicacion (prompts, formato de mensajes, gestion de contexto de 8.192 tokens) en un portatil antes de mover la carga a infraestructura con CUDA.
- Reproduccion de la metodologia de optimizacion por tensor: util como referencia para quien quiera aplicar el mismo criterio (evitar tipos sin kernel rapido) a otros modelos en Metal.

## Benchmarks y rendimiento

Calidad, perplexity en wikitext-2 (contexto 2048, 32 chunks, medicion emparejada por chunk sobre el mismo build):

| Cuantizacion | Tamano | Perplexity |
|---|---|---|
| Q4_K_M (ggml-org) | 17,7 GiB | 6,207 |
| UD-IQ4_XS (unsloth) | 13,3 GiB | 6,247 |
| OptiMix (este repo) | 12,8 GiB | 6,302 |
| Q3_K_M (recuantizado desde Q4_K_M) | 12,4 GiB | 6,337 |

Evaluacion de respuesta multiple (llama-perplexity):

| Tarea | Muestras | Resultado |
|---|---|---|
| HellaSwag | 100 | 79,0 % |
| ARC-Challenge | primeras 142 | 49,3 % |
| MMLU (validacion) | 150 | 42,7 % |

Velocidad en MacBook M4 base (GPU de 10 nucleos, 32 GB, conectado a corriente):

| Modo | tok/s |
|---|---|
| Generacion simple | 6,7 (lectura a ~87 GB/s, limite de memoria medido de la maquina) |
| Con decodificacion especulativa MTP, prosa | 8,2-8,8 |
| Con decodificacion especulativa MTP, codigo | 10,0 |
| 12 slots en paralelo, agregado | 22 |
| Generacion simple con llama.cpp stock | ~5,5 |

No se han publicado resultados de benchmarks del modelo base ni comparaciones con modelos de la misma categoria en la informacion disponible.

## Requisitos de hardware

- Espacio en disco: 12,8 GiB para el modelo principal y 1,3 GiB para la cabeza MTP, unos 14,1 GiB en total.
- Memoria para inferencia: al menos los 12,8 GiB de pesos mas la cache KV correspondiente al contexto configurado. Con `-c 8192` y un solo slot, 32 GB de memoria unificada dejan margen suficiente segun las mediciones del autor; no se publica una estimacion formal de VRAM.
- GPU recomendadas: el autor solo aporta mediciones en Apple Silicon (M4 base, 10 nucleos de GPU). Para CUDA no hay datos; por tamano, el modelo encaja teoricamente en tarjetas consumer con 16 GB o mas (RTX 4080, RTX 4090 de 24 GB), pero su rendimiento en esas plataformas no esta documentado.
- Cabe en GPU consumer por capacidad, aunque la unica validacion empirica es en memoria unificada de Mac.
- Opciones de despliegue: `llama-server` y `llama-cli` de llama.cpp (funciona tanto en la version stock como en el fork del autor, `Vadim170/llama.cpp-m4-qwen35`); `llama-quantize` para reproducir la receta. No se documenta soporte en vLLM, TGI ni Ollama.
- Configuracion recomendada con borrador: `llama-server -m Qwen3.8-27B-OptiMix.gguf -md mtp-Qwen3.8-27B-head_q2_K.gguf --spec-type draft-mtp -c 8192 -np 1 --spec-draft-n-max 4 --spec-draft-p-min 0.8`. El flag `-np 1` es obligatorio con modelo borrador porque, de lo contrario, Metal puede quedarse sin memoria a los pocos miles de tokens.
- Latencia y throughput: 6,7 tok/s en generacion simple, 8,2-8,8 tok/s en prosa y 10,0 tok/s en codigo con decodificacion especulativa, 22 tok/s agregados con 12 slots, todo medido en M4 base con 32 GB.

## Comparativa con modelos similares

No hay informacion sobre modelos de la misma categoria con los que comparar directamente. La comparacion disponible es entre variantes de cuantizacion del mismo modelo base:

| Variante | Tamano | Perplexity (wikitext-2) | Tipos usados | Licencia |
|---|---|---|---|---|
| Q4_K_M (ggml-org) | 17,7 GiB | 6,207 | Q4_K / Q6_K | apache-2.0 (heredada del base) |
| UD-IQ4_XS (unsloth) | 13,3 GiB | 6,247 | IQ4_XS | apache-2.0 (heredada del base) |
| OptiMix (este repo) | 12,8 GiB | 6,302 | IQ4_XS, IQ3_S, Q6_K, Q4_K | apache-2.0 |
| Q3_K_M (recuantizado) | 12,4 GiB | 6,337 | q3_K | apache-2.0 (heredada del base) |

Frente a Q4_K_M, OptiMix ocupa 4,9 GiB menos a costa de 0,095 puntos de perplexity; frente a UD-IQ4_XS, 0,5 GiB menos con 0,055 puntos mas de perplexity. La comparacion con otros modelos (por ejemplo, alternativas de ~27B o de ~3B, segun cual sea el tamano real) no esta disponible.

## Limitaciones y advertencias

- Inconsistencia de metadatos: el nombre indica 27B, los metadatos de safetensors indican 2.967.501.312 parametros (~3B) y el repo declara 1,4 GB de tamano frente a los 12,8 GiB del fichero principal. Hay que verificar el contenido real del repositorio antes de descargarlo o de planificar hardware.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; es una cuantizacion de autor individual, no una publicacion oficial de Qwen.
- Perdida de calidad respecto al bf16: no se publica la perplexity del modelo base sin cuantizar, solo la comparacion entre cuantizaciones. La degradacion en tareas de razonamiento o codigo no esta medida.
- Resultados de respuesta multiple bajos y con muestras pequenas: MMLU 42,7 % sobre 150 ejemplos y ARC-Challenge 49,3 % sobre 142, insuficientes para conclusiones robustas y con un resultado de MMLU que sugiere limitaciones en conocimiento general.
- Sin datos de contexto nativo: se desconoce la longitud de contexto entrenada; el `-c 8192` es solo configuracion de servidor. El comportamiento mas alla de esa ventana no esta evaluado.
- Idiomas no declarados: no hay lista de idiomas soportados ni evaluacion multilingue.
- Dependencia de un fork para el rendimiento anunciado: las cifras con decodificacion especulativa se obtuvieron con el fork del autor; llama.cpp stock da ~5,5 tok/s con el mismo comando. La ventaja de la decodificacion especulativa depende de kernels rapidos para lotes pequenos y no se traslada automaticamente a otras plataformas.
- Restriccion operativa con borrador: con modelo MTP hay que fijar `-np 1`, lo que limita la concurrencia cuando se usa decodificacion especulativa (los 12 slots se midieron en generacion simple).
- Cabeza MTP en Q2_K: es una cuantizacion muy agresiva del borrador; segun el autor no afecta a la salida, pero la tasa de aceptacion del borrador puede degradarse y no se publica esa metrica.
- Licencia: apache-2.0 segun las etiquetas del repositorio; conviene confirmar la licencia efectiva del modelo base antes de un uso comercial.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vadim1700/Qwen3.8-27B-OptiMix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de llama.cpp con los kernels y la metodologia de medicion: https://github.com/Vadim170/llama.cpp-m4-qwen35 (ver `FORK.md`)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
