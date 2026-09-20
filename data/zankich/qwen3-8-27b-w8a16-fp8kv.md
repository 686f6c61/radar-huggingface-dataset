# zankich/Qwen3.8-27B-W8A16-FP8KV

## Resumen

Qwen3.8-27B-W8A16-FP8KV es una cuantizacion del modelo multimodal Qwen/Qwen3.8-27B publicada por el usuario zankich, pensada especificamente para servir el modelo en GPUs de arquitectura Ampere y posteriores mediante vLLM. El checkpoint conserva los pesos en INT8 con cuantizacion weight-only (W8A16), mantiene las activaciones en bfloat16 y anade una cache KV calibrada en FP8 E4M3. El objetivo declarado es reducir el espacio en disco de 52 GB en bf16 a 31,6 GB sin renunciar a la torre de vision ni a la cabeza MTP (multi-token prediction) del modelo original.

El modelo base es una arquitectura hibrida de 27,8 mil millones de parametros (27.781.427.984 segun los tensores de safetensors) que combina 48 capas Gated DeltaNet con 16 capas de atencion completa, ademas de una torre de vision que lo convierte en un modelo image-text-to-text. La cuantizacion preserva intactos tanto la torre de vision (333 tensores) como la cabeza MTP (15 tensores copiados byte a byte), lo que permite seguir usando decodificacion especulativa nativa en vLLM.

