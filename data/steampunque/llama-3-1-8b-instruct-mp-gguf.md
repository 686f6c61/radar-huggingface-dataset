# steampunque/Llama-3.1-8B-Instruct-MP-GGUF

## Resumen

`steampunque/Llama-3.1-8B-Instruct-MP-GGUF` es una cuantizacion GGUF de precision mixta (mixed precision, MP) del modelo `meta-llama/Llama-3.1-8B-Instruct` de Meta. El autor, steampunque, no entrena un modelo nuevo: aplica una receta de cuantizacion por capas en la que cada bloque del transformer recibe un nivel de cuantizacion distinto (Q4_K, Q5_K o Q6_K), con embeddings y capa de salida en Q6_K. El objetivo es conservar la calidad del original a 6 bits reduciendo el tamano del fichero respecto a un Q6_K uniforme.

El modelo base es un transformer denso de 8.030.261.312 parametros con una ventana de contexto declarada de hasta 128k tokens. La variante principal, `Q6_E_H`, ocupa aproximadamente 6,1e9 bytes y reporta una perplejidad de 7,2, identica a la del Q6_K estandar (6,6e9 bytes) pero con un 8 % menos de peso. Existe tambien una variante `Q4_E_H` de unos 5,3e9 bytes con perplejidad 7,4.

