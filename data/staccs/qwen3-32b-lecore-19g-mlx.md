# staccs/Qwen3-32B-lecore-19g-mlx

## Resumen

Qwen3-32B-lecore-19g-mlx es una cuantizacion de precision mixta en formato MLX del modelo denso Qwen/Qwen3-32B, publicada por el usuario staccs (etiquetado como leCore Unicron `requantize`). No se ha reentrenado nada: el unico trabajo realizado es la conversion y asignacion de bits por tensor. El objetivo es reducir un modelo de 32.762 millones de parametros a un peso de 18,62 GB que quepa y corra con fluidez en equipos Apple Silicon con memoria unificada de 32-36 GB o superior, algo imposible con la version bf16 original.

La particularidad tecnica es que los bits de cada capa lineal no se eligieron a ojo ni con una regla uniforme, sino midiendo el dano real: cada tensor se cuantizo por separado a 2, 3 y 4 bits y se calculo la divergencia KL respecto a fp16 sobre un conjunto de calibracion mixto (3066 tokens de WikiText-2 de entrenamiento, 1022 tokens de codigo Python y sondas estructuradas de prosa, codigo, SQL y markdown). A partir de ahi se aplico una bajada de bits voraz, minimizando el dano medido por byte ahorrado hasta encajar en el presupuesto de tamano.

El resultado practico es notable frente a una cuantizacion uniforme: con 4,547 bits por peso (bpw) logra una perplejidad de 11,4757 en WikiText-2, muy lejos del 39,0780 que obtiene la cuantizacion MLX estandar de 3 bits con grupo 64, y bastante cerca del 9,7287 del modelo bf16 de referencia. Es, por tanto, un artefacto orientado a inferencia local en Mac, no a despliegue en GPU NVIDIA, y su licencia Apache 2.0 heredada lo hace utilizable comercialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (modelo base Qwen3-32B); el repo no documenta modificaciones estructurales |
| Parametros totales | 32.762.123.264 (32,76 mil millones) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | El repo no especifica contexto propio; el ejemplo de uso emplea `--max-kv-size 8192`. El modelo base Qwen3-32B soporta 32.768 tokens nativos, ampliables a 131.072 con YaRN |
| Tipos de cuantizacion | Una unica configuracion MLX affine de precision mixta: capas lineales a 4 bits (histograma: 448 tensores a 4 bits, 0 a 2/3/8/16), embeddings a 4 bits, `lm_head` a 6 bits, tamano de grupo 64; coste medio 4,547 bpw. No se ofrecen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No documentado en el repo. El modelo base Qwen3-32B declara soporte para 119 idiomas |
| Licencia | Apache 2.0 (heredada del modelo base Qwen/Qwen3-32B) |
| Formato de pesos | safetensors para MLX (`library_name: mlx`), 18,62 GB de pesos, 18,6 GB de repositorio |

## Arquitectura y entrenamiento

El modelo es una copia cuantizada del Qwen3-32B denso. No hay reentrenamiento, ajuste fino, RLHF ni DPO en este repositorio: el autor lo indica explicitamente ("Only quantization was done here: no retraining"). Por tanto, la arquitectura es la del transformer decoder denso original, con atencion por consultas agrupadas (GQA), normalizacion y modos de razonamiento heredados del modelo base.

La innovacion esta en el pipeline de cuantizacion. Primero se midio el dano de cada tensor lineal por separado, cuantizandolo en aislamiento con MLX affine y grupo 64 a 2, 3 y 4 bits, y evaluando la divergencia KL entre las distribuciones de siguiente token en fp16 y en la version cuantizada sobre el mix de calibracion. Despues se reasignaron los bits de forma voraz: se parte de 4 bits en todas las capas y se aplica iterativamente la degradacion con menor dano medido por byte ahorrado hasta que el tamano de fichero predicho encaja en el presupuesto. La conversion final se ejecuto con `mlx_lm.convert` usando un `quant_predicate` por capa. Curiosamente, el histograma final deja las 448 capas lineales a 4 bits, de modo que la "precision mixta" real se concentra en embeddings (4 bits) y `lm_head` (6 bits); el ahorro frente a bf16 viene de la cuantizacion de 4 bits con grupo 64, no de una mezcla interna de 2/3/4 bits en las lineales.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del Qwen3-32B base (`pipeline_tag: text-generation`, etiqueta `conversational`).
- Razonamiento en modo pensamiento y modo sin pensamiento, segun el comportamiento del modelo base; el repositorio no documenta cambios en las plantillas de chat.
- Generacion de codigo: las mediciones del autor incluyen perplejidad sobre codigo Python (3,9427), lo que confirma que la cuantizacion preserva mejor este dominio que una cuantizacion uniforme de 3 bits (7,4644).
- Conocimiento general y respuesta a preguntas: 85,3 % en el subconjunto de MMLU 5-shot medido por el autor.
- Soporte multilingue heredado del modelo base (119 idiomas declarados por Qwen), aunque el autor no aporta evaluaciones por idioma.
- Tool calling y function calling: capacidad presente en Qwen3-32B, pero no verificada ni documentada en este repositorio.
- Razonamiento multi-paso y uso como agente: no verificado en este repositorio; los resultados de GSM8K obtenidos (27,0 % strict) apuntan a un deterioro severo en razonamiento aritmetico que conviene comprobar antes de usar el modelo en tareas de ese tipo.
- Inferencia local en Apple Silicon mediante MLX, ejecutando los tensores desquantizados a bf16 en GPU.

