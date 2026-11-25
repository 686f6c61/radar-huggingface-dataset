# symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF

## Resumen

Qwen3.8-27B-heretic-ara-v1-GGUF es la distribucion en formato GGUF del modelo symmetrisch/Qwen3.8-27B-heretic-ara-v1, una version "abliterated" (decensurada) de Qwen/Qwen3.8-27B. El autor, symmetrisch, ha aplicado la herramienta Heretic v2.1.0 con la tecnica Arbitrary-Rank Ablation (ARA) para reducir los rechazos del modelo original, y posteriormente ha generado cuantizaciones en cuatro niveles (Q4_K_M, Q5_K_M, Q6_K y Q8_0) listas para usarse con llama.cpp. El modelo cuenta con 26.895.998.464 parametros totales (aproximadamente 26,9 mil millones), lo que lo situa en la gama de 27B.

El interes de esta publicacion es doble: por un lado, ofrece una variante sin censura del modelo base Qwen3.8-27B, con una tasa de rechazos declarada de 5/100 frente a 98/100 del original segun la metrica de Heretic; por otro, proporciona los pesos ya cuantizados en GGUF, lo que facilita el despliegue en hardware de consumo sin necesidad de convertir ni optimizar el modelo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La model card advierte de un detalle tecnico importante: los ficheros usan el layout de tensor combinado `ssm_beta_alpha`, lo que implica que requieren una version reciente de llama.cpp (convertidos con la build b12651-1-g212c547fe). Runtimes mas antiguos, como los de LM Studio 2.66.0 y 2.73.0, fallan al cargar el modelo con el error `tensor 'blk.0.ssm_beta.weight' not found`. Esta ficha se basa exclusivamente en la informacion publicada en Hugging Face y en la model card; no se dispone de datos adicionales sobre arquitectura interna, entrenamiento o benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; layout de tensor `ssm_beta_alpha` sugiere componentes de state space, sin confirmar) |
| Parametros totales | 26.895.998.464 (aprox. 26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |
| Tamano del repo | 86,8 GB |
| Modelo base | symmetrisch/Qwen3.8-27B-heretic-ara-v1 (a su vez derivado de Qwen/Qwen3.8-27B) |
| Metodo de decensurado | Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) |
| Vision | no incluida (solo texto; sin fichero mmproj) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base Qwen3.8-27B en la documentacion proporcionada. La presencia del tensor `ssm_beta_alpha` en el layout GGUF sugiere la inclusion de componentes de state space model (SSM), aunque no se confirma la arquitectura exacta ni la composicion hibrida. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

La innovacion tecnica destacable de esta publicacion no esta en el entrenamiento, sino en el proceso de decensurado. Se aplico Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA) sobre el modelo original en precision completa (BF16), sin cuantizacion durante la optimizacion. El proceso realizo 400 trials (100 de arranque) sobre 2x NVIDIA GeForce RTX 5060 Ti (16311 MiB), seleccionando el trial 184. Los parametros ARA fueron: `start_layer_index` 27, `end_layer_index` 55, `preserve_good_behavior_weight` 0.2384, `steer_bad_behavior_weight` 0.0001, `overcorrect_relative_weight` 1.0071 y `neighbor_count` 1. El resultado medido por Heretic con sus prompts y scorers por defecto fue de 5/100 rechazos (frente a 98/100 del original) con una divergencia KL de 0.0484 respecto al modelo base. Conviene senalar que Heretic cuenta rechazos mediante coincidencia de palabras clave, por lo que la cifra cubre solo rechazos explicitos.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la orientacion del modelo base apuntan a uso en dialogos multi-turno, aunque no se detallan capacidades especificas.
- Razonamiento y codigo: no disponible en la informacion proporcionada; el modelo base Qwen3.8-27B probablemente las soporta, pero no se confirma para esta variante.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no estan declarados en la model card).
- Modo "thinking": no disponible.
- Vision: no soportada; la model card indica explicitamente "Text only; no mmproj (vision) file is included".
- Audio: no disponible.
- Comportamiento sin censura: la caracteristica principal de esta variante es la reduccion de rechazos (5/100 segun Heretic), orientada a usos donde el modelo original declinaria responder.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto de la ablacion ARA comparando respuestas con el original Qwen3.8-27B, con una divergencia KL documentada de 0.0484 y una reduccion de rechazos de 98/100 a 5/100.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles donde el modelo base rechazaria la peticion; el proceso de decensurado reduce los rechazos explicitos.
- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M (16 GiB) y Q5_K_M (19 GiB) permiten ejecutar un modelo de ~27B en GPUs con 24 GB de VRAM o en configuraciones con offload a CPU, usando llama.cpp u Ollama.
- Experimentacion con llama.cpp: los ficheros estan pensados para runtimes recientes de llama.cpp; sirven para probar integraciones, pipelines de inferencia local y comparativas de cuantizacion.
- Analisis de sesgos y comportamiento: util para auditar como cambia el comportamiento de un modelo al eliminar la capa de rechazo, midiendo falsos positivos y negativos en clasificacion de contenido.
- Prototipado de asistentes conversacionales en entornos controlados: el tag `conversational` y el formato GGUF facilitan montar un chatbot local para pruebas internas, siempre con las advertencias de la seccion de limitaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica de rendimiento documentada es la del proceso de decensurado de Heretic:

| Metrica | Este modelo | Original (Qwen/Qwen3.8-27B) |
|---|---|---|
| Rechazos (Heretic, keyword matching) | 5/100 | 98/100 |
| Divergencia KL | 0.0484 | 0 (por definicion) |

No hay datos de MMLU, HumanEval, GSM8K ni de otras evaluaciones estandar.

## Requisitos de hardware

- VRAM estimada para inferencia (segun tamano de fichero GGUF):
  - Q4_K_M: 16 GiB
  - Q5_K_M: 19 GiB
  - Q6_K: 21 GiB
  - Q8_0: 27 GiB
- GPU recomendadas: para Q4_K_M y Q5_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente para cargar los pesos; para Q6_K (21 GiB) tambien cabe en 24 GB con margen ajustado; Q8_0 (27 GiB) requiere GPUs de 32 GB o mas (A100 40 GB, H100, RTX 5090 si dispone de suficiente VRAM) o bien offload parcial a CPU.
- Cabe en GPU de consumo: si, en RTX 4090/3090 para Q4_K_M y Q5_K_M; en GPUs de 16 GB no cabe sin offload. El autor realizo el proceso de ablacion en 2x RTX 5060 Ti (16 GB cada una), lo que indica que el modelo completo en BF16 no cabe en una sola GPU de consumo.
- Opciones de despliegue: llama.cpp (requiere build reciente, commit 212c547fe o posterior), Ollama (si actualiza su runtime de llama.cpp), y cualquier frontend compatible con GGUF. No se mencionan vLLM ni TGI para esta variante GGUF.
- Latencia y throughput: no disponibles.
- Advertencia de compatibilidad: los runtimes de LM Studio 2.66.0 y 2.73.0 fallan con `tensor 'blk.0.ssm_beta.weight' not found`; se necesita una version reciente de llama.cpp.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF | ~26,9B | no disponible | Apache 2.0 | GGUF | Variante decensurada con ARA; 5/100 rechazos |
| Qwen/Qwen3.8-27B (original) | ~26,9B | no disponible | no disponible en esta ficha | safetensors | Modelo base; 98/100 rechazos segun Heretic |
| Otras variantes abliterated de la familia Qwen | no disponible | no disponible | variable | GGUF/safetensors | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas de la misma categoria (mismo tamano o misma tarea) en terminos de rendimiento o benchmarks.

## Limitaciones y advertencias

- El proceso de decensurado elimina la capa de rechazo del modelo; esto puede producir respuestas a peticiones que el modelo original declinaria, con implicaciones legales y eticas segun el uso.
- La metrica de rechazos de Heretic se basa en coincidencia de palabras clave, por lo que no captura rechazos implicitos ni evasiones; la cifra de 5/100 debe interpretarse con cautela.
- La divergencia KL de 0.0484 indica un cambio medible en la distribucion de salida respecto al original; puede afectar a la calidad en tareas alejadas del dominio de los prompts de evaluacion de Heretic.
- No hay datos publicados sobre sesgos, alucinacion, rendimiento multilingue ni evaluaciones de seguridad independientes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo decensurado en produccion; la responsabilidad del contenido generado recae en el usuario.
- Compatibilidad limitada: requiere llama.cpp reciente (commit 212c547fe o posterior); runtimes antiguos fallan al cargar el modelo.
- Solo texto: no incluye soporte de vision ni fichero mmproj.
- No se documentan la longitud de contexto ni los idiomas soportados, lo que dificulta planificar su uso en aplicaciones con requisitos especificos.
- El modelo base Qwen3.8-27B no esta documentado en la informacion proporcionada; se desconoce su origen exacto, su proceso de entrenamiento y sus benchmarks.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/symmetrisch/Qwen3.8-27B-heretic-ara-v1-GGUF
- Modelo base (decensurado, safetensors): https://huggingface.co/symmetrisch/Qwen3.8-27B-heretic-ara-v1
- Modelo original: https://huggingface.co/Qwen/Qwen3.8-27B
- Heretic (herramienta de decensurado): https://github.com/p-e-w/heretic