Su relevancia practica es el despliegue en GPU de consumo: el autor lo situa en el rango de 6-8 GB de VRAM y documenta pruebas de decodificacion especulativa con Llama 3.2 1B Instruct que elevan el throughput de 76 a 152-172 tokens por segundo en una RTX 4070. Es, por tanto, una pieza de infraestructura para servir Llama 3.1 8B en hardware modesto, no un modelo con capacidades nuevas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso decoder-only (Llama 3.1), cuantizado en GGUF con precision mixta por capas |
| Parametros totales | 8.030.261.312 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128k tokens (maximo del modelo base; el autor valida needle-in-a-haystack a 72k y un prompt de 85k) |
| Tipos de cuantizacion | Q6_E_H (mayoria Q5_K/Q6_K, embeddings y salida Q6_K), Q4_E_H (mayoria Q4_K, capas finales Q5_K/Q6_K) |
| Idiomas soportados | no disponible en la informacion proporcionada (heredados del modelo base Llama 3.1) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | GGUF (ficheros `.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con atencion por grupos (GQA), RoPE y normalizacion RMSNorm, entrenado por Meta y posteriormente afinado con instrucciones y preferencias humanas. Esta ficha no modifica ni reentrena esos pesos; el trabajo del autor es exclusivamente de compresion.

La innovacion esta en la receta de cuantizacion. En lugar de aplicar un unico tipo a todas las matrices, se define un mapa por capa (`LAYER_TYPES`) que asigna Q5_K o Q6_K a cada bloque segun su sensibilidad, con variantes de los subtensores de atencion (q, k, v, o) y de la FFN (gate, up, down). Las capas 28-31, mas proximas a la salida, reciben Q6_K, mientras que las intermedias bajan a Q5_K. Los embeddings de tokens y la capa de salida se fijan en Q6_K mediante `--token-embedding-type Q6_K --output-tensor-type Q6_K`. La variante Q4_E_H aplica el mismo principio desplazando el grueso a Q4_K y reservando Q5_K/Q6_K para la cola del modelo. Segun el autor, ambas recetas se reoptimizaron el 13/11/2026 sobre un conjunto reducido de prompts de prueba.

## Capacidades

- Generacion de texto conversacional multiturno, heredada de Llama 3.1 8B Instruct.
- Procesamiento y extraccion de caracteristicas de texto: resumen, clasificacion, extraccion de entidades.
- Codigo: el autor incluye pruebas sobre HumanEval con decodificacion especulativa.
- Contexto largo: se valida needle-in-a-haystack a 72k tokens y un prompt de 85k tokens con muestreo greedy.
- Decodificacion especulativa: compatible con un especulador Llama 3.2 1B Instruct, lo que multiplica el throughput.
- Capacidad de audio opcional: puede combinarse con `steampunque/ultravox-v0_5-llama-3_1-8b-MP-GGUF` para aceptar entradas `.mp3` y `.wav`.
- Tool calling y function calling: no documentado en la informacion proporcionada.
- Razonamiento: el autor advierte explicitamente que el modelo "no tiene entrenamiento RL y no es util para aplicaciones de razonamiento".

## Casos de uso

- Resumen de documentos largos: con 128k tokens de contexto y validacion a 72k-85k, puede condensar informes, actas o expedientes completos en una sola pasada sin trocear el texto.
- Extraccion de caracteristicas y clasificacion: el autor lo orienta a "text processing such as summarization or feature extraction"; encaja en pipelines de etiquetado, enrutado de tickets o generacion de embeddings semanticos a partir de las representaciones internas.
- Servicio de chat en GPU de consumo: con 6-8 GB de VRAM puede alojarse en una RTX 4070 o similar y atender conversaciones multiturno con latencia aceptable (76 TPS en generacion greedy sin especulacion).
- Aceleracion mediante decodificacion especulativa: emparejado con Llama 3.2 1B como modelo borrador, el throughput sube a 152-172 TPS en la misma GPU, lo que lo hace viable para interfaces interactivas con varios usuarios.
- Asistencia de codigo en local: las pruebas sobre HumanEval y el salto de 76 a 172 TPS con bloque especulativo de 6 tokens lo situan como opcion para autocompletado o generacion de funciones en entornos sin GPU de datacenter.
- Transcripcion y analisis de audio combinado: integrado con la torre Ultravox del mismo autor, permite transcribir y resumir reuniones o notas de voz en un unico pipeline.
- Prototipado y evaluacion de cuantizaciones: util como referencia para comparar perplejidad y velocidad entre Q4_K_M, Q4_E_H, Q6_K y Q6_E_H antes de fijar una configuracion de produccion.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) con puntuaciones. Solo reporta perplejidad y throughput.

| Metrica | Q4_K_M | Q4_E_H | Q6_K | Q6_E_H |
|---|---|---|---|---|
| Tamano (bytes) | 4,9e9 | 5,3e9 | 6,6e9 | 6,1e9 |
| Perplejidad | 7,3 | 7,4 | 7,2 | 7,2 |

Throughput en RTX 4070 con contexto y pesos en VRAM (especulador greedy, Llama 3.2 1B):

| Prompt | Cuantizacion | QKV | Bloque especulativo | Contexto | TPS |
|---|---|---|---|---|---|
| goldcoin | Q6_E_H | F16 | 0 | 48k | 76 |
| goldcoin | Q6_E_H | F16 | 4 | 32k | 152 |
| goldcoin | Q4_E_H | F16 | 0 | 52k | 87 |
| goldcoin | Q4_E_H | q8_0 | 4 | 36k | 160 |
| goldcoin | Q4_E_H | q8_0 | 0 | 96k | 86 |
| humaneval | Q6_E_H | F16 | 0 | - | 76 |
| humaneval | Q6_E_H | F16 | 6 | - | 172 |

Pruebas de contexto largo: needle-in-a-haystack de 72k tokens superado con Q4_E_H y QKV en q8_0; prompt de 85k tokens (Qwen3 RuneScape) resuelto correctamente con muestreo greedy.

## Requisitos de hardware

- VRAM estimada: 6-8 GB para el modelo en Q6_E_H o Q4_E_H, segun el propio autor; el contexto adicional consume VRAM aparte (la cache KV en q8_0 permite llegar a 96k tokens en una 4070).
- GPU recomendadas: RTX 4070 o superior para uso interactivo; A100/H100 no son necesarias para este tamano, aunque permitirian mayor concurrencia y contextos mas largos.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- Opciones de despliegue: llama.cpp y sus derivados (Ollama, LM Studio, llama-cpp-python); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones.
- Latencia y throughput: 76-87 TPS en generacion greedy sin especulacion en RTX 4070; 152-172 TPS con decodificacion especulativa y bloque de 4-6 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad / calidad | Licencia | Formato |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-MP-GGUF (Q6_E_H) | 8,03B | 128k | PPL 7,2 | llama3.1 | GGUF |
| Llama-3.1-8B-Instruct Q6_K estandar | 8,03B | 128k | PPL 7,2 | llama3.1 | GGUF |
| Llama-3.1-8B-Instruct Q4_K_M | 8,03B | 128k | PPL 7,3 | llama3.1 | GGUF |
| Mistral 7B Instruct (referencia de tamano) | 7,24B | 32k | no disponible en esta ficha | Apache 2.0 | safetensors/GGUF |

Frente al Q6_K uniforme, la variante Q6_E_H ofrece la misma perplejidad con un 8 % menos de peso; frente al Q4_K_M, gana 0,1 puntos de perplejidad a costa de un 8 % mas de tamano. La ventaja diferencial no es de calidad sino de encaje en VRAM y de velocidad con especulacion.

## Limitaciones y advertencias

- El autor declara explicitamente que el modelo no tiene entrenamiento RL y no es adecuado para tareas de razonamiento; no debe usarse como sustituto de modelos con thinking mode.
- Riesgo de alucinacion inherente a Llama 3.1 8B Instruct; la cuantizacion puede amplificarlo en contextos largos o prompts ambiguos.
- La perplejidad se midio sobre un conjunto no detallado; las recetas se optimizaron sobre "un pequeno conjunto de prompts curados", lo que puede introducir sobreajuste a esas pruebas.
- La licencia Llama 3.1 Community License impone restricciones: uso comercial permitido con condiciones, obligacion de atribucion, limite de 700 millones de usuarios mensuales para ciertos usos y clausulas de uso aceptable.
- No se documentan idiomas soportados en la ficha; el comportamiento multilingue depende del modelo base y no ha sido validado por el autor.
- El repo ocupa 28,9 GB porque incluye varias cuantizaciones; conviene descargar solo el fichero `.gguf` necesario.
- No hay garantias de soporte ni mantenimiento: 0 likes y 239 descargas en el momento de la consulta indican un artefacto de nicho.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/steampunque/Llama-3.1-8B-Instruct-MP-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Torre de audio Ultravox del mismo autor: https://huggingface.co/steampunque/ultravox-v0_5-llama-3_1-8b-MP-GGUF
- Space de benchmarks: https://huggingface.co/spaces/steampunque/benchlm
- Prompt de prueba goldcoin: https://huggingface.co/datasets/steampunque/benchlm/blob/main/goldcoin.txt
- Prompt de prueba HumanEval: https://huggingface.co/datasets/steampunque/benchlm/blob/main/humaneval.txt
- Prueba needle-in-a-haystack: https://huggingface.co/datasets/steampunque/benchlm/blob/main/needle.txt
- Prompt largo Qwen3 RuneScape (85k): https://huggingface.co/datasets/steampunque/benchlm/blob/main/Qwen3_Runescape_Massive_Prompt_85k.txt