## Casos de uso

- Inferencia local en Mac para desarrollo: cargar el modelo con `mlx_lm.generate` en un Mac con 32-36 GB de memoria unificada para disponer de un modelo de 32B sin conexion a internet ni coste por token. El peso de 18,62 GB deja margen para la cache KV si se limita con `--max-kv-size`.
- Asistencia de programacion offline: dado que la perplejidad sobre codigo Python es de 3,9427 frente a 7,4644 de la cuantizacion estandar de 3 bits, el modelo es razonable para autocompletado, generacion de funciones y explicacion de codigo en entornos sin salida a la red.
- Procesamiento de documentacion tecnica en local: resumenes, extraccion de campos y generacion de SQL o markdown sobre corpus internos, aprovechando que el pipeline de cuantizacion se calibro especificamente con sondas de SQL y markdown.
- Prototipado rapido de aplicaciones LLM sin GPU dedicada: permite validar prompts, plantillas de chat y flujos de RAG en un portatil Apple antes de migrar a un despliegue en servidor con el modelo completo.
- Investigacion sobre cuantizacion: sirve como referencia reproducible de cuantizacion guiada por medicion, ya que el repositorio publica el histograma de bits, el metodo de calibracion y las perplejidades comparadas contra bf16 y contra 3 bits uniforme.
- Escenarios con datos sensibles o requisitos de privacidad: al ejecutarse integramente en local, no requiere enviar prompts ni documentos a APIs externas, lo que simplifica el cumplimiento de politicas internas de tratamiento de datos.
- Docencia y experimentacion con modelos de gran tamano: permite estudiar comportamiento de un 32B denso en hardware de consumo, siempre que no se dependa de razonamiento aritmetico, donde el modelo muestra un rendimiento degradado segun las mediciones del autor.

## Benchmarks y rendimiento

Todos los datos proceden de la model card del autor. Las perplejidades se calcularon sobre los pesos exactos publicados, desquantizados con `mx.dequantize` y ejecutados en bf16 sobre GPU. MMLU y GSM8K se midieron con lm-eval-harness 0.4.9 sobre subconjuntos reducidos.

Perplejidad (secuencia 512, held-out):

| Modelo | Tamano (GB, pesos) | bpw | WikiText-2 ppl (32.704 tok) | Codigo Python ppl (8.176 tok) |
|---|---|---|---|---|
| Referencia bf16 | no disponible | 16 | 9,7287 | 3,5031 |
| Este repo (leCore Unicron mix) | 18,62 | 4,547 | 11,4757 | 3,9427 |
| MLX 3 bits estandar, grupo 64 | 14,33 | 3,500 | 39,0780 | 7,4644 |

Tareas (subconjuntos, con ruido de muestreo estimado por el autor de +-2 a 4 puntos):

| Modelo | MMLU (5-shot) | GSM8K strict | GSM8K flexible |
|---|---|---|---|
| leCore mix (este repo) | 85,3 % | 27,0 % | 34,0 % |
| MLX 3 bits affine, grupo 64 (simulado) | 80,9 % | 83,0 % | 78,0 % |

Advertencia relevante: los resultados de GSM8K son incoherentes con el resto de la tabla. Un modelo cuantizado a 4,5 bpw no deberia caer de 83,0 % a 27,0 % en GSM8K mientras supera en 4,4 puntos a la cuantizacion de 3 bits en MMLU, y es especialmente llamativo que el 3 bits uniforme obtenga 83,0 % frente a un bf16 que el autor no llega a reportar en esa tarea. El resultado debe tratarse como no verificado y reproducirse con la configuracion completa (plantilla de chat, maximo de tokens, parada) antes de extraer conclusiones. El propio autor advierte que no ejecuto benchmarks de tareas downstream completos y que la perplejidad de contexto corto no describe por si sola la calidad.

## Requisitos de hardware