Su relevancia practica es acotada pero concreta: es una de las pocas recetas publicas que documentan la combinacion W8A16 + KV cache FP8 sobre un modelo hibrido GDN + MTP, con el recipe exacto de llm-compressor, la lista de ignorados y el detalle de la calibracion. El autor mantiene ademas un fork de vLLM que corrige problemas de correctitud en el offload de KV cache bajo esta topologia concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: 48 capas Gated DeltaNet (atencion lineal con puertas) + 16 capas de atencion completa; torre de vision; cabeza MTP integrada |
| Parametros totales | 27.781.427.984 (27,8 B) |
| Parametros activos | no disponible (la informacion no indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (la model card solo menciona 2048 tokens como longitud maxima usada en la calibracion, no como contexto de inferencia) |
| Tipos de cuantizacion | Pesos INT8 weight-only GPTQ (grupo 128, simetrico); activaciones bfloat16; cache KV en FP8 E4M3 con escalas estaticas simetricas por tensor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato compressed-tensors (pack-quantized): 16 shards mas model_mtp.safetensors |
| Modelo base | Qwen/Qwen3.8-27B |
| Tamano del checkpoint | 31,6 GB declarados en la model card (frente a 52 GB en bf16); el repositorio de HuggingFace ocupa 57,3 GB |
| Pipeline | image-text-to-text |
| Libreria de referencia | vLLM |
| Herramienta de cuantizacion | llm-compressor 0.13.0 |
| Precision de la cabeza MTP | bfloat16, byte-identica al modelo base |
| Fecha de creacion | 2026-09-09 |
| Ultima actualizacion | 2026-09-20 |
| Descargas / likes en HuggingFace | 83 / 1 |

## Arquitectura y entrenamiento

El checkpoint no introduce entrenamiento propio: es una cuantizacion post-entrenamiento del base Qwen/Qwen3.8-27B. La topologia del base es hibrida, con 64 capas en total repartidas entre 48 capas Gated DeltaNet y 16 capas de atencion completa. Las capas GDN no generan cache KV, de modo que solo las 16 capas de atencion completa contienen los tensores k_scale y v_scale de la calibracion FP8. Sobre esa base se anade una torre de vision completa (333 tensores) y una cabeza MTP para decodificacion especulativa.

La receta de cuantizacion aplica GPTQModifier con esquema W8A16 sobre todos los Linear, incluidas las proyecciones de atencion y FFN de las 16 capas de atencion completa y las proyecciones in_proj_qkv, in_proj_z y out_proj de las 48 capas Gated DeltaNet. Se mantienen en bfloat16 el lm_head, la torre de vision completa, la cabeza MTP y dos proyecciones de puerta recurrente (linear_attn.in_proj_a y linear_attn.in_proj_b), consideradas sensibles a la precision. La calibracion de la cache KV se realiza en las mismas pasadas forward que los pesos, mediante kv_cache_scheme, sin paso separado.

Los datos de calibracion son 768 muestras (512 muestreadas por ejecucion, secuencia maxima de 2048) estratificadas para una carga de trabajo de coding agentico: aproximadamente un 45 % de turnos de agente de codigo interactivo y pares de sesiones de recuperacion, un 30 % de codigo a nivel de funcion en Python, TypeScript, Go y shell, y un 21 % de prosa estructurada de base de conocimiento en Markdown. El conjunto de calibracion procede de datos de sesion privados y no se publica. El autor no publica ninguna comparativa de exactitud frente al base en bf16, de modo que el delta real de calidad de esta cuantizacion es desconocido.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (image-text-to-text) y la etiqueta conversational.
- Procesamiento de imagenes junto con texto: la torre de vision se conserva integra en bfloat16, por lo que el checkpoint sigue siendo un modelo vision-lenguaje y no ha sido degradado a solo texto.
- Decodificacion especulativa con cabeza MTP: la cabeza multi-token prediction se conserva byte-identica al base, lo que habilita el uso de speculative decoding en vLLM.
- Razonamiento con modo thinking: la model card del fork de vLLM menciona la aplicacion de un thinking budget mediante thinking.budget_tokens, lo que implica soporte de modo thinking con presupuesto configurable. El detalle funcional pertenece al modelo base.
- Atencion de contexto largo efectiva: al combinar 48 capas Gated DeltaNet (sin cache KV) con 16 capas de atencion completa, la cache KV crece mucho mas despacio que en un transformer denso equivalente. La longitud de contexto nominal no esta declarada en la informacion disponible.
- Tool calling y function calling: no confirmado explicitamente en la model card de esta cuantizacion; debe consultarse la model card del base.
- Capacidades agenticas y razonamiento multi-paso: no declaradas explicitamente para este checkpoint; los datos de calibracion se estratificaron para cargas de trabajo de agente de codigo, pero eso es un criterio de calibracion, no una garantia de capacidad.
- Capacidades multilingues: no disponible.

## Casos de uso

- Servicio self-hosted en GPUs Ampere: el checkpoint esta disenado explicitamente para servir en GPUs Ampere o posteriores con vLLM, reduciendo de 52 GB a 31,6 GB el peso en disco y habilitando despliegues en nodos con 48 GB de VRAM que no podrian alojar el base en bf16.
- Asistente de codigo dentro del IDE o de un agente interactivo: la calibracion dedica cerca del 45 % de las muestras a turnos de agente de codigo y pares de recuperacion, de modo que el ajuste de escalas de cuantizacion esta sesgado hacia este tipo de distribucion.
- Generacion y refactorizacion de codigo a nivel de funcion en Python, TypeScript, Go y shell: el 30 % del conjunto de calibracion es codigo de esos cuatro lenguajes, lo que reduce el riesgo de degradacion por cuantizacion en ese dominio frente a una calibracion generica.
- Recuperacion aumentada sobre bases de conocimiento en Markdown: el 21 % de las muestras de calibracion es prosa estructurada de knowledge base, por lo que el modelo es adecuado para pipelines RAG que consumen documentacion tecnica en Markdown.
- Procesamiento documental con imagenes: al conservar la torre de vision en bf16, el checkpoint puede usarse en tareas image-text-to-text como extraccion de informacion de capturas, diagramas o documentos escaneados, sin la perdida de precision que supondria cuantizar el encoder visual.
- Inferencia de alto throughput con decodificacion especulativa: la cabeza MTP preservada permite activar speculative decoding en vLLM, lo que resulta adecuado para servicios con muchos usuarios concurrentes donde el coste por token generado es el cuello de botella.
- Contextos largos con memoria limitada: la proporcion de 48 capas GDN sin cache KV frente a 16 capas de atencion completa reduce el crecimiento de la cache, util para cargas con historiales largos o documentos extensos en una sola GPU.
- Evaluacion de recetas de cuantizacion: el recipe completo de llm-compressor y la lista de ignorados son reproducibles y sirven como referencia para cuantizar otros modelos hibridos GDN + MTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni equivalentes, y declara explicitamente que "no accuracy benchmark delta against the bf16 base is published for this checkpoint". Tampoco se publican datos de latencia, throughput ni tokens por segundo medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos cuantizados ocupan 31,6 GB en disco, por lo que se necesitan al menos unos 32 GB de VRAM solo para pesos, mas la cache KV en FP8, el buffer de activaciones en bf16 y los tensores en bf16 no cuantizados (lm_head, torre de vision, cabeza MTP y las dos puertas recurrentes). En la practica, un presupuesto de 40-48 GB de VRAM es el minimo razonable. Estimacion derivada del tamano declarado, no de mediciones publicadas.
- GPUs recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB, A6000 48 GB y, en general, cualquier GPU Ampere o posterior con 48 GB o mas. En GPUs de 40 GB (A100 40 GB) el margen es muy ajustado y depende de la longitud de contexto.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en configuraciones de 16 GB. Una RTX 5090 de 32 GB queda en el limite y probablemente requiera contextos cortos y ajuste agresivo del bloque de cache KV. Requiere multiples GPU en configuracion tensor-parallel para hardware de consumo.
- Opciones de despliegue: vLLM es la via soportada de forma nativa (el propio autor indica que upstream vLLM sirve este checkpoint). Se debe arrancar con --kv-cache-dtype fp8 para que las escalas calibradas se carguen. El autor mantiene un fork, zankich/vllm, con imagen preconstruida zankich/vllm-openai:0.29.0z en Docker Hub, que corrige problemas de correctitud en el offload de KV con esta topologia GDN + MTP, expone metricas de spec-decode por peticion mediante el conversor /v1/messages y aplica un wrap-up de presupuesto de thinking bajo MTP. No se menciona soporte para llama.cpp, Ollama ni TGI; el formato pack-quantized de compressed-tensors es especifico de vLLM.
- Latencia y throughput: no disponible. El unico dato orientativo es la disponibilidad de decodificacion especulativa via MTP, que en general mejora el throughput de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato / servidor | Datos de rendimiento |
|---|---|---|---|---|---|---|
| zankich/Qwen3.8-27B-W8A16-FP8KV | 27,8 B | no disponible | W8A16 INT8 + KV FP8 | Apache 2.0 | safetensors compressed-tensors, vLLM | no publicado |
| Qwen/Qwen3.8-27B (base en bf16) | 27,8 B | no disponible | bf16 completo (52 GB) | Apache 2.0 | safetensors, transformers / vLLM | no consultado en la informacion disponible |
| Otras cuantizaciones de Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de otras alternativas de la misma categoria en la informacion proporcionada, por lo que la comparativa se limita al modelo base del que deriva este checkpoint. No se han verificado cifras de rendimiento de ninguno de los dos.

## Limitaciones y advertencias

- No existe ninguna medicion publicada del delta de exactitud frente al base en bf16. La calidad real tras la cuantizacion INT8 y la cache KV en FP8 es, por tanto, desconocida y debe validarse con un conjunto de evaluacion propio antes de llevar el checkpoint a produccion.
- El conjunto de calibracion es privado y no se publica, lo que impide reproducir la cuantizacion o auditar la distribucion de datos usada para las escalas. Ademas, la calibracion esta sesgada deliberadamente hacia cargas de trabajo de codigo agentico, por lo que dominios alejados de ese perfil (por ejemplo, texto juridico, medico o lenguas distintas del ingles) pueden degradarse mas de lo esperable.
- La model card solo documenta tres categorias de calibracion que suman aproximadamente un 96 % (45 % + 30 % + 21 %), sin aclarar el resto de la composicion.
- Discrepancia de tamano: la model card declara 31,6 GB, mientras que el repositorio de HuggingFace ocupa 57,3 GB. Conviene verificar el espacio real antes de planificar el despliegue.
- Dependencia fuerte de vLLM. El formato pack-quantized de compressed-tensors no es portable a llama.cpp, Ollama, TGI ni a otros runners sin una reconversion. Ademas, el autor recomienda su propio fork de vLLM para corregir problemas de correctitud en el offload de KV cache, lo que implica que la version upstream puede presentar fallos con esta topologia.
- El arranque debe realizarse con --kv-cache-dtype fp8. Si no se especifica, las escalas de la cache calibrada no se cargan y el comportamiento de la cache KV deja de corresponderse con la calibracion.
- La longitud de contexto nominal no esta declarada en la informacion disponible; el unico valor de 2048 que aparece es la longitud de secuencia usada durante la calibracion, y no debe interpretarse como limite operativo.
- No se declaran idiomas soportados, por lo que se desconoce si la cuantizacion degrada de forma desigual el rendimiento multilingue. Si el modelo base es multilingue, ese dato no se traslada a este checkpoint.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual para este checkpoint.
- Sesgos: no se ha publicado ninguna evaluacion de sesgo ni de seguridad para esta cuantizacion. La cuantizacion no elimina los sesgos del base y puede amplificar diferencias en colas de distribucion poco representadas en los datos de calibracion.
- Adopcion muy baja: 83 descargas y 1 like en el momento de redactar esta ficha, lo que reduce la probabilidad de que los fallos ya esten documentados por terceros.
- Licencia Apache 2.0, que permite uso comercial y modificacion siempre que se conserven los avisos de copyright y la atribucion correspondiente. Conviene verificar tambien las condiciones del modelo base Qwen/Qwen3.8-27B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zankich/Qwen3.8-27B-W8A16-FP8KV
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Fork de vLLM del autor: https://github.com/zankich/vllm
- Imagen Docker del fork: https://hub.docker.com/repository/docker/zankich/vllm-openai/tags/0.29.0z
- Herramienta de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo. Los unicos resultados obtenidos corresponden a paginas de soporte y controladores de impresoras Canon i-SENSYS MF3010, sin relacion alguna con el modelo descrito. No se han localizado papers, blogs tecnicos ni demos adicionales.