- VRAM / memoria unificada: los pesos ocupan 18,62 GB. Con cache KV para contexto de 8.192 tokens hay que presupuestar aproximadamente 22-26 GB en total, dependiendo de la longitud efectiva de contexto y del batch.
- Equipos recomendados: Mac con chip Apple Silicon y memoria unificada de 32 GB (limite ajustado), 36 GB o mas (M1/M2/M3/M4 Pro, Max y Ultra). El autor indica que en un Mac de 36 GB puede ser necesario elevar el limite de memoria cableada de la GPU con `sudo sysctl iogpu.wired_limit_mb=30000`.
- GPU NVIDIA: no soportado. El repositorio depende de MLX, que es especifico del ecosistema Apple; no se publican pesos en safetensors estandar de HuggingFace Transformers, GGUF ni cuantizaciones AWQ/GPTQ.
- Opciones de despliegue: `mlx-lm` (comando `mlx_lm.generate`). No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni SGLang.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia en el repositorio.
- Comparacion de huella: este repo (18,62 GB) ocupa unos 4,3 GB mas que la cuantizacion MLX de 3 bits (14,33 GB) y menos de un tercio del modelo bf16 en memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Peso en disco | WikiText-2 ppl | MMLU (subconjunto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| staccs/Qwen3-32B-lecore-19g-mlx | 32,76 B densos | no documentado (ejemplo a 8.192) | 18,62 GB, MLX | 11,4757 | 85,3 % | Apache 2.0 | MLX, Apple Silicon |
| MLX 3 bits estandar de Qwen3-32B | 32,76 B densos | no disponible | 14,33 GB, MLX | 39,0780 | 80,9 % | Apache 2.0 | MLX, Apple Silicon |
| Qwen/Qwen3-32B bf16 | 32,76 B densos | 32.768 nativos (131.072 con YaRN) | aprox. 65 GB, safetensors | 9,7287 | no disponible en la informacion | Apache 2.0 | Transformers, vLLM, TGI |
| Otras cuantizaciones de Qwen3-32B (GGUF, AWQ, GPTQ) | 32,76 B densos | segun modelo base | no disponible | no disponible | no disponible | Apache 2.0 tipicamente | llama.cpp, vLLM, Ollama |

La comparacion se limita a las alternativas con datos medidos en la informacion disponible. No se dispone de cifras propias de Qwen3-30B-A3B ni de otras familias de 30-35B para contrastar.

## Limitaciones y advertencias

- Resultado anomalo en GSM8K: 27,0 % strict frente al 83,0 % de la cuantizacion de 3 bits. Es una inversion que contradice el resto de las metricas y que debe reproducirse antes de dar por valido el modelo en tareas de razonamiento matematico.
- Benchmarks sobre subconjuntos: MMLU se evaluo con 10 preguntas por materia (570 en total) y GSM8K con los primeros 100 problemas de test. El autor estima +-2 a 4 puntos de ruido de muestreo, pero esa horquilla no explica la discrepancia de GSM8K.
- Perplejidad no concluyente: el propio autor advierte que la perplejidad de contexto corto no describe por si sola la calidad y que hay que comprobar las salidas en el caso de uso real.
- Ambito exclusivamente Apple Silicon: al depender de MLX, el modelo no se puede desplegar en GPU NVIDIA ni en servidores x86 convencionales sin una conversion adicional que no se proporciona.
- Idiomas no verificados: el repositorio no documenta evaluaciones por idioma y la ficha de HuggingFace no lista idiomas. El castellano no esta validado especificamente; el rendimiento multilingue se asume del modelo base, no se mide.
- Contexto no documentado: el repositorio no declara la longitud de contexto soportada ni si se aplicaron tecnicas de extension tipo YaRN. El ejemplo usa 8.192 tokens de cache KV.
- Riesgo de alucinacion: es un modelo de 32B denso sin cambios en los pesos mas alla de la cuantizacion, por lo que mantiene el riesgo de alucinacion del Qwen3-32B original, potencialmente agravado por el error introducido en la cuantizacion de 4 bits.
- Sesgos: no hay ninguna evaluacion de sesgos en la informacion disponible. Se heredan los del modelo base, no documentados aqui.
- Produccion: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad. La fecha indicada de creacion es 2026-10-15, posterior a la mayoria de referencias disponibles, lo que refuerza la necesidad de validar el artefacto antes de usarlo.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar tambien los terminos del modelo base Qwen/Qwen3-32B y citar correctamente la autoria original.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/staccs/Qwen3-32B-lecore-19g-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3-32B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-32B/blob/main/LICENSE
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

No se han encontrado enlaces adicionales relevantes en la busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo y se han descartado.
